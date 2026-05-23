import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeaseMate | Safer lease transfers across Australia",
  description:
    "An Australia-wide lease transfer marketplace concept for renters moving beyond Facebook groups.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/leasemate-mark.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="page-shell">
          <AppHeader />
          {children}
          <footer className="site-footer">
            <div className="site-footer-inner">
              <div>
                <strong>LeaseMate</strong>
                <p>Helping Australian renters move lease transfers out of risky posts and into structured, accountable workflows.</p>
              </div>
              <nav aria-label="Footer links">
                <a href="https://www.australia.gov.au" target="_blank" rel="noreferrer">
                  Australian tenancy resources
                </a>
                <Link href="/listings/new">Transfer checklist</Link>
                <Link href="/saved">Saved listings</Link>
                <Link href="/dashboard">Owner dashboard</Link>
              </nav>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
