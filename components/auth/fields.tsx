"use client";

import { useFormStatus } from "react-dom";

export function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
  dir,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  dir?: "ltr" | "rtl";
}) {
  return (
    <label style={{ display: "block", marginBottom: "14px" }}>
      <span
        style={{
          display: "block",
          fontSize: "13px",
          fontWeight: 700,
          color: "var(--color-sub)",
          marginBottom: "6px",
        }}
      >
        {label}
      </span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        dir={dir}
        style={{
          width: "100%",
          padding: "11px 13px",
          borderRadius: "12px",
          border: "1px solid var(--color-border)",
          background: "#fff",
          fontSize: "14.5px",
          outline: "none",
          color: "var(--color-navy)",
        }}
      />
    </label>
  );
}

export function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        width: "100%",
        padding: "12px",
        borderRadius: "12px",
        border: "1px solid var(--color-blue)",
        background: "var(--color-blue)",
        color: "#fff",
        fontWeight: 700,
        fontSize: "15px",
        cursor: pending ? "default" : "pointer",
        opacity: pending ? 0.7 : 1,
        boxShadow: "0 4px 12px rgba(184,84,47,.26)",
      }}
    >
      {pending ? "..." : label}
    </button>
  );
}

export function FormMessage({ error, notice }: { error?: string; notice?: string }) {
  if (!error && !notice) return null;
  const isErr = !!error;
  return (
    <div
      style={{
        padding: "10px 13px",
        borderRadius: "10px",
        fontSize: "13px",
        fontWeight: 600,
        marginBottom: "14px",
        color: isErr ? "var(--color-red)" : "var(--color-green)",
        background: isErr ? "var(--color-red-soft)" : "var(--color-green-soft)",
      }}
    >
      {error || notice}
    </div>
  );
}
