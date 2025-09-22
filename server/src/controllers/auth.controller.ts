import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { asyncHandler } from "../utils/asyncHandler";
import { HTTPSTATUS } from "../config/http.config";
import {
  loginSchema,
  registerOwnerSchema,
} from "../validation/auth.validation";
import {
  loginService,
  registerOwnerService,
  changePasswordService,
} from "../services/auth.service";
import { BadRequestException, UnauthorizedException } from "../utils/AppError";
import { db } from "../utils/db";
import { APP_CONFIG } from "../config/app.config";

// Cookie options for security
const getAccessTokenCookieOptions = () => ({
  httpOnly: true,
  secure: true,
  sameSite: "none" as const,
  maxAge: 60 * 60 * 1000, // 1 hour
  path: "/",
  expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
});

const getRefreshTokenCookieOptions = () => ({
  httpOnly: true,
  secure: true,
  sameSite: "none" as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: "/",
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Explicit expiration date
});

export const refreshAccessToken = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      console.log("❌ No refresh token found in cookies");
      throw new BadRequestException("Refresh token is required");
    }

    const storedToken = await db.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          include: {
            workspaces: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      console.log("❌ Stored token invalid or expired");
      throw new BadRequestException("Invalid or expired refresh token");
    }

    const userWorkspace = storedToken.user.workspaces[0];

    // If user has no workspaces, they get implicit Owner role for workspace creation
    const userRole = userWorkspace?.role || { name: "Owner", isSystem: true };
    const userWorkspaceId = userWorkspace?.workspaceId || null;

    const newAccessToken = jwt.sign(
      {
        userId: storedToken.user.id,
        workspaceId: userWorkspaceId,
        role: userRole,
      },
      APP_CONFIG.JWT_SECRET as string,
      { expiresIn: "1h" } // 1 hour
    );

    // Set new access token as cookie
    const cookieOptions = getAccessTokenCookieOptions();

    res.cookie("accessToken", newAccessToken, cookieOptions);

    console.log("✅ New access token cookie set");

    return res.json({
      message: "Access token refreshed successfully",
    });
  }
);

export const registerOwner = asyncHandler(
  async (req: Request, res: Response) => {
    const body = registerOwnerSchema.parse({ ...req.body });

    const result = await registerOwnerService(body);

    // Set tokens as HTTP-only cookies
    res.cookie("accessToken", result.token, getAccessTokenCookieOptions());
    res.cookie(
      "refreshToken",
      result.refreshToken,
      getRefreshTokenCookieOptions()
    );

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Owner registered successfully",
      data: {
        owner: result.owner,
      },
    });
  }
);

export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = loginSchema.parse({ ...req.body });

  const result = await loginService(body);

  // Set tokens as HTTP-only cookies
  res.cookie("accessToken", result.accessToken, getAccessTokenCookieOptions());
  res.cookie(
    "refreshToken",
    result.refreshToken,
    getRefreshTokenCookieOptions()
  );

  return res.status(HTTPSTATUS.OK).json({
    message: "Login successful",
    data: {
      user: result.user,
    },
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

    // Clear cookies
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });

    return res.status(HTTPSTATUS.OK).json({
      message: "Logged out from all devices successfully",
    });
  }
);

export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedException("User not authenticated");
    }

    const result = await changePasswordService(userId, email, newPassword);

    return res.status(HTTPSTATUS.OK).json(result);
  }
);
