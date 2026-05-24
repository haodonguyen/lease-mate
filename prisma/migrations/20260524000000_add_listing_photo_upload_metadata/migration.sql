ALTER TABLE "ListingPhoto" ADD COLUMN "storageKey" TEXT;
ALTER TABLE "ListingPhoto" ADD COLUMN "fileName" TEXT;
ALTER TABLE "ListingPhoto" ADD COLUMN "fileSize" INTEGER;
ALTER TABLE "ListingPhoto" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "ListingPhoto_listingId_sortOrder_idx" ON "ListingPhoto"("listingId", "sortOrder");
