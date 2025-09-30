"use client";

import { useEffect } from "react";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePermission } from "@/hooks/usePermission";

interface PermissionBasedRouteProtectionProps {
  permission: string;
  redirectTo: string;
  loadingMessage?: string;
}

const PermissionBasedRouteProtection = ({
  permission,
  redirectTo,
  loadingMessage = "Checking permissions...",
}: PermissionBasedRouteProtectionProps) => {
  const router = useRouter();
  const { can, isLoading } = usePermission();

  useEffect(() => {
    if (isLoading) return;

    if (!can) return;

    let hasPermission = false;

    switch (permission) {
      case "VIEW_PROPERTIES":
        hasPermission = can.viewProperties();
        break;
      case "CREATE_PROPERTIES":
        hasPermission = can.createProperties();
        break;
      case "EDIT_PROPERTIES":
        hasPermission = can.editProperties();
        break;
      case "DELETE_PROPERTIES":
        hasPermission = can.deleteProperties();
        break;
      case "VIEW_LEADS":
        hasPermission = can.viewLeads();
        break;
      case "CREATE_LEADS":
        hasPermission = can.createLeads();
        break;
      case "EDIT_LEADS":
        hasPermission = can.editLeads();
        break;
      case "DELETE_LEADS":
        hasPermission = can.deleteLeads();
        break;
      case "VIEW_DEALS":
        hasPermission = can.viewDeals();
        break;
      case "CREATE_DEALS":
        hasPermission = can.createDeals();
        break;
      case "EDIT_DEALS":
        hasPermission = can.editDeals();
        break;
      case "DELETE_DEALS":
        hasPermission = can.deleteDeals();
        break;
      case "VIEW_USERS":
        hasPermission = can.viewUsers();
        break;
      case "INVITE_USERS":
        hasPermission = can.inviteUsers();
        break;
      case "EDIT_USER_ROLES":
        hasPermission = can.editUserRoles();
        break;
      case "REMOVE_USERS":
        hasPermission = can.removeUsers();
        break;
      case "VIEW_SETTINGS":
        hasPermission = can.viewSettings();
        break;
      case "EDIT_SETTINGS":
        hasPermission = can.editSettings();
        break;
      case "VIEW_ANALYTICS":
        hasPermission = can.viewAnalytics();
        break;
      case "EXPORT_REPORTS":
        hasPermission = can.exportReports();
        break;
      default:
        hasPermission = can.hasPermission(permission);
    }

    if (!hasPermission) {
      router.replace(redirectTo);
    }
  }, [can, isLoading, permission, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80">
        <div className="flex items-center space-x-2">
          <Loader className="h-8 w-8 animate-spin" />
          <span>{loadingMessage}</span>
        </div>
      </div>
    );
  }

  return null;
};

export default PermissionBasedRouteProtection;
