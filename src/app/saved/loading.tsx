import { ListingGridSkeleton } from "@/components/skeleton";

export default function SavedLoading() {
  return (
    <main className="section">
      <div className="dashboard-hero">
        <div>
          <span className="eyebrow">Saved listings</span>
          <h1>Loading your shortlist…</h1>
        </div>
      </div>
      <ListingGridSkeleton count={3} />
    </main>
  );
}
