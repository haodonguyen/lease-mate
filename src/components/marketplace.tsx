"use client";

import {
  Bath,
  BedDouble,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  Heart,
  Home,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
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
      <section className="marketplace-hero">
        <div className="marketplace-hero-copy">
          <span className="eyebrow">
            <ShieldCheck size={18} />
            Victoria-first lease transfer marketplace
          </span>
          <h1>
            Simplifying Victorian <span>Lease Transfers.</span>
          </h1>
          <p>
            The secure digital storefront for the Victorian property community. Move in
            or move on with absolute legal confidence.
          </p>
          <div className="hero-search" aria-label="Quick listing search">
            <label>
              <Search size={17} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search suburb"
                aria-label="Search suburb"
              />
            </label>
            <select
              value={listingType}
              onChange={(event) => setListingType(event.target.value)}
              aria-label="Choose listing type"
            >
              <option value="all">Whole place</option>
              <option value="lease_transfer">Lease transfer</option>
              <option value="room_replacement">Room replacement</option>
              <option value="temporary_sublet">Short stay</option>
            </select>
            <a className="primary-button" href="#listings">
              Search listings
            </a>
          </div>
          <div className="popular-row" aria-label="Popular suburbs">
            <span>Popular:</span>
            {["Fitzroy", "South Yarra", "Carlton"].map((suburb) => (
              <button key={suburb} type="button" onClick={() => setQuery(suburb)}>
                {suburb}
              </button>
            ))}
          </div>
          <div className="marketplace-proof-row" aria-label="LeaseMate traction">
            <span>{listings.length} active listings</span>
            <span>Built around Victorian rental guidance</span>
            <span>{analytics?.saves ?? 0} saved homes</span>
          </div>
        </div>

        <div className="hero-collage" aria-label="Featured lease transfer homes">
          <Image
            className="hero-collage-large"
            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80"
            alt="Bright apartment living room"
            width={720}
            height={840}
            priority
          />
          <Image
            src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80"
            alt="Modern kitchen in rental apartment"
            width={420}
            height={420}
          />
          <Image
            src="https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=600&q=80"
            alt="Melbourne terrace home"
            width={420}
            height={420}
          />
          <div className="trust-card">
            <ShieldCheck size={20} />
            <strong>100% verified</strong>
            <span>All listings show consent status, transfer readiness, and renter checks.</span>
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Trusted and regulated ecosystem">
        <span>Trusted and regulated ecosystem</span>
        <strong>Victorian rental guidance</strong>
        <strong>VCAT-aware workflow</strong>
        <strong>RTBA-ready checklist</strong>
      </section>

      <section className="landing-flow-section" id="how-it-works">
        <div className="section-heading-row">
          <div>
            <h2>The frictionless way to transfer</h2>
            <p className="muted">
              Move beyond unverified social media posts. Our structured workflow keeps
              every transfer readable, accountable, and legally aware.
            </p>
          </div>
        </div>
        <div className="flow-card-grid">
          {[
            ["1. List with ease", "Create a professional listing with documents and photos. We format it for Victorian rental standards."],
            ["2. Vetted matches", "Potential tenants are pre-vetted and communicate through structured property context."],
            ["3. Legal transfer", "Generate RTBA-compatible transfer steps and keep consent, bond, and dates visible."],
          ].map(([title, body], index) => (
            <article className={`flow-card ${index === 1 ? "featured" : ""}`} key={title}>
              <span><ClipboardCheck size={18} /></span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="listings">
        <div className="section-heading-row">
          <div>
            <span className="eyebrow">
              <SlidersHorizontal size={16} />
              Marketplace
            </span>
            <h2>{filteredListings.length} properties found in Victoria</h2>
            <p className="muted">
              Sort, compare, and shortlist rentals by readiness before you message the renter.
            </p>
          </div>
          {hasActiveFilters ? (
            <button className="secondary-button compact-button" type="button" onClick={clearFilters}>
              <X size={16} />
              Clear filters
            </button>
          ) : null}
        </div>

        <div className="marketplace-layout">
          <aside className="filter-panel" aria-label="Listing filters">
            <div className="filter-panel-heading">
              <strong>Filters</strong>
              <button type="button" onClick={clearFilters}>Reset</button>
            </div>
            <label className="field">
              <Search size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search suburb, postcode, or title"
                aria-label="Search listings"
              />
            </label>

            <label className="filter-group">
              <span>Listing type</span>
              <select
                value={listingType}
                onChange={(event) => setListingType(event.target.value)}
                aria-label="Filter by listing type"
              >
                <option value="all">All listing types</option>
                <option value="lease_transfer">Whole house</option>
                <option value="room_replacement">Room only</option>
                <option value="temporary_sublet">Temporary stay</option>
              </select>
            </label>

            <label className="filter-group">
              <span>Readiness status</span>
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
          </aside>

          {filteredListings.length > 0 ? (
            <div className="marketplace-results">
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
        </div>
      </section>

      <section className="transfer-band" id="security">
        <div>
          <span className="eyebrow">Transfer with legal confidence</span>
          <h2>Every transfer has a managed handover workflow.</h2>
          <p>
            LeaseMate keeps consent, bond, inspection, and renter communication steps visible
            so applicants know what is ready before they enquire.
          </p>
          <div className="transfer-band-points">
            <span><ShieldCheck size={16} /> Standard documentation</span>
            <span><CalendarDays size={16} /> Lease dates and availability</span>
          </div>
        </div>
        <Link className="primary-button" href="/listings/new">
          Start transfer process
          <ChevronRight size={18} />
        </Link>
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
    <article className="listing-card elevated-listing-card">
      <Link className="listing-card-image" href={`/listings/${listing.slug}`} aria-label={`View ${listing.title}`}>
        <Image src={listing.imageUrl} alt={listing.title} width={900} height={667} />
        <span className={`floating-badge ${badgeClass}`}>{readiness.visibilityLabel}</span>
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
          <h2>${listing.rentPerWeek}<span>/week</span></h2>
          <p>
            <MapPin size={14} aria-hidden="true" /> {listing.suburb}, {listing.state}{" "}
            {listing.postcode}
          </p>
          <h3>{listing.title}</h3>
        </div>
        <div className="listing-card-summary">
          <span>
            <CalendarDays size={14} />
            From {formatShortDate(listing.availableFrom)}
          </span>
          <span>
            <BedDouble size={14} />
            {listing.bedrooms}
          </span>
          <span>
            <Bath size={14} />
            {listing.bathrooms}
          </span>
          <span>
            <Home size={14} />
            {readiness.score}% ready
          </span>
        </div>
        <div className="card-actions-row">
          <Link className="secondary-button compact-button" href={`/listings/${listing.slug}`}>
            View listing
          </Link>
          <Link className="icon-save-link" href={`/listings/${listing.slug}`} aria-label={`Open ${listing.title} to save`}>
            <Heart size={18} />
          </Link>
        </div>
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
