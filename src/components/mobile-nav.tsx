"use client";

import { Building2, LogIn, Menu, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogoutButton } from "@/components/auth/logout-button";

interface MobileNavProps {
  isAuthenticated: boolean;
  canManage: boolean;
  role?: string;
  savedHref: string;
  dashboardHref: string;
  adminHref: string;
  listTransferHref: string;
}

export function MobileNav({
  isAuthenticated,
  canManage,
  role,
  savedHref,
  dashboardHref,
  adminHref,
  listTransferHref,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll, handle Escape, and trap focus while open.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const focusables = drawerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusables || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="mobile-nav">
      <button
        type="button"
        className="icon-button mobile-nav-toggle"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Menu size={20} />
      </button>

      {open ? (
        <div className="mobile-nav-overlay" onClick={() => setOpen(false)}>
          <div
            ref={drawerRef}
            className="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mobile-nav-header">
              <strong>Menu</strong>
              <button
                ref={closeButtonRef}
                type="button"
                className="icon-button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <nav className="mobile-nav-links" aria-label="Primary">
              <Link href="/marketplace#listings">Marketplace</Link>
              <Link href="/marketplace#how-it-works">How it works</Link>
              <Link href="/marketplace#security">Security</Link>

              {isAuthenticated && !canManage ? (
                <>
                  <Link href={savedHref}>Saved listings</Link>
                  <Link href="/enquiries">My enquiries</Link>
                </>
              ) : null}

              {canManage ? (
                <>
                  <Link href={dashboardHref}>Dashboard</Link>
                  <Link className="primary-button mobile-nav-cta" href={listTransferHref}>
                    <Building2 size={18} />
                    List transfer
                  </Link>
                </>
              ) : null}

              {role === "ADMIN" ? <Link href={adminHref}>Admin</Link> : null}

              {isAuthenticated ? <Link href="/account">Account</Link> : null}
            </nav>

            <div className="mobile-nav-footer">
              {isAuthenticated ? (
                <LogoutButton />
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
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
