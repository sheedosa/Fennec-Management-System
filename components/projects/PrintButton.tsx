"use client";

import { useEffect } from "react";

export function PrintButton({ label, auto }: { label: string; auto?: boolean }) {
  useEffect(() => {
    if (auto) {
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, [auto]);
  return (
    <button
      className="no-print"
      onClick={() => window.print()}
      style={{ padding: "10px 16px", borderRadius: "10px", border: "1px solid #111", background: "#111", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: "14px" }}
    >
      {label}
    </button>
  );
}
