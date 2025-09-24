"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { tokenStorage } from "@/lib/axios-client";

const AuthRouteProtection = () => {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = () => {
      if (tokenStorage.hasTokens()) {
        // Redirect to dashboard if user is already logged in
        router.replace("/dashboard");
      } else {
        // If not authenticated, we can stay on the auth page
        setIsChecking(false);
      }
    };

    // Run the check
    checkAuth();
  }, [router]);

  // Render nothing while checking
  if (isChecking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cprimary border-t-transparent" />
      </div>
    );
  }

  return null;
};

export default AuthRouteProtection;
