"use client";

import { useAuthContext } from "@/context/auth-provider";
import { useWorkspaceContext } from "@/context/workspace-provider";
import { useQuery } from "@tanstack/react-query";
import API from "@/lib/axios-client";
import { useMemo } from "react";

interface UserPermissions {
  permissions: string[];
  role: {
    id: string;
    name: string;
    isSystem: boolean;
  };
}

export const usePermission = () => {
  const { user } = useAuthContext();
  const { currentWorkspace } = useWorkspaceContext();

  // Fetch user's permissions in the current workspace
  const { data: userPermissions, isLoading } = useQuery({
    queryKey: ["user-permissions", user?.user.id, currentWorkspace?.id],
    queryFn: async (): Promise<UserPermissions> => {
      if (!user?.user.id || !currentWorkspace?.id) {
        return { permissions: [], role: { id: "", name: "", isSystem: false } };
      }

      try {
        const response = await API.get(`/user/current`);
        // Since axios interceptor returns res.data, response is already the data object
        const userData = (response as any).data?.user || (response as any).user;

        // Check if user has role information
        if (!userData.role) {
          return {
            permissions: [],
            role: { id: "", name: "", isSystem: false },
          };
        }

        // If user has Owner role (system role), they have all permissions
        if (userData.role.isSystem && userData.role.name === "Owner") {
          return {
            permissions: [
              "VIEW_PROPERTIES",
              "CREATE_PROPERTIES",
              "EDIT_PROPERTIES",
              "DELETE_PROPERTIES",
              "VIEW_LEADS",
              "CREATE_LEADS",
              "EDIT_LEADS",
              "DELETE_LEADS",
              "VIEW_DEALS",
              "CREATE_DEALS",
              "EDIT_DEALS",
              "DELETE_DEALS",
              "VIEW_USERS",
              "INVITE_USERS",
              "EDIT_USER_ROLES",
              "REMOVE_USERS",
              "VIEW_SETTINGS",
              "EDIT_SETTINGS",
              "VIEW_ANALYTICS",
              "EXPORT_REPORTS",
            ],
            role: userData.role,
          };
        }

        // Get role permissions
        const roleResponse = await API.get(`/roles/${userData.role.id}`);
        // Since axios interceptor returns res.data, roleResponse is already the data object
        const roleData = (roleResponse as any).data || roleResponse;

        return {
          permissions:
            roleData.rolePermissions?.map((rp: any) => rp.permission.name) ||
            [],
          role: userData.role,
        };
      } catch (error) {
        console.error("Error fetching user permissions:", error);
        return { permissions: [], role: { id: "", name: "", isSystem: false } };
      }
    },
    enabled: !!user?.user.id && !!currentWorkspace?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Memoized permission checker
  const can = useMemo(() => {
    if (!userPermissions) {
      return {
        // Property permissions
        viewProperties: () => false,
        createProperties: () => false,
        editProperties: () => false,
        deleteProperties: () => false,

        // Lead permissions
        viewLeads: () => false,
        createLeads: () => false,
        editLeads: () => false,
        deleteLeads: () => false,

        // Deal permissions
        viewDeals: () => false,
        createDeals: () => false,
        editDeals: () => false,
        deleteDeals: () => false,

        // User management permissions
        viewUsers: () => false,
        inviteUsers: () => false,
        editUserRoles: () => false,
        removeUsers: () => false,

        // Workspace settings
        viewSettings: () => false,
        editSettings: () => false,

        // Analytics and reports
        viewAnalytics: () => false,
        exportReports: () => false,

        // Generic permission checker
        hasPermission: (permission: string) => false,
      };
    }

    const hasPermission = (permission: string): boolean => {
      return userPermissions.permissions.includes(permission);
    };

    return {
      // Property permissions - Fixed to match backend permission names
      viewProperties: () => hasPermission("VIEW_PROPERTIES"),
      createProperties: () => hasPermission("CREATE_PROPERTIES"),
      editProperties: () => hasPermission("EDIT_PROPERTIES"),
      deleteProperties: () => hasPermission("DELETE_PROPERTIES"),

      // Lead permissions
      viewLeads: () => hasPermission("VIEW_LEADS"),
      createLeads: () => hasPermission("CREATE_LEADS"),
      editLeads: () => hasPermission("EDIT_LEADS"),
      deleteLeads: () => hasPermission("DELETE_LEADS"),

      // Deal permissions
      viewDeals: () => hasPermission("VIEW_DEALS"),
      createDeals: () => hasPermission("CREATE_DEALS"),
      editDeals: () => hasPermission("EDIT_DEALS"),
      deleteDeals: () => hasPermission("DELETE_DEALS"),

      // User management permissions
      viewUsers: () => hasPermission("VIEW_USERS"),
      inviteUsers: () => hasPermission("INVITE_USERS"),
      editUserRoles: () => hasPermission("EDIT_USER_ROLES"),
      removeUsers: () => hasPermission("REMOVE_USERS"),
      createRoles: () => hasPermission("EDIT_SETTINGS"), // Role creation is part of settings management

      // Workspace settings
      viewSettings: () => hasPermission("VIEW_SETTINGS"),
      editSettings: () => hasPermission("EDIT_SETTINGS"),

      // Analytics and reports
      viewAnalytics: () => hasPermission("VIEW_ANALYTICS"),
      exportReports: () => hasPermission("EXPORT_REPORTS"),

      // Generic permission checker
      hasPermission,
    };
  }, [userPermissions]);

  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!userPermissions) return false;
    return permissions.some((permission) =>
      userPermissions.permissions.includes(permission)
    );
  };

  // Check if user has all of the specified permissions
  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!userPermissions) return false;
    return permissions.every((permission) =>
      userPermissions.permissions.includes(permission)
    );
  };

  // Check if user is owner
  const isOwner = (): boolean => {
    return (
      userPermissions?.role.isSystem === true &&
      userPermissions.role.name === "Owner"
    );
  };

  return {
    can,
    hasAnyPermission,
    hasAllPermissions,
    isOwner,
    permissions: userPermissions?.permissions || [],
    role: userPermissions?.role,
    isLoading,
  };
};
