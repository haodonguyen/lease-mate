import { KeyRound, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return (
    <main className="auth-shell auth-page">
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
              Secure account recovery
            </span>
            <h1>Reset access safely.</h1>
            <p>We will send a short-lived reset link to the email connected to your LeaseMate account.</p>
          </div>
        </section>
        <section className="auth-form-panel">
          <div className="auth-form-heading">
            <span className="eyebrow">
              <KeyRound size={16} />
              Forgot password
            </span>
            <h1>Request a reset link</h1>
            <p>Enter your account email and check your inbox for the next step.</p>
          </div>
          <ForgotPasswordForm />
        </section>
      </div>
    </main>
  );
}
