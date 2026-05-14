import { NextResponse } from "next/server";
import { createEnquiryForListing } from "@/lib/server/enquiry-service";

export async function POST(request: Request) {
  const result = await createEnquiryForListing(await request.json());

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result, { status: 201 });
}
