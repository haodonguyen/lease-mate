import { NextResponse } from "next/server";
import { parseJsonRequest } from "@/lib/server/api-validation";
import { getCurrentUser } from "@/lib/server/auth";
import { checkRateLimit, getRateLimitKey } from "@/lib/server/rate-limit";
import { reportListing } from "@/lib/server/social-service";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const limit = checkRateLimit({ key: getRateLimitKey(request, "reports", user?.id), limit: 10, windowMs: 60_000 });
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });
  }

  const body = await parseJsonRequest(request);
  if (!body.ok) {
    return NextResponse.json({ ok: false, error: body.error }, { status: 400 });
  }

  const result = await reportListing(user?.id, body.data);
  return NextResponse.json(result, { status: result.ok ? 201 : 400 });
}
