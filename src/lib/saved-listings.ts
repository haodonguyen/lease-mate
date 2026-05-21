import { z } from "zod";

export const savedListingStatuses = ["INTERESTED", "INSPECTING", "APPLIED", "REJECTED"] as const;
export type SavedListingShortlistStatus = (typeof savedListingStatuses)[number];

const savedListingUpdateSchema = z.object({
  shortlistStatus: z
    .string()
    .transform((value) => value.trim().toUpperCase())
    .refine((value): value is SavedListingShortlistStatus => savedListingStatuses.includes(value as SavedListingShortlistStatus), {
      message: "Choose a valid shortlist status",
    }),
  notes: z
    .string()
    .trim()
    .max(500, "Notes must be 500 characters or fewer")
    .optional()
    .transform((value) => value || null),
});

export function normaliseSavedListingUpdateInput(input: unknown) {
  const parsed = savedListingUpdateSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Saved listing details are invalid",
    };
  }

  return { ok: true as const, data: parsed.data };
}

export function formatSavedListingStatus(status: SavedListingShortlistStatus) {
  return status
    .toLowerCase()
    .replace("_", " ")
    .replace(/^\w/, (letter) => letter.toUpperCase());
}
