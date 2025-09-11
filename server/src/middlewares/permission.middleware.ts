import { RequestHandler } from "express";
import { db } from "../utils/db";
import { BadRequestException } from "../utils/AppError";

export const checkPermission = (requiredPermission: string): RequestHandler => {
  return async (req, res, next) => {
    try {
      if (!req.user?.id) {
        throw new BadRequestException("Access denied. User not authenticated.");
      }

      const userId = req.user.id;
      const workspaceId = req.user.workspaceId || req.params.workspaceId;

      if (!workspaceId) {
        throw new BadRequestException(
          "Workspace ID is required for permission check."
        );
      }

      // Get user's role and permissions in the workspace
      const userWorkspace = await db.userWorkspace.findFirst({
        where: {
          userId,
          workspaceId,
          status: "ACTIVE",
        },
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      if (!userWorkspace) {
        throw new BadRequestException(
          "Access denied. User not found in workspace."
        );
      }

      // Check if user has the Owner role (always has all permissions)
      if (userWorkspace.role.isSystem && userWorkspace.role.name === "Owner") {
        return next();
      }

      // Check if user has the required permission
      const hasPermission = userWorkspace.role.rolePermissions.some(
        (rp) => rp.permission.name === requiredPermission
      );

      if (!hasPermission) {
        throw new BadRequestException(
          `Access denied. Required permission: ${requiredPermission}`
        );
      }

      // Add user role and permissions to request for use in controllers
      req.user.role = userWorkspace.role;
      (req.user as any).permissions = userWorkspace.role.rolePermissions.map(
        (rp) => rp.permission.name
      );

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Helper function to check multiple permissions (user needs ALL of them)
export const checkPermissions = (
  requiredPermissions: string[]
): RequestHandler => {
  return async (req, res, next) => {
    try {
      if (!req.user?.id) {
        throw new BadRequestException("Access denied. User not authenticated.");
      }

      const userId = req.user.id;
      const workspaceId = req.user.workspaceId || req.params.workspaceId;

      if (!workspaceId) {
        throw new BadRequestException(
          "Workspace ID is required for permission check."
        );
      }

      // Get user's role and permissions in the workspace
      const userWorkspace = await db.userWorkspace.findFirst({
        where: {
          userId,
          workspaceId,
          status: "ACTIVE",
        },
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      if (!userWorkspace) {
        throw new BadRequestException(
          "Access denied. User not found in workspace."
        );
      }

      // Check if user has the Owner role (always has all permissions)
      if (userWorkspace.role.isSystem && userWorkspace.role.name === "Owner") {
        return next();
      }

      // Check if user has ALL required permissions
      const userPermissions = userWorkspace.role.rolePermissions.map(
        (rp) => rp.permission.name
      );

      const hasAllPermissions = requiredPermissions.every((permission) =>
        userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        throw new BadRequestException(
          `Access denied. Required permissions: ${requiredPermissions.join(
            ", "
          )}`
        );
      }

      // Add user role and permissions to request for use in controllers
      req.user.role = userWorkspace.role;
      (req.user as any).permissions = userPermissions;

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Helper function to check any of the permissions (user needs at least ONE)
export const checkAnyPermission = (
  requiredPermissions: string[]
): RequestHandler => {
  return async (req, res, next) => {
    try {
      if (!req.user?.id) {
        throw new BadRequestException("Access denied. User not authenticated.");
      }

      const userId = req.user.id;
      const workspaceId = req.user.workspaceId || req.params.workspaceId;

      if (!workspaceId) {
        throw new BadRequestException(
          "Workspace ID is required for permission check."
        );
      }

      // Get user's role and permissions in the workspace
      const userWorkspace = await db.userWorkspace.findFirst({
        where: {
          userId,
          workspaceId,
          status: "ACTIVE",
        },
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      if (!userWorkspace) {
        throw new BadRequestException(
          "Access denied. User not found in workspace."
        );
      }

      // Check if user has the Owner role (always has all permissions)
      if (userWorkspace.role.isSystem && userWorkspace.role.name === "Owner") {
        return next();
      }

      // Check if user has ANY of the required permissions
      const userPermissions = userWorkspace.role.rolePermissions.map(
        (rp) => rp.permission.name
      );

      const hasAnyPermission = requiredPermissions.some((permission) =>
        userPermissions.includes(permission)
      );

      if (!hasAnyPermission) {
        throw new BadRequestException(
          `Access denied. Required one of: ${requiredPermissions.join(", ")}`
        );
      }

      // Add user role and permissions to request for use in controllers
      req.user.role = userWorkspace.role;
      (req.user as any).permissions = userPermissions;

      next();
    } catch (error) {
      next(error);
    }
  };
};
