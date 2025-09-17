"use client";

import React, { useState } from "react";
import {
  Bell,
  Target,
  Calendar,
  Home,
  Users,
  Settings,
  AlertTriangle,
  Check,
  Archive,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useNotificationUpdates,
  useNotificationActions,
} from "@/hooks/API/use-notifications";
import { useWorkspaceContext } from "@/context/workspace-provider";
import {
  Notification,
  NotificationType,
  NotificationCategory,
} from "@/types/api.types";
import { formatDistanceToNow } from "date-fns";

interface NotificationDropdownProps {
  className?: string;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  className,
}) => {
  const { currentWorkspace } = useWorkspaceContext();
  const { notifications, unreadCount } = useNotificationUpdates(
    currentWorkspace?.workspace?.id || ""
  );
  const {
    markAsRead,
    markAllAsRead,
    archive,
    delete: deleteNotification,
  } = useNotificationActions();
  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (
    type: NotificationType,
    category: NotificationCategory
  ) => {
    switch (category) {
      case "LEADS":
        return <Target className="w-4 h-4" />;
      case "PROPERTIES":
        return <Home className="w-4 h-4" />;
      case "DEALS":
        return <Check className="w-4 h-4" />;
      case "USERS":
        return <Users className="w-4 h-4" />;
      case "ACTIVITIES":
        return <Calendar className="w-4 h-4" />;
      case "WORKSPACE":
        return <Settings className="w-4 h-4" />;
      case "SYSTEM":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (
    category: NotificationCategory,
    priority: string
  ) => {
    const baseColors = {
      LEADS: "bg-blue-100 text-blue-600",
      PROPERTIES: "bg-green-100 text-green-600",
      DEALS: "bg-purple-100 text-purple-600",
      USERS: "bg-orange-100 text-orange-600",
      ACTIVITIES: "bg-cyan-100 text-cyan-600",
      WORKSPACE: "bg-gray-100 text-gray-600",
      SYSTEM: "bg-red-100 text-red-600",
    };

    const priorityColors = {
      URGENT: "bg-red-100 text-red-600",
      HIGH: "bg-orange-100 text-orange-600",
      MEDIUM: baseColors[category],
      LOW: "bg-gray-100 text-gray-600",
    };

    return (
      priorityColors[priority as keyof typeof priorityColors] ||
      baseColors[category]
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Handle action buttons if available
    if (notification.actionButtons && notification.actionButtons.length > 0) {
      const primaryAction = notification.actionButtons[0];
      if (primaryAction.url) {
        window.location.href = primaryAction.url;
      }
    }
  };

  const handleMarkAllAsRead = () => {
    if (currentWorkspace?.workspace?.id) {
      markAllAsRead(currentWorkspace.workspace.id);
    }
  };

  const handleArchiveNotification = (
    e: React.MouseEvent,
    notificationId: string
  ) => {
    e.stopPropagation();
    archive(notificationId);
  };

  const handleDeleteNotification = (
    e: React.MouseEvent,
    notificationId: string
  ) => {
    e.stopPropagation();
    deleteNotification(notificationId);
  };

  const formatNotificationTime = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={`relative ${className}`}>
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-96 p-0 shadow-xl border-0 bg-white/95 backdrop-blur-md"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-sm text-gray-900">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs h-7 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="max-h-96">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                No notifications yet
              </p>
              <p className="text-xs text-gray-400">
                You'll see updates here when they arrive
              </p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex items-start space-x-3 p-3 cursor-pointer rounded-lg mb-2 transition-all duration-200 hover:bg-gray-50 ${
                    !notification.isRead
                      ? "bg-blue-50/50 border-l-2 border-l-blue-500"
                      : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div
                    className={`p-2.5 rounded-xl shadow-sm ${getNotificationColor(
                      notification.category,
                      notification.priority
                    )}`}
                  >
                    {getNotificationIcon(
                      notification.type,
                      notification.category
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p
                            className={`text-sm ${
                              !notification.isRead
                                ? "font-semibold text-gray-900"
                                : "font-medium text-gray-700"
                            }`}
                          >
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2 font-medium">
                          {formatNotificationTime(notification.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center space-x-1 ml-3">
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger
                            className="h-7 w-7 p-0 bg-transparent border-none cursor-pointer hover:bg-gray-100 rounded-lg flex items-center justify-center transition-all duration-200"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="w-4 h-4 text-gray-500" />
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent
                            className="w-32"
                            sideOffset={5}
                            alignOffset={-5}
                          >
                            <DropdownMenuItem
                              onClick={(e) =>
                                handleArchiveNotification(e, notification.id)
                              }
                              className="text-xs cursor-pointer"
                            >
                              <Archive className="w-3 h-3 mr-2" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) =>
                                handleDeleteNotification(e, notification.id)
                              }
                              className="text-xs text-red-600 cursor-pointer hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {notification.actionButtons &&
                      notification.actionButtons.length > 0 && (
                        <div className="flex space-x-2 mt-3">
                          {notification.actionButtons
                            .slice(0, 2)
                            .map((button, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 px-3 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (button.url) {
                                    window.location.href = button.url;
                                  }
                                }}
                              >
                                {button.label}
                              </Button>
                            ))}
                        </div>
                      )}
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-gray-100 p-3 bg-gray-50/50 dark:bg-gray-900/50">
          <DropdownMenuItem className="text-center text-blue-600 hover:text-blue-700 cursor-pointer font-medium py-2 rounded-lg hover:bg-blue-50 transition-all duration-200">
            View all notifications
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
