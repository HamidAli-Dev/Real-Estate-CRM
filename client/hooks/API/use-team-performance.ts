import { useQuery } from "@tanstack/react-query";
import { useLeads } from "./use-leads";
import { useWorkspaceUsers } from "./use-workspace-users";

export interface TeamPerformanceMetrics {
  goalAchievementRate: number;
  topPerformer: {
    name: string;
    dealsCount: number;
  };
  thisMonthDeals: number;
  totalTeamDeals: number;
  averageDealsPerMember: number;
}

export const useTeamPerformance = (workspaceId: string) => {
  const { data: leads = [], isLoading: leadsLoading } = useLeads(workspaceId);
  const { data: workspaceUsers = [], isLoading: usersLoading } =
    useWorkspaceUsers(workspaceId);

  const metrics = useQuery({
    queryKey: ["team-performance", workspaceId],
    queryFn: async (): Promise<TeamPerformanceMetrics> => {
      const dealsPerMember = workspaceUsers.map((user) => {
        const userLeads = leads.filter(
          (lead) => lead.assignedToId === user.user.id
        );
        return {
          userId: user.user.id,
          name: user.user.name,
          dealsCount: userLeads.length,
        };
      });

      const topPerformer = dealsPerMember.reduce(
        (top, current) => (current.dealsCount > top.dealsCount ? current : top),
        { userId: "", name: "No one", dealsCount: 0 }
      );

      const totalTeamDeals = leads.length;

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const thisMonthDeals = leads.filter((lead) => {
        const leadDate = new Date(lead.createdAt);
        return (
          leadDate.getMonth() === currentMonth &&
          leadDate.getFullYear() === currentYear
        );
      }).length;

      const averageDealsPerMember =
        workspaceUsers.length > 0
          ? Math.round((totalTeamDeals / workspaceUsers.length) * 10) / 10
          : 0;

      const goalAchievementRate =
        workspaceUsers.length > 0
          ? Math.min(
              100,
              Math.round((totalTeamDeals / (workspaceUsers.length * 5)) * 100)
            ) // 5 deals per member as goal
          : 0;

      return {
        goalAchievementRate: Math.min(100, Math.max(0, goalAchievementRate)),
        topPerformer: {
          name: topPerformer.name,
          dealsCount: topPerformer.dealsCount,
        },
        thisMonthDeals,
        totalTeamDeals,
        averageDealsPerMember,
      };
    },
    enabled: !!workspaceId && !leadsLoading && !usersLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });

  return {
    data: metrics.data,
    isLoading: metrics.isLoading || leadsLoading || usersLoading,
    isError: metrics.isError,
    error: metrics.error,
  };
};
