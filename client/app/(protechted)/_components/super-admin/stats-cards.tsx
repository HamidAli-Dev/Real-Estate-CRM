"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease";
  icon: React.ReactNode;
  description: string;
}

const StatCard = ({
  title,
  value,
  change,
  changeType,
  icon,
  description,
}: StatCardProps) => {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {changeType === "increase" ? (
            <TrendingUp className="h-3 w-3 text-green-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
          <span
            className={
              changeType === "increase" ? "text-green-500" : "text-red-500"
            }
          >
            {change}
          </span>
          <span>from last month</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
};

const StatsCards = () => {
  const stats = [
    {
      title: "Total Workspaces",
      value: "1,247",
      change: "+12.5%",
      changeType: "increase" as const,
      icon: <Building2 className="h-4 w-4 text-primary" />,
      description: "Active real estate agencies",
    },
    {
      title: "Total Users",
      value: "8,934",
      change: "+8.2%",
      changeType: "increase" as const,
      icon: <Users className="h-4 w-4 text-primary" />,
      description: "Registered agents and admins",
    },
    {
      title: "Monthly Revenue",
      value: "$124,567",
      change: "+15.3%",
      changeType: "increase" as const,
      icon: <DollarSign className="h-4 w-4 text-primary" />,
      description: "Recurring subscription revenue",
    },
    {
      title: "Active Properties",
      value: "45,892",
      change: "+5.7%",
      changeType: "increase" as const,
      icon: <Activity className="h-4 w-4 text-primary" />,
      description: "Properties being managed",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          changeType={stat.changeType}
          icon={stat.icon}
          description={stat.description}
        />
      ))}
    </div>
  );
};

export default StatsCards;
