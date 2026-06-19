import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { getThemePref, resolveThemeAttr } from "@/lib/theme";

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

// Pre-paint script: when preference is "system", set data-theme from the OS
// before first paint so there's no flash. For explicit light/dark the SSR
// attribute already matches, so this is a no-op.
const themeScript = `(function(){try{var p="light";var m=document.cookie.match(/fennec_theme=(light|dark|system)/);if(m)p=m[1];if(p==="system"){p=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.dataset.theme=p;}catch(e){}})();`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pref = await getThemePref();
  const themeAttr = resolveThemeAttr(pref);
  // dir/lang are Arabic-first RTL by default; per-locale dir is applied in the
  // app shell. Theme is resolved here so <html data-theme> is correct on SSR.
  return (
    <html
      lang="ar"
      dir="rtl"
      data-theme={themeAttr}
      className={tajawal.variable}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
