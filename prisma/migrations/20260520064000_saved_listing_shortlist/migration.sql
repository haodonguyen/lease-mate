CREATE TYPE "SavedListingShortlistStatus" AS ENUM ('INTERESTED', 'INSPECTING', 'APPLIED', 'REJECTED');

ALTER TABLE "SavedListing"
ADD COLUMN "shortlistStatus" "SavedListingShortlistStatus" NOT NULL DEFAULT 'INTERESTED',
ADD COLUMN "notes" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "SavedListing_userId_shortlistStatus_idx" ON "SavedListing"("userId", "shortlistStatus");
