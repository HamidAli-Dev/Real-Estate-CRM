"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader, Plus, X } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { usePermission } from "@/hooks/usePermission";
import { createRoleMutationFn, getPermissionsQueryFn } from "@/lib/api";
import { useWorkspaceContext } from "@/context/workspace-provider";

const createRoleSchema = z.object({
  name: z
    .string()
    .min(1, "Role name is required")
    .max(50, "Role name must be less than 50 characters"),
  permissions: z
    .array(z.string())
    .min(1, "At least one permission must be selected"),
});

type CreateRoleFormData = z.infer<typeof createRoleSchema>;

interface RoleCreationModalProps {
  onRoleCreated?: () => void;
}

export const RoleCreationModal = ({
  onRoleCreated,
}: RoleCreationModalProps) => {
  const [open, setOpen] = useState(false);
  const { can } = usePermission();
  const { currentWorkspace } = useWorkspaceContext();

  const form = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: "",
      permissions: [],
    },
  });

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
      onRoleCreated?.();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create role");
    },
  });

  const onSubmit = (data: CreateRoleFormData) => {
    if (!currentWorkspace?.workspace.id) {
      toast.error("No workspace selected");
      return;
    }

    createRoleMutation.mutate({
      ...data,
      workspaceId: currentWorkspace.workspace.id,
    });
  };

  const handleSelectAll = (group: string) => {
    const groupPermissions = permissionsData?.[group] || [];

    const currentPermissions = form.getValues("permissions");
    const newPermissions = [
      ...new Set([...currentPermissions, ...groupPermissions]),
    ];
    form.setValue("permissions", newPermissions);
  };

  const handleDeselectAll = (group: string) => {
    const groupPermissions = permissionsData?.[group] || [];

    const currentPermissions = form.getValues("permissions");
    const newPermissions = currentPermissions.filter(
      (p) => !groupPermissions.includes(p)
    );
    form.setValue("permissions", newPermissions);
  };

  const isGroupSelected = (group: string) => {
    const groupPermissions = permissionsData?.[group] || [];

    const currentPermissions = form.getValues("permissions");
    return groupPermissions.every((p: string) =>
      currentPermissions.includes(p)
    );
  };

  const isGroupPartiallySelected = (group: string) => {
    const groupPermissions = permissionsData?.[group] || [];

    const currentPermissions = form.getValues("permissions");
    const selectedCount = groupPermissions.filter((p: string) =>
      currentPermissions.includes(p)
    ).length;
    return selectedCount > 0 && selectedCount < groupPermissions.length;
  };

  const hasAnySelectedInGroup = (group: string) => {
    const groupPermissions = permissionsData?.[group] || [];
    const currentPermissions = form.getValues("permissions");
    return groupPermissions.some((p: string) => currentPermissions.includes(p));
  };

  const isAllSelectedInGroup = (group: string) => {
    const groupPermissions = permissionsData?.[group] || [];
    const currentPermissions = form.getValues("permissions");
    return groupPermissions.every((p: string) =>
      currentPermissions.includes(p)
    );
  };

  // Data is already grouped, so we just need to transform it for the UI
  const groupedPermissions = permissionsData || {};

  if (!can?.createRoles?.()) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Create Role
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Role</DialogTitle>
          <DialogDescription>
            Create a new role with specific permissions for your workspace.
          </DialogDescription>
        </DialogHeader>

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
                    ([group, permissions]: [string, any]) => (
                      <div key={group} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium capitalize">
                            {group.replace(/_/g, " ")} Permissions
                          </h4>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSelectAll(group)}
                              disabled={isAllSelectedInGroup(group)}
                            >
                              Select All
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeselectAll(group)}
                              disabled={!hasAnySelectedInGroup(group)}
                            >
                              Deselect All
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4">
                          {permissions.map((permission: string) => (
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
                                              (p: string) => p !== permission
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
                          ))}
                        </div>

                        <Separator />
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createRoleMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createRoleMutation.isPending}
                className="gap-2"
              >
                {createRoleMutation.isPending && (
                  <Loader className="h-4 w-4 animate-spin" />
                )}
                Create Role
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
