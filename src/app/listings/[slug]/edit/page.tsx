import type { Listing } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingCreateForm, type ListingFormValues } from "@/components/listing-create-form";
import { parseHighlights, toDomainConsentStatus, toDomainHousingType, toDomainListingType } from "@/lib/mappers";
import { getCurrentUser } from "@/lib/server/auth";
import { canEditListing, getListingBySlugFromDb } from "@/lib/server/listing-service";

export const dynamic = "force-dynamic";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [user, listing] = await Promise.all([getCurrentUser(), getListingBySlugFromDb(slug)]);

  if (!listing) {
    notFound();
  }

  if (!user || !canEditListing(user, listing.ownerId)) {
    return (
      <main className="section">
        <Link className="secondary-button" href={`/listings/${listing.slug}`}>Back to listing</Link>
        <div className="notice">Only the listing owner or an admin can edit this listing.</div>
      </main>
    );
  }

  return (
    <main className="section">
      <Link className="secondary-button" href="/dashboard">Back to dashboard</Link>
      <div className="page-heading">
        <span className="eyebrow">Owner workflow</span>
        <h1>Edit lease listing</h1>
        <p className="muted">Update listing details, photo, rent, dates, and readiness checklist.</p>
      </div>
      <ListingCreateForm mode="edit" listingId={listing.id} initialValues={listingToFormValues(listing)} />
    </main>
  );
}

function listingToFormValues(listing: Listing): ListingFormValues {
  return {
    title: listing.title,
    suburb: listing.suburb,
    state: listing.state as ListingFormValues["state"],
    postcode: listing.postcode,
    listingType: toDomainListingType(listing.listingType),
    consentStatus: toDomainConsentStatus(listing.consentStatus),
    housingType: toDomainHousingType(listing.housingType),
    rentPerWeek: listing.rentPerWeek,
    bondAmount: listing.bondAmount,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    availableFrom: formatIsoDate(listing.availableFrom),
    leaseEnds: formatIsoDate(listing.leaseEnds),
    imageUrl: listing.imageUrl,
    description: listing.description,
    highlights: parseHighlights(listing.highlights).join("\n"),
    hasWrittenConsent: listing.hasWrittenConsent,
    bondTransferDiscussed: listing.bondTransferDiscussed,
    agentOrLandlordAware: listing.agentOrLandlordAware,
    newRenterAddedToLease: listing.newRenterAddedToLease,
    understandsSubletRisk: listing.understandsSubletRisk,
  };
}

function formatIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}
