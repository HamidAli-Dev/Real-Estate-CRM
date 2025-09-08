import { db } from "../utils/db";
import { BadRequestException } from "../utils/AppError";
import { isInvitationExpired } from "../utils/invitation-token";
import { hashValue } from "../utils/bcrypt";

interface AcceptInvitationInput {
  token: string;
  password?: string;
}

export const getInvitationByTokenService = async (token: string) => {
  const invitation = await db.userInvitation.findUnique({
    where: { token },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
        },
      },
      invitedBy: {
        select: {
          name: true,
        },
      },
      userWorkspace: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              password: true,
            },
          },
        },
      },
    },
  });

  if (!invitation) {
    throw new BadRequestException("Invalid invitation token");
  }

  if (invitation.status !== "PENDING") {
    throw new BadRequestException(
      "This invitation has already been used or cancelled"
    );
  }

  if (isInvitationExpired(invitation.expiresAt)) {
    // Mark invitation as expired
    await db.userInvitation.update({
      where: { id: invitation.id },
      data: { status: "EXPIRED" },
    });
    throw new BadRequestException("This invitation has expired");
  }

  // Check if user already has a password set (not null and not empty)
  const userHasPassword =
    invitation.userWorkspace?.user?.password &&
    invitation.userWorkspace.user.password.length > 0;

  // Check if user has active tokens (indicating they have an existing account)
  const userHasActiveTokens = await db.refreshToken.findFirst({
    where: {
      userId: invitation.userWorkspace?.user?.id,
      expiresAt: {
        gt: new Date(), // Token is not expired
      },
    },
  });

  // User needs password if they don't have a password AND don't have active tokens
  const needsPassword = !userHasPassword && !userHasActiveTokens;

  return {
    id: invitation.id,
    email: invitation.email,
    name: invitation.name,
    role: invitation.role,
    permissions: invitation.permissions,
    workspace: invitation.workspace,
    invitedBy: invitation.invitedBy,
    expiresAt: invitation.expiresAt,
    requiresPassword: needsPassword,
  };
};

export const acceptInvitationService = async (data: AcceptInvitationInput) => {
  const { token, password } = data;

  // Get invitation details
  const invitation = await db.userInvitation.findUnique({
    where: { token },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!invitation) {
    throw new BadRequestException("Invalid invitation token");
  }

  if (invitation.status !== "PENDING") {
    throw new BadRequestException(
      "This invitation has already been used or cancelled"
    );
  }

  if (isInvitationExpired(invitation.expiresAt)) {
    // Mark invitation as expired
    await db.userInvitation.update({
      where: { id: invitation.id },
      data: { status: "EXPIRED" },
    });
    throw new BadRequestException("This invitation has expired");
  }

  // Get the user (should already exist from invitation creation)
  const user = await db.user.findUnique({
    where: { email: invitation.email },
  });

  if (!user) {
    throw new BadRequestException(
      "User not found. Please contact your administrator."
    );
  }

  // Check if user already has a password set (existing user)
  const userHasPassword = user.password && user.password.length > 0;

  // Check if user has active tokens (indicating they have an existing account)
  const userHasActiveTokens = await db.refreshToken.findFirst({
    where: {
      userId: user.id,
      expiresAt: {
        gt: new Date(), // Token is not expired
      },
    },
  });

  // User needs password if they don't have a password AND don't have active tokens
  const needsPassword = !userHasPassword && !userHasActiveTokens;

  if (needsPassword && !password) {
    throw new BadRequestException("Password is required for new users");
  }

  // Only update password if it's provided (for new users or password reset)
  if (password) {
    const hashedPassword = await hashValue(password);
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
  }

  // Get the existing UserWorkspace (should exist from invitation creation)
  const existingUserWorkspace = await db.userWorkspace.findFirst({
    where: {
      workspaceId: invitation.workspaceId,
      userId: user.id,
    },
  });

  if (!existingUserWorkspace) {
    throw new BadRequestException(
      "User workspace not found. Please contact your administrator."
    );
  }

  // Update existing user workspace to active
  await db.userWorkspace.update({
    where: { id: existingUserWorkspace.id },
    data: {
      status: "ACTIVE",
    },
  });

  // Update invitation status
  await db.userInvitation.update({
    where: { id: invitation.id },
    data: {
      status: "ACCEPTED",
    },
  });

  return {
    message: "Invitation accepted successfully",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: invitation.role,
      workspace: invitation.workspace,
    },
    requiresPassword: needsPassword,
  };
};

export const cancelInvitationService = async (
  invitationId: string,
  currentUserId: string,
  workspaceId: string
) => {
  // Check if current user has permission to cancel invitations
  const userWorkspace = await db.userWorkspace.findFirst({
    where: {
      workspaceId,
      userId: currentUserId,
    },
  });

  if (!userWorkspace) {
    throw new BadRequestException("You don't have access to this workspace");
  }

  if (!["Owner", "Admin"].includes(userWorkspace.role)) {
    throw new BadRequestException(
      "You don't have permission to cancel invitations"
    );
  }

  // Get invitation
  const invitation = await db.userInvitation.findFirst({
    where: {
      id: invitationId,
      workspaceId,
      status: "PENDING",
    },
  });

  if (!invitation) {
    throw new BadRequestException("Invitation not found or already processed");
  }

  // Cancel invitation and remove the pending UserWorkspace
  await db.$transaction(async (tx) => {
    // Cancel invitation
    await tx.userInvitation.update({
      where: { id: invitationId },
      data: { status: "CANCELLED" },
    });

    // Remove the pending UserWorkspace if it exists
    if (invitation.userWorkspaceId) {
      await tx.userWorkspace.delete({
        where: { id: invitation.userWorkspaceId },
      });
    }
  });

  return { message: "Invitation cancelled successfully" };
};

// Clean up expired invitations
export const cleanupExpiredInvitationsService = async () => {
  const expiredInvitations = await db.userInvitation.findMany({
    where: {
      status: "PENDING",
      expiresAt: {
        lt: new Date(),
      },
    },
    include: {
      userWorkspace: true,
    },
  });

  for (const invitation of expiredInvitations) {
    await db.$transaction(async (tx) => {
      // Mark invitation as expired
      await tx.userInvitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });

      // Remove the pending UserWorkspace if it exists
      if (invitation.userWorkspaceId) {
        await tx.userWorkspace.delete({
          where: { id: invitation.userWorkspaceId },
        });
      }
    });
  }

  return {
    message: `Cleaned up ${expiredInvitations.length} expired invitations`,
  };
};
