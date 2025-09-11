"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { getUserWorkspacesQueryFn, getWorkspaceByIdQueryFn } from "@/lib/api";
import { userWorkspaceType } from "@/types/api.types";
import { useAuthContext } from "./auth-provider";

interface WorkspaceContextProps {
  currentWorkspace: userWorkspaceType | null;
  userWorkspaces: userWorkspaceType[];
  switchWorkspace: (workspaceId: string) => void;
  isLoading: boolean;
  isError: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextProps | undefined>(
  undefined
);

export const WorkspaceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentWorkspace, setCurrentWorkspace] =
    useState<userWorkspaceType | null>(null);
  const { user, isLoading: authLoading } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  // Get workspaceId from URL params
  const workspaceId = searchParams.get("workspaceId");

  // Query: get user's workspaces
  const {
    data: workspacesData,
    isLoading: workspacesLoading,
    isError: workspacesError,
  } = useQuery({
    queryKey: ["userWorkspaces"],
    queryFn: getUserWorkspacesQueryFn,
    enabled: !!user && !authLoading, // Only fetch when user is available and auth is not loading
  });

  // Query: get current workspace details
  const {
    data: currentWorkspaceData,
    isLoading: currentWorkspaceLoading,
    isError: currentWorkspaceError,
  } = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => getWorkspaceByIdQueryFn(workspaceId!),
    enabled: !!workspaceId && !!user && !authLoading,
    retry: false, // Don't retry if workspace not found
  });

  // Set current workspace when data changes
  useEffect(() => {
    if (currentWorkspaceData) {
      setCurrentWorkspace(currentWorkspaceData);
    } else if (!workspaceId) {
      // Clear current workspace if no workspaceId in URL

      setCurrentWorkspace(null);
    } else if (currentWorkspaceError) {
      console.warn("⚠️ Workspace error:", currentWorkspaceError);

      if (workspacesData && workspacesData.length > 0) {
        // If current workspace not found but user has other workspaces, redirect to first one
        console.warn(
          "⚠️ Workspace not found, redirecting to first available workspace"
        );
        const firstWorkspace = workspacesData[0];
        router.replace(
          `${pathname}?workspaceId=${firstWorkspace.workspace.id}`
        );
      } else {
        console.warn("⚠️ No workspaces available");
        setCurrentWorkspace(null);
      }
    }
  }, [
    currentWorkspaceData,
    workspaceId,
    currentWorkspaceError,
    workspacesData,
    router,
    pathname,
  ]);

  // Handle workspace selection logic
  useEffect(() => {
    if (
      user &&
      !authLoading &&
      workspacesData !== undefined && // Check if data has been fetched
      workspacesData.length > 0 &&
      !workspaceId &&
      pathname === "/dashboard"
    ) {
      // User has workspaces but no workspaceId in URL, select the first one
      const firstWorkspace = workspacesData[0];
      router.replace(`/dashboard?workspaceId=${firstWorkspace.workspace.id}`);
    }
  }, [user, authLoading, workspacesData, workspaceId, pathname, router]);

  // Reset when user changes
  useEffect(() => {
    if (!user) {
      setCurrentWorkspace(null);
    }
  }, [user]);

  // Switch workspace function
  const switchWorkspace = (workspaceId: string) => {
    // Update URL with new workspace ID while preserving current path
    const newUrl = `${pathname}?workspaceId=${workspaceId}`;
    router.push(newUrl);

    // Clear all workspace-related queries to force refetch
    queryClient.removeQueries({ queryKey: ["workspace"] });
    queryClient.removeQueries({ queryKey: ["workspaceUsers"] });
    queryClient.removeQueries({ queryKey: ["workspaceRoles"] });
    queryClient.removeQueries({ queryKey: ["permissions"] });

    // Invalidate specific workspace queries
    queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
    queryClient.invalidateQueries({
      queryKey: ["workspaceUsers", workspaceId],
    });
    queryClient.invalidateQueries({
      queryKey: ["workspaceRoles", workspaceId],
    });

    // Clear current workspace state immediately
    setCurrentWorkspace(null);
  };

  const isLoading = workspacesLoading || currentWorkspaceLoading || authLoading;
  const isError = workspacesError || currentWorkspaceError;

  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspace,
        userWorkspaces: workspacesData || [],
        switchWorkspace,
        isLoading,
        isError,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspaceContext = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error(
      "useWorkspaceContext must be used within WorkspaceProvider"
    );
  }
  return context;
};
