"use client";

import { useState } from "react";
import {
  Building2,
  Users,
  Shield,
  Trash2,
  AlertTriangle,
  Settings,
  Edit,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { useWorkspaceContext } from "@/context/workspace-provider";
import { useAuthContext } from "@/context/auth-provider";
import { getWorkspaceUsersQueryFn, getWorkspaceRolesQueryFn } from "@/lib/api";
import EditWorkspaceDialog from "./EditWorkspaceDialog";
import DeleteWorkspaceDialog from "./DeleteWorkspaceDialog";
import { usePermission } from "@/hooks/usePermission";

// Helper function to filter out Owner role
const filterOutOwnerRole = (role: {
  id: string;
  name: string;
  isSystem: boolean;
}) => {
  return !(role.isSystem && role.name === "Owner") && role.name !== "Owner";
};

const WorkspaceSettings = () => {
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { currentWorkspace } = useWorkspaceContext();
  const { user } = useAuthContext();
  const { can } = usePermission();

  // Get workspace users for statistics
  const { data: usersData } = useQuery({
    queryKey: ["workspaceUsers", currentWorkspace?.workspace.id],
    queryFn: () => getWorkspaceUsersQueryFn(currentWorkspace!.workspace.id),
    enabled: !!currentWorkspace?.workspace.id,
  });

  // Get workspace roles for statistics
  const { data: rolesData } = useQuery({
    queryKey: ["workspaceRoles", currentWorkspace?.workspace.id],
    queryFn: () => getWorkspaceRolesQueryFn(currentWorkspace!.workspace.id),
    enabled: !!currentWorkspace?.workspace.id,
  });

  const workspaceUsers = usersData || [];
  const roles = (rolesData || []).filter(filterOutOwnerRole);

  console.log("workspaceUsers", workspaceUsers);

  const isOwner = user?.user.role?.name === "Owner";

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Workspace Selected
          </h3>
          <p className="text-gray-500">
            Please select a workspace to view its settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Workspace Settings
          </h2>
          <p className="text-gray-600">
            Manage your workspace configuration and preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Workspace Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="w-5 h-5" />
                <span>Workspace Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Name
                  </label>
                  <p className="text-lg font-medium text-gray-900">
                    {currentWorkspace.workspace.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Role
                  </label>
                  <Badge variant="secondary" className="text-sm">
                    {currentWorkspace.role.name}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Created
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(
                      currentWorkspace.workspace.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Last Updated
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(
                      currentWorkspace.workspace.updatedAt
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {can.editSettings() && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditOpen(true)}
                  className="w-full sm:w-auto"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Workspace
                </Button>
              )}
            </CardContent>
          </Card>

          {/* User Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>User Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {workspaceUsers.length}
                  </div>
                  <div className="text-sm text-gray-500">Total Users</div>
                </div>
                {/* Dynamic role statistics - show up to 3 roles */}
                {roles.slice(0, 3).map((role, index) => {
                  // Define colors for different roles
                  const colorClasses = [
                    "text-green-600",
                    "text-yellow-600",
                    "text-purple-600",
                  ];

                  const colorClass = colorClasses[index] || "text-gray-600";

                  return (
                    <div key={role.id} className="text-center">
                      <div className={`text-2xl font-bold ${colorClass}`}>
                        {
                          workspaceUsers.filter(
                            (u: {
                              id: string;
                              userId: string;
                              workspaceId: string;
                              roleId: string;
                              role: {
                                id: string;
                                name: string;
                                isSystem: boolean;
                                createdAt: string;
                                updatedAt: string;
                                rolePermissions: {
                                  id: string;
                                  roleId: string;
                                  permissionId: string;
                                  permission: {
                                    id: string;
                                    name: string;
                                    group: string;
                                    createdAt: string;
                                    updatedAt: string;
                                  }[];
                                };
                              };
                            }) => u.role.name === role.name
                          ).length
                        }
                      </div>
                      <div className="text-sm text-gray-500">
                        {role.name}s{role.isSystem && " (System)"}
                      </div>
                    </div>
                  );
                })}
                {/* If there are more than 3 roles, show a summary of the remaining roles */}
                {roles.length > 3 && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {roles.slice(3).reduce((count, role) => {
                        return (
                          count +
                          workspaceUsers.filter(
                            (u: {
                              id: string;
                              userId: string;
                              workspaceId: string;
                              roleId: string;
                              role: {
                                id: string;
                                name: string;
                                isSystem: boolean;
                                createdAt: string;
                                updatedAt: string;
                                rolePermissions: {
                                  id: string;
                                  roleId: string;
                                  permissionId: string;
                                  permission: {
                                    id: string;
                                    name: string;
                                    group: string;
                                    createdAt: string;
                                    updatedAt: string;
                                  }[];
                                };
                              };
                            }) => u.role.name === role.name
                          ).length
                        );
                      }, 0)}
                    </div>
                    <div className="text-sm text-gray-500">Other Roles</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Permissions Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Permissions Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">User Management</span>
                  <Badge variant="outline" className="text-xs">
                    {isOwner ? "Full Access" : "Limited"}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Workspace Settings
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {can.viewSettings() ? "Full Access" : "View Only"}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Data Management</span>
                  <Badge variant="outline" className="text-xs">
                    {isOwner ? "Full Access" : "Limited"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {can.viewUsers() && (
                <Link
                  href={`/dashboard/user-management?workspaceId=${workspaceId}`}
                  prefetch={true}
                >
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Users
                  </Button>
                </Link>
              )}
              {can.viewProperties() && (
                <Link
                  href={`/dashboard/properties?workspaceId=${workspaceId}`}
                  prefetch={true}
                >
                  <Button variant="outline" className="w-full justify-start">
                    <Building2 className="w-4 h-4 mr-2" />
                    View Properties
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          {isOwner && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-800">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Danger Zone</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-red-700">
                    These actions are irreversible and will permanently affect
                    your workspace.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => setIsDeleteOpen(true)}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Workspace
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Workspace Dialog */}
      <EditWorkspaceDialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        workspace={currentWorkspace}
      />

      {/* Delete Workspace Dialog */}
      <DeleteWorkspaceDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
      />
    </div>
  );
};

export default WorkspaceSettings;
