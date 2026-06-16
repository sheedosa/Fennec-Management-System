import type { Locale } from "@/lib/types";

// Status → [color, soft-bg, ar, en]. Covers project + invoice statuses.
const MAP: Record<string, [string, string, string, string]> = {
  active: ["#15924f", "#e8f5ec", "نشط", "Active"],
  hold: ["#c9821f", "#fbf1df", "معلّق", "On Hold"],
  completed: ["#b8542f", "#f8ece3", "مكتمل", "Completed"],
  cancelled: ["#d24b3e", "#fbece9", "ملغى", "Cancelled"],
  overdue: ["#d24b3e", "#fbece9", "متأخر", "Overdue"],
  draft: ["#6e645a", "#f1e9dc", "مسودة", "Draft"],
  sent: ["#c9821f", "#fbf1df", "مُرسلة", "Sent"],
  paid: ["#15924f", "#e8f5ec", "مدفوعة", "Paid"],
};

export function StatusBadge({ status, locale }: { status: string; locale: Locale }) {
  const [color, bg, ar, en] = MAP[status] ?? ["#6e645a", "#f1e9dc", status, status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 11px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, color, background: bg, whiteSpace: "nowrap", lineHeight: 1.4 }}>
      <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: color, flexShrink: 0 }} />
      {locale === "en" ? en : ar}
    </span>
  );
}
