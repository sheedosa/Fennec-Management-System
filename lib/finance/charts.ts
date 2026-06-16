import type { FennecData, Period } from "@/lib/types";
import { inPeriod, last6Months } from "./period";

// Ported verbatim from prototype `trendChart()`, `donutChart()`,
// `topClientsChart()` and `renderMasterTable()` — the PURE math only.
// Presentational SVG components consume these series.

export interface TrendPoint {
  y: number;
  m: number;
  rev: number;
  exp: number;
}

/** Revenue vs expenses (cost + overhead) for the six months ending at `now`. */
export function trendSeries(data: FennecData, now: Date): TrendPoint[] {
  return last6Months(now).map((mo) => {
    const inMonth = (dateStr: string) => {
      const dt = new Date(dateStr);
      return dt.getFullYear() === mo.y && dt.getMonth() === mo.m;
    };
    const rev = data.transactions
      .filter((t) => t.type === "revenue" && inMonth(t.date))
      .reduce((a, b) => a + b.amount, 0);
    const exp = data.transactions
      .filter((t) => (t.type === "cost" || t.type === "overhead") && inMonth(t.date))
      .reduce((a, b) => a + b.amount, 0);
    return { y: mo.y, m: mo.m, rev, exp };
  });
}

export interface DonutSegment {
  key: string;
  val: number;
  color: string;
}

/** Expense breakdown by category for the period (segments with val > 0 only). */
export function donutSegments(data: FennecData, period: Period, now: Date): DonutSegment[] {
  const txp = data.transactions.filter((t) => inPeriod(t.date, period, now));
  const sumOverhead = (cat: string) =>
    txp
      .filter((t) => t.type === "overhead" && t.category === cat)
      .reduce((a, b) => a + b.amount, 0);
  return [
    { key: "projectCosts", val: txp.filter((t) => t.type === "cost").reduce((a, b) => a + b.amount, 0), color: "#b8542f" },
    { key: "salaries", val: sumOverhead("salaries"), color: "#8062c4" },
    { key: "rent", val: sumOverhead("rent"), color: "#c9821f" },
    { key: "internet", val: sumOverhead("internet"), color: "#15924f" },
    { key: "operations", val: sumOverhead("operations"), color: "#2f8f86" },
  ].filter((s) => s.val > 0);
}

export interface TopClientRow {
  clientId: string;
  val: number;
}

/** Top 5 clients by revenue for the period. */
export function topClients(data: FennecData, period: Period, now: Date): TopClientRow[] {
  const map: Record<string, number> = {};
  data.transactions
    .filter((t) => t.type === "revenue" && inPeriod(t.date, period, now))
    .forEach((t) => {
      const p = data.projects.find((p) => p.id === t.projectId);
      const cid = p ? p.clientId : "_";
      map[cid] = (map[cid] || 0) + t.amount;
    });
  return Object.keys(map)
    .map((clientId) => ({ clientId, val: map[clientId] }))
    .sort((a, b) => b.val - a.val)
    .slice(0, 5);
}

export interface ProjectReturn {
  projectId: string;
  rev: number;
  cost: number;
  net: number;
}

/** Net return per project for the period (master table). */
export function projectReturns(data: FennecData, period: Period, now: Date): ProjectReturn[] {
  return data.projects.map((p) => {
    const rev = data.transactions
      .filter((t) => t.type === "revenue" && t.projectId === p.id && inPeriod(t.date, period, now))
      .reduce((a, b) => a + b.amount, 0);
    const cost = data.transactions
      .filter((t) => t.type === "cost" && t.projectId === p.id && inPeriod(t.date, period, now))
      .reduce((a, b) => a + b.amount, 0);
    return { projectId: p.id, rev, cost, net: rev - cost };
  });
}
