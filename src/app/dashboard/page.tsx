import Link from "next/link";
import { ListingStatusButton } from "@/components/dashboard-controls";
import { canManageListings, getCurrentUser } from "@/lib/server/auth";
import { getAnalyticsSummary } from "@/lib/server/analytics-service";
import { listOwnerListings } from "@/lib/server/listing-service";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user || !canManageListings(user.role)) {
    return (
      <main className="section">
        <Link className="secondary-button" href="/">Back to marketplace</Link>
        <div className="notice">Switch to Owner or Admin role to view the listing dashboard.</div>
      </main>
    );
  }

  const [listings, analytics] = await Promise.all([
    listOwnerListings(user.id),
    getAnalyticsSummary(),
  ]);

  return (
    <main className="section">
      <Link className="secondary-button" href="/">Back to marketplace</Link>
      <div className="page-heading">
        <span className="eyebrow">Owner dashboard</span>
        <h1>Manage listings and enquiries</h1>
        <p className="muted">Signed in as {user.name} ({user.role}).</p>
      </div>
      <div className="stat-row">
        <div className="stat-pill"><strong>{listings.length}</strong><span>your listings</span></div>
        <div className="stat-pill"><strong>{analytics.enquiries}</strong><span>total enquiries</span></div>
        <div className="stat-pill"><strong>{analytics.saves}</strong><span>saves</span></div>
      </div>
      <div className="table-list">
        {listings.map((listing) => (
          <article className="detail-panel" key={listing.id}>
            <div className="split-row">
              <div>
                <h2>{listing.title}</h2>
                <p className="muted">{listing.suburb} · {listing.status} · {listing.enquiries.length} enquiries · {listing.reports.length} reports</p>
              </div>
              <div className="action-stack horizontal">
                <Link className="secondary-button" href={`/listings/${listing.slug}`}>Open</Link>
                <ListingStatusButton listingId={listing.id} nextStatus={listing.status === "PUBLISHED" ? "PAUSED" : "PUBLISHED"} />
              </div>
            </div>
            {listing.enquiries.slice(0, 3).map((enquiry) => (
              <div className="inbox-item" key={enquiry.id}>
                <strong>{enquiry.name}</strong>
                <span>{enquiry.email}</span>
                <p>{enquiry.message}</p>
              </div>
            ))}
          </article>
        ))}
      </div>
    </main>
  );
}
