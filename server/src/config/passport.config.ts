import { Request } from "express";
import passport from "passport";
import { Strategy as JwtStrategy } from "passport-jwt";

import { APP_CONFIG } from "./app.config";
import { db } from "../utils/db";
import { Role } from "@prisma/client";

interface JwtPayload {
  userId: string;
  role?: string;
  workspaceId?: string;
}

// Custom extractor to get JWT from cookies
const extractJwtFromCookie = (req: Request) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies.accessToken;
  }
  return token;
};

const passportConfig = () => {
  // JWT Strategy
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: extractJwtFromCookie, // Use custom extractor for cookies
        secretOrKey: APP_CONFIG.JWT_SECRET,
      },
      async (payload: JwtPayload, done) => {
        try {
          const user = await db.user.findUnique({
            where: { id: payload.userId },
          });

          if (!user) {
            return done(null, false);
          }

          // Check if user has any workspaces to determine their role
          const userWorkspaces = await db.userWorkspace.findMany({
            where: { userId: user.id },
          });

          let userRole: Role | null = null;
          let userWorkspaceId: string | null = null;

          if (userWorkspaces.length > 0) {
            // User has workspaces, get their role from the first one (or current one if specified)
            const currentWorkspace = payload.workspaceId
              ? userWorkspaces.find(
                  (uw) => uw.workspaceId === payload.workspaceId
                )
              : userWorkspaces[0];

            if (currentWorkspace) {
              userRole = currentWorkspace.role;
              userWorkspaceId = currentWorkspace.workspaceId;
            }
          } else {
            // User has no workspaces yet - they get implicit Owner role for workspace creation
            userRole = "Owner";
          }

          const userWithRole = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: userRole,
            workspaceId: userWorkspaceId,
          };

          return done(null, userWithRole);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );

  return passport;
};

export default passportConfig;
