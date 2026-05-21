import { describe, expect, it } from "vitest";
import { normaliseSavedListingUpdateInput } from "../src/lib/saved-listings";

describe("saved listing workflow", () => {
  it("normalises shortlist status and private notes", () => {
    const input = normaliseSavedListingUpdateInput({
      shortlistStatus: "inspecting",
      notes: "  Inspection booked for Saturday.  ",
    });

    expect(input).toEqual({
      ok: true,
      data: {
        shortlistStatus: "INSPECTING",
        notes: "Inspection booked for Saturday.",
      },
    });
  });

  it("rejects unknown shortlist statuses", () => {
    expect(normaliseSavedListingUpdateInput({ shortlistStatus: "maybe" })).toEqual({
      ok: false,
      error: "Choose a valid shortlist status",
    });
  });
});
