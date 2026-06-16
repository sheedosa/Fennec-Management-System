import type { Period } from "@/lib/types";

// Ported verbatim from prototype `periodRange()`, `inPeriod()`, `ymKey()`,
// `curYM()`, `last6Months()`. `now` is injectable (prototype hardcoded
// `new Date(2026,5,14)`); production passes the real current date.

export interface DateRange {
  s: Date;
  e: Date;
}

/** Inclusive start/end for the selected period, or null for "all". */
export function periodRange(period: Period, now: Date): DateRange | null {
  const y = now.getFullYear();
  const m = now.getMonth();
  if (period === "all") return null;
  if (period === "month") return { s: new Date(y, m, 1), e: new Date(y, m + 1, 0, 23, 59, 59) };
  if (period === "quarter") {
    const q = Math.floor(m / 3) * 3;
    return { s: new Date(y, q, 1), e: new Date(y, q + 3, 0, 23, 59, 59) };
  }
  if (period === "year") return { s: new Date(y, 0, 1), e: new Date(y, 11, 31, 23, 59, 59) };
  return null;
}

/** Whether a YYYY-MM-DD date string falls within the selected period. */
export function inPeriod(dateStr: string, period: Period, now: Date): boolean {
  const r = periodRange(period, now);
  if (!r) return true;
  const d = new Date(dateStr);
  return d >= r.s && d <= r.e;
}

/** YYYY-MM key for a date string. */
export function ymKey(dateStr: string): string {
  const d = new Date(dateStr);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
}

/** YYYY-MM key for "now" — used for retainer/fixed-expense dedup. */
export function curYM(now: Date): string {
  return now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
}

export interface MonthBucket {
  y: number;
  m: number;
}

/** The six month buckets ending at `now` (oldest first). */
export function last6Months(now: Date): MonthBucket[] {
  const arr: MonthBucket[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    arr.push({ y: d.getFullYear(), m: d.getMonth() });
  }
  return arr;
}
