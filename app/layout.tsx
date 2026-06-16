import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fennec-management-system.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Fennec Management System",
  description: "نظام الإدارة المالية لوكالة فينيك — Fennec Agency finance suite",
  openGraph: {
    title: "Fennec Management System",
    description: "نظام الإدارة المالية لوكالة فينيك — Fennec Agency finance suite",
    url: siteUrl,
    siteName: "Fennec Management System",
    images: [{ url: "/og-image.png", width: 1024, height: 1024, alt: "Elconekt" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fennec Management System",
    description: "نظام الإدارة المالية لوكالة فينيك — Fennec Agency finance suite",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // dir/lang are finalized per-locale in app/(app)/layout.tsx once next-intl
  // routing lands; Arabic-first RTL is the default.
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <body>{children}</body>
    </html>
  );
}
