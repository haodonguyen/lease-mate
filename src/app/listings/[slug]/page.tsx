import type { Metadata } from "next";
import { ArrowLeft, Calendar, CheckCircle2, FileText, MapPin, MessageSquare, ShieldAlert, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EnquiryForm } from "./enquiry-form";
import { ListingActions } from "@/components/listing-actions";
import { ListingGallery } from "@/components/listing-gallery";
import { ReadinessScore } from "@/components/readiness-score";
import { formatListingType, getListingReadiness } from "@/lib/listings";
import { listingRecordToLeaseListing } from "@/lib/listing-view";
import { getCurrentAuthenticatedUser } from "@/lib/server/auth";
import { getListingBySlugFromDb } from "@/lib/server/listing-service";
import { trackEvent } from "@/lib/server/analytics-service";

export const dynamic = "force-dynamic";

function getAppBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const record = await getListingBySlugFromDb(slug);

  if (!record) {
    return { title: "Listing not found — LeaseMate" };
  }

  const listing = listingRecordToLeaseListing(record);
  const imageUrl = listing.photos?.[0]?.url ?? listing.imageUrl;
  const title = `${listing.title} — LeaseMate`;
  const description = `${formatListingType(listing.listingType)} in ${listing.suburb}, ${listing.state} ${listing.postcode}. $${listing.rentPerWeek}/week, available from ${formatDate(listing.availableFrom)}.`;
  const canonical = `${getAppBaseUrl()}/listings/${listing.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      siteName: "LeaseMate",
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 675, alt: listing.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

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

  const authenticatedUser = await getCurrentAuthenticatedUser();

  // Removed listings are hidden from the public, but the owner and admins can still view them.
  if (record.status === "REMOVED") {
    const canView =
      authenticatedUser?.role === "ADMIN" || authenticatedUser?.id === record.ownerId;
    if (!canView) {
      notFound();
    }
  }

  await trackEvent({ name: "listing_view", listingId: record.id, metadata: { suburb: record.suburb } });
  const savedListing = authenticatedUser
    ? record.savedBy.find((saved) => saved.userId === authenticatedUser.id)
    : null;
  const listing = listingRecordToLeaseListing(record);
  const galleryPhotos = listing.photos?.length ? listing.photos : [{ url: listing.imageUrl, alt: listing.title, sortOrder: 0 }];
  const readiness = getListingReadiness(listing);
  const listingFeatureTags = [
    listing.genderPreference === "female"
      ? "Female only"
      : listing.genderPreference === "male"
        ? "Male only"
        : null,
    listing.furnished ? "Furnished" : "Unfurnished",
    listing.billsIncluded ? "Bills included" : null,
    listing.datesFlexible ? "Dates flexible" : null,
  ].filter((tag): tag is string => Boolean(tag));
  const badgeClass =
    readiness.visibilityLabel === "Ready to transfer"
      ? "ready"
      : readiness.visibilityLabel === "Consent pending"
        ? "pending"
        : "caution";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.title,
    description: listing.description,
    url: `${getAppBaseUrl()}/listings/${listing.slug}`,
    image: galleryPhotos.map((photo) => photo.url),
    datePosted: listing.availableFrom,
    address: {
      "@type": "PostalAddress",
      addressLocality: listing.suburb,
      addressRegion: listing.state,
      postalCode: listing.postcode,
      addressCountry: "AU",
    },
    offers: {
      "@type": "Offer",
      price: listing.rentPerWeek,
      priceCurrency: "AUD",
      availability: "https://schema.org/InStock",
      availabilityStarts: listing.availableFrom,
    },
    numberOfBedrooms: listing.bedrooms,
    numberOfBathroomsTotal: listing.bathrooms,
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="detail-back-row">
        <Link className="detail-back" href="/marketplace#listings">
          <ArrowLeft size={16} />
          Back to listings
        </Link>
      </div>

      <section className="detail-hero elevated-detail">
        <div className="detail-main">
          <ListingGallery
            photos={galleryPhotos.map((photo) => ({ url: photo.url, alt: photo.alt }))}
            title={listing.title}
          />

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
                <MapPin size={15} aria-hidden="true" /> {listing.buildingName ? `${listing.buildingName}, ` : ""}
                {listing.suburb}, {listing.state} {listing.postcode}
              </p>
              {listingFeatureTags.length > 0 ? (
                <ul className="detail-tags">
                  {listingFeatureTags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              ) : null}
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
                <ReadinessScore score={readiness.score} variant="meta" />
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
