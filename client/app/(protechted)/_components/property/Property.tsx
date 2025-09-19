"use client";

import { useState } from "react";
import { Plus, Loader } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { useWorkspaceContext } from "@/context/workspace-provider";
import { useAuthContext } from "@/context/auth-provider";
import {
  createPropertyMutationFn,
  editPropertyMutationFn,
  getPropertyCategoriesQueryFn,
} from "@/lib/api";
import {
  propertyType,
  createPropertyType,
  editPropertyType,
  propertyCategoryType,
} from "@/types/api.types";
import PropertyForm from "@/app/(protechted)/_components/property/PropertyForm";

import PropertiesList from "../../_components/property/PropertiesList";

const Property = () => {
  const { currentWorkspace } = useWorkspaceContext();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<propertyType | null>(
    null
  );

  // Get property categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery<
    propertyCategoryType[]
  >({
    queryKey: ["propertyCategories", currentWorkspace?.workspace.id],
    queryFn: () => getPropertyCategoriesQueryFn(currentWorkspace!.workspace.id),
    enabled: !!currentWorkspace?.workspace.id,
  });

  // Create property mutation
  const { mutate: createProperty, isPending: isCreating } = useMutation({
    mutationFn: createPropertyMutationFn,
    onSuccess: () => {
      toast.success("Property created successfully!");
      setShowCreateForm(false);
      // Invalidate and refetch properties to show the new one
      queryClient.invalidateQueries({
        queryKey: ["properties", currentWorkspace?.workspace.id],
      });
    },
    onError: (error) => {
      console.error("❌ Property creation failed:", error);
      toast.error("Failed to create property", {
        description: error?.message || "An unexpected error occurred",
      });
    },
  });

  // Edit property mutation
  const { mutate: editProperty, isPending: isEditing } = useMutation({
    mutationFn: editPropertyMutationFn,
    onSuccess: () => {
      toast.success("Property updated successfully!");
      setEditingProperty(null);
      // Invalidate and refetch properties to show the updated one
      queryClient.invalidateQueries({
        queryKey: ["properties", currentWorkspace?.workspace.id],
      });
    },
    onError: (error) => {
      console.error("❌ Property update failed:", error);
      toast.error("Failed to update property", {
        description: error?.message || "An unexpected error occurred",
      });
    },
  });

  const handleCreateProperty = (data: createPropertyType) => {
    createProperty(data);
  };

  const handleEditProperty = (data: editPropertyType) => {
    if (editingProperty) {
      editProperty({ id: editingProperty.id, data });
    }
  };

  const canManageProperties = user?.user.role?.name === "Owner";
  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600">
            Manage your real estate properties in{" "}
            {currentWorkspace.workspace.name}
          </p>
        </div>

        {canManageProperties && (
          <Button
            className="flex items-center space-x-2"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Add Property</span>
          </Button>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white rounded-lg">
            {categoriesLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader className="w-8 h-8 animate-spin" />
                <span className="ml-2">Loading categories...</span>
              </div>
            ) : (
              <PropertyForm
                mode="create"
                onSubmit={(data, mode) => {
                  if (mode === "create") {
                    handleCreateProperty(data as createPropertyType);
                  }
                }}
                onCancel={() => setShowCreateForm(false)}
                isLoading={isCreating}
                categories={categoriesData || []}
              />
            )}
          </div>
        </div>
      )}

      {/* Edit Property Modal */}
      {editingProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white rounded-lg">
            {categoriesLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader className="w-8 h-8 animate-spin" />
                <span className="ml-2">Loading categories...</span>
              </div>
            ) : (
              <PropertyForm
                mode="edit"
                initialData={editingProperty}
                onSubmit={(data, mode) => {
                  if (mode === "edit") {
                    handleEditProperty(data as editPropertyType);
                  }
                }}
                onCancel={() => setEditingProperty(null)}
                isLoading={isEditing}
                categories={categoriesData || []}
              />
            )}
          </div>
        </div>
      )}

      <PropertiesList onEditProperty={setEditingProperty} />
    </div>
  );
};

export default Property;
