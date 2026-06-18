import Link from "next/link";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="breadcrumb" style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "14px", fontSize: "13px", color: "var(--fg-muted)" }}>
      {items.map((it, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
          {it.href && i < items.length - 1 ? (
            <Link href={it.href} style={{ color: "var(--fg-muted)", textDecoration: "none" }}>{it.label}</Link>
          ) : (
            <span style={{ color: "var(--fg)", fontWeight: 700 }}>{it.label}</span>
          )}
          {i < items.length - 1 ? <span style={{ color: "var(--fg-faint)" }}>/</span> : null}
        </span>
      ))}
    </nav>
  );
}
