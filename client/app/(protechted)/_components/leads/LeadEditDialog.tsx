import React, { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LeadForm } from "./LeadForm";
import { Lead, UpdateLeadData } from "@/types/api.types";
import { useUpdateLead, useDeleteLead, useLead } from "@/hooks/API/use-leads";
import { usePipelineStages } from "@/hooks/API/use-pipeline";
import { useProperties } from "@/hooks/API/use-properties";
import { useWorkspaceUsers } from "@/hooks/API/use-workspace-users";
import { useAuthContext } from "@/context/auth-provider";
import { usePermission } from "@/hooks/usePermission";

interface LeadEditDialogProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
}

export const LeadEditDialog: React.FC<LeadEditDialogProps> = ({
  lead,
  isOpen,
  onClose,
  workspaceId,
}) => {
  const { data: workspaceUsers = [] } = useWorkspaceUsers(workspaceId);
  const { user } = useAuthContext();
  const { can } = usePermission();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState<UpdateLeadData>({});

  const { data: stages = [] } = usePipelineStages(workspaceId);
  const { data: properties = [] } = useProperties(workspaceId);
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();

  // Fetch the latest lead data to ensure we have fresh data
  const { data: latestLead } = useLead(workspaceId, lead?.id || "", {
    enabled: !!lead?.id && isOpen,
  });

  // Use the latest lead data if available, otherwise fallback to the passed lead
  const currentLead: Lead | null = (latestLead as Lead) || lead;

  useEffect(() => {
    if (currentLead && currentLead.id) {
      setFormData({
        name: currentLead.name,
        contactInfo: currentLead.contactInfo,
        phone: currentLead.phone || "",
        notes: currentLead.notes || "",
        source: currentLead.source || "Website",
        priority: currentLead.priority || "Warm",
        budget: currentLead.budget,
        tags: currentLead.tags || [],
        pipelineStageId: currentLead.pipelineStageId,
        propertyIds: currentLead.properties?.map((p) => p.property.id) || [],
      });
    }
  }, [currentLead]);

  const handleSave = async (formData: UpdateLeadData) => {
    if (!currentLead) return;

    try {
      await updateLead.mutateAsync({
        workspaceId,
        leadId: currentLead.id,
        data: formData,
      });
      onClose(); // Close the dialog after successful save
    } catch (error) {
      console.error("Failed to update lead:", error);
    }
  };

  const handleDelete = async () => {
    if (!currentLead) return;

    try {
      await deleteLead.mutateAsync({
        workspaceId,
        leadId: currentLead.id,
      });
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      console.error("Failed to delete lead:", error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      Hot: "bg-red-500 text-white",
      Warm: "bg-yellow-500 text-white",
      Cold: "bg-blue-500 text-white",
    };
    return colors[priority] || colors.Warm;
  };

  if (!currentLead) return null;

  return (
    <>
      <Dialog open={isOpen && !showDeleteConfirm} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={currentLead.avatar}
                    alt={currentLead.name}
                  />
                  <AvatarFallback className="bg-blue-600 text-white font-bold">
                    {getInitials(currentLead.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-xl">
                    Edit Lead: {currentLead.name}
                  </DialogTitle>
                  <DialogDescription>Update lead information</DialogDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  className={`text-xs px-2 py-1 ${getPriorityColor(
                    currentLead.priority || "Warm"
                  )}`}
                >
                  {currentLead.priority || "Warm"}
                </Badge>
                {can.deleteLeads() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <LeadForm
              formData={formData}
              onFormDataChange={setFormData}
              stages={stages}
              properties={properties}
              workspaceUsers={workspaceUsers}
              currentUserId={user?.user.id || ""}
              currentUserRole={user?.user.role?.name || ""}
              mode="edit"
              isLoading={updateLead.isPending}
              onSubmit={handleSave}
              onCancel={onClose}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lead</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{currentLead.name}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLead.isPending}
            >
              {deleteLead.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
