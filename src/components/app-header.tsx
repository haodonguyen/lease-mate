import { Building2, Heart, Home, LogIn } from "lucide-react";
import Link from "next/link";
import { DemoRoleSwitcher } from "@/components/auth/demo-role-switcher";
import { LogoutButton } from "@/components/auth/logout-button";
import { getCurrentUser, isDemoAuthEnabled } from "@/lib/server/auth";

export async function AppHeader() {
  const currentUser = await getCurrentUser();

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
          <Link className="primary-button" href="/listings/new">
            <Building2 size={18} />
            List transfer
          </Link>
          {currentUser ? (
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
