"use client";
import React, { useState } from "react";
import {
  Search,
  Settings,
  User,
  LogOut,
  HelpCircle,
  ChevronDown,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthContext } from "@/context/auth-provider";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import NotificationDropdown from "@/app/(protechted)/_components/notifications/NotificationDropdown";
import { useSocketContext } from "@/context/socket-provider";
import { usePermission } from "@/hooks/usePermission";
import { useWorkspaceContext } from "@/context/workspace-provider";

const TopBar = () => {
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const { user, logout } = useAuthContext();
  const { isConnected } = useSocketContext();
  const { open } = useSidebar();
  const { isOwner } = usePermission();
  const { currentWorkspace } = useWorkspaceContext();

  const handleLogout = async () => {
    await logout();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  // const toggleTheme = () => {
  //   setIsDarkMode(!isDarkMode);
  //   // TODO: Implement theme switching
  // };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Brand & Sidebar Trigger */}
          <div className="flex items-center space-x-6">
            {!open && (
              <SidebarTrigger className="!text-gray-600 !p-2 !bg-gray-100 hover:!bg-gray-200 rounded-lg transition-colors duration-200" />
            )}

            {/* Personalized Greeting */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-semibold text-lg">
                    {user?.user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 w-4 h-4 ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  } rounded-full border-2 border-white`}
                ></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {currentWorkspace?.workspace.name || "Welcome"}, 👋
                </h1>
                <p className="text-sm text-gray-500 font-medium">
                  {currentWorkspace?.workspace.name
                    ? `Managing ${currentWorkspace.workspace.name}`
                    : "Welcome back to your dashboard"}
                </p>
              </div>
            </div>
          </div>

          {/* Center Section - Search */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search properties, leads, clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl bg-gray-50/50 hover:bg-white transition-all duration-200 shadow-sm"
              />
            </form>
          </div>

          {/* Right Section - Actions & User */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 !mr-0"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button> */}

            {/* Notifications */}
            <NotificationDropdown className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 relative" />

            {/* Messages */}
            <Button
              variant="ghost"
              size="sm"
              className="relative p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <MessageSquare className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </Badge>
            </Button>

            {/* User Profile */}
            <DropdownMenu
              open={isOpenDropdown}
              onOpenChange={setIsOpenDropdown}
            >
              <DropdownMenuTrigger asChild className="cursor-pointer">
                <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-100 transition-all duration-200 border border-gray-200/50">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm font-semibold">
                      {user?.user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.user.name}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      {user?.user.email}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {!isOwner() && (
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link href="/dashboard/user-dashboard">
                      <User className="mr-2 h-4 w-4" />
                      <span>Your Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help & Support</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden mt-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search properties, leads, clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl bg-gray-50/50 hover:bg-white transition-all duration-200 shadow-sm"
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
