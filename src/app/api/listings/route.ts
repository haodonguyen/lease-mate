import { NextResponse } from "next/server";
import { canManageListings, getCurrentUser } from "@/lib/server/auth";
import { createListing } from "@/lib/server/listing-service";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user || !canManageListings(user.role)) {
    return NextResponse.json({ ok: false, error: "Owner access required" }, { status: 403 });
  }

  const result = await createListing(user.id, await request.json());
  return NextResponse.json(result, { status: result.ok ? 201 : 400 });
}
