/*
  Warnings:

  - You are about to drop the column `notification` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `category` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `message` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('LEAD_ASSIGNED', 'LEAD_STAGE_CHANGED', 'LEAD_PRIORITY_CHANGED', 'LEAD_FOLLOW_UP_REMINDER', 'LEAD_CONVERTED_TO_DEAL', 'PROPERTY_LISTED', 'PROPERTY_PRICE_CHANGED', 'PROPERTY_STATUS_CHANGED', 'PROPERTY_VIEWING_SCHEDULED', 'PROPERTY_IMAGES_UPLOADED', 'DEAL_CREATED', 'DEAL_STAGE_CHANGED', 'DEAL_CLOSED', 'DEAL_NEGOTIATION_UPDATE', 'USER_INVITED', 'USER_JOINED', 'USER_ROLE_CHANGED', 'USER_LEFT_WORKSPACE', 'ACTIVITY_SCHEDULED', 'ACTIVITY_REMINDER', 'ACTIVITY_COMPLETED', 'WORKSPACE_SETTINGS_UPDATED', 'SYSTEM_ALERT', 'SUBSCRIPTION_UPDATE');

-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('LEADS', 'PROPERTIES', 'DEALS', 'USERS', 'ACTIVITIES', 'WORKSPACE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('UNREAD', 'READ', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "notification",
ADD COLUMN     "actionButtons" JSONB,
ADD COLUMN     "category" "NotificationCategory" NOT NULL,
ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "message" TEXT NOT NULL,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "priority" "NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "readAt" TIMESTAMP(3),
ADD COLUMN     "relatedEntityId" TEXT,
ADD COLUMN     "relatedEntityType" TEXT,
ADD COLUMN     "status" "NotificationStatus" NOT NULL DEFAULT 'UNREAD',
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "triggeredById" TEXT,
ADD COLUMN     "type" "NotificationType" NOT NULL;

-- CreateTable
CREATE TABLE "UserNotificationPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "emailDigest" BOOLEAN NOT NULL DEFAULT true,
    "emailDigestFrequency" TEXT NOT NULL DEFAULT 'daily',
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "pushForUrgent" BOOLEAN NOT NULL DEFAULT true,
    "inAppNotifications" BOOLEAN NOT NULL DEFAULT true,
    "leadNotifications" BOOLEAN NOT NULL DEFAULT true,
    "propertyNotifications" BOOLEAN NOT NULL DEFAULT true,
    "dealNotifications" BOOLEAN NOT NULL DEFAULT true,
    "userNotifications" BOOLEAN NOT NULL DEFAULT true,
    "activityNotifications" BOOLEAN NOT NULL DEFAULT true,
    "systemNotifications" BOOLEAN NOT NULL DEFAULT true,
    "quietHoursEnabled" BOOLEAN NOT NULL DEFAULT false,
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserNotificationPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceNotificationSettings" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "allowEmailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "allowPushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "requireNotificationApproval" BOOLEAN NOT NULL DEFAULT false,
    "defaultEmailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "defaultPushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "emailTemplate" TEXT,
    "notificationBranding" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceNotificationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserNotificationPreferences_userId_key" ON "UserNotificationPreferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceNotificationSettings_workspaceId_key" ON "WorkspaceNotificationSettings"("workspaceId");

-- CreateIndex
CREATE INDEX "Notification_userId_status_idx" ON "Notification"("userId", "status");

-- CreateIndex
CREATE INDEX "Notification_workspaceId_createdAt_idx" ON "Notification"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_type_category_idx" ON "Notification"("type", "category");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_triggeredById_fkey" FOREIGN KEY ("triggeredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotificationPreferences" ADD CONSTRAINT "UserNotificationPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceNotificationSettings" ADD CONSTRAINT "WorkspaceNotificationSettings_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
