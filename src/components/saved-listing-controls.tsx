"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatSavedListingStatus, savedListingStatuses } from "@/lib/saved-listings";

export function SavedListingControls({
  savedListingId,
  initialStatus,
  initialNotes,
}: {
  savedListingId: string;
  initialStatus: string;
  initialNotes: string;
}) {
  const router = useRouter();
  const [shortlistStatus, setShortlistStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes);
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function updateSavedListing() {
    setIsPending(true);
    setMessage("");

    const response = await fetch(`/api/saved-listings/${savedListingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shortlistStatus, notes }),
    });

    setIsPending(false);
    setMessage(response.ok ? "Shortlist updated." : "Could not update this shortlist item.");
    if (response.ok) router.refresh();
  }

  async function removeSavedListing() {
    setIsPending(true);
    setMessage("");

    const response = await fetch(`/api/saved-listings/${savedListingId}`, {
      method: "DELETE",
    });

    setIsPending(false);
    if (response.ok) {
      router.refresh();
      return;
    }

    setMessage("Could not remove this saved listing.");
  }

  return (
    <div className="saved-controls">
      <label className="form-field">
        <span>Status</span>
        <select
          value={shortlistStatus}
          onChange={(event) => setShortlistStatus(event.target.value)}
          disabled={isPending}
        >
          {savedListingStatuses.map((status) => (
            <option key={status} value={status}>
              {formatSavedListingStatus(status)}
            </option>
          ))}
        </select>
      </label>
      <label className="form-field">
        <span>Private note</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          maxLength={500}
          placeholder="Inspection time, questions, or next step"
          disabled={isPending}
        />
      </label>
      <div className="action-stack horizontal saved-actions">
        <button className="primary-button compact-button" type="button" onClick={updateSavedListing} disabled={isPending}>
          {isPending ? <span className="button-spinner" aria-hidden="true" /> : null}
          Update
        </button>
        <button className="secondary-button compact-button" type="button" onClick={removeSavedListing} disabled={isPending}>
          <Trash2 size={17} />
          Remove
        </button>
      </div>
      {message ? <p className="muted">{message}</p> : null}
    </div>
  );
}
