"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, Loader } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
import { Label } from "@/components/ui/label";

import { useWorkspaceContext } from "@/context/workspace-provider";
import { useAuthContext } from "@/context/auth-provider";
import { deleteWorkspaceMutationFn } from "@/lib/api";

interface DeleteWorkspaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeleteWorkspaceDialog = ({
  isOpen,
  onClose,
}: DeleteWorkspaceDialogProps) => {
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { currentWorkspace, userWorkspaces, switchWorkspace } =
    useWorkspaceContext();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const router = useRouter();

  const workspaceName = currentWorkspace?.workspace.name || "";
  const requiredText = `delete ${workspaceName}`;
  const isConfirmed = confirmationText === requiredText;

  const { mutate: deleteWorkspace, isPending } = useMutation({
    mutationFn: deleteWorkspaceMutationFn,
    onSuccess: () => {
      toast.success("Workspace Deleted", {
        description: `"${workspaceName}" has been permanently deleted along with all associated data.`,
      });

      // Invalidate all workspace-related queries
      queryClient.invalidateQueries({ queryKey: ["userWorkspaces"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      // Close the dialog
      onClose();
      setConfirmationText("");

      // Switch to another workspace if available
      const otherWorkspaces = userWorkspaces.filter(
        (ws) => ws.workspace.id !== currentWorkspace?.workspace.id
      );

      if (otherWorkspaces.length > 0) {
        switchWorkspace(otherWorkspaces[0].workspace.id);
        router.push("/dashboard");
      } else {
        // No more workspaces, redirect to home
        router.push("/");
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.data?.message || error?.message || "Failed to delete workspace";
      toast.error("Deletion Failed", {
        description: errorMessage,
      });
      setIsDeleting(false);
    },
  });

  const handleDelete = () => {
    if (!isConfirmed || !currentWorkspace) return;

    setIsDeleting(true);
    deleteWorkspace(currentWorkspace.workspace.id);
  };

  const handleClose = () => {
    if (!isPending && !isDeleting) {
      setConfirmationText("");
      onClose();
    }
  };

  // Only show for Owners
  if (user?.role?.name !== "Owner") {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          <AlertDialogTitle className="text-xl font-semibold text-gray-900">
            Delete Workspace
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600">
            This action cannot be undone. This will permanently delete the{" "}
            <span className="font-semibold text-red-600">
              "{workspaceName}"
            </span>{" "}
            workspace and all of its data.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4 space-y-4">
          {/* Warning Section */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">This will delete:</p>
                <ul className="space-y-1 text-amber-700">
                  <li>• All properties and listings</li>
                  <li>• All leads and deals</li>
                  <li>• All user accounts and permissions</li>
                  <li>• All workspace settings and data</li>
                  <li>• All files and documents</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <Label
              htmlFor="confirmation"
              className="text-sm font-medium text-gray-700"
            >
              Type{" "}
              <span className="font-mono text-red-600">{requiredText}</span> to
              confirm
            </Label>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Type the confirmation text"
              className="border-gray-300 focus:border-red-500 focus:ring-red-500"
              disabled={isPending || isDeleting}
            />
          </div>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel
            onClick={handleClose}
            disabled={isPending || isDeleting}
            className="w-full sm:w-auto"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!isConfirmed || isPending || isDeleting}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            {isPending || isDeleting ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Workspace
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteWorkspaceDialog;
