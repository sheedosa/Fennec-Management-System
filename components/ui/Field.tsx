import React from "react";

const baseField: React.CSSProperties = {
  width: "100%",
  padding: "11px 13px",
  borderRadius: "12px",
  border: "1px solid var(--border-strong)",
  background: "var(--surface)",
  color: "var(--fg)",
  fontSize: "14.5px",
  outline: "none",
  minHeight: "44px",
};

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "block", marginBottom: "14px" }}>
      {label ? (
        <span style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--fg-muted)", marginBottom: "6px" }}>
          {label}
        </span>
      ) : null}
      {children}
      {error ? (
        <span style={{ display: "block", fontSize: "12px", color: "var(--danger)", marginTop: "5px", fontWeight: 600 }}>{error}</span>
      ) : hint ? (
        <span style={{ display: "block", fontSize: "12px", color: "var(--fg-faint)", marginTop: "5px" }}>{hint}</span>
      ) : null}
    </label>
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  function Input({ invalid, style, ...rest }, ref) {
    return <input ref={ref} {...rest} style={{ ...baseField, borderColor: invalid ? "var(--danger)" : "var(--border-strong)", ...style }} />;
  },
);

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ style, rows = 3, ...rest }, ref) {
    return <textarea ref={ref} rows={rows} {...rest} style={{ ...baseField, minHeight: "auto", resize: "vertical", ...style }} />;
  },
);

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ style, children, ...rest }, ref) {
    return (
      <select ref={ref} {...rest} style={{ ...baseField, cursor: "pointer", ...style }}>
        {children}
      </select>
    );
  },
);
