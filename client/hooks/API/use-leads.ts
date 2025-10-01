import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Lead, CreateLeadData, UpdateLeadData } from "../../types/api.types";
import API from "@/lib/axios-client";

export const useLeads = (
  workspaceId: string,
  options?: {
    search?: string;
    stageId?: string;
    assignedToId?: string;
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: [
      "leads",
      workspaceId,
      options?.search || "",
      options?.stageId || "all",
      options?.assignedToId || "all",
    ],
    queryFn: async (): Promise<Lead[]> => {
      try {
        const response = await API.get(`/leads/${workspaceId}`, {
          params: {
            search: options?.search || undefined,
            stageId: options?.stageId || undefined,
            assignedToId: options?.assignedToId || undefined,
          },
        });

        // Check if response.data is directly an array (leads)
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

        console.warn("⚠️ Unexpected leads response format:", response.data);
        return [];
      } catch (error: any) {
        if (
          error?.data?.errorCode === "VALIDATION_ERROR" &&
          error?.data?.message?.includes("Required permission")
        ) {
          throw error;
        }
        console.error("❌ Error fetching leads:", error);
        return [];
      }
    },
    enabled: !!workspaceId && (options?.enabled ?? true),
    retry: 2,
    retryDelay: 1000,
  });
};

export const useLeadsByStage = (workspaceId: string, stageId: string) => {
  return useQuery({
    queryKey: ["leads", workspaceId, "stage", stageId],
    queryFn: async (): Promise<Lead[]> => {
      try {
        const response = await API.get(
          `/leads/${workspaceId}/stage/${stageId}`
        );

        // Check if response.data is directly an array (leads)
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
          "⚠️ Unexpected leads by stage response format:",
          response.data
        );
        return [];
      } catch (error) {
        console.error("❌ Error fetching leads by stage:", error);
        return [];
      }
    },
    enabled: !!workspaceId && !!stageId,
    retry: 2,
    retryDelay: 1000,
  });
};

export const useLead = (workspaceId: string, leadId: string, options?: any) => {
  return useQuery({
    queryKey: ["lead", workspaceId, leadId],
    queryFn: async (): Promise<Lead> => {
      try {
        const response = await API.get(`/leads/${workspaceId}/lead/${leadId}`);

        // Check if response.data is directly the lead object
        if (response.data && response.data.id) {
          return response.data;
        }

        // Check if response.data.data is the lead object (nested structure)
        if (response.data && response.data.data && response.data.data.id) {
          return response.data.data;
        }

        throw new Error("Lead not found");
      } catch (error) {
        console.error("❌ Error fetching lead:", error);
        throw error;
      }
    },
    enabled: !!workspaceId && !!leadId,
    retry: 2,
    retryDelay: 1000,
    ...options,
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workspaceId,
      data,
    }: {
      workspaceId: string;
      data: CreateLeadData;
    }): Promise<Lead> => {
      const response = await API.post(`/leads/${workspaceId}`, data);

      // Check if response.data is directly the lead object
      if (response.data && response.data.id) {
        return response.data;
      }

      // Check if response.data.data is the lead object (nested structure)
      if (response.data && response.data.data && response.data.data.id) {
        return response.data.data;
      }

      throw new Error("Invalid response format");
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ["leads", workspaceId] });
      queryClient.invalidateQueries({
        queryKey: ["pipeline-stages", workspaceId],
      });
      // Invalidate dashboard metrics
      queryClient.invalidateQueries({
        queryKey: ["dashboard-metrics", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["team-performance", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["pipeline-performance", workspaceId],
      });
      queryClient.invalidateQueries({ queryKey: ["lead-funnel", workspaceId] });

      // Force refetch to ensure immediate update
      queryClient.refetchQueries({ queryKey: ["leads", workspaceId] });
    },
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workspaceId,
      leadId,
      data,
    }: {
      workspaceId: string;
      leadId: string;
      data: UpdateLeadData;
    }): Promise<Lead> => {
      const response = await API.put(
        `/leads/${workspaceId}/lead/${leadId}`,
        data
      );

      // Check if response.data is directly the lead object
      if (response.data && response.data.id) {
        return response.data;
      }

      // Check if response.data.data is the lead object (nested structure)
      if (response.data && response.data.data && response.data.data.id) {
        return response.data.data;
      }

      throw new Error("Invalid response format");
    },
    onSuccess: (_, { workspaceId, leadId }) => {
      queryClient.invalidateQueries({ queryKey: ["leads", workspaceId] });
      queryClient.invalidateQueries({
        queryKey: ["lead", workspaceId, leadId],
      });
      queryClient.invalidateQueries({
        queryKey: ["pipeline-stages", workspaceId],
      });
      // Invalidate dashboard metrics
      queryClient.invalidateQueries({
        queryKey: ["dashboard-metrics", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["team-performance", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["pipeline-performance", workspaceId],
      });
      queryClient.invalidateQueries({ queryKey: ["lead-funnel", workspaceId] });
    },
  });
};

export const useUpdateLeadStage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workspaceId,
      leadId,
      pipelineStageId,
    }: {
      workspaceId: string;
      leadId: string;
      pipelineStageId: string;
    }): Promise<Lead> => {
      const response = await API.patch(
        `/leads/${workspaceId}/lead/${leadId}/stage`,
        {
          pipelineStageId,
        }
      );

      // Check if response.data is directly the lead object
      if (response.data && response.data.id) {
        return response.data;
      }

      // Check if response.data.data is the lead object (nested structure)
      if (response.data && response.data.data && response.data.data.id) {
        return response.data.data;
      }

      throw new Error("Invalid response format");
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ["leads", workspaceId] });
      queryClient.invalidateQueries({
        queryKey: ["pipeline-stages", workspaceId],
      });
      // Invalidate dashboard metrics
      queryClient.invalidateQueries({
        queryKey: ["dashboard-metrics", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["team-performance", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["pipeline-performance", workspaceId],
      });
      queryClient.invalidateQueries({ queryKey: ["lead-funnel", workspaceId] });
    },
  });
};

export const useUpdateLeadPosition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workspaceId,
      leadId,
      newPosition,
      oldPosition,
    }: {
      workspaceId: string;
      leadId: string;
      newPosition: number;
      oldPosition: number;
    }): Promise<void> => {
      await API.patch(`/leads/${workspaceId}/lead/${leadId}/position`, {
        newPosition,
        oldPosition,
      });
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ["leads", workspaceId] });
      queryClient.invalidateQueries({
        queryKey: ["pipeline-stages", workspaceId],
      });
      // Invalidate dashboard metrics
      queryClient.invalidateQueries({
        queryKey: ["dashboard-metrics", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["team-performance", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["pipeline-performance", workspaceId],
      });
      queryClient.invalidateQueries({ queryKey: ["lead-funnel", workspaceId] });
    },
  });
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workspaceId,
      leadId,
    }: {
      workspaceId: string;
      leadId: string;
    }): Promise<void> => {
      await API.delete(`/leads/${workspaceId}/lead/${leadId}`);
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ["leads", workspaceId] });
      queryClient.invalidateQueries({
        queryKey: ["pipeline-stages", workspaceId],
      });
      // Invalidate dashboard metrics
      queryClient.invalidateQueries({
        queryKey: ["dashboard-metrics", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["team-performance", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["pipeline-performance", workspaceId],
      });
      queryClient.invalidateQueries({ queryKey: ["lead-funnel", workspaceId] });
    },
  });
};
