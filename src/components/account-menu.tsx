"use client";

import { ChevronDown, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogoutButton } from "@/components/auth/logout-button";

// A compact account dropdown that folds the less-used destinations
// (dashboard, enquiries, settings, sign out) behind one trigger so the
// top nav stays minimal.
export function AccountMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on outside click or Escape while open.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="account-menu" ref={containerRef}>
      <button
        type="button"
        className="account-menu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <UserRound size={17} />
        Account
        <ChevronDown size={15} className={`account-menu-caret${open ? " open" : ""}`} />
      </button>
      {open ? (
        <div className="account-menu-panel" role="menu">
          <Link href="/dashboard" role="menuitem">Dashboard</Link>
          <Link href="/enquiries" role="menuitem">My enquiries</Link>
          <Link href="/account" role="menuitem">Account settings</Link>
          <LogoutButton className="account-menu-signout" />
        </div>
      ) : null}
    </div>
  );
}
