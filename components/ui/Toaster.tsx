"use client";

import { useEffect, useState } from "react";

export type ToastKind = "success" | "danger" | "info";
interface Toast {
  id: number;
  msg: string;
  kind: ToastKind;
  undo?: () => void;
}

let seq = 1;
let toasts: Toast[] = [];
const listeners = new Set<(t: Toast[]) => void>();
const emit = () => listeners.forEach((l) => l([...toasts]));

function push(msg: string, kind: ToastKind, undo?: () => void) {
  const id = seq++;
  toasts = [...toasts, { id, msg, kind, undo }];
  emit();
  setTimeout(() => dismiss(id), undo ? 6000 : 4000);
}
function dismiss(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export const toast = {
  success: (msg: string) => push(msg, "success"),
  error: (msg: string) => push(msg, "danger"),
  info: (msg: string) => push(msg, "info"),
  undo: (msg: string, onUndo: () => void) => push(msg, "info", onUndo),
};

const TONE: Record<ToastKind, string> = {
  success: "var(--success)",
  danger: "var(--danger)",
  info: "var(--fg)",
};

export function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(() => {
    listeners.add(setItems);
    return () => {
      listeners.delete(setItems);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "max(20px, env(safe-area-inset-bottom))",
        insetInlineStart: "50%",
        transform: "translateX(-50%)",
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        alignItems: "center",
        pointerEvents: "none",
        width: "max-content",
        maxWidth: "92vw",
      }}
    >
      {items.map((t) => (
        <div
          key={t.id}
          style={{
            pointerEvents: "auto",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "var(--surface-3)",
            color: "var(--fg)",
            border: "1px solid var(--border-strong)",
            borderRadius: "12px",
            padding: "12px 16px",
            boxShadow: "var(--elev-2)",
            fontSize: "14px",
            fontWeight: 600,
            animation: "fxToast .28s var(--ease-out)",
          }}
        >
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: TONE[t.kind], flexShrink: 0 }} />
          <span>{t.msg}</span>
          {t.undo ? (
            <button
              onClick={() => {
                t.undo!();
                dismiss(t.id);
              }}
              style={{ background: "none", border: "none", color: "var(--interactive)", fontWeight: 800, cursor: "pointer", fontSize: "13.5px", padding: 0 }}
            >
              تراجع
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
