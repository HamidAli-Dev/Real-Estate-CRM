"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Users,
  Shield,
  Edit,
  Trash2,
  Loader,
  AlertTriangle,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useWorkspaceContext } from "@/context/workspace-provider";
import { useAuthContext } from "@/context/auth-provider";
import {
  getWorkspaceUsersQueryFn,
  updateUserRoleMutationFn,
  removeUserMutationFn,
  getWorkspaceRolesQueryFn,
  getPermissionsQueryFn,
} from "@/lib/api";
import { usePermission } from "@/hooks/usePermission";
import { updateUserRoleType, permissionGroupType } from "@/types/api.types";
import { UserInvitationModal } from "@/components/forms/UserInvitationModal";
import { RoleCreationModal } from "@/components/forms/RoleCreationModal";

const updateUserRoleSchema = z.object({
  roleId: z.string().min(1, "Please select a role"),
  permissions: z
    .array(z.string())
    .min(1, "At least one permission is required"),
});

const UserManagement = () => {
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { currentWorkspace, userWorkspaces } = useWorkspaceContext();
  const { user } = useAuthContext();
  const { can } = usePermission();
  const queryClient = useQueryClient();

  const editForm = useForm<z.infer<typeof updateUserRoleSchema>>({
    resolver: zodResolver(updateUserRoleSchema),
    defaultValues: {
      roleId: "",
      permissions: [],
    },
  });

  // Get workspace users
  const {
    data: usersData,
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["workspaceUsers", currentWorkspace?.workspace.id],
    queryFn: () => getWorkspaceUsersQueryFn(currentWorkspace!.workspace.id),
    enabled: !!currentWorkspace?.workspace.id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache the data
  });

  // Get workspace roles
  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryFn: () => {
      return getWorkspaceRolesQueryFn(currentWorkspace!.workspace.id);
    },
    queryKey: ["workspaceRoles", currentWorkspace?.workspace.id],
    enabled: !!currentWorkspace?.workspace.id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache the data
  });

  // Get permissions
  const { data: permissionsData } = useQuery({
    queryKey: ["permissions"],
    queryFn: () => getPermissionsQueryFn(),
  });

  // Extract data
  const workspaceUsers = usersData || [];
  const roles = rolesData || [];

  // Clear queries when workspace changes to prevent cross-workspace data
  useEffect(() => {
    if (currentWorkspace) {
      // Invalidate all workspace-specific queries to force fresh data
      queryClient.invalidateQueries({
        queryKey: ["workspaceRoles"],
      });

      queryClient.invalidateQueries({
        queryKey: ["workspaceUsers"],
      });

      // Remove stale cached data for other workspaces
      queryClient.removeQueries({
        queryKey: ["workspaceRoles"],
        predicate: (query) => {
          const queryKey = query.queryKey as string[];
          return queryKey[1]
            ? queryKey[1] !== currentWorkspace.workspace.id
            : false;
        },
      });

      queryClient.removeQueries({
        queryKey: ["workspaceUsers"],
        predicate: (query) => {
          const queryKey = query.queryKey as string[];
          return queryKey[1]
            ? queryKey[1] !== currentWorkspace.workspace.id
            : false;
        },
      });
    }
  }, [currentWorkspace, queryClient]);
  const permissionGroups = permissionsData?.data || [];

  // Update user role mutation
  const { mutate: updateUserRole, isPending: isUpdating } = useMutation({
    mutationFn: updateUserRoleMutationFn,
    onSuccess: () => {
      toast.success("User role updated successfully!");
      setEditingUser(null);
      refetchUsers();
      // Also invalidate roles query to update role user counts
      queryClient.invalidateQueries({
        queryKey: ["workspaceRoles", currentWorkspace?.workspace.id],
      });
    },
    onError: (error: any) => {
      toast.error("Failed to update user role", {
        description: error?.data?.message || error?.message,
      });
    },
  });

  // Remove user mutation
  const { mutate: removeUser, isPending: isRemoving } = useMutation({
    mutationFn: removeUserMutationFn,
    onSuccess: () => {
      toast.success("User removed successfully!");
      refetchUsers();
      // Also invalidate roles query to update role user counts
      queryClient.invalidateQueries({
        queryKey: ["workspaceRoles", currentWorkspace?.workspace.id],
      });
    },
    onError: (error: any) => {
      toast.error("Failed to remove user", {
        description: error?.data?.message || error?.message,
      });
    },
  });

  const handleEditSubmit = (values: z.infer<typeof updateUserRoleSchema>) => {
    if (!currentWorkspace || !editingUser) return;

    updateUserRole({
      workspaceId: currentWorkspace.workspace.id,
      userId: editingUser.user.id,
      ...values,
    });
  };

  const openEditDialog = (workspaceUser: any) => {
    setEditingUser(workspaceUser);
    editForm.reset({
      roleId: workspaceUser.role.id,
      permissions:
        workspaceUser.permissions?.map((p: any) => p.permission.name) || [],
    });
  };

  const handleRemoveUser = (userId: string) => {
    if (!currentWorkspace) return;

    removeUser({
      workspaceId: currentWorkspace.workspace.id,
      userId,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">
            Manage users, roles, and permissions in your workspace
          </p>
        </div>

        <div className="flex gap-2">
          {can?.createRoles?.() && (
            <RoleCreationModal
              onRoleCreated={() => {
                refetchUsers();
                queryClient.invalidateQueries({
                  queryKey: ["workspaceRoles", currentWorkspace?.workspace.id],
                });
              }}
            />
          )}
          {can?.inviteUsers?.() && (
            <UserInvitationModal
              workspaceId={currentWorkspace?.workspace.id || ""}
              onUserInvited={() => {
                refetchUsers();
                queryClient.invalidateQueries({
                  queryKey: ["workspaceUsers", currentWorkspace?.workspace.id],
                });
              }}
            />
          )}
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Workspace Users</span>
              <Badge variant="secondary" className="ml-2">
                {workspaceUsers.length}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workspaceUsers.map((workspaceUser: any) => (
                  <TableRow key={workspaceUser.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {workspaceUser.user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {workspaceUser.user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {workspaceUser.role?.name || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            workspaceUser.status === "ACTIVE"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            workspaceUser.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : workspaceUser.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {workspaceUser.status === "ACTIVE"
                            ? "Active"
                            : workspaceUser.status === "PENDING"
                            ? "Pending"
                            : "Inactive"}
                        </Badge>
                        {workspaceUser.status === "PENDING" &&
                          workspaceUser.invitation && (
                            <div className="text-xs text-gray-500">
                              Invited{" "}
                              {new Date(
                                workspaceUser.invitation.expiresAt
                              ).toLocaleDateString()}
                            </div>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {can.editUserRoles() && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(workspaceUser)}
                            disabled={workspaceUser.role?.name === "Owner"}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {can.removeUsers() &&
                          workspaceUser.role?.name !== "Owner" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Remove User
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove{" "}
                                    {workspaceUser.user.name} from this
                                    workspace? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleRemoveUser(workspaceUser.user.id)
                                    }
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={isRemoving}
                                  >
                                    {isRemoving ? (
                                      <>
                                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                                        Removing...
                                      </>
                                    ) : (
                                      "Remove User"
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Workspace Roles</span>
              <Badge variant="secondary" className="ml-2">
                {roles.length}
              </Badge>
            </div>
            <div className="text-sm text-gray-500">
              {roles.filter((r: any) => r.isSystem).length} system,{" "}
              {roles.filter((r: any) => !r.isSystem).length} custom
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rolesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 animate-spin" />
            </div>
          ) : roles.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No roles found
              </h3>
              <p className="text-gray-500 mb-4">
                Create your first custom role to get started with role-based
                access control.
              </p>
              {can?.createRoles?.() && (
                <RoleCreationModal
                  onRoleCreated={() => {
                    refetchUsers();
                    queryClient.invalidateQueries({
                      queryKey: [
                        "workspaceRoles",
                        currentWorkspace?.workspace.id,
                      ],
                    });
                  }}
                />
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role: any) => (
                  <TableRow
                    key={role.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="font-medium">{role.name}</div>
                        {role.isSystem && (
                          <Badge variant="secondary" className="text-xs">
                            System
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={role.isSystem ? "default" : "outline"}
                        className={
                          role.isSystem
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {role.isSystem ? "System Role" : "Custom Role"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          {
                            workspaceUsers.filter(
                              (wu: any) => wu.role?.id === role.id
                            ).length
                          }{" "}
                          user
                          {workspaceUsers.filter(
                            (wu: any) => wu.role?.id === role.id
                          ).length !== 1
                            ? "s"
                            : ""}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {role.rolePermissions
                          ?.slice(0, 3)
                          .map((rolePermission: any) => (
                            <Badge
                              key={rolePermission.id}
                              variant="outline"
                              className="text-xs"
                            >
                              {rolePermission.permission.name.replace(
                                /_/g,
                                " "
                              )}
                            </Badge>
                          ))}
                        {(role.rolePermissions?.length || 0) > 3 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant="outline"
                                  className="text-xs cursor-help"
                                >
                                  +{(role.rolePermissions?.length || 0) - 3}{" "}
                                  more
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="max-w-xs">
                                  <p className="font-medium mb-2">
                                    All Permissions:
                                  </p>
                                  <div className="space-y-1">
                                    {role.rolePermissions?.map(
                                      (rolePermission: any) => (
                                        <div
                                          key={rolePermission.id}
                                          className="text-xs"
                                        >
                                          {rolePermission.permission.name.replace(
                                            /_/g,
                                            " "
                                          )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {(!role.rolePermissions ||
                          role.rolePermissions.length === 0) && (
                          <span className="text-xs text-gray-500">
                            No permissions
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {can.editUserRoles() && !role.isSystem && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // TODO: Implement role editing
                              toast.info("Role editing coming soon!");
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {can.editUserRoles() && !role.isSystem && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center space-x-2">
                                  <AlertTriangle className="w-5 h-5 text-red-600" />
                                  <span>Delete Role</span>
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the role "
                                  {role.name}"? This action cannot be undone and
                                  will affect all users assigned to this role.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => {
                                    // TODO: Implement role deletion
                                    toast.info("Role deletion coming soon!");
                                  }}
                                >
                                  Delete Role
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        {role.isSystem && (
                          <span className="text-xs text-gray-500">
                            Protected
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <AlertDialog
        open={!!editingUser}
        onOpenChange={() => setEditingUser(null)}
      >
        <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit User Role & Permissions</AlertDialogTitle>
            <AlertDialogDescription>
              Update {editingUser?.user.name}'s role and permissions in this
              workspace
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit(handleEditSubmit)}
                className="space-y-6"
              >
                {/* Role Selection */}
                <FormField
                  control={editForm.control}
                  name="roleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.map((role: any) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                              {role.isSystem && " (System)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Permissions */}
                <div>
                  <FormLabel className="text-base">Permissions</FormLabel>
                  <div className="mt-3 space-y-4">
                    {permissionGroups.map((group: any) => (
                      <div key={group.group} className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">
                          {group.group}
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {group.permissions.map((permission: any) => (
                            <FormField
                              key={permission.name}
                              control={editForm.control}
                              name="permissions"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(
                                        permission.name
                                      )}
                                      onCheckedChange={(checked) => {
                                        const currentPermissions =
                                          field.value || [];
                                        if (checked) {
                                          field.onChange([
                                            ...currentPermissions,
                                            permission.name,
                                          ]);
                                        } else {
                                          field.onChange(
                                            currentPermissions.filter(
                                              (p) => p !== permission.name
                                            )
                                          );
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-sm font-medium">
                                      {permission.name.replace(/_/g, " ")}
                                    </FormLabel>
                                    <p className="text-xs text-gray-500">
                                      {permission.group || "General"}
                                    </p>
                                  </div>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <FormMessage>
                    {editForm.formState.errors.permissions?.message}
                  </FormMessage>
                </div>
              </form>
            </Form>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setEditingUser(null)}
              disabled={isUpdating}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={editForm.handleSubmit(handleEditSubmit)}
              disabled={!editForm.formState.isValid || isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update User"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagement;
