"use client";

import { CalendarDays, Home, MapPin, Search, ShieldCheck, SlidersHorizontal, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  formatListingType,
  getListingReadiness,
  type LeaseListing,
} from "@/lib/listings";

interface MarketplaceProps {
  listings: LeaseListing[];
  analytics?: {
    views: number;
    enquiries: number;
    saves: number;
    reports: number;
    waitlist: number;
  };
}

export function Marketplace({ listings, analytics }: MarketplaceProps) {
  const [query, setQuery] = useState("");
  const [listingType, setListingType] = useState("all");
  const [readiness, setReadiness] = useState("all");
  const hasActiveFilters = query.trim() !== "" || listingType !== "all" || readiness !== "all";

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const listingReadiness = getListingReadiness(listing);
      const searchText = `${listing.title} ${listing.suburb} ${listing.postcode}`.toLowerCase();
      const matchesQuery = searchText.includes(query.toLowerCase().trim());
      const matchesType = listingType === "all" || listing.listingType === listingType;
      const matchesReadiness =
        readiness === "all" || listingReadiness.visibilityLabel === readiness;

      return matchesQuery && matchesType && matchesReadiness;
    });
  }, [listings, query, listingType, readiness]);

  function clearFilters() {
    setQuery("");
    setListingType("all");
    setReadiness("all");
  }

  return (
    <main>
      <section className="hero">
        <Image
          className="hero-background"
          src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80"
          alt=""
          width={1600}
          height={900}
          priority
        />
        <div className="hero-copy">
          <span className="eyebrow">
            <ShieldCheck size={18} />
            Victoria-first lease transfer board
          </span>
          <h1>LeaseMate</h1>
          <p>
            Structured, shareable lease-transfer listings for renters who need a
            professional alternative to messy Facebook posts and risky DMs.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" href="/listings/new">
              List a transfer
            </Link>
            <Link className="secondary-button" href="#listings">
              Browse listings
            </Link>
          </div>
          <div className="stat-row" aria-label="LeaseMate product metrics">
            <div className="stat-pill">
              <strong>{listings.length}</strong>
              <span>active listings</span>
            </div>
            <div className="stat-pill">
              <strong>{analytics?.enquiries ?? 0}</strong>
              <span>enquiries</span>
            </div>
            <div className="stat-pill">
              <strong>{analytics?.waitlist ?? 0}</strong>
              <span>waitlist</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="listings">
        <div className="section-heading-row">
          <div>
            <span className="eyebrow">
              <SlidersHorizontal size={16} />
              Marketplace
            </span>
            <h2>Find a lease transfer that is ready to inspect</h2>
            <p className="muted">
              Showing {filteredListings.length} of {listings.length} active listings.
            </p>
          </div>
          {hasActiveFilters ? (
            <button className="secondary-button compact-button" type="button" onClick={clearFilters}>
              <X size={16} />
              Clear filters
            </button>
          ) : null}
        </div>

        <div className="toolbar" aria-label="Listing filters">
          <label className="field">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search suburb, postcode, or title"
              aria-label="Search listings"
            />
          </label>

          <label className="field">
            <select
              value={listingType}
              onChange={(event) => setListingType(event.target.value)}
              aria-label="Filter by listing type"
            >
              <option value="all">All listing types</option>
              <option value="lease_transfer">Lease transfer</option>
              <option value="room_replacement">Room replacement</option>
              <option value="temporary_sublet">Temporary sublet</option>
            </select>
          </label>

          <label className="field">
            <select
              value={readiness}
              onChange={(event) => setReadiness(event.target.value)}
              aria-label="Filter by readiness"
            >
              <option value="all">All readiness</option>
              <option value="Ready to transfer">Ready to transfer</option>
              <option value="Consent pending">Consent pending</option>
              <option value="Needs caution">Needs caution</option>
            </select>
          </label>
        </div>

        {filteredListings.length > 0 ? (
          <div className="listing-grid">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <strong>No matching listings</strong>
            <p className="muted">Try a broader suburb, listing type, or readiness filter.</p>
          </div>
        )}
      </section>
    </main>
  );
}

function ListingCard({ listing }: { listing: LeaseListing }) {
  const readiness = getListingReadiness(listing);
  const badgeClass =
    readiness.visibilityLabel === "Ready to transfer"
      ? "ready"
      : readiness.visibilityLabel === "Consent pending"
        ? "pending"
        : "caution";

  return (
    <article className="listing-card">
      <Link className="listing-card-image" href={`/listings/${listing.slug}`} aria-label={`View ${listing.title}`}>
        <Image src={listing.imageUrl} alt={listing.title} width={900} height={667} />
      </Link>
      <div className="listing-card-body">
        <div className="card-topline">
          <span className={`badge ${badgeClass}`}>
            <ShieldCheck size={14} />
            {readiness.visibilityLabel}
          </span>
          <span className="muted">{formatListingType(listing.listingType)}</span>
        </div>
        <div>
          <h2>{listing.title}</h2>
          <p>
            <MapPin size={14} aria-hidden="true" /> {listing.suburb}, {listing.state}{" "}
            {listing.postcode}
          </p>
        </div>
        <div className="listing-card-summary">
          <span>
            <CalendarDays size={14} />
            From {formatShortDate(listing.availableFrom)}
          </span>
          <span>
            <Home size={14} />
            {listing.bedrooms} bed · {listing.bathrooms} bath
          </span>
        </div>
        <div className="meta-grid">
          <div className="meta-item">
            <strong>${listing.rentPerWeek}</strong>
            <span>per week</span>
          </div>
          <div className="meta-item">
            <strong>{listing.bedrooms}</strong>
            <span>bed</span>
          </div>
          <div className="meta-item">
            <strong>{readiness.score}%</strong>
            <span>ready</span>
          </div>
        </div>
        <Link className="secondary-button" href={`/listings/${listing.slug}`}>
          View listing
        </Link>
      </div>
    </article>
  );
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}
