import { z } from "zod";

const listingStatusSchema = z.object({
  listingId: z.string().min(1),
  status: z.enum(["PUBLISHED", "PAUSED", "REMOVED"], {
    errorMap: () => ({ message: "Listing status must be PUBLISHED, PAUSED, or REMOVED" }),
  }),
});

const reportStatusSchema = z.object({
  reportId: z.string().min(1),
  status: z.enum(["REVIEWED", "DISMISSED"], {
    errorMap: () => ({ message: "Report status must be REVIEWED or DISMISSED" }),
  }),
});

const analyticsEventSchema = z.object({
  name: z.string().trim().min(1, "Analytics event name is required"),
  userId: z.string().optional(),
  listingId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export function parseListingStatusInput(input: unknown) {
  const parsed = listingStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: firstIssue(parsed.error) };
  }

  return { ok: true as const, data: parsed.data };
}

export function parseReportStatusInput(input: unknown) {
  const parsed = reportStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: firstIssue(parsed.error) };
  }

  return { ok: true as const, data: parsed.data };
}

export function parseAnalyticsEventInput(input: unknown) {
  const parsed = analyticsEventSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: firstIssue(parsed.error) };
  }

  return { ok: true as const, data: parsed.data };
}

export async function parseJsonRequest(request: Request) {
  try {
    return { ok: true as const, data: await request.json() };
  } catch {
    return { ok: false as const, error: "Invalid JSON request body" };
  }
}

function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Invalid request";
}
