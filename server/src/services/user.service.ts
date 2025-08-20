import { db } from "../utils/db";

export const getCurrentUserService = async (userId: string) => {
  // Get user with their workspace role information
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      workspaces: {
        select: {
          role: true,
          workspace: {
            select: {
              id: true,
              name: true,
              domain: true,
            },
          },
        },
      },
    },
  });

  // Fallback: If no workspaces found, check directly in UserWorkspace table
  if (!user?.workspaces || user.workspaces.length === 0) {
    const userWorkspace = await db.userWorkspace.findFirst({
      where: { userId },
      select: {
        role: true,
        workspace: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
      },
    });

    console.log("🔍 Direct UserWorkspace query result:", userWorkspace);

    if (userWorkspace) {
      const result = {
        user: {
          id: user?.id,
          name: user?.name,
          email: user?.email,
          role: userWorkspace.role,
          workspaceId: userWorkspace.workspace.id,
          workspaceName: userWorkspace.workspace.name,
          workspaceDomain: userWorkspace.workspace.domain,
        },
      };

      return result;
    }
  }

  // Extract the primary role and workspace info
  const primaryWorkspace = user?.workspaces?.[0];

  const result = {
    user: {
      id: user?.id,
      name: user?.name,
      email: user?.email,
      role: primaryWorkspace?.role || null,
      workspaceId: primaryWorkspace?.workspace?.id || null,
      workspaceName: primaryWorkspace?.workspace?.name || null,
      workspaceDomain: primaryWorkspace?.workspace?.domain || null,
    },
  };

  return result;
};
