"use client";
import {
  Building2,
  ExternalLink,
  Plus,
  Globe,
  Users,
  Calendar,
  Settings,
  Edit,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useAuthContext } from "@/context/auth-provider";
import { useQuery } from "@tanstack/react-query";
import { getUserWorkspacesQueryFn } from "@/lib/api";
import { userWorkspaceType } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import EditWorkspaceDialog from "@/components/workspace/EditWorkspaceDialog";
import { useRouter } from "next/navigation";

const Overview = () => {
  const { isLoading: authLoading, user } = useAuthContext();
  const [hoveredWorkspace, setHoveredWorkspace] = useState<string | null>(null);
  const [editingWorkspace, setEditingWorkspace] =
    useState<userWorkspaceType | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Fetch user workspaces
  const { data: workspacesData, isLoading: workspacesLoading } = useQuery({
    queryKey: ["userWorkspaces"],
    queryFn: getUserWorkspacesQueryFn,
    enabled: !!user?.workspaceId && isHydrated, // Only fetch if user has a workspace and component is hydrated
  });

  const workspaces = workspacesData?.data || [];
  const isLoading = authLoading || workspacesLoading || !isHydrated;

  const handleLiveView = (domain: string) => {
    const subdomainUrl = `http://${domain}.localhost:3000`;
    window.open(subdomainUrl, "_blank");
  };

  const handleWorkspaceSettings = (workspaceId: string) => {
    // TODO: Navigate to workspace settings
    console.log("Navigate to workspace settings:", workspaceId);
  };

  const handleEditWorkspace = (workspace: userWorkspaceType) => {
    setEditingWorkspace(workspace);
  };

  const handleCloseEditDialog = () => {
    setEditingWorkspace(null);
  };

  const handleCreateWorkspace = () => {
    // Navigate to dashboard where create workspace button exists
    router.push("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Workspace Dashboard
        </h1>
        <p className="text-gray-600 text-lg">
          Welcome back, {user?.name}! Manage your business workspaces and
          properties.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">
                  Total Workspaces
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {workspaces.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-200 text-blue-700">
                <Building2 className="text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">
                  Active Properties
                </p>
                <p className="text-2xl font-bold text-green-900">0</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-200 text-green-700">
                <Globe className="text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">
                  Total Leads
                </p>
                <p className="text-2xl font-bold text-purple-900">0</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-200 text-purple-700">
                <Users className="text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 mb-1">
                  This Month
                </p>
                <p className="text-2xl font-bold text-orange-900">$0</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-orange-200 text-orange-700">
                <Calendar className="text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workspaces Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Your Workspaces
            </h2>
            <p className="text-gray-600 mt-1">
              Manage your business workspaces and access their dedicated
              dashboards
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            onClick={handleCreateWorkspace}
          >
            <Plus className="w-4 h-4" />
            <span>New Workspace</span>
          </Button>
        </div>

        {workspaces.length === 0 ? (
          <Card className="text-center py-12 border-dashed border-2 border-gray-200">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No workspaces yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first workspace to start managing your real estate
              business
            </p>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleCreateWorkspace}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Workspace
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((userWorkspace: userWorkspaceType) => {
              const workspace = userWorkspace.workspace;
              const isHovered = hoveredWorkspace === workspace.id;

              return (
                <Card
                  key={workspace.id}
                  className={`group overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                    isHovered ? "ring-2 ring-blue-200" : ""
                  }`}
                  onMouseEnter={() => setHoveredWorkspace(workspace.id)}
                  onMouseLeave={() => setHoveredWorkspace(null)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                          {workspace.name}
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              userWorkspace.role === "Owner"
                                ? "default"
                                : "secondary"
                            }
                            className={`${
                              userWorkspace.role === "Owner"
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : "bg-gray-100 text-gray-800 border-gray-200"
                            }`}
                          >
                            {userWorkspace.role}
                          </Badge>
                          <span className="text-sm text-gray-500 font-mono">
                            {workspace.domain}.localhost:3000
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleEditWorkspace(userWorkspace)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Status</span>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          Active
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Properties</span>
                        <span className="font-medium">0</span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Leads</span>
                        <span className="font-medium">0</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleLiveView(workspace.domain)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Live View
                        </Button>

                        {/* Edit button - only show for Owners */}
                        {userWorkspace.role === "Owner" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="px-3 py-2"
                            onClick={() => handleEditWorkspace(userWorkspace)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="px-3 py-2"
                          onClick={() => handleWorkspaceSettings(workspace.id)}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <span className="font-medium">Add Property</span>
            <span className="text-sm text-gray-500">List new properties</span>
          </Button>

          <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
            <Users className="w-6 h-6 text-green-600" />
            <span className="font-medium">Manage Leads</span>
            <span className="text-sm text-gray-500">
              Track potential clients
            </span>
          </Button>

          <Button variant="outline" className="h-auto p-4 flex-col space-y-2">
            <Globe className="w-6 h-6 text-purple-600" />
            <span className="text-sm text-gray-500">Customize workspace</span>
          </Button>
        </div>
      </div>

      {/* Edit Workspace Dialog */}
      {editingWorkspace && (
        <EditWorkspaceDialog
          isOpen={!!editingWorkspace}
          workspace={editingWorkspace}
          onClose={handleCloseEditDialog}
        />
      )}
    </div>
  );
};

export default Overview;
