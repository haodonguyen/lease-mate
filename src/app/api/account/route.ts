import { NextResponse } from "next/server";
import { parseJsonRequest } from "@/lib/server/api-validation";
import { changeAccountPassword, updateAccountProfile } from "@/lib/server/account-service";
import { getCurrentAuthenticatedUser } from "@/lib/server/auth";

export async function PATCH(request: Request) {
  const user = await getCurrentAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Login required" }, { status: 401 });
  }

  const body = await parseJsonRequest(request);
  if (!body.ok) {
    return NextResponse.json({ ok: false, error: body.error }, { status: 400 });
  }

  const action = body.data.action;
  const result =
    action === "password"
      ? await changeAccountPassword(user.id, body.data)
      : await updateAccountProfile(user.id, body.data);

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
