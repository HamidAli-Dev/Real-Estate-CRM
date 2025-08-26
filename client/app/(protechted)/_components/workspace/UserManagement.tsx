"use client";

import { useState } from "react";
import {
  Plus,
  Users,
  Shield,
  Edit,
  Trash2,
  Loader,
  AlertTriangle,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
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

import { useWorkspaceContext } from "@/context/workspace-provider";
import { useAuthContext } from "@/context/auth-provider";
import {
  getWorkspaceUsersQueryFn,
  inviteUserMutationFn,
  updateUserRoleMutationFn,
  removeUserMutationFn,
} from "@/lib/api";
import {
  inviteUserType,
  updateUserRoleType,
  permissionGroupType,
} from "@/types/api.types";

const inviteUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["Admin", "Manager", "Agent"]),
  permissions: z
    .array(z.string())
    .min(1, "At least one permission is required"),
});

const updateUserRoleSchema = z.object({
  role: z.enum(["Admin", "Manager", "Agent"]),
  permissions: z
    .array(z.string())
    .min(1, "At least one permission is required"),
});

// Permission groups for better organization
const permissionGroups: permissionGroupType[] = [
  {
    group: "Properties",
    permissions: [
      {
        value: "VIEW_PROPERTIES",
        label: "View Properties",
        description: "Can view property listings",
      },
      {
        value: "CREATE_PROPERTIES",
        label: "Create Properties",
        description: "Can create new properties",
      },
      {
        value: "EDIT_PROPERTIES",
        label: "Edit Properties",
        description: "Can modify existing properties",
      },
      {
        value: "DELETE_PROPERTIES",
        label: "Delete Properties",
        description: "Can remove properties",
      },
    ],
  },
  {
    group: "Leads",
    permissions: [
      {
        value: "VIEW_LEADS",
        label: "View Leads",
        description: "Can view lead information",
      },
      {
        value: "CREATE_LEADS",
        label: "Create Leads",
        description: "Can create new leads",
      },
      {
        value: "EDIT_LEADS",
        label: "Edit Leads",
        description: "Can modify lead details",
      },
      {
        value: "DELETE_LEADS",
        label: "Delete Leads",
        description: "Can remove leads",
      },
    ],
  },
  {
    group: "Deals",
    permissions: [
      {
        value: "VIEW_DEALS",
        label: "View Deals",
        description: "Can view deal information",
      },
      {
        value: "CREATE_DEALS",
        label: "Create Deals",
        description: "Can create new deals",
      },
      {
        value: "EDIT_DEALS",
        label: "Edit Deals",
        description: "Can modify deal details",
      },
      {
        value: "DELETE_DEALS",
        label: "Delete Deals",
        description: "Can remove deals",
      },
    ],
  },
  {
    group: "User Management",
    permissions: [
      {
        value: "VIEW_USERS",
        label: "View Users",
        description: "Can see other users in workspace",
      },
      {
        value: "INVITE_USERS",
        label: "Invite Users",
        description: "Can invite new users",
      },
      {
        value: "EDIT_USER_ROLES",
        label: "Edit User Roles",
        description: "Can modify user roles and permissions",
      },
      {
        value: "REMOVE_USERS",
        label: "Remove Users",
        description: "Can remove users from workspace",
      },
    ],
  },
  {
    group: "Workspace",
    permissions: [
      {
        value: "VIEW_SETTINGS",
        label: "View Settings",
        description: "Can view workspace settings",
      },
      {
        value: "EDIT_SETTINGS",
        label: "Edit Settings",
        description: "Can modify workspace settings",
      },
      {
        value: "VIEW_ANALYTICS",
        label: "View Analytics",
        description: "Can access analytics and reports",
      },
      {
        value: "EXPORT_REPORTS",
        label: "Export Reports",
        description: "Can export data and reports",
      },
    ],
  },
];

const UserManagement = () => {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { currentWorkspace } = useWorkspaceContext();
  const { user } = useAuthContext();

  const inviteForm = useForm<{
    name: string;
    email: string;
    role: "Admin" | "Manager" | "Agent";
    permissions: string[];
  }>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "Agent",
      permissions: [],
    },
  });

  const editForm = useForm<updateUserRoleType>({
    resolver: zodResolver(updateUserRoleSchema),
    defaultValues: {
      role: "Agent",
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
  });

  // Invite user mutation
  const { mutate: inviteUser, isPending: isInviting } = useMutation({
    mutationFn: inviteUserMutationFn,
    onSuccess: () => {
      toast.success("User invited successfully!");
      setIsInviteOpen(false);
      inviteForm.reset();
      refetchUsers();
    },
    onError: (error: any) => {
      toast.error("Failed to invite user", {
        description: error?.data?.message || error?.message,
      });
    },
  });

  // Update user role mutation
  const { mutate: updateUserRole, isPending: isUpdating } = useMutation({
    mutationFn: updateUserRoleMutationFn,
    onSuccess: () => {
      toast.success("User role updated successfully!");
      setEditingUser(null);
      editForm.reset();
      refetchUsers();
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
    },
    onError: (error: any) => {
      toast.error("Failed to remove user", {
        description: error?.data?.message || error?.message,
      });
    },
  });

  const handleInviteSubmit = (values: {
    name: string;
    email: string;
    role: "Admin" | "Manager" | "Agent";
    permissions: string[];
  }) => {
    if (!currentWorkspace) return;

    inviteUser({
      workspaceId: currentWorkspace.workspace.id,
      ...values,
    });
  };

  const handleEditSubmit = (values: updateUserRoleType) => {
    if (!currentWorkspace || !editingUser) return;

    updateUserRole({
      workspaceId: currentWorkspace.workspace.id,
      userId: editingUser.user.id,
      ...values,
    });
  };

  const handleRemoveUser = (userId: string) => {
    if (!currentWorkspace) return;

    removeUser({
      workspaceId: currentWorkspace.workspace.id,
      userId,
    });
  };

  const openEditDialog = (user: any) => {
    setEditingUser(user);
    editForm.reset({
      role: user.role,
      permissions: user.permissions.map((p: any) => p.permission),
    });
  };

  const canManageUsers = user?.role === "Owner" || user?.role === "Admin";
  const workspaceUsers = usersData || [];

  if (!canManageUsers) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Access Denied</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            You don't have permission to manage users in this workspace.
          </p>
        </CardContent>
      </Card>
    );
  }

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

        <AlertDialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <AlertDialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add New User</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle>Add New User</AlertDialogTitle>
              <AlertDialogDescription>
                Add a new user to your workspace and assign their role and
                permissions
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="py-4">
              <Form {...inviteForm}>
                <form
                  onSubmit={inviteForm.handleSubmit(handleInviteSubmit)}
                  className="space-y-6"
                >
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={inviteForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name (Role Name)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="John Doe"
                              disabled={isInviting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={inviteForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="john@example.com"
                              disabled={isInviting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Role Selection */}
                  <FormField
                    control={inviteForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Admin">
                              Admin - Full access to workspace
                            </SelectItem>
                            <SelectItem value="Manager">
                              Manager - Manage properties and leads
                            </SelectItem>
                            <SelectItem value="Agent">
                              Agent - Basic access to assigned tasks
                            </SelectItem>
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
                      {permissionGroups.map((group) => (
                        <div
                          key={group.group}
                          className="border rounded-lg p-4"
                        >
                          <h4 className="font-medium text-gray-900 mb-3">
                            {group.group}
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            {group.permissions.map((permission) => (
                              <FormField
                                key={permission.value}
                                control={inviteForm.control}
                                name="permissions"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(
                                          permission.value
                                        )}
                                        onCheckedChange={(checked) => {
                                          const currentPermissions =
                                            field.value || [];
                                          if (checked) {
                                            field.onChange([
                                              ...currentPermissions,
                                              permission.value,
                                            ]);
                                          } else {
                                            field.onChange(
                                              currentPermissions.filter(
                                                (p) => p !== permission.value
                                              )
                                            );
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel className="text-sm font-medium">
                                        {permission.label}
                                      </FormLabel>
                                      <p className="text-xs text-gray-500">
                                        {permission.description}
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
                      {inviteForm.formState.errors.permissions?.message}
                    </FormMessage>
                  </div>
                </form>
              </Form>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => setIsInviteOpen(false)}
                disabled={isInviting}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={inviteForm.handleSubmit(handleInviteSubmit)}
                disabled={!inviteForm.formState.isValid || isInviting}
              >
                {isInviting ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Inviting...
                  </>
                ) : (
                  "Invite User"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Workspace Users ({workspaceUsers.length})</span>
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
                  <TableHead>Permissions</TableHead>
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
                      <Badge variant="secondary">{workspaceUser.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {workspaceUser.permissions
                          .slice(0, 3)
                          .map((permission: any) => (
                            <Badge
                              key={permission.id}
                              variant="outline"
                              className="text-xs"
                            >
                              {permission.permission.replace(/_/g, " ")}
                            </Badge>
                          ))}
                        {workspaceUser.permissions.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{workspaceUser.permissions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(workspaceUser)}
                          disabled={workspaceUser.role === "Owner"}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {workspaceUser.role !== "Owner" && (
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
                                <AlertDialogTitle>Remove User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove{" "}
                                  {workspaceUser.user.name} from this workspace?
                                  This action cannot be undone.
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
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Admin">
                            Admin - Full access to workspace
                          </SelectItem>
                          <SelectItem value="Manager">
                            Manager - Manage properties and leads
                          </SelectItem>
                          <SelectItem value="Agent">
                            Agent - Basic access to assigned tasks
                          </SelectItem>
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
                    {permissionGroups.map((group) => (
                      <div key={group.group} className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">
                          {group.group}
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {group.permissions.map((permission) => (
                            <FormField
                              key={permission.value}
                              control={editForm.control}
                              name="permissions"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(
                                        permission.value
                                      )}
                                      onCheckedChange={(checked) => {
                                        const currentPermissions =
                                          field.value || [];
                                        if (checked) {
                                          field.onChange([
                                            ...currentPermissions,
                                            permission.value,
                                          ]);
                                        } else {
                                          field.onChange(
                                            currentPermissions.filter(
                                              (p) => p !== permission.value
                                            )
                                          );
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-sm font-medium">
                                      {permission.label}
                                    </FormLabel>
                                    <p className="text-xs text-gray-500">
                                      {permission.description}
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
