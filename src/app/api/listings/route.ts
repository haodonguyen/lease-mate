import { NextResponse } from "next/server";
import { parseJsonRequest } from "@/lib/server/api-validation";
import { canManageListings, getCurrentUser } from "@/lib/server/auth";
import { createListing } from "@/lib/server/listing-service";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user || !canManageListings(user.role)) {
    return NextResponse.json({ ok: false, error: "Owner access required" }, { status: 403 });
  }

  const body = await parseJsonRequest(request);
  if (!body.ok) {
    return NextResponse.json({ ok: false, error: body.error }, { status: 400 });
  }

  const result = await createListing(user.id, body.data);
  return NextResponse.json(result, { status: result.ok ? 201 : 400 });
}
