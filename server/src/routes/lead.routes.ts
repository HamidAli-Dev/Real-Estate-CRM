import { Router } from "express";
import { Role } from "@prisma/client";

import {
  createLeadController,
  getLeadsByWorkspaceController,
  getLeadByIdController,
  updateLeadController,
  deleteLeadController,
  updateLeadStageController,
  getLeadsByStageController,
  updateLeadPositionController,
} from "../controllers/lead.controller";
import { authenticate } from "../middlewares/passportAuth.middleware";
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware";

const leadRoutes = Router();

// All lead routes require authentication
leadRoutes.use(authenticate);

// Create lead - accessible to all workspace members
leadRoutes.post(
  "/:workspaceId",
  authorizeRoles(Role.Owner, Role.Admin, Role.Manager, Role.Agent),
  createLeadController
);

// Get leads by workspace - accessible to all workspace members
leadRoutes.get(
  "/:workspaceId",
  authorizeRoles(Role.Owner, Role.Admin, Role.Manager, Role.Agent),
  getLeadsByWorkspaceController
);

// Get leads by stage - accessible to all workspace members
leadRoutes.get(
  "/:workspaceId/stage/:stageId",
  authorizeRoles(Role.Owner, Role.Admin, Role.Manager, Role.Agent),
  getLeadsByStageController
);

// Get specific lead by ID - accessible to all workspace members
leadRoutes.get(
  "/:workspaceId/lead/:leadId",
  authorizeRoles(Role.Owner, Role.Admin, Role.Manager, Role.Agent),
  getLeadByIdController
);

// Update lead - accessible to assigned agent and above
leadRoutes.put(
  "/:workspaceId/lead/:leadId",
  authorizeRoles(Role.Owner, Role.Admin, Role.Manager, Role.Agent),
  updateLeadController
);

// Update lead stage - accessible to assigned agent and above
leadRoutes.patch(
  "/:workspaceId/lead/:leadId/stage",
  authorizeRoles(Role.Owner, Role.Admin, Role.Manager, Role.Agent),
  updateLeadStageController
);

// Update lead position within stage - accessible to assigned agent and above
leadRoutes.patch(
  "/:workspaceId/lead/:leadId/position",
  authorizeRoles(Role.Owner, Role.Admin, Role.Manager, Role.Agent),
  updateLeadPositionController
);

// Delete lead - only Owners and Admins
leadRoutes.delete(
  "/:workspaceId/lead/:leadId",
  authorizeRoles(Role.Owner, Role.Admin),
  deleteLeadController
);

export default leadRoutes;
