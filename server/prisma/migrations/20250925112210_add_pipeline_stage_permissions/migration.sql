/*
  Warnings:

  - The values [SYSTEM] on the enum `NotificationCategory` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `emailDigest` on the `UserNotificationPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `emailDigestFrequency` on the `UserNotificationPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `inAppNotifications` on the `UserNotificationPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `pushForUrgent` on the `UserNotificationPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `pushNotifications` on the `UserNotificationPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `quietHoursEnabled` on the `UserNotificationPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `quietHoursEnd` on the `UserNotificationPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `quietHoursStart` on the `UserNotificationPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `systemNotifications` on the `UserNotificationPreferences` table. All the data in the column will be lost.
  - You are about to drop the column `allowEmailNotifications` on the `WorkspaceNotificationSettings` table. All the data in the column will be lost.
  - You are about to drop the column `allowPushNotifications` on the `WorkspaceNotificationSettings` table. All the data in the column will be lost.
  - You are about to drop the column `defaultEmailNotifications` on the `WorkspaceNotificationSettings` table. All the data in the column will be lost.
  - You are about to drop the column `defaultPushNotifications` on the `WorkspaceNotificationSettings` table. All the data in the column will be lost.
  - You are about to drop the column `emailTemplate` on the `WorkspaceNotificationSettings` table. All the data in the column will be lost.
  - You are about to drop the column `notificationBranding` on the `WorkspaceNotificationSettings` table. All the data in the column will be lost.
  - You are about to drop the column `requireNotificationApproval` on the `WorkspaceNotificationSettings` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationCategory_new" AS ENUM ('LEADS', 'PROPERTIES', 'DEALS', 'USERS', 'ACTIVITIES', 'WORKSPACE');
ALTER TABLE "Notification" ALTER COLUMN "category" TYPE "NotificationCategory_new" USING ("category"::text::"NotificationCategory_new");
ALTER TYPE "NotificationCategory" RENAME TO "NotificationCategory_old";
ALTER TYPE "NotificationCategory_new" RENAME TO "NotificationCategory";
DROP TYPE "NotificationCategory_old";
COMMIT;

-- AlterTable
ALTER TABLE "UserNotificationPreferences" DROP COLUMN "emailDigest",
DROP COLUMN "emailDigestFrequency",
DROP COLUMN "inAppNotifications",
DROP COLUMN "pushForUrgent",
DROP COLUMN "pushNotifications",
DROP COLUMN "quietHoursEnabled",
DROP COLUMN "quietHoursEnd",
DROP COLUMN "quietHoursStart",
DROP COLUMN "systemNotifications";

-- AlterTable
ALTER TABLE "WorkspaceNotificationSettings" DROP COLUMN "allowEmailNotifications",
DROP COLUMN "allowPushNotifications",
DROP COLUMN "defaultEmailNotifications",
DROP COLUMN "defaultPushNotifications",
DROP COLUMN "emailTemplate",
DROP COLUMN "notificationBranding",
DROP COLUMN "requireNotificationApproval";
