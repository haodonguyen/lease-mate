import { GuestLanding } from "@/components/home/guest-landing";
import { listingRecordToLeaseListing } from "@/lib/listing-view";
import { getAnalyticsSummary } from "@/lib/server/analytics-service";
import { getCurrentAuthenticatedUser } from "@/lib/server/auth";
import { listPublishedListings } from "@/lib/server/listing-service";
import { listSavedListingSlugs } from "@/lib/server/social-service";

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  const user = await getCurrentAuthenticatedUser();
  const [records, analytics, savedSlugs] = await Promise.all([
    listPublishedListings(),
    getAnalyticsSummary(),
    user ? listSavedListingSlugs(user.id) : Promise.resolve([]),
  ]);

  return (
    <GuestLanding
      listings={records.map(listingRecordToLeaseListing)}
      analytics={analytics}
      savedSlugs={savedSlugs}
      isAuthenticated={Boolean(user)}
    />
  );
}
