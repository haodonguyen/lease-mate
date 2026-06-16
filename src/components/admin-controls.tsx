"use client";

import { CheckCircle2, RotateCcw, Trash2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

export function ListingModerationButton({
  listingId,
  isRemoved,
}: {
  listingId: string;
  isRemoved: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function moderate() {
    setPending(true);
    await fetch("/api/listings/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, status: isRemoved ? "PUBLISHED" : "REMOVED" }),
    });
    router.refresh();
    setPending(false);
  }

  return (
    <button
      className={isRemoved ? "secondary-button" : "secondary-button danger-button"}
      type="button"
      onClick={moderate}
      disabled={pending}
    >
      {isRemoved ? <RotateCcw size={17} /> : <Trash2 size={17} />}
      {isRemoved ? "Restore listing" : "Remove listing"}
    </button>
  );
}
