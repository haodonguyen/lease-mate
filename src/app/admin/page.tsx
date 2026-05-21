import Link from "next/link";
import { redirect } from "next/navigation";
import { ReportModerationButton } from "@/components/admin-controls";
import { canModerate, getCurrentAuthenticatedUser } from "@/lib/server/auth";
import { getAnalyticsSummary } from "@/lib/server/analytics-service";
import { prisma } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentAuthenticatedUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  if (!canModerate(user.role)) {
    return (
      <main className="section">
        <Link className="secondary-button" href="/">Back to marketplace</Link>
        <div className="notice">Use an Admin account to view moderation.</div>
      </main>
    );
  }

  const [reports, analytics] = await Promise.all([
    prisma.report.findMany({
      include: { listing: true, user: true },
      orderBy: { createdAt: "desc" },
    }),
    getAnalyticsSummary(),
  ]);

  return (
    <main className="section">
      <Link className="secondary-button" href="/">Back to marketplace</Link>
      <div className="dashboard-hero">
        <div>
          <span className="eyebrow">Admin moderation</span>
          <h1>Moderation queue</h1>
          <p className="muted">Review reported listings to maintain community trust and safety.</p>
        </div>
        <Link className="secondary-button compact-button" href="/">View marketplace</Link>
      </div>
      <div className="dashboard-grid">
        <div className="stat-pill"><strong>{reports.filter((report) => report.status === "OPEN").length}</strong><span>open reports</span></div>
        <div className="stat-pill"><strong>{analytics.views}</strong><span>views</span></div>
        <div className="stat-pill"><strong>{analytics.waitlist}</strong><span>waitlist</span></div>
        <div className="stat-pill dark-stat"><strong>{reports.length}</strong><span>queue total</span></div>
      </div>
      <div className="moderation-layout">
        <div className="table-list">
        {reports.map((report) => (
          <article className="detail-panel moderation-card" key={report.id}>
            <div className="split-row">
              <div>
                <span className={`status-dot ${report.status.toLowerCase()}`}>{report.status.toLowerCase()}</span>
                <h2>{report.reason}</h2>
                <p className="muted">{report.listing.title} · {report.status}</p>
                {report.details ? <p>{report.details}</p> : null}
              </div>
              <div className="action-stack horizontal">
                <ReportModerationButton reportId={report.id} status="REVIEWED" />
                <ReportModerationButton reportId={report.id} status="DISMISSED" />
              </div>
            </div>
          </article>
        ))}
        </div>
        <aside className="moderation-sidebar">
          <strong>Moderation logs</strong>
          {reports.slice(0, 4).map((report) => (
            <div className="inbox-item" key={`${report.id}-log`}>
              <strong>{report.status}</strong>
              <span>{report.listing.title}</span>
              <p>{report.reason}</p>
            </div>
          ))}
          {reports.length === 0 ? <p className="muted">No reports are waiting for review.</p> : null}
        </aside>
      </div>
    </main>
  );
}
