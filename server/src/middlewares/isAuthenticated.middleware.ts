import { RequestHandler, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { UnauthorizedException } from "../utils/AppError";
import { db } from "../utils/db";
import { APP_CONFIG } from "../config/app.config";
import { JwtPayload } from "../services/auth.service";
import { Role } from "@prisma/client";

export const authenticate: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers["authorization"] as string | undefined;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new UnauthorizedException("Authorization token missing");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      APP_CONFIG.JWT_SECRET as string
    ) as JwtPayload;

    if (!decoded.userId) {
      throw new UnauthorizedException("Invalid token payload");
    }

    const user = await db.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    // Check if user has any workspaces to determine their role
    const userWorkspaces = await db.userWorkspace.findMany({
      where: { userId: user.id },
    });

    let userRole: Role | null = null;
    let userWorkspaceId: string | null = null;

    if (userWorkspaces.length > 0) {
      // User has workspaces, get their role from the first one (or current one if specified)
      const currentWorkspace = decoded.workspaceId
        ? userWorkspaces.find((uw) => uw.workspaceId === decoded.workspaceId)
        : userWorkspaces[0];

      if (currentWorkspace) {
        userRole = currentWorkspace.role;
        userWorkspaceId = currentWorkspace.workspaceId;
      }
    } else {
      // User has no workspaces yet - they get implicit Owner role for workspace creation
      userRole = "Owner";
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: userRole,
      workspaceId: userWorkspaceId,
    };

    next();
  } catch {
    throw new UnauthorizedException("Invalid or expired token");
  }
};
