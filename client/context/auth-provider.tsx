"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

import { getCurrentUserQueryFn } from "@/lib/api";
import { userType } from "@/types/api.types";
import API from "@/lib/axios-client";

interface AuthContextProps {
  user?: userType | null;
  setUser: (user: userType | null) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<userType | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  // Query: get current user from backend
  const { data, isSuccess, error, isLoading } = useQuery<{
    message: string;
    user: userType;
  }>({
    queryKey: ["currentUser"],
    queryFn: getCurrentUserQueryFn,
    enabled: !!Cookies.get("accessToken"), // only fetch if logged in
    retry: false, // avoid infinite loop if token is invalid
  });

  // Sync state when query resolves
  useEffect(() => {
    if (isSuccess && data?.user) {
      setUser(data.user);
    } else if (error) {
      console.log("Error occurred:", error);
      setUser(null);
    } else if (isSuccess && !data?.user) {
      console.log("No user data found in response");
      setUser(null);
    }
  }, [data, error, isSuccess]);

  // Logout function
  const logout = async () => {
    try {
      await API.post("/auth/logout-all"); // backend clears refresh tokens
    } catch (e) {
      console.error("Logout failed:", e);
    } finally {
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken"); // Also clear refresh token
      setUser(null);
      queryClient.clear(); // clear all react-query cache
      router.push("/auth/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, isLoading }}>
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
