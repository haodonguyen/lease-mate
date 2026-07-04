-- CreateEnum
CREATE TYPE "GenderPreference" AS ENUM ('ANY', 'FEMALE', 'MALE');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "genderPreference" "GenderPreference" NOT NULL DEFAULT 'ANY',
ADD COLUMN     "buildingName" TEXT,
ADD COLUMN     "furnished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "billsIncluded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "datesFlexible" BOOLEAN NOT NULL DEFAULT false;
