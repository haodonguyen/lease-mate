import { prisma } from "./db";

export async function trackEvent(input: {
  name: string;
  userId?: string;
  listingId?: string;
  metadata?: Record<string, unknown>;
}) {
  return prisma.analyticsEvent.create({
    data: {
      name: input.name,
      userId: input.userId,
      listingId: input.listingId,
      metadata: input.metadata ? JSON.stringify(input.metadata) : undefined,
    },
  });
}

export async function getAnalyticsSummary() {
  const [views, enquiries, saves, reports, waitlist] = await Promise.all([
    prisma.analyticsEvent.count({ where: { name: "listing_view" } }),
    prisma.enquiry.count(),
    prisma.savedListing.count(),
    prisma.report.count(),
    prisma.waitlistSignup.count(),
  ]);

  return { views, enquiries, saves, reports, waitlist };
}
