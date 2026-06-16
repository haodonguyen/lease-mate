import { ListingGridSkeleton } from "@/components/skeleton";

export default function MarketplaceLoading() {
  return (
    <main className="section">
      <div className="section-heading-row">
        <div>
          <span className="eyebrow">Marketplace</span>
          <h2>Loading listings…</h2>
        </div>
      </div>
      <ListingGridSkeleton count={6} />
    </main>
  );
}
