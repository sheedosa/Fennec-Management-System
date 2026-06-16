"use client";

import { useState, useTransition } from "react";
import type { ThemePref } from "@/lib/theme";
import { setTheme } from "@/actions/org";

const ORDER: ThemePref[] = ["dark", "light", "system"];
const LABEL: Record<ThemePref, string> = { dark: "داكن", light: "فاتح", system: "تلقائي" };

function Icon({ pref }: { pref: ThemePref }) {
  const p = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (pref === "dark") return <svg {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>;
  if (pref === "light")
    return (
      <svg {...p}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    );
  return (
    <svg {...p}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

export function ThemeToggle({ current }: { current: ThemePref }) {
  const [pref, setPref] = useState<ThemePref>(current);
  const [, startTransition] = useTransition();

  const cycle = () => {
    const next = ORDER[(ORDER.indexOf(pref) + 1) % ORDER.length];
    setPref(next);
    // optimistic: apply immediately
    const resolved =
      next === "system"
        ? matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : next;
    document.documentElement.dataset.theme = resolved;
    startTransition(() => setTheme(next));
  };

  return (
    <button
      onClick={cycle}
      aria-label={`السمة: ${LABEL[pref]}`}
      title={`السمة: ${LABEL[pref]}`}
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "11px",
        border: "1px solid var(--color-border)",
        background: "var(--color-card)",
        color: "var(--color-sub)",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon pref={pref} />
    </button>
  );
}
