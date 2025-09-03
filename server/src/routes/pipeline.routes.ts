import { Router } from "express";
import { Role } from "@prisma/client";

import {
  createPipelineStageController,
  getPipelineStagesController,
  updatePipelineStageController,
  deletePipelineStageController,
  reorderPipelineStagesController,
} from "../controllers/pipeline.controller";
import { authenticate } from "../middlewares/passportAuth.middleware";
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware";

const pipelineRoutes = Router();

// All pipeline routes require authentication
pipelineRoutes.use(authenticate);

// Create pipeline stage - only Owners and Admins
pipelineRoutes.post(
  "/:workspaceId/stages",
  authorizeRoles(Role.Owner, Role.Admin),
  createPipelineStageController
);

// Get pipeline stages by workspace - accessible to all workspace members
pipelineRoutes.get(
  "/:workspaceId/stages",
  authorizeRoles(Role.Owner, Role.Admin, Role.Manager, Role.Agent),
  getPipelineStagesController
);

// Update pipeline stage - only Owners and Admins
pipelineRoutes.put(
  "/:workspaceId/stages/:stageId",
  authorizeRoles(Role.Owner, Role.Admin),
  updatePipelineStageController
);

// Delete pipeline stage - only Owners and Admins
pipelineRoutes.delete(
  "/:workspaceId/stages/:stageId",
  authorizeRoles(Role.Owner, Role.Admin),
  deletePipelineStageController
);

// Reorder pipeline stages - only Owners and Admins
pipelineRoutes.patch(
  "/:workspaceId/stages/reorder",
  authorizeRoles(Role.Owner, Role.Admin),
  reorderPipelineStagesController
);

export default pipelineRoutes;
