import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tags } from "@/components/ui/tags";
import { CreateLeadData, UpdateLeadData } from "@/types/api.types";
import { PipelineStage } from "@/types/api.types";
import { Property } from "@/hooks/API/use-properties";
import { WorkspaceUser } from "@/hooks/API/use-workspace-users";
import { usePermission } from "@/hooks/usePermission";

interface LeadFormProps {
  // Form data
  formData: Partial<CreateLeadData> | Partial<UpdateLeadData>;
  onFormDataChange: (
    data: Partial<CreateLeadData> | Partial<UpdateLeadData>
  ) => void;

  // Pipeline stages for selection
  stages: PipelineStage[];

  // Properties for selection
  properties: Property[];

  // Workspace users for agent assignment
  workspaceUsers: WorkspaceUser[];

  // Current user ID and role for permission checks
  currentUserId: string;
  currentUserRole: string;

  // Form mode
  mode: "create" | "edit";

  // Loading state
  isLoading?: boolean;

  // Submit handler
  onSubmit: (
    formData: Partial<CreateLeadData> | Partial<UpdateLeadData>
  ) => void;

  // Cancel handler
  onCancel: () => void;

  // Force a specific pipeline stage ID
  forceStageId?: string;
}

export const LeadForm: React.FC<LeadFormProps> = ({
  formData,
  onFormDataChange,
  stages,
  properties,
  workspaceUsers,
  currentUserId,
  currentUserRole,
  mode,
  isLoading = false,
  onSubmit,
  onCancel,
  forceStageId,
}) => {
  const handleInputChange = (
    field: keyof CreateLeadData,
    value:
      | CreateLeadData[keyof CreateLeadData]
      | UpdateLeadData[keyof UpdateLeadData]
  ) => {
    const newData = { ...formData, [field]: value };
    onFormDataChange(newData);
  };

  const { can } = usePermission();
  // Filter out the current user from agent options (they can't assign to themselves)
  const availableAgents = workspaceUsers.filter(
    (user) => user.user.id !== currentUserId
  );

  // Check if current user can assign agents (Owner role)
  const canAssignAgents = currentUserRole === "Owner";

  const isFormValid = () => {
    if (mode === "create") {
      const baseValidation =
        formData.name?.trim() &&
        formData.contactInfo?.trim() &&
        (formData.pipelineStageId || forceStageId);

      // Only require agent assignment if user is Owner
      if (canAssignAgents) {
        return baseValidation && formData.assignedToId;
      }

      return baseValidation;
    }
    return true; // For edit mode, we don't require all fields
  };

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      {/* Basic Information */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900 border-b pb-2">
          Basic Information
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-medium">
              Name *
            </Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Lead name"
              disabled={isLoading}
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contactInfo" className="text-xs font-medium">
              Contact Info *
            </Label>
            <Input
              id="contactInfo"
              value={formData.contactInfo || ""}
              onChange={(e) => handleInputChange("contactInfo", e.target.value)}
              placeholder="Email or phone number"
              disabled={isLoading}
              className="h-8 text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs font-medium">
            Phone
          </Label>
          <Input
            id="phone"
            value={formData.phone || ""}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="Phone number (optional)"
            disabled={isLoading}
            className="h-8 text-sm"
          />
        </div>
      </div>

      {/* Lead Details */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900 border-b pb-2">
          Lead Details
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="source" className="text-xs font-medium">
              Source
            </Label>
            <Select
              value={formData.source || ""}
              onValueChange={(value) => handleInputChange("source", value)}
              disabled={isLoading}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Website">Website</SelectItem>
                <SelectItem value="Referral">Referral</SelectItem>
                <SelectItem value="Social">Social</SelectItem>
                <SelectItem value="Cold">Cold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="priority" className="text-xs font-medium">
              Priority
            </Label>
            <Select
              value={formData.priority || ""}
              onValueChange={(value) => handleInputChange("priority", value)}
              disabled={isLoading}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hot">Hot</SelectItem>
                <SelectItem value="Warm">Warm</SelectItem>
                <SelectItem value="Cold">Cold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="budget" className="text-xs font-medium">
              Budget
            </Label>
            <Input
              id="budget"
              type="number"
              value={formData.budget || ""}
              onChange={(e) =>
                handleInputChange(
                  "budget",
                  e.target.value ? parseFloat(e.target.value) : undefined
                )
              }
              placeholder="Budget amount"
              disabled={isLoading}
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pipelineStageId" className="text-xs font-medium">
              Pipeline Stage
            </Label>
            {forceStageId ? (
              <div className="h-8 px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md flex items-center text-gray-700">
                {stages.find((s) => s.id === forceStageId)?.name ||
                  "Unknown Stage"}
              </div>
            ) : (
              <Select
                value={formData.pipelineStageId || ""}
                onValueChange={(value) =>
                  handleInputChange("pipelineStageId", value)
                }
                disabled={isLoading}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900 border-b pb-2">
          Additional Information
        </h3>

        <div className="space-y-1.5">
          <Label htmlFor="notes" className="text-xs font-medium">
            Notes
          </Label>
          <Textarea
            id="notes"
            value={formData.notes || ""}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            placeholder="Additional notes about the lead"
            rows={3}
            disabled={isLoading}
            className="text-sm resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tags" className="text-xs font-medium">
            Tags
          </Label>
          <Tags
            tags={formData.tags || []}
            onChange={(tags) => handleInputChange("tags", tags)}
            placeholder="Add tag..."
            maxTags={10}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Property Association */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900 border-b pb-2">
          Property Association (Optional)
        </h3>

        <div className="space-y-2">
          <Label className="text-xs font-medium">
            Link to Properties of Interest
          </Label>
          <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2 space-y-2">
            {properties.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-2">
                No properties available
              </p>
            ) : (
              properties.map((property) => (
                <div key={property.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`property-${property.id}`}
                    checked={
                      formData.propertyIds?.includes(property.id) || false
                    }
                    onCheckedChange={(checked) => {
                      const currentIds = formData.propertyIds || [];
                      const newIds = checked
                        ? [...currentIds, property.id]
                        : currentIds.filter((id) => id !== property.id);
                      handleInputChange("propertyIds", newIds);
                    }}
                    disabled={isLoading}
                  />
                  <Label
                    htmlFor={`property-${property.id}`}
                    className="text-xs flex-1 cursor-pointer"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{property.title}</span>
                      <span className="text-gray-500">
                        ${property.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {property.location}, {property.city}
                    </div>
                  </Label>
                </div>
              ))
            )}
          </div>
          {formData.propertyIds && formData.propertyIds.length > 0 && (
            <p className="text-xs text-gray-600">
              {formData.propertyIds.length} propert
              {formData.propertyIds.length === 1 ? "y" : "ies"} selected
            </p>
          )}
        </div>
      </div>

      {/* Agent Assignment */}
      {canAssignAgents && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900 border-b pb-2">
            Agent Assignment
          </h3>
          <div className="space-y-1.5">
            <Label htmlFor="assignedToId" className="text-xs font-medium">
              Assign to Agent
            </Label>
            <Select
              value={formData.assignedToId || ""}
              onValueChange={(value) =>
                handleInputChange("assignedToId", value)
              }
              disabled={isLoading}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select agent" />
              </SelectTrigger>
              <SelectContent>
                {availableAgents.map((user) => (
                  <SelectItem key={user.user.id} value={user.user.id}>
                    {user.user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Form Actions - Fixed at bottom */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 bg-white sticky bottom-0">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          type="button"
          size="sm"
          className="h-8 px-3"
        >
          Cancel
        </Button>
        {can.createLeads() && (
          <Button
            onClick={() => {
              const submitData = forceStageId
                ? { ...formData, pipelineStageId: forceStageId }
                : formData;
              onSubmit(submitData);
            }}
            disabled={!isFormValid() || isLoading}
            type="button"
            size="sm"
            className="h-8 px-3"
          >
            {isLoading
              ? mode === "create"
                ? "Creating..."
                : "Saving..."
              : mode === "create"
              ? "Create Lead"
              : "Save Changes"}
          </Button>
        )}
      </div>
    </div>
  );
};
