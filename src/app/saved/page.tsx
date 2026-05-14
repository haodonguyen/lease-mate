import Link from "next/link";
import { listingRecordToLeaseListing } from "@/lib/listing-view";
import { getListingReadiness } from "@/lib/listings";
import { getCurrentUser } from "@/lib/server/auth";
import { listSavedListings } from "@/lib/server/social-service";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const user = await getCurrentUser();
  const saved = user ? await listSavedListings(user.id) : [];

  return (
    <main className="section">
      <Link className="secondary-button" href="/">Back to marketplace</Link>
      <div className="page-heading">
        <span className="eyebrow">Renter shortlist</span>
        <h1>Saved listings</h1>
        <p className="muted">Persisted saved listings for the current demo renter.</p>
      </div>
      <div className="listing-grid">
        {saved.map((item) => {
          const listing = listingRecordToLeaseListing(item.listing);
          const readiness = getListingReadiness(listing);
          return (
            <article className="listing-card" key={item.id}>
              <div className="listing-card-body">
                <span className="badge ready">{readiness.visibilityLabel}</span>
                <h2>{listing.title}</h2>
                <p>{listing.suburb}, VIC · ${listing.rentPerWeek}/week</p>
                <Link className="secondary-button" href={`/listings/${listing.slug}`}>View listing</Link>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
