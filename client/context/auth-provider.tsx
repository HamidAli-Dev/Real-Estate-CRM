"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";

import { getCurrentUserQueryFn, refreshTokenFn } from "@/lib/api";
import { getCurrentUserResponseType, userType } from "@/types/api.types";
import API, { tokenStorage } from "@/lib/axios-client";
import { MandatoryPasswordChangeModal } from "@/components/forms/MandatoryPasswordChangeModal";
import { isProtectedRoute } from "@/lib/utils";

interface AuthContextProps {
  user?: getCurrentUserResponseType | null;
  setUser: (user: getCurrentUserResponseType | null) => void;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const [user, setUser] = useState<getCurrentUserResponseType | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);

  // Initialize auth state after hydration and check localStorage
  useEffect(() => {
    setIsInitialized(true);

    // Check if we have tokens in localStorage but no user data
    if (tokenStorage.hasTokens()) {
      console.log("🔑 Found tokens in localStorage, will fetch user data");
    } else {
      console.log("❌ No tokens found in localStorage");
      // If we're on a protected route and have no tokens, redirect to login
      if (isProtectedRoute(pathname)) {
        console.log("🚑 Redirecting to login from protected route");
        router.push("/auth/login");
      }
    }
  }, [pathname, router]);

  // Check if we should fetch user data
  const shouldFetchUser =
    isInitialized &&
    tokenStorage.hasTokens() && // Only fetch if we have tokens
    (isProtectedRoute(pathname) || !queryClient.getQueryData(["currentUser"])); // Fetch for protected routes or if no cached data

  // Query: get current user from backend
  const { data, isSuccess, error, isLoading, refetch } =
    useQuery<getCurrentUserResponseType>({
      queryKey: ["currentUser"],
      queryFn: getCurrentUserQueryFn,
      enabled: shouldFetchUser, // Only fetch when needed
      retry: (failureCount, error: any) => {
        // Don't retry if it's an authentication error (let the interceptor handle it)
        const customError = error as any;
        if (
          customError?.status === 401 ||
          customError?.errorCode === "ACCESS_UNAUTHORIZED"
        ) {
          return false;
        }
        // Retry other errors up to 3 times
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

  // Handle authentication errors and token cleanup
  useEffect(() => {
    if (isInitialized && error && !user) {
      // Check if it's an authentication error
      const customError = error as any; // Type assertion for custom error properties
      if (
        customError?.status === 401 ||
        customError?.errorCode === "ACCESS_UNAUTHORIZED"
      ) {
        console.log("🚑 Authentication error, clearing tokens and redirecting");
        tokenStorage.removeTokens();

        // Redirect to login if on protected route
        if (isProtectedRoute(pathname)) {
          router.push("/auth/login");
        }
      }

      setUser(null);
    }
  }, [isInitialized, error, user, pathname, router]);

  // Handle successful authentication
  useEffect(() => {
    if (isInitialized && data && !user) {
      // If there's data and no user, set user
      if (data.user) {
        setUser(data);
        console.log("✅ User authenticated successfully");

        // Redirect authenticated users away from auth pages
        if (pathname.startsWith("/auth/")) {
          router.replace("/dashboard");
        }
      }
    }
  }, [isInitialized, data, user, pathname, router]);

  // Show password change modal if user must update password
  useEffect(() => {
    console.log("🔍 Auth Provider - User data:", user);
    console.log("🔍 Auth Provider - mustUpdatePassword:", user?.user);

    if (user && user.user.mustUpdatePassword) {
      console.log("✅ Showing password change modal");
      setShowPasswordChangeModal(true);
    } else {
      console.log("❌ Hiding password change modal");
      setShowPasswordChangeModal(false);
    }
  }, [user]);

  // Manual refresh function
  const refreshAuth = async () => {
    try {
      await refreshTokenFn();
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
      setUser(data);
      // Reset the refresh failure flag when auth succeeds
      if (typeof window !== "undefined") {
        (window as any).__resetRefreshFlag?.();
      }
    } else if (error) {
      console.log("❌ Error occurred:", error);
      // Don't try to refresh here - let the axios interceptor handle it
      setUser(null);
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
      // Clear tokens from localStorage
      tokenStorage.removeTokens();

      setUser(null);
      queryClient.clear(); // clear all react-query cache
      router.push("/auth/login");
    }
  };

  // Handle password change completion
  const handlePasswordChanged = async () => {
    // Refresh user data to get updated mustUpdatePassword status
    await refetch();
    setShowPasswordChangeModal(false);
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

      {/* Mandatory Password Change Modal */}
      <MandatoryPasswordChangeModal
        open={showPasswordChangeModal}
        onPasswordChanged={handlePasswordChanged}
      />
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
