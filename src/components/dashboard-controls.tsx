"use client";

import { PauseCircle, PlayCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function ListingStatusButton({
  listingId,
  nextStatus,
}: {
  listingId: string;
  nextStatus: "PUBLISHED" | "PAUSED";
}) {
  const router = useRouter();

  async function updateStatus() {
    await fetch("/api/listings/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, status: nextStatus }),
    });
    router.refresh();
  }

  return (
    <button className="secondary-button" type="button" onClick={updateStatus}>
      {nextStatus === "PAUSED" ? <PauseCircle size={17} /> : <PlayCircle size={17} />}
      {nextStatus === "PAUSED" ? "Pause" : "Publish"}
    </button>
  );
}
