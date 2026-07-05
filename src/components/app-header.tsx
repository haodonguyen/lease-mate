import { Building2, LogIn, UserPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { MobileNav } from "@/components/mobile-nav";
import { getAccountActionHref } from "@/lib/account-navigation";
import { getCurrentAuthenticatedUser } from "@/lib/server/auth";

export async function AppHeader() {
  const authenticatedUser = await getCurrentAuthenticatedUser();
  const isAuthenticated = Boolean(authenticatedUser);
  const savedHref = getAccountActionHref({ isAuthenticated, targetPath: "/saved" });
  const dashboardHref = getAccountActionHref({ isAuthenticated, targetPath: "/dashboard" });
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
        <nav className="nav-actions desktop-nav" aria-label="Primary actions">
          <Link className="nav-link" href="/marketplace#listings">
            Marketplace
          </Link>
          <Link className="nav-link" href="/marketplace#how-it-works">
            How it works
          </Link>
          <Link className="nav-link" href="/marketplace#security">
            Security
          </Link>
          {authenticatedUser ? (
            <>
              <Link className="nav-link" href="/enquiries">
                My enquiries
              </Link>
              <Link className="nav-link" href={savedHref}>
                Saved
              </Link>
              <Link className="secondary-button" href={dashboardHref}>
                Dashboard
              </Link>
              <Link className="primary-button" href={listTransferHref}>
                <Building2 size={18} />
                List a transfer
              </Link>
              <Link className="nav-link" href="/account">
                Account
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
        <MobileNav
          isAuthenticated={isAuthenticated}
          savedHref={savedHref}
          dashboardHref={dashboardHref}
          listTransferHref={listTransferHref}
        />
      </div>
    </header>
  );
}
