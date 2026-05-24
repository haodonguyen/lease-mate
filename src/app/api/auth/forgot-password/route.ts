import { NextResponse } from "next/server";
import { normaliseRequestPasswordResetInput, createPasswordResetTokenForEmail } from "@/lib/server/auth-tokens";
import { parseJsonRequest } from "@/lib/server/api-validation";
import { sendPasswordResetEmail } from "@/lib/server/email-service";
import { checkRateLimit, getRateLimitKey } from "@/lib/server/rate-limit";

const SUCCESS_MESSAGE = "If an account exists for that email, a password reset link has been sent.";

export async function POST(request: Request) {
  const limit = checkRateLimit({ key: getRateLimitKey(request, "auth-forgot-password"), limit: 5, windowMs: 60_000 });
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });
  }

  const body = await parseJsonRequest(request);
  if (!body.ok) {
    return NextResponse.json({ ok: false, error: body.error }, { status: 400 });
  }

  const input = normaliseRequestPasswordResetInput(body.data);
  if (!input.ok) {
    return NextResponse.json({ ok: false, error: input.error }, { status: 400 });
  }

  const result = await createPasswordResetTokenForEmail(input.email);
  if (result.user && result.token) {
    await sendPasswordResetEmail(result.user, result.token);
  }

  return NextResponse.json({ ok: true, message: SUCCESS_MESSAGE });
}
