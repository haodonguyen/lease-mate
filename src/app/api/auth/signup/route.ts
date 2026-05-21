import { NextResponse } from "next/server";
import { createSignupUser, createUserSession, isValidSignupInput } from "@/lib/server/auth";
import { parseJsonRequest } from "@/lib/server/api-validation";
import { checkRateLimit, getRateLimitKey } from "@/lib/server/rate-limit";

export async function POST(request: Request) {
  const limit = checkRateLimit({ key: getRateLimitKey(request, "auth-signup"), limit: 5, windowMs: 60_000 });
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });
  }

  const body = await parseJsonRequest(request);
  if (!body.ok) {
    return NextResponse.json({ ok: false, error: body.error }, { status: 400 });
  }

  const input = isValidSignupInput(body.data);
  if (!input.ok) {
    return NextResponse.json({ ok: false, error: input.error }, { status: 400 });
  }

  const result = await createSignupUser(input.data);
  if (!result.ok) {
    return NextResponse.json(result, { status: 409 });
  }

  await createUserSession(result.user.id);

  return NextResponse.json({
    ok: true,
    user: {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
    },
  });
}
