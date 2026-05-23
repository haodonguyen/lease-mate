import { Bell, Building2, LogIn, Search, UserPlus } from "lucide-react";
import Image from "next/image";
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
  const canManage = currentUser?.role === "OWNER" || currentUser?.role === "ADMIN";
  const savedHref = getAccountActionHref({ isAuthenticated, targetPath: "/saved" });
  const dashboardHref = getAccountActionHref({ isAuthenticated, targetPath: "/dashboard" });
  const adminHref = getAccountActionHref({ isAuthenticated, targetPath: "/admin" });
  const listTransferHref = getAccountActionHref({ isAuthenticated, targetPath: "/listings/new" });

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link href="/" className="brand" aria-label="LeaseMate home">
          <span className="brand-mark">
            <Image src="/leasemate-mark.svg" alt="" width={38} height={38} priority />
          </span>
          <span>LeaseMate</span>
        </Link>
        <nav className="nav-actions" aria-label="Primary actions">
          <DemoRoleSwitcher
            currentEmail={currentUser?.email}
            showDemoSwitcher={isDemoAuthEnabled()}
          />
          <Link className="nav-link" href="/marketplace#listings">
            Marketplace
          </Link>
          <Link className="nav-link" href="/marketplace#how-it-works">
            How it works
          </Link>
          <Link className="nav-link" href="/marketplace#security">
            Security
          </Link>
          {currentUser?.role === "ADMIN" ? (
            <Link className="secondary-button" href={adminHref}>
              Admin
            </Link>
          ) : null}
          {authenticatedUser ? (
            <>
              <Link className="icon-button" href="/marketplace#listings" aria-label="Open marketplace search">
                <Search size={18} />
              </Link>
              {!canManage ? (
                <Link className="icon-button" href={savedHref} aria-label="Saved listings">
                  <Bell size={18} />
                </Link>
              ) : null}
              {canManage ? (
                <>
                  <Link className="secondary-button" href={dashboardHref}>
                    Dashboard
                  </Link>
                  <Link className="primary-button" href={listTransferHref}>
                    <Building2 size={18} />
                    List transfer
                  </Link>
                </>
              ) : null}
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
