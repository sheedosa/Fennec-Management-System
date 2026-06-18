import React from "react";

export interface Column<T> {
  key: string;
  header: string;
  align?: "start" | "end" | "center";
  render: (row: T) => React.ReactNode;
}

// Presentational, RSC-friendly table. Below 768px it collapses each row into a
// stacked "card" (CSS in globals.css via .ui-table + data-label), eliminating
// horizontal scroll on mobile.
export function Table<T>({
  columns,
  rows,
  rowKey,
  empty,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  empty?: React.ReactNode;
}) {
  if (!rows.length && empty) return <>{empty}</>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="ui-table" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                style={{
                  padding: "13px 16px",
                  textAlign: c.align ?? "start",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--fg-muted)",
                  background: "var(--surface-2)",
                  borderBottom: "1px solid var(--border)",
                  whiteSpace: "nowrap",
                }}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={rowKey(r)}>
              {columns.map((c) => (
                <td
                  key={c.key}
                  data-label={c.header}
                  style={{
                    padding: "13px 16px",
                    textAlign: c.align ?? "start",
                    fontSize: "14px",
                    color: "var(--fg)",
                    borderBottom: "1px solid var(--border)",
                    verticalAlign: "middle",
                  }}
                >
                  {c.render(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
