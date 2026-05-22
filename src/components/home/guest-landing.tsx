import { Marketplace } from "@/components/marketplace";
import { WaitlistForm } from "@/components/waitlist-form";
import type { LeaseListing } from "@/lib/listings";

interface GuestLandingProps {
  listings: LeaseListing[];
  analytics: {
    views: number;
    enquiries: number;
    saves: number;
    reports: number;
    waitlist: number;
  };
}

export function GuestLanding({ listings, analytics }: GuestLandingProps) {
  return (
    <>
      <Marketplace listings={listings} analytics={analytics} />
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
