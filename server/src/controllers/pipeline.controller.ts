import { Request, Response } from "express";

import { asyncHandler } from "../utils/asyncHandler";
import {
  createPipelineStageSchema,
  reorderPipelineStagesSchema,
  updatePipelineStageSchema,
} from "../validation/pipeline.validation";
import {
  createPipelineStageService,
  deletePipelineStageService,
  getPipelineStagesService,
  reorderPipelineStagesService,
  updatePipelineStageService,
} from "../services/pipeline.service";
import { HTTPSTATUS } from "../config/http.config";

// Create a new pipeline stage
export const createPipelineStageController = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const { name, color } = createPipelineStageSchema.parse({ ...req.body });
    const userId = req.user.id;

    const result = await createPipelineStageService({
      name,
      color,
      workspaceId,
      userId,
    });

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Pipeline stage created successfully",
      data: result,
    });
  }
);

// Get pipeline stages by workspace
export const getPipelineStagesController = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const userId = req.user.id;

    const result = await getPipelineStagesService(workspaceId, userId);

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: result,
    });
  }
);

// Update pipeline stage
export const updatePipelineStageController = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId, stageId } = req.params;
    const userId = req.user.id;
    const { name, color } = updatePipelineStageSchema.parse({ ...req.body });

    const result = await updatePipelineStageService({
      name,
      color,
      workspaceId,
      userId,
      stageId,
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Pipeline stage updated successfully",
      data: result,
    });
  }
);

// Delete pipeline stage
export const deletePipelineStageController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { workspaceId, stageId } = req.params;

    const result = await deletePipelineStageService({
      workspaceId,
      userId,
      stageId,
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Pipeline stage deleted successfully",
      data: result,
    });
  }
);

// Reorder pipeline stages
export const reorderPipelineStagesController = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const userId = req.user.id;
    const { stageOrders } = reorderPipelineStagesSchema.parse({ ...req.body }); // Array of { id, order }

    const result = await reorderPipelineStagesService({
      workspaceId,
      stageOrders,
      userId,
    });

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: result,
    });
  }
);
