import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { canManageListings, getCurrentAuthenticatedUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";

const uploadthing = createUploadthing();

export const leaseMateFileRouter = {
  listingPhotos: uploadthing({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 8,
    },
  })
    .middleware(async () => {
      const user = await getCurrentAuthenticatedUser();

      if (!user || !canManageListings(user.role)) {
        throw new UploadThingError("Owner access required");
      }

      return { userId: user.id };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      await prisma.listingPhotoUpload.upsert({
        where: { storageKey: file.key },
        update: {
          url: file.ufsUrl,
          fileName: file.name,
          fileSize: file.size,
          ownerId: metadata.userId,
        },
        create: {
          storageKey: file.key,
          url: file.ufsUrl,
          fileName: file.name,
          fileSize: file.size,
          ownerId: metadata.userId,
        },
      });

      return {
        uploadedBy: metadata.userId,
        url: file.ufsUrl,
        key: file.key,
        name: file.name,
        size: file.size,
      };
    }),
} satisfies FileRouter;

export type LeaseMateFileRouter = typeof leaseMateFileRouter;
