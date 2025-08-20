"use client";
import React, { useState } from "react";
import { Bell, Loader, Building2, Globe } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/context/auth-provider";

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
import { Button, buttonVariants } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createWorkspaceMutationFn } from "@/lib/api";

const createWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Business name must be at least 3 characters" }),
  domain: z
    .string()
    .trim()
    .min(3, { message: "Domain must be at least 3 characters" })
    .regex(/^[a-zA-Z0-9-]+$/, {
      message: "Domain can only contain letters, numbers, and hyphens",
    })
    .transform((val) => val.toLowerCase()),
});

const TopBar = () => {
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);

  const { isLoading, user, logout, refreshAuth } = useAuthContext();
  const queryClient = useQueryClient();

  // Check if user has Owner role or if they're in a workspace
  const canCreateWorkspace = user?.role === "Owner" || !user?.workspaceId;

  const form = useForm<z.infer<typeof createWorkspaceSchema>>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
      domain: "",
    },
  });

  const { mutate: createWorkspace, isPending } = useMutation({
    mutationFn: createWorkspaceMutationFn,
    onSuccess: (data) => {
      toast.success("Workspace Created!", {
        description: `Your workspace "${data.data.workspace.name}" has been created successfully.`,
      });
      setIsWorkspaceOpen(false);
      form.reset();

      // Invalidate and refetch user data to get updated workspace info
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.data?.message || error?.message || "Failed to create workspace";
      toast.error("Creation Failed", {
        description: errorMessage,
      });
    },
  });

  async function onSubmit(values: z.infer<typeof createWorkspaceSchema>) {
    console.log("Workspace creation values:", values);
    createWorkspace(values);
  }

  const handleLogout = async () => {
    await logout();
  };

  const handleCancel = () => {
    setIsWorkspaceOpen(false);
    form.reset();
  };

  return (
    <div className="px-6 py-4 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900">Estate Elte CRM</h4>
        <div className="flex items-center space-x-4">
          {/* Show Create Workspace button for Owners or users without workspaces */}
          {canCreateWorkspace && (
            <AlertDialog
              open={isWorkspaceOpen}
              onOpenChange={setIsWorkspaceOpen}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 px-4 py-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Create Workspace</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-md">
                <AlertDialogHeader className="text-center">
                  <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <AlertDialogTitle className="text-xl font-semibold text-gray-900">
                    Create New Workspace
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-600">
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
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Business Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                {...field}
                                placeholder="e.g., Samsung Electronics"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isPending}
                              />
                            </FormControl>
                            <FormMessage className="text-sm text-red-600" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="domain"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Subdomain
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  placeholder="yourcompany"
                                  className="w-full px-3 py-2 pr-24 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  disabled={isPending}
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                  <span className="text-sm text-gray-500">
                                    .eliteestate.com
                                  </span>
                                </div>
                              </div>
                            </FormControl>
                            <div className="text-xs text-gray-500 mt-1">
                              Your workspace will be available at:{" "}
                              <span className="font-mono text-blue-600">
                                {field.value
                                  ? `${field.value}.eliteestate.com`
                                  : "yourcompany.eliteestate.com"}
                              </span>
                            </div>
                            <FormMessage className="text-sm text-red-600" />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </div>

                <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
                  <AlertDialogCancel
                    onClick={handleCancel}
                    className="w-full sm:w-auto order-2 sm:order-1"
                    disabled={isPending}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={!form.formState.isValid || isPending}
                    className={buttonVariants({
                      variant: "customPrimary",
                      className: "w-full sm:w-auto order-1 sm:order-2",
                    })}
                  >
                    {isPending ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Building2 className="w-4 h-4 mr-2" />
                        Create Workspace
                      </>
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <div className="relative">
            <Button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer bg-transparent">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                2
              </span>
            </Button>
          </div>
          <DropdownMenu open={isOpenDropdown} onOpenChange={setIsOpenDropdown}>
            <DropdownMenuTrigger asChild className="cursor-pointer">
              <div className="flex items-center gap-1">
                <Badge className="rounded-full p-1">
                  {user?.name?.charAt(0).toUpperCase()}
                </Badge>
                <div>{user?.name}</div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={`${isOpenDropdown && "mr-6"}`}>
              <DropdownMenuItem className="text-red-700" onClick={handleLogout}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
