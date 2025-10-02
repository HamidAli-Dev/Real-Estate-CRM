import { useQuery } from "@tanstack/react-query";
import API from "@/lib/axios-client";

export interface WorkspaceUser {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  role: {
    id: string;
    name: string;
    isSystem: boolean;
    workspaceId: string;
    createdAt: string;
    updatedAt: string;
    rolePermissions: Array<{
      id: string;
      permission: {
        id: string;
        name: string;
        group?: string;
      };
    }>;
  };
  permissions: Array<{
    id: string;
    permission: string;
  }>;
}

export const useWorkspaceUsers = (
  workspaceId: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["workspace-users", workspaceId],
    queryFn: async (): Promise<WorkspaceUser[]> => {
      try {
        const response = await API.get(`/workspace/${workspaceId}/users`);

        // Check if response.data is directly an array (users)
        if (response.data && Array.isArray(response.data)) {
          return response.data;
        }

        // Check if response.data.data is an array (nested structure)
        if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          return response.data.data;
        }

        console.warn(
          "⚠️ Unexpected workspace users response format:",
          response.data
        );
        return [];
      } catch (error: any) {
        // Handle permission errors gracefully
        if (
          error?.data?.errorCode === "VALIDATION_ERROR" &&
          error?.data?.message?.includes("Required permission")
        ) {
          console.log("Permission denied for VIEW_USERS");
          // Return empty array instead of throwing error when permission is denied
          return [];
        }
        console.error("❌ Error fetching workspace users:", error);
        return [];
      }
    },
    enabled: !!workspaceId && (options?.enabled ?? true),
    retry: 2,
    retryDelay: 1000,
  });
};
