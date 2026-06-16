import { PanelListSkeleton } from "@/components/skeleton";

export default function EnquiriesLoading() {
  return (
    <main className="section">
      <div className="dashboard-hero">
        <div>
          <span className="eyebrow">Your enquiries</span>
          <h1>Loading your messages…</h1>
        </div>
      </div>
      <PanelListSkeleton count={3} />
    </main>
  );
}
