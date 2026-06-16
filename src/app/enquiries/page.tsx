import { CheckCircle2, Clock, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAuthenticatedUser } from "@/lib/server/auth";
import { listEnquiriesForEmail } from "@/lib/server/enquiry-service";

export const dynamic = "force-dynamic";

export default async function EnquiriesPage() {
  const user = await getCurrentAuthenticatedUser();

  if (!user) {
    redirect("/login?next=/enquiries");
  }

  const enquiries = await listEnquiriesForEmail(user.email);

  return (
    <main className="section">
      <Link className="secondary-button" href="/marketplace#listings">Back to marketplace</Link>
      <div className="dashboard-hero">
        <div>
          <span className="eyebrow">Your enquiries</span>
          <h1>Messages you&apos;ve sent</h1>
          <p className="muted">Track the lease transfers you&apos;ve contacted and any replies from listers.</p>
        </div>
      </div>

      {enquiries.length === 0 ? (
        <div className="empty-state">
          <strong>No enquiries yet</strong>
          <p className="muted">Browse the marketplace and message a lister to start a conversation.</p>
          <Link className="primary-button compact-button" href="/marketplace#listings">Browse listings</Link>
        </div>
      ) : (
        <div className="table-list">
          {enquiries.map((enquiry) => (
            <article className="detail-panel enquiry-history-card" key={enquiry.id}>
              <div className="enquiry-history-head">
                <Link className="enquiry-history-thumb" href={`/listings/${enquiry.listing.slug}`}>
                  <Image src={enquiry.listing.imageUrl} alt={enquiry.listing.title} width={120} height={90} />
                </Link>
                <div className="enquiry-history-meta">
                  <Link href={`/listings/${enquiry.listing.slug}`}>
                    <h2>{enquiry.listing.title}</h2>
                  </Link>
                  <p className="muted">
                    <MapPin size={14} aria-hidden="true" /> {enquiry.listing.suburb}, {enquiry.listing.state}
                  </p>
                  <span className="muted">Sent {formatDate(enquiry.createdAt)}</span>
                </div>
                {enquiry.status === "RESPONDED" ? (
                  <span className="badge ready inbox-status-badge">
                    <CheckCircle2 size={13} />
                    Replied
                  </span>
                ) : (
                  <span className="badge pending inbox-status-badge">
                    <Clock size={13} />
                    Awaiting reply
                  </span>
                )}
              </div>

              <div className="inbox-item">
                <span className="muted">Your message</span>
                <p>{enquiry.message}</p>
              </div>

              {enquiry.replyText ? (
                <div className="inbox-reply">
                  <span className="muted">Lister replied</span>
                  <p>{enquiry.replyText}</p>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
