"use client";

import { useFormStatus } from "react-dom";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const VARIANT: Record<Variant, React.CSSProperties> = {
  primary: { background: "var(--accent)", color: "var(--accent-contrast)", border: "1px solid var(--accent)" },
  secondary: { background: "var(--surface)", color: "var(--fg)", border: "1px solid var(--border-strong)" },
  ghost: { background: "transparent", color: "var(--fg)", border: "1px solid transparent" },
  danger: { background: "var(--danger-bg)", color: "var(--danger)", border: "1px solid transparent" },
};
const SIZE: Record<Size, React.CSSProperties> = {
  sm: { padding: "7px 12px", fontSize: "13px", borderRadius: "10px" },
  md: { padding: "10px 16px", fontSize: "14.5px", borderRadius: "12px" },
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  iconStart?: React.ReactNode;
  block?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading,
  iconStart,
  block,
  children,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      style={{
        display: block ? "flex" : "inline-flex",
        width: block ? "100%" : undefined,
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        fontWeight: 700,
        cursor: disabled || loading ? "default" : "pointer",
        opacity: disabled || loading ? 0.6 : 1,
        whiteSpace: "nowrap",
        transition: "filter var(--dur-fast) var(--ease-out), opacity var(--dur-fast)",
        minHeight: size === "md" ? "44px" : "36px",
        ...VARIANT[variant],
        ...SIZE[size],
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) e.currentTarget.style.filter = "brightness(0.94)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = "none";
      }}
    >
      {loading ? "…" : iconStart}
      {children}
    </button>
  );
}

/** Submit button that reflects a form's pending state (for Server Actions). */
export function SubmitButton({ children, ...rest }: ButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} {...rest}>
      {children}
    </Button>
  );
}
