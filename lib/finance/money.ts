import type { Locale } from "@/lib/types";

// Ported verbatim from prototype `money()` and `num()`.
// The prototype stores and computes money as whole integers (Math.round),
// formatting with the en-US thousands separator plus a locale suffix.

/** Format an amount as the prototype does: rounded int, en-US grouping, locale suffix. */
export function money(n: number, lang: Locale = "ar"): string {
  const v = Math.round(Number(n) || 0);
  return v.toLocaleString("en-US") + (lang === "en" ? " LYD" : " د.ل");
}

/** Parse a user-entered number, stripping commas. Returns null when not a number. */
export function num(v: unknown): number | null {
  const n = parseFloat(String(v).replace(/,/g, ""));
  return isNaN(n) ? null : n;
}
