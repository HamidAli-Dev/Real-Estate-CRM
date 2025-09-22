"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { usePermission } from "@/hooks/usePermission";
import {
  createRoleMutationFn,
  getPermissionsQueryFn,
  updateRoleMutationFn,
  getWorkspaceRolesQueryResponseType,
} from "@/lib/api";
import { useWorkspaceContext } from "@/context/workspace-provider";

const roleSchema = z.object({
  name: z
    .string()
    .min(1, "Role name is required")
    .max(50, "Role name must be less than 50 characters"),
  permissions: z
    .array(z.string())
    .min(1, "At least one permission must be selected"),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface RoleModalProps {
  mode: "create" | "edit";
  role?: getWorkspaceRolesQueryResponseType | null;
  onRoleSaved?: () => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const RoleModal = ({
  mode,
  role,
  onRoleSaved,
  trigger,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: RoleModalProps) => {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use external open state if provided, otherwise use internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;
  const { can } = usePermission();
  const { currentWorkspace } = useWorkspaceContext();

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      permissions: [],
    },
  });

  // Reset form when role changes or modal opens
  useEffect(() => {
    if (open && mode === "edit" && role) {
      const rolePermissions =
        role.rolePermissions?.map((rp) => {
          // The API returns permission as an array, but we need the first item
          const permission = Array.isArray(rp.permission) 
            ? rp.permission[0] 
            : rp.permission;
          return permission?.name || "";
        }).filter(Boolean) || [];
      
      form.reset({
        name: role.name || "",
        permissions: rolePermissions,
      });
    } else if (open && mode === "create") {
      form.reset({
        name: "",
        permissions: [],
      });
    }
  }, [open, mode, role, form]);

  // Fetch permissions
  const { data: permissionsData, isLoading: permissionsLoading } = useQuery({
    queryKey: ["permissions"],
    queryFn: getPermissionsQueryFn,
    enabled: open,
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: createRoleMutationFn,
    onSuccess: () => {
      toast.success("Role created successfully");
      form.reset();
      setOpen(false);
      onRoleSaved?.();
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to create role");
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: updateRoleMutationFn,
    onSuccess: () => {
      toast.success("Role updated successfully");
      form.reset();
      setOpen(false);
      onRoleSaved?.();
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update role");
    },
  });

  const onSubmit = (data: RoleFormData) => {
    if (!currentWorkspace?.workspace.id) {
      toast.error("No workspace selected");
      return;
    }

    if (mode === "create") {
      createRoleMutation.mutate({
        ...data,
        workspaceId: currentWorkspace.workspace.id,
      });
    } else if (mode === "edit" && role) {
      updateRoleMutation.mutate({
        roleId: role.id || "",
        workspaceId: currentWorkspace.workspace.id,
        ...data,
      });
    }
  };

  // Data is already grouped, so we just need to transform it for the UI
  const groupedPermissions = permissionsData || {};

  // Check permissions based on mode
  if (mode === "create" && !can?.createRoles?.()) {
    return null;
  }
  if (mode === "edit" && !can?.editUserRoles?.()) {
    return null;
  }

  const isSubmitting =
    createRoleMutation.isPending || updateRoleMutation.isPending;
  const isEditMode = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Role" : "Create New Role"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? `Update the role "${role?.name}" and its permissions.`
              : "Create a new role with specific permissions for your workspace."}
          </DialogDescription>
        </DialogHeader>

        {/* reset form on close */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter role name (e.g., Manager, Agent)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Permissions</FormLabel>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const allPermissions = Object.values(
                        permissionsData || {}
                      ).flat() as string[];
                      form.setValue("permissions", allPermissions);
                    }}
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => form.setValue("permissions", [])}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>

              {permissionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(
                    ([group, permissions]) => {
                      const permList = permissions as string[];

                      return (
                        <div key={group} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium capitalize">
                              {group.replace(/_/g, " ")} Permissions
                            </h4>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4">
                            {permList.map((permission: string) => {
                              return (
                                <FormField
                                  key={permission}
                                  control={form.control}
                                  name="permissions"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(
                                            permission
                                          )}
                                          onCheckedChange={(checked) => {
                                            const currentPermissions =
                                              field.value || [];
                                            if (checked) {
                                              field.onChange([
                                                ...currentPermissions,
                                                permission,
                                              ]);
                                            } else {
                                              field.onChange(
                                                currentPermissions.filter(
                                                  (p: string) =>
                                                    p !== permission
                                                )
                                              );
                                            }
                                          }}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel className="text-sm font-normal">
                                          {permission.replace(/_/g, " ")}
                                        </FormLabel>
                                      </div>
                                    </FormItem>
                                  )}
                                />
                              );
                            })}
                          </div>

                          <Separator />
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting && <Loader className="h-4 w-4 animate-spin" />}
                {isEditMode ? "Update Role" : "Create Role"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// Backward compatibility export
export const RoleCreationModal = ({
  onRoleCreated,
}: {
  onRoleCreated?: () => void;
}) => <RoleModal mode="create" onRoleSaved={onRoleCreated} />;
