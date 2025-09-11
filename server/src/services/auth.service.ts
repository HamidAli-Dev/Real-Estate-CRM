import jwt from "jsonwebtoken";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

import { BadRequestException } from "../utils/AppError";
import { compareValue, hashValue } from "../utils/bcrypt";
import { db } from "../utils/db";
import { APP_CONFIG } from "../config/app.config";
import { ErrorCode } from "../enums/error-code.enum";

export interface JwtPayload {
  userId: string;
  workspaceId?: string;
  role?:
    | {
        id: string;
        workspaceId: string;
        name: string;
        isSystem: boolean;
        createdAt: Date;
        updatedAt: Date;
      }
    | {
        name: string;
        isSystem: true;
      };
}

const generateAccessToken = (payload: JwtPayload) => {
  return jwt.sign(payload, APP_CONFIG.JWT_SECRET as string, {
    expiresIn: "1h", // 1 hour
  });
};

const generateRefreshToken = async (
  userId: string,
  txClient?: Omit<
    PrismaClient,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >
) => {
  const token = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

  const dbClient = txClient || db;
  await dbClient.refreshToken.create({
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
    throw new BadRequestException(
      "Owner with this email already exists",
      ErrorCode.AUTH_EMAIL_ALREADY_EXISTS
    );
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

    // Generate JWT with Owner role
    const token = jwt.sign(
      { userId: owner.id, role: "Owner" },
      APP_CONFIG.JWT_SECRET as string,
      { expiresIn: "1h" } // 1 hour
    );

    // Generate refresh token
    const refreshToken = await generateRefreshToken(owner.id, tx);

    return {
      owner: {
        id: owner.id,
        name: owner.name,
        email: owner.email,
        role: "Owner",
      },
      token,
      refreshToken,
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
      workspaces: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user) {
    throw new BadRequestException(
      "Invalid email or password",
      ErrorCode.AUTH_USER_NOT_FOUND
    );
  }

  // Check if user has a password set
  if (!user.password) {
    throw new BadRequestException(
      "Account setup required. Please complete your account setup first.",
      ErrorCode.AUTH_USER_NOT_FOUND
    );
  }

  const isPasswordValid = await compareValue(password, user.password);

  if (!isPasswordValid) {
    throw new BadRequestException(
      "Invalid email or password",
      ErrorCode.AUTH_USER_NOT_FOUND
    );
  }

  // Check if user has any workspaces (including PENDING status)
  const userWorkspace =
    user.workspaces.find((ws) => ws.status === "ACTIVE") || user.workspaces[0];

  // If user has no workspaces, they get implicit Owner role for workspace creation
  const userRole = userWorkspace?.role || { name: "Owner", isSystem: true };
  const userWorkspaceId = userWorkspace?.workspaceId || null;

  // If user has PENDING workspace and mustUpdatePassword is true, activate the workspace
  if (user.mustUpdatePassword && userWorkspace?.status === "PENDING") {
    await db.userWorkspace.update({
      where: { id: userWorkspace.id },
      data: { status: "ACTIVE" },
    });
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    workspaceId: userWorkspaceId,
    role: userRole,
  });

  const refreshToken = await generateRefreshToken(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: userRole,
      workspaceId: userWorkspaceId,
      mustUpdatePassword: user.mustUpdatePassword,
    },
    accessToken,
    refreshToken,
  };
};

export const changePasswordService = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new BadRequestException(
      "User not found",
      ErrorCode.AUTH_USER_NOT_FOUND
    );
  }

  if (!user.password) {
    throw new BadRequestException(
      "No password set for this account",
      ErrorCode.AUTH_USER_NOT_FOUND
    );
  }

  // Verify current password
  const isCurrentPasswordValid = await compareValue(
    currentPassword,
    user.password
  );
  if (!isCurrentPasswordValid) {
    throw new BadRequestException(
      "Current password is incorrect",
      ErrorCode.AUTH_USER_NOT_FOUND
    );
  }

  // Hash new password
  const hashedNewPassword = await hashValue(newPassword);

  // Update password and clear mustUpdatePassword flag
  await db.user.update({
    where: { id: userId },
    data: {
      password: hashedNewPassword,
      mustUpdatePassword: false,
    },
  });

  return {
    message: "Password changed successfully",
  };
};
