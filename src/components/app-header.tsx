import { Building2, Heart, Home, LogIn } from "lucide-react";
import Link from "next/link";
import { DemoRoleSwitcher } from "@/components/auth/demo-role-switcher";
import { LogoutButton } from "@/components/auth/logout-button";
import { getCurrentAuthenticatedUser, getCurrentDemoUser, isDemoAuthEnabled } from "@/lib/server/auth";

export async function AppHeader() {
  const authenticatedUser = await getCurrentAuthenticatedUser();
  const demoUser = authenticatedUser ? null : await getCurrentDemoUser();
  const currentUser = authenticatedUser ?? demoUser;
  const listTransferHref = authenticatedUser ? "/listings/new" : "/login?next=/listings/new";

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link href="/" className="brand" aria-label="LeaseMate home">
          <span className="brand-mark">
            <Home size={21} />
          </span>
          <span>LeaseMate</span>
        </Link>
        <nav className="nav-actions" aria-label="Primary actions">
          <DemoRoleSwitcher
            currentEmail={currentUser?.email}
            showDemoSwitcher={isDemoAuthEnabled()}
          />
          <Link className="secondary-button" href="/saved">
            Saved
          </Link>
          <Link className="secondary-button" href="/dashboard">
            Dashboard
          </Link>
          {currentUser?.role === "ADMIN" ? (
            <Link className="secondary-button" href="/admin">
              Admin
            </Link>
          ) : null}
          <Link className="secondary-button" href="/saved" aria-label="Saved listings">
            <Heart size={18} />
          </Link>
          <Link className="primary-button" href={listTransferHref}>
            <Building2 size={18} />
            List transfer
          </Link>
          {authenticatedUser ? (
            <LogoutButton />
          ) : (
            <Link className="secondary-button" href="/login">
              <LogIn size={18} />
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
