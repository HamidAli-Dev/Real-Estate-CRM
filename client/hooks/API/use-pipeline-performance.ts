import { useQuery } from "@tanstack/react-query";
import { useLeads } from "./use-leads";
import { usePipelineStages } from "./use-pipeline";

export interface PipelinePerformanceMetrics {
  activeDeals: number;
  conversionRate: number;
  averageDealSize: number;
  salesCycle: number;
  activeDealsChange: string;
  conversionRateChange: string;
  averageDealSizeChange: string;
  salesCycleChange: string;
}

export const usePipelinePerformance = (workspaceId: string) => {
  const { data: leads = [], isLoading: leadsLoading } = useLeads(workspaceId);
  const { data: stages = [], isLoading: stagesLoading } =
    usePipelineStages(workspaceId);

  const metrics = useQuery({
    queryKey: ["pipeline-performance", workspaceId],
    queryFn: async (): Promise<PipelinePerformanceMetrics> => {
      const activeDeals = leads.length;

      const finalStages = stages.slice(-2); // Last 2 stages
      const finalStageIds = finalStages.map((stage) => stage.id);
      const convertedLeads = leads.filter((lead) =>
        finalStageIds.includes(lead.pipelineStageId)
      );
      const conversionRate =
        activeDeals > 0
          ? Math.round((convertedLeads.length / activeDeals) * 100 * 10) / 10
          : 0;

      const leadsWithBudget = leads.filter(
        (lead) => lead.budget && lead.budget > 0
      );
      const totalBudget = leadsWithBudget.reduce(
        (sum, lead) => sum + (lead.budget || 0),
        0
      );
      const averageDealSize =
        leadsWithBudget.length > 0
          ? Math.round(totalBudget / leadsWithBudget.length)
          : 0;

      const now = new Date();
      const salesCycleDays =
        leads.length > 0
          ? leads.reduce((total, lead) => {
              const createdDate = new Date(lead.createdAt);
              const daysDiff = Math.floor(
                (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
              );
              return total + daysDiff;
            }, 0) / leads.length
          : 0;
      const salesCycle = Math.round(salesCycleDays);

      const activeDealsChange = "+12%";
      const conversionRateChange = "+2.1%";
      const averageDealSizeChange = "+8%";
      const salesCycleChange = "-3 days";

      return {
        activeDeals,
        conversionRate,
        averageDealSize,
        salesCycle,
        activeDealsChange,
        conversionRateChange,
        averageDealSizeChange,
        salesCycleChange,
      };
    },
    enabled: !!workspaceId && !leadsLoading && !stagesLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });

  return {
    data: metrics.data,
    isLoading: metrics.isLoading || leadsLoading || stagesLoading,
    isError: metrics.isError,
    error: metrics.error,
  };
};
