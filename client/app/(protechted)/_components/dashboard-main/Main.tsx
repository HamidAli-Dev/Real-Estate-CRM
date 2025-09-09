"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Plus,
  Sparkles,
  TrendingUp,
  Users,
  Home,
  DollarSign,
  Calendar,
} from "lucide-react";

import { useWorkspaceContext } from "@/context/workspace-provider";
import { useAuthContext } from "@/context/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import TopBar from "../TopBar";
import CreateWorkspaceDialog from "../workspace/CreateWorkspaceDialog";
import AnalyticsOverview from "./AnalyticsOverview";

const Main = () => {
  const { userWorkspaces, isLoading } = useWorkspaceContext();
  const { user } = useAuthContext();
  const [showCreateWorkspaceDialog, setShowCreateWorkspaceDialog] =
    useState(false);

  // Mock data for dashboard metrics
  const dashboardMetrics = {
    totalProperties: 247,
    activeLeads: 1234,
    monthlyRevenue: 89432,
    teamMembers: 15,
    propertiesChange: "+12%",
    leadsChange: "+8%",
    revenueChange: "+23%",
    teamChange: "+2",
  };

  // Show create workspace dialog when user has no workspaces
  useEffect(() => {
    if (!isLoading && userWorkspaces.length === 0) {
      setShowCreateWorkspaceDialog(true);
    }
  }, [isLoading, userWorkspaces.length]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <TopBar />
        <div className="flex items-center justify-center min-h-[calc(100vh-96px)] pt-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Loading Dashboard
            </h3>
            <p className="text-gray-600">Preparing your workspace...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show create workspace prompt if user has no workspaces
  if (userWorkspaces.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <TopBar />
        <div className="flex items-center justify-center min-h-[calc(100vh-96px)] p-6 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="relative mb-8">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/25">
                <Building2 className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Welcome to RealEstate CRM
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed px-4">
              Transform your real estate business with our comprehensive CRM
              platform. Create your first workspace to start managing
              properties, leads, and deals.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
                <Home className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Property Management
                </h3>
                <p className="text-sm text-gray-600">
                  Organize and track all your listings
                </p>
              </div>
              <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
                <Users className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Lead Tracking
                </h3>
                <p className="text-sm text-gray-600">
                  Manage prospects and conversions
                </p>
              </div>
              <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Analytics & Reports
                </h3>
                <p className="text-sm text-gray-600">
                  Track performance and growth
                </p>
              </div>
            </div>

            <Button
              onClick={() => setShowCreateWorkspaceDialog(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 py-4 text-lg font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200"
            >
              <Plus className="w-6 h-6 mr-3" />
              Create Your First Workspace
            </Button>
          </motion.div>
        </div>

        {/* Create Workspace Dialog */}
        <CreateWorkspaceDialog
          isOpen={showCreateWorkspaceDialog}
          onClose={() => setShowCreateWorkspaceDialog(false)}
        />
      </div>
    );
  }

  // Show normal dashboard when user has a workspace
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <TopBar />
      <div className="pt-24 px-6 pb-6 space-y-8">
        {/* Key Metrics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          <Card className="border-0 bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-100 mb-1">
                    Total Properties
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {dashboardMetrics.totalProperties.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-300 mr-1" />
                    <span className="text-sm font-medium text-green-300">
                      {dashboardMetrics.propertiesChange}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Home className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-teal-100 mb-1">
                    Active Leads
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {dashboardMetrics.activeLeads.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-300 mr-1" />
                    <span className="text-sm font-medium text-green-300">
                      {dashboardMetrics.leadsChange}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-100 mb-1">
                    Monthly Revenue
                  </p>
                  <p className="text-3xl font-bold text-white">
                    ${dashboardMetrics.monthlyRevenue.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-300 mr-1" />
                    <span className="text-sm font-medium text-green-300">
                      {dashboardMetrics.revenueChange}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-100 mb-1">
                    Team Members
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {dashboardMetrics.teamMembers}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-300 mr-1" />
                    <span className="text-sm font-medium text-green-300">
                      {dashboardMetrics.teamChange}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Promotional Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <Card className="lg:col-span-2 border-0 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Boost Your Real Estate Business Today! 🏠
                  </h2>
                  <p className="text-purple-100 mb-6 text-lg">
                    Discover powerful tools and insights to accelerate your
                    property sales and lead management.
                  </p>
                  <Button className="bg-white text-purple-600 hover:bg-purple-50 font-semibold px-6 py-3 rounded-lg shadow-lg">
                    Explore Features
                  </Button>
                </div>
                <div className="hidden lg:block ml-8">
                  <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
                    <Home className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 flex flex-col justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Growth Rate
                </h3>
                <p className="text-3xl font-bold text-white mb-2">+24.5%</p>
                <p className="text-green-100 text-sm">This month</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Analytics Overview and Quick Actions Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Analytics Overview - Takes 2/3 of the width */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="lg:col-span-2"
          >
            <AnalyticsOverview />
          </motion.div>

          {/* Quick Actions - Takes 1/3 of the width */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg h-fit">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Quick Actions
                </CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 h-auto p-4">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <Home className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <div className="font-semibold">Add Property</div>
                        <div className="text-sm text-blue-600">
                          List a new property
                        </div>
                      </div>
                    </div>
                    <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center">
                      <span className="text-blue-700 text-sm">→</span>
                    </div>
                  </div>
                </Button>

                <Button className="w-full justify-start bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 h-auto p-4">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <div className="w-5 h-5 mr-3 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                        <Plus className="w-3 h-3 -ml-2 -mt-1" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">Add Lead</div>
                        <div className="text-sm text-green-600">
                          Create new lead
                        </div>
                      </div>
                    </div>
                    <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center">
                      <span className="text-green-700 text-sm">→</span>
                    </div>
                  </div>
                </Button>

                <Button className="w-full justify-start bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 h-auto p-4">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <div className="w-5 h-5 mr-3 flex items-center justify-center">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">Schedule Task</div>
                        <div className="text-sm text-purple-600">
                          Plan follow-up
                        </div>
                      </div>
                    </div>
                    <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center">
                      <span className="text-purple-700 text-sm">→</span>
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest updates from your workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  action: "New Property Added",
                  detail: "123 Main St, Downtown",
                  time: "2 hours ago",
                  user: "Sarah Johnson",
                },
                {
                  action: "Lead Converted",
                  detail: "John Smith → Qualified Lead",
                  time: "4 hours ago",
                  user: "Mike Chen",
                },
                {
                  action: "Deal Closed",
                  detail: "456 Oak Ave - $450,000",
                  time: "1 day ago",
                  user: "David Smith",
                },
                {
                  action: "Team Member Added",
                  detail: "New Agent: Lisa Davis",
                  time: "2 days ago",
                  user: "Admin",
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors duration-200"
                >
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {activity.action}
                    </p>
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
            </CardContent>
          </Card>
        </motion.div>

        {/* Workspace Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <Card className="border-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Workspace Status
                  </h3>
                  <p className="text-gray-600">
                    Your workspace is active and running smoothly
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">
                    All Systems Operational
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Main;
