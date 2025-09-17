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
  Search,
  MoreHorizontal,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useNotifications,
  useNotificationActions,
} from "@/hooks/API/use-notifications";
import { useWorkspaceContext } from "@/context/workspace-provider";
import {
  Notification,
  NotificationType,
  NotificationCategory,
  NotificationPriority,
  NotificationStatus,
} from "@/types/api.types";
import { formatDistanceToNow } from "date-fns";

interface NotificationCenterProps {
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  className,
}) => {
  const { currentWorkspace } = useWorkspaceContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    NotificationCategory | "ALL"
  >("ALL");
  const [selectedPriority, setSelectedPriority] = useState<
    NotificationPriority | "ALL"
  >("ALL");
  const [selectedStatus, setSelectedStatus] = useState<
    NotificationStatus | "ALL"
  >("ALL");

  const { data: notifications = [], isLoading } = useNotifications(
    currentWorkspace?.id || "",
    {
      category: selectedCategory !== "ALL" ? selectedCategory : undefined,
      priority: selectedPriority !== "ALL" ? selectedPriority : undefined,
      status: selectedStatus !== "ALL" ? selectedStatus : undefined,
      limit: 100,
    }
  );

  const {
    markAsRead,
    markAllAsRead,
    archive,
    delete: deleteNotification,
  } = useNotificationActions();

  const getNotificationIcon = (
    type: NotificationType,
    category: NotificationCategory
  ) => {
    switch (category) {
      case "LEADS":
        return <Target className="w-5 h-5" />;
      case "PROPERTIES":
        return <Home className="w-5 h-5" />;
      case "DEALS":
        return <Check className="w-5 h-5" />;
      case "USERS":
        return <Users className="w-5 h-5" />;
      case "ACTIVITIES":
        return <Calendar className="w-5 h-5" />;
      case "WORKSPACE":
        return <Settings className="w-5 h-5" />;
      case "SYSTEM":
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (
    category: NotificationCategory,
    priority: string
  ) => {
    const baseColors = {
      LEADS: "bg-blue-100 text-blue-600 border-blue-200",
      PROPERTIES: "bg-green-100 text-green-600 border-green-200",
      DEALS: "bg-purple-100 text-purple-600 border-purple-200",
      USERS: "bg-orange-100 text-orange-600 border-orange-200",
      ACTIVITIES: "bg-cyan-100 text-cyan-600 border-cyan-200",
      WORKSPACE: "bg-gray-100 text-gray-600 border-gray-200",
      SYSTEM: "bg-red-100 text-red-600 border-red-200",
    };

    const priorityColors = {
      URGENT: "bg-red-100 text-red-600 border-red-200",
      HIGH: "bg-orange-100 text-orange-600 border-orange-200",
      MEDIUM: baseColors[category],
      LOW: "bg-gray-100 text-gray-600 border-gray-200",
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
    if (currentWorkspace?.id) {
      markAllAsRead(currentWorkspace.id);
    }
  };

  const handleArchiveNotification = (notificationId: string) => {
    archive(notificationId);
  };

  const handleDeleteNotification = (notificationId: string) => {
    deleteNotification(notificationId);
  };

  const formatNotificationTime = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  // Filter notifications based on search query
  const filteredNotifications = notifications.filter((notification) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      notification.title.toLowerCase().includes(query) ||
      notification.message.toLowerCase().includes(query) ||
      notification.type.toLowerCase().includes(query)
    );
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-gray-600">
            {unreadCount} unread of {notifications.length} total notifications
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline">
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  <SelectItem value="LEADS">Leads</SelectItem>
                  <SelectItem value="PROPERTIES">Properties</SelectItem>
                  <SelectItem value="DEALS">Deals</SelectItem>
                  <SelectItem value="USERS">Users</SelectItem>
                  <SelectItem value="ACTIVITIES">Activities</SelectItem>
                  <SelectItem value="WORKSPACE">Workspace</SelectItem>
                  <SelectItem value="SYSTEM">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <Select
                value={selectedPriority}
                onValueChange={(value) => setSelectedPriority(value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Priorities</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => setSelectedStatus(value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="UNREAD">Unread</SelectItem>
                  <SelectItem value="READ">Read</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notifications</CardTitle>
          <CardDescription>
            {filteredNotifications.length} notifications found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No notifications found</p>
                <p className="text-sm">
                  Try adjusting your filters or check back later
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.isRead ? "bg-blue-50/50" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-4">
                      <div
                        className={`p-3 rounded-full border ${getNotificationColor(
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
                              <h3
                                className={`text-sm font-medium ${
                                  !notification.isRead
                                    ? "text-gray-900"
                                    : "text-gray-600"
                                }`}
                              >
                                {notification.title}
                              </h3>
                              {!notification.isRead && (
                                <Badge variant="secondary" className="text-xs">
                                  Unread
                                </Badge>
                              )}
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  notification.priority === "URGENT"
                                    ? "border-red-200 text-red-600"
                                    : notification.priority === "HIGH"
                                    ? "border-orange-200 text-orange-600"
                                    : "border-gray-200 text-gray-600"
                                }`}
                              >
                                {notification.priority}
                              </Badge>
                            </div>

                            <p className="text-sm text-gray-600 mb-2">
                              {notification.message}
                            </p>

                            <div className="flex items-center space-x-4 text-xs text-gray-400">
                              <span>
                                {formatNotificationTime(notification.createdAt)}
                              </span>
                              <span>•</span>
                              <span className="capitalize">
                                {notification.category.toLowerCase()}
                              </span>
                              {notification.triggeredBy && (
                                <>
                                  <span>•</span>
                                  <span>
                                    by {notification.triggeredBy.name}
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Action Buttons */}
                            {notification.actionButtons &&
                              notification.actionButtons.length > 0 && (
                                <div className="flex space-x-2 mt-3">
                                  {notification.actionButtons
                                    .slice(0, 3)
                                    .map((button, index) => (
                                      <Button
                                        key={index}
                                        variant="outline"
                                        size="sm"
                                        className="text-xs h-7 px-3"
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

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleArchiveNotification(notification.id)
                                }
                              >
                                <Archive className="w-4 h-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDeleteNotification(notification.id)
                                }
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationCenter;
