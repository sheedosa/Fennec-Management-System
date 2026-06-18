import type { DonutSegment } from "@/lib/finance/charts";
import type { Locale } from "@/lib/types";
import { L } from "@/lib/i18n/dictionary";
import { EmptyState } from "@/components/ui/EmptyState";

const SEG_LABEL: Record<string, [string, string]> = {
  projectCosts: ["تكاليف مشاريع", "Project Costs"],
  salaries: ["رواتب", "Salaries"],
  rent: ["إيجار", "Rent"],
  internet: ["إنترنت واشتراكات", "Internet & Subscriptions"],
  operations: ["تشغيل وضيافة", "Operations & Hospitality"],
};

// Monochrome ramp (ignores the finance layer's segment colours so the
// pure layer + its tests stay untouched). Largest categories are darkest.
const RAMP: Record<string, string> = {
  projectCosts: "var(--fg)",
  salaries: "var(--fg-muted)",
  rent: "var(--fg-faint)",
  internet: "var(--border-strong)",
  operations: "var(--border)",
};
const ramp = (k: string) => RAMP[k] ?? "var(--fg-muted)";

// Ported verbatim from prototype `donutChart()`.
export function DonutChart({ segments, locale }: { segments: DonutSegment[]; locale: Locale }) {
  const total = segments.reduce((a, b) => a + b.val, 0);
  if (total === 0) return <EmptyState message={L("لا توجد مصروفات في هذه الفترة", "No expenses in this period", locale)} />;

  const R = 58, CX = 80, CY = 80, circ = 2 * Math.PI * R;
  let off = 0;

  return (
    <div style={{ display: "flex", gap: "18px", alignItems: "center", flexWrap: "wrap" }}>
      <svg width={160} height={160} viewBox="0 0 160 160" style={{ direction: "ltr" }}>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--color-card-alt)" strokeWidth={18} />
        {segments.map((s, i) => {
          const len = (s.val / total) * circ;
          const el = (
            <circle
              key={i}
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke={ramp(s.key)}
              strokeWidth={18}
              strokeLinecap="round"
              strokeDasharray={`${Math.max(0, len - 3)} ${circ - len + 3}`}
              strokeDashoffset={-off}
              transform={`rotate(-90 ${CX} ${CY})`}
            />
          );
          off += len;
          return el;
        })}
        <text x={CX} y={CY - 4} textAnchor="middle" fontSize={12} fill="var(--color-sub)" fontFamily="Tajawal">
          {L("الإجمالي", "Total", locale)}
        </text>
        <text x={CX} y={CY + 17} textAnchor="middle" fontSize={16} fontWeight={800} fill="var(--color-navy)" fontFamily="Tajawal">
          {(total / 1000).toFixed(1)}k
        </text>
      </svg>
      <div style={{ flex: 1, minWidth: "130px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
            <span style={{ width: "11px", height: "11px", borderRadius: "4px", background: ramp(s.key), flexShrink: 0 }} />
            <span style={{ color: "var(--color-gray)", flex: 1 }}>{L(SEG_LABEL[s.key][0], SEG_LABEL[s.key][1], locale)}</span>
            <span className="fx-num" style={{ fontWeight: 800, color: "var(--color-navy)" }}>
              {((s.val / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
