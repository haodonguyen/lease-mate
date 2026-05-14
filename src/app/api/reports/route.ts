import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";
import { reportListing } from "@/lib/server/social-service";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const result = await reportListing(user?.id, await request.json());
  return NextResponse.json(result, { status: result.ok ? 201 : 400 });
}
