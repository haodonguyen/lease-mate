"use client";

import { ImageIcon, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getListingImagePreviewState } from "@/lib/image-preview";

const defaultImageUrl = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80";

export function ListingCreateForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState(defaultImageUrl);
  const [imageLoadError, setImageLoadError] = useState(false);
  const imagePreview = getListingImagePreviewState(imageUrl, imageLoadError);

  async function submitListing(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (imagePreview.status === "empty" || imagePreview.status === "invalid" || imagePreview.status === "error") {
      setMessage(imagePreview.message);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    const response = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok || !result.ok) {
      setMessage("Could not create listing. Check required details and your demo role.");
      return;
    }

    router.push(`/listings/${result.listing.slug}`);
    router.refresh();
  }

  return (
    <form className="form-grid wide-form" onSubmit={submitListing}>
      <div className="form-field">
        <label htmlFor="title">Title</label>
        <input id="title" name="title" defaultValue="Carlton lease transfer near tram" required />
      </div>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="suburb">Suburb</label>
          <input id="suburb" name="suburb" defaultValue="Carlton" required />
        </div>
        <div className="form-field">
          <label htmlFor="postcode">Postcode</label>
          <input id="postcode" name="postcode" defaultValue="3053" required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="listingType">Listing type</label>
          <select id="listingType" name="listingType" defaultValue="lease_transfer">
            <option value="lease_transfer">Lease transfer</option>
            <option value="room_replacement">Room replacement</option>
            <option value="temporary_sublet">Temporary sublet</option>
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="consentStatus">Consent status</label>
          <select id="consentStatus" name="consentStatus" defaultValue="approved">
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="not_started">Not started</option>
          </select>
        </div>
      </div>
      <input type="hidden" name="housingType" value="private_rental" />
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="rentPerWeek">Rent per week</label>
          <input id="rentPerWeek" name="rentPerWeek" type="number" defaultValue="510" required />
        </div>
        <div className="form-field">
          <label htmlFor="bondAmount">Bond</label>
          <input id="bondAmount" name="bondAmount" type="number" defaultValue="2040" required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="bedrooms">Bedrooms</label>
          <input id="bedrooms" name="bedrooms" type="number" defaultValue="1" required />
        </div>
        <div className="form-field">
          <label htmlFor="bathrooms">Bathrooms</label>
          <input id="bathrooms" name="bathrooms" type="number" defaultValue="1" required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="availableFrom">Available from</label>
          <input id="availableFrom" name="availableFrom" type="date" defaultValue="2026-08-01" required />
        </div>
        <div className="form-field">
          <label htmlFor="leaseEnds">Lease ends</label>
          <input id="leaseEnds" name="leaseEnds" type="date" defaultValue="2027-02-01" required />
        </div>
      </div>
      <div className="form-field">
        <label htmlFor="imageUrl">Image URL</label>
        <input
          id="imageUrl"
          name="imageUrl"
          type="url"
          value={imageUrl}
          onChange={(event) => {
            setImageUrl(event.target.value);
            setImageLoadError(false);
            setMessage("");
          }}
          aria-describedby="imageUrl-help imageUrl-preview-status"
          required
        />
        <p id="imageUrl-help" className="field-help">
          Use a public photo URL from the listing, inspection gallery, or a trusted image host.
        </p>
        <div className={`image-preview ${imagePreview.status}`} aria-live="polite">
          {imagePreview.status === "ready" ? (
            // eslint-disable-next-line @next/next/no-img-element -- User-supplied preview URLs are shown before they are saved or allow-listed for Next Image.
            <img
              src={imagePreview.url}
              alt="Listing preview"
              onLoad={() => setImageLoadError(false)}
              onError={() => setImageLoadError(true)}
            />
          ) : imagePreview.status === "error" ? (
            <>
              <ImageIcon size={28} />
              <span>Preview unavailable</span>
            </>
          ) : (
            <>
              <ImageIcon size={28} />
              <span>Image preview</span>
            </>
          )}
        </div>
        <p id="imageUrl-preview-status" className={`preview-status ${imagePreview.status}`}>
          {imagePreview.message}
        </p>
      </div>
      <div className="form-field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          defaultValue="A clean lease transfer listing with inspection availability, transport access, and consent already discussed."
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="highlights">Highlights</label>
        <textarea id="highlights" name="highlights" defaultValue={"Written consent received\nClose to tram\nFlexible inspection"} />
      </div>
      <div className="check-grid">
        {[
          ["hasWrittenConsent", "Written consent"],
          ["bondTransferDiscussed", "Bond discussed"],
          ["agentOrLandlordAware", "Provider aware"],
          ["newRenterAddedToLease", "New renter step ready"],
          ["understandsSubletRisk", "Risk acknowledged"],
        ].map(([name, label]) => (
          <label key={name}>
            <input type="checkbox" name={name} defaultChecked /> {label}
          </label>
        ))}
      </div>
      <button className="primary-button" type="submit">
        <PlusCircle size={18} />
        Create listing
      </button>
      {message ? <div className="notice">{message}</div> : null}
    </form>
  );
}
