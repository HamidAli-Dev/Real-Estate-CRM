"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";

import { getCurrentUserQueryFn, refreshTokenFn } from "@/lib/api";
import { userType } from "@/types/api.types";
import API from "@/lib/axios-client";
import { MandatoryPasswordChangeModal } from "@/components/forms/MandatoryPasswordChangeModal";

interface AuthContextProps {
  user?: userType | null;
  setUser: (user: userType | null) => void;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Helper function to check if current route is protected
const isProtectedRoute = (pathname: string) => {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/workspace") ||
    pathname.startsWith("/properties") ||
    pathname.startsWith("/analytics")
  );
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const [user, setUser] = useState<userType | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);

  // Initialize auth state after hydration
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Check if we should fetch user data
  const shouldFetchUser =
    isInitialized &&
    isProtectedRoute(pathname) &&
    !queryClient.getQueryData(["currentUser"]); // Don't fetch if we already have the data

  // Query: get current user from backend
  const { data, isSuccess, error, isLoading, refetch } = useQuery<{
    message: string;
    user: userType;
  }>({
    queryKey: ["currentUser"],
    queryFn: getCurrentUserQueryFn,
    enabled: shouldFetchUser, // Only fetch when needed
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

  // Show password change modal if user must update password
  useEffect(() => {
    console.log("🔍 Auth Provider - User data:", user);
    console.log(
      "🔍 Auth Provider - mustUpdatePassword:",
      user?.mustUpdatePassword
    );

    if (user && user.mustUpdatePassword) {
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
      setUser(data.user);
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
      await API.post("/auth/logout-all"); // backend clears refresh tokens and cookies
    } catch (e) {
      console.error("Logout failed:", e);
    } finally {
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
