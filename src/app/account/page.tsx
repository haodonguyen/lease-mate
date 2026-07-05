import { Mail } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PasswordForm, ProfileForm } from "@/components/account/account-forms";
import { getCurrentAuthenticatedUser } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentAuthenticatedUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  return (
    <main className="section">
      <Link className="secondary-button" href="/marketplace#listings">Back to marketplace</Link>
      <div className="dashboard-hero">
        <div>
          <span className="eyebrow">Account</span>
          <h1>Your profile</h1>
          <p className="muted">Manage how you appear on LeaseMate and keep your sign-in secure.</p>
        </div>
      </div>

      <div className="account-summary">
        <div className="account-summary-item">
          <Mail size={16} aria-hidden="true" />
          <div>
            <span className="muted">Email</span>
            <strong>{user.email}</strong>
          </div>
        </div>
      </div>

      <div className="account-grid">
        <section className="detail-panel">
          <h2>Profile</h2>
          <p className="muted">This name is shown in your dashboard and listing activity.</p>
          <ProfileForm initialName={user.name} />
        </section>

        <section className="detail-panel">
          <h2>Password</h2>
          <p className="muted">Confirm your current password to set a new one.</p>
          <PasswordForm />
        </section>
      </div>
    </main>
  );
}
