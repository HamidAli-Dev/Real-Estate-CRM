import { Router } from "express";

import {
  login,
  logoutAllDevices,
  refreshAccessToken,
  registerOwner,
  changePassword,
} from "../controllers/auth.controller";
import { authenticate } from "../middlewares/passportAuth.middleware";

const authRoutes = Router();

authRoutes.post("/register-owner", registerOwner);
authRoutes.post("/login", login);
authRoutes.post("/refresh-token", refreshAccessToken);
authRoutes.post("/change-password", authenticate, changePassword);
authRoutes.post("/logout-all", authenticate, logoutAllDevices);

export default authRoutes;
