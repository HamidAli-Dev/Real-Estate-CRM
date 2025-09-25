"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { usePermission } from "./usePermission";
import { useAuthContext } from "@/context/auth-provider";
import { useWorkspaceContext } from "@/context/workspace-provider";

export const useDashboardAccess = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { currentWorkspace } = useWorkspaceContext();
  const { isOwner, isLoading: permissionsLoading } = usePermission();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for all required data to be loaded
    if (!user || !currentWorkspace || permissionsLoading) {
      return;
    }

    const userIsOwner = isOwner();

    const currentPath = window.location.pathname;

    // Redirect logic based on role and current path
    if (userIsOwner) {
      if (currentPath.includes("/user-dashboard")) {
        router.replace("/dashboard");
        return;
      }
    } else {
      // Non-owner should not access main dashboard
      if (currentPath === "/dashboard") {
        router.replace("/dashboard/user-dashboard");
        return;
      }
    }

    setIsLoading(false);
  }, [user, currentWorkspace, permissionsLoading, isOwner, router]);

  return { isLoading };
};
