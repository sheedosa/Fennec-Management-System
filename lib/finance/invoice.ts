import type { Invoice, InvoiceStatus, Project } from "@/lib/types";

// Ported verbatim from prototype `invEffStatus()`, `invTotal()`,
// `isOverdueProject()`. Overdue is ALWAYS derived at read time, never
// trusted from a stored flag.

/** Effective invoice status: a sent invoice past its due date reads as overdue. */
export function invEffStatus(inv: Pick<Invoice, "status" | "dueDate">, now: Date): InvoiceStatus {
  if (inv.status === "paid" || inv.status === "draft") return inv.status;
  const due = new Date(inv.dueDate);
  if (inv.status === "sent" && due < now) return "overdue";
  return inv.status;
}

/** Sum of an invoice's line items. */
export function invTotal(inv: Pick<Invoice, "items">): number {
  return (inv.items || []).reduce((a, b) => a + (Number(b.amount) || 0), 0);
}

/** Unpaid balance of an invoice. */
export function invRemaining(inv: Pick<Invoice, "items" | "paidAmount">): number {
  return invTotal(inv) - (inv.paidAmount || 0);
}

/** A project is overdue when it's not completed/cancelled and past its end date. */
export function isOverdueProject(p: Pick<Project, "status" | "endDate">, now: Date): boolean {
  if (p.status === "completed" || p.status === "cancelled") return false;
  return new Date(p.endDate) < now;
}
