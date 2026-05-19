import { Marketplace } from "@/components/marketplace";
import { WaitlistForm } from "@/components/waitlist-form";
import { listingRecordToLeaseListing } from "@/lib/listing-view";
import { listPublishedListings } from "@/lib/server/listing-service";
import { getAnalyticsSummary } from "@/lib/server/analytics-service";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [records, analytics] = await Promise.all([
    listPublishedListings(),
    getAnalyticsSummary(),
  ]);

  return (
    <>
      <Marketplace
        listings={records.map(listingRecordToLeaseListing)}
        analytics={analytics}
      />
      <section className="validation-band">
        <div>
          <span className="eyebrow">Startup validation</span>
          <h2>Testing whether renters will share structured lease pages back into communities.</h2>
        </div>
        <WaitlistForm />
      </section>
    </>
  );
}
