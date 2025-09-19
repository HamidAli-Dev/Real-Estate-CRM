import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { CreateLeadData } from "@/types/api.types";

interface CreateLeadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLeadData) => void;
  workspaceId: string;
  defaultStageId: string;
}

export const CreateLeadDialog: React.FC<CreateLeadDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultStageId,
}) => {
  const [formData, setFormData] = useState<Partial<CreateLeadData>>({
    name: "",
    contactInfo: "",
    notes: "",
    source: "Website",
    priority: "Warm",
    pipelineStageId: defaultStageId,
    assignedToId: "", // TODO: Get current user ID from context
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.contactInfo && formData.pipelineStageId) {
      onSubmit(formData as CreateLeadData);
      // Reset form
      setFormData({
        name: "",
        contactInfo: "",
        notes: "",
        source: "Website",
        priority: "Warm",
        pipelineStageId: defaultStageId,
        assignedToId: "",
      });
    }
  };

  const handleClose = () => {
    // Reset form on close
    setFormData({
      name: "",
      contactInfo: "",
      notes: "",
      source: "Website",
      priority: "Warm",
      pipelineStageId: defaultStageId,
      assignedToId: "",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>
            Create a new lead in your pipeline. Fill in the required information
            below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Lead name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactInfo">Contact Info *</Label>
              <Input
                id="contactInfo"
                value={formData.contactInfo}
                onChange={(e) =>
                  setFormData({ ...formData, contactInfo: e.target.value })
                }
                placeholder="Email or phone number"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Select
                value={formData.source}
                onValueChange={(value: "Website" | "Referral" | "Social") =>
                  setFormData({ ...formData, source: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Social Media">Social Media</SelectItem>
                  <SelectItem value="Cold Call">Cold Call</SelectItem>
                  <SelectItem value="Event">Event</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: "Hot" | "Warm" | "Cold") =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
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

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Additional notes about the lead..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.name || !formData.contactInfo}
            >
              Create Lead
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
