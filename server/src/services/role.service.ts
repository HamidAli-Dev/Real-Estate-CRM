import { db } from "../utils/db";
import { BadRequestException } from "../utils/AppError";

export interface CreateRoleInput {
  name: string;
  workspaceId: string;
  permissions: string[];
}

export interface UpdateRolePermissionsInput {
  workspaceId: string;
  roleId: string;
  roleName: string;
  permissions: string[];
}

export interface AssignRoleInput {
  userId: string;
  roleId: string;
  workspaceId: string;
}

// Create a new role with permissions
export const createRoleService = async (data: CreateRoleInput) => {
  const { name, workspaceId, permissions } = data;

  // Check if role name already exists in workspace
  const existingRole = await db.role.findFirst({
    where: {
      name,
      workspaceId,
    },
  });

  if (existingRole) {
    throw new BadRequestException(
      "Role with this name already exists in the workspace"
    );
  }

  // Validate permissions by checking if they exist in the database
  const existingPermissions = await db.permission.findMany({
    where: {
      name: {
        in: permissions,
      },
    },
  });

  const existingPermissionNames = existingPermissions.map((p) => p.name);
  const invalidPermissions = permissions.filter(
    (p) => !existingPermissionNames.includes(p)
  );

  if (invalidPermissions.length > 0) {
    throw new BadRequestException(
      `Invalid permissions: ${invalidPermissions.join(", ")}`
    );
  }

  // Create role and permissions in a transaction
  const result = await db.$transaction(async (tx) => {
    // Create the role
    const role = await tx.role.create({
      data: {
        name,
        workspaceId,
        isSystem: false,
      },
    });

    // Get or create permissions
    const permissionRecords = await Promise.all(
      permissions.map(async (permissionName) => {
        let permission = await tx.permission.findUnique({
          where: { name: permissionName },
        });

        if (!permission) {
          permission = await tx.permission.create({
            data: {
              name: permissionName,
              group: getPermissionGroup(permissionName),
            },
          });
        }

        return permission;
      })
    );

    // Create role-permission relationships
    await Promise.all(
      permissionRecords.map((permission) =>
        tx.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: permission.id,
          },
        })
      )
    );

    return {
      ...role,
      permissions: permissionRecords,
    };
  });

  return result;
};

// Update role permissions
export const updateRolePermissionsService = async (
  data: UpdateRolePermissionsInput
) => {
  const { workspaceId, roleId, roleName, permissions } = data;

  // Check if role exists
  const role = await db.role.findUnique({
    where: { id: roleId },
  });

  if (!role) {
    throw new BadRequestException("Role not found");
  }

  // Prevent updating system roles (Owner)
  if (role.isSystem) {
    throw new BadRequestException("Cannot modify system roles");
  }

  // Validate permissions by checking if they exist in the database
  const existingPermissions = await db.permission.findMany({
    where: {
      name: {
        in: permissions,
      },
    },
  });

  const existingPermissionNames = existingPermissions.map((p) => p.name);
  const invalidPermissions = permissions.filter(
    (p) => !existingPermissionNames.includes(p)
  );

  if (invalidPermissions.length > 0) {
    throw new BadRequestException(
      `Invalid permissions: ${invalidPermissions.join(", ")}`
    );
  }

  // Update permissions in a transaction
  const result = await db.$transaction(async (tx) => {
    // Remove existing role permissions
    await tx.rolePermission.deleteMany({
      where: { roleId },
    });

    // Update role name
    await tx.role.update({
      where: { id: roleId },
      data: { name: roleName },
    });

    // Get or create permissions
    const permissionRecords = await Promise.all(
      permissions.map(async (permissionName) => {
        let permission = await tx.permission.findUnique({
          where: { name: permissionName },
        });

        if (!permission) {
          permission = await tx.permission.create({
            data: {
              name: permissionName,
              group: getPermissionGroup(permissionName),
            },
          });
        }

        return permission;
      })
    );

    // Create new role-permission relationships
    await Promise.all(
      permissionRecords.map((permission) =>
        tx.rolePermission.create({
          data: {
            roleId,
            permissionId: permission.id,
          },
        })
      )
    );

    return permissionRecords;
  });

  return result;
};

// Get all roles in a workspace
export const getWorkspaceRolesService = async (workspaceId: string) => {
  const roles = await db.role.findMany({
    where: { workspaceId },
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
      _count: {
        select: {
          userWorkspaces: true,
        },
      },
    },
    orderBy: [
      { isSystem: "desc" }, // System roles first
      { name: "asc" },
    ],
  });

  return roles.map((role) => ({
    ...role,
    userCount: role._count.userWorkspaces,
  }));
};

// Get role by ID with permissions
export const getRoleByIdService = async (roleId: string) => {
  const role = await db.role.findUnique({
    where: { id: roleId },
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
      _count: {
        select: {
          userWorkspaces: true,
        },
      },
    },
  });

  if (!role) {
    throw new BadRequestException("Role not found");
  }

  return {
    ...role,
    userCount: role._count.userWorkspaces,
  };
};

// Delete role
export const deleteRoleService = async (
  roleId: string,
  workspaceId: string
) => {
  // Check if role exists
  const role = await db.role.findUnique({
    where: { id: roleId },
  });

  if (!role) {
    throw new BadRequestException("Role not found");
  }

  if (role.workspaceId !== workspaceId) {
    throw new BadRequestException("Role does not belong to this workspace");
  }

  // Prevent deleting system roles
  if (role.isSystem) {
    throw new BadRequestException("Cannot delete system roles");
  }

  // Check if role is assigned to any users
  const userCount = await db.userWorkspace.count({
    where: { roleId },
  });

  if (userCount > 0) {
    throw new BadRequestException(
      `Cannot delete role. It is assigned to ${userCount} user(s). Please reassign users first.`
    );
  }

  // Delete role and its permissions
  await db.$transaction(async (tx) => {
    // Delete role permissions
    await tx.rolePermission.deleteMany({
      where: { roleId },
    });

    // Delete all user invitations that reference this role (including pending ones)
    await tx.userInvitation.deleteMany({
      where: { roleId },
    });

    // Delete the role
    await tx.role.delete({
      where: { id: roleId },
    });
  });

  return { message: "Role deleted successfully" };
};

// Assign role to user
export const assignRoleToUserService = async (data: AssignRoleInput) => {
  const { userId, roleId, workspaceId } = data;

  // Check if user exists in workspace
  const userWorkspace = await db.userWorkspace.findFirst({
    where: {
      userId,
      workspaceId,
    },
  });

  if (!userWorkspace) {
    throw new BadRequestException("User not found in workspace");
  }

  // Check if role exists in workspace
  const role = await db.role.findFirst({
    where: {
      id: roleId,
      workspaceId,
    },
  });

  if (!role) {
    throw new BadRequestException("Role not found in workspace");
  }

  // Update user's role
  const updatedUserWorkspace = await db.userWorkspace.update({
    where: { id: userWorkspace.id },
    data: { roleId },
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
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return updatedUserWorkspace;
};

// Get all available permissions grouped by category
export const getPermissionsService = async () => {
  const permissions = await db.permission.findMany({
    select: {
      name: true,
      group: true,
    },
  });

  const groupedPermissions = permissions.reduce((acc, permission) => {
    const group = permission.group || getPermissionGroup(permission.name);
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(permission.name);
    return acc;
  }, {} as Record<string, string[]>);

  return groupedPermissions;
};

// Helper function to get permission group
function getPermissionGroup(permission: string): string {
  if (
    permission.startsWith("VIEW_") ||
    permission.startsWith("CREATE_") ||
    permission.startsWith("EDIT_") ||
    permission.startsWith("DELETE_")
  ) {
    const resource = permission.split("_")[1];
    return resource === "PROPERTIES"
      ? "Properties"
      : resource === "LEADS"
      ? "Leads"
      : resource === "DEALS"
      ? "Deals"
      : resource === "PIPELINE"
      ? "Pipeline"
      : resource === "USERS"
      ? "Users"
      : resource === "SETTINGS"
      ? "Settings"
      : resource === "ANALYTICS"
      ? "Analytics"
      : "Other";
  }
  return "Other";
}
