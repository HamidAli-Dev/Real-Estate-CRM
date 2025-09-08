import { Router } from "express";
import {
  getInvitationController,
  acceptInvitationController,
  cancelInvitationController,
} from "../controllers/invitation.controller";
import { authenticate } from "../middlewares/passportAuth.middleware";
import {
  invitationRateLimit,
  acceptInvitationRateLimit,
} from "../middlewares/security.middleware";

const invitationRoutes = Router();

// Get invitation details by token (public route with rate limiting)
invitationRoutes.get(
  "/:token",
  //  invitationRateLimit,
  getInvitationController
);

// Accept invitation (public route with rate limiting)
invitationRoutes.post(
  "/accept",
  // acceptInvitationRateLimit,
  acceptInvitationController
);

// Cancel invitation (requires authentication)
invitationRoutes.post(
  "/:invitationId/cancel",
  authenticate,
  cancelInvitationController
);

export default invitationRoutes;
