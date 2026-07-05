import { ShieldCheck, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { getSafeRedirectPath } from "@/lib/auth-redirect";
import { getCurrentAuthenticatedUser } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const currentUser = await getCurrentAuthenticatedUser();
  const params = await searchParams;
  const redirectTo = getSafeRedirectPath(params?.next);

  return (
    <main className="auth-shell auth-page">
      {currentUser ? (
        <div className="detail-panel auth-signed-in-panel">
          <h2>You are signed in as {currentUser.name}</h2>
          <p className="muted">{currentUser.email}</p>
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
        <div className="auth-card">
          <section className="auth-visual-panel">
            <Image
              src="https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1100&q=80"
              alt="Bright Australian apartment interior"
              width={900}
              height={1100}
              priority
            />
            <div className="auth-visual-copy">
              <span className="eyebrow">
                <ShieldCheck size={17} />
                Verified listings
              </span>
              <h1>Australia Lease Collective</h1>
              <p>
                Join Australia&apos;s trusted marketplace for professional lease transfers.
                Secure, verified, and structured from first message.
              </p>
              <div className="auth-visual-points">
                <span><ShieldCheck size={15} /> Verified listings</span>
                <span><Users size={15} /> Secure documentation</span>
              </div>
            </div>
          </section>
          <section className="auth-form-panel">
            <div className="auth-form-heading">
              <span className="eyebrow">Sign in</span>
              <h1>Welcome back</h1>
              <p>Enter your details to manage saved homes, enquiries, and lease transfers.</p>
            </div>
            <LoginForm redirectTo={redirectTo} />
          </section>
        </div>
      )}
    </main>
  );
}
