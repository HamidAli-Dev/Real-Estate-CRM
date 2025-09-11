import { Router } from "express";
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
import { checkPermission } from "../middlewares/permission.middleware";

const leadRoutes = Router();

// All lead routes require authentication
leadRoutes.use(authenticate);

// Create lead
leadRoutes.post(
  "/:workspaceId",
  checkPermission("CREATE_LEADS"),
  createLeadController
);

// Get leads by workspace
leadRoutes.get(
  "/:workspaceId",
  checkPermission("VIEW_LEADS"),
  getLeadsByWorkspaceController
);

// Get leads by stage
leadRoutes.get(
  "/:workspaceId/stage/:stageId",
  checkPermission("VIEW_LEADS"),
  getLeadsByStageController
);

// Get specific lead by ID
leadRoutes.get(
  "/:workspaceId/lead/:leadId",
  checkPermission("VIEW_LEADS"),
  getLeadByIdController
);

// Update lead
leadRoutes.put(
  "/:workspaceId/lead/:leadId",
  checkPermission("EDIT_LEADS"),
  updateLeadController
);

// Update lead stage
leadRoutes.patch(
  "/:workspaceId/lead/:leadId/stage",
  checkPermission("EDIT_LEADS"),
  updateLeadStageController
);

// Update lead position within stage
leadRoutes.patch(
  "/:workspaceId/lead/:leadId/position",
  checkPermission("EDIT_LEADS"),
  updateLeadPositionController
);

// Delete lead
leadRoutes.delete(
  "/:workspaceId/lead/:leadId",
  checkPermission("DELETE_LEADS"),
  deleteLeadController
);

export default leadRoutes;
