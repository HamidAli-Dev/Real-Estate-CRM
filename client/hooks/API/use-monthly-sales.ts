import { useQuery } from "@tanstack/react-query";
import { useProperties } from "./use-properties";

interface MonthlySalesData {
  month: string;
  units: number;
  value: number;
}

interface MonthData {
  month: string;
  date: Date;
  units: number;
  value: number;
}

export const useMonthlySales = (workspaceId: string) => {
  const { data: properties, isLoading: propertiesLoading } =
    useProperties(workspaceId);

  return useQuery({
    queryKey: ["monthly-sales", workspaceId],
    queryFn: async (): Promise<MonthlySalesData[]> => {
      if (!properties) return [];

      // Get current date and calculate last 6 months
      const now = new Date();
      const months: MonthData[] = [];

      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleDateString("en-US", { month: "short" });
        months.push({
          month: monthName,
          date: date,
          units: 0,
          value: 0,
        });
      }

      // Filter properties that were sold in the last 6 months
      const soldProperties = properties.filter(
        (property) =>
          property.status === "Sold" &&
          property.updatedAt &&
          new Date(property.updatedAt) >= months[0].date
      );

      // Group sold properties by month
      soldProperties.forEach((property) => {
        if (property.updatedAt) {
          const soldDate = new Date(property.updatedAt);
          const monthIndex = months.findIndex(
            (m) =>
              m.date.getFullYear() === soldDate.getFullYear() &&
              m.date.getMonth() === soldDate.getMonth()
          );

          if (monthIndex !== -1) {
            months[monthIndex].units += 1;
            months[monthIndex].value += property.price;
          }
        }
      });

      return months.map((month) => ({
        month: month.month,
        units: month.units,
        value: Math.round(month.value / 1000), // Convert to thousands
      }));
    },
    enabled: !!workspaceId && !propertiesLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
