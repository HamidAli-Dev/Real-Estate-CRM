import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { HTTPSTATUS } from "../config/http.config";
import {
  createWorkspaceService,
  getUserWorkspacesService,
  editWorkspaceService,
  getWorkspaceByIdService,
  getWorkspaceUsersService,
  inviteUserToWorkspaceService,
  updateUserRoleService,
  removeUserFromWorkspaceService,
  deleteWorkspaceService,
} from "../services/workspace.service";
import { BadRequestException } from "../utils/AppError";
import { createWorkspaceSchema } from "../validation/workspace.validation";

export const createWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { name } = createWorkspaceSchema.parse({ ...req.body });

    // Create workspace
    const workspace = await createWorkspaceService({ name }, userId);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Workspace created successfully",
      data: {
        workspace: {
          id: workspace.id,
          name: workspace.name,
          createdAt: workspace.createdAt,
        },
        userRole: "Owner",
      },
    });
  }
);

export const getUserWorkspacesController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user.id;

    const userWorkspaces = await getUserWorkspacesService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "User workspaces fetched successfully",
      data: userWorkspaces,
    });
  }
);

export const editWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const workspaceId = req.params.workspaceId;
    const { name } = req.body;

    // Validate input data
    if (!name) {
      throw new BadRequestException("Business name is required");
    }

    // Edit workspace
    const workspace = await editWorkspaceService(workspaceId, userId, {
      name,
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Workspace updated successfully",
      data: {
        workspace: {
          id: workspace.id,
          name: workspace.name,
          updatedAt: workspace.updatedAt,
        },
      },
    });
  }
);

export const getWorkspaceByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const workspaceId = req.params.workspaceId;

    const userWorkspace = await getWorkspaceByIdService(workspaceId, userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Workspace fetched successfully",
      data: userWorkspace,
    });
  }
);

export const getWorkspaceUsersController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const workspaceId = req.params.workspaceId;

    const workspaceUsers = await getWorkspaceUsersService(workspaceId, userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Workspace users fetched successfully",
      data: workspaceUsers,
    });
  }
);

export const inviteUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const workspaceId = req.params.workspaceId;
    const { name, email, roleId, tempPassword } = req.body;

    const result = await inviteUserToWorkspaceService(workspaceId, userId, {
      name,
      email,
      roleId,
      tempPassword,
    });

    return res.status(HTTPSTATUS.CREATED).json({
      message: "User invited to workspace successfully",
      data: result,
    });
  }
);

export const updateUserRoleController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const workspaceId = req.params.workspaceId;
    const targetUserId = req.params.userId;
    const { roleId, permissions } = req.body;

    const result = await updateUserRoleService(
      workspaceId,
      targetUserId,
      userId,
      { roleId, permissions }
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "User role updated successfully",
      data: result,
    });
  }
);

export const removeUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const workspaceId = req.params.workspaceId;
    const targetUserId = req.params.userId;

    const result = await removeUserFromWorkspaceService(
      workspaceId,
      targetUserId,
      userId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "User removed from workspace successfully",
      data: result,
    });
  }
);

export const deleteWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const workspaceId = req.params.workspaceId;

    const result = await deleteWorkspaceService(workspaceId, userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Workspace deleted successfully",
      data: result,
    });
  }
);
