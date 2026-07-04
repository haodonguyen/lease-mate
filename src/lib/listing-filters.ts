import { getListingReadiness, type LeaseListing } from "./listings";
import type { ListingType } from "./lease-rules";

export interface ListingFilterState {
  query?: string;
  listingType?: "all" | ListingType;
  readiness?: "all" | "Ready to transfer" | "Consent pending" | "Needs caution";
  genderPreference?: "all" | "female" | "male";
  furnished?: "all" | "furnished" | "unfurnished";
  billsIncluded?: "all" | "included";
  minRent?: string;
  maxRent?: string;
  minBedrooms?: string;
  availableBy?: string;
}

export function filterLeaseListings(listings: LeaseListing[], filters: ListingFilterState) {
  const query = filters.query?.toLowerCase().trim() ?? "";
  const minRent = toOptionalNumber(filters.minRent);
  const maxRent = toOptionalNumber(filters.maxRent);
  const minBedrooms = toOptionalNumber(filters.minBedrooms);
  const availableBy = parseIsoDate(filters.availableBy);

  return listings.filter((listing) => {
    const listingReadiness = getListingReadiness(listing);
    const searchText = `${listing.title} ${listing.suburb} ${listing.state} ${listing.postcode}`.toLowerCase();
    const availableFrom = parseIsoDate(listing.availableFrom);

    return (
      (query === "" || searchText.includes(query)) &&
      (!filters.listingType || filters.listingType === "all" || listing.listingType === filters.listingType) &&
      (!filters.readiness || filters.readiness === "all" || listingReadiness.visibilityLabel === filters.readiness) &&
      (!filters.genderPreference ||
        filters.genderPreference === "all" ||
        listing.genderPreference === filters.genderPreference) &&
      (!filters.furnished ||
        filters.furnished === "all" ||
        (filters.furnished === "furnished" ? listing.furnished === true : listing.furnished === false)) &&
      (!filters.billsIncluded || filters.billsIncluded === "all" || listing.billsIncluded === true) &&
      (minRent === undefined || listing.rentPerWeek >= minRent) &&
      (maxRent === undefined || listing.rentPerWeek <= maxRent) &&
      (minBedrooms === undefined || listing.bedrooms >= minBedrooms) &&
      (!availableBy || !availableFrom || availableFrom <= availableBy)
    );
  });
}

export function hasActiveListingFilters(filters: ListingFilterState) {
  return Boolean(
    filters.query?.trim() ||
      (filters.listingType && filters.listingType !== "all") ||
      (filters.readiness && filters.readiness !== "all") ||
      (filters.genderPreference && filters.genderPreference !== "all") ||
      (filters.furnished && filters.furnished !== "all") ||
      (filters.billsIncluded && filters.billsIncluded !== "all") ||
      toOptionalNumber(filters.minRent) !== undefined ||
      toOptionalNumber(filters.maxRent) !== undefined ||
      toOptionalNumber(filters.minBedrooms) !== undefined ||
      parseIsoDate(filters.availableBy) !== undefined,
  );
}

function toOptionalNumber(value: string | undefined) {
  if (!value?.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseIsoDate(value: string | undefined) {
  if (!value?.trim()) {
    return undefined;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}
