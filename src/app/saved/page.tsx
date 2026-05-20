import Link from "next/link";
import { redirect } from "next/navigation";
import { listingRecordToLeaseListing } from "@/lib/listing-view";
import { getListingReadiness } from "@/lib/listings";
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
