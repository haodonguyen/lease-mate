import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";
import { parseAnalyticsEventInput, parseJsonRequest } from "@/lib/server/api-validation";
import { trackEvent } from "@/lib/server/analytics-service";
import { checkRateLimit, getRateLimitKey } from "@/lib/server/rate-limit";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const limit = checkRateLimit({ key: getRateLimitKey(request, "analytics", user?.id), limit: 60, windowMs: 60_000 });
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });
  }

  const body = await parseJsonRequest(request);
  if (!body.ok) {
    return NextResponse.json({ ok: false, error: body.error }, { status: 400 });
  }

  const parsed = parseAnalyticsEventInput(body.data);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  await trackEvent({
    name: parsed.data.name,
    userId: user?.id,
    listingId: parsed.data.listingId,
    metadata: parsed.data.metadata,
  });

  return NextResponse.json({ ok: true });
}
