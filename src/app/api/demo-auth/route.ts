import { NextResponse } from "next/server";
import { isDemoAuthEnabled, setDemoUser } from "@/lib/server/auth";
import { parseJsonRequest } from "@/lib/server/api-validation";

export async function POST(request: Request) {
  if (!isDemoAuthEnabled()) {
    return NextResponse.json({ ok: false, error: "Demo authentication is disabled" }, { status: 404 });
  }

  const body = await parseJsonRequest(request);
  if (!body.ok) {
    return NextResponse.json({ ok: false, error: body.error }, { status: 400 });
  }

  const user = await setDemoUser(String(body.data.email ?? ""));

  if (!user) {
    return NextResponse.json({ ok: false, error: "Unknown demo user" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, user });
}
