import type { Locale } from "@/lib/types";
import { L } from "@/lib/i18n/dictionary";
import { money } from "@/lib/finance/money";
import { EmptyState } from "@/components/ui/EmptyState";

// Monochrome ramp — top client darkest, descending.
const PALETTE = ["var(--fg)", "var(--fg-muted)", "var(--fg-muted)", "var(--fg-faint)", "var(--fg-faint)"];

// Ported verbatim from prototype `topClientsChart()`.
export function TopClientsChart({
  rows,
  locale,
}: {
  rows: { name: string; val: number }[];
  locale: Locale;
}) {
  if (!rows.length) return <EmptyState message={L("لا توجد إيرادات في هذه الفترة", "No revenue in this period", locale)} />;
  const max = Math.max(...rows.map((r) => r.val));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "15px", paddingTop: "4px" }}>
      {rows.map((r, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px", marginBottom: "6px" }}>
            <span style={{ color: "var(--color-navy)", fontWeight: 700 }}>{r.name}</span>
            <span className="fx-num" style={{ color: "var(--color-gray)", fontWeight: 700 }}>{money(r.val, locale)}</span>
          </div>
          <div style={{ height: "11px", background: "var(--color-line)", borderRadius: "6px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: (r.val / max) * 100 + "%", background: PALETTE[i], borderRadius: "6px" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
