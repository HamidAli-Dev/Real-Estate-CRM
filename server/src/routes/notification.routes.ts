import { Router } from "express";
import {
  getNotifications,
  getNotificationStats,
  markNotificationAsRead,
  markMultipleNotificationsAsRead,
  markAllNotificationsAsRead,
  archiveNotification,
  deleteNotification,
  getUserNotificationPreferences,
  updateUserNotificationPreferences,
  getWorkspaceNotificationSettings,
  updateWorkspaceNotificationSettings,
  cleanupOldNotifications,
} from "../controllers/notification.controller";
import { authenticate } from "../middlewares/passportAuth.middleware";
import { checkPermission } from "../middlewares/permission.middleware";

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// Get notifications for current user in a workspace
router.get("/workspace/:workspaceId/notifications", getNotifications);

// Get notification statistics for current user
router.get("/workspace/:workspaceId/notifications/stats", getNotificationStats);

// Mark single notification as read
router.patch("/notifications/:notificationId/read", markNotificationAsRead);

// Mark multiple notifications as read
router.patch("/notifications/mark-read", markMultipleNotificationsAsRead);

// Mark all notifications as read for user in workspace
router.patch(
  "/workspace/:workspaceId/notifications/mark-all-read",
  markAllNotificationsAsRead
);

// Archive notification
router.patch("/notifications/:notificationId/archive", archiveNotification);

// Delete notification
router.delete("/notifications/:notificationId", deleteNotification);

// Get user notification preferences
router.get("/user/notification-preferences", getUserNotificationPreferences);

// Update user notification preferences
router.patch(
  "/user/notification-preferences",
  updateUserNotificationPreferences
);

// Get workspace notification settings (requires workspace settings permission)
router.get(
  "/workspace/:workspaceId/notification-settings",
  checkPermission("EDIT_SETTINGS"),
  getWorkspaceNotificationSettings
);

// Update workspace notification settings (requires workspace settings permission)
router.patch(
  "/workspace/:workspaceId/notification-settings",
  checkPermission("EDIT_SETTINGS"),
  updateWorkspaceNotificationSettings
);

// Cleanup old notifications (requires workspace settings permission)
router.delete(
  "/workspace/:workspaceId/notifications/cleanup",
  checkPermission("EDIT_SETTINGS"),
  cleanupOldNotifications
);

export default router;
