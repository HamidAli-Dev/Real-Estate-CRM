import { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler";
import {
  createLeadSchema,
  updateLeadSchema,
} from "../validation/lead.validation";
import { HTTPSTATUS } from "../config/http.config";
import {
  createLeadService,
  getLeadByIdService,
  getLeadsByStageService,
  getLeadsByWorkspaceService,
  updateLeadPositionService,
  updateLeadService,
  updateLeadStageService,
  deleteLeadService,
} from "../services/lead.service";

// Create a new lead
export const createLeadController = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const userId = req.user.id;
    const body = createLeadSchema.parse({ ...req.body });

    const result = await createLeadService({
      workspaceId,
      userId,
      data: body,
    });

    return res.status(HTTPSTATUS.CREATED).json({
      success: true,
      data: result,
    });
  }
);

// Get leads by workspace
export const getLeadsByWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const { stageId, assignedToId, search } = req.query;

    const leads = await getLeadsByWorkspaceService({
      workspaceId,
      stageId,
      assignedToId,
      search: search as string | undefined,
    });

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: leads,
    });
  }
);

// Get leads by stage
export const getLeadsByStageController = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId, stageId } = req.params;

    const leads = await getLeadsByStageService({
      workspaceId,
      stageId,
    });

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: leads,
    });
  }
);

// Get lead by ID
export const getLeadByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId, leadId } = req.params;

    const lead = await getLeadByIdService(workspaceId, leadId);

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: lead,
    });
  }
);

// Update lead by ID
export const updateLeadController = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId, leadId } = req.params;
    const updateData = updateLeadSchema.parse({ ...req.body });

    const updatedLead = await updateLeadService({
      workspaceId,
      leadId,
      userId: req.user.id,
      data: updateData,
    });

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: updatedLead,
    });
  }
);

// Update lead stage (for drag and drop)
export const updateLeadStageController = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId, leadId } = req.params;
    const { pipelineStageId } = req.body;

    const updatedLead = await updateLeadStageService({
      workspaceId,
      leadId,
      pipelineStageId,
    });

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: updatedLead,
    });
  }
);

// Update lead position within stage (for reordering)
export const updateLeadPositionController = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId, leadId } = req.params;
    const { newPosition, oldPosition } = req.body;

    const updatedLead = await updateLeadPositionService({
      workspaceId,
      leadId,
      newPosition,
      oldPosition,
    });

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: updatedLead,
    });
  }
);

// Delete lead
export const deleteLeadController = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId, leadId } = req.params;

    await deleteLeadService({
      workspaceId,
      leadId,
    });

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Lead deleted successfully",
    });
  }
);
