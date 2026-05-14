import type {
  ConsentStatus as PrismaConsentStatus,
  HousingType as PrismaHousingType,
  Listing,
  ListingType as PrismaListingType,
} from "@prisma/client";
import type { ConsentStatus, HousingType, ListingType, TransferChecklist } from "./lease-rules";

export function toDomainListingType(type: PrismaListingType): ListingType {
  const labels = {
    LEASE_TRANSFER: "lease_transfer",
    TEMPORARY_SUBLET: "temporary_sublet",
    ROOM_REPLACEMENT: "room_replacement",
  } satisfies Record<PrismaListingType, ListingType>;

  return labels[type];
}

export function toDomainConsentStatus(status: PrismaConsentStatus): ConsentStatus {
  const labels = {
    APPROVED: "approved",
    PENDING: "pending",
    NOT_STARTED: "not_started",
  } satisfies Record<PrismaConsentStatus, ConsentStatus>;

  return labels[status];
}

export function toDomainHousingType(type: PrismaHousingType): HousingType {
  const labels = {
    PRIVATE_RENTAL: "private_rental",
    STUDENT_ACCOMMODATION: "student_accommodation",
    SHARE_HOUSE: "share_house",
  } satisfies Record<PrismaHousingType, HousingType>;

  return labels[type];
}

export function toPrismaListingType(type: ListingType): PrismaListingType {
  return {
    lease_transfer: "LEASE_TRANSFER",
    temporary_sublet: "TEMPORARY_SUBLET",
    room_replacement: "ROOM_REPLACEMENT",
  }[type] as PrismaListingType;
}

export function toPrismaConsentStatus(status: ConsentStatus): PrismaConsentStatus {
  return {
    approved: "APPROVED",
    pending: "PENDING",
    not_started: "NOT_STARTED",
  }[status] as PrismaConsentStatus;
}

export function toPrismaHousingType(type: HousingType): PrismaHousingType {
  return {
    private_rental: "PRIVATE_RENTAL",
    student_accommodation: "STUDENT_ACCOMMODATION",
    share_house: "SHARE_HOUSE",
  }[type] as PrismaHousingType;
}

export function listingToChecklist(listing: Listing): TransferChecklist {
  return {
    hasWrittenConsent: listing.hasWrittenConsent,
    bondTransferDiscussed: listing.bondTransferDiscussed,
    agentOrLandlordAware: listing.agentOrLandlordAware,
    newRenterAddedToLease: listing.newRenterAddedToLease,
    understandsSubletRisk: listing.understandsSubletRisk,
    housingType: toDomainHousingType(listing.housingType),
  };
}

export function parseHighlights(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}
