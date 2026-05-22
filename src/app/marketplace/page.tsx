import { GuestLanding } from "@/components/home/guest-landing";
import { listingRecordToLeaseListing } from "@/lib/listing-view";
import { getAnalyticsSummary } from "@/lib/server/analytics-service";
import { listPublishedListings } from "@/lib/server/listing-service";

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  const [records, analytics] = await Promise.all([
    listPublishedListings(),
    getAnalyticsSummary(),
  ]);

  return (
    <GuestLanding
      listings={records.map(listingRecordToLeaseListing)}
      analytics={analytics}
    />
  );
}
