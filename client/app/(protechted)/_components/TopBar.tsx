"use client";
import React, { useState } from "react";
import { Bell, RefreshCw } from "lucide-react";
import { OctagonAlert } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/context/auth-provider";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";

const TopBar = () => {
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);

  const { isLoading, user, logout } = useAuthContext();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900">Estate Elte CRM</h4>
        <div className="flex items-center space-x-4">
          <DropdownMenu
            open={isWorkspaceOpen}
            onOpenChange={setIsWorkspaceOpen}
          >
            <DropdownMenuTrigger asChild className="cursor-pointer">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <span>Create Workspace</span> +
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={`${isOpenDropdown && "mr-6"}`}>
              <form>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="workspace-name" className="text-sm">
                      Workspace Name
                    </label>
                    <input
                      type="text"
                      id="workspace-name"
                      className="w-full rounded-md border-gray-300 p-2 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="workspace-description" className="text-sm">
                      Workspace Description
                    </label>
                    <textarea
                      id="workspace-description"
                      rows={4}
                      className="w-full rounded-md border-gray-300 p-2 text-sm"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    Create
                  </Button>
                </div>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>

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
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
