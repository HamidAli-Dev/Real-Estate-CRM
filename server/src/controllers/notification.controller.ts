import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  createNotificationService,
  getNotificationsService,
  getNotificationStatsService,
  markNotificationAsReadService,
  markMultipleNotificationsAsReadService,
  markAllNotificationsAsReadService,
  archiveNotificationService,
  deleteNotificationService,
  getUserNotificationPreferencesService,
  updateUserNotificationPreferencesService,
  getWorkspaceNotificationSettingsService,
  updateWorkspaceNotificationSettingsService,
  cleanupOldNotificationsService,
  NotificationFilters,
} from "../services/notification.service";
import { BadRequestException } from "../utils/AppError";

// Get notifications for current user
export const getNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const userId = req.user?.id;
    const {
      type,
      category,
      priority,
      status,
      isRead,
      limit = 50,
      offset = 0,
    } = req.query;

    if (!userId) {
      throw new BadRequestException("User not authenticated");
    }

    const filters: NotificationFilters = {
      workspaceId,
      userId,
      type: type as any,
      category: category as any,
      priority: priority as any,
      status: status as any,
      isRead: isRead === "true" ? true : isRead === "false" ? false : undefined,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    };

    const notifications = await getNotificationsService(filters);

    res.status(200).json({
      success: true,
      data: notifications,
      message: "Notifications retrieved successfully",
    });
  }
);

// Get notification statistics
export const getNotificationStats = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new BadRequestException("User not authenticated");
    }

    const stats = await getNotificationStatsService(workspaceId, userId);

    res.status(200).json({
      success: true,
      data: stats,
      message: "Notification statistics retrieved successfully",
    });
  }
);

// Mark notification as read
export const markNotificationAsRead = asyncHandler(
  async (req: Request, res: Response) => {
    const { notificationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new BadRequestException("User not authenticated");
    }

    const notification = await markNotificationAsReadService(
      notificationId,
      userId
    );

    res.status(200).json({
      success: true,
      data: notification,
      message: "Notification marked as read",
    });
  }
);

// Mark multiple notifications as read
export const markMultipleNotificationsAsRead = asyncHandler(
  async (req: Request, res: Response) => {
    const { notificationIds } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new BadRequestException("User not authenticated");
    }

    if (!notificationIds || !Array.isArray(notificationIds)) {
      throw new BadRequestException("Notification IDs array is required");
    }

    const result = await markMultipleNotificationsAsReadService(
      notificationIds,
      userId
    );

    res.status(200).json({
      success: true,
      data: result,
      message: `${result.count} notifications marked as read`,
    });
  }
);

// Mark all notifications as read
export const markAllNotificationsAsRead = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new BadRequestException("User not authenticated");
    }

    const result = await markAllNotificationsAsReadService(workspaceId, userId);

    res.status(200).json({
      success: true,
      data: result,
      message: `${result.count} notifications marked as read`,
    });
  }
);

// Archive notification
export const archiveNotification = asyncHandler(
  async (req: Request, res: Response) => {
    const { notificationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new BadRequestException("User not authenticated");
    }

    const notification = await archiveNotificationService(
      notificationId,
      userId
    );

    res.status(200).json({
      success: true,
      data: notification,
      message: "Notification archived",
    });
  }
);

// Delete notification
export const deleteNotification = asyncHandler(
  async (req: Request, res: Response) => {
    const { notificationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new BadRequestException("User not authenticated");
    }

    const notification = await deleteNotificationService(
      notificationId,
      userId
    );

    res.status(200).json({
      success: true,
      data: notification,
      message: "Notification deleted",
    });
  }
);

// Get user notification preferences
export const getUserNotificationPreferences = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw new BadRequestException("User not authenticated");
    }

    const preferences = await getUserNotificationPreferencesService(userId);

    res.status(200).json({
      success: true,
      data: preferences,
      message: "Notification preferences retrieved successfully",
    });
  }
);

// Update user notification preferences
export const updateUserNotificationPreferences = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const preferences = req.body;

    if (!userId) {
      throw new BadRequestException("User not authenticated");
    }

    const updatedPreferences = await updateUserNotificationPreferencesService(
      userId,
      preferences
    );

    res.status(200).json({
      success: true,
      data: updatedPreferences,
      message: "Notification preferences updated successfully",
    });
  }
);

// Get workspace notification settings
export const getWorkspaceNotificationSettings = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.params;

    const settings = await getWorkspaceNotificationSettingsService(workspaceId);

    res.status(200).json({
      success: true,
      data: settings,
      message: "Workspace notification settings retrieved successfully",
    });
  }
);

// Update workspace notification settings
export const updateWorkspaceNotificationSettings = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const settings = req.body;

    const updatedSettings = await updateWorkspaceNotificationSettingsService(
      workspaceId,
      settings
    );

    res.status(200).json({
      success: true,
      data: updatedSettings,
      message: "Workspace notification settings updated successfully",
    });
  }
);

// Cleanup old notifications (admin only)
export const cleanupOldNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    const { daysOld = 30 } = req.body;

    const result = await cleanupOldNotificationsService(workspaceId, daysOld);

    res.status(200).json({
      success: true,
      data: result,
      message: `${result.count} old notifications cleaned up`,
    });
  }
);
