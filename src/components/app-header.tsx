import { Bell, Building2, Home, LogIn, Search, UserPlus } from "lucide-react";
import Link from "next/link";
import { DemoRoleSwitcher } from "@/components/auth/demo-role-switcher";
import { LogoutButton } from "@/components/auth/logout-button";
import { getAccountActionHref } from "@/lib/account-navigation";
import { getCurrentAuthenticatedUser, getCurrentDemoUser, isDemoAuthEnabled } from "@/lib/server/auth";

export async function AppHeader() {
  const authenticatedUser = await getCurrentAuthenticatedUser();
  const demoUser = authenticatedUser ? null : await getCurrentDemoUser();
  const currentUser = authenticatedUser ?? demoUser;
  const isAuthenticated = Boolean(authenticatedUser);
  const savedHref = getAccountActionHref({ isAuthenticated, targetPath: "/saved" });
  const dashboardHref = getAccountActionHref({ isAuthenticated, targetPath: "/dashboard" });
  const adminHref = getAccountActionHref({ isAuthenticated, targetPath: "/admin" });
  const listTransferHref = getAccountActionHref({ isAuthenticated, targetPath: "/listings/new" });

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
          <Link className="nav-link" href="/#listings">
            Marketplace
          </Link>
          <Link className="nav-link" href="/#how-it-works">
            How it works
          </Link>
          <Link className="nav-link" href="/#security">
            Security
          </Link>
          {currentUser?.role === "ADMIN" ? (
            <Link className="secondary-button" href={adminHref}>
              Admin
            </Link>
          ) : null}
          {authenticatedUser ? (
            <>
              <Link className="icon-button" href="/#listings" aria-label="Search listings">
                <Search size={18} />
              </Link>
              <Link className="icon-button" href={savedHref} aria-label="Saved listings">
                <Bell size={18} />
              </Link>
              <Link className="secondary-button" href={dashboardHref}>
                Dashboard
              </Link>
              <Link className="primary-button" href={listTransferHref}>
                <Building2 size={18} />
                List transfer
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link className="secondary-button" href="/login">
                <LogIn size={18} />
                Sign in
              </Link>
              <Link className="primary-button" href="/signup">
                <UserPlus size={18} />
                Join
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
