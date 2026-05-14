import { NextResponse } from "next/server";
import { canModerate, getCurrentUser } from "@/lib/server/auth";
import { parseJsonRequest, parseReportStatusInput } from "@/lib/server/api-validation";
import { prisma } from "@/lib/server/db";

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user || !canModerate(user.role)) {
    return NextResponse.json({ ok: false, error: "Admin access required" }, { status: 403 });
  }

  const body = await parseJsonRequest(request);
  if (!body.ok) {
    return NextResponse.json({ ok: false, error: body.error }, { status: 400 });
  }

  const parsed = parseReportStatusInput(body.data);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  const existing = await prisma.report.findUnique({ where: { id: parsed.data.reportId } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Report not found" }, { status: 404 });
  }

  const report = await prisma.report.update({
    where: { id: parsed.data.reportId },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({ ok: true, report });
}
