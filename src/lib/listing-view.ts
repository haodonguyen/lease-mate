import type { Listing, Report, SavedListing, User } from "@prisma/client";
import type { LeaseListing } from "./listings";
import { parseHighlights, toDomainConsentStatus, toDomainHousingType, toDomainListingType } from "./mappers";

export type ListingWithOwner = Listing & {
  owner: Pick<User, "name" | "role">;
  reports?: Report[];
  savedBy?: SavedListing[];
};

export function listingRecordToLeaseListing(listing: ListingWithOwner): LeaseListing {
  return {
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    suburb: listing.suburb,
    state: "VIC",
    postcode: listing.postcode,
    listingType: toDomainListingType(listing.listingType),
    consentStatus: toDomainConsentStatus(listing.consentStatus),
    housingType: toDomainHousingType(listing.housingType),
    rentPerWeek: listing.rentPerWeek,
    bondAmount: listing.bondAmount,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    availableFrom: formatIsoDate(listing.availableFrom),
    availableUntil: listing.availableUntil ? formatIsoDate(listing.availableUntil) : undefined,
    leaseEnds: formatIsoDate(listing.leaseEnds),
    imageUrl: listing.imageUrl,
    highlights: parseHighlights(listing.highlights),
    description: listing.description,
    checklist: {
      hasWrittenConsent: listing.hasWrittenConsent,
      bondTransferDiscussed: listing.bondTransferDiscussed,
      agentOrLandlordAware: listing.agentOrLandlordAware,
      newRenterAddedToLease: listing.newRenterAddedToLease,
      understandsSubletRisk: listing.understandsSubletRisk,
      housingType: toDomainHousingType(listing.housingType),
    },
    lister: {
      name: listing.owner.name,
      role: listing.owner.role === "OWNER" ? "Outgoing renter" : "LeaseMate member",
      responseTime: "Usually replies same day",
    },
  };
}

function formatIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}
