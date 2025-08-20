import { Router } from "express";
import { Role } from "@prisma/client";

import {
  createWorkspaceController,
  getUserWorkspacesController,
  editWorkspaceController,
  getWorkspaceByIdController,
} from "../controllers/workspace.controller";
import { authenticate } from "../middlewares/isAuthenticated.middleware";
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware";

const workspaceRoutes = Router();

// All workspace routes require authentication
workspaceRoutes.use(authenticate);

// Create workspace - only Owners can create workspaces
workspaceRoutes.post(
  "/create",
  authorizeRoles(Role.Owner),
  createWorkspaceController
);

// Get user's workspaces
workspaceRoutes.get("/user", getUserWorkspacesController);

// Get specific workspace by ID
workspaceRoutes.get("/:workspaceId", getWorkspaceByIdController);

// Edit workspace - only Owners can edit workspaces
workspaceRoutes.put(
  "/:workspaceId",
  authorizeRoles(Role.Owner),
  editWorkspaceController
);

export default workspaceRoutes;
