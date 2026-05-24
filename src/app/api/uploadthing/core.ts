import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { canManageListings, getCurrentAuthenticatedUser } from "@/lib/server/auth";

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
    .onUploadComplete(async ({ file, metadata }) => ({
      uploadedBy: metadata.userId,
      url: file.ufsUrl,
      key: file.key,
      name: file.name,
      size: file.size,
    })),
} satisfies FileRouter;

export type LeaseMateFileRouter = typeof leaseMateFileRouter;
