import { Router } from "express";

import {
  createPipelineStageController,
  getPipelineStagesController,
  updatePipelineStageController,
  deletePipelineStageController,
  reorderPipelineStagesController,
} from "../controllers/pipeline.controller";
import { authenticate } from "../middlewares/passportAuth.middleware";
import { checkPermission } from "../middlewares/permission.middleware";

const pipelineRoutes = Router();

// All pipeline routes require authentication
pipelineRoutes.use(authenticate);

// Create pipeline stage
pipelineRoutes.post(
  "/:workspaceId/stages",
  checkPermission("EDIT_SETTINGS"),
  createPipelineStageController
);

// Get pipeline stages by workspace
pipelineRoutes.get(
  "/:workspaceId/stages",
  checkPermission("VIEW_LEADS"),
  getPipelineStagesController
);

// Update pipeline stage
pipelineRoutes.put(
  "/:workspaceId/stages/:stageId",
  checkPermission("EDIT_SETTINGS"),
  updatePipelineStageController
);

// Delete pipeline stage
pipelineRoutes.delete(
  "/:workspaceId/stages/:stageId",
  checkPermission("EDIT_SETTINGS"),
  deletePipelineStageController
);

// Reorder pipeline stages
pipelineRoutes.patch(
  "/:workspaceId/stages/reorder",
  checkPermission("EDIT_SETTINGS"),
  reorderPipelineStagesController
);

export default pipelineRoutes;
