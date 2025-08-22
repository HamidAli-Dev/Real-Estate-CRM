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
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Bell,
  ClipboardCheck,
  CreditCard,
  Fence,
  House,
  LayoutDashboard,
  User,
  UserRoundCog,
  UsersRound,
} from "lucide-react";

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
    },
    {
      title: "Properties",
      href: `/dashboard/properties${
        workspaceId ? `?workspaceId=${workspaceId}` : ""
      }`,
      path: "/dashboard/properties",
      icon: House,
    },
    {
      title: "User Management",
      href: `/dashboard/user-management${
        workspaceId ? `?workspaceId=${workspaceId}` : ""
      }`,
      path: "/dashboard/user-management",
      icon: UsersRound,
    },
    {
      title: "Leads",
      href: `/dashboard/leads${
        workspaceId ? `?workspaceId=${workspaceId}` : ""
      }`,
      path: "/dashboard/leads",
      icon: User,
    },
    {
      title: "Deals",
      href: `/dashboard/deals${
        workspaceId ? `?workspaceId=${workspaceId}` : ""
      }`,
      path: "/dashboard/deals",
      icon: ClipboardCheck,
    },
    {
      title: "Analytics",
      href: `/dashboard/analytics${
        workspaceId ? `?workspaceId=${workspaceId}` : ""
      }`,
      path: "/dashboard/analytics",
      icon: Bell,
    },
  ];

  return (
    <Sidebar className="pl-3 no-scrollbar">
      <SidebarHeader className="flex flex-row w-full items-center justify-between">
        <Link href="/">
          <Image
            src={"/images/logo-2.png"}
            alt="logo"
            width={100}
            height={100}
          />
        </Link>
        <SidebarTrigger className="!text-white !p-0 !bg-gray-800" />
      </SidebarHeader>

      <SidebarContent>
        {menuData.map((menuItem) => {
          const isActive = pathname === menuItem.path;
          const activeClass = isActive ? "bg-blue-100 text-blue-700" : "";
          return (
            <SidebarGroup key={menuItem.title} className="p-0 no-scrollbar">
              <SidebarGroupContent>
                <Link href={menuItem.href}>
                  <SidebarMenu className="py-2 px-4 rounded-md pl-2">
                    <div
                      className={`flex gap-3 items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700 group cursor-pointer whitespace-nowrap ${activeClass}`}
                    >
                      <menuItem.icon size={15} />
                      <SidebarMenuItem>{menuItem.title}</SidebarMenuItem>
                    </div>
                  </SidebarMenu>
                </Link>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;
