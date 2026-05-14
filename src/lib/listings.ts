import {
  assessListingReadiness,
  type ConsentStatus,
  type HousingType,
  type ListingType,
  type TransferChecklist,
} from "./lease-rules";

export interface LeaseListing {
  id: string;
  slug: string;
  title: string;
  suburb: string;
  state: "VIC";
  postcode: string;
  listingType: ListingType;
  consentStatus: ConsentStatus;
  housingType: HousingType;
  rentPerWeek: number;
  bondAmount: number;
  bedrooms: number;
  bathrooms: number;
  availableFrom: string;
  availableUntil?: string;
  leaseEnds: string;
  imageUrl: string;
  highlights: string[];
  description: string;
  checklist: TransferChecklist;
  lister: {
    name: string;
    role: string;
    responseTime: string;
  };
}

export const leaseListings: LeaseListing[] = [
  {
    id: "lst_001",
    slug: "brunswick-east-light-filled-apartment",
    title: "Light-filled 1 bed apartment near Lygon Street",
    suburb: "Brunswick East",
    state: "VIC",
    postcode: "3057",
    listingType: "lease_transfer",
    consentStatus: "approved",
    housingType: "private_rental",
    rentPerWeek: 480,
    bondAmount: 2080,
    bedrooms: 1,
    bathrooms: 1,
    availableFrom: "2026-06-10",
    leaseEnds: "2027-02-28",
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    highlights: ["Written consent received", "Tram 96 nearby", "Pet-friendly building"],
    description:
      "A tidy one-bedroom apartment suited to a single renter or couple. The rental provider has approved a lease transfer process and the current renter is ready to organise inspection times.",
    checklist: {
      hasWrittenConsent: true,
      bondTransferDiscussed: true,
      agentOrLandlordAware: true,
      newRenterAddedToLease: true,
      understandsSubletRisk: true,
      housingType: "private_rental",
    },
    lister: {
      name: "Mia",
      role: "Outgoing renter",
      responseTime: "Usually replies within 2 hours",
    },
  },
  {
    id: "lst_002",
    slug: "box-hill-student-room-close-to-station",
    title: "Private room close to Box Hill station",
    suburb: "Box Hill",
    state: "VIC",
    postcode: "3128",
    listingType: "room_replacement",
    consentStatus: "pending",
    housingType: "share_house",
    rentPerWeek: 260,
    bondAmount: 1040,
    bedrooms: 1,
    bathrooms: 2,
    availableFrom: "2026-06-01",
    leaseEnds: "2026-12-15",
    imageUrl: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1200&q=80",
    highlights: ["Housemates have met", "Consent request sent", "Walk to train"],
    description:
      "A room replacement in a friendly share house. The agent has been contacted and the lister is collecting applicant details before the final approval step.",
    checklist: {
      hasWrittenConsent: false,
      bondTransferDiscussed: true,
      agentOrLandlordAware: true,
      newRenterAddedToLease: false,
      understandsSubletRisk: true,
      housingType: "share_house",
    },
    lister: {
      name: "An",
      role: "Current housemate",
      responseTime: "Usually replies same day",
    },
  },
  {
    id: "lst_003",
    slug: "southbank-short-term-studio",
    title: "Short-term studio while renter travels",
    suburb: "Southbank",
    state: "VIC",
    postcode: "3006",
    listingType: "temporary_sublet",
    consentStatus: "not_started",
    housingType: "private_rental",
    rentPerWeek: 530,
    bondAmount: 0,
    bedrooms: 1,
    bathrooms: 1,
    availableFrom: "2026-07-05",
    availableUntil: "2026-09-20",
    leaseEnds: "2027-01-10",
    imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    highlights: ["Fully furnished", "Short stay", "Consent not started"],
    description:
      "A furnished studio listed for a temporary stay. This listing is intentionally marked as cautionary because written consent has not started yet.",
    checklist: {
      hasWrittenConsent: false,
      bondTransferDiscussed: false,
      agentOrLandlordAware: false,
      newRenterAddedToLease: false,
      understandsSubletRisk: false,
      housingType: "private_rental",
    },
    lister: {
      name: "Leo",
      role: "Current renter",
      responseTime: "Usually replies within 1 day",
    },
  },
];

export function getListingBySlug(slug: string) {
  return leaseListings.find((listing) => listing.slug === slug);
}

export function getListingReadiness(listing: LeaseListing) {
  return assessListingReadiness({
    listingType: listing.listingType,
    consentStatus: listing.consentStatus,
    checklist: listing.checklist,
  });
}

export function formatListingType(type: ListingType) {
  const labels: Record<ListingType, string> = {
    lease_transfer: "Lease transfer",
    temporary_sublet: "Temporary sublet",
    room_replacement: "Room replacement",
  };

  return labels[type];
}
