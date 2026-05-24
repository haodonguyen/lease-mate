CREATE TABLE "ListingPhotoUpload" (
    "id" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "ownerId" TEXT NOT NULL,
    "listingId" TEXT,
    "attachedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingPhotoUpload_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ListingPhotoUpload_storageKey_key" ON "ListingPhotoUpload"("storageKey");
CREATE INDEX "ListingPhotoUpload_ownerId_idx" ON "ListingPhotoUpload"("ownerId");
CREATE INDEX "ListingPhotoUpload_listingId_idx" ON "ListingPhotoUpload"("listingId");

ALTER TABLE "ListingPhotoUpload" ADD CONSTRAINT "ListingPhotoUpload_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ListingPhotoUpload" ADD CONSTRAINT "ListingPhotoUpload_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
