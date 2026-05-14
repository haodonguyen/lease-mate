"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function ReportModerationButton({
  reportId,
  status,
}: {
  reportId: string;
  status: "REVIEWED" | "DISMISSED";
}) {
  const router = useRouter();

  async function moderate() {
    await fetch("/api/reports/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, status }),
    });
    router.refresh();
  }

  return (
    <button className="secondary-button" type="button" onClick={moderate}>
      {status === "REVIEWED" ? <CheckCircle2 size={17} /> : <XCircle size={17} />}
      {status === "REVIEWED" ? "Mark reviewed" : "Dismiss"}
    </button>
  );
}
