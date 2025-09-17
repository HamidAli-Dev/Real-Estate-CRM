import { db } from "../utils/db";
import {
  createNotificationService,
  createBulkNotificationsService,
  CreateNotificationInput,
} from "./notification.service";
import {
  NotificationType,
  NotificationCategory,
  NotificationPriority,
} from "@prisma/client";
import { getSocketService } from "./socket.service";

// Helper function to check if user should receive notification based on preferences
const shouldSendNotification = async (
  userId: string,
  category: NotificationCategory,
  type: NotificationType
): Promise<boolean> => {
  try {
    const preferences = await db.userNotificationPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // If no preferences exist, use defaults (allow all)
      return true;
    }

    // Check category-specific preferences
    switch (category) {
      case "LEADS":
        return preferences.leadNotifications;
      case "PROPERTIES":
        return preferences.propertyNotifications;
      case "DEALS":
        return preferences.dealNotifications;
      case "USERS":
        return preferences.userNotifications;
      case "ACTIVITIES":
        return preferences.activityNotifications;
      default:
        return true;
    }
  } catch (error) {
    console.error("❌ Error checking notification preferences:", error);
    // Default to allowing notifications if there's an error
    return true;
  }
};

// Lead-related notification triggers
export const triggerLeadAssignedNotification = async (
  leadId: string,
  assignedToId: string,
  assignedByName: string,
  workspaceId: string,
  assignedById?: string // Optional: the actual user ID who assigned the lead
) => {
  try {
    const lead = await db.lead.findUnique({
      where: { id: leadId },
      include: {
        assignedTo: { select: { name: true } },
        pipelineStage: { select: { name: true } },
      },
    });

    if (!lead) {
      throw new Error("Lead not found");
    }

    const notification: CreateNotificationInput = {
      title: "New Lead Assigned",
      message: `${assignedByName} assigned you a new lead: ${lead.name}`,
      type: NotificationType.LEAD_ASSIGNED,
      category: NotificationCategory.LEADS,
      priority: NotificationPriority.MEDIUM,
      workspaceId,
      userId: assignedToId,
      triggeredById: assignedById || null, // Use actual user ID or null
      relatedEntityType: "lead",
      relatedEntityId: leadId,
      actionButtons: [
        {
          label: "View Lead",
          action: "view_lead",
          url: `/dashboard/leads/${leadId}`,
        },
        {
          label: "Contact Lead",
          action: "contact_lead",
          url: `/dashboard/leads/${leadId}/contact`,
        },
      ],
      metadata: {
        leadName: lead.name,
        leadStage: lead.pipelineStage.name,
        assignedByName,
      },
    };

    // Check if user should receive this notification based on preferences
    const shouldSend = await shouldSendNotification(
      assignedToId,
      "LEADS",
      NotificationType.LEAD_ASSIGNED
    );

    if (!shouldSend) {
      console.log(`🔕 User ${assignedToId} has disabled lead notifications`);
      return null;
    }

    const createdNotification = await createNotificationService(notification);

    // Send real-time WebSocket notification
    try {
      const socketService = getSocketService();
      socketService.sendNotificationToUser(assignedToId, {
        id: createdNotification.id,
        title: createdNotification.title,
        message: createdNotification.message,
        type: createdNotification.type,
        category: createdNotification.category,
        priority: createdNotification.priority,
        isRead: createdNotification.isRead,
        createdAt: createdNotification.createdAt,
        actionButtons: createdNotification.actionButtons,
        metadata: createdNotification.metadata,
      });
    } catch (socketError) {
      console.error("❌ Failed to send WebSocket notification:", socketError);
      // Don't throw error - WebSocket failure shouldn't break notification creation
    }

    // Also notify the assigner with a personalized "You assigned..." message
    try {
      if (assignedById && assignedById !== assignedToId) {
        const senderWantsNotification = await shouldSendNotification(
          assignedById,
          "LEADS",
          NotificationType.LEAD_ASSIGNED
        );

        if (senderWantsNotification) {
          const senderNotification: CreateNotificationInput = {
            title: "Lead Assigned",
            message: `You assigned "${lead.name}" to ${lead.assignedTo.name}`,
            type: NotificationType.LEAD_ASSIGNED,
            category: NotificationCategory.LEADS,
            priority: NotificationPriority.MEDIUM,
            workspaceId,
            userId: assignedById,
            triggeredById: assignedById,
            relatedEntityType: "lead",
            relatedEntityId: leadId,
            actionButtons: [
              {
                label: "View Lead",
                action: "view_lead",
                url: `/dashboard/leads/${leadId}`,
              },
            ],
            metadata: {
              leadName: lead.name,
              assignedToName: lead.assignedTo.name,
              assignedByName,
            },
          };

          const createdSenderNotification = await createNotificationService(
            senderNotification
          );

          // Send WebSocket notification to the assigner
          try {
            const socketService = getSocketService();
            socketService.sendNotificationToUser(assignedById, {
              id: createdSenderNotification.id,
              title: createdSenderNotification.title,
              message: createdSenderNotification.message,
              type: createdSenderNotification.type,
              category: createdSenderNotification.category,
              priority: createdSenderNotification.priority,
              isRead: createdSenderNotification.isRead,
              createdAt: createdSenderNotification.createdAt,
              actionButtons: createdSenderNotification.actionButtons,
              metadata: createdSenderNotification.metadata,
            });
          } catch (socketError) {
            console.error(
              "❌ Failed to send WebSocket notification (assigner):",
              socketError
            );
          }
        }
      }
    } catch (senderError) {
      console.error(
        "❌ Failed to create sender (assigner) notification:",
        senderError
      );
    }

    return createdNotification;
  } catch (error) {
    console.error("❌ Failed to trigger lead assigned notification:", error);
    throw error;
  }
};

export const triggerLeadStageChangedNotification = async (
  leadId: string,
  newStageName: string,
  changedByName: string,
  workspaceId: string
) => {
  try {
    const lead = await db.lead.findUnique({
      where: { id: leadId },
      include: {
        assignedTo: { select: { id: true, name: true } },
      },
    });

    if (!lead) {
      throw new Error("Lead not found");
    }

    const notification: CreateNotificationInput = {
      title: "Lead Stage Updated",
      message: `${changedByName} moved "${lead.name}" to ${newStageName}`,
      type: NotificationType.LEAD_STAGE_CHANGED,
      category: NotificationCategory.LEADS,
      priority: NotificationPriority.LOW,
      workspaceId,
      userId: lead.assignedTo.id,
      relatedEntityType: "lead",
      relatedEntityId: leadId,
      actionButtons: [
        {
          label: "View Lead",
          action: "view_lead",
          url: `/dashboard/leads/${leadId}`,
        },
      ],
      metadata: {
        leadName: lead.name,
        newStage: newStageName,
        changedByName,
      },
    };

    return await createNotificationService(notification);
  } catch (error) {
    console.error(
      "❌ Failed to trigger lead stage changed notification:",
      error
    );
    throw error;
  }
};

export const triggerLeadConvertedToDealNotification = async (
  leadId: string,
  dealId: string,
  convertedByName: string,
  workspaceId: string
) => {
  try {
    const lead = await db.lead.findUnique({
      where: { id: leadId },
      include: {
        assignedTo: { select: { id: true, name: true } },
      },
    });

    if (!lead) {
      throw new Error("Lead not found");
    }

    const notification: CreateNotificationInput = {
      title: "Lead Converted to Deal",
      message: `🎉 ${convertedByName} converted "${lead.name}" into a deal!`,
      type: NotificationType.LEAD_CONVERTED_TO_DEAL,
      category: NotificationCategory.DEALS,
      priority: NotificationPriority.HIGH,
      workspaceId,
      userId: lead.assignedTo.id,
      relatedEntityType: "deal",
      relatedEntityId: dealId,
      actionButtons: [
        {
          label: "View Deal",
          action: "view_deal",
          url: `/dashboard/deals/${dealId}`,
        },
      ],
      metadata: {
        leadName: lead.name,
        dealId,
        convertedByName,
      },
    };

    return await createNotificationService(notification);
  } catch (error) {
    console.error(
      "❌ Failed to trigger lead converted to deal notification:",
      error
    );
    throw error;
  }
};

// Property-related notification triggers
export const triggerPropertyListedNotification = async (
  propertyId: string,
  listedByName: string,
  workspaceId: string
) => {
  try {
    const property = await db.property.findUnique({
      where: { id: propertyId },
      include: {
        listedBy: { select: { name: true } },
        category: { select: { category: true } },
      },
    });

    if (!property) {
      throw new Error("Property not found");
    }

    // Get all workspace users to notify them about new property
    const workspaceUsers = await db.userWorkspace.findMany({
      where: {
        workspaceId,
        status: "ACTIVE",
      },
      include: {
        user: { select: { id: true } },
      },
    });

    const userIds = workspaceUsers.map((uw) => uw.user.id);

    const notificationData: Omit<CreateNotificationInput, "userId"> = {
      title: "New Property Listed",
      message: `${listedByName} listed a new ${property.category.category.toLowerCase()}: ${
        property.title
      }`,
      type: NotificationType.PROPERTY_LISTED,
      category: NotificationCategory.PROPERTIES,
      priority: NotificationPriority.MEDIUM,
      workspaceId,
      triggeredById: listedByName, // This should be the user ID
      relatedEntityType: "property",
      relatedEntityId: propertyId,
      actionButtons: [
        {
          label: "View Property",
          action: "view_property",
          url: `/dashboard/properties/${propertyId}`,
        },
      ],
      metadata: {
        propertyTitle: property.title,
        propertyPrice: property.price,
        propertyType: property.category.category,
        listedByName,
      },
    };

    // Filter users based on their notification preferences
    const filteredUserIds = [];
    for (const userId of userIds) {
      const shouldSend = await shouldSendNotification(
        userId,
        "PROPERTIES",
        NotificationType.PROPERTY_LISTED
      );
      if (shouldSend) {
        filteredUserIds.push(userId);
      } else {
        console.log(`🔕 User ${userId} has disabled property notifications`);
      }
    }

    if (filteredUserIds.length === 0) {
      console.log("🔕 No users want to receive property notifications");
      return { count: 0, notifications: [] };
    }

    const result = await createBulkNotificationsService(
      [notificationData],
      filteredUserIds
    );

    // Send real-time WebSocket notification to filtered workspace users
    try {
      const socketService = getSocketService();
      socketService.sendNotificationToWorkspace(workspaceId, {
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        category: notificationData.category,
        priority: notificationData.priority,
        isRead: false,
        createdAt: new Date(),
        actionButtons: notificationData.actionButtons,
        metadata: notificationData.metadata,
        relatedEntityType: notificationData.relatedEntityType,
        relatedEntityId: notificationData.relatedEntityId,
      });
    } catch (socketError) {
      console.error("❌ Failed to send WebSocket notification:", socketError);
      // Don't throw error - WebSocket failure shouldn't break notification creation
    }

    return result;
  } catch (error) {
    console.error("❌ Failed to trigger property listed notification:", error);
    throw error;
  }
};

export const triggerPropertyStatusChangedNotification = async (
  propertyId: string,
  newStatus: string,
  changedByName: string,
  workspaceId: string
) => {
  try {
    const property = await db.property.findUnique({
      where: { id: propertyId },
      include: {
        listedBy: { select: { id: true, name: true } },
      },
    });

    if (!property) {
      throw new Error("Property not found");
    }

    const notification: CreateNotificationInput = {
      title: "Property Status Updated",
      message: `${changedByName} updated "${property.title}" status to ${newStatus}`,
      type: NotificationType.PROPERTY_STATUS_CHANGED,
      category: NotificationCategory.PROPERTIES,
      priority: NotificationPriority.MEDIUM,
      workspaceId,
      userId: property.listedBy.id,
      relatedEntityType: "property",
      relatedEntityId: propertyId,
      actionButtons: [
        {
          label: "View Property",
          action: "view_property",
          url: `/dashboard/properties/${propertyId}`,
        },
      ],
      metadata: {
        propertyTitle: property.title,
        newStatus,
        changedByName,
      },
    };

    return await createNotificationService(notification);
  } catch (error) {
    console.error(
      "❌ Failed to trigger property status changed notification:",
      error
    );
    throw error;
  }
};

// Deal-related notification triggers
export const triggerDealClosedNotification = async (
  dealId: string,
  closedByName: string,
  workspaceId: string
) => {
  try {
    const deal = await db.deal.findUnique({
      where: { id: dealId },
      include: {
        lead: {
          include: {
            assignedTo: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!deal) {
      throw new Error("Deal not found");
    }

    // Notify the assigned user and workspace users about deal closure
    const workspaceUsers = await db.userWorkspace.findMany({
      where: {
        workspaceId,
        status: "ACTIVE",
      },
      include: {
        user: { select: { id: true } },
      },
    });

    const userIds = workspaceUsers.map((uw) => uw.user.id);

    const notificationData: Omit<CreateNotificationInput, "userId"> = {
      title: "🎉 Deal Closed Successfully!",
      message: `${closedByName} closed the deal for "${deal.lead.name}"`,
      type: NotificationType.DEAL_CLOSED,
      category: NotificationCategory.DEALS,
      priority: NotificationPriority.HIGH,
      workspaceId,
      triggeredById: closedByName, // This should be the user ID
      relatedEntityType: "deal",
      relatedEntityId: dealId,
      actionButtons: [
        {
          label: "View Deal",
          action: "view_deal",
          url: `/dashboard/deals/${dealId}`,
        },
      ],
      metadata: {
        leadName: deal.lead.name,
        closedByName,
        dealId,
      },
    };

    return await createBulkNotificationsService([notificationData], userIds);
  } catch (error) {
    console.error("❌ Failed to trigger deal closed notification:", error);
    throw error;
  }
};

// User-related notification triggers
export const triggerUserInvitedNotification = async (
  invitedUserEmail: string,
  invitedUserName: string,
  invitedByName: string,
  roleName: string,
  workspaceId: string
) => {
  try {
    // Get all workspace admins/owners to notify them about new invitation
    const workspaceAdmins = await db.userWorkspace.findMany({
      where: {
        workspaceId,
        status: "ACTIVE",
        role: {
          isSystem: true, // Owners
        },
      },
      include: {
        user: { select: { id: true } },
      },
    });

    const userIds = workspaceAdmins.map((uw) => uw.user.id);

    const notificationData: Omit<CreateNotificationInput, "userId"> = {
      title: "User Invited to Workspace",
      message: `${invitedByName} invited ${invitedUserName} (${invitedUserEmail}) as ${roleName}`,
      type: NotificationType.USER_INVITED,
      category: NotificationCategory.USERS,
      priority: NotificationPriority.MEDIUM,
      workspaceId,
      triggeredById: invitedByName, // This should be the user ID
      actionButtons: [
        {
          label: "View Invitations",
          action: "view_invitations",
          url: `/dashboard/user-management`,
        },
      ],
      metadata: {
        invitedUserEmail,
        invitedUserName,
        roleName,
        invitedByName,
      },
    };

    const result = await createBulkNotificationsService(
      [notificationData],
      userIds
    );

    // Send real-time WebSocket notification to workspace admins
    try {
      const socketService = getSocketService();
      socketService.sendNotificationToMultipleUsers(userIds, {
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        category: notificationData.category,
        priority: notificationData.priority,
        isRead: false,
        createdAt: new Date(),
        actionButtons: notificationData.actionButtons,
        metadata: notificationData.metadata,
      });
    } catch (socketError) {
      console.error("❌ Failed to send WebSocket notification:", socketError);
      // Don't throw error - WebSocket failure shouldn't break notification creation
    }

    return result;
  } catch (error) {
    console.error("❌ Failed to trigger user invited notification:", error);
    throw error;
  }
};

export const triggerUserJoinedNotification = async (
  joinedUserId: string,
  joinedUserName: string,
  workspaceId: string
) => {
  try {
    // Get all workspace users to notify them about new member
    const workspaceUsers = await db.userWorkspace.findMany({
      where: {
        workspaceId,
        status: "ACTIVE",
      },
      include: {
        user: { select: { id: true } },
      },
    });

    const userIds = workspaceUsers
      .map((uw) => uw.user.id)
      .filter((id) => id !== joinedUserId); // Don't notify the user who just joined

    const notificationData: Omit<CreateNotificationInput, "userId"> = {
      title: "New Team Member Joined",
      message: `👋 ${joinedUserName} joined the workspace`,
      type: NotificationType.USER_JOINED,
      category: NotificationCategory.USERS,
      priority: NotificationPriority.LOW,
      workspaceId,
      relatedEntityType: "user",
      relatedEntityId: joinedUserId,
      actionButtons: [
        {
          label: "View Team",
          action: "view_team",
          url: `/dashboard/user-management`,
        },
      ],
      metadata: {
        joinedUserName,
        joinedUserId,
      },
    };

    return await createBulkNotificationsService([notificationData], userIds);
  } catch (error) {
    console.error("❌ Failed to trigger user joined notification:", error);
    throw error;
  }
};

// Activity-related notification triggers
export const triggerActivityScheduledNotification = async (
  activityId: string,
  activityType: string,
  scheduledFor: Date,
  scheduledByName: string,
  assignedToId: string,
  workspaceId: string
) => {
  try {
    const activity = await db.activity.findUnique({
      where: { id: activityId },
      include: {
        lead: { select: { name: true } },
      },
    });

    if (!activity) {
      throw new Error("Activity not found");
    }

    const notification: CreateNotificationInput = {
      title: "Activity Scheduled",
      message: `${scheduledByName} scheduled a ${activityType.toLowerCase()} for "${
        activity.lead.name
      }" on ${scheduledFor.toLocaleDateString()}`,
      type: NotificationType.ACTIVITY_SCHEDULED,
      category: NotificationCategory.ACTIVITIES,
      priority: NotificationPriority.MEDIUM,
      workspaceId,
      userId: assignedToId,
      triggeredById: scheduledByName, // This should be the user ID
      relatedEntityType: "activity",
      relatedEntityId: activityId,
      actionButtons: [
        {
          label: "View Activity",
          action: "view_activity",
          url: `/dashboard/activities/${activityId}`,
        },
        {
          label: "Add to Calendar",
          action: "add_to_calendar",
          url: `/dashboard/activities/${activityId}/calendar`,
        },
      ],
      metadata: {
        activityType,
        scheduledFor: scheduledFor.toISOString(),
        leadName: activity.lead.name,
        scheduledByName,
      },
    };

    return await createNotificationService(notification);
  } catch (error) {
    console.error(
      "❌ Failed to trigger activity scheduled notification:",
      error
    );
    throw error;
  }
};

// System notification triggers
export const triggerSystemAlertNotification = async (
  title: string,
  message: string,
  priority: NotificationPriority,
  workspaceId: string,
  userIds?: string[]
) => {
  try {
    let targetUserIds = userIds;

    // If no specific users provided, notify all workspace users
    if (!targetUserIds || targetUserIds.length === 0) {
      const workspaceUsers = await db.userWorkspace.findMany({
        where: {
          workspaceId,
          status: "ACTIVE",
        },
        include: {
          user: { select: { id: true } },
        },
      });

      targetUserIds = workspaceUsers.map((uw) => uw.user.id);
    }

    const notificationData: Omit<CreateNotificationInput, "userId"> = {
      title,
      message,
      type: NotificationType.SYSTEM_ALERT,
      category: NotificationCategory.WORKSPACE,
      priority,
      workspaceId,
      actionButtons: [
        {
          label: "View Details",
          action: "view_system_alert",
          url: `/dashboard/system-alerts`,
        },
      ],
      metadata: {
        alertType: "system",
        timestamp: new Date().toISOString(),
      },
    };

    return await createBulkNotificationsService(
      [notificationData],
      targetUserIds
    );
  } catch (error) {
    console.error("❌ Failed to trigger system alert notification:", error);
    throw error;
  }
};
