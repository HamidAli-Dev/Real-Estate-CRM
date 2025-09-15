import { db } from "../utils/db";
import {
  CreateWorkspaceInput,
  EditWorkspaceInput,
  InviteUserInput,
  UpdateUserRoleInput,
} from "../validation/workspace.validation";
// Updated types for RBAC system
import { BadRequestException } from "../utils/AppError";
import {
  generateInvitationToken,
  generateInvitationLink,
  getInvitationExpiryTime,
} from "../utils/invitation-token";
import { APP_CONFIG } from "../config/app.config";
import { hashValue } from "../utils/bcrypt";

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

    // Create the Owner role for this workspace
    const ownerRole = await tx.role.create({
      data: {
        name: "Owner",
        workspaceId: workspace.id,
        isSystem: true,
      },
    });

    // Get all permissions to assign to Owner role
    let allPermissions = await tx.permission.findMany();

    // If no permissions exist, create default permissions
    if (allPermissions.length === 0) {
      const defaultPermissions = [
        { name: "VIEW_PROPERTIES", group: "Properties" },
        { name: "CREATE_PROPERTIES", group: "Properties" },
        { name: "EDIT_PROPERTIES", group: "Properties" },
        { name: "DELETE_PROPERTIES", group: "Properties" },
        { name: "VIEW_LEADS", group: "Leads" },
        { name: "CREATE_LEADS", group: "Leads" },
        { name: "EDIT_LEADS", group: "Leads" },
        { name: "DELETE_LEADS", group: "Leads" },
        { name: "VIEW_USERS", group: "Users" },
        { name: "INVITE_USERS", group: "Users" },
        { name: "EDIT_USER_ROLES", group: "Users" },
        { name: "REMOVE_USERS", group: "Users" },
        { name: "VIEW_SETTINGS", group: "Settings" },
        { name: "EDIT_SETTINGS", group: "Settings" },
        { name: "VIEW_ANALYTICS", group: "Analytics" },
      ];

      await tx.permission.createMany({
        data: defaultPermissions,
      });

      allPermissions = await tx.permission.findMany();
    }

    // Assign all permissions to Owner role
    if (allPermissions.length > 0) {
      await tx.rolePermission.createMany({
        data: allPermissions.map((permission) => ({
          roleId: ownerRole.id,
          permissionId: permission.id,
        })),
      });
    }

    // Create user-workspace relationship with Owner role and ACTIVE status
    const userWorkspace = await tx.userWorkspace.create({
      data: {
        userId,
        workspaceId: workspace.id,
        roleId: ownerRole.id,
        status: "ACTIVE",
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
      role: true,
    },
  });

  if (!userWorkspace) {
    throw new BadRequestException("You don't have access to this workspace");
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
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      },
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
      role: true,
    },
  });

  if (!userWorkspace) {
    throw new BadRequestException("You don't have access to this workspace");
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

  // Use the temporary password
  const temporaryPassword = "123456";
  const hashedTemporaryPassword = await hashValue(temporaryPassword);

  // Create user, userWorkspace, role assignment, and invitation in a transaction
  const result = await db.$transaction(async (tx) => {
    // Check if user already exists, if not create them
    let user = await tx.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      // Create new user with temporary password
      user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedTemporaryPassword,
          mustUpdatePassword: true, // Mark that user must update password on first login
        },
      });
    } else {
      // Update existing user with temporary password
      user = await tx.user.update({
        where: { id: user.id },
        data: {
          password: hashedTemporaryPassword,
          mustUpdatePassword: true,
        },
      });
    }

    // Get the role to assign
    const role = await tx.role.findFirst({
      where: {
        id: data.roleId,
        workspaceId,
      },
    });

    if (!role) {
      throw new BadRequestException("Role not found in workspace");
    }

    // Create UserWorkspace record with PENDING status and assigned role
    const userWorkspaceWithPendingInvitation = await tx.userWorkspace.create({
      data: {
        userId: user.id,
        workspaceId,
        roleId: role.id,
        status: "PENDING",
      },
    });

    // Generate invitation token and expiry time
    const token = generateInvitationToken();
    const expiresAt = getInvitationExpiryTime();

    // Create invitation record linked to the UserWorkspace
    const invitation = await tx.userInvitation.create({
      data: {
        email: data.email,
        name: data.name,
        token,
        expiresAt,
        invitedById: userId,
        workspaceId,
        roleId: role.id,
        userWorkspaceId: userWorkspaceWithPendingInvitation.id,
      },
    });

    return {
      user,
      userWorkspaceWithPendingInvitation,
      invitation,
      role,
      temporaryPassword,
    };
  });

  return {
    message: "User invited successfully",
    invitation: {
      id: result.invitation.id,
      email: result.invitation.email,
      name: result.invitation.name,
      role: result.role.name,
      expiresAt: result.invitation.expiresAt,
    },
    temporaryPassword: result.temporaryPassword,
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
    include: {
      role: true,
    },
  });

  if (!userWorkspace) {
    throw new BadRequestException("You don't have access to this workspace");
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

  // Get the new role
  const newRole = await db.role.findFirst({
    where: {
      id: data.roleId,
      workspaceId,
    },
  });

  if (!newRole) {
    throw new BadRequestException("Role not found in workspace");
  }

  // Update user role, name and email

  const result = await db.$transaction(async (tx) => {
    await tx.userWorkspace.update({
      where: { id: targetUserWorkspace.id },
      data: { roleId: newRole.id },
    });

    await tx.user.update({
      where: { id: targetUserWorkspace.userId },
      data: { name: data.name, email: data.email },
    });
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
    include: {
      role: true,
    },
  });

  if (!currentUserWorkspace) {
    throw new BadRequestException("You don't have access to this workspace");
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
  if (
    targetUserId === currentUserId &&
    currentUserWorkspace.role.name === "Owner"
  ) {
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

    // Delete role permissions for this user's role
    await tx.rolePermission.deleteMany({
      where: {
        roleId: targetUserWorkspace.roleId,
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
      role: true,
    },
  });

  if (!userWorkspace) {
    throw new BadRequestException("You don't have access to this workspace");
  }

  // Delete workspace and all associated data in a transaction
  await db.$transaction(async (tx) => {
    // Delete all user-workspace relationships
    await tx.userWorkspace.deleteMany({
      where: { workspaceId },
    });

    // Delete all roles and their permissions associated with this workspace
    const workspaceRoles = await tx.role.findMany({
      where: { workspaceId },
      select: { id: true },
    });

    const roleIds = workspaceRoles.map((role) => role.id);

    if (roleIds.length > 0) {
      await tx.rolePermission.deleteMany({
        where: {
          roleId: {
            in: roleIds,
          },
        },
      });

      // Delete the roles themselves
      await tx.role.deleteMany({
        where: {
          id: {
            in: roleIds,
          },
        },
      });
    }

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
