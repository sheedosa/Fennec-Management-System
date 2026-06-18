type Tone = "neutral" | "success" | "danger" | "outline";

const TONE: Record<Tone, { fg: string; bg: string }> = {
  neutral: { fg: "var(--fg-muted)", bg: "var(--surface-2)" },
  success: { fg: "var(--success)", bg: "var(--success-bg)" },
  danger: { fg: "var(--danger)", bg: "var(--danger-bg)" },
  outline: { fg: "var(--fg)", bg: "transparent" },
};

export function Badge({
  children,
  tone = "neutral",
  dot,
}: {
  children: React.ReactNode;
  tone?: Tone;
  dot?: boolean;
}) {
  const c = TONE[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 11px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: 700,
        color: c.fg,
        background: c.bg,
        border: tone === "outline" ? "1px solid var(--border-strong)" : "none",
        whiteSpace: "nowrap",
        lineHeight: 1.4,
      }}
    >
      {dot ? <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: c.fg, flexShrink: 0 }} /> : null}
      {children}
    </span>
  );
}
