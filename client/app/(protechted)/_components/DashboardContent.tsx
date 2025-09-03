"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Target,
  CheckCircle,
  Clock,
  Star,
  Plus,
  Phone,
  MapPin,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck,
  Home,
  Briefcase,
  Award,
  Activity,
  MessageSquare,
  Upload,
  CalendarDays,
} from "lucide-react";

// Types
type Role = "Owner" | "Manager" | "Agent";

interface DashboardContentProps {
  role: Role;
}

// Mock Data
const mockData = {
  owner: {
    kpis: [
      {
        title: "Total Properties",
        value: "247",
        change: "+12%",
        icon: Building2,
        color: "text-blue-600",
      },
      {
        title: "Active Leads",
        value: "1,234",
        change: "+8%",
        icon: Users,
        color: "text-green-600",
      },
      {
        title: "Revenue This Month",
        value: "$89,432",
        change: "+23%",
        icon: DollarSign,
        color: "text-purple-600",
      },
      {
        title: "Subscription",
        value: "Premium",
        change: "Active",
        icon: CheckCircle,
        color: "text-emerald-600",
      },
    ],
    pipeline: {
      "New Leads": 45,
      Qualified: 32,
      Negotiation: 28,
      Closed: 19,
    },
    workspace: {
      agents: 12,
      managers: 3,
      deals: 89,
    },
    recentActivity: [
      {
        action: "Property Added",
        detail: "123 Main St, Downtown",
        time: "2 hours ago",
        user: "Sarah Johnson",
      },
      {
        action: "User Invited",
        detail: "New Agent: Mike Chen",
        time: "4 hours ago",
        user: "Admin",
      },
      {
        action: "Deal Closed",
        detail: "Property: 456 Oak Ave",
        time: "1 day ago",
        user: "David Smith",
      },
    ],
  },
  manager: {
    kpis: [
      {
        title: "Team Leads",
        value: "89",
        change: "+15%",
        icon: Users,
        color: "text-blue-600",
      },
      {
        title: "Deals in Progress",
        value: "23",
        change: "+7%",
        icon: Target,
        color: "text-orange-600",
      },
      {
        title: "Tasks Due Today",
        value: "12",
        change: "Urgent",
        icon: Clock,
        color: "text-red-600",
      },
      {
        title: "Team Score",
        value: "8.7/10",
        change: "+0.3",
        icon: Star,
        color: "text-yellow-600",
      },
    ],
    pipeline: {
      New: 23,
      Qualified: 18,
      Negotiation: 15,
      Closed: 8,
    },
    tasks: [
      {
        type: "Call",
        detail: "Follow up with client",
        time: "10:00 AM",
        agent: "Sarah J.",
      },
      {
        type: "Visit",
        detail: "Property inspection",
        time: "2:00 PM",
        agent: "Mike C.",
      },
      {
        type: "Meeting",
        detail: "Client presentation",
        time: "4:00 PM",
        agent: "David S.",
      },
    ],
    topAgents: [
      { name: "Sarah Johnson", deals: 12, score: 9.2, avatar: "SJ" },
      { name: "Mike Chen", deals: 10, score: 8.8, avatar: "MC" },
      { name: "David Smith", deals: 9, score: 8.5, avatar: "DS" },
    ],
  },
  agent: {
    kpis: [
      {
        title: "My Active Leads",
        value: "23",
        change: "+3",
        icon: Users,
        color: "text-blue-600",
      },
      {
        title: "Properties Assigned",
        value: "15",
        change: "+2",
        icon: Home,
        color: "text-green-600",
      },
      {
        title: "Tasks Pending",
        value: "7",
        change: "Due Today",
        icon: Clock,
        color: "text-orange-600",
      },
      {
        title: "Deals Won",
        value: "8",
        change: "+2",
        icon: Award,
        color: "text-emerald-600",
      },
    ],
    pipeline: {
      New: 8,
      Negotiation: 12,
      Closed: 8,
    },
    interactions: [
      {
        client: "John Smith",
        type: "Phone Call",
        detail: "Property inquiry",
        time: "2 hours ago",
      },
      {
        client: "Emma Wilson",
        type: "Email",
        detail: "Document request",
        time: "1 day ago",
      },
      {
        client: "Robert Brown",
        type: "Meeting",
        detail: "Property viewing",
        time: "2 days ago",
      },
      {
        client: "Lisa Davis",
        type: "Text",
        detail: "Follow up",
        time: "3 days ago",
      },
      {
        client: "James Miller",
        type: "Call",
        detail: "Offer discussion",
        time: "1 week ago",
      },
    ],
  },
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

// KPI Card Component
const KPICard = ({ title, value, change, icon: Icon, color }: any) => (
  <motion.div variants={cardVariants}>
    <Card className="hover:shadow-md transition-all duration-200 border-0 bg-white/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-full bg-gray-50 ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <div className="flex items-center mt-4">
          {change.includes("+") ? (
            <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
          ) : change.includes("-") ? (
            <ArrowDownRight className="w-4 h-4 text-red-600 mr-1" />
          ) : null}
          <span
            className={`text-sm font-medium ${
              change.includes("+")
                ? "text-green-600"
                : change.includes("-")
                ? "text-red-600"
                : change === "Urgent"
                ? "text-red-600"
                : change === "Active"
                ? "text-emerald-600"
                : "text-gray-600"
            }`}
          >
            {change}
          </span>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Owner Dashboard
const OwnerDashboard = () => (
  <motion.div
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className="space-y-6"
  >
    {/* KPI Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {mockData.owner.kpis.map((kpi, index) => (
        <KPICard key={index} {...kpi} />
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Pipeline Snapshot */}
      <motion.div variants={itemVariants} className="lg:col-span-2">
        <Card className="border-0 bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Pipeline Snapshot
            </CardTitle>
            <CardDescription>
              Current lead distribution across stages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(mockData.owner.pipeline).map(([stage, count]) => (
                <div key={stage} className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {count}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{stage}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Workspace Overview */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Workspace Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Agents</span>
              <span className="font-semibold">
                {mockData.owner.workspace.agents}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Managers</span>
              <span className="font-semibold">
                {mockData.owner.workspace.managers}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Active Deals</span>
              <span className="font-semibold">
                {mockData.owner.workspace.deals}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>

    {/* Recent Activity */}
    <motion.div variants={itemVariants}>
      <Card className="border-0 bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockData.owner.recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 rounded-lg bg-gray-50/50"
              >
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.detail}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.user}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  </motion.div>
);

// Manager Dashboard
const ManagerDashboard = () => (
  <motion.div
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className="space-y-6"
  >
    {/* KPI Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {mockData.manager.kpis.map((kpi, index) => (
        <KPICard key={index} {...kpi} />
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Pipeline Snapshot */}
      <motion.div variants={itemVariants} className="lg:col-span-2">
        <Card className="border-0 bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Team Pipeline
            </CardTitle>
            <CardDescription>Your team's lead distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(mockData.manager.pipeline).map(
                ([stage, count]) => (
                  <div key={stage} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {count}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{stage}</div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Agents */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Top Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.manager.topAgents.map((agent, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {agent.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{agent.name}</p>
                    <p className="text-xs text-gray-600">{agent.deals} deals</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {agent.score}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>

    {/* Tasks & Meetings */}
    <motion.div variants={itemVariants}>
      <Card className="border-0 bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockData.manager.tasks.map((task, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 rounded-lg bg-gray-50/50"
              >
                <div
                  className={`p-2 rounded-full ${
                    task.type === "Call"
                      ? "bg-blue-100 text-blue-600"
                      : task.type === "Visit"
                      ? "bg-green-100 text-green-600"
                      : "bg-purple-100 text-purple-600"
                  }`}
                >
                  {task.type === "Call" ? (
                    <Phone className="w-4 h-4" />
                  ) : task.type === "Visit" ? (
                    <MapPin className="w-4 h-4" />
                  ) : (
                    <MessageSquare className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{task.detail}</p>
                  <p className="text-sm text-gray-600">{task.agent}</p>
                </div>
                <Badge variant="outline">{task.time}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  </motion.div>
);

// Agent Dashboard
const AgentDashboard = () => (
  <motion.div
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className="space-y-6"
  >
    {/* KPI Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {mockData.agent.kpis.map((kpi, index) => (
        <KPICard key={index} {...kpi} />
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* My Pipeline */}
      <motion.div variants={itemVariants} className="lg:col-span-2">
        <Card className="border-0 bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              My Pipeline
            </CardTitle>
            <CardDescription>Your personal lead status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(mockData.agent.pipeline).map(([stage, count]) => (
                <div key={stage} className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {count}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{stage}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <CalendarDays className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Upload Docs
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>

    {/* Recent Client Interactions */}
    <motion.div variants={itemVariants}>
      <Card className="border-0 bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Recent Client Interactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockData.agent.interactions.map((interaction, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 rounded-lg bg-gray-50/50"
              >
                <div
                  className={`p-2 rounded-full ${
                    interaction.type === "Phone Call"
                      ? "bg-blue-100 text-blue-600"
                      : interaction.type === "Email"
                      ? "bg-green-100 text-green-600"
                      : interaction.type === "Meeting"
                      ? "bg-purple-100 text-purple-600"
                      : "bg-orange-100 text-orange-600"
                  }`}
                >
                  {interaction.type === "Phone Call" ? (
                    <Phone className="w-4 h-4" />
                  ) : interaction.type === "Email" ? (
                    <FileText className="w-4 h-4" />
                  ) : interaction.type === "Meeting" ? (
                    <Calendar className="w-4 h-4" />
                  ) : (
                    <MessageSquare className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {interaction.client}
                  </p>
                  <p className="text-sm text-gray-600">{interaction.detail}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {interaction.time}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  </motion.div>
);

// Main Dashboard Content Component
const DashboardContent = ({ role }: DashboardContentProps) => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">{role} Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here's what's happening with your {role.toLowerCase()}{" "}
          account.
        </p>
      </motion.div>

      {/* Role-based Dashboard Content */}
      {role === "Owner" && <OwnerDashboard />}
      {role === "Manager" && <ManagerDashboard />}
      {role === "Agent" && <AgentDashboard />}
    </div>
  );
};

export default DashboardContent;
