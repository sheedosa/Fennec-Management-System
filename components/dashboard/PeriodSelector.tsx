"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Locale, Period } from "@/lib/types";
import { L } from "@/lib/i18n/dictionary";

const PERIODS: { k: Period; ar: string; en: string }[] = [
  { k: "month", ar: "هذا الشهر", en: "This Month" },
  { k: "quarter", ar: "هذا الربع", en: "This Quarter" },
  { k: "year", ar: "هذه السنة", en: "This Year" },
  { k: "all", ar: "كل الوقت", en: "All Time" },
];

export function PeriodSelector({ current, locale }: { current: Period; locale: Locale }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const select = (p: Period) => {
    const next = new URLSearchParams(params);
    next.set("period", p);
    router.push(`${pathname}?${next.toString()}`);
  };

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
      <span style={{ fontSize: "13.5px", color: "var(--color-sub)", fontWeight: 600 }}>{L("اعرض بيانات:", "Showing:", locale)}</span>
      <div style={{ display: "inline-flex", background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "12px", padding: "4px", gap: "2px", flexWrap: "wrap" }}>
        {PERIODS.map((p) => (
          <button
            key={p.k}
            onClick={() => select(p.k)}
            style={{
              padding: "8px 15px",
              border: "none",
              borderRadius: "9px",
              cursor: "pointer",
              fontSize: "13.5px",
              fontWeight: 700,
              background: current === p.k ? "var(--color-blue)" : "transparent",
              color: current === p.k ? "var(--accent-contrast)" : "var(--color-sub)",
              boxShadow: current === p.k ? "var(--elev-1)" : "none",
            }}
          >
            {L(p.ar, p.en, locale)}
          </button>
        ))}
      </div>
    </div>
  );
}
