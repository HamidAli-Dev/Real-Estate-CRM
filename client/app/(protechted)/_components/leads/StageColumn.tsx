import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontal, Plus, Edit2, Trash2, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { PipelineStage, Lead } from "@/types/api.types";
import { LeadCard } from "./LeadCard";
import {
  useUpdatePipelineStage,
  useDeletePipelineStage,
} from "@/hooks/API/use-pipeline";
import { useCreateLead, useUpdateLeadStage } from "@/hooks/API/use-leads";
import { CreateLeadData } from "@/types/api.types";
import { useAuthContext } from "@/context/auth-provider";
import { LeadForm } from "./LeadForm";
import { WorkspaceUser } from "@/hooks/API/use-workspace-users";
import { Property } from "@/hooks/API/use-properties";
import { usePermission } from "@/hooks/usePermission";

interface StageColumnProps {
  stage: PipelineStage;
  leads: Lead[];
  stages: PipelineStage[];
  workspaceId: string;
  onLeadClick: (lead: Lead) => void;
  onAddLead: (stageId: string) => void;
  onLeadMove: (leadId: string, newStageId: string) => void;
  isEditing: boolean;
  onEditStage: (stageId: string) => void;
  onCancelEdit: () => void;
  onSaveStage: (stageId: string, name: string) => void;
  isUpdatingStage?: boolean;
  draggedLeadId?: string | null;
  workspaceUsers: WorkspaceUser[];
  properties: Property[];
}

export const StageColumn: React.FC<StageColumnProps> = ({
  stage,
  leads,
  stages,
  workspaceId,
  onLeadClick,
  onSaveStage,
  isUpdatingStage = false,
  draggedLeadId = null,
  workspaceUsers,
  properties,
}) => {
  const { user } = useAuthContext();
  const { can } = usePermission();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteWarningDialog, setShowDeleteWarningDialog] = useState(false);
  const [showMoveLeadsDialog, setShowMoveLeadsDialog] = useState(false);
  const [showAddLeadDialog, setShowAddLeadDialog] = useState(false);
  const [showEditStageDialog, setShowEditStageDialog] = useState(false);
  const [editStageName, setEditStageName] = useState(stage.name);
  const [editStageColor, setEditStageColor] = useState(stage.color || "blue");
  const [newLeadData, setNewLeadData] = useState<Partial<CreateLeadData>>({
    name: "",
    contactInfo: "",
    phone: "",
    notes: "",
    budget: undefined,
    tags: [],
    pipelineStageId: stage.id, // Pre-populate with current stage
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: stage.id,
  });

  const updateStage = useUpdatePipelineStage();
  const deleteStage = useDeletePipelineStage();
  const createLead = useCreateLead();
  const updateLeadStage = useUpdateLeadStage();

  const handleStartEdit = () => {
    setEditStageName(stage.name);
    setEditStageColor(stage.color || "blue");
    setShowEditStageDialog(true);
  };

  const handleSaveStage = async () => {
    if (
      editStageName.trim() &&
      (editStageName.trim() !== stage.name || editStageColor !== stage.color)
    ) {
      try {
        await updateStage.mutateAsync({
          workspaceId,
          stageId: stage.id,
          data: {
            name: editStageName.trim(),
            color: editStageColor,
          },
        });
        setShowEditStageDialog(false);
        onSaveStage(stage.id, editStageName.trim());
      } catch (error) {
        console.error("Failed to update stage:", error);
        // Reset to original values on error
        setEditStageName(stage.name);
        setEditStageColor(stage.color || "blue");
      }
    } else {
      setShowEditStageDialog(false);
    }
  };

  const handleDeleteStageClick = () => {
    // Check if stage has leads
    if (leads.length > 0) {
      setShowDeleteWarningDialog(true);
    } else {
      setShowDeleteDialog(true);
    }
  };

  const handleDeleteStage = async () => {
    try {
      await deleteStage.mutateAsync({
        workspaceId,
        stageId: stage.id,
      });
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete stage:", error);
      // If it fails due to leads, show the warning dialog
      if (
        error instanceof Error &&
        (error.name === "StageHasLeadsError" ||
          error.message.includes("existing leads"))
      ) {
        setShowDeleteDialog(false);
        setShowDeleteWarningDialog(true);
      }
    }
  };

  const handleMoveLeads = async (targetStageId: string) => {
    try {
      // Move all leads to the target stage
      const movePromises = leads.map((lead) =>
        updateLeadStage.mutateAsync({
          workspaceId,
          leadId: lead.id,
          pipelineStageId: targetStageId,
        })
      );

      await Promise.all(movePromises);

      // Close the move leads dialog
      setShowMoveLeadsDialog(false);

      // Now we can delete the stage since it's empty
      await deleteStage.mutateAsync({
        workspaceId,
        stageId: stage.id,
      });

      // Close the warning dialog
      setShowDeleteWarningDialog(false);
    } catch (error) {
      console.error("Failed to move leads:", error);
    }
  };

  const handleCreateLead = async (formData: Partial<CreateLeadData>) => {
    if (!user?.user.id) {
      console.error("No user ID available");
      return;
    }

    if (formData.name && formData.contactInfo) {
      try {
        const leadData = {
          name: formData.name,
          contactInfo: formData.contactInfo,
          phone: formData.phone || undefined,
          pipelineStageId: stage.id,
          assignedToId: formData.assignedToId || user.user.id, // Use selected agent or fallback to current user
          notes: formData.notes,
          source: formData.source || "Website",
          priority: formData.priority || "Warm",
          budget: formData.budget,
          tags: formData.tags || [],
          propertyIds: formData.propertyIds || [],
        } as CreateLeadData;

        await createLead.mutateAsync({
          workspaceId,
          data: leadData,
        });

        setShowAddLeadDialog(false);
        setNewLeadData({
          name: "",
          contactInfo: "",
          phone: "",
          notes: "",
          budget: undefined,
          tags: [],
          pipelineStageId: stage.id, // Keep the stage ID for future leads
        });

        // Force a small delay and then check if data is refreshed
        setTimeout(() => {
          console.log(
            "🔄 Checking if data is refreshed after lead creation..."
          );
        }, 1000);
      } catch (error) {
        console.error("❌ Error creating lead:", error);
        // TODO: Show error toast
      }
    }
  };

  const getColorForDisplay = (color?: string) => {
    // If it's a hex color, return it directly
    if (color && color.startsWith("#")) {
      return color;
    }

    // Map named colors to hex values
    const colorMap: Record<string, string> = {
      blue: "#3B82F6",
      red: "#EF4444",
      green: "#10B981",
      yellow: "#F59E0B",
      purple: "#8B5CF6",
      gray: "#6B7280",
      orange: "#F97316",
      pink: "#EC4899",
      indigo: "#6366F1",
      teal: "#14B8A6",
    };
    return colorMap[color || "blue"] || "#3B82F6";
  };

  return (
    <>
      <Card
        className={`w-80 bg-gray-50 border-gray-200 transition-all duration-200 ${
          isOver ? "border-blue-300 bg-blue-50/30" : ""
        } ${isUpdatingStage ? "opacity-60" : ""}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getColorForDisplay(stage.color) }}
              />
              <CardTitle className="text-sm font-medium text-gray-900">
                {stage.name}
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {leads.length}
              </Badge>
              {isUpdatingStage && (
                <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {(can.editPipelineStages() || can.deletePipelineStages()) && (
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {can.editPipelineStages() && (
                  <DropdownMenuItem onClick={handleStartEdit}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Stage
                  </DropdownMenuItem>
                )}
                {can.deletePipelineStages() && (
                  <DropdownMenuItem
                    onClick={handleDeleteStageClick}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Stage
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Add Lead Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-gray-600 hover:text-gray-900"
            onClick={() => setShowAddLeadDialog(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>

          {/* Leads */}
          <SortableContext
            items={leads.map((lead) => lead.id)}
            strategy={verticalListSortingStrategy}
          >
            <div
              ref={setDroppableRef}
              className={`space-y-3 min-h-[200px] transition-all duration-200 rounded-lg p-2 ${
                isOver
                  ? "bg-blue-50/50 border-2 border-dashed border-blue-300"
                  : ""
              }`}
            >
              {leads.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {isUpdatingStage ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-2" />
                      <p className="text-sm text-blue-600">Moving lead...</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                        <Plus className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm">No leads yet</p>
                      <p className="text-xs text-gray-400">
                        {isOver
                          ? "Drop lead here"
                          : "Drag a lead here or add one"}
                      </p>
                    </>
                  )}
                </div>
              ) : (
                leads.map((lead) => (
                  <SortableLead
                    key={lead.id}
                    lead={lead}
                    onClick={() => onLeadClick(lead)}
                    isDragged={draggedLeadId === lead.id}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </CardContent>
      </Card>

      {/* Edit Stage Dialog */}
      <Dialog open={showEditStageDialog} onOpenChange={setShowEditStageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Stage</DialogTitle>
            <DialogDescription>
              Update the name and color for the {`"${stage.name}"`} stage.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Stage Name</label>
              <Input
                value={editStageName}
                onChange={(e) => setEditStageName(e.target.value)}
                placeholder="Enter stage name"
                className="mt-1"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium">Stage Color</label>
              <Input
                value={editStageColor}
                onChange={(e) => setEditStageColor(e.target.value)}
                placeholder="Enter color (e.g., #FF0000 or red)"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a color name (blue, red, green) or hex code (#FF0000)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditStageDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveStage}
              disabled={
                !editStageName.trim() ||
                (editStageName.trim() === stage.name &&
                  editStageColor === stage.color)
              }
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Stage Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Stage</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {`"${stage.name}"`}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteStage}
              disabled={deleteStage.isPending}
            >
              {deleteStage.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Warning Dialog - When stage has leads */}
      <Dialog
        open={showDeleteWarningDialog}
        onOpenChange={setShowDeleteWarningDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-amber-600">
              ⚠️ Cannot Delete Stage
            </DialogTitle>
            <DialogDescription>
              The stage {`"${stage.name}"`} contains {leads.length} lead
              {leads.length !== 1 ? "s" : ""} and cannot be deleted.
            </DialogDescription>
            <div className="mt-4 space-y-3">
              <p className="text-sm text-gray-600">
                To delete this stage, you need to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Move all leads to another stage, or</li>
                <li>Delete all leads in this stage first</li>
              </ul>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteWarningDialog(false)}
            >
              Got it
            </Button>
            <Button
              onClick={() => {
                setShowDeleteWarningDialog(false);
                setShowMoveLeadsDialog(true);
              }}
            >
              Move Leads
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Leads Dialog */}
      <Dialog open={showMoveLeadsDialog} onOpenChange={setShowMoveLeadsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Leads to Another Stage</DialogTitle>
            <DialogDescription>
              Select a target stage to move all {leads.length} lead
              {leads.length !== 1 ? "s" : ""} from {`"${stage.name}"`}. After
              moving the leads, the stage will be automatically deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {stages
                .filter((s) => s.id !== stage.id)
                .map((targetStage) => (
                  <Button
                    key={targetStage.id}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                    onClick={() => handleMoveLeads(targetStage.id)}
                    disabled={
                      updateLeadStage.isPending || deleteStage.isPending
                    }
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: getColorForDisplay(targetStage.color),
                      }}
                    ></div>
                    <span className="font-medium">{targetStage.name}</span>
                    <span className="text-xs text-gray-500">
                      {targetStage._count?.leads || 0} leads
                    </span>
                  </Button>
                ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMoveLeadsDialog(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Lead Dialog */}
      <Dialog open={showAddLeadDialog} onOpenChange={setShowAddLeadDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>
              Create a new lead in the {`"${stage.name}"`} stage.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <LeadForm
              formData={newLeadData}
              onFormDataChange={setNewLeadData}
              stages={[stage]} // Only show current stage since we're adding to a specific stage
              mode="create"
              isLoading={createLead.isPending}
              onSubmit={handleCreateLead}
              onCancel={() => setShowAddLeadDialog(false)}
              forceStageId={stage.id}
              workspaceUsers={workspaceUsers}
              properties={properties}
              currentUserId={user?.user.id || ""}
              currentUserRole={user?.user.role?.name || ""}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Draggable lead wrapper using dnd-kit sortable
const SortableLead: React.FC<{
  lead: Lead;
  onClick: () => void;
  isDragged?: boolean;
}> = ({ lead, onClick, isDragged = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 200ms ease",
    opacity: isDragging || isDragged ? 0.4 : 1,
    zIndex: isDragging ? 1000 : "auto",
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing transition-all duration-200 ${
        isDragging ? "scale-105 shadow-lg" : ""
      }`}
    >
      <LeadCard lead={lead} onClick={onClick} />
    </div>
  );
};
