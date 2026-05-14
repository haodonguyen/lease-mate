import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";
import { parseAnalyticsEventInput } from "@/lib/server/api-validation";
import { trackEvent } from "@/lib/server/analytics-service";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const parsed = parseAnalyticsEventInput(await request.json());
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  await trackEvent({
    name: parsed.data.name,
    userId: user?.id,
    listingId: parsed.data.listingId,
    metadata: parsed.data.metadata,
  });

  return NextResponse.json({ ok: true });
}
