import { ErrorCode } from "../enums/error-code.enum";
import { UnauthorizedException } from "../utils/AppError";
import { db } from "../utils/db";

interface CreatePipelineStageInput {
  name: string;
  color: string;
  workspaceId: string;
  userId: string;
}
export const createPipelineStageService = async ({
  name,
  color,
  workspaceId,
  userId,
}: CreatePipelineStageInput) => {
  // // First, verify that the user has access to this workspace
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
    console.error("❌ User doesn't have access to workspace:", workspaceId);
    throw new UnauthorizedException(
      `You don't have access to workspace ${workspaceId}`,
      ErrorCode.ACCESS_FORBIDDEN
    );
  }

  // Get the highest order number and add 1
  const lastStage = await db.pipelineStage.findFirst({
    where: { workspaceId },
    orderBy: { order: "desc" },
  });

  const order = lastStage ? lastStage.order + 1 : 1;

  const pipelineStage = await db.pipelineStage.create({
    data: {
      name,
      order,
      color,
      workspaceId,
    },
  });

  return pipelineStage;
};

export const getPipelineStagesService = async (
  workspaceId: string,
  userId: string
) => {
  // First, verify that the user has access to this workspace
  const userWorkspace = await db.userWorkspace.findFirst({
    where: {
      workspaceId,
      userId,
    },
  });

  if (!userWorkspace) {
    console.error("❌ User doesn't have access to workspace:", workspaceId);
    throw new UnauthorizedException(
      `You don't have access to workspace ${workspaceId}`,
      ErrorCode.ACCESS_FORBIDDEN
    );
  }

  const pipelineStages = await db.pipelineStage.findMany({
    where: { workspaceId },
    include: {
      _count: {
        select: {
          leads: true,
          deals: true,
        },
      },
    },
    orderBy: { order: "asc" },
  });

  return pipelineStages;
};

interface UpdatePipelineStageInput {
  name: string;
  color?: string;
  workspaceId: string;
  stageId: string;
  userId: string;
}

export const updatePipelineStageService = async ({
  name,
  color,
  workspaceId,
  stageId,
  userId,
}: UpdatePipelineStageInput) => {
  // // First, verify that the user has access to this workspace
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
    console.error("❌ User doesn't have access to workspace:", workspaceId);
    throw new UnauthorizedException(
      `You don't have access to workspace ${workspaceId}`,
      ErrorCode.ACCESS_FORBIDDEN
    );
  }

  // Check if stage exists and belongs to workspace
  const existingStage = await db.pipelineStage.findFirst({
    where: {
      id: stageId,
      workspaceId,
    },
  });

  if (!existingStage) {
    throw new UnauthorizedException(
      "Pipeline stage not found",
      ErrorCode.AUTH_NOT_FOUND
    );
  }

  const updatedStage = await db.pipelineStage.update({
    where: { id: stageId },
    data: {
      name,
      ...(color !== undefined && { color }),
    },
  });

  return updatedStage;
};

interface DeletePipelineStageInput {
  workspaceId: string;
  stageId: string;
  userId: string;
}

export const deletePipelineStageService = async ({
  workspaceId,
  stageId,
  userId,
}: DeletePipelineStageInput) => {
  // // First, verify that the user has access to this workspace
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
    console.error("❌ User doesn't have access to workspace:", workspaceId);
    throw new UnauthorizedException(
      `You don't have access to workspace ${workspaceId}`,
      ErrorCode.ACCESS_FORBIDDEN
    );
  }

  // Check if stage exists and belongs to workspace
  const existingStage = await db.pipelineStage.findFirst({
    where: {
      id: stageId,
      workspaceId,
    },
  });

  if (!existingStage) {
    throw new UnauthorizedException(
      "Pipeline stage not found",
      ErrorCode.AUTH_NOT_FOUND
    );
  }

  // Check if stage has any leads or deals
  const stageUsage = await db.pipelineStage.findFirst({
    where: { id: stageId },
    include: {
      _count: {
        select: {
          leads: true,
          deals: true,
        },
      },
    },
  });

  if (
    stageUsage &&
    (stageUsage._count.leads > 0 || stageUsage._count.deals > 0)
  ) {
    throw new UnauthorizedException(
      "Cannot delete stage with existing leads or deals",
      ErrorCode.ACCESS_FORBIDDEN
    );
  }

  // If no leads or deals, proceed to delete stage
  await db.pipelineStage.delete({
    where: { id: stageId },
  });

  return true;
};

interface ReorderPipelineStagesInput {
  workspaceId: string;
  userId: string;
  stageOrders: { id: string; order: number }[];
}

export const reorderPipelineStagesService = async ({
  workspaceId,
  userId,
  stageOrders,
}: ReorderPipelineStagesInput) => {
  // // First, verify that the user has access to this workspace
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
    console.error("❌ User doesn't have access to workspace:", workspaceId);
    throw new UnauthorizedException(
      `You don't have access to workspace ${workspaceId}`,
      ErrorCode.ACCESS_FORBIDDEN
    );
  }

  if (!Array.isArray(stageOrders)) {
    throw new UnauthorizedException(
      "Stage orders must be an array",
      ErrorCode.VALIDATION_ERROR
    );
  }

  // Validate all stages belong to workspace
  const stageIds = stageOrders.map((item: any) => item.id);
  const existingStages = await db.pipelineStage.findMany({
    where: {
      id: { in: stageIds },
      workspaceId,
    },
  });

  if (existingStages.length !== stageIds.length) {
    throw new UnauthorizedException(
      "Some pipeline stages not found",
      ErrorCode.AUTH_NOT_FOUND
    );
  }

  // Update all stages with new order
  const updatePromises = stageOrders.map((item: any) =>
    db.pipelineStage.update({
      where: { id: item.id },
      data: { order: item.order },
    })
  );

  await Promise.all(updatePromises);

  // Return updated stages
  const updatedStages = await db.pipelineStage.findMany({
    where: { workspaceId },
    include: {
      _count: {
        select: {
          leads: true,
          deals: true,
        },
      },
    },
    orderBy: { order: "asc" },
  });

  return updatedStages;
};
