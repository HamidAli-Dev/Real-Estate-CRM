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
  role?: string;
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
      workspaces: true,
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

  // Check if user has any workspaces
  const userWorkspace = user.workspaces[0];

  // If user has no workspaces, they get implicit Owner role for workspace creation
  const userRole = userWorkspace?.role || "Owner";
  const userWorkspaceId = userWorkspace?.workspaceId || null;

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
    },
    accessToken,
    refreshToken,
  };
};
