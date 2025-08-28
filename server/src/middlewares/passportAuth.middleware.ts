import { RequestHandler } from "express";
import passport from "passport";

import { UnauthorizedException } from "../utils/AppError";

export const authenticate: RequestHandler = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err: any, user: any) => {
    if (err) {
      return next(new UnauthorizedException("Authentication failed"));
    }

    if (!user) {
      return next(new UnauthorizedException("Invalid or expired token"));
    }

    req.user = user;
    next();
  })(req, res, next);
};
