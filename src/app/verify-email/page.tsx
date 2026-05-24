import { MailCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { verifyEmailToken } from "@/lib/server/auth-tokens";

export const dynamic = "force-dynamic";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string; sent?: string; email?: string }>;
}) {
  const params = await searchParams;
  const token = params?.token?.trim();
  const result = token ? await verifyEmailToken(token) : null;
  const email = params?.email;

  return (
    <main className="auth-shell auth-page">
      <section className="detail-panel auth-signed-in-panel verification-panel">
        <span className="eyebrow">
          {result?.ok ? <ShieldCheck size={17} /> : <MailCheck size={17} />}
          Email verification
        </span>
        {result?.ok ? (
          <>
            <h1>Email verified</h1>
            <p className="muted">Your LeaseMate account is ready. Sign in to manage saved homes, enquiries, and transfer documents.</p>
            <div className="action-stack horizontal">
              <Link className="primary-button" href="/login">
                Sign in
              </Link>
              <Link className="secondary-button" href="/marketplace">
                Browse listings
              </Link>
            </div>
          </>
        ) : token ? (
          <>
            <h1>Verification link expired</h1>
            <p className="muted">This email verification link is invalid or has already been used.</p>
            <Link className="primary-button" href="/login">
              Sign in
            </Link>
          </>
        ) : (
          <>
            <h1>Check your inbox</h1>
            <p className="muted">
              We sent a verification link{email ? ` to ${email}` : ""}. Open it to confirm your account email.
            </p>
            <div className="action-stack horizontal">
              <Link className="primary-button" href="/login">
                Sign in
              </Link>
              <Link className="secondary-button" href="/marketplace">
                Browse listings
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
