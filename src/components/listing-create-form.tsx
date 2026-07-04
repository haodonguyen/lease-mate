"use client";

import { ImageIcon, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getListingImagePreviewState } from "@/lib/image-preview";
import { UploadButton } from "@/lib/uploadthing";

const defaultImageUrl = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80";

interface UploadedListingPhoto {
  url: string;
  storageKey?: string;
  name?: string;
  size?: number;
}

export interface ListingFormValues {
  title: string;
  suburb: string;
  state: "ACT" | "NSW" | "NT" | "QLD" | "SA" | "TAS" | "VIC" | "WA";
  postcode: string;
  listingType: "lease_transfer" | "temporary_sublet" | "room_replacement";
  consentStatus: "approved" | "pending" | "not_started";
  housingType: "private_rental" | "student_accommodation" | "share_house";
  rentPerWeek: number;
  bondAmount: number;
  bedrooms: number;
  bathrooms: number;
  availableFrom: string;
  leaseEnds: string;
  imageUrl: string;
  uploadedPhotos?: UploadedListingPhoto[];
  description: string;
  highlights: string;
  hasWrittenConsent: boolean;
  bondTransferDiscussed: boolean;
  agentOrLandlordAware: boolean;
  newRenterAddedToLease: boolean;
  understandsSubletRisk: boolean;
}

const defaultValues: ListingFormValues = {
  title: "Carlton lease transfer near tram",
  suburb: "Carlton",
  state: "VIC",
  postcode: "3053",
  listingType: "lease_transfer",
  consentStatus: "approved",
  housingType: "private_rental",
  rentPerWeek: 510,
  bondAmount: 2040,
  bedrooms: 1,
  bathrooms: 1,
  availableFrom: "2026-08-01",
  leaseEnds: "2027-02-01",
  imageUrl: defaultImageUrl,
  description: "A clean lease transfer listing with inspection availability, transport access, and consent already discussed.",
  highlights: "Written consent received\nClose to tram\nFlexible inspection",
  hasWrittenConsent: true,
  bondTransferDiscussed: true,
  agentOrLandlordAware: true,
  newRenterAddedToLease: true,
  understandsSubletRisk: true,
};

interface ListingCreateFormProps {
  mode?: "create" | "edit";
  listingId?: string;
  initialValues?: ListingFormValues;
}

export function ListingCreateForm({ mode = "create", listingId, initialValues = defaultValues }: ListingCreateFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedListingPhoto[]>(initialValues.uploadedPhotos ?? []);
  const [imageUrl, setImageUrl] = useState(initialValues.imageUrl);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const coverImageUrl = uploadedPhotos[0]?.url ?? imageUrl;
  const imagePreview = getListingImagePreviewState(coverImageUrl, imageLoadError);
  const isEditMode = mode === "edit";

  async function submitListing(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (imagePreview.status === "empty" || imagePreview.status === "invalid" || imagePreview.status === "error") {
      setMessage(imagePreview.message);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      setIsSubmitting(true);
      setMessage("");

      const response = await fetch(isEditMode ? `/api/listings/${listingId}` : "/api/listings", {
        method: isEditMode ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok || !result.ok) {
        setMessage(
          isEditMode
            ? "Could not update listing. Check required details and your account access."
            : "Could not create listing. Check required details and your account access.",
        );
        return;
      }

      router.push(`/listings/${result.listing.slug}`);
      router.refresh();
    } catch {
      setMessage(
        isEditMode
          ? "Could not update listing. Please try again."
          : "Could not create listing. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form-grid wide-form listing-workflow-form" onSubmit={submitListing}>
      <fieldset className="form-section">
        <legend>Property basics</legend>
        <div className="form-field">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" defaultValue={initialValues.title} required />
        </div>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="suburb">Suburb</label>
            <input id="suburb" name="suburb" defaultValue={initialValues.suburb} required />
          </div>
          <div className="form-field">
            <label htmlFor="state">State or territory</label>
            <select id="state" name="state" defaultValue={initialValues.state}>
              <option value="ACT">ACT</option>
              <option value="NSW">NSW</option>
              <option value="NT">NT</option>
              <option value="QLD">QLD</option>
              <option value="SA">SA</option>
              <option value="TAS">TAS</option>
              <option value="VIC">VIC</option>
              <option value="WA">WA</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="postcode">Postcode</label>
            <input id="postcode" name="postcode" defaultValue={initialValues.postcode} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="listingType">Listing type</label>
            <select id="listingType" name="listingType" defaultValue={initialValues.listingType}>
              <option value="lease_transfer">Lease transfer</option>
              <option value="room_replacement">Room replacement</option>
              <option value="temporary_sublet">Temporary sublet</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="housingType">Housing type</label>
            <select id="housingType" name="housingType" defaultValue={initialValues.housingType}>
              <option value="private_rental">Private rental</option>
              <option value="share_house">Share house</option>
              <option value="student_accommodation">Student accommodation</option>
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>Lease terms</legend>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="rentPerWeek">Rent per week</label>
            <input id="rentPerWeek" name="rentPerWeek" type="number" defaultValue={initialValues.rentPerWeek} required />
          </div>
          <div className="form-field">
            <label htmlFor="bondAmount">Bond</label>
            <input id="bondAmount" name="bondAmount" type="number" defaultValue={initialValues.bondAmount} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="bedrooms">Bedrooms</label>
            <input id="bedrooms" name="bedrooms" type="number" defaultValue={initialValues.bedrooms} required />
          </div>
          <div className="form-field">
            <label htmlFor="bathrooms">Bathrooms</label>
            <input id="bathrooms" name="bathrooms" type="number" defaultValue={initialValues.bathrooms} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="availableFrom">Available from</label>
            <input id="availableFrom" name="availableFrom" type="date" defaultValue={initialValues.availableFrom} required />
          </div>
          <div className="form-field">
            <label htmlFor="leaseEnds">Lease ends</label>
            <input id="leaseEnds" name="leaseEnds" type="date" defaultValue={initialValues.leaseEnds} required />
          </div>
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>Photo and description</legend>
      <div className="form-field">
        <label>Listing photos</label>
        <div className="upload-panel">
          <UploadButton
            endpoint="listingPhotos"
            onClientUploadComplete={(files) => {
              const nextPhotos = files.map((file) => ({
                url: file.serverData?.url ?? file.ufsUrl,
                storageKey: file.serverData?.key ?? file.key,
                name: file.serverData?.name ?? file.name,
                size: file.serverData?.size ?? file.size,
              }));
              setUploadedPhotos((currentPhotos) => [...currentPhotos, ...nextPhotos].slice(0, 8));
              setImageLoadError(false);
              setUploadMessage(`${nextPhotos.length} ${nextPhotos.length === 1 ? "photo" : "photos"} uploaded.`);
              setMessage("");
            }}
            onUploadError={(error) => {
              setUploadMessage(error.message || "Could not upload photos. Please try again.");
            }}
            appearance={{
              container: "uploadthing-container",
              button: "secondary-button uploadthing-button",
              allowedContent: "field-help",
            }}
            content={{
              button: "Upload photos",
              allowedContent: "Images only, up to 8 files, 4MB each",
            }}
          />
          {uploadMessage ? <p className="field-help">{uploadMessage}</p> : null}
        </div>
        <input type="hidden" name="uploadedPhotos" value={JSON.stringify(uploadedPhotos)} />
        <input type="hidden" name="imageUrl" value={coverImageUrl} />
        {uploadedPhotos.length > 0 ? (
          <div className="uploaded-photo-grid" aria-label="Uploaded listing photos">
            {uploadedPhotos.map((photo, index) => (
              <div className="uploaded-photo-card" key={`${photo.storageKey ?? photo.url}-${index}`}>
                {/* eslint-disable-next-line @next/next/no-img-element -- UploadThing returns immediately previewable URLs for newly selected files. */}
                <img src={photo.url} alt={`${initialValues.title || "Listing"} upload ${index + 1}`} />
                <button
                  className="text-link"
                  type="button"
                  onClick={() => {
                    setUploadedPhotos((currentPhotos) => currentPhotos.filter((_, photoIndex) => photoIndex !== index));
                    setImageLoadError(false);
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <div className="form-field">
        <label htmlFor="imageUrlFallback">Fallback image URL</label>
        <input
          id="imageUrlFallback"
          type="url"
          value={imageUrl}
          onChange={(event) => {
            setImageUrl(event.target.value);
            if (uploadedPhotos.length > 0) {
              setUploadedPhotos([]);
            }
            setImageLoadError(false);
            setMessage("");
          }}
          aria-describedby="imageUrl-help imageUrl-preview-status"
          placeholder="https://example.com/photo.jpg"
        />
        <p id="imageUrl-help" className="field-help">
          Upload photos for your listing. A public image URL can still be used as a fallback for migrated listings.
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
          defaultValue={initialValues.description}
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="highlights">Highlights</label>
        <textarea id="highlights" name="highlights" defaultValue={initialValues.highlights} />
      </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>Readiness checklist</legend>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="consentStatus">Consent status</label>
            <select id="consentStatus" name="consentStatus" defaultValue={initialValues.consentStatus}>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="not_started">Not started</option>
            </select>
          </div>
        </div>
        <div className="check-grid">
          {[
            { name: "hasWrittenConsent", label: "Written consent", checked: initialValues.hasWrittenConsent },
            { name: "bondTransferDiscussed", label: "Bond discussed", checked: initialValues.bondTransferDiscussed },
            { name: "agentOrLandlordAware", label: "Provider aware", checked: initialValues.agentOrLandlordAware },
            { name: "newRenterAddedToLease", label: "New renter step ready", checked: initialValues.newRenterAddedToLease },
            { name: "understandsSubletRisk", label: "Risk acknowledged", checked: initialValues.understandsSubletRisk },
          ].map(({ name, label, checked }) => (
            <label key={name}>
              <input type="checkbox" name={name} defaultChecked={checked} /> {label}
            </label>
          ))}
        </div>
      </fieldset>
      <button className="primary-button" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? <span className="button-spinner" aria-hidden="true" /> : <PlusCircle size={18} />}
        {isSubmitting ? (isEditMode ? "Saving changes" : "Creating listing") : isEditMode ? "Save changes" : "Create listing"}
      </button>
      {message ? <div className="notice">{message}</div> : null}
    </form>
  );
}
