import { NextResponse } from "next/server";
import { parseJsonRequest } from "@/lib/server/api-validation";
import { getCurrentUser } from "@/lib/server/auth";
import { checkRateLimit, getRateLimitKey } from "@/lib/server/rate-limit";
import { saveListing } from "@/lib/server/social-service";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "Login required" }, { status: 401 });

  const limit = checkRateLimit({ key: getRateLimitKey(request, "saved-listings", user.id), limit: 30, windowMs: 60_000 });
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });
  }

  const body = await parseJsonRequest(request);
  if (!body.ok) {
    return NextResponse.json({ ok: false, error: body.error }, { status: 400 });
  }

  const result = await saveListing(user.id, String(body.data.listingSlug));
  return NextResponse.json(result, { status: result.ok ? 201 : 400 });
}
