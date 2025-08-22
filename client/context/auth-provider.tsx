"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { getCurrentUserQueryFn, refreshTokenFn } from "@/lib/api";
import { userType } from "@/types/api.types";
import API from "@/lib/axios-client";
import { useCookies } from "@/hooks/use-cookies";

interface AuthContextProps {
  user?: userType | null;
  setUser: (user: userType | null) => void;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [user, setUser] = useState<userType | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { getCookie, setCookie, removeCookie, isClient } = useCookies();

  // Initialize auth state after hydration
  useEffect(() => {
    if (isClient) {
      setIsInitialized(true);
    }
  }, [isClient]);

  // Initialize user state from cookies if available
  useEffect(() => {
    if (isInitialized && !user) {
      const token = getCookie("accessToken");
      if (!token) {
        setUser(null);
      }
    }
  }, [isInitialized, user, getCookie]);

  // Handle initial loading state
  useEffect(() => {
    if (isInitialized && !getCookie("accessToken")) {
      // If no token, we're not loading
      setUser(null);
    }
  }, [isInitialized, getCookie]);

  // Query: get current user from backend
  const { data, isSuccess, error, isLoading, refetch } = useQuery<{
    message: string;
    user: userType;
  }>({
    queryKey: ["currentUser"],
    queryFn: getCurrentUserQueryFn,
    enabled: !!getCookie("accessToken") && isClient && isInitialized, // only fetch if logged in, client-side, and initialized
    retry: (failureCount, error: any) => {
      // Don't retry if it's an authentication error (let the interceptor handle it)
      if (error?.status === 401 || error?.errorCode === "ACCESS_UNAUTHORIZED") {
        return false;
      }
      // Retry other errors up to 3 times
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Handle initial error state
  useEffect(() => {
    if (isInitialized && error && !user) {
      // If error and no user, set user to null
      setUser(null);
    }
  }, [isInitialized, error, user]);

  // Handle initial data state
  useEffect(() => {
    if (isInitialized && data && !user) {
      // If there's data and no user, set user
      if (data.user) {
        setUser(data.user);
      }
    }
  }, [isInitialized, data, user]);

  // Manual refresh function
  const refreshAuth = async () => {
    try {
      const { accessToken } = await refreshTokenFn();
      setCookie("accessToken", accessToken, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      // Refetch user data with new token
      await refetch();
    } catch (error) {
      console.error("Manual refresh failed:", error);
      logout();
    }
  };

  // Sync state when query resolves
  useEffect(() => {
    // Only update state after initialization to prevent hydration mismatches
    if (!isInitialized) return;

    if (isSuccess && data?.user) {
      setUser(data.user);
    } else if (error) {
      console.log("❌ Error occurred:", error);
      // If it's an auth error, try to refresh
      const errorObj = error as any; // Type assertion for error properties
      if (
        errorObj?.status === 401 ||
        errorObj?.errorCode === "ACCESS_UNAUTHORIZED"
      ) {
        console.log("Auth error detected, attempting refresh...");
        refreshAuth();
      } else {
        setUser(null);
      }
    } else if (isSuccess && !data?.user) {
      console.log("No user data found in response");
      setUser(null);
    }
  }, [data, error, isSuccess, isInitialized, user]);

  // Logout function
  const logout = async () => {
    try {
      await API.post("/auth/logout-all"); // backend clears refresh tokens
    } catch (e) {
      console.error("Logout failed:", e);
    } finally {
      removeCookie("accessToken");
      removeCookie("refreshToken"); // Also clear refresh token
      setUser(null);
      queryClient.clear(); // clear all react-query cache
      router.push("/auth/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout,
        refreshAuth,
        isLoading: isLoading || !isInitialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};
