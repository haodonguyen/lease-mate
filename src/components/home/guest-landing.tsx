import { Suspense } from "react";
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
  savedSlugs?: string[];
  isAuthenticated?: boolean;
}

export function GuestLanding({ listings, analytics, savedSlugs, isAuthenticated }: GuestLandingProps) {
  return (
    <>
      <Suspense fallback={null}>
        <Marketplace
          listings={listings}
          analytics={analytics}
          savedSlugs={savedSlugs}
          isAuthenticated={isAuthenticated}
        />
      </Suspense>
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
