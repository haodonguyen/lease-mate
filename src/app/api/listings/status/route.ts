import { NextResponse } from "next/server";
import { canManageListings, getCurrentUser } from "@/lib/server/auth";
import { updateListingStatus } from "@/lib/server/listing-service";
import { parseListingStatusInput } from "@/lib/server/api-validation";

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  const parsed = parseListingStatusInput(await request.json());

  if (!user || !canManageListings(user.role)) {
    return NextResponse.json({ ok: false, error: "Owner access required" }, { status: 403 });
  }

  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  try {
    const listing = await updateListingStatus(parsed.data.listingId, user.id, parsed.data.status);
    return NextResponse.json({ ok: true, listing });
  } catch {
    return NextResponse.json({ ok: false, error: "Listing not found" }, { status: 404 });
  }
}
