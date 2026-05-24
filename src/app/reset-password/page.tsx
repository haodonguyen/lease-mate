import { KeyRound, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params?.token?.trim();

  return (
    <main className="auth-shell auth-page">
      <div className="auth-card">
        <section className="auth-visual-panel">
          <Image
            src="https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80"
            alt="Australian apartment lounge at night"
            width={980}
            height={1100}
            priority
          />
          <div className="auth-visual-copy">
            <span className="eyebrow">
              <ShieldCheck size={17} />
              Protected reset
            </span>
            <h1>Choose a new password.</h1>
            <p>Create a fresh password before returning to saved homes, enquiries, and transfer documents.</p>
          </div>
        </section>
        <section className="auth-form-panel">
          <div className="auth-form-heading">
            <span className="eyebrow">
              <KeyRound size={16} />
              Password reset
            </span>
            <h1>Secure your account</h1>
            <p>Use at least 8 characters. After reset, all active sessions are signed out.</p>
          </div>
          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <div className="form-grid elevated-auth-form">
              <div className="notice danger">This reset link is missing a token.</div>
              <Link className="primary-button" href="/forgot-password">
                Request a new link
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
