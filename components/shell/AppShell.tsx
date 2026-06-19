"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { Locale, OrgRole } from "@/lib/types";
import type { ThemePref } from "@/lib/theme";
import { L } from "@/lib/i18n/dictionary";
import { signOut } from "@/actions/auth";
import { setLocale } from "@/actions/org";
import { ThemeToggle } from "@/components/shell/ThemeToggle";

const NAV: { id: string; ar: string; en: string; paths: string[] }[] = [
  { id: "dashboard", ar: "لوحة القيادة", en: "Dashboard", paths: ["M3 13h8V3H3z", "M13 21h8V3h-8z", "M3 21h8v-6H3z"] },
  { id: "clients", ar: "العملاء", en: "Clients", paths: ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8", "M22 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"] },
  { id: "invoices", ar: "الفواتير", en: "Invoices", paths: ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "M9 13h6", "M9 17h6"] },
  { id: "finances", ar: "المالية والمصروفات", en: "Finance & Expenses", paths: ["M12 1v22", "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"] },
  { id: "capital", ar: "رأس مال الشركة", en: "Company Capital", paths: ["M3 21h18", "M3 10h18", "M5 6l7-3 7 3", "M5 10v11", "M19 10v11", "M9 14v3", "M15 14v3"] },
  { id: "calendar", ar: "التقويم", en: "Calendar", paths: ["M8 2v4", "M16 2v4", "M3 10h18", "M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"] },
];

function NavIcon({ paths, active }: { paths: string[]; active: boolean }) {
  const col = active ? "var(--accent-contrast)" : "var(--color-faint)";
  return (
    <svg width={20} height={20} viewBox="0 0 24 24">
      {paths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={col} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

export function AppShell({
  orgName,
  role,
  locale,
  theme,
  children,
}: {
  orgName: string;
  role: OrgRole;
  locale: Locale;
  theme: ThemePref;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Projects live under the Clients hub, so /projects/* highlights Clients.
  const activePath = pathname.startsWith("/projects") ? "/clients" : pathname;
  const active = NAV.find((n) => activePath.startsWith("/" + n.id)) ?? NAV[0];
  const startSide = locale === "en" ? "left" : "right";

  return (
    <div dir={locale === "en" ? "ltr" : "rtl"} style={{ display: "flex", minHeight: "100vh" }}>
      {/* sidebar */}
      <aside
        id="fx-sidebar"
        data-open={open ? "true" : "false"}
        style={{
          width: "264px",
          flexShrink: 0,
          background: "var(--color-sidebar)",
          borderInlineEnd: "1px solid var(--color-border)",
          display: "flex",
          flexDirection: "column",
          padding: "20px 16px",
          gap: "4px",
        }}
      >
        <div style={{ padding: "4px 8px 16px", borderBottom: "1px solid var(--color-border)", marginBottom: "12px" }}>
          <Image className="fx-logo" src="/assets/fennec-logo-dark.png" alt="Fennec" width={148} height={39} style={{ width: "148px", height: "auto", display: "block", margin: "0 auto" }} />
          <div style={{ textAlign: "center", color: "var(--color-faint)", fontSize: "10px", letterSpacing: "3.5px", marginTop: "2px" }}>
            {L("الإدارة المالية", "FINANCE SUITE", locale)}
          </div>
        </div>
        <div style={{ padding: "2px 10px 8px", color: "var(--color-sub)", fontSize: "11px", fontWeight: 800, letterSpacing: ".5px" }}>
          {L("القائمة", "MENU", locale)}
        </div>
        {NAV.map((n) => {
          const isActive = n.id === active.id;
          return (
            <Link
              key={n.id}
              href={"/" + n.id}
              onClick={() => setOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "13px",
                width: "100%",
                padding: "12px 14px",
                borderRadius: "12px",
                background: isActive ? "var(--color-blue)" : "transparent",
                color: isActive ? "var(--accent-contrast)" : "var(--color-sub)",
                fontWeight: isActive ? 700 : 600,
                fontSize: "15px",
                textAlign: startSide as "left" | "right",
                textDecoration: "none",
                boxShadow: isActive ? "var(--elev-1)" : "none",
              }}
            >
              <NavIcon paths={n.paths} active={isActive} />
              <span>{L(n.ar, n.en, locale)}</span>
            </Link>
          );
        })}
        <div style={{ marginTop: "auto", paddingTop: "12px", borderTop: "1px solid var(--color-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "11px", padding: "8px 10px", borderRadius: "12px", background: "var(--color-card-alt)" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-contrast)", fontWeight: 800, fontSize: "17px", flexShrink: 0 }}>
              {(orgName || "F").charAt(0)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: "var(--color-ink)", fontSize: "13.5px", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{orgName}</div>
              <div style={{ color: "var(--color-sub)", fontSize: "11.5px" }}>
                {role === "manager" ? L("حساب المدير", "Manager Account", locale) : L("حساب موظف", "Staff Account", locale)}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* backdrop (mobile) */}
      <div id="fx-backdrop" data-open={open ? "true" : "false"} onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.5)", zIndex: 70, backdropFilter: "blur(2px)" }} />

      {/* main */}
      <div id="fx-main" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <header style={{ height: "70px", background: "color-mix(in srgb, var(--color-card) 82%, transparent)", backdropFilter: "saturate(180%) blur(8px)", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}>
            <button id="fx-hamburger" onClick={() => setOpen(true)} aria-label="القائمة" style={{ width: "40px", height: "40px", borderRadius: "11px", border: "1px solid var(--color-border)", background: "var(--color-card)", cursor: "pointer", alignItems: "center", justifyContent: "center" }}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="var(--color-navy)" strokeWidth={2} strokeLinecap="round">
                <path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" />
              </svg>
            </button>
            <h1 style={{ margin: 0, fontSize: "21px", fontWeight: 800, color: "var(--color-navy)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {L(active.ar, active.en, locale)}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
            <ThemeToggle current={theme} />
            <div style={{ display: "inline-flex", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "11px", padding: "3px", gap: "2px" }}>
              {(["ar", "en"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setLocale(k)}
                  style={{ padding: "6px 14px", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 800, background: locale === k ? "var(--color-card)" : "transparent", color: locale === k ? "var(--color-accent)" : "var(--color-sub)", boxShadow: locale === k ? "var(--elev-1)" : "none" }}
                >
                  {k === "ar" ? "عربي" : "EN"}
                </button>
              ))}
            </div>
            <form action={signOut}>
              <button type="submit" style={{ padding: "8px 13px", border: "1px solid var(--color-border)", background: "var(--color-card)", color: "var(--color-sub)", borderRadius: "11px", fontSize: "13px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                {L("خروج", "Sign out", locale)}
              </button>
            </form>
          </div>
        </header>
        <div className="fx-content">{children}</div>
      </div>
    </div>
  );
}
