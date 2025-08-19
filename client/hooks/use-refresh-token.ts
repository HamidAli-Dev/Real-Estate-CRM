import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { refreshTokenFn } from "@/lib/api";

export const useRefreshToken = () => {
  const mutation = useMutation({
    mutationFn: refreshTokenFn,
    onSuccess: (data) => {
      // Update the access token in cookies
      Cookies.set("accessToken", data.accessToken, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    },
    onError: (error) => {
      // If refresh fails, clear all tokens
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      console.error("Token refresh failed:", error);
    },
  });

  const refreshToken = () => {
    const refreshToken = Cookies.get("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }
    return mutation.mutate();
  };

  return {
    refreshToken,
    isRefreshing: mutation.isPending,
    error: mutation.error,
  };
};

