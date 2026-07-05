import { describe, expect, it } from "vitest";
import { filterLeaseListings, hasActiveListingFilters } from "../src/lib/listing-filters";
import type { LeaseListing } from "../src/lib/listings";

const baseListing: LeaseListing = {
  id: "one",
  slug: "brunswick-lease-transfer",
  title: "Light-filled apartment near Lygon Street",
  suburb: "Brunswick East",
  state: "VIC",
  postcode: "3057",
  listingType: "lease_transfer",
  consentStatus: "approved",
  housingType: "private_rental",
  genderPreference: "female",
  furnished: true,
  billsIncluded: true,
  amenities: ["gym", "pool"],
  rentPerWeek: 520,
  bondAmount: 2080,
  bedrooms: 2,
  bathrooms: 1,
  availableFrom: "2026-06-10",
  leaseEnds: "2027-02-28",
  imageUrl: "https://images.unsplash.com/photo.jpg",
  highlights: ["Written consent received"],
  description: "A test listing",
  checklist: {
    hasWrittenConsent: true,
    bondTransferDiscussed: true,
    agentOrLandlordAware: true,
    newRenterAddedToLease: true,
    understandsSubletRisk: true,
    housingType: "private_rental",
  },
  lister: {
    name: "Mia",
    role: "Outgoing renter",
    responseTime: "Usually replies within 2 hours",
  },
};

const listings: LeaseListing[] = [
  baseListing,
  {
    ...baseListing,
    id: "two",
    slug: "box-hill-room",
    title: "Private room close to station",
    suburb: "Box Hill",
    postcode: "3128",
    listingType: "room_replacement",
    consentStatus: "pending",
    genderPreference: "male",
    furnished: false,
    billsIncluded: false,
    amenities: ["gym"],
    rentPerWeek: 280,
    bedrooms: 1,
    availableFrom: "2026-05-30",
    checklist: {
      ...baseListing.checklist,
      hasWrittenConsent: false,
      newRenterAddedToLease: false,
    },
  },
  {
    ...baseListing,
    id: "three",
    slug: "southbank-short-stay",
    title: "Short-term studio while renter travels",
    suburb: "Southbank",
    postcode: "3006",
    listingType: "temporary_sublet",
    consentStatus: "not_started",
    genderPreference: "any",
    furnished: false,
    billsIncluded: false,
    amenities: [],
    rentPerWeek: 730,
    bedrooms: 1,
    availableFrom: "2026-08-15",
    checklist: {
      ...baseListing.checklist,
      hasWrittenConsent: false,
      bondTransferDiscussed: false,
      agentOrLandlordAware: false,
      newRenterAddedToLease: false,
      understandsSubletRisk: false,
    },
  },
];

describe("listing filters", () => {
  it("filters listings by combined marketplace criteria", () => {
    const result = filterLeaseListings(listings, {
      query: "brunswick",
      listingType: "lease_transfer",
      readiness: "Ready to transfer",
      minRent: "500",
      maxRent: "650",
      minBedrooms: "2",
      availableBy: "2026-06-30",
    });

    expect(result.map((listing) => listing.slug)).toEqual(["brunswick-lease-transfer"]);
  });

  it("ignores empty or invalid numeric filter values", () => {
    const result = filterLeaseListings(listings, {
      maxRent: "not-a-number",
      minBedrooms: "",
    });

    expect(result).toHaveLength(3);
  });

  it("does not mark invalid numeric values as active filters", () => {
    expect(hasActiveListingFilters({ maxRent: "not-a-number", minBedrooms: "" })).toBe(false);
    expect(hasActiveListingFilters({ maxRent: "700" })).toBe(true);
  });

  it("filters by housemate gender preference", () => {
    expect(filterLeaseListings(listings, { genderPreference: "female" }).map((l) => l.slug)).toEqual([
      "brunswick-lease-transfer",
    ]);
    expect(filterLeaseListings(listings, { genderPreference: "male" }).map((l) => l.slug)).toEqual([
      "box-hill-room",
    ]);
    expect(filterLeaseListings(listings, { genderPreference: "all" })).toHaveLength(3);
  });

  it("filters by furnishing and bills-included", () => {
    expect(filterLeaseListings(listings, { furnished: "furnished" }).map((l) => l.slug)).toEqual([
      "brunswick-lease-transfer",
    ]);
    expect(filterLeaseListings(listings, { furnished: "unfurnished" }).map((l) => l.slug)).toEqual([
      "box-hill-room",
      "southbank-short-stay",
    ]);
    expect(filterLeaseListings(listings, { billsIncluded: "included" }).map((l) => l.slug)).toEqual([
      "brunswick-lease-transfer",
    ]);
  });

  it("marks the new preference filters as active only when set", () => {
    expect(hasActiveListingFilters({ genderPreference: "all", furnished: "all", billsIncluded: "all" })).toBe(false);
    expect(hasActiveListingFilters({ genderPreference: "female" })).toBe(true);
    expect(hasActiveListingFilters({ furnished: "unfurnished" })).toBe(true);
    expect(hasActiveListingFilters({ billsIncluded: "included" })).toBe(true);
  });

  it("filters by required amenities (listing must have all selected)", () => {
    expect(filterLeaseListings(listings, { amenities: ["pool"] }).map((l) => l.slug)).toEqual([
      "brunswick-lease-transfer",
    ]);
    expect(filterLeaseListings(listings, { amenities: ["gym"] }).map((l) => l.slug)).toEqual([
      "brunswick-lease-transfer",
      "box-hill-room",
    ]);
    expect(filterLeaseListings(listings, { amenities: ["gym", "pool"] }).map((l) => l.slug)).toEqual([
      "brunswick-lease-transfer",
    ]);
    expect(filterLeaseListings(listings, { amenities: [] })).toHaveLength(3);
    expect(hasActiveListingFilters({ amenities: ["gym"] })).toBe(true);
    expect(hasActiveListingFilters({ amenities: [] })).toBe(false);
  });
});
