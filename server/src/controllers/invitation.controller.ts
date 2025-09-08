import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { HTTPSTATUS } from "../config/http.config";
import {
  getInvitationByTokenService,
  acceptInvitationService,
  cancelInvitationService,
} from "../services/invitation.service";
import { BadRequestException } from "../utils/AppError";
import {
  acceptInvitationSchema,
  cancelInvitationSchema,
} from "../validation/invitation.validation";

export const getInvitationController = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.params;

    if (!token) {
      throw new BadRequestException("Invitation token is required");
    }

    const invitation = await getInvitationByTokenService(token);

    return res.status(HTTPSTATUS.OK).json({
      message: "Invitation details fetched successfully",
      data: invitation,
    });
  }
);

export const acceptInvitationController = asyncHandler(
  async (req: Request, res: Response) => {
    // Validate request body
    const validatedData = acceptInvitationSchema.parse({ ...req.body });

    const result = await acceptInvitationService(validatedData);

    return res.status(HTTPSTATUS.OK).json({
      message: result.message,
      data: result.user,
    });
  }
);

// Cancel invitation controller

export const cancelInvitationController = asyncHandler(
  async (req: Request, res: Response) => {
    const { invitationId } = req.params;
    const currentUserId = req.user.id;

    if (!invitationId) {
      throw new BadRequestException("Invitation ID is required");
    }

    // Validate request body
    const validatedData = cancelInvitationSchema.parse(req.body);

    const result = await cancelInvitationService(
      invitationId,
      currentUserId,
      validatedData.workspaceId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: result.message,
    });
  }
);
