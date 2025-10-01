import { useQuery } from "@tanstack/react-query";
import { useLeads } from "./use-leads";
import { usePipelineStages } from "./use-pipeline";

export interface LeadFunnelData {
  stage: string;
  count: number;
  percentage: number;
  color: string;
}

export const useLeadFunnel = (workspaceId: string) => {
  const { data: leads = [], isLoading: leadsLoading } = useLeads(workspaceId);
  const { data: stages = [], isLoading: stagesLoading } =
    usePipelineStages(workspaceId);

  const funnelData = useQuery({
    queryKey: ["lead-funnel", workspaceId],
    queryFn: async (): Promise<LeadFunnelData[]> => {
      if (stages.length === 0 || leads.length === 0) {
        return [];
      }

      const sortedStages = [...stages].sort(
        (a, b) => (a?.order || 0) - (b?.order || 0)
      );

      const stageData = sortedStages.map((stage, index) => {
        const stageLeads = leads.filter(
          (lead) => lead.pipelineStageId === stage.id
        );
        const count = stageLeads.length;

        const maxLeadsInAnyStage = Math.max(
          ...sortedStages.map(
            (s) => leads.filter((lead) => lead.pipelineStageId === s.id).length
          )
        );
        const percentage =
          maxLeadsInAnyStage > 0
            ? Math.round((count / maxLeadsInAnyStage) * 100)
            : 0;

        const colors = [
          "#3B82F6", // Blue
          "#10B981", // Green
          "#F59E0B", // Yellow
          "#EF4444", // Red
          "#8B5CF6", // Purple
          "#06B6D4", // Cyan
        ];

        return {
          stage: stage.name,
          count,
          percentage,
          color: colors[index % colors.length],
        };
      });

      return stageData;
    },
    enabled: !!workspaceId && !leadsLoading && !stagesLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });

  return {
    data: funnelData.data || [],
    isLoading: funnelData.isLoading || leadsLoading || stagesLoading,
    isError: funnelData.isError,
    error: funnelData.error,
  };
};
