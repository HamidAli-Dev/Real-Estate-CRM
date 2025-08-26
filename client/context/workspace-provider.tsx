"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { getUserWorkspacesQueryFn, getWorkspaceByIdQueryFn } from "@/lib/api";
import { userWorkspaceType, workspaceType } from "@/types/api.types";
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
  });

  // Set current workspace when data changes
  useEffect(() => {
    if (currentWorkspaceData) {
      setCurrentWorkspace(currentWorkspaceData);
    } else if (!workspaceId) {
      // Clear current workspace if no workspaceId in URL
      setCurrentWorkspace(null);
    }
  }, [currentWorkspaceData, workspaceId]);

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
    router.push(`/dashboard?workspaceId=${workspaceId}`);
    // Clear current workspace data to force refetch
    queryClient.removeQueries({ queryKey: ["workspace", workspaceId] });
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
