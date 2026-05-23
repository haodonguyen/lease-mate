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
      <div className="dashboard-hero">
        <div>
          <span className="eyebrow">Owner dashboard</span>
          <h1>Welcome back, {user.name}</h1>
          <p className="muted">Manage your Australian lease transfers and renter enquiries.</p>
        </div>
        <Link className="primary-button compact-button" href="/listings/new">Create new listing</Link>
      </div>
      <div className="dashboard-grid">
        <div className="stat-pill"><strong>{listings.length.toString().padStart(2, "0")}</strong><span>active listings</span></div>
        <div className="stat-pill"><strong>{analytics.enquiries}</strong><span>total enquiries</span></div>
        <div className="stat-pill"><strong>{analytics.views}</strong><span>total views</span></div>
        <div className="stat-pill dark-stat"><strong>{analytics.saves}</strong><span>market strength</span></div>
      </div>
      <div className="section-heading-row dashboard-workflow-heading">
        <div>
          <span className="eyebrow">Owner workflow</span>
          <h2>Review, edit, and manage listing visibility</h2>
          <p className="muted">Keep lease details current before sharing the page back into rental groups.</p>
        </div>
        <Link className="primary-button compact-button" href="/listings/new">New listing</Link>
      </div>
      <div className="transfer-workflow">
        {[
          ["1. Consent", "Landlord has provided written consent for transfer.", "complete"],
          ["2. Documents", "Incoming renter details and transfer paperwork are ready.", "progress"],
          ["3. Completion", "Keys, bond, and final inventory handover.", "pending"],
        ].map(([title, body, state]) => (
          <div className={`workflow-card ${state}`} key={title}>
            <strong>{title}</strong>
            <p>{body}</p>
          </div>
        ))}
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
