import Link from "next/link";
import { redirect } from "next/navigation";
import { ListingStatusButton } from "@/components/dashboard-controls";
import { canManageListings, getCurrentAuthenticatedUser } from "@/lib/server/auth";
import { getAnalyticsSummary } from "@/lib/server/analytics-service";
import { listOwnerListings } from "@/lib/server/listing-service";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentAuthenticatedUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  if (!canManageListings(user.role)) {
    return (
      <main className="section">
        <Link className="secondary-button" href="/">Back to marketplace</Link>
        <div className="notice">Use an Owner or Admin account to view the listing dashboard.</div>
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
      <div className="section-heading-row dashboard-workflow-heading">
        <div>
          <span className="eyebrow">Owner workflow</span>
          <h2>Review, edit, and manage listing visibility</h2>
          <p className="muted">Keep lease details current before sharing the page back into rental groups.</p>
        </div>
        <Link className="primary-button compact-button" href="/listings/new">New listing</Link>
      </div>
      <div className="table-list">
        {listings.map((listing) => (
          <article className="detail-panel listing-management-card" key={listing.id}>
            <div className="split-row">
              <div>
                <span className={`status-dot ${listing.status.toLowerCase()}`}>{listing.status.toLowerCase()}</span>
                <h2>{listing.title}</h2>
                <p className="muted">{listing.suburb} · {listing.status} · {listing.enquiries.length} enquiries · {listing.reports.length} reports</p>
              </div>
              <div className="action-stack horizontal">
                <Link className="secondary-button" href={`/listings/${listing.slug}`}>Open</Link>
                <Link className="secondary-button" href={`/listings/${listing.slug}/edit`}>Edit</Link>
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
            {listing.enquiries.length === 0 ? (
              <p className="muted listing-card-note">No enquiries yet. Improve the listing details and share the public page.</p>
            ) : null}
          </article>
        ))}
        {listings.length === 0 ? (
          <div className="empty-state">
            <strong>No listings yet</strong>
            <p className="muted">Create your first lease transfer listing to start collecting enquiries.</p>
            <Link className="primary-button compact-button" href="/listings/new">Create listing</Link>
          </div>
        ) : null}
      </div>
    </main>
  );
}
