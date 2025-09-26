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
  checkPermission("CREATE_PIPELINE_STAGES"),
  createPipelineStageController
);

// Get pipeline stages by workspace
pipelineRoutes.get(
  "/:workspaceId/stages",
  checkPermission("VIEW_PIPELINE_STAGES"),
  getPipelineStagesController
);

// Update pipeline stage
pipelineRoutes.put(
  "/:workspaceId/stages/:stageId",
  checkPermission("EDIT_PIPELINE_STAGES"),
  updatePipelineStageController
);

// Delete pipeline stage
pipelineRoutes.delete(
  "/:workspaceId/stages/:stageId",
  checkPermission("DELETE_PIPELINE_STAGES"),
  deletePipelineStageController
);

// Reorder pipeline stages
pipelineRoutes.patch(
  "/:workspaceId/stages/reorder",
  checkPermission("EDIT_PIPELINE_STAGES"),
  reorderPipelineStagesController
);

export default pipelineRoutes;
