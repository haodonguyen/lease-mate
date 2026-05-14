import { describe, expect, it } from "vitest";
import {
  buildListingCreateData,
  getListingReadinessFromRecord,
  normaliseListingFormInput,
} from "../src/lib/server/listing-service";

describe("listing service", () => {
  it("normalises listing form input into typed data", () => {
    const input = normaliseListingFormInput({
      title: "  Carlton lease transfer ",
      suburb: "Carlton",
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

  it("builds a stable slug and JSON highlights for Prisma create", () => {
    const data = buildListingCreateData(
      {
        title: "Carlton lease transfer",
        suburb: "Carlton",
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
});
