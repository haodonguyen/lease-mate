import type { Listing, UserRole } from "@prisma/client";
import { z } from "zod";
import {
  listingToChecklist,
  parseHighlights,
  toDomainConsentStatus,
  toDomainListingType,
  toPrismaConsentStatus,
  toPrismaHousingType,
  toPrismaListingType,
} from "../mappers";
import { assessListingReadiness, validateListingBasics } from "../lease-rules";
import { slugify } from "../slug";
import { prisma } from "./db";

const checkboxBoolean = z.preprocess((value) => {
  if (value === true || value === "on" || value === "true" || value === "1") {
    return true;
  }

  return false;
}, z.boolean());

const listingFormSchema = z.object({
  title: z.string().trim().min(8, "Title must be at least 8 characters"),
  suburb: z.string().trim().min(2, "Suburb is required"),
  state: z.enum(["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"]),
  postcode: z.string().trim().regex(/^\d{4}$/, "Postcode must be 4 digits"),
  listingType: z.enum(["lease_transfer", "temporary_sublet", "room_replacement"]),
  consentStatus: z.enum(["approved", "pending", "not_started"]),
  housingType: z.enum(["private_rental", "student_accommodation", "share_house"]),
  rentPerWeek: z.coerce.number().int().positive("Weekly rent must be greater than $0"),
  bondAmount: z.coerce.number().int().min(0, "Bond cannot be negative"),
  bedrooms: z.coerce.number().int().min(1),
  bathrooms: z.coerce.number().int().min(1),
  availableFrom: z.string().trim(),
  availableUntil: z.string().trim().optional(),
  leaseEnds: z.string().trim(),
  description: z.string().trim().min(20, "Description must be at least 20 characters"),
  imageUrl: z
    .string()
    .trim()
    .url("Image URL must be valid")
    .refine((value) => value.startsWith("http://") || value.startsWith("https://"), {
      message: "Image URL must use http or https",
    }),
  highlights: z.union([z.string(), z.array(z.string())]).transform((value) => {
    const items = Array.isArray(value) ? value : value.split(/\r?\n/);
    return items.map((item) => item.trim()).filter(Boolean).slice(0, 6);
  }),
  hasWrittenConsent: checkboxBoolean,
  bondTransferDiscussed: checkboxBoolean,
  agentOrLandlordAware: checkboxBoolean,
  newRenterAddedToLease: checkboxBoolean,
  understandsSubletRisk: checkboxBoolean,
});

export type ListingFormData = z.output<typeof listingFormSchema>;

export function normaliseListingFormInput(input: unknown) {
  const parsed = listingFormSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false as const,
      errors: parsed.error.issues.reduce<Record<string, string>>((errors, issue) => {
        const field = issue.path[0];
        if (typeof field === "string" && !errors[field]) {
          errors[field] = issue.message;
        }
        return errors;
      }, {}),
    };
  }

  const dateErrors = validateListingBasics({
    rentPerWeek: parsed.data.rentPerWeek,
    bondAmount: parsed.data.bondAmount,
    availableFrom: parsed.data.availableFrom,
    availableUntil: parsed.data.availableUntil || undefined,
  });

  if (dateErrors.length > 0) {
    return {
      ok: false as const,
      errors: {
        availableFrom: dateErrors.join(", "),
      },
    };
  }

  if (!isIsoDate(parsed.data.leaseEnds)) {
    return {
      ok: false as const,
      errors: {
        leaseEnds: "Lease end date must use YYYY-MM-DD format",
      },
    };
  }

  if (!leaseEndCoversAvailability(parsed.data)) {
    return {
      ok: false as const,
      errors: {
        leaseEnds: "Lease end date must be on or after the available dates",
      },
    };
  }

  return { ok: true as const, data: parsed.data };
}

export function buildListingCreateData(data: ListingFormData, ownerId: string) {
  const slug = `${slugify(data.title)}-${crypto.randomUUID().slice(0, 8)}`;

  return {
    slug,
    ...buildListingUpdateData(data),
    ownerId,
  };
}

export function buildListingUpdateData(data: ListingFormData) {
  return {
    title: data.title,
    suburb: data.suburb,
    state: data.state,
    postcode: data.postcode,
    listingType: toPrismaListingType(data.listingType),
    consentStatus: toPrismaConsentStatus(data.consentStatus),
    housingType: toPrismaHousingType(data.housingType),
    rentPerWeek: data.rentPerWeek,
    bondAmount: data.bondAmount,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    availableFrom: new Date(`${data.availableFrom}T00:00:00.000Z`),
    availableUntil: data.availableUntil ? new Date(`${data.availableUntil}T00:00:00.000Z`) : null,
    leaseEnds: new Date(`${data.leaseEnds}T00:00:00.000Z`),
    imageUrl: data.imageUrl,
    description: data.description,
    highlights: JSON.stringify(data.highlights),
    hasWrittenConsent: data.hasWrittenConsent,
    bondTransferDiscussed: data.bondTransferDiscussed,
    agentOrLandlordAware: data.agentOrLandlordAware,
    newRenterAddedToLease: data.newRenterAddedToLease,
    understandsSubletRisk: data.understandsSubletRisk,
  };
}

export function getListingReadinessFromRecord(
  listing: Pick<
    Listing,
    | "listingType"
    | "consentStatus"
    | "housingType"
    | "hasWrittenConsent"
    | "bondTransferDiscussed"
    | "agentOrLandlordAware"
    | "newRenterAddedToLease"
    | "understandsSubletRisk"
  >,
) {
  return assessListingReadiness({
    listingType: toDomainListingType(listing.listingType),
    consentStatus: toDomainConsentStatus(listing.consentStatus),
    checklist: listingToChecklist(listing as Listing),
  });
}

export async function listPublishedListings() {
  return prisma.listing.findMany({
    where: { status: "PUBLISHED" },
    include: { owner: true, reports: true, savedBy: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getListingBySlugFromDb(slug: string) {
  return prisma.listing.findUnique({
    where: { slug },
    include: {
      owner: true,
      reports: true,
      enquiries: { orderBy: { createdAt: "desc" } },
      savedBy: true,
    },
  });
}

export async function createListing(ownerId: string, input: unknown) {
  const normalised = normaliseListingFormInput(input);

  if (!normalised.ok) {
    return normalised;
  }

  const listing = await prisma.listing.create({
    data: {
      ...buildListingCreateData(normalised.data, ownerId),
      photos: {
        create: [
          {
            url: normalised.data.imageUrl,
            alt: normalised.data.title,
          },
        ],
      },
    },
  });

  return { ok: true as const, listing };
}

export async function listOwnerListings(ownerId: string) {
  return prisma.listing.findMany({
    where: { ownerId },
    include: {
      enquiries: { orderBy: { createdAt: "desc" } },
      reports: true,
      savedBy: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export function canUpdateListingStatus(actor: { id: string; role: UserRole }, listingOwnerId: string) {
  return actor.role === "ADMIN" || (actor.role === "OWNER" && actor.id === listingOwnerId);
}

export function canEditListing(actor: { id: string; role: UserRole }, listingOwnerId: string) {
  return actor.role === "ADMIN" || (actor.role === "OWNER" && actor.id === listingOwnerId);
}

export async function updateListingDetails(listingId: string, actor: { id: string; role: UserRole }, input: unknown) {
  const normalised = normaliseListingFormInput(input);

  if (!normalised.ok) {
    return normalised;
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
  });

  if (!listing) {
    throw new Error("Listing not found");
  }

  if (!canEditListing(actor, listing.ownerId)) {
    throw new Error("Listing access denied");
  }

  const updatedListing = await prisma.listing.update({
    where: { id: listingId },
    data: {
      ...buildListingUpdateData(normalised.data),
      photos: {
        deleteMany: {},
        create: [
          {
            url: normalised.data.imageUrl,
            alt: normalised.data.title,
          },
        ],
      },
    },
  });

  return { ok: true as const, listing: updatedListing };
}

export async function updateListingStatus(
  listingId: string,
  actor: { id: string; role: UserRole },
  status: "PUBLISHED" | "PAUSED",
) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
  });

  if (!listing) {
    throw new Error("Listing not found");
  }

  if (!canUpdateListingStatus(actor, listing.ownerId)) {
    throw new Error("Listing access denied");
  }

  return prisma.listing.update({
    where: { id: listingId },
    data: { status },
  });
}

export function listingHighlights(listing: Pick<Listing, "highlights">) {
  return parseHighlights(listing.highlights);
}

function isIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function leaseEndCoversAvailability(data: Pick<ListingFormData, "availableFrom" | "availableUntil" | "leaseEnds">) {
  const leaseEnds = new Date(`${data.leaseEnds}T00:00:00.000Z`);
  const availableFrom = new Date(`${data.availableFrom}T00:00:00.000Z`);
  const availableUntil = data.availableUntil ? new Date(`${data.availableUntil}T00:00:00.000Z`) : undefined;

  return availableFrom <= leaseEnds && (!availableUntil || availableUntil <= leaseEnds);
}
