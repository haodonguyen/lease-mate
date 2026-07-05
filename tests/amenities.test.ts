import { describe, expect, it } from "vitest";
import { amenityLabel, normaliseAmenities } from "../src/lib/amenities";

describe("amenities", () => {
  it("keeps only known amenity values, de-duplicated and in vocabulary order", () => {
    expect(normaliseAmenities(["pool", "gym", "pool", "not-real"])).toEqual(["gym", "pool"]);
  });

  it("parses a JSON string of amenity values", () => {
    expect(normaliseAmenities('["security","gym"]')).toEqual(["gym", "security"]);
  });

  it("returns an empty list for empty, invalid, or non-array input", () => {
    expect(normaliseAmenities("")).toEqual([]);
    expect(normaliseAmenities("not json")).toEqual([]);
    expect(normaliseAmenities(null)).toEqual([]);
    expect(normaliseAmenities('{"gym":true}')).toEqual([]);
  });

  it("maps values to human labels and falls back to the raw value", () => {
    expect(amenityLabel("gym")).toBe("Gym");
    expect(amenityLabel("unknown")).toBe("unknown");
  });
});
