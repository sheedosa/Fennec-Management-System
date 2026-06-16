// Ported from prototype `card()`.
export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "18px",
        boxShadow: "var(--elev-1)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SectionHead({
  title,
  sub,
  actions,
}: {
  title: string;
  sub?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "14px", flexWrap: "wrap", marginBottom: "22px" }}>
      <div style={{ minWidth: 0 }}>
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "var(--color-navy)", letterSpacing: "-.01em" }}>{title}</h2>
        {sub ? <p style={{ margin: "6px 0 0", color: "var(--color-sub)", fontSize: "14.5px", lineHeight: 1.5 }}>{sub}</p> : null}
      </div>
      {actions ? <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>{actions}</div> : null}
    </div>
  );
}
