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
import { db } from "../utils/db";

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

// Get role by ID - Modified to ensure users can only get roles they're assigned to
export const getRoleByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const { roleId } = req.params;
    const userId = req.user.id;

    // First, check if the user is assigned to this role in any workspace
    const userRole = await db.userWorkspace.findFirst({
      where: {
        userId,
        roleId,
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    // Also check if user is owner of a workspace
    const ownerWorkspaces = await db.workspace.findMany({
      where: {
        users: {
          some: {
            userId,
            role: {
              isSystem: true,
              name: "Owner",
            },
          },
        },
      },
    });

    // Check if the requested role belongs to any of the user's owner workspaces
    let ownerCheck = null;
    if (ownerWorkspaces.length > 0) {
      const ownerWorkspaceIds = ownerWorkspaces.map((w) => w.id);
      ownerCheck = await db.role.findFirst({
        where: {
          id: roleId,
          workspaceId: {
            in: ownerWorkspaceIds,
          },
        },
      });
    }

    // If user has the role assigned or is an owner of the workspace with this role, fetch the full role details
    let role = userRole?.role;
    if (!role && ownerCheck) {
      role = await getRoleByIdService(roleId);
    }

    if (!role) {
      throw new BadRequestException("Role not found or access denied");
    }

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
