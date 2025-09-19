import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "@/lib/axios-client";
import { useSocketContext } from "@/context/socket-provider";
import {
  Notification,
  NotificationStats,
  NotificationFilters,
  UserNotificationPreferences,
  WorkspaceNotificationSettings,
  UpdateNotificationPreferencesData,
} from "@/types/api.types";

// Get notifications for current user in workspace
export const useNotifications = (
  workspaceId: string,
  filters?: NotificationFilters,
  options?: { refetchInterval?: number }
) => {
  return useQuery<Notification[]>({
    queryKey: ["notifications", workspaceId, filters],
    queryFn: async () => {
      try {
        console.log("🔍 Fetching notifications for workspace:", workspaceId);

        const params = new URLSearchParams();

        if (filters?.type) params.append("type", filters.type);
        if (filters?.category) params.append("category", filters.category);
        if (filters?.priority) params.append("priority", filters.priority);
        if (filters?.status) params.append("status", filters.status);
        if (filters?.isRead !== undefined)
          params.append("isRead", filters.isRead.toString());
        if (filters?.limit) params.append("limit", filters.limit.toString());
        if (filters?.offset) params.append("offset", filters.offset.toString());

        const url = `/workspace/${workspaceId}/notifications?${params.toString()}`;
        console.log("🔍 API URL:", url);

        const response = await API.get(url);
        console.log("✅ Notifications API response:", response);
        console.log("🔍 Raw response structure:", {
          successProp: (response as any).success,
          dataType: typeof (response as any).data,
          dataLength: Array.isArray((response as any).data)
            ? (response as any).data.length
            : "Not an array",
          responseType: typeof response,
          isArray: Array.isArray(response),
        });

        // Since axios interceptor returns res.data, response.data contains the notifications array
        const notifications = (response as any).data || [];
        console.log("📋 Processed notifications:", notifications);

        return notifications; // Ensure we always return an array
      } catch (error) {
        console.error("❌ Failed to fetch notifications:", error);
        return []; // Return empty array on error to prevent undefined
      }
    },
    enabled: !!workspaceId,
    refetchInterval: options?.refetchInterval || 30000, // Default 30 seconds
  });
};

// Get notification statistics
export const useNotificationStats = (workspaceId: string) => {
  return useQuery<NotificationStats>({
    queryKey: ["notificationStats", workspaceId],
    queryFn: async () => {
      try {
        const response = await API.get(
          `/workspace/${workspaceId}/notifications/stats`
        );

        console.log("✅ Notification stats API response:", response);

        // Since axios interceptor returns res.data, response.data contains the stats
        return (
          (response as any).data || {
            total: 0,
            unread: 0,
            byCategory: {},
            byPriority: {},
          }
        );
      } catch (error) {
        console.error("❌ Failed to fetch notification stats:", error);
        return { total: 0, unread: 0, byCategory: {}, byPriority: {} }; // Return default stats on error
      }
    },
    enabled: !!workspaceId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// Mark notification as read
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  const { sendNotificationRead, isConnected } = useSocketContext();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      // If WebSocket is connected, use it for real-time updates
      if (isConnected) {
        sendNotificationRead(notificationId);
        // Still make API call for persistence
        const response = await API.patch(
          `/notifications/${notificationId}/read`
        );
        return response.data.data;
      } else {
        // Fallback to API only if WebSocket is not connected
        const response = await API.patch(
          `/notifications/${notificationId}/read`
        );
        return response.data.data;
      }
    },
    onSuccess: (data, notificationId) => {
      // Update the notification in all relevant queries
      queryClient.setQueryData(
        ["notifications"],
        (oldData: Notification[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map((notification) =>
            notification.id === notificationId
              ? {
                  ...notification,
                  isRead: true,
                  status: "READ" as const,
                  readAt: new Date(),
                }
              : notification
          );
        }
      );

      // Also update queries with workspaceId
      queryClient.setQueriesData(
        { queryKey: ["notifications"] },
        (oldData: Notification[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map((notification) =>
            notification.id === notificationId
              ? {
                  ...notification,
                  isRead: true,
                  status: "READ" as const,
                  readAt: new Date(),
                }
              : notification
          );
        }
      );

      // Invalidate stats to update unread count
      queryClient.invalidateQueries({ queryKey: ["notificationStats"] });
    },
  });
};

// Mark multiple notifications as read
export const useMarkMultipleNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationIds: string[]) => {
      const response = await API.patch("/notifications/mark-read", {
        notificationIds,
      });
      return response.data.data;
    },
    onSuccess: (data, notificationIds) => {
      // Update notifications in all relevant queries
      queryClient.setQueryData(
        ["notifications"],
        (oldData: Notification[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map((notification) =>
            notificationIds.includes(notification.id)
              ? {
                  ...notification,
                  isRead: true,
                  status: "READ" as const,
                  readAt: new Date(),
                }
              : notification
          );
        }
      );

      // Invalidate stats to update unread count
      queryClient.invalidateQueries({ queryKey: ["notificationStats"] });
    },
  });
};

// Mark all notifications as read
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workspaceId: string) => {
      const response = await API.patch(
        `/workspace/${workspaceId}/notifications/mark-all-read`
      );
      return response.data.data;
    },
    onSuccess: (data, workspaceId) => {
      // Update all notifications in the workspace
      queryClient.setQueryData(
        ["notifications", workspaceId],
        (oldData: Notification[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map((notification) => ({
            ...notification,
            isRead: true,
            status: "READ" as const,
            readAt: new Date(),
          }));
        }
      );

      // Invalidate stats to update unread count
      queryClient.invalidateQueries({ queryKey: ["notificationStats"] });
    },
  });
};

// Archive notification
export const useArchiveNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await API.patch(
        `/notifications/${notificationId}/archive`
      );
      return response.data.data;
    },
    onSuccess: (data, notificationId) => {
      // Remove the notification from the list
      queryClient.setQueryData(
        ["notifications"],
        (oldData: Notification[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.filter(
            (notification) => notification.id !== notificationId
          );
        }
      );

      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: ["notificationStats"] });
    },
  });
};

// Delete notification
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await API.delete(`/notifications/${notificationId}`);
      return response.data.data;
    },
    onSuccess: (data, notificationId) => {
      // Remove the notification from the list
      queryClient.setQueryData(
        ["notifications"],
        (oldData: Notification[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.filter(
            (notification) => notification.id !== notificationId
          );
        }
      );

      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: ["notificationStats"] });
    },
  });
};

// Default user notification preferences
const DEFAULT_USER_NOTIFICATION_PREFERENCES: UserNotificationPreferences = {
  id: "",
  userId: "",
  leadNotifications: true,
  propertyNotifications: true,
  dealNotifications: true,
  userNotifications: true,
  activityNotifications: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Get user notification preferences
export const useUserNotificationPreferences = () => {
  return useQuery<UserNotificationPreferences>({
    queryKey: ["userNotificationPreferences"],
    queryFn: async (): Promise<UserNotificationPreferences> => {
      try {
        const response = await API.get("/user/notification-preferences");
        // Ensure we always return a valid object
        const data = response.data?.data || response.data;

        if (data && typeof data === "object") {
          return {
            id: data.id || "",
            userId: data.userId || "",
            leadNotifications: data.leadNotifications ?? true,
            propertyNotifications: data.propertyNotifications ?? true,
            dealNotifications: data.dealNotifications ?? true,
            userNotifications: data.userNotifications ?? true,
            activityNotifications: data.activityNotifications ?? true,
            createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
            updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
          };
        }

        // Fallback to defaults if data is invalid
        console.warn("Invalid user notification preferences data:", data);
        return { ...DEFAULT_USER_NOTIFICATION_PREFERENCES };
      } catch (error) {
        console.error("Failed to fetch user notification preferences:", error);
        // Return default preferences if API fails
        return { ...DEFAULT_USER_NOTIFICATION_PREFERENCES };
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    // Provide initial data to prevent undefined state
    initialData: DEFAULT_USER_NOTIFICATION_PREFERENCES,
    // Ensure the query never returns undefined
    select: (data) => data || { ...DEFAULT_USER_NOTIFICATION_PREFERENCES },
  });
};

// Update user notification preferences
export const useUpdateUserNotificationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: UpdateNotificationPreferencesData) => {
      const response = await API.patch(
        "/user/notification-preferences",
        preferences
      );
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate preferences query
      queryClient.invalidateQueries({
        queryKey: ["userNotificationPreferences"],
      });
    },
  });
};

// Default workspace notification settings
const DEFAULT_WORKSPACE_NOTIFICATION_SETTINGS: WorkspaceNotificationSettings = {
  id: "",
  workspaceId: "",
  createdAt: new Date(),
  updatedAt: new Date(),
  notificationBranding: {
    primaryColor: "#3b82f6",
    secondaryColor: "#64748b",
    logoUrl: "",
    companyName: "",
  },
};

// Get workspace notification settings
export const useWorkspaceNotificationSettings = (workspaceId: string) => {
  return useQuery<WorkspaceNotificationSettings>({
    queryKey: ["workspaceNotificationSettings", workspaceId],
    queryFn: async (): Promise<WorkspaceNotificationSettings> => {
      try {
        const response = await API.get(
          `/workspace/${workspaceId}/notification-settings`
        );
        const data = response.data?.data || response.data;

        if (data && typeof data === "object") {
          return {
            id: data.id || "",
            workspaceId: data.workspaceId || workspaceId,
            notificationBranding: data.notificationBranding,
            createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
            updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
          };
        }

        // Fallback to defaults if data is invalid
        console.warn("Invalid workspace notification settings data:", data);
        return { ...DEFAULT_WORKSPACE_NOTIFICATION_SETTINGS, workspaceId };
      } catch (error) {
        console.error(
          "Failed to fetch workspace notification settings:",
          error
        );
        // Return default settings if API fails
        return { ...DEFAULT_WORKSPACE_NOTIFICATION_SETTINGS, workspaceId };
      }
    },
    enabled: !!workspaceId,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    // Provide initial data to prevent undefined state
    initialData: { ...DEFAULT_WORKSPACE_NOTIFICATION_SETTINGS, workspaceId },
    // Ensure the query never returns undefined
    select: (data) =>
      data || { ...DEFAULT_WORKSPACE_NOTIFICATION_SETTINGS, workspaceId },
  });
};

// Update workspace notification settings
export const useUpdateWorkspaceNotificationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workspaceId,
      settings,
    }: {
      workspaceId: string;
      settings: any;
    }) => {
      const response = await API.patch(
        `/workspace/${workspaceId}/notification-settings`,
        settings
      );
      return response.data.data;
    },
    onSuccess: (data, { workspaceId }) => {
      // Invalidate workspace settings query
      queryClient.invalidateQueries({
        queryKey: ["workspaceNotificationSettings", workspaceId],
      });
    },
  });
};

// Custom hook for real-time notification updates
export const useNotificationUpdates = (workspaceId: string) => {
  const queryClient = useQueryClient();
  const { isConnected } = useSocketContext();

  // Use WebSocket for real-time updates, fallback to polling
  const {
    data: notifications,
    isLoading: notificationsLoading,
    error: notificationsError,
    isError: notificationsIsError,
  } = useNotifications(
    workspaceId,
    {
      limit: 10,
    },
    {
      // Reduce polling frequency when WebSocket is connected
      refetchInterval: isConnected ? 60000 : 30000, // 1 minute vs 30 seconds
    }
  );
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    isError: statsIsError,
  } = useNotificationStats(workspaceId);

  // Return the latest notifications and stats
  return {
    notifications: notifications || [],
    stats: stats || { total: 0, unread: 0, byCategory: {}, byPriority: {} },
    unreadCount: stats?.unread || 0,
    isLoading: notificationsLoading || statsLoading,
  };
};

// Hook for notification actions
export const useNotificationActions = () => {
  const markAsRead = useMarkNotificationAsRead();
  const markMultipleAsRead = useMarkMultipleNotificationsAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const archive = useArchiveNotification();
  const deleteNotification = useDeleteNotification();

  return {
    markAsRead: markAsRead.mutate,
    markMultipleAsRead: markMultipleAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    archive: archive.mutate,
    delete: deleteNotification.mutate,
    isLoading:
      markAsRead.isPending ||
      markMultipleAsRead.isPending ||
      markAllAsRead.isPending ||
      archive.isPending ||
      deleteNotification.isPending,
  };
};
