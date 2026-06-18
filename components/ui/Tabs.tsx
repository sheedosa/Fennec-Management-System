"use client";

import { useState } from "react";

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

export function Tabs({ tabs, initial }: { tabs: TabItem[]; initial?: string }) {
  const [active, setActive] = useState(initial ?? tabs[0]?.id);

  return (
    <div>
      <div
        role="tablist"
        style={{
          display: "flex",
          gap: "4px",
          overflowX: "auto",
          borderBottom: "1px solid var(--border)",
          marginBottom: "18px",
        }}
      >
        {tabs.map((t) => {
          const on = t.id === active;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={on}
              onClick={() => setActive(t.id)}
              style={{
                padding: "10px 14px",
                border: "none",
                borderBottom: on ? "2px solid var(--accent)" : "2px solid transparent",
                background: "transparent",
                color: on ? "var(--fg)" : "var(--fg-muted)",
                fontWeight: on ? 800 : 600,
                fontSize: "14px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                marginBottom: "-1px",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {tabs.map((t) => (
        <div key={t.id} role="tabpanel" hidden={t.id !== active}>
          {t.id === active ? t.content : null}
        </div>
      ))}
    </div>
  );
}
