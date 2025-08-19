import Link from "next/link";
import Image from "next/image";

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
  const menuData = [
    {
      label: "Dashboard",
      menuItems: [
        {
          title: "Overview",
          icon: <LayoutDashboard size={15} />,
          href: "/dashboard",
        },
      ],
    },
    {
      label: "CRM",
      menuItems: [
        {
          title: "Properties",
          icon: <House size={15} />,
          href: "/dashboard/properties",
        },
        {
          title: "Leads Pipeline",
          icon: <User size={15} />,
          href: "/dashboard/leads",
        },
        {
          title: "Task & Activities",
          icon: <ClipboardCheck size={15} />,
          href: "/dashboard/leads",
        },
      ],
    },
    {
      label: "Management",
      menuItems: [
        {
          title: "User Management",
          icon: <UsersRound size={15} />,
          href: "/dashboard/users",
        },
        {
          title: "Notifications",
          icon: <Bell size={15} />,
          href: "/dashboard/notifications",
        },
      ],
    },
    {
      label: "Settings",
      menuItems: [
        {
          title: "Workspace Settings",
          icon: <Fence size={15} />,
          href: "/dashboard/workspace-settings",
        },
        {
          title: "Subscription & Billing",
          icon: <CreditCard size={15} />,
          href: "/dashboard/billing",
        },
        {
          title: "Profile Settings",
          icon: <UserRoundCog size={15} />,
          href: "/dashboard/profile-settings",
        },
      ],
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
        {menuData.map((menuItem) => (
          <SidebarGroup key={menuItem.label} className="p-0 no-scrollbar">
            <SidebarGroupLabel className="text-[#9ca3af] uppercase">
              {menuItem.label}
            </SidebarGroupLabel>

            {menuItem.menuItems.map((name) => (
              <SidebarGroupContent key={name.title}>
                <Link href={name.href}>
                  <SidebarMenu className="hover:bg- py-2 px-4 rounded-md pl-2">
                    <div className="flex gap-3 items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700 group cursor-pointer whitespace-nowrap">
                      {name.icon}{" "}
                      <SidebarMenuItem>{name.title}</SidebarMenuItem>
                    </div>
                  </SidebarMenu>
                </Link>
              </SidebarGroupContent>
            ))}
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;
