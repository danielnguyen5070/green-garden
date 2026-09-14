import type { Metadata } from "next";
import { adminCopy } from "@/lib/admin-copy";
import { fontVariables } from "@/lib/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: `${adminCopy.brand} ${adminCopy.brandSubtitle}`,
  description: adminCopy.dashboard.description,
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
