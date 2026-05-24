import { NextResponse } from "next/server";
import { createUserSession, isValidLoginInput, verifyLoginCredentials } from "@/lib/server/auth";
import { parseJsonRequest } from "@/lib/server/api-validation";
import { checkRateLimit, getRateLimitKey } from "@/lib/server/rate-limit";

export async function POST(request: Request) {
  const limit = checkRateLimit({ key: getRateLimitKey(request, "auth-login"), limit: 5, windowMs: 60_000 });
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });
  }

  const body = await parseJsonRequest(request);
  if (!body.ok) {
    return NextResponse.json({ ok: false, error: body.error }, { status: 400 });
  }

  const input = isValidLoginInput(body.data);
  if (!input.ok) {
    return NextResponse.json({ ok: false, error: "Invalid email or password" }, { status: 400 });
  }

  const user = await verifyLoginCredentials(input.data);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Invalid email or password" }, { status: 401 });
  }

  if (!user.emailVerifiedAt) {
    return NextResponse.json(
      { ok: false, error: "Please verify your email before signing in." },
      { status: 403 },
    );
  }

  await createUserSession(user.id);

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}
