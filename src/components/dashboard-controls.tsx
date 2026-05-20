"use client";

import { PauseCircle, PlayCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ListingStatusButton({
  listingId,
  nextStatus,
}: {
  listingId: string;
  nextStatus: "PUBLISHED" | "PAUSED";
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function updateStatus() {
    try {
      setIsPending(true);
      await fetch("/api/listings/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, status: nextStatus }),
      });
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button className="secondary-button" type="button" onClick={updateStatus} disabled={isPending} aria-busy={isPending}>
      {isPending ? (
        <span className="button-spinner" aria-hidden="true" />
      ) : nextStatus === "PAUSED" ? (
        <PauseCircle size={17} />
      ) : (
        <PlayCircle size={17} />
      )}
      {isPending ? "Updating" : nextStatus === "PAUSED" ? "Pause" : "Publish"}
    </button>
  );
}
