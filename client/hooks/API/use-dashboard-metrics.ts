import { useQuery } from "@tanstack/react-query";
import { useLeads } from "./use-leads";
import { useProperties } from "./use-properties";
import { useWorkspaceUsers } from "./use-workspace-users";

export interface DashboardMetrics {
  totalProperties: number;
  activeLeads: number;
  monthlyRevenue: number;
  teamMembers: number;
  propertiesChange: string;
  leadsChange: string;
  revenueChange: string;
  teamChange: string;
}

export const useDashboardMetrics = (workspaceId: string) => {
  const { data: leads = [], isLoading: leadsLoading } = useLeads(workspaceId);
  const { data: properties = [], isLoading: propertiesLoading } =
    useProperties(workspaceId);
  const { data: workspaceUsers = [], isLoading: usersLoading } =
    useWorkspaceUsers(workspaceId);

  const metrics = useQuery({
    queryKey: ["dashboard-metrics", workspaceId],
    queryFn: async (): Promise<DashboardMetrics> => {
      const totalProperties = properties.length;

      const activeLeads = leads.length;

      const monthlyRevenue = leads.reduce((total, lead) => {
        return total + (lead.budget || 0);
      }, 0);

      const teamMembers = workspaceUsers.length;

      const propertiesChange = "+12%";
      const leadsChange = "+8%";
      const revenueChange = "+23%";
      const teamChange = "+2";

      return {
        totalProperties,
        activeLeads,
        monthlyRevenue,
        teamMembers,
        propertiesChange,
        leadsChange,
        revenueChange,
        teamChange,
      };
    },
    enabled:
      !!workspaceId && !leadsLoading && !propertiesLoading && !usersLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });

  return {
    data: metrics.data,
    isLoading:
      metrics.isLoading || leadsLoading || propertiesLoading || usersLoading,
    isError: metrics.isError,
    error: metrics.error,
  };
};
