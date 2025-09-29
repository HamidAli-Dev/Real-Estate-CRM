"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, CheckSquare, Square } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useWorkspaceContext } from "@/context/workspace-provider";
import API from "@/lib/axios-client";

const assignPermissionsSchema = z.object({
  roleId: z.string().min(1, "Please select a role"),
  permissions: z
    .array(z.string())
    .min(1, "Please select at least one permission"),
});

type AssignPermissionsFormData = z.infer<typeof assignPermissionsSchema>;

interface AssignPermissionsModalProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

interface Role {
  id: string;
  name: string;
  isSystem: boolean;
  rolePermissions: Array<{
    permission: {
      id: string;
      name: string;
      group: string;
    };
  }>;
  userCount: number;
}

interface Permissions {
  [group: string]: string[];
}

const filterOutOwnerRole = (role: {
  id: string;
  name: string;
  isSystem: boolean;
}) => {
  return !(role.isSystem && role.name === "Owner") && role.name !== "Owner";
};

export const AssignPermissionsModal: React.FC<AssignPermissionsModalProps> = ({
  children,
  onSuccess,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permissions>({});
  const { currentWorkspace } = useWorkspaceContext();
  const queryClient = useQueryClient();

  const form = useForm<AssignPermissionsFormData>({
    resolver: zodResolver(assignPermissionsSchema),
    defaultValues: {
      roleId: "",
      permissions: [],
    },
  });

  // Fetch available roles
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["workspace-roles", currentWorkspace?.id],
    queryFn: async () => {
      const response = await API.get(
        `/roles/workspace/${currentWorkspace?.id}`
      );
      return response.data.data as Role[];
    },
    enabled: !!currentWorkspace?.id && isOpen,
  });

  // Fetch available permissions
  const { data: permissions = {}, isLoading: permissionsLoading } = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const response = await API.get("/roles/permissions");
      return response.data.data as Permissions;
    },
    enabled: isOpen,
  });

  // Update permissions when data is fetched
  useEffect(() => {
    if (permissions && Object.keys(permissions).length > 0) {
      setAllPermissions(permissions);
    }
  }, [permissions]);

  // Handle role selection
  const handleRoleSelect = (roleId: string) => {
    const selectedRole = roles.find((role) => role.id === roleId);
    if (selectedRole) {
      const currentPermissions = selectedRole.rolePermissions.map(
        (rp) => rp.permission.name
      );
      setSelectedPermissions(currentPermissions);
      form.setValue("permissions", currentPermissions);
    } else {
      setSelectedPermissions([]);
      form.setValue("permissions", []);
    }
  };

  // Handle permission toggle
  const handlePermissionToggle = (permission: string) => {
    const newPermissions = selectedPermissions.includes(permission)
      ? selectedPermissions.filter((p) => p !== permission)
      : [...selectedPermissions, permission];

    setSelectedPermissions(newPermissions);
    form.setValue("permissions", newPermissions);
  };

  // Handle select all permissions
  const handleSelectAll = () => {
    const allPermissionNames = Object.values(allPermissions).flat();
    setSelectedPermissions(allPermissionNames);
    form.setValue("permissions", allPermissionNames);
  };

  // Handle deselect all permissions
  const handleDeselectAll = () => {
    setSelectedPermissions([]);
    form.setValue("permissions", []);
  };

  // Update role permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: async (data: AssignPermissionsFormData) => {
      const response = await API.put(`/roles/${data.roleId}/permissions`, {
        permissions: data.permissions,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Role permissions updated successfully");
      form.reset();
      setSelectedPermissions([]);
      setIsOpen(false);
      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ["workspace-roles"] });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update permissions");
    },
  });

  const onSubmit = async (data: AssignPermissionsFormData) => {
    updatePermissionsMutation.mutate(data);
  };

  const selectedRole = roles.find((role) => role.id === form.watch("roleId"));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Assign Role Permissions
          </DialogTitle>
          <DialogDescription>
            Select permissions for a role. Users with this role will have access
            to the selected features.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Role</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleRoleSelect(value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a role to assign permissions" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rolesLoading ? (
                        <SelectItem value="" disabled>
                          Loading roles...
                        </SelectItem>
                      ) : (
                        roles.filter(filterOutOwnerRole).map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            <div className="flex items-center gap-2">
                              {role.name}
                              {role.isSystem && (
                                <Badge variant="secondary" className="text-xs">
                                  System
                                </Badge>
                              )}
                              <span className="text-muted-foreground text-xs">
                                ({role.userCount} users)
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedRole && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">
                      Permissions for {selectedRole.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Select the permissions this role should have
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                    >
                      <CheckSquare className="h-4 w-4 mr-1" />
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDeselectAll}
                    >
                      <Square className="h-4 w-4 mr-1" />
                      Deselect All
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {permissionsLoading ? (
                    <div className="text-center py-4">
                      Loading permissions...
                    </div>
                  ) : (
                    Object.entries(allPermissions).map(
                      ([group, groupPermissions]) => (
                        <div key={group} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium capitalize">{group}</h4>
                            <Badge variant="outline" className="text-xs">
                              {groupPermissions.length} permissions
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 gap-2 pl-4">
                            {groupPermissions.map((permission) => (
                              <div
                                key={permission}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={permission}
                                  checked={selectedPermissions.includes(
                                    permission
                                  )}
                                  onCheckedChange={() =>
                                    handlePermissionToggle(permission)
                                  }
                                />
                                <label
                                  htmlFor={permission}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {permission
                                    .replace(/_/g, " ")
                                    .toLowerCase()
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </label>
                              </div>
                            ))}
                          </div>
                          <Separator />
                        </div>
                      )
                    )
                  )}
                </div>
              </>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updatePermissionsMutation.isPending || !selectedRole}
              >
                {updatePermissionsMutation.isPending
                  ? "Updating..."
                  : "Update Permissions"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
