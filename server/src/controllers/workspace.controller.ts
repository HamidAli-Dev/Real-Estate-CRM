import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { HTTPSTATUS } from "../config/http.config";
import {
  createWorkspaceService,
  getUserWorkspacesService,
  editWorkspaceService,
  getWorkspaceByIdService,
} from "../services/workspace.service";
import { BadRequestException } from "../utils/AppError";

export const createWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { name, domain } = req.body;

    // Validate input data
    if (!name || !domain) {
      throw new BadRequestException("Name and domain are required");
    }

    // Create workspace
    const workspace = await createWorkspaceService({ name, domain }, userId);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Workspace created successfully",
      data: {
        workspace: {
          id: workspace.id,
          name: workspace.name,
          domain: workspace.domain,
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
    const { name, domain } = req.body;

    // Validate input data
    if (!name) {
      throw new BadRequestException("Business name is required");
    }

    // Edit workspace
    const workspace = await editWorkspaceService(workspaceId, userId, {
      name,
      domain,
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Workspace updated successfully",
      data: {
        workspace: {
          id: workspace.id,
          name: workspace.name,
          domain: workspace.domain,
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
