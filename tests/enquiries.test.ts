import { describe, expect, it } from "vitest";
import { createEnquiry, resetEnquiriesForTests } from "../src/lib/enquiries";

describe("enquiry workflow", () => {
  it("stores a validated enquiry with a generated id", () => {
    resetEnquiriesForTests();

    const result = createEnquiry({
      listingSlug: "brunswick-east-light-filled-apartment",
      name: "Harry Do",
      email: "harry@example.com",
      message: "Can I inspect this lease transfer this week?",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.enquiry).toEqual(
        expect.objectContaining({
          id: expect.stringMatching(/^enq_/),
          listingSlug: "brunswick-east-light-filled-apartment",
          email: "harry@example.com",
          status: "new",
        }),
      );
    }
  });

  it("rejects invalid enquiry details with field-level errors", () => {
    const result = createEnquiry({
      listingSlug: "",
      name: "H",
      email: "not-an-email",
      message: "Too short",
    });

    expect(result).toEqual({
      ok: false,
      errors: {
        listingSlug: "Listing is required",
        name: "Name must be at least 2 characters",
        email: "Enter a valid email address",
        message: "Message must be at least 20 characters",
      },
    });
  });
});
