"use client";

import { Building2, Heart, Home, MapPin, Search, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DemoRoleSwitcher } from "./auth/demo-role-switcher";
import {
  formatListingType,
  getListingReadiness,
  type LeaseListing,
} from "@/lib/listings";

interface MarketplaceProps {
  listings: LeaseListing[];
  currentUserEmail?: string;
  analytics?: {
    views: number;
    enquiries: number;
    saves: number;
    reports: number;
    waitlist: number;
  };
}

export function Marketplace({ listings, currentUserEmail, analytics }: MarketplaceProps) {
  const [query, setQuery] = useState("");
  const [listingType, setListingType] = useState("all");
  const [readiness, setReadiness] = useState("all");

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

  return (
    <main className="page-shell">
      <Header currentUserEmail={currentUserEmail} />
      <section className="hero">
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

        <div className="hero-panel">
          <Image
            src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80"
            alt="Modern rental apartment living room"
            width={1200}
            height={900}
            priority
          />
          <div className="hero-panel-footer">
            <div>
              <strong>Shareable listing pages</strong>
              <span>Designed to be posted back into groups, chats, and student communities.</span>
            </div>
            <Link className="secondary-button" href="#listings">
              Browse
            </Link>
          </div>
        </div>
      </section>

      <section className="section" id="listings">
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

function Header({ currentUserEmail }: { currentUserEmail?: string }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link href="/" className="brand" aria-label="LeaseMate home">
          <span className="brand-mark">
            <Home size={21} />
          </span>
          <span>LeaseMate</span>
        </Link>
        <nav className="nav-actions" aria-label="Primary actions">
          <DemoRoleSwitcher currentEmail={currentUserEmail} />
          <Link className="secondary-button" href="/saved">
            Saved
          </Link>
          <Link className="secondary-button" href="/dashboard">
            Dashboard
          </Link>
          <Link className="secondary-button" href="/admin">
            Admin
          </Link>
          <button className="icon-button" type="button" aria-label="Saved listings">
            <Heart size={18} />
          </button>
          <Link className="primary-button" href="/listings/new">
            <Building2 size={18} />
            List transfer
          </Link>
        </nav>
      </div>
    </header>
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
      <Image src={listing.imageUrl} alt={listing.title} width={900} height={667} />
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
