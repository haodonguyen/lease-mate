import { z } from "zod";
import { normaliseSavedListingUpdateInput } from "@/lib/saved-listings";
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

  const savedListing = await prisma.savedListing.upsert({
    where: { userId_listingId: { userId, listingId: listing.id } },
    update: {},
    create: { userId, listingId: listing.id },
  });
  await trackEvent({ name: "listing_saved", userId, listingId: listing.id });

  return { ok: true as const, savedListing };
}

export async function updateSavedListing(userId: string, savedListingId: string, input: unknown) {
  const parsed = normaliseSavedListingUpdateInput(input);
  if (!parsed.ok) return parsed;

  const existing = await prisma.savedListing.findFirst({
    where: { id: savedListingId, userId },
  });
  if (!existing) return { ok: false as const, error: "Saved listing not found" };

  const savedListing = await prisma.savedListing.update({
    where: { id: savedListingId },
    data: parsed.data,
  });

  return { ok: true as const, savedListing };
}

export async function removeSavedListing(userId: string, savedListingId: string) {
  const existing = await prisma.savedListing.findFirst({
    where: { id: savedListingId, userId },
  });
  if (!existing) return { ok: false as const, error: "Saved listing not found" };

  await prisma.savedListing.delete({ where: { id: savedListingId } });
  await trackEvent({ name: "listing_unsaved", userId, listingId: existing.listingId });

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
