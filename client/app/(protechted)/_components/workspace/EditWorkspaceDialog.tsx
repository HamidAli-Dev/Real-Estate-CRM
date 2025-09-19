"use client";
import React, { useState, useEffect } from "react";
import { Building2, Loader, Save, X } from "lucide-react";
import { z } from "zod";
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
import { Badge } from "@/components/ui/badge";
import { editWorkspaceMutationFn } from "@/lib/api";
import {
  editWorkspaceResponseType,
  editWorkspaceType,
  userWorkspaceType,
} from "@/types/api.types";
import { editWorkspaceSchema } from "@/lib/validation";

interface EditWorkspaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: userWorkspaceType;
}

const EditWorkspaceDialog: React.FC<EditWorkspaceDialogProps> = ({
  isOpen,
  onClose,
  workspace,
}) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof editWorkspaceSchema>>({
    resolver: zodResolver(editWorkspaceSchema),
    defaultValues: {
      name: workspace.workspace.name,
    },
  });

  // Update form values when workspace changes
  useEffect(() => {
    if (workspace) {
      form.reset({
        name: workspace.workspace.name,
      });
    }
  }, [workspace, form]);

  const { mutate: editWorkspace } = useMutation<
    editWorkspaceResponseType["data"],
    Error,
    { workspaceId: string; name: string }
  >({
    mutationFn: editWorkspaceMutationFn,
    onSuccess: (data) => {
      toast.success("Workspace Updated!", {
        description: `Your workspace "${data.workspace.name}" has been updated successfully.`,
      });

      // Invalidate and refetch workspaces data
      queryClient.invalidateQueries({ queryKey: ["userWorkspaces"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      // Also invalidate the current workspace query to update the trigger button
      queryClient.invalidateQueries({
        queryKey: ["workspace", workspace.workspace.id],
      });

      onClose();
    },
    onError: (error) => {
      const errorMessage =
        error?.message || error?.message || "Failed to update workspace";
      toast.error("Update Failed", {
        description: errorMessage,
      });
    },
  });

  const onSubmit = async (values: editWorkspaceType) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      editWorkspace({
        workspaceId: workspace.workspace.id,
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
            Edit Workspace
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600">
            Update your workspace details
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

              {/* Current Domain Display */}
              {workspace.workspace.domain && (
                <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Current Domain
                      </p>
                      <p className="text-sm text-gray-600 font-mono">
                        {workspace.workspace.domain}.eliteestate.com
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                      Locked
                    </Badge>
                  </div>
                </div>
              )}
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
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Update Workspace
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EditWorkspaceDialog;
