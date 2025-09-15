/*
  Warnings:

  - You are about to drop the column `createdAt` on the `RolePermission` table. All the data in the column will be lost.
  - You are about to drop the column `permission` on the `RolePermission` table. All the data in the column will be lost.
  - You are about to drop the column `userWorkspaceId` on the `RolePermission` table. All the data in the column will be lost.
  - You are about to drop the column `permissions` on the `UserInvitation` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `UserInvitation` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `UserWorkspace` table. All the data in the column will be lost.
  - You are about to drop the column `domain` on the `Workspace` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[roleId,permissionId]` on the table `RolePermission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `permissionId` to the `RolePermission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleId` to the `RolePermission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleId` to the `UserInvitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleId` to the `UserWorkspace` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RolePermission" DROP CONSTRAINT "RolePermission_userWorkspaceId_fkey";

-- DropIndex
DROP INDEX "RolePermission_userWorkspaceId_permission_key";

-- AlterTable
ALTER TABLE "RolePermission" DROP COLUMN "createdAt",
DROP COLUMN "permission",
DROP COLUMN "userWorkspaceId",
ADD COLUMN     "permissionId" TEXT NOT NULL,
ADD COLUMN     "roleId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mustUpdatePassword" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "UserInvitation" DROP COLUMN "permissions",
DROP COLUMN "role",
ADD COLUMN     "roleId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserWorkspace" DROP COLUMN "role",
ADD COLUMN     "roleId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Workspace" DROP COLUMN "domain";

-- DropEnum
DROP TYPE "Permission";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "group" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- AddForeignKey
ALTER TABLE "UserWorkspace" ADD CONSTRAINT "UserWorkspace_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInvitation" ADD CONSTRAINT "UserInvitation_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
