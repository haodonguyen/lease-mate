import Link from "next/link";
import { ReportModerationButton } from "@/components/admin-controls";
import { canModerate, getCurrentUser } from "@/lib/server/auth";
import { getAnalyticsSummary } from "@/lib/server/analytics-service";
import { prisma } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user || !canModerate(user.role)) {
    return (
      <main className="section">
        <Link className="secondary-button" href="/">Back to marketplace</Link>
        <div className="notice">Switch to Admin role to view moderation.</div>
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
      <div className="page-heading">
        <span className="eyebrow">Admin moderation</span>
        <h1>Trust and safety queue</h1>
        <p className="muted">Review reported listings, monitor analytics, and keep risky transfers visible but controlled.</p>
      </div>
      <div className="stat-row">
        <div className="stat-pill"><strong>{reports.filter((report) => report.status === "OPEN").length}</strong><span>open reports</span></div>
        <div className="stat-pill"><strong>{analytics.views}</strong><span>views</span></div>
        <div className="stat-pill"><strong>{analytics.waitlist}</strong><span>waitlist</span></div>
      </div>
      <div className="table-list">
        {reports.map((report) => (
          <article className="detail-panel" key={report.id}>
            <div className="split-row">
              <div>
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
    </main>
  );
}
