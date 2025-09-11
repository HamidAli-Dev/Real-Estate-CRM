import { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role?: {
        id: string;
        name: string;
        workspaceId: string;
        isSystem: boolean;
        createdAt: Date;
        updatedAt: Date;
      };
      permissions?: string[];
      workspaceId?: string;
    }

    interface Request {
      user?: User;
    }
  }
}

// Extend the Express User interface to include permissions
declare module "express-serve-static-core" {
  interface User {
    permissions?: string[];
  }
}
