"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const RevenueChart = () => {
  // Mock data for the chart
  const revenueData = [
    { month: "Jan", revenue: 85000, growth: 12.5 },
    { month: "Feb", revenue: 92000, growth: 8.2 },
    { month: "Mar", revenue: 105000, growth: 14.1 },
    { month: "Apr", revenue: 118000, growth: 12.4 },
    { month: "May", revenue: 124000, growth: 5.1 },
    { month: "Jun", revenue: 135000, growth: 8.9 },
  ];

  const maxRevenue = Math.max(...revenueData.map((d) => d.revenue));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Revenue Analytics
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span>+15.3%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart Area */}
        <div className="space-y-4">
          {/* Chart Bars */}
          <div className="flex items-end justify-between h-48 px-2">
            {revenueData.map((data, index) => (
              <div
                key={data.month}
                className="flex flex-col items-center gap-2 flex-1"
              >
                <div className="relative w-full max-w-12">
                  <div
                    className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm transition-all duration-300 hover:from-blue-600 hover:to-blue-500"
                    style={{
                      height: `${(data.revenue / maxRevenue) * 160}px`,
                    }}
                  />
                  {/* Tooltip on hover */}
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="font-medium">
                      ${data.revenue.toLocaleString()}
                    </div>
                    <div className="text-green-400">+{data.growth}%</div>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground font-medium">
                  {data.month}
                </span>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${revenueData[revenueData.length - 1].revenue.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Current Month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                $
                {Math.round(
                  revenueData.reduce((sum, d) => sum + d.revenue, 0) /
                    revenueData.length
                ).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                Average Monthly
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Recurring Revenue</span>
              </div>
              <span className="text-sm font-bold">$124,567</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">New Subscriptions</span>
              </div>
              <span className="text-sm font-bold">+47</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium">Churn Rate</span>
              </div>
              <span className="text-sm font-bold">2.1%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
