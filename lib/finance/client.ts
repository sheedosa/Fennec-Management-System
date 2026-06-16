import type { FennecData, Transaction } from "@/lib/types";

// Ported verbatim from prototype `renderClients()` / `renderClientDetail()`.
// Lifetime value is NOT period-filtered — it is the all-time revenue from
// every project belonging to the client.

/** All-time revenue across a client's projects. */
export function clientLTV(data: FennecData, clientId: string): number {
  const projIds = new Set(
    data.projects.filter((p) => p.clientId === clientId).map((p) => p.id),
  );
  return data.transactions
    .filter((t) => t.type === "revenue" && t.projectId != null && projIds.has(t.projectId))
    .reduce((a, b) => a + b.amount, 0);
}

/** A client's revenue transactions (payment history), newest first. */
export function clientPayments(data: FennecData, clientId: string): Transaction[] {
  const projIds = new Set(
    data.projects.filter((p) => p.clientId === clientId).map((p) => p.id),
  );
  return data.transactions
    .filter((t) => t.type === "revenue" && t.projectId != null && projIds.has(t.projectId))
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}
