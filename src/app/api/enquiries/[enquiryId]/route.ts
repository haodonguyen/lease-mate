import { NextResponse } from "next/server";
import { parseJsonRequest } from "@/lib/server/api-validation";
import { getCurrentAuthenticatedUser } from "@/lib/server/auth";
import { replyToEnquiry } from "@/lib/server/enquiry-service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ enquiryId: string }> },
) {
  const user = await getCurrentAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Login required" }, { status: 401 });
  }

  const body = await parseJsonRequest(request);
  if (!body.ok) {
    return NextResponse.json({ ok: false, error: body.error }, { status: 400 });
  }

  const { enquiryId } = await params;
  const result = await replyToEnquiry(enquiryId, { id: user.id, role: user.role }, body.data);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
