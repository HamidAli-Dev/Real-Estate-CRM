import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { HTTPSTATUS } from "../config/http.config";
import { getCurrentUserService } from "../services/user.service";
import { BadRequestException } from "../utils/AppError";

export const getCurrentUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user.id;

    const { user } = await getCurrentUserService(userId);

    if (!user) {
      throw new BadRequestException("User not found");
    }

    return res.status(HTTPSTATUS.OK).json({
      message: "User fetched successfully",
      user,
    });
  }
);
