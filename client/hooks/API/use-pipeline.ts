import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  PipelineStage,
  CreatePipelineStageData,
  UpdatePipelineStageData,
} from "../../types/api.types";
import API from "@/lib/axios-client";

export const usePipelineStages = (workspaceId: string) => {
  return useQuery({
    queryKey: ["pipeline-stages", workspaceId],
    queryFn: async (): Promise<PipelineStage[]> => {
      try {
        const response = await API.get(`/pipeline/${workspaceId}/stages`);

        // Since axios interceptor returns res.data, response is the actual data
        // API response structure: { success: true, data: [...] }
        if (
          response &&
          typeof response === "object" &&
          "success" in response &&
          response.success &&
          "data" in response &&
          Array.isArray(response.data)
        ) {
          return response.data;
        }

        console.warn(
          "⚠️ Unexpected pipeline stages response format:",
          response
        );
        return [];
      } catch (error) {
        console.error("❌ Error fetching pipeline stages:", error);
        return [];
      }
    },
    enabled: !!workspaceId,
    retry: 2,
    retryDelay: 1000,
  });
};

export const useCreatePipelineStage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workspaceId,
      data,
    }: {
      workspaceId: string;
      data: CreatePipelineStageData;
    }): Promise<PipelineStage> => {
      const response = await API.post(`/pipeline/${workspaceId}/stages`, data);
      return response.data.data;
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({
        queryKey: ["pipeline-stages", workspaceId],
      });
    },
  });
};

export const useUpdatePipelineStage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workspaceId,
      stageId,
      data,
    }: {
      workspaceId: string;
      stageId: string;
      data: UpdatePipelineStageData;
    }): Promise<PipelineStage> => {
      const response = await API.put(
        `/pipeline/${workspaceId}/stages/${stageId}`,
        data
      );
      return response.data.data;
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({
        queryKey: ["pipeline-stages", workspaceId],
      });
    },
  });
};

export const useDeletePipelineStage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workspaceId,
      stageId,
    }: {
      workspaceId: string;
      stageId: string;
    }): Promise<void> => {
      try {
        await API.delete(`/pipeline/${workspaceId}/stages/${stageId}`);
      } catch (error: any) {
        // Re-throw with better error handling
        if (
          error?.response?.status === 401 &&
          error?.response?.data?.message?.includes("existing leads")
        ) {
          const customError = new Error(
            "Cannot delete stage with existing leads or deals"
          );
          customError.name = "StageHasLeadsError";
          throw customError;
        }
        throw error;
      }
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({
        queryKey: ["pipeline-stages", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["leads", workspaceId],
      });
    },
    onError: (error: any) => {
      console.error("Failed to delete pipeline stage:", error);
    },
  });
};

export const useReorderPipelineStages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workspaceId,
      stageOrders,
    }: {
      workspaceId: string;
      stageOrders: { id: string; order: number }[];
    }): Promise<PipelineStage[]> => {
      const response = await API.patch(
        `/pipeline/${workspaceId}/stages/reorder`,
        {
          stageOrders,
        }
      );
      return response.data.data;
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({
        queryKey: ["pipeline-stages", workspaceId],
      });
    },
  });
};
