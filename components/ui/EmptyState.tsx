// Ported from prototype `empty()`.
export function EmptyState({
  message,
  icon = ["M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"],
  cta,
}: {
  message: string;
  icon?: string[];
  cta?: React.ReactNode;
}) {
  return (
    <div style={{ padding: "44px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
      <div style={{ width: "54px", height: "54px", borderRadius: "16px", background: "var(--color-bg)", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "6px" }}>
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="var(--color-faint)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          {icon.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </svg>
      </div>
      <div style={{ color: "var(--color-gray)", fontSize: "15px", fontWeight: 600, maxWidth: "340px", lineHeight: 1.6 }}>{message}</div>
      {cta ? <div style={{ marginTop: "12px" }}>{cta}</div> : null}
    </div>
  );
}
