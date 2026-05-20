import { NextResponse } from "next/server";
import { parseJsonRequest } from "@/lib/server/api-validation";
import { canManageListings, getCurrentUser } from "@/lib/server/auth";
import { updateListingDetails } from "@/lib/server/listing-service";

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ listingId: string }>;
  },
) {
  const user = await getCurrentUser();

  if (!user || !canManageListings(user.role)) {
    return NextResponse.json({ ok: false, error: "Owner access required" }, { status: 403 });
  }

  const body = await parseJsonRequest(request);
  if (!body.ok) {
    return NextResponse.json({ ok: false, error: body.error }, { status: 400 });
  }

  const { listingId } = await params;

  try {
    const result = await updateListingDetails(listingId, user, body.data);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    if (error instanceof Error && error.message === "Listing access denied") {
      return NextResponse.json({ ok: false, error: "Listing access denied" }, { status: 403 });
    }

    return NextResponse.json({ ok: false, error: "Listing not found" }, { status: 404 });
  }
}
