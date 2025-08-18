import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { asyncHandler } from "../utils/asyncHandler";
import { HTTPSTATUS } from "../config/http.config";
import {
  loginSchema,
  registerOwnerSchema,
} from "../validation/auth.validation";
import { loginService, registerOwnerService } from "../services/auth.service";
import { BadRequestException } from "../utils/AppError";
import { db } from "../utils/db";

export const refreshAccessToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new BadRequestException("Refresh token is required");
    }

    const storedToken = await db.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { include: { workspaces: true } } },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new BadRequestException("Invalid or expired refresh token");
    }

    const userWorkspace = storedToken.user.workspaces[0];

    const newAccessToken = jwt.sign(
      {
        userId: storedToken.user.id,
        workspaceId: userWorkspace?.workspaceId,
        role: userWorkspace?.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" }
    );

    return res.json({
      accessToken: newAccessToken,
    });
  }
);

export const registerOwner = asyncHandler(
  async (req: Request, res: Response) => {
    const body = registerOwnerSchema.parse({ ...req.body });

    const result = await registerOwnerService(body);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Owner registered successfully",
      data: result,
    });
  }
);

export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = loginSchema.parse({ ...req.body });

  const result = await loginService(body);

  return res.status(HTTPSTATUS.OK).json({
    message: "Login successful",
    data: result,
  });
});

export const logoutAllDevices = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res
        .status(HTTPSTATUS.UNAUTHORIZED)
        .json({ message: "Not authenticated" });
    }

    await db.refreshToken.deleteMany({
      where: { userId: req.user.id },
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "Logged out from all devices successfully",
    });
  }
);
