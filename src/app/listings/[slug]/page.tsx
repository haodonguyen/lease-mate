import { ArrowLeft, Calendar, CheckCircle2, FileText, MapPin, MessageSquare, ShieldAlert, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EnquiryForm } from "./enquiry-form";
import { ListingActions } from "@/components/listing-actions";
import { formatListingType, getListingReadiness } from "@/lib/listings";
import { listingRecordToLeaseListing } from "@/lib/listing-view";
import { getCurrentAuthenticatedUser } from "@/lib/server/auth";
import { getListingBySlugFromDb } from "@/lib/server/listing-service";
import { trackEvent } from "@/lib/server/analytics-service";

export const dynamic = "force-dynamic";

export default async function ListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const record = await getListingBySlugFromDb(slug);

  if (!record) {
    notFound();
  }

  await trackEvent({ name: "listing_view", listingId: record.id, metadata: { suburb: record.suburb } });
  const authenticatedUser = await getCurrentAuthenticatedUser();
  const savedListing = authenticatedUser
    ? record.savedBy.find((saved) => saved.userId === authenticatedUser.id)
    : null;
  const listing = listingRecordToLeaseListing(record);
  const readiness = getListingReadiness(listing);
  const badgeClass =
    readiness.visibilityLabel === "Ready to transfer"
      ? "ready"
      : readiness.visibilityLabel === "Consent pending"
        ? "pending"
        : "caution";

  return (
    <main className="page-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link className="secondary-button" href="/">
            <ArrowLeft size={18} />
            Back to listings
          </Link>
          <Link className="brand" href="/">
            <span className="brand-mark">
              <Image src="/leasemate-mark.svg" alt="" width={38} height={38} priority />
            </span>
            <span>LeaseMate</span>
          </Link>
        </div>
      </header>

      <section className="detail-hero elevated-detail">
        <div className="detail-main">
          <div className="detail-gallery">
            <Image
              className="detail-image"
              src={listing.imageUrl}
              alt={listing.title}
              width={1200}
              height={675}
              priority
            />
            <Image
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=700&q=80"
              alt="Kitchen preview"
              width={560}
              height={360}
            />
            <Image
              src="https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=700&q=80"
              alt="Bedroom preview"
              width={560}
              height={360}
            />
          </div>

          <div className="detail-content">
            <div className="detail-topline">
              <span className={`badge ${badgeClass}`}>
                <ShieldCheck size={14} />
                {readiness.visibilityLabel}
              </span>
              <span className="muted">{formatListingType(listing.listingType)}</span>
            </div>

            <div>
              <h1>{listing.title}</h1>
              <p>
                <MapPin size={15} aria-hidden="true" /> {listing.suburb}, {listing.state}{" "}
                {listing.postcode}
              </p>
            </div>

            <div className="verification-panel">
              <ShieldCheck size={22} />
              <div>
                <strong>Lease authenticity verified</strong>
                <p>
                  Proof of consent, transfer readiness, and key lease dates are visible before enquiry.
                </p>
              </div>
            </div>

            <div className="meta-grid">
              <div className="meta-item">
                <strong>${listing.rentPerWeek}</strong>
                <span>weekly rent</span>
              </div>
              <div className="meta-item">
                <strong>${listing.bondAmount}</strong>
                <span>bond</span>
              </div>
              <div className="meta-item">
                <strong>{formatDate(listing.availableFrom)}</strong>
                <span>available</span>
              </div>
              <div className="meta-item">
                <strong>{readiness.score}%</strong>
                <span>readiness score</span>
              </div>
            </div>

            <p>{listing.description}</p>

            <div className="detail-panel">
              <h2>Transfer readiness</h2>
              <ul className="checklist">
                {listing.highlights.map((highlight) => (
                  <li key={highlight}>
                    <CheckCircle2 size={18} />
                    <span>{highlight}</span>
                  </li>
                ))}
                <li>
                  <Calendar size={18} />
                  <span>
                    Available from {formatDate(listing.availableFrom)} until lease end{" "}
                    {formatDate(listing.leaseEnds)}.
                  </span>
                </li>
              </ul>

              {readiness.warnings.length > 0 ? (
                <div className="warning-list">
                  {readiness.warnings.map((warning) => (
                    <div className="warning" key={warning.code}>
                      <ShieldAlert size={16} aria-hidden="true" /> {warning.message}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <aside className="detail-sidebar">
          <div className="enquiry-card">
            <h2>Enquire now</h2>
            <p>
              Direct message the current renter. {listing.lister.responseTime}.
            </p>
            <EnquiryForm listingSlug={listing.slug} listingTitle={listing.title} />
            <div className="action-stack">
              <a className="primary-button" href="#enquiry-form">
                <MessageSquare size={17} />
                Message renter
              </a>
              <a className="secondary-button" href="#enquiry-form">
                <FileText size={17} />
                Request documents
              </a>
            </div>
            <ListingActions
              listingSlug={listing.slug}
              listingId={listing.id}
              isAuthenticated={Boolean(authenticatedUser)}
              isSaved={Boolean(savedListing)}
            />
            <div className="notice">
              LeaseMate does not handle rent, bond, legal approval, or payments in this MVP.
              Renters should confirm written consent through the official rental provider process.
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}
