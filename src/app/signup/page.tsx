import { FileCheck2, ShieldCheck, Users } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth/signup-form";
import { getCurrentAuthenticatedUser } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const currentUser = await getCurrentAuthenticatedUser();
  if (currentUser) {
    redirect(currentUser.role === "RENTER" ? "/saved" : "/dashboard");
  }

  return (
    <main className="auth-shell">
      <div className="auth-card signup-auth-card">
        <section className="auth-visual-panel signup-visual-panel">
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
              Transfer verified
            </span>
            <h1>Australia&apos;s premier lease collective.</h1>
            <p>
              Start your rental handover with verified documentation, renter-ready
              communication, and a cleaner workflow than social groups.
            </p>
            <div className="auth-feature-grid">
              <span><FileCheck2 size={17} /> Secure documentation</span>
              <span><Users size={17} /> Direct connections</span>
            </div>
          </div>
        </section>
        <section className="auth-form-panel">
          <div className="auth-form-heading">
            <span className="eyebrow">Sign up</span>
            <h1>Create your account</h1>
            <p>Start your lease transfer journey today with professional verification.</p>
          </div>
          <SignupForm />
        </section>
      </div>
    </main>
  );
}
