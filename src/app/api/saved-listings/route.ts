import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";
import { saveListing } from "@/lib/server/social-service";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "Login required" }, { status: 401 });

  const body = await request.json();
  const result = await saveListing(user.id, String(body.listingSlug));
  return NextResponse.json(result, { status: result.ok ? 201 : 400 });
}
