import { db } from "../utils/db";

export const getCurrentUserService = async (userId: string) => {
  // Get user basic information
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      mustUpdatePassword: true,
    },
  });

  if (!user) {
    return { user: null };
  }

  // Get user's workspace information through UserWorkspace table
  const userWorkspaces = await db.userWorkspace.findMany({
    where: { userId },
    include: {
      role: {
        select: {
          id: true,
          name: true,
          isSystem: true,
        },
      },
      workspace: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // If user has workspaces, get the primary role and workspace info
  if (userWorkspaces.length > 0) {
    const primaryWorkspace = userWorkspaces[0];

    const result = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: primaryWorkspace.role,
        workspaceId: primaryWorkspace.workspace.id,
        workspaceName: primaryWorkspace.workspace.name,
        workspaceDomain: null, // Workspace model doesn't have domain property
        mustUpdatePassword: user.mustUpdatePassword,
      },
    };

    return result;
  }

  // If user has no workspaces, they get implicit Owner role for workspace creation
  // This matches the logic in passport.config.ts
  const result = {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: {
        id: "implicit-owner",
        name: "Owner",
        isSystem: true,
      },
      workspaceId: null,
      workspaceName: null,
      workspaceDomain: null,
      mustUpdatePassword: user.mustUpdatePassword,
    },
  };

  return result;
};
