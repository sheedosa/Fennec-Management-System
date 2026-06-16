import type { FennecData, Period } from "@/lib/types";
import { inPeriod } from "./period";
import { invEffStatus, invTotal } from "./invoice";

// Ported verbatim from prototype `metrics()`. The single source of truth
// for every dashboard KPI. Must produce numbers byte-identical to the
// prototype for the same data — this is the correctness keystone.

export interface Metrics {
  revenue: number;
  costs: number;
  overhead: number;
  net: number;
  margin: number;
  outstanding: number;
  active: number;
}

export function metrics(data: FennecData, period: Period, now: Date): Metrics {
  const txp = data.transactions.filter((t) => inPeriod(t.date, period, now));
  const revenue = txp.filter((t) => t.type === "revenue").reduce((a, b) => a + b.amount, 0);
  const costs = txp.filter((t) => t.type === "cost").reduce((a, b) => a + b.amount, 0);
  const overhead = txp.filter((t) => t.type === "overhead").reduce((a, b) => a + b.amount, 0);
  const net = revenue - costs - overhead;
  const margin = revenue > 0 ? (net / revenue) * 100 : 0;
  const outstanding = data.invoices
    .filter((i) => {
      const s = invEffStatus(i, now);
      return (s === "sent" || s === "overdue") && inPeriod(i.issueDate, period, now);
    })
    .reduce((a, b) => a + (invTotal(b) - (b.paidAmount || 0)), 0);
  const active = data.projects.filter((p) => p.status === "active").length;
  return { revenue, costs, overhead, net, margin, outstanding, active };
}
