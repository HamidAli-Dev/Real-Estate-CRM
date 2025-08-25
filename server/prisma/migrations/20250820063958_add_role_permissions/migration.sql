-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('VIEW_PROPERTIES', 'CREATE_PROPERTIES', 'EDIT_PROPERTIES', 'DELETE_PROPERTIES', 'VIEW_LEADS', 'CREATE_LEADS', 'EDIT_LEADS', 'DELETE_LEADS', 'VIEW_DEALS', 'CREATE_DEALS', 'EDIT_DEALS', 'DELETE_DEALS', 'VIEW_USERS', 'INVITE_USERS', 'EDIT_USER_ROLES', 'REMOVE_USERS', 'VIEW_SETTINGS', 'EDIT_SETTINGS', 'VIEW_ANALYTICS', 'EXPORT_REPORTS');

-- AlterTable
ALTER TABLE "Workspace" ALTER COLUMN "domain" DROP NOT NULL,
ALTER COLUMN "subscriptionPlan" DROP NOT NULL;

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "userWorkspaceId" TEXT NOT NULL,
    "permission" "Permission" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_userWorkspaceId_permission_key" ON "RolePermission"("userWorkspaceId", "permission");

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_userWorkspaceId_fkey" FOREIGN KEY ("userWorkspaceId") REFERENCES "UserWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
