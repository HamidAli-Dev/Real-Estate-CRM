import { db } from "../utils/db";
import {
  CreateWorkspaceInput,
  EditWorkspaceInput,
  InviteUserInput,
  UpdateUserRoleInput,
} from "../validation/workspace.validation";
import { BadRequestException } from "../utils/AppError";

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

    // Create user-workspace relationship with Owner role
    const userWorkspace = await tx.userWorkspace.create({
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
  });

  if (!userWorkspace) {
    throw new BadRequestException("You don't have access to this workspace");
  }

  // Only Owners and Admins can invite users
  if (!["Owner", "Admin"].includes(userWorkspace.role)) {
    throw new BadRequestException("You don't have permission to invite users");
  }

  // Check if user already exists
  let user = await db.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    // Create new user with temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    user = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: tempPassword, // In production, this should be hashed
      },
    });
  }

  // Check if user is already in this workspace
  const existingUserWorkspace = await db.userWorkspace.findFirst({
    where: {
      workspaceId,
      userId: user.id,
    },
  });

  if (existingUserWorkspace) {
    throw new BadRequestException("User is already a member of this workspace");
  }

  // Add user to workspace with role and permissions
  const newUserWorkspace = await db.userWorkspace.create({
    data: {
      userId: user.id,
      workspaceId,
      role: data.role,
    },
  });

  // Create permissions for the user
  const permissions = data.permissions.map((permission) => ({
    userWorkspaceId: newUserWorkspace.id,
    permission: permission as any, // Type assertion for enum
  }));

  await db.rolePermission.createMany({
    data: permissions,
  });

  return { user, role: data.role, permissions: data.permissions };
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

  // Remove user from workspace
  await db.userWorkspace.delete({
    where: {
      id: targetUserWorkspace.id,
    },
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
