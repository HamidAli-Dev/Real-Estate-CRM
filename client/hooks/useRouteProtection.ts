import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { tokenStorage } from "@/lib/axios-client";
import { isAuthRoute } from "@/lib/utils";

export const useRouteProtection = (isProtectedRouteParam: boolean = false) => {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isAuthenticated = tokenStorage.hasTokens();
    const currentPath = window.location.pathname;

    if (isAuthenticated && isAuthRoute(currentPath)) {
      router.replace("/dashboard");
      return;
    }

    if (isProtectedRouteParam && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }
  }, [isProtectedRouteParam, router]);
};
