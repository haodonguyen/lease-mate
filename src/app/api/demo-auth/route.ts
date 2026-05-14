import { NextResponse } from "next/server";
import { setDemoUser } from "@/lib/server/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const user = await setDemoUser(String(body.email ?? ""));

  if (!user) {
    return NextResponse.json({ ok: false, error: "Unknown demo user" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, user });
}
