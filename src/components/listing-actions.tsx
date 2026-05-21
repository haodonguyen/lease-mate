"use client";

import { Bookmark, Flag, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ListingActions({
  listingSlug,
  listingId,
  isAuthenticated,
  isSaved,
}: {
  listingSlug: string;
  listingId: string;
  isAuthenticated: boolean;
  isSaved: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState(isSaved ? "Already in your shortlist." : "");
  const [saved, setSaved] = useState(isSaved);

  async function saveListing() {
    if (!isAuthenticated) {
      router.push(`/login?next=/listings/${listingSlug}`);
      return;
    }

    const response = await fetch("/api/saved-listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingSlug }),
    });
    if (response.ok) {
      setSaved(true);
      setMessage("Saved to your shortlist.");
      router.refresh();
      return;
    }

    setMessage("Could not save this listing.");
  }

  async function reportListing() {
    const response = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingSlug,
        reason: "Needs review",
        details: "Flagged from listing detail page.",
      }),
    });
    setMessage(response.ok ? "Report sent to moderation." : "Could not report this listing.");
  }

  async function shareListing() {
    await navigator.clipboard?.writeText(window.location.href);
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "share_click", listingId }),
    });
    setMessage("Share link copied.");
  }

  return (
    <div className="action-stack">
      <button className="secondary-button" type="button" onClick={saveListing}>
        <Bookmark size={17} />
        {saved ? "Saved" : "Save"}
      </button>
      <button className="secondary-button" type="button" onClick={shareListing}>
        <Share2 size={17} />
        Share
      </button>
      <button className="secondary-button" type="button" onClick={reportListing}>
        <Flag size={17} />
        Report
      </button>
      {message ? <p className="muted">{message}</p> : null}
    </div>
  );
}
