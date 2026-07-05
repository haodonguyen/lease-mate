import { z } from "zod";
import { createEnquiry as validateEnquiry, type CreateEnquiryInput } from "../enquiries";
import { prisma } from "./db";
import { queueNotification } from "./notification-service";
import { trackEvent } from "./analytics-service";
import {
  sendEnquiryConfirmationEmail,
  sendEnquiryNotificationEmail,
  sendEnquiryReplyEmail,
} from "./email-service";

const replySchema = z.object({
  replyText: z.string().trim().min(2, "Reply must be at least 2 characters").max(2000, "Reply is too long"),
});

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
    sendEnquiryNotificationEmail({
      ownerEmail: listing.owner.email,
      ownerName: listing.owner.name,
      enquirerName: validation.enquiry.name,
      enquirerEmail: validation.enquiry.email,
      message: validation.enquiry.message,
      listingTitle: listing.title,
      listingSlug: listing.slug,
    }),
    sendEnquiryConfirmationEmail({
      enquirerName: validation.enquiry.name,
      enquirerEmail: validation.enquiry.email,
      message: validation.enquiry.message,
      listingTitle: listing.title,
      listingSlug: listing.slug,
    }),
    trackEvent({
      name: "enquiry_created",
      listingId: listing.id,
      metadata: { suburb: listing.suburb },
    }),
  ]);

  return { ok: true as const, enquiry };
}

export async function listEnquiriesForEmail(email: string) {
  return prisma.enquiry.findMany({
    where: { email: { equals: email.trim(), mode: "insensitive" } },
    orderBy: { createdAt: "desc" },
    include: {
      listing: {
        select: {
          title: true,
          slug: true,
          suburb: true,
          state: true,
          imageUrl: true,
          status: true,
        },
      },
    },
  });
}

export async function replyToEnquiry(
  enquiryId: string,
  actor: { id: string },
  input: unknown,
) {
  const parsed = replySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      errors: { replyText: parsed.error.issues[0]?.message ?? "Invalid reply" },
    };
  }

  const enquiry = await prisma.enquiry.findUnique({
    where: { id: enquiryId },
    include: { listing: true },
  });

  if (!enquiry) {
    return { ok: false as const, errors: { enquiry: "Enquiry could not be found" } };
  }

  if (enquiry.listing.ownerId !== actor.id) {
    return { ok: false as const, errors: { enquiry: "You cannot reply to this enquiry" } };
  }

  const updated = await prisma.enquiry.update({
    where: { id: enquiryId },
    data: {
      replyText: parsed.data.replyText,
      repliedAt: new Date(),
      status: "RESPONDED",
    },
  });

  await Promise.all([
    sendEnquiryReplyEmail({
      enquirerName: enquiry.name,
      enquirerEmail: enquiry.email,
      listingTitle: enquiry.listing.title,
      listingSlug: enquiry.listing.slug,
      replyText: parsed.data.replyText,
    }),
    trackEvent({
      name: "enquiry_replied",
      listingId: enquiry.listingId,
    }),
  ]);

  return { ok: true as const, enquiry: updated };
}
