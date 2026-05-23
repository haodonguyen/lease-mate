import { describe, expect, it } from "vitest";
import {
  buildListingUpdateData,
  canEditListing,
  buildListingCreateData,
  canUpdateListingStatus,
  getListingReadinessFromRecord,
  normaliseListingFormInput,
} from "../src/lib/server/listing-service";

describe("listing service", () => {
  it("normalises listing form input into typed data", () => {
    const input = normaliseListingFormInput({
      title: "  Carlton lease transfer ",
      suburb: "Carlton",
      state: "VIC",
      postcode: "3053",
      listingType: "lease_transfer",
      consentStatus: "approved",
      housingType: "private_rental",
      rentPerWeek: "510",
      bondAmount: "2040",
      bedrooms: "1",
      bathrooms: "1",
      availableFrom: "2026-08-01",
      leaseEnds: "2027-02-01",
      description: "A detailed listing description for a renter.",
      imageUrl: "https://images.unsplash.com/photo-1",
      highlights: "Written consent received\nClose to tram",
      hasWrittenConsent: "on",
      bondTransferDiscussed: "on",
      agentOrLandlordAware: "on",
      newRenterAddedToLease: "on",
      understandsSubletRisk: "on",
    });

    expect(input.ok).toBe(true);
    if (input.ok) {
      expect(input.data).toEqual(
        expect.objectContaining({
          title: "Carlton lease transfer",
          rentPerWeek: 510,
          highlights: ["Written consent received", "Close to tram"],
        }),
      );
    }
  });

  it("does not treat the string false as checked consent", () => {
    const input = normaliseListingFormInput({
      title: "Carlton lease transfer",
      suburb: "Carlton",
      state: "VIC",
      postcode: "3053",
      listingType: "lease_transfer",
      consentStatus: "pending",
      housingType: "private_rental",
      rentPerWeek: "510",
      bondAmount: "2040",
      bedrooms: "1",
      bathrooms: "1",
      availableFrom: "2026-08-01",
      leaseEnds: "2027-02-01",
      description: "A detailed listing description for a renter.",
      imageUrl: "https://images.unsplash.com/photo-1",
      highlights: "Close to tram",
      hasWrittenConsent: "false",
      bondTransferDiscussed: "false",
      agentOrLandlordAware: "false",
      newRenterAddedToLease: "false",
      understandsSubletRisk: "false",
    });

    expect(input.ok).toBe(true);
    if (input.ok) {
      expect(input.data.hasWrittenConsent).toBe(false);
      expect(input.data.agentOrLandlordAware).toBe(false);
    }
  });

  it("rejects invalid lease end dates before creating Prisma date values", () => {
    const input = normaliseListingFormInput({
      title: "Carlton lease transfer",
      suburb: "Carlton",
      state: "VIC",
      postcode: "3053",
      listingType: "lease_transfer",
      consentStatus: "approved",
      housingType: "private_rental",
      rentPerWeek: "510",
      bondAmount: "2040",
      bedrooms: "1",
      bathrooms: "1",
      availableFrom: "2026-08-01",
      leaseEnds: "not-a-date",
      description: "A detailed listing description for a renter.",
      imageUrl: "https://images.unsplash.com/photo-1",
      highlights: "Close to tram",
    });

    expect(input).toEqual({
      ok: false,
      errors: {
        leaseEnds: "Lease end date must use YYYY-MM-DD format",
      },
    });
  });

  it("rejects image URLs that cannot be loaded by a browser as public http resources", () => {
    const input = normaliseListingFormInput({
      title: "Carlton lease transfer",
      suburb: "Carlton",
      state: "VIC",
      postcode: "3053",
      listingType: "lease_transfer",
      consentStatus: "approved",
      housingType: "private_rental",
      rentPerWeek: "510",
      bondAmount: "2040",
      bedrooms: "1",
      bathrooms: "1",
      availableFrom: "2026-08-01",
      leaseEnds: "2027-02-01",
      description: "A detailed listing description for a renter.",
      imageUrl: "ftp://example.com/photo.jpg",
      highlights: "Close to tram",
    });

    expect(input).toEqual({
      ok: false,
      errors: {
        imageUrl: "Image URL must use http or https",
      },
    });
  });

  it("rejects listings where availability extends beyond the lease end date", () => {
    const input = normaliseListingFormInput({
      title: "Carlton lease transfer",
      suburb: "Carlton",
      state: "VIC",
      postcode: "3053",
      listingType: "temporary_sublet",
      consentStatus: "approved",
      housingType: "private_rental",
      rentPerWeek: "510",
      bondAmount: "2040",
      bedrooms: "1",
      bathrooms: "1",
      availableFrom: "2027-03-01",
      availableUntil: "2027-04-01",
      leaseEnds: "2027-02-01",
      description: "A detailed listing description for a renter.",
      imageUrl: "https://images.unsplash.com/photo-1",
      highlights: "Close to tram",
    });

    expect(input).toEqual({
      ok: false,
      errors: {
        leaseEnds: "Lease end date must be on or after the available dates",
      },
    });
  });

  it("builds a stable slug and JSON highlights for Prisma create", () => {
    const data = buildListingCreateData(
      {
        title: "Carlton lease transfer",
        suburb: "Carlton",
        state: "VIC",
        postcode: "3053",
        listingType: "lease_transfer",
        consentStatus: "approved",
        housingType: "private_rental",
        rentPerWeek: 510,
        bondAmount: 2040,
        bedrooms: 1,
        bathrooms: 1,
        availableFrom: "2026-08-01",
        availableUntil: undefined,
        leaseEnds: "2027-02-01",
        description: "A detailed listing description for a renter.",
        imageUrl: "https://images.unsplash.com/photo-1",
        highlights: ["Written consent received"],
        hasWrittenConsent: true,
        bondTransferDiscussed: true,
        agentOrLandlordAware: true,
        newRenterAddedToLease: true,
        understandsSubletRisk: true,
      },
      "owner_123",
    );

    expect(data.slug).toMatch(/^carlton-lease-transfer-/);
    expect(data.highlights).toBe("[\"Written consent received\"]");
    expect(data.ownerId).toBe("owner_123");
  });

  it("builds Prisma update data without changing immutable ownership or slug fields", () => {
    const data = buildListingUpdateData({
      title: "Updated Carlton lease transfer",
      suburb: "Carlton North",
      state: "VIC",
      postcode: "3054",
      listingType: "room_replacement",
      consentStatus: "pending",
      housingType: "share_house",
      rentPerWeek: 540,
      bondAmount: 2160,
      bedrooms: 2,
      bathrooms: 1,
      availableFrom: "2026-09-01",
      availableUntil: undefined,
      leaseEnds: "2027-03-01",
      description: "Updated listing description with inspection availability and transfer details.",
      imageUrl: "https://images.unsplash.com/photo-2",
      highlights: ["Updated inspection times", "Close to train"],
      hasWrittenConsent: true,
      bondTransferDiscussed: true,
      agentOrLandlordAware: true,
      newRenterAddedToLease: false,
      understandsSubletRisk: true,
    });

    expect(data).toEqual(
      expect.objectContaining({
        title: "Updated Carlton lease transfer",
        suburb: "Carlton North",
        listingType: "ROOM_REPLACEMENT",
        consentStatus: "PENDING",
        housingType: "SHARE_HOUSE",
        highlights: "[\"Updated inspection times\",\"Close to train\"]",
      }),
    );
    expect(data).not.toHaveProperty("ownerId");
    expect(data).not.toHaveProperty("slug");
  });

  it("assesses readiness from a database listing record", () => {
    const readiness = getListingReadinessFromRecord({
      listingType: "LEASE_TRANSFER",
      consentStatus: "APPROVED",
      housingType: "PRIVATE_RENTAL",
      hasWrittenConsent: true,
      bondTransferDiscussed: true,
      agentOrLandlordAware: true,
      newRenterAddedToLease: true,
      understandsSubletRisk: true,
    });

    expect(readiness.visibilityLabel).toBe("Ready to transfer");
  });

  it("allows admins and owning owners to update listing status", () => {
    expect(canUpdateListingStatus({ id: "owner_1", role: "OWNER" }, "owner_1")).toBe(true);
    expect(canUpdateListingStatus({ id: "admin_1", role: "ADMIN" }, "owner_1")).toBe(true);
  });

  it("allows admins and owning owners to edit listing details", () => {
    expect(canEditListing({ id: "owner_1", role: "OWNER" }, "owner_1")).toBe(true);
    expect(canEditListing({ id: "admin_1", role: "ADMIN" }, "owner_1")).toBe(true);
  });

  it("rejects renters and non-owning owners from listing status updates", () => {
    expect(canUpdateListingStatus({ id: "renter_1", role: "RENTER" }, "owner_1")).toBe(false);
    expect(canUpdateListingStatus({ id: "owner_2", role: "OWNER" }, "owner_1")).toBe(false);
  });

  it("rejects renters and non-owning owners from listing edits", () => {
    expect(canEditListing({ id: "renter_1", role: "RENTER" }, "owner_1")).toBe(false);
    expect(canEditListing({ id: "owner_2", role: "OWNER" }, "owner_1")).toBe(false);
  });
});
