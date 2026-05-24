import type { Listing, UserRole } from "@prisma/client";
import { UTApi } from "uploadthing/server";
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

const allowedListingImageHosts = new Set(["images.unsplash.com", "utfs.io"]);

const checkboxBoolean = z.preprocess((value) => {
  if (value === true || value === "on" || value === "true" || value === "1") {
    return true;
  }

  return false;
}, z.boolean());

const uploadedPhotoSchema = z.object({
  url: z.string().trim(),
  key: z.string().trim().min(1, "Uploaded photo storage key is required").optional(),
  storageKey: z.string().trim().min(1, "Uploaded photo storage key is required").optional(),
  name: z.string().trim().optional(),
  size: z.coerce.number().int().positive().optional(),
}).superRefine((photo, context) => {
  if (!isAllowedListingImageUrl(photo.url)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["url"],
      message: "Uploaded photo URL must use an approved image host",
    });
  }

  if (!photo.key && !photo.storageKey) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["storageKey"],
      message: "Uploaded photos must include a storage key",
    });
  }
});

const uploadedPhotosField = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") {
    return [];
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  return value;
}, z.array(uploadedPhotoSchema).max(8, "Upload up to 8 listing photos"));

const listingFormBaseSchema = z.object({
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
    .optional()
    .default(""),
  uploadedPhotos: uploadedPhotosField.transform((photos) =>
    photos.map((photo) => ({
      url: photo.url,
      storageKey: photo.storageKey ?? photo.key ?? "",
      name: photo.name,
      size: photo.size,
    })),
  ),
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

const listingFormSchema = listingFormBaseSchema.superRefine((data, context) => {
  const uploadedCoverUrl = data.uploadedPhotos[0]?.url;
  const imageUrl = data.imageUrl.trim();

  if (!uploadedCoverUrl && imageUrl.length === 0) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["imageUrl"],
      message: "Add at least one listing photo",
    });
    return;
  }

  if (imageUrl.length > 0) {
    if (!isAllowedListingImageUrl(imageUrl)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["imageUrl"],
        message: "Image URL must use an approved image host",
      });
    }
  }
}).transform((data) => ({
  ...data,
  imageUrl: data.uploadedPhotos[0]?.url ?? data.imageUrl.trim(),
  uploadedPhotos:
    data.uploadedPhotos.length > 0
      ? data.uploadedPhotos
      : [
          {
            url: data.imageUrl.trim(),
            storageKey: undefined,
            name: undefined,
            size: undefined,
          },
        ],
}));

export type ListingFormData = z.output<typeof listingFormSchema>;

export function isAllowedListingImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && allowedListingImageHosts.has(url.hostname);
  } catch {
    return false;
  }
}

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

export function buildListingPhotoCreateData(data: Pick<ListingFormData, "title" | "imageUrl" | "uploadedPhotos">) {
  const photos =
    data.uploadedPhotos.length > 0
      ? data.uploadedPhotos
      : [
          {
            url: data.imageUrl,
            storageKey: undefined,
            name: undefined,
            size: undefined,
          },
        ];

  return photos.map((photo, index) => ({
    url: photo.url,
    storageKey: photo.storageKey || undefined,
    fileName: photo.name || undefined,
    fileSize: photo.size || undefined,
    alt: `${data.title} photo ${index + 1}`,
    sortOrder: index,
  }));
}

export function getRemovedListingPhotoStorageKeys(
  existingPhotos: Array<{ storageKey: string | null }>,
  nextPhotos: Array<{ storageKey?: string | null }>,
) {
  const nextKeys = new Set(nextPhotos.map((photo) => photo.storageKey).filter(Boolean));

  return existingPhotos
    .map((photo) => photo.storageKey)
    .filter((storageKey): storageKey is string => Boolean(storageKey) && !nextKeys.has(storageKey));
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
    include: { owner: true, reports: true, savedBy: true, photos: { orderBy: { sortOrder: "asc" } } },
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
      photos: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function createListing(ownerId: string, input: unknown) {
  const normalised = normaliseListingFormInput(input);

  if (!normalised.ok) {
    return normalised;
  }

  const ownership = await validateUploadedPhotoOwnership(ownerId, normalised.data);
  if (!ownership.ok) {
    return ownership;
  }

  const listing = await prisma.$transaction(async (tx) => {
    const createdListing = await tx.listing.create({
      data: {
        ...buildListingCreateData(normalised.data, ownerId),
        photos: {
          create: buildListingPhotoCreateData(normalised.data),
        },
      },
    });

    await attachUploadedPhotos(tx, ownerId, createdListing.id, normalised.data);

    return createdListing;
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
      photos: { orderBy: { sortOrder: "asc" } },
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

  const ownership = await validateUploadedPhotoOwnership(actor.id, normalised.data);
  if (!ownership.ok) {
    return ownership;
  }

  const existingPhotos = await prisma.listingPhoto.findMany({
    where: { listingId },
    select: { storageKey: true },
  });
  const removedStorageKeys = getRemovedListingPhotoStorageKeys(existingPhotos, normalised.data.uploadedPhotos);

  const updatedListing = await prisma.$transaction(async (tx) => {
    const savedListing = await tx.listing.update({
      where: { id: listingId },
      data: {
        ...buildListingUpdateData(normalised.data),
        photos: {
          deleteMany: {},
          create: buildListingPhotoCreateData(normalised.data),
        },
      },
    });

    await attachUploadedPhotos(tx, actor.id, listingId, normalised.data);

    return savedListing;
  });

  await deleteUploadThingFiles(removedStorageKeys);

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

function getUploadedPhotoStorageKeys(data: ListingFormData) {
  return data.uploadedPhotos.map((photo) => photo.storageKey).filter((key): key is string => Boolean(key));
}

async function validateUploadedPhotoOwnership(ownerId: string, data: ListingFormData) {
  const storageKeys = getUploadedPhotoStorageKeys(data);

  if (storageKeys.length === 0) {
    return { ok: true as const };
  }

  const ownedUploads = await prisma.listingPhotoUpload.findMany({
    where: {
      ownerId,
      storageKey: { in: storageKeys },
    },
    select: { storageKey: true },
  });
  const ownedKeys = new Set(ownedUploads.map((upload) => upload.storageKey));
  const hasUnownedKey = storageKeys.some((storageKey) => !ownedKeys.has(storageKey));

  if (hasUnownedKey) {
    return {
      ok: false as const,
      errors: {
        uploadedPhotos: "Upload photos through LeaseMate before saving",
      },
    };
  }

  return { ok: true as const };
}

async function attachUploadedPhotos(
  tx: Pick<typeof prisma, "listingPhotoUpload">,
  ownerId: string,
  listingId: string,
  data: ListingFormData,
) {
  const storageKeys = getUploadedPhotoStorageKeys(data);

  if (storageKeys.length === 0) {
    return;
  }

  await tx.listingPhotoUpload.updateMany({
    where: {
      ownerId,
      storageKey: { in: storageKeys },
    },
    data: {
      listingId,
      attachedAt: new Date(),
    },
  });
}

async function deleteUploadThingFiles(storageKeys: string[]) {
  if (storageKeys.length === 0 || !process.env.UPLOADTHING_TOKEN) {
    return;
  }

  try {
    await new UTApi().deleteFiles(storageKeys);
  } catch (error) {
    console.error("Failed to delete removed listing photos from UploadThing", error);
  }
}
