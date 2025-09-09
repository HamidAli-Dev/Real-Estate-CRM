"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AnalyticsOverview = () => {
  const [activeTab, setActiveTab] = useState<"leadFunnel" | "monthlySales">(
    "leadFunnel"
  );

  // Lead Funnel Data
  const leadFunnelData = [
    { stage: "New Leads", count: 156, percentage: 100, color: "#3B82F6" },
    { stage: "Contacted", count: 124, percentage: 79, color: "#3B82F6" },
    { stage: "Qualified", count: 89, percentage: 57, color: "#3B82F6" },
    { stage: "Proposal Sent", count: 67, percentage: 43, color: "#3B82F6" },
    { stage: "Negotiating", count: 45, percentage: 29, color: "#3B82F6" },
    { stage: "Closed Won", count: 23, percentage: 15, color: "#3B82F6" },
  ];

  // Monthly Sales Data
  const monthlySalesData = [
    { month: "Jan", units: 45, value: 89 },
    { month: "Feb", units: 52, value: 102 },
    { month: "Mar", units: 48, value: 95 },
    { month: "Apr", units: 61, value: 118 },
    { month: "May", units: 55, value: 107 },
    { month: "Jun", units: 67, value: 125 },
  ];

  const LeadFunnelChart = () => (
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

  const MonthlySalesChart = () => (
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
        {monthlySalesData.map((item) => (
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

  return (
    <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-900">
            Analytics Overview
          </CardTitle>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={activeTab === "leadFunnel" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("leadFunnel")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === "leadFunnel"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Lead Funnel
            </Button>
            <Button
              variant={activeTab === "monthlySales" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("monthlySales")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === "monthlySales"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Monthly Sales
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activeTab === "leadFunnel" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Lead Conversion Funnel
            </h3>
            <LeadFunnelChart />
          </motion.div>
        )}

        {activeTab === "monthlySales" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Monthly Sales Performance
            </h3>
            <MonthlySalesChart />
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyticsOverview;
