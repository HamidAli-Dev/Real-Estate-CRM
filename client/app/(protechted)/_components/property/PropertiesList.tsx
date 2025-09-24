import { toast } from "sonner";
import { Loader } from "lucide-react";
import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
} from "@/components/ui/alert-dialog";
import { deletePropertyMutationFn, getPropertiesQueryFn } from "@/lib/api";
import { propertyType } from "@/types/api.types";
import PropertyCard from "./PropertyCard";
import { useWorkspaceContext } from "@/context/workspace-provider";
import { usePermission } from "@/hooks/usePermission";

interface PropertiesListProps {
  onEditProperty: (property: propertyType) => void;
}

const PropertiesList = ({ onEditProperty }: PropertiesListProps) => {
  const { currentWorkspace } = useWorkspaceContext();
  const { can } = usePermission();
  const queryClient = useQueryClient();

  const [propertyToDelete, setPropertyToDelete] = useState<propertyType | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  //   Get properties query
  const {
    data: propertiesData,
    isLoading: propertiesLoading,
    error: propertiesError,
  } = useQuery<propertyType[]>({
    queryKey: ["properties", currentWorkspace?.workspace.id],
    queryFn: () => getPropertiesQueryFn(currentWorkspace!.workspace.id),
    enabled: !!currentWorkspace?.workspace.id,
  });

  // Delete property mutation
  const { mutate: deleteProperty, isPending: isDeleting } = useMutation({
    mutationFn: deletePropertyMutationFn,
    onSuccess: (data) => {
      console.log("✅ Property deleted successfully:", data);
      toast.success("Property deleted successfully!");
      queryClient.invalidateQueries({
        queryKey: ["properties", currentWorkspace?.workspace.id],
      });
    },
    onError: (error) => {
      console.error("❌ Property deletion failed:", error);
      toast.error("Failed to delete property", {
        description: error?.message || "An unexpected error occurred",
      });
    },
  });

  const handleDeleteProperty = (property: propertyType) => {
    setPropertyToDelete(property);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteProperty = () => {
    if (propertyToDelete) {
      deleteProperty(propertyToDelete.id);
      setIsDeleteDialogOpen(false);
      setPropertyToDelete(null);
    } else {
      console.error("❌ No property selected for deletion");
    }
  };

  const cancelDeleteProperty = () => {
    setIsDeleteDialogOpen(false);
    setPropertyToDelete(null);
  };

  const handleAssignLead = (property: propertyType) => {
    // TODO: Implement lead assignment functionality
    toast.info("Lead assignment feature coming soon!");
  };

  return (
    <div className="flex gap-6">
      {/* Properties Grid */}
      <div className="flex-1">
        {propertiesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin" />
          </div>
        ) : propertiesError ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">
                Error Loading Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Failed to load properties. Please try again.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {propertiesData &&
              propertiesData.map((property: propertyType) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onEdit={
                    can.editProperties()
                      ? () => onEditProperty(property)
                      : undefined
                  }
                  onDelete={
                    can.deleteProperties()
                      ? () => handleDeleteProperty(property)
                      : undefined
                  }
                  onAssignLead={() => handleAssignLead(property)}
                />
              ))}
            {propertiesData?.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-600">No properties found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {`"${propertyToDelete?.title}"`}?
              <br />
              <span className="text-sm text-gray-500 mt-2 block">
                This action cannot be undone. This will permanently delete the
                property and all its associated data.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteProperty}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProperty}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Property"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PropertiesList;
