"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown,
  Building2,
  Plus,
  Loader,
  Trash2,
  Search,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import DeleteWorkspaceDialog from "./DeleteWorkspaceDialog";

const createWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Workspace name must be at least 3 characters" })
    .max(100, { message: "Workspace name cannot exceed 100 characters" }),
});

const WorkspaceSelector = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { currentWorkspace, userWorkspaces, switchWorkspace, isLoading } =
    useWorkspaceContext();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof createWorkspaceSchema>>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
    },
  });

  // Filter workspaces based on search query
  const filteredWorkspaces = useMemo(() => {
    let filtered = userWorkspaces;
    if (searchQuery.trim()) {
      filtered = userWorkspaces.filter((workspace) =>
        workspace.workspace.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }
    // Move current workspace to top
    if (currentWorkspace) {
      filtered = [
        ...filtered.filter(
          (w) => w.workspace.id === currentWorkspace.workspace.id
        ),
        ...filtered.filter(
          (w) => w.workspace.id !== currentWorkspace.workspace.id
        ),
      ];
    }
    return filtered;
  }, [userWorkspaces, searchQuery, currentWorkspace]);

  const { mutate: createWorkspace, isPending } = useMutation({
    mutationFn: createWorkspaceMutationFn,
    onSuccess: (data) => {
      // Defensive check for data structure
      if (!data || !data.workspace) {
        console.error("❌ Unexpected data structure:", data);
        toast.error("Creation Failed", {
          description: "Received unexpected response format from server",
        });
        return;
      }

      toast.success("Workspace Created!", {
        description: `Your workspace "${data.workspace.name}" has been created successfully.`,
      });
      setIsCreateOpen(false);
      form.reset();

      // Invalidate and refetch workspaces
      queryClient.invalidateQueries({ queryKey: ["userWorkspaces"] });

      // Switch to the new workspace
      switchWorkspace(data.workspace.id);
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

  const handleWorkspaceSwitch = (workspaceId: string) => {
    switchWorkspace(workspaceId);
    setSearchQuery(""); // Clear search when switching
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <Loader className="w-4 h-4 animate-spin" />
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  if ((!currentWorkspace && !isLoading) || userWorkspaces.length === 0) {
    return (
      <div className="flex items-center space-x-2">
        {/* <Loader className="w-4 h-4 animate-spin" /> */}
        <span className="text-sm text-gray-500">not found</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <DropdownMenu onOpenChange={() => setSearchQuery("")}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between px-3 py-2 h-auto bg-white hover:bg-gray-50 border-gray-200"
          >
            <div className="flex items-center space-x-2 min-w-0">
              <Building2 className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <span className="font-medium text-sm text-gray-900 truncate">
                {currentWorkspace?.workspace.name}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="start" side="right">
          {/* Search Section */}
          <div className="px-3 py-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search workspaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-3 py-2 h-9 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Workspace List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredWorkspaces.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-gray-500">
                {searchQuery
                  ? "No workspaces found"
                  : "No workspaces available"}
              </div>
            ) : (
              filteredWorkspaces.map((workspace) => {
                const isCurrentWorkspace =
                  workspace.workspace.id === currentWorkspace?.workspace.id;
                return (
                  <DropdownMenuItem
                    key={workspace.workspace.id}
                    onClick={() =>
                      handleWorkspaceSwitch(workspace.workspace.id)
                    }
                    className={`flex items-center justify-between cursor-pointer py-2 px-3 ${
                      isCurrentWorkspace
                        ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <Building2
                        className={`w-4 h-4 flex-shrink-0 ${
                          isCurrentWorkspace ? "text-blue-600" : "text-gray-500"
                        }`}
                      />
                      <span
                        className={`truncate ${
                          isCurrentWorkspace ? "font-medium" : ""
                        }`}
                      >
                        {workspace.workspace.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Badge
                        variant={isCurrentWorkspace ? "default" : "secondary"}
                        className={`text-xs ${
                          isCurrentWorkspace ? "bg-blue-600 text-white" : ""
                        }`}
                      >
                        {workspace.role}
                      </Badge>
                      {isCurrentWorkspace && (
                        <span className="text-xs text-blue-600 font-medium">
                          Current
                        </span>
                      )}
                    </div>
                  </DropdownMenuItem>
                );
              })
            )}
          </div>

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

          {/* Delete workspace option - only for Owners */}
          {user?.role === "Owner" && userWorkspaces.length > 1 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="flex items-center space-x-2 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 border-t border-gray-100 pt-2 mt-2"
                onClick={() => setIsDeleteOpen(true)}
              >
                <Trash2 className="w-4 h-4" />
                <span className="font-medium">Delete Workspace</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Workspace Dialog */}
      <DeleteWorkspaceDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
      />
    </div>
  );
};

export default WorkspaceSelector;
