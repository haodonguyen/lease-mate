import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJsonRequest } from "@/lib/server/api-validation";
import { prisma } from "@/lib/server/db";
import { trackEvent } from "@/lib/server/analytics-service";
import { checkRateLimit, getRateLimitKey } from "@/lib/server/rate-limit";

const waitlistSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  suburb: z.string().trim().min(2),
  role: z.string().trim().min(2),
});

export async function POST(request: Request) {
  const limit = checkRateLimit({ key: getRateLimitKey(request, "waitlist"), limit: 5, windowMs: 60_000 });
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });
  }

  const body = await parseJsonRequest(request);
  if (!body.ok) {
    return NextResponse.json({ ok: false, error: body.error }, { status: 400 });
  }

  const parsed = waitlistSchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid waitlist details" }, { status: 400 });
  }

  const signup = await prisma.waitlistSignup.upsert({
    where: { email: parsed.data.email },
    update: parsed.data,
    create: parsed.data,
  });
  await trackEvent({ name: "waitlist_signup", metadata: { suburb: signup.suburb, role: signup.role } });

  return NextResponse.json({ ok: true, signup }, { status: 201 });
}
