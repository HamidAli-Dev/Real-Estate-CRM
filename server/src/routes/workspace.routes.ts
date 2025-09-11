import { Router } from "express";

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
import { authenticate } from "../middlewares/passportAuth.middleware";
import { checkPermission } from "../middlewares/permission.middleware";

const workspaceRoutes = Router();

// All workspace routes require authentication
workspaceRoutes.use(authenticate);

// Create workspace - authenticated users can create workspaces (no permission check needed)
workspaceRoutes.post("/create", createWorkspaceController);

// Get user's workspaces
workspaceRoutes.get("/user", getUserWorkspacesController);

// Get specific workspace by ID
workspaceRoutes.get("/:workspaceId", getWorkspaceByIdController);

// Edit workspace - only Owners can edit workspaces
workspaceRoutes.put(
  "/:workspaceId",
  checkPermission("EDIT_SETTINGS"),
  editWorkspaceController
);

// Delete workspace - only Owners can delete workspaces
workspaceRoutes.delete(
  "/:workspaceId",
  checkPermission("EDIT_SETTINGS"),
  deleteWorkspaceController
);

// Get workspace users - accessible to all workspace members
workspaceRoutes.get(
  "/:workspaceId/users",
  checkPermission("VIEW_USERS"),
  getWorkspaceUsersController
);

// Invite user to workspace - only Owners and Admins
workspaceRoutes.post(
  "/:workspaceId/users/invite",
  checkPermission("INVITE_USERS"),
  inviteUserController
);

// Update user role - only Owners and Admins
workspaceRoutes.put(
  "/:workspaceId/users/:userId/role",
  checkPermission("EDIT_USER_ROLES"),
  updateUserRoleController
);

// Remove user from workspace - only Owners and Admins
workspaceRoutes.delete(
  "/:workspaceId/users/:userId",
  checkPermission("REMOVE_USERS"),
  removeUserController
);

export default workspaceRoutes;
