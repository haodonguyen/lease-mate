import { NextResponse } from "next/server";
import { normaliseVerifyEmailInput, verifyEmailToken } from "@/lib/server/auth-tokens";
import { parseJsonRequest } from "@/lib/server/api-validation";
import { checkRateLimit, getRateLimitKey } from "@/lib/server/rate-limit";

export async function POST(request: Request) {
  const limit = checkRateLimit({ key: getRateLimitKey(request, "auth-verify-email"), limit: 10, windowMs: 60_000 });
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });
  }

  const body = await parseJsonRequest(request);
  if (!body.ok) {
    return NextResponse.json({ ok: false, error: body.error }, { status: 400 });
  }

  const input = normaliseVerifyEmailInput(body.data);
  if (!input.ok) {
    return NextResponse.json({ ok: false, error: input.error }, { status: 400 });
  }

  const result = await verifyEmailToken(input.token);
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
