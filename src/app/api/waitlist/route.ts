import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/server/db";
import { trackEvent } from "@/lib/server/analytics-service";

const waitlistSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  suburb: z.string().trim().min(2),
  role: z.string().trim().min(2),
});

export async function POST(request: Request) {
  const parsed = waitlistSchema.safeParse(await request.json());
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
