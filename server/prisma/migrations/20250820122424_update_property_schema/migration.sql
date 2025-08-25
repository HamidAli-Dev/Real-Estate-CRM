/*
  Warnings:

  - The values [Residential] on the enum `Category` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `propertyId` on the `File` table. All the data in the column will be lost.
  - Added the required column `propertyType` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('House', 'Apartment', 'Land', 'Commercial', 'Villa', 'Townhouse', 'Office', 'Shop', 'Warehouse');

-- AlterEnum
BEGIN;
CREATE TYPE "Category_new" AS ENUM ('House', 'Apartment', 'Land', 'Commercial', 'Villa', 'Townhouse');
ALTER TABLE "PropertyCategory" ALTER COLUMN "category" TYPE "Category_new" USING ("category"::text::"Category_new");
ALTER TYPE "Category" RENAME TO "Category_old";
ALTER TYPE "Category_new" RENAME TO "Category";
DROP TYPE "Category_old";
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PropertyStatus" ADD VALUE 'Pending';
ALTER TYPE "PropertyStatus" ADD VALUE 'Rented';

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_propertyId_fkey";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "propertyId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "address" TEXT,
ADD COLUMN     "bathrooms" INTEGER,
ADD COLUMN     "bedrooms" INTEGER,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "propertyType" "PropertyType" NOT NULL,
ADD COLUMN     "size" DOUBLE PRECISION,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "PropertyImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "propertyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PropertyImage" ADD CONSTRAINT "PropertyImage_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
