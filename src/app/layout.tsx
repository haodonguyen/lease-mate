import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeaseMate | Safer lease transfers in Victoria",
  description:
    "A Victoria-first lease transfer marketplace concept for renters moving beyond Facebook groups.",
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
                <p>Helping Victorian renters move lease transfers out of risky posts and into structured, accountable workflows.</p>
              </div>
              <nav aria-label="Footer links">
                <a href="https://www.consumer.vic.gov.au/housing/renting" target="_blank" rel="noreferrer">
                  Victorian tenancy
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
