import * as QueryString from "qs";

import { db } from "../utils/db";
import { LeadPriority, LeadSource } from "@prisma/client";
import { BadRequestException } from "../utils/AppError";

interface CreateLeadInput {
  workspaceId: string;
  userId: string;
  data: {
    name: string;
    contactInfo: string;
    pipelineStageId: string;
    assignedToId: string;
    notes?: string;
    source?: LeadSource;
    priority?: LeadPriority;
    propertyIds?: string[];
    phone?: string;
    budget?: number;
    tags?: string[];
  };
}

// Create lead
export const createLeadService = async ({
  workspaceId,
  data,
}: CreateLeadInput) => {
  // Check if pipeline stage exists and belongs to workspace
  const pipelineStage = await db.pipelineStage.findFirst({
    where: {
      id: data.pipelineStageId,
      workspaceId,
    },
  });

  if (!pipelineStage) {
    throw new BadRequestException("Invalid pipeline stage ID");
  }

  // Check if assigned user exists and belongs to workspace
  const assignedUser = await db.userWorkspace.findFirst({
    where: {
      userId: data.assignedToId,
      workspaceId,
    },
  });

  if (!assignedUser) {
    throw new BadRequestException("Invalid assigned user ID");
  }

  // Get the next position for leads in this stage
  const lastLead = await db.lead.findFirst({
    where: {
      pipelineStageId: data.pipelineStageId,
      workspaceId,
    },
    orderBy: {
      position: "desc",
    },
  });

  const nextPosition = lastLead ? lastLead.position + 1 : 0;

  // Create lead with property associations
  const lead = await db.lead.create({
    data: {
      name: data.name,
      contactInfo: data.contactInfo,
      pipelineStageId: data.pipelineStageId,
      assignedToId: data.assignedToId,
      workspaceId,
      notes: data.notes || undefined,
      source: (data.source as LeadSource) || undefined,
      priority: data.priority || undefined,
      phone: data.phone || undefined,
      budget: typeof data.budget === "number" ? data.budget : undefined,
      tags: data.tags && data.tags.length ? data.tags : undefined,
      position: nextPosition,
      lastContactedAt: new Date(),
      properties:
        data.propertyIds && data.propertyIds.length > 0
          ? {
              create: data.propertyIds.map((propertyId: string) => ({
                propertyId,
              })),
            }
          : undefined,
    },
    include: {
      pipelineStage: true,
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      properties: {
        include: {
          property: {
            select: {
              id: true,
              title: true,
              price: true,
              images: {
                select: {
                  url: true,
                  alt: true,
                },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  return lead;
};

interface GetLeadsByWorkspaceInput {
  workspaceId: string;
  stageId?: string | QueryString.ParsedQs | (string | QueryString.ParsedQs)[];
  assignedToId?:
    | string
    | QueryString.ParsedQs
    | (string | QueryString.ParsedQs)[];
  search?: string;
}

// Get leads by workspace with optional filters
export const getLeadsByWorkspaceService = async ({
  workspaceId,
  stageId,
  assignedToId,
  search,
}: GetLeadsByWorkspaceInput) => {
  const where: object = { workspaceId };

  if (stageId) {
    Object.assign(where, { pipelineStageId: stageId });
  }

  if (assignedToId) {
    Object.assign(where, { assignedToId });
  }

  if (search) {
    Object.assign(where, {
      OR: [
        { name: { contains: search as string, mode: "insensitive" } },
        { contactInfo: { contains: search as string, mode: "insensitive" } },
        { notes: { contains: search as string, mode: "insensitive" } },
      ],
    });
  }

  const leads = await db.lead.findMany({
    where,
    include: {
      pipelineStage: true,
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      properties: {
        include: {
          property: {
            select: {
              id: true,
              title: true,
              price: true,
              images: {
                select: {
                  url: true,
                  alt: true,
                },
                take: 1,
              },
            },
          },
        },
      },
      activities: {
        orderBy: {
          scheduledAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      position: "asc",
    },
  });

  return leads;
};

interface GetLeadsByStageInput {
  workspaceId: string;
  stageId: string;
}

// Get leads by stage
export const getLeadsByStageService = async ({
  workspaceId,
  stageId,
}: GetLeadsByStageInput) => {
  const leads = await db.lead.findMany({
    where: {
      workspaceId,
      pipelineStageId: stageId,
    },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      properties: {
        include: {
          property: {
            select: {
              id: true,
              title: true,
              price: true,
              images: {
                select: {
                  url: true,
                  alt: true,
                },
                take: 1,
              },
            },
          },
        },
      },
      activities: {
        orderBy: {
          scheduledAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      position: "asc",
    },
  });

  return leads;
};

// Get lead by ID

export const getLeadByIdService = async (
  workspaceId: string,
  leadId: string
) => {
  const lead = await db.lead.findFirst({
    where: {
      id: leadId,
      workspaceId,
    },
    include: {
      pipelineStage: true,
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      properties: {
        include: {
          property: {
            select: {
              id: true,
              title: true,
              description: true,
              price: true,
              location: true,
              city: true,
              images: {
                select: {
                  url: true,
                  alt: true,
                },
              },
            },
          },
        },
      },
      activities: {
        orderBy: {
          scheduledAt: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!lead) {
    throw new BadRequestException("Lead not found");
  }

  return lead;
};

interface UpdateLeadInput {
  workspaceId: string;
  leadId: string;
  data: {
    name?: string;
    contactInfo?: string;
    phone?: string;
    pipelineStageId?: string;
    assignedToId?: string;
    notes?: string;
    source?: LeadSource;
    priority?: LeadPriority;
    budget?: number;
    tags?: string[];
    propertyIds?: string[];
  };
}

// Update lead
export const updateLeadService = async ({
  workspaceId,
  leadId,
  data,
}: UpdateLeadInput) => {
  // Check if lead exists and belongs to workspace
  const existingLead = await db.lead.findFirst({
    where: {
      id: leadId,
      workspaceId,
    },
  });

  if (!existingLead) {
    throw new BadRequestException("Lead not found");
  }

  // If updating pipeline stage, validate it exists
  if (data.pipelineStageId) {
    const pipelineStage = await db.pipelineStage.findFirst({
      where: {
        id: data.pipelineStageId,
        workspaceId,
      },
    });

    if (!pipelineStage) {
      throw new BadRequestException("Pipeline stage not found");
    }
  }

  // If updating assigned user, validate they belong to workspace
  if (data.assignedToId) {
    const assignedUser = await db.userWorkspace.findFirst({
      where: {
        userId: data.assignedToId,
        workspaceId,
      },
    });

    if (!assignedUser) {
      throw new BadRequestException("Assigned user not found in workspace");
    }
  }

  // Handle property associations
  if (data.propertyIds) {
    // Remove existing associations
    await db.leadProperty.deleteMany({
      where: {
        leadId,
      },
    });

    // Create new associations
    if (data.propertyIds.length > 0) {
      await db.leadProperty.createMany({
        data: data.propertyIds.map((propertyId: string) => ({
          leadId,
          propertyId,
        })),
      });
    }

    // Remove propertyIds from updateData to avoid Prisma errors
    delete data.propertyIds;
  }

  const updatedLead = await db.lead.update({
    where: {
      id: leadId,
    },
    data,
    include: {
      pipelineStage: true,
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      properties: {
        include: {
          property: {
            select: {
              id: true,
              title: true,
              price: true,
              images: {
                select: {
                  url: true,
                  alt: true,
                },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  return updatedLead;
};

interface UpdateLeadStageInput {
  workspaceId: string;
  leadId: string;
  pipelineStageId: string;
}

// update lead stage (drag and drop)
export const updateLeadStageService = async ({
  workspaceId,
  leadId,
  pipelineStageId,
}: UpdateLeadStageInput) => {
  if (!pipelineStageId) {
    throw new BadRequestException("Pipeline stage ID is required");
  }

  // Check if lead exists and belongs to workspace
  const existingLead = await db.lead.findFirst({
    where: {
      id: leadId,
      workspaceId,
    },
  });

  if (!existingLead) {
    throw new BadRequestException("Lead not found");
  }

  // Check if new pipeline stage exists and belongs to workspace
  const pipelineStage = await db.pipelineStage.findFirst({
    where: {
      id: pipelineStageId,
      workspaceId,
    },
  });

  if (!pipelineStage) {
    throw new BadRequestException("Pipeline stage not found");
  }

  const updatedLead = await db.lead.update({
    where: {
      id: leadId,
    },
    data: {
      pipelineStageId,
    },
    include: {
      pipelineStage: true,
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      properties: {
        include: {
          property: {
            select: {
              id: true,
              title: true,
              price: true,
              images: {
                select: {
                  url: true,
                  alt: true,
                },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  return updatedLead;
};

interface UpdateLeadPositionInput {
  workspaceId: string;
  leadId: string;
  newPosition: number;
  oldPosition: number;
}
// Update lead position within stage (for reordering)
export const updateLeadPositionService = async ({
  workspaceId,
  leadId,
  newPosition,
  oldPosition,
}: UpdateLeadPositionInput) => {
  if (typeof newPosition !== "number" || newPosition < 0) {
    throw new BadRequestException("Valid new position is required");
  }

  // Check if lead exists and belongs to workspace
  const existingLead = await db.lead.findFirst({
    where: {
      id: leadId,
      workspaceId,
    },
  });

  if (!existingLead) {
    throw new BadRequestException("Lead not found");
  }

  // Get all leads in the same stage to update positions
  const stageLeads = await db.lead.findMany({
    where: {
      pipelineStageId: existingLead.pipelineStageId,
      workspaceId,
    },
    orderBy: {
      position: "asc",
    },
  });

  // Update positions based on the move
  if (oldPosition !== undefined && oldPosition !== newPosition) {
    if (oldPosition < newPosition) {
      // Moving down: decrease positions of leads between old and new
      await db.lead.updateMany({
        where: {
          id: {
            in: stageLeads.map((l) => l.id).filter((id) => id !== leadId),
          },
          position: { gte: oldPosition, lte: newPosition },
        },
        data: {
          position: { decrement: 1 },
        },
      });
    } else {
      // Moving up: increase positions of leads between new and old
      await db.lead.updateMany({
        where: {
          id: {
            in: stageLeads.map((l) => l.id).filter((id) => id !== leadId),
          },
          position: { gte: newPosition, lte: oldPosition },
        },
        data: {
          position: { increment: 1 },
        },
      });
    }
  }

  // Update the moved lead's position
  const updatedLead = await db.lead.update({
    where: {
      id: leadId,
    },
    data: {
      position: newPosition,
    },
    include: {
      pipelineStage: true,
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      properties: {
        include: {
          property: {
            select: {
              id: true,
              title: true,
              price: true,
              images: {
                select: {
                  url: true,
                  alt: true,
                },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  return updatedLead;
};

interface DeleteLeadInput {
  workspaceId: string;
  leadId: string;
}
// Delete lead
export const deleteLeadService = async ({
  workspaceId,
  leadId,
}: DeleteLeadInput) => {
  // Check if lead exists and belongs to workspace
  const existingLead = await db.lead.findFirst({
    where: {
      id: leadId,
      workspaceId,
    },
  });

  if (!existingLead) {
    throw new BadRequestException("Lead not found");
  }

  // Delete lead (cascade will handle related records)
  await db.lead.delete({
    where: {
      id: leadId,
    },
  });
};
