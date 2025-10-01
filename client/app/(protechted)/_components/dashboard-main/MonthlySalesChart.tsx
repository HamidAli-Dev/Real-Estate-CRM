import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useMonthlySales } from "@/hooks/API/use-monthly-sales";
import { useWorkspaceContext } from "@/context/workspace-provider";
import { Skeleton } from "@/components/ui/skeleton";

const MonthlySalesChart = () => {
  const { currentWorkspace } = useWorkspaceContext();
  const { data: monthlySalesData, isLoading } = useMonthlySales(
    currentWorkspace?.workspace.id || ""
  );

  if (isLoading) {
    return (
      <div className="h-80">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={monthlySalesData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6B7280" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6B7280" }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-900">{label}</p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{data.units}</span> units
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">${data.value}k</span> sales
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="units"
            fill="#3B82F6"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Custom labels below bars */}
      <div className="flex justify-between mt-4 px-2">
        {monthlySalesData?.map((item) => (
          <div key={item.month} className="text-center">
            <div className="text-xs text-gray-500 mb-1">{item.month}</div>
            <div className="text-sm font-semibold text-gray-900">
              {item.units}
            </div>
            <div className="text-xs text-gray-500">${item.value}k</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthlySalesChart;
