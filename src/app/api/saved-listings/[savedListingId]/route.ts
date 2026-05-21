import { NextResponse } from "next/server";
import { parseJsonRequest } from "@/lib/server/api-validation";
import { getCurrentAuthenticatedUser } from "@/lib/server/auth";
import { removeSavedListing, updateSavedListing } from "@/lib/server/social-service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ savedListingId: string }> },
) {
  const user = await getCurrentAuthenticatedUser();
  if (!user) return NextResponse.json({ ok: false, error: "Login required" }, { status: 401 });

  const body = await parseJsonRequest(request);
  if (!body.ok) {
    return NextResponse.json({ ok: false, error: body.error }, { status: 400 });
  }

  const { savedListingId } = await params;
  const result = await updateSavedListing(user.id, savedListingId, body.data);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ savedListingId: string }> },
) {
  const user = await getCurrentAuthenticatedUser();
  if (!user) return NextResponse.json({ ok: false, error: "Login required" }, { status: 401 });

  const { savedListingId } = await params;
  const result = await removeSavedListing(user.id, savedListingId);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
