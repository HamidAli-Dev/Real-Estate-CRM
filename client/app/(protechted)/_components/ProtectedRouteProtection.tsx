"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { tokenStorage } from "@/lib/axios-client";

const ProtectedRouteProtection = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is not authenticated
    const checkAuth = () => {
      if (!tokenStorage.hasTokens()) {
        // Redirect to login if user is not authenticated
        const loginUrl = `/auth/login?redirect=${encodeURIComponent(pathname)}`;
        router.push(loginUrl);
      } else {
        // If authenticated, we can stay on the protected page
        setIsChecking(false);
      }
    };

    // Run the check
    checkAuth();
  }, [router, pathname]);

  // Render nothing while checking
  if (isChecking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cprimary border-t-transparent"></div>
      </div>
    );
  }

  return null;
};

export default ProtectedRouteProtection;
