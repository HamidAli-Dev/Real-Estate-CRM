import { Router } from "express";
import {
  createRoleController,
  updateRolePermissionsController,
  getWorkspaceRolesController,
  getRoleByIdController,
  deleteRoleController,
  assignRoleToUserController,
  getPermissionsController,
} from "../controllers/role.controller";
import { authenticate } from "../middlewares/passportAuth.middleware";
import { checkPermission } from "../middlewares/permission.middleware";

const router = Router();

router.use(authenticate);

// Get all available permissions (for UI)
router.get("/permissions", getPermissionsController);

// Get all roles in workspace
router.get(
  "/workspace/:workspaceId",
  checkPermission("VIEW_USERS"),
  getWorkspaceRolesController
);

// Create new role in workspace
router.post(
  "/workspace/:workspaceId",
  checkPermission("EDIT_USER_ROLES"),
  createRoleController
);

// Get role by ID - Allow users to get their own role info without VIEW_USERS permission
router.get("/:roleId", getRoleByIdController);

// Update role permissions
router.put(
  "/:roleId/workspace/:workspaceId/permissions",
  checkPermission("EDIT_USER_ROLES"),
  updateRolePermissionsController
);

// Assign role to user in workspace
router.put(
  "/workspace/:workspaceId/assign",
  checkPermission("EDIT_USER_ROLES"),
  assignRoleToUserController
);

// Delete role from workspace
router.delete(
  "/workspace/:workspaceId/roles/:roleId",
  checkPermission("EDIT_USER_ROLES"),
  deleteRoleController
);

export default router;
