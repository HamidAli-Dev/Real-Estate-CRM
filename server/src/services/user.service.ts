import { db } from "../utils/db";

export const getCurrentUserService = async (userId: string) => {
  // exclude user password

  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      workspaces: true,
    },
  });

  return { user };
};
