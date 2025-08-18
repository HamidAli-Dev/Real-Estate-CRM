import { RequestHandler } from "express";
import { Role } from "@prisma/client";
import { BadRequestException } from "../utils/AppError";

export const authorizeRoles =
  (...allowedRoles: Role[]): RequestHandler =>
  (req, res, next) => {
    if (!req.user?.role) {
      throw new BadRequestException("Access denied. No role found.");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new BadRequestException(
        `Access denied. Requires one of: ${allowedRoles.join(", ")}`
      );
    }

    next();
  };
