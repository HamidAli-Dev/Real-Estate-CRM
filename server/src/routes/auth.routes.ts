import { Router } from "express";
import { Role } from "@prisma/client";

import {
  login,
  logoutAllDevices,
  refreshAccessToken,
  registerOwner,
} from "../controllers/auth.controller";
import { authenticate } from "../middlewares/passportAuth.middleware";
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware";

const authRoutes = Router();

authRoutes.post("/register-owner", registerOwner);
authRoutes.post("/login", login);
authRoutes.post("/refresh-token", refreshAccessToken);
authRoutes.post(
  "/logout-all",
  authenticate,
  authorizeRoles(Role.Owner),
  logoutAllDevices
);

export default authRoutes;
