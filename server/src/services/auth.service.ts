import jwt from "jsonwebtoken";
import crypto from "crypto";

import { BadRequestException } from "../utils/AppError";
import { compareValue, hashValue } from "../utils/bcrypt";
import { db } from "../utils/db";
import { APP_CONFIG } from "../config/app.config";

export interface JwtPayload {
  userId: string;
  workspaceId?: string;
  role?: string;
}

const generateAccessToken = (payload: JwtPayload) => {
  return jwt.sign(payload, APP_CONFIG.JWT_SECRET as string, {
    expiresIn: "15m", // short-lived
  });
};

const generateRefreshToken = async (userId: string) => {
  const token = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

  await db.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return token;
};

interface RegisterOwnerInput {
  name: string;
  email: string;
  password: string;
}

export const registerOwnerService = async ({
  name,
  email,
  password,
}: RegisterOwnerInput) => {
  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new BadRequestException("Owner with this email already exists");
  }

  const hashedPassword = await hashValue(password);

  const result = await db.$transaction(async (tx) => {
    // create the owner
    const owner = await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Create default workspace
    const workspace = await tx.workspace.create({
      data: {
        name: `${name}'s workspace`,
        subscriptionPlan: null,
      },
    });

    // Link user to workspace with Owner role
    await tx.userWorkspace.create({
      data: {
        userId: owner.id,
        workspaceId: workspace.id,
        role: "Owner",
      },
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: owner.id, workspaceId: workspace.id, role: "Owner" },
      APP_CONFIG.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    return {
      owner: {
        id: owner.id,
        name: owner.name,
        email: owner.email,
        role: "Owner",
      },
      workspace: {
        id: workspace.id,
        name: workspace.name,
      },
      token,
    };
  });

  return result;
};

interface LoginInput {
  email: string;
  password: string;
}

export const loginService = async ({ email, password }: LoginInput) => {
  const user = await db.user.findUnique({
    where: { email },
    include: {
      workspaces: true,
    },
  });

  if (!user) {
    throw new BadRequestException("Invalid email or password");
  }

  const isPasswordValid = await compareValue(password, user.password);

  if (!isPasswordValid) {
    throw new BadRequestException("Invalid email or password");
  }

  // For now, get first workspace + role
  const userWorkspace = user.workspaces[0];

  const accessToken = generateAccessToken({
    userId: user.id,
    workspaceId: userWorkspace?.workspaceId,
    role: userWorkspace?.role,
  });

  const refreshToken = await generateRefreshToken(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: userWorkspace?.role || null,
      workspaceId: userWorkspace?.workspaceId || null,
    },
    accessToken,
    refreshToken,
  };
};
