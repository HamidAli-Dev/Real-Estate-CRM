import { db } from "../utils/db";
import {
  CreateWorkspaceInput,
  EditWorkspaceInput,
} from "../validation/workspace.validation";
import { BadRequestException } from "../utils/AppError";

export const createWorkspaceService = async (
  data: CreateWorkspaceInput,
  userId: string
) => {
  // Check if domain already exists
  const existingWorkspace = await db.workspace.findFirst({
    where: {
      domain: data.domain,
    },
  });

  if (existingWorkspace) {
    throw new BadRequestException(
      `Domain '${data.domain}.eliteestate.com' is already taken. Please choose a different domain.`
    );
  }

  // Create workspace and user-workspace relationship in a transaction
  const result = await db.$transaction(async (tx) => {
    // Create the workspace
    const workspace = await tx.workspace.create({
      data: {
        name: data.name,
        domain: data.domain,
        subscriptionPlan: null, // Will be set when subscription is created
      },
    });

    // Create user-workspace relationship with Owner role
    await tx.userWorkspace.create({
      data: {
        userId,
        workspaceId: workspace.id,
        role: "Owner",
      },
    });

    // Create default workspace settings
    await tx.workspaceSettings.create({
      data: {
        workspaceId: workspace.id,
        onboardingCompleted: false,
      },
    });

    return workspace;
  });

  return result;
};

export const getUserWorkspacesService = async (userId: string) => {
  const userWorkspaces = await db.userWorkspace.findMany({
    where: {
      userId,
    },
    include: {
      workspace: {
        include: {
          settings: true,
        },
      },
    },
  });

  return userWorkspaces;
};

export const editWorkspaceService = async (
  workspaceId: string,
  userId: string,
  data: EditWorkspaceInput
) => {
  // Check if user has access to this workspace
  const userWorkspace = await db.userWorkspace.findFirst({
    where: {
      workspaceId,
      userId,
    },
    include: {
      workspace: true,
    },
  });

  if (!userWorkspace) {
    throw new BadRequestException("You don't have access to this workspace");
  }

  // Only Owners can edit workspaces
  if (userWorkspace.role !== "Owner") {
    throw new BadRequestException("Only workspace owners can edit workspaces");
  }

  const workspace = userWorkspace.workspace;

  // If trying to edit domain, check if current domain is null
  if (data.domain && workspace.domain) {
    throw new BadRequestException(
      "Domain cannot be edited once it's set. Please contact support if you need to change the domain."
    );
  }

  // If setting a new domain, check if it's already taken
  if (data.domain && !workspace.domain) {
    const existingWorkspace = await db.workspace.findFirst({
      where: {
        domain: data.domain,
        id: { not: workspaceId }, // Exclude current workspace
      },
    });

    if (existingWorkspace) {
      throw new BadRequestException(
        `Domain '${data.domain}.eliteestate.com' is already taken. Please choose a different domain.`
      );
    }
  }

  // Update workspace
  const updatedWorkspace = await db.workspace.update({
    where: { id: workspaceId },
    data: {
      name: data.name,
      ...(data.domain && !workspace.domain ? { domain: data.domain } : {}),
    },
  });

  return updatedWorkspace;
};

export const getWorkspaceByIdService = async (
  workspaceId: string,
  userId: string
) => {
  const userWorkspace = await db.userWorkspace.findFirst({
    where: {
      workspaceId,
      userId,
    },
    include: {
      workspace: {
        include: {
          settings: true,
        },
      },
    },
  });

  if (!userWorkspace) {
    throw new BadRequestException("You don't have access to this workspace");
  }

  return userWorkspace;
};
