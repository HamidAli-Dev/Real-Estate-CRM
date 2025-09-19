"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Bell,
  ClipboardCheck,
  House,
  LayoutDashboard,
  User,
  UsersRound,
  TrendingUp,
  Settings,
  ChevronRight,
} from "lucide-react";
import WorkspaceSelector from "@/app/(protechted)/_components/workspace/WorkspaceSelector";
import { cn } from "@/lib/utils";

const DashboardSidebar = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");

  const menuData = [
    {
      title: "Dashboard",
      href: `/dashboard${workspaceId ? `?workspaceId=${workspaceId}` : ""}`,
      path: "/dashboard",
      icon: LayoutDashboard,
      description: "Overview & insights",
    },
    {
      title: "Properties",
      href: `/dashboard/properties${
        workspaceId ? `?workspaceId=${workspaceId}` : ""
      }`,
      path: "/dashboard/properties",
      icon: House,
      description: "Manage listings",
    },
    {
      title: "Leads",
      href: `/dashboard/leads${
        workspaceId ? `?workspaceId=${workspaceId}` : ""
      }`,
      path: "/dashboard/leads",
      icon: User,
      description: "Track prospects",
    },
    {
      title: "Deals",
      href: `/dashboard/deals${
        workspaceId ? `?workspaceId=${workspaceId}` : ""
      }`,
      path: "/dashboard/deals",
      icon: ClipboardCheck,
      description: "Sales pipeline",
    },
    {
      title: "Analytics",
      href: `/dashboard/analytics${
        workspaceId ? `?workspaceId=${workspaceId}` : ""
      }`,
      path: "/dashboard/analytics",
      icon: TrendingUp,
      description: "Performance metrics",
    },
  ];

  const managementData = [
    {
      title: "User Management",
      href: `/dashboard/user-management${
        workspaceId ? `?workspaceId=${workspaceId}` : ""
      }`,
      path: "/dashboard/user-management",
      icon: UsersRound,
      description: "Team & permissions",
    },
    {
      title: "Workspace Settings",
      href: `/dashboard/workspace-settings${
        workspaceId ? `?workspaceId=${workspaceId}` : ""
      }`,
      path: "/dashboard/workspace-settings",
      icon: Settings,
      description: "Configure workspace",
    },
  ];

  return (
    <Sidebar className="border-r border-gray-200/50 bg-gradient-to-b from-white to-gray-50/30 shadow-sm">
      {/* Header Section */}
      <SidebarHeader className="border-b border-gray-200/50 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="relative">
              <Image
                src={"/images/logo-2.png"}
                alt="Real Estate CRM"
                width={32}
                height={32}
                className="rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200"
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900 text-sm">
                RealEstate CRM
              </span>
              <span className="text-xs text-gray-500">Multi-tenant SaaS</span>
            </div>
          </Link>
          <SidebarTrigger className="h-8 w-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors duration-200" />
        </div>
      </SidebarHeader>

      {/* Workspace Selector Section */}
      <div className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/30">
        <div className="mb-3">
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Current Workspace
          </span>
        </div>
        <WorkspaceSelector />
      </div>

      <SidebarContent className="px-3 py-4 space-y-6">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-1">
            {menuData.map((menuItem) => {
              const isActive = pathname === menuItem.path;
              return (
                <Link key={menuItem.title} href={menuItem.href}>
                  <div
                    className={cn(
                      "group flex items-center justify-between px-3 py-3 transition-all duration-200 cursor-pointer relative",
                      isActive
                        ? "bg-white text-gray-900 rounded-r-2xl shadow-lg"
                        : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 hover:shadow-sm rounded-xl"
                    )}
                    style={
                      isActive
                        ? {
                            marginRight: "-16px",
                            paddingRight: "32px",
                          }
                        : {}
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={cn(
                          "p-2 rounded-lg transition-colors duration-200",
                          isActive
                            ? "bg-gray-100 text-gray-700"
                            : "bg-gray-100 text-gray-600 group-hover:bg-gray-200 group-hover:text-gray-700"
                        )}
                      >
                        <menuItem.icon size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {menuItem.title}
                        </span>
                        <span
                          className={cn(
                            "text-xs transition-colors duration-200",
                            isActive
                              ? "text-gray-600"
                              : "text-gray-500 group-hover:text-gray-600"
                          )}
                        >
                          {menuItem.description}
                        </span>
                      </div>
                    </div>
                    {isActive && (
                      <ChevronRight size={14} className="text-gray-600" />
                    )}
                  </div>
                </Link>
              );
            })}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-1">
            {managementData.map((menuItem) => {
              const isActive = pathname === menuItem.path;
              return (
                <Link key={menuItem.title} href={menuItem.href}>
                  <div
                    className={cn(
                      "group flex items-center justify-between px-3 py-3 transition-all duration-200 cursor-pointer relative",
                      isActive
                        ? "bg-white text-gray-900 rounded-r-2xl shadow-lg"
                        : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 hover:shadow-sm rounded-xl"
                    )}
                    style={
                      isActive
                        ? {
                            marginRight: "-16px",
                            paddingRight: "32px",
                          }
                        : {}
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={cn(
                          "p-2 rounded-lg transition-colors duration-200",
                          isActive
                            ? "bg-gray-100 text-gray-700"
                            : "bg-gray-100 text-gray-600 group-hover:bg-gray-200 group-hover:text-gray-700"
                        )}
                      >
                        <menuItem.icon size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {menuItem.title}
                        </span>
                        <span
                          className={cn(
                            "text-xs transition-colors duration-200",
                            isActive
                              ? "text-gray-600"
                              : "text-gray-500 group-hover:text-gray-600"
                          )}
                        >
                          {menuItem.description}
                        </span>
                      </div>
                    </div>
                    {isActive && (
                      <ChevronRight size={14} className="text-gray-600" />
                    )}
                  </div>
                </Link>
              );
            })}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;
