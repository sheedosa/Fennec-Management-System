import type { Locale } from "@/lib/types";

// Monochrome badges: money-relevant statuses keep colour (paid=green,
// overdue/cancelled=red); everything else is neutral grey. Colours come from
// theme tokens so they flip with light/dark.
type Tone = "success" | "danger" | "neutral";
const MAP: Record<string, [Tone, string, string]> = {
  active: ["neutral", "نشط", "Active"],
  hold: ["neutral", "معلّق", "On Hold"],
  completed: ["neutral", "مكتمل", "Completed"],
  cancelled: ["danger", "ملغى", "Cancelled"],
  overdue: ["danger", "متأخر", "Overdue"],
  draft: ["neutral", "مسودة", "Draft"],
  sent: ["neutral", "مُرسلة", "Sent"],
  paid: ["success", "مدفوعة", "Paid"],
};

const TONE: Record<Tone, { fg: string; bg: string }> = {
  success: { fg: "var(--color-green)", bg: "var(--color-green-soft)" },
  danger: { fg: "var(--color-red)", bg: "var(--color-red-soft)" },
  neutral: { fg: "var(--color-sub)", bg: "var(--color-card-alt)" },
};

export function StatusBadge({ status, locale }: { status: string; locale: Locale }) {
  const [tone, ar, en] = MAP[status] ?? (["neutral", status, status] as [Tone, string, string]);
  const c = TONE[tone];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 11px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, color: c.fg, background: c.bg, whiteSpace: "nowrap", lineHeight: 1.4 }}>
      <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: c.fg, flexShrink: 0 }} />
      {locale === "en" ? en : ar}
    </span>
  );
}
