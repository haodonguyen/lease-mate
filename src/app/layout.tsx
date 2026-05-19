import type { Metadata } from "next";
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
        </div>
      </body>
    </html>
  );
}
