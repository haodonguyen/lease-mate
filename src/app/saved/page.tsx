import { Calendar, Home, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SavedListingControls } from "@/components/saved-listing-controls";
import { listingRecordToLeaseListing } from "@/lib/listing-view";
import { getListingReadiness } from "@/lib/listings";
import { formatSavedListingStatus } from "@/lib/saved-listings";
import { getCurrentAuthenticatedUser } from "@/lib/server/auth";
import { listSavedListings } from "@/lib/server/social-service";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const user = await getCurrentAuthenticatedUser();

  if (!user) {
    redirect("/login?next=/saved");
  }

  const saved = await listSavedListings(user.id);

  return (
    <main className="section">
      <Link className="secondary-button" href="/">Back to marketplace</Link>
      <div className="page-heading">
        <span className="eyebrow">Renter shortlist</span>
        <h1>Saved listings</h1>
        <p className="muted">Homes you have saved to your LeaseMate account.</p>
      </div>
      <div className="saved-list">
        {saved.map((item) => {
          const listing = listingRecordToLeaseListing(item.listing);
          const readiness = getListingReadiness(listing);
          const statusClass = item.shortlistStatus.toLowerCase();
          return (
            <article className="saved-listing-card" key={item.id}>
              <Link className="saved-card-media" href={`/listings/${listing.slug}`} aria-label={`View ${listing.title}`}>
                <Image src={listing.imageUrl} alt={listing.title} width={760} height={560} />
              </Link>
              <div className="saved-card-content">
                <div className="card-topline">
                  <span className="badge ready">{readiness.visibilityLabel}</span>
                  <span className={`status-dot ${statusClass}`}>
                    {formatSavedListingStatus(item.shortlistStatus)}
                  </span>
                </div>
                <div>
                  <h2>{listing.title}</h2>
                  <p>
                    <MapPin size={15} /> {listing.suburb}, {listing.state} {listing.postcode}
                  </p>
                </div>
                <div className="meta-grid saved-meta-grid">
                  <div className="meta-item">
                    <strong>${listing.rentPerWeek}</strong>
                    <span>per week</span>
                  </div>
                  <div className="meta-item">
                    <strong>{readiness.score}%</strong>
                    <span>ready</span>
                  </div>
                  <div className="meta-item">
                    <strong>{formatDate(listing.availableFrom)}</strong>
                    <span>available</span>
                  </div>
                </div>
                <p>
                  <Home size={15} /> {listing.bedrooms} bed · {listing.bathrooms} bath
                </p>
                <p>
                  <Calendar size={15} /> Saved {formatDate(item.createdAt)}
                </p>
                <Link className="secondary-button compact-button" href={`/listings/${listing.slug}`}>View listing</Link>
              </div>
              <SavedListingControls
                savedListingId={item.id}
                initialStatus={item.shortlistStatus}
                initialNotes={item.notes ?? ""}
              />
            </article>
          );
        })}
      </div>
      {saved.length === 0 ? (
        <div className="empty-state">
          <strong>No saved listings yet</strong>
          <p className="muted">Save lease transfers from listing pages to compare them here.</p>
          <Link className="primary-button compact-button" href="/">Browse listings</Link>
        </div>
      ) : null}
    </main>
  );
}

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
