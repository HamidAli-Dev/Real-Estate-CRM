import { useMutation } from "@tanstack/react-query";
import { refreshTokenFn } from "@/lib/api";

export const useRefreshToken = () => {
  const mutation = useMutation({
    mutationFn: refreshTokenFn,
    onSuccess: (data) => {
      // Token is automatically set as cookie by the backend
      console.log("Token refreshed successfully:", data.message);
    },
    onError: (error) => {
      console.error("Token refresh failed:", error);
    },
  });

  const refreshToken = () => {
    return mutation.mutate();
  };

  return {
    refreshToken,
    isRefreshing: mutation.isPending,
    error: mutation.error,
  };
};
