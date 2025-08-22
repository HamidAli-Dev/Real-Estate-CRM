"use client";

import { useState } from "react";
import { ChevronDown, Building2, Plus, Loader } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useWorkspaceContext } from "@/context/workspace-provider";
import { useAuthContext } from "@/context/auth-provider";
import { createWorkspaceMutationFn } from "@/lib/api";

const createWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Workspace name must be at least 3 characters" })
    .max(100, { message: "Workspace name cannot exceed 100 characters" }),
});

const WorkspaceSelector = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { currentWorkspace, userWorkspaces, switchWorkspace } =
    useWorkspaceContext();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof createWorkspaceSchema>>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
    },
  });

  const { mutate: createWorkspace, isPending } = useMutation({
    mutationFn: createWorkspaceMutationFn,
    onSuccess: (data) => {
      toast.success("Workspace Created!", {
        description: `Your workspace "${data.data.workspace.name}" has been created successfully.`,
      });
      setIsCreateOpen(false);
      form.reset();

      // Invalidate and refetch workspaces
      queryClient.invalidateQueries({ queryKey: ["userWorkspaces"] });

      // Switch to the new workspace
      switchWorkspace(data.data.workspace.id);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.data?.message || error?.message || "Failed to create workspace";
      toast.error("Creation Failed", {
        description: errorMessage,
      });
    },
  });

  const onSubmit = (values: z.infer<typeof createWorkspaceSchema>) => {
    createWorkspace(values);
  };

  const handleCancel = () => {
    setIsCreateOpen(false);
    form.reset();
  };

  if (!currentWorkspace) {
    return (
      <div className="flex items-center space-x-2">
        <Loader className="w-4 h-4 animate-spin" />
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center space-x-2 px-3 py-2 h-auto"
          >
            <Building2 className="w-4 h-4" />
            <span className="font-medium">
              {currentWorkspace.workspace.name}
            </span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="start">
          <div className="px-2 py-1.5 text-sm font-medium text-gray-900">
            Switch Workspace
          </div>
          <DropdownMenuSeparator />

          {userWorkspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.workspace.id}
              onClick={() => switchWorkspace(workspace.workspace.id)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-gray-500" />
                <span>{workspace.workspace.name}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {workspace.role}
              </Badge>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          {/* Create new workspace option - only for Owners */}
          {user?.role === "Owner" && (
            <AlertDialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Workspace</span>
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle>Create New Workspace</AlertDialogTitle>
                  <AlertDialogDescription>
                    Set up a new workspace for your business
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-4">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Workspace Name</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="e.g., Downtown Properties"
                                disabled={isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={handleCancel}
                    disabled={isPending}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={!form.formState.isValid || isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Workspace"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default WorkspaceSelector;
