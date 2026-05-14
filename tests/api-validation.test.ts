import { describe, expect, it } from "vitest";
import {
  parseAnalyticsEventInput,
  parseListingStatusInput,
  parseReportStatusInput,
} from "../src/lib/server/api-validation";

describe("api validation", () => {
  it("accepts supported listing status updates", () => {
    expect(parseListingStatusInput({ listingId: "listing_1", status: "PAUSED" })).toEqual({
      ok: true,
      data: { listingId: "listing_1", status: "PAUSED" },
    });
  });

  it("rejects unsupported listing status updates", () => {
    expect(parseListingStatusInput({ listingId: "listing_1", status: "REMOVED" })).toEqual({
      ok: false,
      error: "Listing status must be PUBLISHED or PAUSED",
    });
  });

  it("rejects unsupported report moderation status", () => {
    expect(parseReportStatusInput({ reportId: "report_1", status: "OPEN" })).toEqual({
      ok: false,
      error: "Report status must be REVIEWED or DISMISSED",
    });
  });

  it("rejects analytics events without a meaningful name", () => {
    expect(parseAnalyticsEventInput({ name: " " })).toEqual({
      ok: false,
      error: "Analytics event name is required",
    });
  });
});
