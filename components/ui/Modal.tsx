"use client";

import { useEffect, useRef } from "react";

type Size = "sm" | "md" | "lg";
const WIDTH: Record<Size, string> = { sm: "420px", md: "520px", lg: "680px" };

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: Size;
}) {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // focus first focusable element in the dialog
    const t = setTimeout(() => {
      const el = boxRef.current?.querySelector<HTMLElement>(
        'input,select,textarea,button,[tabindex]:not([tabindex="-1"])',
      );
      el?.focus();
    }, 30);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,.55)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "max(16px, env(safe-area-inset-top)) 16px 40px",
        overflowY: "auto",
      }}
    >
      <div
        ref={boxRef}
        style={{
          width: "100%",
          maxWidth: WIDTH[size],
          marginTop: "6vh",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "18px",
          boxShadow: "var(--elev-2)",
          animation: "fxModal .22s var(--ease-out)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "18px 20px", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, background: "var(--surface)", borderRadius: "18px 18px 0 0", zIndex: 1 }}>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "var(--fg)" }}>{title}</h3>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            style={{ width: "34px", height: "34px", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--fg-muted)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div style={{ padding: "20px" }}>{children}</div>
        {footer ? (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", padding: "14px 20px", borderTop: "1px solid var(--border)", position: "sticky", bottom: 0, background: "var(--surface)", borderRadius: "0 0 18px 18px" }}>
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
