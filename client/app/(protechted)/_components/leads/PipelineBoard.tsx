import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lead, CreateLeadData } from "@/types/api.types";
import {
  usePipelineStages,
  useCreatePipelineStage,
} from "@/hooks/API/use-pipeline";
import {
  useLeads,
  useUpdateLeadStage,
  useCreateLead,
  useUpdateLeadPosition,
} from "@/hooks/API/use-leads";
import { StageColumn } from "./StageColumn";
import { LeadEditDialog } from "./LeadEditDialog";
import { LeadCard } from "./LeadCard";
import { LeadForm } from "./LeadForm";
import { useAuthContext } from "@/context/auth-provider";
import { useWorkspaceUsers } from "@/hooks/API/use-workspace-users";
import { useProperties } from "@/hooks/API/use-properties";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";
import { usePermission } from "@/hooks/usePermission";

interface ApiError {
  message?: string;
  errorCode?: string;
  data?: {
    message?: string;
    errorCode?: string;
  };
  status?: number;
  response?: {
    data?: {
      message?: string;
      errorCode?: string;
    };
    status?: number;
  };
}

export const PipelineBoard: React.FC<{ workspaceId: string }> = ({
  workspaceId,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { can } = usePermission();

  const [isCreateStageOpen, setIsCreateStageOpen] = useState(false);
  const [isCreateLeadOpen, setIsCreateLeadOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [filterStage, setFilterStage] = useState(
    searchParams.get("stage") || "all"
  );
  const [filterAgent, setFilterAgent] = useState(
    searchParams.get("agent") || "all"
  );
  const [newStageData, setNewStageData] = useState({ name: "", color: "blue" });
  const [newLeadData, setNewLeadData] = useState<Partial<CreateLeadData>>({
    name: "",
    contactInfo: "",
    phone: "",
    notes: "",
    source: "Website",
    priority: "Warm",
    budget: undefined,
    tags: [],
  });

  // Add state for stage editing
  const [editingStageId, setEditingStageId] = useState<string | null>(null);

  // Drag and drop state
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);

  // Lead editing state
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLeadEditOpen, setIsLeadEditOpen] = useState(false);

  const { user } = useAuthContext();

  const {
    data: stages = [],
    isLoading: stagesLoading,
    isError: stagesError,
    error,
  } = usePipelineStages(workspaceId);

  const {
    data: workspaceUsers = [],
    isError: workspaceUsersError,
    error: workspaceUsersFetchError,
  } = useWorkspaceUsers(workspaceId, {
    enabled: can.viewUsers(),
  });

  const { data: properties = [] } = useProperties(workspaceId, {
    enabled: can.viewProperties(),
  });

  // Debounce search to reduce requests
  const [debouncedSearch, setDebouncedSearch] = useState(
    searchParams.get("search") || ""
  );
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(searchTerm), 800);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  // Update URL when filters change
  const updateURL = (newSearch: string, newStage: string, newAgent: string) => {
    const params = new URLSearchParams(searchParams);

    if (newSearch) {
      params.set("search", newSearch);
    } else {
      params.delete("search");
    }

    if (newStage !== "all") {
      params.set("stage", newStage);
    } else {
      params.delete("stage");
    }

    if (newAgent !== "all") {
      params.set("agent", newAgent);
    } else {
      params.delete("agent");
    }

    const newURL = `${window.location.pathname}?${params.toString()}`;
    router.replace(newURL, { scroll: false });
  };

  // Update URL when debounced search changes
  useEffect(() => {
    updateURL(debouncedSearch, filterStage, filterAgent);
  }, [debouncedSearch, filterStage, filterAgent]);

  const { data: allLeads = [], isLoading: leadsLoading } = useLeads(
    workspaceId,
    {
      search: debouncedSearch || undefined,
      stageId: filterStage !== "all" ? filterStage : undefined,
      assignedToId: filterAgent !== "all" ? filterAgent : undefined,
    }
  );

  const createStage = useCreatePipelineStage();
  const updateLeadStage = useUpdateLeadStage();
  const createLead = useCreateLead();
  const updateLeadPosition = useUpdateLeadPosition();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(String(active.id));
    const lead = allLeads.find((l) => l.id === String(active.id));
    setDraggedLead(lead || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Optional: Add visual feedback during drag over
  };

  // Leads already filtered server-side
  const filteredLeads = allLeads;

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsLeadEditOpen(true);
  };

  const handleAddStage = async () => {
    if (newStageData.name.trim()) {
      try {
        await createStage.mutateAsync({
          workspaceId,
          data: {
            name: newStageData.name.trim(),
            color: newStageData.color || undefined,
          },
        });
        setIsCreateStageOpen(false);
        setNewStageData({ name: "", color: "" });
      } catch (error: unknown) {
        console.error("Error creating stage:", error);
        // TODO: Show error toast
      }
    }
  };

  const handleAddLead = (stageId: string) => {
    setNewLeadData((prev) => ({ ...prev, pipelineStageId: stageId }));
    setIsCreateLeadOpen(true);
  };

  const handleCreateLead = async (formData: Partial<CreateLeadData>) => {
    if (!user?.user.id) {
      console.error("No user ID available");
      return;
    }

    if (formData.name && formData.contactInfo && formData.pipelineStageId) {
      try {
        await createLead.mutateAsync({
          workspaceId,
          data: {
            name: formData.name,
            contactInfo: formData.contactInfo,
            phone: formData.phone || undefined,
            pipelineStageId: formData.pipelineStageId,
            assignedToId: formData.assignedToId || user.user.id, // Use selected agent or fallback to current user
            notes: formData.notes,
            source: formData.source || "Website",
            priority: formData.priority || "Warm",
            budget: formData.budget,
            tags: formData.tags || [],
            propertyIds: [], // Send empty array for propertyIds
          } as CreateLeadData,
        });
        setIsCreateLeadOpen(false);
        setNewLeadData({
          name: "",
          contactInfo: "",
          phone: "",
          notes: "",
          source: "Website",
          priority: "Warm",
          budget: undefined,
          tags: [],
        });
      } catch (error: unknown) {
        console.error("Error creating lead:", error);
        // TODO: Show error toast
      }
    }
  };

  const handleLeadDrop = async (leadId: string, newStageId: string) => {
    try {
      await updateLeadStage.mutateAsync({
        workspaceId,
        leadId,
        pipelineStageId: newStageId,
      });
    } catch (error) {
      console.error("Failed to update lead stage:", error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    // Reset drag state
    setActiveId(null);
    setDraggedLead(null);

    if (!over) return;

    const leadId = String(active.id);
    const overId = String(over.id);
    const movedLead = allLeads.find((l) => l.id === leadId);

    if (!movedLead) return;

    // Determine target stage: could be a stage container id or another lead's id
    let targetStageId: string | null = null;
    if (stages.some((s) => s.id === overId)) {
      targetStageId = overId;
    } else {
      const overLead = allLeads.find((l) => l.id === overId);
      if (overLead) targetStageId = overLead.pipelineStageId;
    }

    if (!targetStageId) return;

    // Handle reordering within same stage
    if (movedLead.pipelineStageId === targetStageId) {
      // Get the current position of the moved lead
      const currentStageLeads = allLeads.filter(
        (lead) => lead.pipelineStageId === targetStageId
      );
      const oldPosition = currentStageLeads.findIndex(
        (lead) => lead.id === leadId
      );

      // Find the new position based on where it was dropped
      let newPosition = currentStageLeads.length; // Default to end
      if (overId !== targetStageId) {
        // Dropped on another lead, find its position
        const overLead = currentStageLeads.find((lead) => lead.id === overId);
        if (overLead) {
          const overIndex = currentStageLeads.findIndex(
            (lead) => lead.id === overId
          );
          newPosition = overIndex;
        }
      }

      // Update the lead position
      if (oldPosition !== newPosition && oldPosition !== -1) {
        setIsUpdatingStage(true);
        try {
          await updateLeadPosition.mutateAsync({
            workspaceId,
            leadId,
            oldPosition,
            newPosition,
          });
        } finally {
          setIsUpdatingStage(false);
        }
      }
      return;
    }

    // Show loading state and update stage
    setIsUpdatingStage(true);
    try {
      await handleLeadDrop(leadId, targetStageId);
    } finally {
      setIsUpdatingStage(false);
    }
  };

  const handleEditStage = (stageId: string) => {
    setEditingStageId(stageId);
  };

  const handleCancelEditStage = () => {
    setEditingStageId(null);
  };

  const handleSaveStage = (stageId: string, name: string) => {
    setEditingStageId(null);
    // The stage update is handled by the StageColumn component
  };

  const isPermissionError =
    stagesError &&
    (error as ApiError)?.data?.errorCode === "VALIDATION_ERROR" &&
    (error as ApiError)?.data?.message?.includes("VIEW_PIPELINE_STAGES");

  if (stagesLoading || leadsLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex space-x-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-80">
              <Skeleton className="h-16 w-full mb-4" />
              <Skeleton className="h-32 w-full mb-2" />
              <Skeleton className="h-32 w-full mb-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show permission denied placeholder if user doesn't have required permissions
  if (isPermissionError || !can.viewPipelineStages()) {
    // Extract the required permission from the error message or use default
    let requiredPermission = "VIEW_PIPELINE_STAGES";

    if (stagesError && (error as ApiError)?.data?.message) {
      const match = (error as ApiError)?.data?.message?.match(
        /Required permission: ([A-Z_]+)/
      );
      if (match) requiredPermission = match[1];
    }

    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Restricted
          </h3>
          <p className="text-gray-600 mb-4">
            You don&apos;t have permission to view the lead pipeline. The
            following permission is required:{" "}
            <strong>{requiredPermission}</strong>
            <br />
            <br />
            Please contact your administrator to request access.
          </p>
          <Button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Fixed Header - Never scrolls horizontally */}
      <div className="flex-shrink-0 bg-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lead Pipeline</h1>
            <p className="text-gray-600">
              Manage your sales pipeline and track leads
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {can.createPipelineStages() && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateStageOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Stage
              </Button>
            )}
            {can.createLeads() && (
              <Button
                onClick={() => setIsCreateLeadOpen(true)}
                disabled={stages.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            )}
          </div>
        </div>

        {/* Filters and Search - Never scrolls horizontally */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStage} onValueChange={setFilterStage}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {stages.map((stage) => (
                <SelectItem key={stage.id} value={stage.id}>
                  {stage.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!workspaceUsersError && can.viewUsers() && (
            <Select value={filterAgent} onValueChange={setFilterAgent}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Assigned to" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {/* Show all workspace users */}
                {workspaceUsers.map((workspaceUser) => (
                  <SelectItem
                    key={workspaceUser.user.id}
                    value={workspaceUser.user.id}
                  >
                    {workspaceUser.user.name ||
                      workspaceUser.user.email ||
                      "Unknown"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Total Leads:</span>
            <Badge variant="secondary">{filteredLeads.length}</Badge>
          </div>
        </div>
      </div>

      {/* Pipeline Board Container - Only this scrolls horizontally */}
      <div className="flex-1 overflow-hidden">
        {stages.length === 0 ? (
          <div className="flex items-center justify-center h-full px-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No pipeline stages yet
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first pipeline stage to start organizing your leads
              </p>
              {can.createPipelineStages() && (
                <Button onClick={() => setIsCreateStageOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Stage
                </Button>
              )}
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            collisionDetection={closestCenter}
          >
            <div className="h-full overflow-x-auto overflow-y-hidden !mx-6">
              <div className="flex space-x-6 h-full min-w-max px-6 py-4">
                {(filterStage === "all"
                  ? stages
                  : stages.filter((s) => s.id === filterStage)
                ).map((stage) => {
                  const stageLeads = allLeads.filter(
                    (lead) => lead.pipelineStageId === stage.id
                  );

                  return (
                    <StageColumn
                      key={stage.id}
                      stage={stage}
                      leads={stageLeads}
                      stages={stages}
                      workspaceId={workspaceId}
                      onLeadClick={handleLeadClick}
                      onAddLead={handleAddLead}
                      onLeadMove={handleLeadDrop}
                      isEditing={editingStageId === stage.id}
                      onEditStage={handleEditStage}
                      onCancelEdit={handleCancelEditStage}
                      onSaveStage={handleSaveStage}
                      isUpdatingStage={isUpdatingStage}
                      draggedLeadId={activeId}
                      workspaceUsers={workspaceUsers}
                      properties={properties}
                    />
                  );
                })}
              </div>
            </div>

            {/* Drag Overlay for smooth drag experience */}
            <DragOverlay>
              {draggedLead ? (
                <div className="transform rotate-3 opacity-90 scale-105 shadow-2xl">
                  <LeadCard lead={draggedLead} onClick={() => {}} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Add Stage Dialog */}
      <Dialog open={isCreateStageOpen} onOpenChange={setIsCreateStageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Pipeline Stage</DialogTitle>
            <DialogDescription>
              Create a new stage in your sales pipeline.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Stage Name *</label>
              <Input
                value={newStageData.name}
                onChange={(e) =>
                  setNewStageData({ ...newStageData, name: e.target.value })
                }
                placeholder="e.g., New Lead, Contacted, Negotiation"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Color (Optional)</label>
              <Input
                value={newStageData.color}
                onChange={(e) =>
                  setNewStageData({ ...newStageData, color: e.target.value })
                }
                placeholder="e.g., #3B82F6 or blue"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateStageOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddStage}
              disabled={!newStageData.name.trim() || createStage.isPending}
            >
              {createStage.isPending ? "Creating..." : "Create Stage"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Lead Dialog */}
      <Dialog open={isCreateLeadOpen} onOpenChange={setIsCreateLeadOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>
              Create a new lead in your pipeline.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <LeadForm
              formData={newLeadData}
              onFormDataChange={setNewLeadData}
              stages={stages}
              properties={properties}
              mode="create"
              isLoading={createLead.isPending}
              onSubmit={handleCreateLead}
              onCancel={() => setIsCreateLeadOpen(false)}
              workspaceUsers={workspaceUsers}
              currentUserId={user?.user.id || ""}
              currentUserRole={user?.user.role?.name || ""}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Lead Edit Dialog */}
      <LeadEditDialog
        lead={selectedLead}
        isOpen={isLeadEditOpen}
        onClose={() => {
          setIsLeadEditOpen(false);
          setSelectedLead(null);
        }}
        workspaceId={workspaceId}
      />
    </div>
  );
};
