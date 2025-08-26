import { Router } from "express";
import { Role } from "@prisma/client";

import {
  createWorkspaceController,
  getUserWorkspacesController,
  editWorkspaceController,
  getWorkspaceByIdController,
  getWorkspaceUsersController,
  inviteUserController,
  updateUserRoleController,
  removeUserController,
  deleteWorkspaceController,
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

// Delete workspace - only Owners can delete workspaces
workspaceRoutes.delete(
  "/:workspaceId",
  authorizeRoles(Role.Owner),
  deleteWorkspaceController
);

// Get workspace users - accessible to all workspace members
workspaceRoutes.get("/:workspaceId/users", getWorkspaceUsersController);

// Invite user to workspace - only Owners and Admins
workspaceRoutes.post(
  "/:workspaceId/users/invite",
  authorizeRoles(Role.Owner, Role.Admin),
  inviteUserController
);

// Update user role - only Owners and Admins
workspaceRoutes.put(
  "/:workspaceId/users/:userId/role",
  authorizeRoles(Role.Owner, Role.Admin),
  updateUserRoleController
);

// Remove user from workspace - only Owners and Admins
workspaceRoutes.delete(
  "/:workspaceId/users/:userId",
  authorizeRoles(Role.Owner, Role.Admin),
  removeUserController
);

export default workspaceRoutes;
