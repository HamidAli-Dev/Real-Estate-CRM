-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "features" TEXT[],
ADD COLUMN     "parkingSpaces" INTEGER,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "yearBuilt" INTEGER,
ADD COLUMN     "zipCode" TEXT;
