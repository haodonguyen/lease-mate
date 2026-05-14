import { z } from "zod";
import { prisma } from "./db";
import { trackEvent } from "./analytics-service";

const reportSchema = z.object({
  listingSlug: z.string().min(1),
  reason: z.string().trim().min(4),
  details: z.string().trim().optional(),
});

export async function saveListing(userId: string, listingSlug: string) {
  const listing = await prisma.listing.findUnique({ where: { slug: listingSlug } });
  if (!listing) return { ok: false as const, error: "Listing not found" };

  await prisma.savedListing.upsert({
    where: { userId_listingId: { userId, listingId: listing.id } },
    update: {},
    create: { userId, listingId: listing.id },
  });
  await trackEvent({ name: "listing_saved", userId, listingId: listing.id });

  return { ok: true as const };
}

export async function reportListing(userId: string | undefined, input: unknown) {
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Report details are invalid" };

  const listing = await prisma.listing.findUnique({ where: { slug: parsed.data.listingSlug } });
  if (!listing) return { ok: false as const, error: "Listing not found" };

  const report = await prisma.report.create({
    data: {
      listingId: listing.id,
      userId,
      reason: parsed.data.reason,
      details: parsed.data.details,
    },
  });
  await trackEvent({ name: "listing_reported", userId, listingId: listing.id });

  return { ok: true as const, report };
}

export async function listSavedListings(userId: string) {
  return prisma.savedListing.findMany({
    where: { userId },
    include: { listing: { include: { owner: true, savedBy: true, reports: true } } },
    orderBy: { createdAt: "desc" },
  });
}
