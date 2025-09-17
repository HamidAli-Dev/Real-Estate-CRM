import { db } from "../utils/db";
import { BadRequestException } from "../utils/AppError";
import {
  NotificationType,
  NotificationCategory,
  NotificationPriority,
  NotificationStatus,
} from "@prisma/client";

// Types for notification creation
export interface CreateNotificationInput {
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  priority?: NotificationPriority;
  workspaceId: string;
  userId: string;
  triggeredById?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  actionButtons?: any[];
  metadata?: any;
}

export interface NotificationFilters {
  workspaceId: string;
  userId?: string;
  type?: NotificationType;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  status?: NotificationStatus;
  isRead?: boolean;
  limit?: number;
  offset?: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
}

// Create a new notification
export const createNotificationService = async (
  data: CreateNotificationInput
) => {
  try {
    // Validate triggeredById exists in database if provided
    let validTriggeredById = data.triggeredById;
    if (data.triggeredById) {
      const triggeredByUser = await db.user.findUnique({
        where: { id: data.triggeredById },
        select: { id: true },
      });
      if (!triggeredByUser) {
        console.warn(
          `⚠️ triggeredById ${data.triggeredById} not found, setting to null`
        );
        validTriggeredById = null;
      }
    }

    const notification = await db.notification.create({
      data: {
        title: data.title,
        message: data.message,
        type: data.type,
        category: data.category,
        priority: data.priority || NotificationPriority.MEDIUM,
        status: NotificationStatus.UNREAD, // Explicitly set status to UNREAD
        workspaceId: data.workspaceId,
        userId: data.userId,
        triggeredById: validTriggeredById,
        relatedEntityType: data.relatedEntityType,
        relatedEntityId: data.relatedEntityId,
        actionButtons: data.actionButtons,
        metadata: data.metadata,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        triggeredBy: {
          select: {
            id: true,
            name: true,
          },
        },
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return notification;
  } catch (error) {
    console.error("❌ Failed to create notification:", error);
    throw new BadRequestException("Failed to create notification");
  }
};

// Create notifications for multiple users (e.g., workspace-wide notifications)
export const createBulkNotificationsService = async (
  notifications: Omit<CreateNotificationInput, "userId">[],
  userIds: string[]
) => {
  try {
    const notificationData = userIds.flatMap((userId) =>
      notifications.map((notification) => ({
        ...notification,
        userId,
        status: NotificationStatus.UNREAD, // Explicitly set status to UNREAD
        // Set triggeredById to null if it's not a valid UUID
        triggeredById:
          notification.triggeredById &&
          notification.triggeredById.length === 36 &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            notification.triggeredById
          )
            ? notification.triggeredById
            : null,
      }))
    );

    const result = await db.notification.createMany({
      data: notificationData,
    });

    return result;
  } catch (error) {
    console.error("❌ Failed to create bulk notifications:", error);
    throw new BadRequestException("Failed to create bulk notifications");
  }
};

export const getNotificationsService = async (filters: NotificationFilters) => {
  try {
    const where: any = {
      workspaceId: filters.workspaceId,
      status: { not: "ARCHIVED" }, // Exclude archived notifications by default
    };

    if (filters.userId) where.userId = filters.userId;
    if (filters.type) where.type = filters.type;
    if (filters.category) where.category = filters.category;
    if (filters.priority) where.priority = filters.priority;
    if (filters.status) where.status = filters.status; // This will override the archived filter if explicitly set
    if (filters.isRead !== undefined) where.isRead = filters.isRead;

    const notifications = await db.notification.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        triggeredBy: {
          select: {
            id: true,
            name: true,
          },
        },
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: filters.limit || 50,
      skip: filters.offset || 0,
    });

    return notifications;
  } catch (error) {
    console.error("❌ Failed to get notifications:", error);
    throw new BadRequestException("Failed to get notifications");
  }
};

export const getNotificationStatsService = async (
  workspaceId: string,
  userId?: string
): Promise<NotificationStats> => {
  try {
    const where: any = {
      workspaceId,
      status: { not: "ARCHIVED" }, // Exclude archived notifications from stats
    };
    if (userId) where.userId = userId;

    const [total, unread, byCategory, byPriority] = await Promise.all([
      // Total notifications
      db.notification.count({ where }),

      // Unread notifications
      db.notification.count({ where: { ...where, isRead: false } }),

      // By category
      db.notification.groupBy({
        by: ["category"],
        where,
        _count: { category: true },
      }),

      // By priority
      db.notification.groupBy({
        by: ["priority"],
        where,
        _count: { priority: true },
      }),
    ]);

    const categoryStats = byCategory.reduce((acc, item) => {
      acc[item.category] = item._count.category;
      return acc;
    }, {} as Record<string, number>);

    const priorityStats = byPriority.reduce((acc, item) => {
      acc[item.priority] = item._count.priority;
      return acc;
    }, {} as Record<string, number>);

    const result = {
      total,
      unread,
      byCategory: categoryStats,
      byPriority: priorityStats,
    };

    return result;
  } catch (error) {
    console.error("❌ Failed to get notification stats:", error);
    throw new BadRequestException("Failed to get notification statistics");
  }
};

// Mark notification as read
export const markNotificationAsReadService = async (
  notificationId: string,
  userId: string
) => {
  try {
    const notification = await db.notification.update({
      where: {
        id: notificationId,
        userId, // Ensure user can only mark their own notifications as read
      },
      data: {
        isRead: true,
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    });

    return notification;
  } catch (error) {
    console.error("❌ Failed to mark notification as read:", error);
    throw new BadRequestException("Failed to mark notification as read");
  }
};

// Mark multiple notifications as read
export const markMultipleNotificationsAsReadService = async (
  notificationIds: string[],
  userId: string
) => {
  try {
    const result = await db.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId, // Ensure user can only mark their own notifications as read
      },
      data: {
        isRead: true,
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    });

    return result;
  } catch (error) {
    console.error("❌ Failed to mark multiple notifications as read:", error);
    throw new BadRequestException("Failed to mark notifications as read");
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsReadService = async (
  workspaceId: string,
  userId: string
) => {
  try {
    const result = await db.notification.updateMany({
      where: {
        workspaceId,
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    });

    return result;
  } catch (error) {
    console.error("❌ Failed to mark all notifications as read:", error);
    throw new BadRequestException("Failed to mark all notifications as read");
  }
};

// Archive notification
export const archiveNotificationService = async (
  notificationId: string,
  userId: string
) => {
  try {
    const notification = await db.notification.update({
      where: {
        id: notificationId,
        userId, // Ensure user can only archive their own notifications
      },
      data: {
        status: NotificationStatus.ARCHIVED,
      },
    });

    return notification;
  } catch (error) {
    console.error("❌ Failed to archive notification:", error);
    throw new BadRequestException("Failed to archive notification");
  }
};

// Delete notification
export const deleteNotificationService = async (
  notificationId: string,
  userId: string
) => {
  try {
    const notification = await db.notification.delete({
      where: {
        id: notificationId,
        userId, // Ensure user can only delete their own notifications
      },
    });

    return notification;
  } catch (error) {
    console.error("❌ Failed to delete notification:", error);
    throw new BadRequestException("Failed to delete notification");
  }
};

// Get user notification preferences
export const getUserNotificationPreferencesService = async (userId: string) => {
  try {
    let preferences = await db.userNotificationPreferences.findUnique({
      where: { userId },
    });

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await db.userNotificationPreferences.create({
        data: { userId },
      });
    }

    return preferences;
  } catch (error) {
    console.error("❌ Failed to get user notification preferences:", error);
    throw new BadRequestException("Failed to get notification preferences");
  }
};

// Update user notification preferences
export const updateUserNotificationPreferencesService = async (
  userId: string,
  preferences: Partial<{
    emailNotifications: boolean;
    emailDigest: boolean;
    emailDigestFrequency: string;
    pushNotifications: boolean;
    pushForUrgent: boolean;
    inAppNotifications: boolean;
    leadNotifications: boolean;
    propertyNotifications: boolean;
    dealNotifications: boolean;
    userNotifications: boolean;
    activityNotifications: boolean;
    systemNotifications: boolean;
    quietHoursEnabled: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
  }>
) => {
  try {
    const updatedPreferences = await db.userNotificationPreferences.upsert({
      where: { userId },
      update: preferences,
      create: {
        userId,
        ...preferences,
      },
    });

    return updatedPreferences;
  } catch (error) {
    console.error("❌ Failed to update user notification preferences:", error);
    throw new BadRequestException("Failed to update notification preferences");
  }
};

// Get workspace notification settings
export const getWorkspaceNotificationSettingsService = async (
  workspaceId: string
) => {
  try {
    let settings = await db.workspaceNotificationSettings.findUnique({
      where: { workspaceId },
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await db.workspaceNotificationSettings.create({
        data: { workspaceId },
      });
    }

    return settings;
  } catch (error) {
    console.error("❌ Failed to get workspace notification settings:", error);
    throw new BadRequestException(
      "Failed to get workspace notification settings"
    );
  }
};

// Update workspace notification settings
export const updateWorkspaceNotificationSettingsService = async (
  workspaceId: string,
  settings: Partial<{
    notificationBranding: {
      primaryColor: string;
      secondaryColor: string;
      logoUrl: string;
      companyName: string;
    };
  }>
) => {
  try {
    const updateData: any = {};
    if (settings.notificationBranding !== undefined) {
      updateData.notificationBranding = settings.notificationBranding;
    }

    const updatedSettings = await db.workspaceNotificationSettings.upsert({
      where: { workspaceId },
      update: updateData,
      create: {
        workspaceId,
        ...updateData,
      },
    });

    return updatedSettings;
  } catch (error) {
    console.error(
      "❌ Failed to update workspace notification settings:",
      error
    );
    throw new BadRequestException(
      "Failed to update workspace notification settings"
    );
  }
};

// Clean up old notifications (for maintenance)
export const cleanupOldNotificationsService = async (
  workspaceId: string,
  daysOld: number = 30
) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await db.notification.deleteMany({
      where: {
        workspaceId,
        status: NotificationStatus.ARCHIVED,
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return result;
  } catch (error) {
    console.error("❌ Failed to cleanup old notifications:", error);
    throw new BadRequestException("Failed to cleanup old notifications");
  }
};
