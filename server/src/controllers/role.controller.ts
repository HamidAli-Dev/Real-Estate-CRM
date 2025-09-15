import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { HTTPSTATUS } from "../config/http.config";
import {
  createRoleService,
  updateRolePermissionsService,
  getWorkspaceRolesService,
  getRoleByIdService,
  deleteRoleService,
  assignRoleToUserService,
  getPermissionsService,
} from "../services/role.service";
import { BadRequestException } from "../utils/AppError";

// Create a new role
export const createRoleController = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const { name, permissions } = req.body;

    if (!workspaceId) {
      throw new BadRequestException("Workspace ID is required");
    }

    const role = await createRoleService({
      name,
      workspaceId,
      permissions,
    });

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Role created successfully",
      data: role,
    });
  }
);

// Update role permissions
export const updateRolePermissionsController = asyncHandler(
  async (req: Request, res: Response) => {
    const { roleId, workspaceId } = req.params;
    const { roleName, permissions } = req.body;

    const updatedPermissions = await updateRolePermissionsService({
      workspaceId,
      roleId,
      roleName,
      permissions,
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Role permissions updated successfully",
      data: updatedPermissions,
    });
  }
);

// Get all roles in workspace
export const getWorkspaceRolesController = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.params;

    if (!workspaceId) {
      throw new BadRequestException("Workspace ID is required");
    }

    const roles = await getWorkspaceRolesService(workspaceId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Roles fetched successfully",
      data: roles,
    });
  }
);

// Get role by ID
export const getRoleByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const { roleId } = req.params;

    const role = await getRoleByIdService(roleId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Role fetched successfully",
      data: role,
    });
  }
);

// Delete role
export const deleteRoleController = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId, roleId } = req.params;

    if (!workspaceId) {
      throw new BadRequestException("Workspace ID is required");
    }

    const result = await deleteRoleService(roleId, workspaceId);

    return res.status(HTTPSTATUS.OK).json({
      message: result.message,
    });
  }
);

// Assign role to user
export const assignRoleToUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, roleId } = req.body;
    const { workspaceId } = req.params;

    if (!workspaceId) {
      throw new BadRequestException("Workspace ID is required");
    }

    const userWorkspace = await assignRoleToUserService({
      userId,
      roleId,
      workspaceId,
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Role assigned successfully",
      data: userWorkspace,
    });
  }
);

// Get all available permissions
export const getPermissionsController = asyncHandler(
  async (req: Request, res: Response) => {
    const permissions = await getPermissionsService();

    return res.status(HTTPSTATUS.OK).json({
      message: "Permissions fetched successfully",
      data: permissions,
    });
  }
);
