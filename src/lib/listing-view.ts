import type { Listing, ListingPhoto, Report, SavedListing, User } from "@prisma/client";
import type { AustralianState, LeaseListing } from "./listings";
import { parseHighlights, toDomainConsentStatus, toDomainHousingType, toDomainListingType } from "./mappers";

export type ListingWithOwner = Listing & {
  owner: Pick<User, "name" | "role">;
  reports?: Report[];
  savedBy?: SavedListing[];
  photos?: ListingPhoto[];
};

export function listingRecordToLeaseListing(listing: ListingWithOwner): LeaseListing {
  return {
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    suburb: listing.suburb,
    state: normaliseAustralianState(listing.state),
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
    photos: normaliseListingPhotos(listing),
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

function normaliseListingPhotos(listing: Pick<ListingWithOwner, "imageUrl" | "title" | "photos">) {
  if (listing.photos && listing.photos.length > 0) {
    return listing.photos
      .slice()
      .sort((first, second) => first.sortOrder - second.sortOrder)
      .map((photo) => ({
        url: photo.url,
        alt: photo.alt,
        sortOrder: photo.sortOrder,
      }));
  }

  return [
    {
      url: listing.imageUrl,
      alt: listing.title,
      sortOrder: 0,
    },
  ];
}

function normaliseAustralianState(state: string): AustralianState {
  const supportedStates = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"] as const;
  return supportedStates.find((candidate) => candidate === state) ?? "NSW";
}

function formatIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}
