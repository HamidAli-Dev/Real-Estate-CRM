import { Router } from "express";

import { getCurrentUserController } from "../controllers/user.controller";
import { authenticate } from "../middlewares/passportAuth.middleware";

const userRoutes = Router();

userRoutes.get("/current", authenticate, getCurrentUserController);

export default userRoutes;
