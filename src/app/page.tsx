import { AuthenticatedHome } from "@/components/home/authenticated-home";
import { GuestLanding } from "@/components/home/guest-landing";
import { listingRecordToLeaseListing } from "@/lib/listing-view";
import { canManageListings, getCurrentAuthenticatedUser } from "@/lib/server/auth";
import { listOwnerListings, listPublishedListings } from "@/lib/server/listing-service";
import { getAnalyticsSummary } from "@/lib/server/analytics-service";
import { listSavedListings } from "@/lib/server/social-service";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentAuthenticatedUser();
  const [records, analytics] = await Promise.all([
    listPublishedListings(),
    getAnalyticsSummary(),
  ]);
  const listings = records.map(listingRecordToLeaseListing);

  if (user) {
    const [savedListings, ownerListings] = await Promise.all([
      user.role === "RENTER" ? listSavedListings(user.id) : Promise.resolve([]),
      canManageListings(user.role) ? listOwnerListings(user.id) : Promise.resolve([]),
    ]);

    return (
      <AuthenticatedHome
        user={{ id: user.id, name: user.name, role: user.role }}
        recommendedListings={listings}
        savedListings={savedListings}
        ownerListings={ownerListings}
        analytics={analytics}
      />
    );
  }

  return <GuestLanding listings={listings} analytics={analytics} />;
}
