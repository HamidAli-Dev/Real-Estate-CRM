"use client";
import React, { useState } from "react";
import { Bell } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/context/auth-provider";
import WorkspaceSelector from "@/components/workspace/WorkspaceSelector";
import WorkspaceNavigation from "@/components/workspace/WorkspaceNavigation";

import { Button } from "@/components/ui/button";

const TopBar = () => {
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);

  const { user, logout } = useAuthContext();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="px-6 py-4 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h4 className="text-lg font-semibold text-gray-900">
            Estate Elite CRM
          </h4>
          <WorkspaceSelector />
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer bg-transparent">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                2
              </span>
            </Button>
          </div>
          <DropdownMenu open={isOpenDropdown} onOpenChange={setIsOpenDropdown}>
            <DropdownMenuTrigger asChild className="cursor-pointer">
              <div className="flex items-center gap-1">
                <Badge className="rounded-full p-1">
                  {user?.name?.charAt(0).toUpperCase()}
                </Badge>
                <div>{user?.name}</div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={`${isOpenDropdown && "mr-6"}`}>
              <DropdownMenuItem className="text-red-700" onClick={handleLogout}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="mt-4">
        <WorkspaceNavigation />
      </div>
    </div>
  );
};

export default TopBar;
