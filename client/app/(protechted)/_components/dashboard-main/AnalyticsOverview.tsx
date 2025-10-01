"use client";
import { useState } from "react";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import MonthlySalesChart from "./MonthlySalesChart";
import LeadFunnelChart from "./LeadFunnelChart";

const AnalyticsOverview = () => {
  const [activeTab, setActiveTab] = useState<"leadFunnel" | "monthlySales">(
    "leadFunnel"
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
