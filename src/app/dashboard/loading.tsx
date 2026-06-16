import { PanelListSkeleton } from "@/components/skeleton";

export default function DashboardLoading() {
  return (
    <main className="section">
      <div className="dashboard-hero">
        <div>
          <span className="eyebrow">Owner dashboard</span>
          <h1>Loading your listings…</h1>
        </div>
      </div>
      <PanelListSkeleton count={3} />
    </main>
  );
}
