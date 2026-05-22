import {
  Bell,
  Building2,
  CalendarDays,
  ChevronRight,
  Heart,
  Home,
  Inbox,
  Search,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getListingReadiness, type LeaseListing } from "@/lib/listings";
import type { ListingWithOwner } from "@/lib/listing-view";
import type { ReactNode } from "react";

interface AuthenticatedHomeProps {
  user: {
    id: string;
    name: string;
    role: "RENTER" | "OWNER" | "ADMIN";
  };
  recommendedListings: LeaseListing[];
  savedListings: Array<{ id: string; updatedAt: Date; listing: ListingWithOwner }>;
  ownerListings: Array<{
    id: string;
    title: string;
    slug: string;
    suburb: string;
    status: string;
    enquiries: unknown[];
  }>;
}

export function AuthenticatedHome({
  user,
  recommendedListings,
  savedListings,
  ownerListings,
}: AuthenticatedHomeProps) {
  const firstName = user.name.split(" ")[0] || user.name;
  const isManager = user.role === "OWNER" || user.role === "ADMIN";
  const activeTransfer = isManager ? ownerListings[0] : savedListings[0]?.listing;
  const enquiryCount = ownerListings.reduce((total, listing) => total + listing.enquiries.length, 0);
  const savedUpdates = savedListings.length;
  const hasActiveTransfer = Boolean(activeTransfer);

  return (
    <main className="authenticated-home">
      <section className="home-welcome">
        <div>
          <span className="eyebrow">
            <ShieldCheck size={16} />
            Secure Victorian property marketplace
          </span>
          <h1>Welcome back, {firstName}</h1>
          <p>Here&apos;s what&apos;s happening with your lease search today.</p>
        </div>
        <Link className="primary-button compact-button" href={isManager ? "/dashboard" : "/saved"}>
          {isManager ? "Open dashboard" : "View saved homes"}
          <ChevronRight size={18} />
        </Link>
      </section>

      <section className="home-summary-grid" aria-label="Account summary">
        <HomeSignalCard
          icon={<Search size={18} />}
          label="Search history"
          title={savedListings[0] ? `Continue search in ${savedListings[0].listing.suburb}` : "Start a suburb search"}
          href="/marketplace#listings"
        />
        <HomeSignalCard
          icon={<Inbox size={18} />}
          label={isManager ? "Enquiries" : "Your saved shortlist"}
          title={
            isManager
              ? `${enquiryCount} ${enquiryCount === 1 ? "enquiry" : "enquiries"} across your listings`
              : savedUpdates > 0
                ? `${savedUpdates} saved ${savedUpdates === 1 ? "listing" : "listings"}`
                : "No saved listings yet"
          }
          href={isManager ? "/dashboard" : "/saved"}
        />
        <HomeSignalCard
          icon={<Bell size={18} />}
          label={isManager ? "Listing updates" : "Next action"}
          title={
            isManager
              ? `${ownerListings.length} ${ownerListings.length === 1 ? "listing" : "listings"} in your dashboard`
              : activeTransfer
                ? "Review saved transfer readiness"
                : "Browse verified listings"
          }
          href={isManager ? "/dashboard" : "/marketplace#listings"}
        />
        <div className="transfer-progress-card">
          <div className="transfer-progress-heading">
            <strong>Transfer progress</strong>
            <span>{hasActiveTransfer ? "Active" : "Not started"}</span>
          </div>
          <p>{activeTransfer ? getTransferLabel(activeTransfer) : "No active transfer yet"}</p>
          <div className="progress-step">
            {hasActiveTransfer ? "Review consent and documents" : "Save a listing to start tracking"}
          </div>
          <div className="progress-track" aria-hidden="true">
            <span />
          </div>
          <Link className="secondary-button" href={isManager ? "/dashboard" : "/saved"}>
            View documentation
          </Link>
        </div>
      </section>

      <section className="home-recommendations">
        <div className="section-heading-row">
          <div>
            <h2>Recommended for you</h2>
            <p className="muted">Based on currently available Victorian lease transfers.</p>
          </div>
          <Link className="text-link" href="/marketplace#listings">
            View all recommendations <ChevronRight size={16} />
          </Link>
        </div>
        <div className="authenticated-listing-row">
          {recommendedListings.slice(0, 3).map((listing) => (
            <AuthenticatedListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>
    </main>
  );
}

function HomeSignalCard({
  icon,
  label,
  title,
  href,
}: {
  icon: ReactNode;
  label: string;
  title: string;
  href: string;
}) {
  return (
    <Link className="home-signal-card" href={href}>
      <span>
        {icon}
        {label}
      </span>
      <strong>{title}</strong>
    </Link>
  );
}

function AuthenticatedListingCard({ listing }: { listing: LeaseListing }) {
  const readiness = getListingReadiness(listing);

  return (
    <article className="listing-card authenticated-listing-card">
      <Link className="listing-card-image" href={`/listings/${listing.slug}`} aria-label={`View ${listing.title}`}>
        <Image src={listing.imageUrl} alt={listing.title} width={760} height={560} />
        <span className="floating-badge ready">{readiness.visibilityLabel}</span>
      </Link>
      <div className="listing-card-body">
        <h2>${listing.rentPerWeek} pw</h2>
        <h3>{listing.suburb}, VIC {listing.postcode}</h3>
        <div className="listing-card-summary">
          <span><Building2 size={15} /> {listing.bedrooms}</span>
          <span><Home size={15} /> {listing.bathrooms}</span>
          <span><CalendarDays size={15} /> {formatMonth(listing.leaseEnds)}</span>
        </div>
        <div className="card-actions-row">
          <Link className="secondary-button compact-button" href={`/listings/${listing.slug}`}>Open</Link>
          <Link className="icon-save-link" href="/saved" aria-label="Open saved listings">
            <Heart size={18} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function getTransferLabel(
  transfer:
    | ListingWithOwner
    | {
        title: string;
        suburb: string;
      },
) {
  return `${transfer.title}, ${transfer.suburb}`;
}

function formatMonth(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    month: "short",
  }).format(new Date(value));
}
