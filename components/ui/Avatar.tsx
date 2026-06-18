// Monochrome initial-avatar (replaces the per-page gradient duplication).
export function Avatar({ name, size = 46 }: { name: string; size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${Math.round(size * 0.28)}px`,
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        color: "var(--fg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        fontSize: `${Math.round(size * 0.4)}px`,
        flexShrink: 0,
      }}
    >
      {(name || "?").charAt(0)}
    </div>
  );
}
