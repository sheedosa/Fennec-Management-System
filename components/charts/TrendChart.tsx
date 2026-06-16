import type { TrendPoint } from "@/lib/finance/charts";
import type { Locale } from "@/lib/types";
import { months, L } from "@/lib/i18n/dictionary";

// Ported verbatim from prototype `trendChart()`. Charts stay LTR inside RTL
// so axes don't mirror.
export function TrendChart({ data, locale }: { data: TrendPoint[]; locale: Locale }) {
  const labels = data.map((p) => months(locale)[p.m].slice(0, 3));
  const max = Math.max(1, ...data.map((x) => Math.max(x.rev, x.exp)));
  const W = 620, Hh = 230, pad = 42, bottom = Hh - 34;
  const X = (i: number) => pad + i * ((W - pad * 2) / (data.length - 1));
  const Y = (v: number) => bottom - (v / max) * (bottom - 24);
  const line = (key: "rev" | "exp") => data.map((x, i) => X(i) + "," + Y(x[key])).join(" ");
  const area = (key: "rev" | "exp") =>
    X(0) + "," + bottom + " " + data.map((x, i) => X(i) + "," + Y(x[key])).join(" ") + " " + X(data.length - 1) + "," + bottom;
  const grid = [0, 0.25, 0.5, 0.75, 1];
  const dots = (key: "rev" | "exp", stroke: string) =>
    data.map((x, i) => <circle key={key + i} cx={X(i)} cy={Y(x[key])} r={3.5} fill="#fff" stroke={stroke} strokeWidth={2} />);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${Hh}`} style={{ width: "100%", height: "auto", direction: "ltr" }}>
        <defs>
          <linearGradient id="gr" x1={0} y1={0} x2={0} y2={1}>
            <stop offset="0%" stopColor="#15924f" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#15924f" stopOpacity={0} />
          </linearGradient>
        </defs>
        {grid.map((f) => (
          <line key={f} x1={pad} x2={W - pad} y1={bottom - (bottom - 24) * f} y2={bottom - (bottom - 24) * f} stroke="#f2ece1" strokeWidth={1} />
        ))}
        <polygon points={area("rev")} fill="url(#gr)" />
        <polyline points={line("rev")} fill="none" stroke="#15924f" strokeWidth={2.5} strokeLinejoin="round" />
        <polyline points={line("exp")} fill="none" stroke="#c9821f" strokeWidth={2.5} strokeDasharray="5 4" strokeLinejoin="round" />
        {dots("rev", "#15924f")}
        {dots("exp", "#c9821f")}
        {data.map((x, i) => (
          <text key={"lx" + i} x={X(i)} y={Hh - 10} fontSize={12} fill="#6e645a" textAnchor="middle" fontFamily="Tajawal">
            {labels[i]}
          </text>
        ))}
      </svg>
      <div style={{ display: "flex", gap: "18px", justifyContent: "center", marginTop: "6px" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--color-sub)" }}>
          <span style={{ width: "12px", height: "3px", background: "#15924f", borderRadius: "2px" }} />
          {L("الإيرادات", "Revenue", locale)}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--color-sub)" }}>
          <span style={{ width: "12px", height: "3px", background: "#c9821f", borderRadius: "2px" }} />
          {L("المصروفات", "Expenses", locale)}
        </span>
      </div>
    </div>
  );
}
