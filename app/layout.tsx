import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fennec Management System",
  description: "نظام الإدارة المالية لوكالة فينيك — Fennec Agency finance suite",
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
