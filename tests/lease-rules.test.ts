import { describe, expect, it } from "vitest";
import {
  assessListingReadiness,
  getSafetyWarnings,
  validateListingBasics,
} from "../src/lib/lease-rules";

describe("lease transfer safety rules", () => {
  it("blocks lease transfer publishing until written consent is confirmed", () => {
    const result = assessListingReadiness({
      listingType: "lease_transfer",
      consentStatus: "pending",
      checklist: {
        hasWrittenConsent: false,
        bondTransferDiscussed: true,
        agentOrLandlordAware: true,
        newRenterAddedToLease: true,
        understandsSubletRisk: true,
        housingType: "private_rental",
      },
    });

    expect(result.canPublish).toBe(false);
    expect(result.missingItems).toContain("Written consent status must be confirmed");
  });

  it("marks temporary sublets without written consent as high risk", () => {
    const warnings = getSafetyWarnings({
      listingType: "temporary_sublet",
      consentStatus: "not_started",
      housingType: "private_rental",
    });

    expect(warnings).toContainEqual(
      expect.objectContaining({
        level: "high",
        code: "SUBLET_WITHOUT_WRITTEN_CONSENT",
      }),
    );
  });

  it("allows consent-pending room replacement listings to be visible after checklist completion", () => {
    const result = assessListingReadiness({
      listingType: "room_replacement",
      consentStatus: "pending",
      checklist: {
        hasWrittenConsent: false,
        bondTransferDiscussed: true,
        agentOrLandlordAware: true,
        newRenterAddedToLease: false,
        understandsSubletRisk: true,
        housingType: "private_rental",
      },
    });

    expect(result.canPublish).toBe(true);
    expect(result.visibilityLabel).toBe("Consent pending");
  });

  it("blocks room replacement listings when the agent or landlord is aware but written consent has not been requested", () => {
    const result = assessListingReadiness({
      listingType: "room_replacement",
      consentStatus: "not_started",
      checklist: {
        hasWrittenConsent: false,
        bondTransferDiscussed: true,
        agentOrLandlordAware: true,
        newRenterAddedToLease: false,
        understandsSubletRisk: true,
        housingType: "share_house",
      },
    });

    expect(result.canPublish).toBe(false);
    expect(result.missingItems).toContain("Written consent process must be started");
  });

  it("rejects invalid rent, bond, and date ranges", () => {
    const errors = validateListingBasics({
      rentPerWeek: 0,
      bondAmount: -1,
      availableFrom: "2026-07-15",
      availableUntil: "2026-07-01",
    });

    expect(errors).toEqual([
      "Weekly rent must be greater than $0",
      "Bond cannot be negative",
      "Available until date must be after the available from date",
    ]);
  });

  it("rejects malformed listing dates before comparing ranges", () => {
    const errors = validateListingBasics({
      rentPerWeek: 480,
      bondAmount: 2080,
      availableFrom: "2026-7-15",
      availableUntil: "not-a-date",
    });

    expect(errors).toEqual([
      "Available from date must use YYYY-MM-DD format",
      "Available until date must use YYYY-MM-DD format",
    ]);
  });

  it("marks approved transfer listings as ready when core checklist items are complete", () => {
    const result = assessListingReadiness({
      listingType: "lease_transfer",
      consentStatus: "approved",
      checklist: {
        hasWrittenConsent: true,
        bondTransferDiscussed: true,
        agentOrLandlordAware: true,
        newRenterAddedToLease: true,
        understandsSubletRisk: true,
        housingType: "private_rental",
      },
    });

    expect(result.canPublish).toBe(true);
    expect(result.visibilityLabel).toBe("Ready to transfer");
    expect(result.score).toBeGreaterThanOrEqual(90);
  });
});
