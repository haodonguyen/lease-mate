// Shared amenity vocabulary. Stored on a listing as a JSON array of the
// `value` keys below (like `highlights`), so the form, detail view, and
// filters all agree on the same fixed set. Keep this list focused on the
// amenities renters actually look for in Australian apartments.
export const LISTING_AMENITIES = [
  { value: "gym", label: "Gym" },
  { value: "pool", label: "Swimming pool" },
  { value: "sauna", label: "Sauna" },
  { value: "bbq", label: "BBQ area" },
  { value: "lounge", label: "Resident lounge" },
  { value: "parking", label: "Secure parking" },
  { value: "dishwasher", label: "Dishwasher" },
  { value: "air_con", label: "Air conditioning" },
  { value: "heating", label: "Heating" },
  { value: "laundry", label: "In-unit laundry" },
  { value: "balcony", label: "Balcony" },
  { value: "lift", label: "Lift" },
  { value: "security", label: "CCTV / security" },
  { value: "internet", label: "NBN / internet ready" },
  { value: "pet_friendly", label: "Pet friendly" },
] as const;

export type AmenityValue = (typeof LISTING_AMENITIES)[number]["value"];

const AMENITY_VALUE_SET = new Set<string>(LISTING_AMENITIES.map((amenity) => amenity.value));
const AMENITY_LABELS = new Map<string, string>(
  LISTING_AMENITIES.map((amenity) => [amenity.value, amenity.label]),
);

export function isAmenityValue(value: string): value is AmenityValue {
  return AMENITY_VALUE_SET.has(value);
}

export function amenityLabel(value: string): string {
  return AMENITY_LABELS.get(value) ?? value;
}

// Normalise an unknown amenities input (array or JSON string) to a
// de-duplicated list of known amenity values, preserving vocabulary order.
export function normaliseAmenities(input: unknown): AmenityValue[] {
  let items: unknown[] = [];
  if (Array.isArray(input)) {
    items = input;
  } else if (typeof input === "string" && input.trim()) {
    try {
      const parsed = JSON.parse(input);
      items = Array.isArray(parsed) ? parsed : [];
    } catch {
      items = [];
    }
  }

  const selected = new Set(items.filter((item): item is string => typeof item === "string"));
  return LISTING_AMENITIES.map((amenity) => amenity.value).filter((value) => selected.has(value));
}
