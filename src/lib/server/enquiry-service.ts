import { createEnquiry as validateEnquiry, type CreateEnquiryInput } from "../enquiries";
import { prisma } from "./db";
import { queueNotification } from "./notification-service";
import { trackEvent } from "./analytics-service";

export async function createEnquiryForListing(input: CreateEnquiryInput) {
  const validation = validateEnquiry(input);
  if (!validation.ok) {
    return validation;
  }

  const listing = await prisma.listing.findUnique({
    where: { slug: validation.enquiry.listingSlug },
    include: { owner: true },
  });

  if (!listing) {
    return { ok: false as const, errors: { listingSlug: "Listing could not be found" } };
  }

  const enquiry = await prisma.enquiry.create({
    data: {
      listingId: listing.id,
      name: validation.enquiry.name,
      email: validation.enquiry.email,
      message: validation.enquiry.message,
    },
  });

  await Promise.all([
    queueNotification({
      type: "enquiry_created",
      recipient: listing.owner.email,
      subject: `New enquiry for ${listing.title}`,
      body: validation.enquiry.message,
      userId: listing.owner.id,
    }),
    trackEvent({
      name: "enquiry_created",
      listingId: listing.id,
      metadata: { suburb: listing.suburb },
    }),
  ]);

  return { ok: true as const, enquiry };
}
