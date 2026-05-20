import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { getSafeRedirectPath } from "@/lib/auth-redirect";
import { getDemoLoginDefaults } from "@/lib/demo-auth";
import { getCurrentAuthenticatedUser } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const currentUser = await getCurrentAuthenticatedUser();
  const demoDefaults = getDemoLoginDefaults();
  const params = await searchParams;
  const redirectTo = getSafeRedirectPath(params?.next);

  return (
    <main className="section auth-page">
      <div className="page-heading">
        <span className="eyebrow">Account access</span>
        <h1>Sign in to LeaseMate</h1>
        <p className="muted">
          Use a seeded account to manage listings, enquiries, saved homes, and moderation workflows.
        </p>
      </div>
      {currentUser ? (
        <div className="detail-panel">
          <h2>You are signed in as {currentUser.name}</h2>
          <p className="muted">{currentUser.email} · {currentUser.role}</p>
          <div className="action-stack horizontal">
            <Link className="primary-button" href={redirectTo}>
              Continue
            </Link>
            <Link className="secondary-button" href="/">
              Back to marketplace
            </Link>
          </div>
        </div>
      ) : (
        <div className="detail-panel auth-panel">
          <LoginForm defaultEmail={demoDefaults.email} defaultPassword={demoDefaults.password} redirectTo={redirectTo} />
          {demoDefaults.helperText ? <p className="muted">{demoDefaults.helperText}</p> : null}
        </div>
      )}
    </main>
  );
}
