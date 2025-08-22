"use client";

import { Home } from "lucide-react";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";

const WorkspaceNavigation = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const workspaceId = searchParams.get("workspaceId");

  if (!workspaceId) return null;

  const navItems = [
    {
      href: `/dashboard?workspaceId=${workspaceId}`,
      label: "Overview",
      icon: Home,
      path: "/dashboard",
    },
  ];

  return (
    <nav className="flex space-x-1 p-1 bg-gray-100 rounded-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default WorkspaceNavigation;
