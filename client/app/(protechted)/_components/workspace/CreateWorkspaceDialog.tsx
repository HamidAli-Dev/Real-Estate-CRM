"use client";
import React, { useState } from "react";
import { z } from "zod";
import { Building2, Globe, Loader, Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
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
import { createWorkspaceType } from "@/types/api.types";
import { useWorkspaceContext } from "@/context/workspace-provider";
import { createWorkspaceSchema } from "@/lib/validation";

interface CreateWorkspaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateWorkspaceDialog: React.FC<CreateWorkspaceDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const { switchWorkspace } = useWorkspaceContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof createWorkspaceSchema>>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
    },
  });

  const { mutate: createWorkspace } = useMutation({
    mutationFn: createWorkspaceMutationFn,
    onSuccess: (data) => {
      toast.success("Workspace Created!", {
        description: `Your workspace "${data.data.workspace.name}" has been created successfully.`,
      });

      // Invalidate and refetch workspaces data
      queryClient.invalidateQueries({ queryKey: ["userWorkspaces"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      // Close the dialog
      onClose();

      // Switch to the newly created workspace
      if (data.data.workspace.id) {
        switchWorkspace(data.data.workspace.id);
      }
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to create workspace";
      toast.error("Creation Failed", {
        description: errorMessage,
      });
    },
  });

  const onSubmit = async (values: createWorkspaceType) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      createWorkspace({
        name: values.name,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <AlertDialogTitle className="text-xl font-semibold text-gray-900">
            Create Your First Workspace
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600">
            Get started by creating your first workspace to manage your real
            estate business
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        {...field}
                        placeholder="e.g., Samsung Electronics"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-600" />
                  </FormItem>
                )}
              />

              <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                <div className="flex items-start space-x-2">
                  <Globe className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium">Workspace Setup</p>
                    <p className="text-blue-600">
                      This will create your first workspace where you can manage
                      properties, leads, and deals.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </div>

        <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={!form.formState.isValid || isSubmitting}
            className="w-full sm:w-auto order-1 sm:order-2 bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Workspace
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CreateWorkspaceDialog;
