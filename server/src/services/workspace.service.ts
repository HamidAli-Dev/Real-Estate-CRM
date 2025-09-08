import { db } from "../utils/db";
import {
  CreateWorkspaceInput,
  EditWorkspaceInput,
  InviteUserInput,
  UpdateUserRoleInput,
} from "../validation/workspace.validation";
import { BadRequestException } from "../utils/AppError";
import { sendInvitationEmail } from "./email.service";
import {
  generateInvitationToken,
  generateInvitationLink,
  getInvitationExpiryTime,
} from "../utils/invitation-token";
import { APP_CONFIG } from "../config/app.config";

export const createWorkspaceService = async (
  data: CreateWorkspaceInput,
  userId: string
) => {
  // Create workspace and user-workspace relationship in a transaction
  const result = await db.$transaction(async (tx) => {
    // Create the workspace
    const workspace = await tx.workspace.create({
      data: {
        name: data.name,
        subscriptionPlan: null, // Will be set when subscription is created
      },
    });

    // Create user-workspace relationship with Owner role and ACTIVE status
    const userWorkspace = await tx.userWorkspace.create({
      data: {
        userId,
        workspaceId: workspace.id,
        role: "Owner",
        status: "ACTIVE", // Owner should be active immediately
      },
    });

    // Create default workspace settings
    await tx.workspaceSettings.create({
      data: {
        workspaceId: workspace.id,
        onboardingCompleted: false,
      },
    });

    return { workspace, userWorkspace };
  });

  return result.workspace;
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
      permissions: true,
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

  // Update workspace
  const updatedWorkspace = await db.workspace.update({
    where: { id: workspaceId },
    data: {
      name: data.name,
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
      permissions: true,
    },
  });

  if (!userWorkspace) {
    throw new BadRequestException("You don't have access to this workspace");
  }

  return userWorkspace;
};

export const getWorkspaceUsersService = async (
  workspaceId: string,
  userId: string
) => {
  // Check if user has access to this workspace
  const userWorkspace = await db.userWorkspace.findFirst({
    where: {
      workspaceId,
      userId,
    },
  });

  if (!userWorkspace) {
    throw new BadRequestException("You don't have access to this workspace");
  }

  // Get all users in the workspace with their roles and permissions
  const workspaceUsers = await db.userWorkspace.findMany({
    where: {
      workspaceId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      permissions: true,
      invitation: {
        select: {
          id: true,
          status: true,
          expiresAt: true,
        },
      },
    },
  });

  return workspaceUsers;
};

export const inviteUserToWorkspaceService = async (
  workspaceId: string,
  userId: string,
  data: InviteUserInput
) => {
  // Check if user has access to this workspace
  const userWorkspace = await db.userWorkspace.findFirst({
    where: {
      workspaceId,
      userId,
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
      workspace: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!userWorkspace) {
    throw new BadRequestException("You don't have access to this workspace");
  }

  // Only Owners and Admins can invite users
  // TODO: Move these permissions to a middleware and pass during request
  if (!["Owner", "Admin"].includes(userWorkspace.role)) {
    throw new BadRequestException("You don't have permission to invite users");
  }

  // Check if there's already a pending invitation for this email in this workspace
  const existingInvitation = await db.userInvitation.findFirst({
    where: {
      email: data.email,
      workspaceId,
      status: "PENDING",
    },
  });

  if (existingInvitation) {
    throw new BadRequestException(
      "An invitation has already been sent to this email address"
    );
  }

  // Check if user is already a member of this workspace (any status)
  const existingUserWorkspace = await db.userWorkspace.findFirst({
    where: {
      workspaceId,
      user: {
        email: data.email,
      },
    },
  });

  if (existingUserWorkspace) {
    if (existingUserWorkspace.status === "ACTIVE") {
      throw new BadRequestException(
        "User is already an active member of this workspace"
      );
    } else if (existingUserWorkspace.status === "PENDING") {
      throw new BadRequestException(
        "User already has a pending invitation for this workspace"
      );
    }
  }

  // Create user, userWorkspace, permissions, and invitation in a transaction
  const result = await db.$transaction(async (tx) => {
    // Check if user already exists, if not create them
    let user = await tx.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      // Create new user without password (will be set when they accept invitation)
      user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          // No password set - user will create one when accepting invitation
        },
      });
    }

    // Create UserWorkspace record with PENDING status
    const userWorkspaceWithPendingInvitation = await tx.userWorkspace.create({
      data: {
        userId: user.id,
        workspaceId,
        role: data.role,
        status: "PENDING",
      },
    });

    // Create permissions for the user using the correct userWorkspaceId
    const permissions = data.permissions.map((permission) => ({
      userWorkspaceId: userWorkspaceWithPendingInvitation.id, // Use the newly created userWorkspace ID
      permission: permission as any,
    }));

    await tx.rolePermission.createMany({
      data: permissions,
    });

    // Generate invitation token and expiry time
    const token = generateInvitationToken();
    const expiresAt = getInvitationExpiryTime();

    // Create invitation record linked to the UserWorkspace
    const invitation = await tx.userInvitation.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role,
        permissions: data.permissions,
        token,
        expiresAt,
        invitedById: userId,
        workspaceId,
        userWorkspaceId: userWorkspaceWithPendingInvitation.id, // Use the newly created userWorkspace ID
      },
    });

    return { user, userWorkspaceWithPendingInvitation, invitation };
  });

  // Generate invitation link
  const baseUrl = APP_CONFIG.FRONTEND_BASE_URL;
  const invitationLink = generateInvitationLink(
    baseUrl,
    result.invitation.token
  );

  // Send invitation email
  try {
    await sendInvitationEmail(
      data.email,
      data.name,
      userWorkspace.user.name,
      userWorkspace.workspace.name,
      data.role,
      invitationLink
    );
  } catch (error) {
    // If email fails, clean up the created records
    await db.$transaction(async (tx) => {
      // Delete the invitation
      await tx.userInvitation.delete({
        where: { id: result.invitation.id },
      });

      // Delete role permissions
      await tx.rolePermission.deleteMany({
        where: {
          userWorkspaceId: result.userWorkspaceWithPendingInvitation.id,
        },
      });

      // Delete the userWorkspace
      await tx.userWorkspace.delete({
        where: { id: result.userWorkspaceWithPendingInvitation.id },
      });
    });

    throw new BadRequestException("Failed to send invitation email");
  }

  return {
    message: "Invitation sent successfully",
    invitation: {
      id: result.invitation.id,
      email: result.invitation.email,
      name: result.invitation.name,
      role: result.invitation.role,
      expiresAt: result.invitation.expiresAt,
    },
  };
};

export const updateUserRoleService = async (
  workspaceId: string,
  targetUserId: string,
  userId: string,
  data: UpdateUserRoleInput
) => {
  // Check if user has access to this workspace
  const userWorkspace = await db.userWorkspace.findFirst({
    where: {
      workspaceId,
      userId,
    },
  });

  if (!userWorkspace) {
    throw new BadRequestException("You don't have access to this workspace");
  }

  // Only Owners and Admins can update user roles
  if (!["Owner", "Admin"].includes(userWorkspace.role)) {
    throw new BadRequestException(
      "You don't have permission to update user roles"
    );
  }

  // Check if target user exists in workspace
  const targetUserWorkspace = await db.userWorkspace.findFirst({
    where: {
      workspaceId,
      userId: targetUserId,
    },
  });

  if (!targetUserWorkspace) {
    throw new BadRequestException("User not found in workspace");
  }

  // Update user role and permissions
  await db.userWorkspace.update({
    where: { id: targetUserWorkspace.id },
    data: { role: data.role },
  });

  // Remove existing permissions
  await db.rolePermission.deleteMany({
    where: { userWorkspaceId: targetUserWorkspace.id },
  });

  // Create new permissions
  const permissions = data.permissions.map((permission) => ({
    userWorkspaceId: targetUserWorkspace.id,
    permission: permission as any, // Type assertion for enum
  }));

  await db.rolePermission.createMany({
    data: permissions,
  });

  return { message: "User role updated successfully" };
};

export const removeUserFromWorkspaceService = async (
  workspaceId: string,
  targetUserId: string,
  currentUserId: string
) => {
  // Check if current user has access to this workspace
  const currentUserWorkspace = await db.userWorkspace.findFirst({
    where: {
      workspaceId,
      userId: currentUserId,
    },
  });

  if (!currentUserWorkspace) {
    throw new BadRequestException("You don't have access to this workspace");
  }

  // Only Owners and Admins can remove users
  if (!["Owner", "Admin"].includes(currentUserWorkspace.role)) {
    throw new BadRequestException(
      "Only workspace owners and admins can remove users"
    );
  }

  // Check if target user exists in this workspace
  const targetUserWorkspace = await db.userWorkspace.findFirst({
    where: {
      workspaceId,
      userId: targetUserId,
    },
  });

  if (!targetUserWorkspace) {
    throw new BadRequestException("User is not a member of this workspace");
  }

  // Owners cannot remove themselves
  if (targetUserId === currentUserId && currentUserWorkspace.role === "Owner") {
    throw new BadRequestException(
      "Owners cannot remove themselves from the workspace"
    );
  }

  // Get the user's email before deleting the UserWorkspace
  const targetUser = await db.user.findUnique({
    where: { id: targetUserId },
    select: { email: true },
  });

  if (!targetUser) {
    throw new BadRequestException("User not found");
  }

  // Remove user from workspace and clean up associated data in a transaction
  await db.$transaction(async (tx) => {
    // Delete any pending invitations for this user's email in this workspace
    await tx.userInvitation.deleteMany({
      where: {
        email: targetUser.email,
        workspaceId,
        status: "PENDING",
      },
    });

    // Delete role permissions for this user-workspace relationship
    await tx.rolePermission.deleteMany({
      where: {
        userWorkspaceId: targetUserWorkspace.id,
      },
    });

    // Delete the UserWorkspace record (this will cascade delete the linked invitation if any)
    await tx.userWorkspace.delete({
      where: {
        id: targetUserWorkspace.id,
      },
    });
  });

  return { message: "User removed successfully" };
};

export const deleteWorkspaceService = async (
  workspaceId: string,
  userId: string
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

  // Only Owners can delete workspaces
  if (userWorkspace.role !== "Owner") {
    throw new BadRequestException(
      "Only workspace owners can delete workspaces"
    );
  }

  // Delete workspace and all associated data in a transaction
  await db.$transaction(async (tx) => {
    // Delete all user-workspace relationships
    await tx.userWorkspace.deleteMany({
      where: { workspaceId },
    });

    // Delete all role permissions associated with this workspace
    await tx.rolePermission.deleteMany({
      where: {
        userWorkspace: {
          workspaceId,
        },
      },
    });

    // Delete workspace settings
    await tx.workspaceSettings.deleteMany({
      where: { workspaceId },
    });

    // Delete all properties associated with this workspace
    await tx.property.deleteMany({
      where: { workspaceId },
    });

    // Delete all leads associated with this workspace
    await tx.lead.deleteMany({
      where: { workspaceId },
    });

    // Delete all deals associated with this workspace
    await tx.deal.deleteMany({
      where: { workspaceId },
    });

    // Delete all activities associated with this workspace
    await tx.activity.deleteMany({
      where: { workspaceId },
    });

    // Delete all files associated with this workspace
    await tx.file.deleteMany({
      where: { workspaceId },
    });

    // Delete all categories associated with this workspace
    await tx.propertyCategory.deleteMany({
      where: { workspaceId },
    });

    // Delete all notifications associated with this workspace
    await tx.notification.deleteMany({
      where: { workspaceId },
    });

    // Delete all invitations associated with this workspace
    await tx.userInvitation.deleteMany({
      where: { workspaceId },
    });

    // Delete subscription if exists
    await tx.subscription.deleteMany({
      where: { workspaceId },
    });

    // Finally, delete the workspace itself
    await tx.workspace.delete({
      where: { id: workspaceId },
    });
  });

  return { message: "Workspace deleted successfully" };
};
