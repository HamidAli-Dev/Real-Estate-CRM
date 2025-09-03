import { useQuery } from "@tanstack/react-query";
import API from "@/lib/axios-client";

export interface WorkspaceUser {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  role: string;
  permissions: Array<{
    id: string;
    permission: string;
  }>;
}

export const useWorkspaceUsers = (workspaceId: string) => {
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
      } catch (error) {
        console.error("❌ Error fetching workspace users:", error);
        return [];
      }
    },
    enabled: !!workspaceId,
    retry: 2,
    retryDelay: 1000,
  });
};
