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
import { getWorkspaceUsersQueryFn } from "@/lib/api";
import EditWorkspaceDialog from "./EditWorkspaceDialog";
import DeleteWorkspaceDialog from "./DeleteWorkspaceDialog";

const WorkspaceSettings = () => {
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { currentWorkspace } = useWorkspaceContext();
  const { user } = useAuthContext();

  // Get workspace users for statistics
  const { data: usersData } = useQuery({
    queryKey: ["workspaceUsers", currentWorkspace?.workspace.id],
    queryFn: () => getWorkspaceUsersQueryFn(currentWorkspace!.workspace.id),
    enabled: !!currentWorkspace?.workspace.id,
  });

  const workspaceUsers = usersData || [];

  console.log("workspaceUsers", workspaceUsers);

  const isOwner = user?.user.role?.name === "Owner";
  const canEdit = isOwner;

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
              {canEdit && (
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
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
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
                        }) => u.role.name === "Owner"
                      ).length
                    }
                  </div>
                  <div className="text-sm text-gray-500">Owners</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
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
                        }) => u.role.name === "Manager"
                      ).length
                    }
                  </div>
                  <div className="text-sm text-gray-500">Managers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
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
                        }) => u.role.name === "Agent"
                      ).length
                    }
                  </div>
                  <div className="text-sm text-gray-500">Agents</div>
                </div>
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
                    {canEdit ? "Full Access" : "View Only"}
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
              <Link
                href={`/dashboard/user-management?workspaceId=${workspaceId}`}
                prefetch={true}
              >
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
              <Link
                href={`/dashboard/properties?workspaceId=${workspaceId}`}
                prefetch={true}
              >
                <Button variant="outline" className="w-full justify-start">
                  <Building2 className="w-4 h-4 mr-2" />
                  View Properties
                </Button>
              </Link>
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
