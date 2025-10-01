import { motion } from "framer-motion";

import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspaceContext } from "@/context/workspace-provider";
import { useLeadFunnel } from "@/hooks/API/use-lead-funnel";

const LeadFunnelChart = () => {
  const { currentWorkspace } = useWorkspaceContext();
  const {
    data: leadFunnelData = [],
    isLoading: funnelLoading,
    isError: funnelError,
  } = useLeadFunnel(currentWorkspace?.workspace.id || "");

  if (funnelLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (funnelError || leadFunnelData.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          {funnelError
            ? "Failed to load funnel data"
            : "No pipeline stages found"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {leadFunnelData.map((item, index) => (
        <div key={item.stage} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              {item.stage}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">
                {item.count}
              </span>
              <span className="text-sm text-gray-500">{item.percentage}%</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${item.percentage}%` }}
              transition={{ duration: 1, delay: index * 0.1 }}
              className="h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeadFunnelChart;
