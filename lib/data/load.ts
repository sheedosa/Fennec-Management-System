import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type {
  FennecData,
  Client,
  Project,
  Invoice,
  Transaction,
  Lead,
  FixedExpense,
} from "@/lib/types";

// Loads all of an org's data and maps DB rows (snake_case, normalized
// invoice_items) into the canonical FennecData domain shape that the pure
// finance layer consumes. RLS guarantees only the caller's org is returned,
// so we don't filter by org_id here — but we do exclude soft-deleted rows.

const n = (v: number | string | null) => Number(v ?? 0);

export const loadFennecData = cache(async (): Promise<FennecData> => {
  const supabase = await createClient();

  const [clientsRes, projectsRes, invoicesRes, itemsRes, txRes, leadsRes, fixedRes] =
    await Promise.all([
      supabase.from("clients").select("*").is("deleted_at", null),
      supabase.from("projects").select("*").is("deleted_at", null),
      supabase.from("invoices").select("*").is("deleted_at", null),
      supabase.from("invoice_items").select("*").order("position", { ascending: true }),
      supabase.from("transactions").select("*").is("deleted_at", null),
      supabase.from("leads").select("*").is("deleted_at", null),
      supabase.from("fixed_expenses").select("*").is("deleted_at", null),
    ]);

  const clients: Client[] = (clientsRes.data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    contact: c.contact ?? undefined,
    phone: c.phone ?? undefined,
    email: c.email ?? undefined,
    notes: c.notes ?? undefined,
    date: c.created_on,
  }));

  const projects: Project[] = (projectsRes.data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    clientId: p.client_id,
    type: p.type,
    value: n(p.value),
    monthly: p.monthly == null ? undefined : n(p.monthly),
    startDate: p.start_date,
    endDate: p.end_date,
    status: p.status,
    date: p.created_on,
  }));

  // group invoice items by invoice
  const itemsByInvoice = new Map<string, { desc: string; amount: number }[]>();
  for (const it of itemsRes.data ?? []) {
    const arr = itemsByInvoice.get(it.invoice_id) ?? [];
    arr.push({ desc: it.description, amount: n(it.amount) });
    itemsByInvoice.set(it.invoice_id, arr);
  }

  const invoices: Invoice[] = (invoicesRes.data ?? []).map((iv) => ({
    id: iv.id,
    number: iv.number,
    projectId: iv.project_id,
    clientId: iv.client_id,
    issueDate: iv.issue_date,
    dueDate: iv.due_date,
    items: itemsByInvoice.get(iv.id) ?? [],
    status: iv.status,
    paidAmount: n(iv.paid_amount),
    filePath: iv.file_path,
    date: iv.created_on,
  }));

  const transactions: Transaction[] = (txRes.data ?? []).map((t) => ({
    id: t.id,
    type: t.type,
    amount: n(t.amount),
    projectId: t.project_id,
    category: t.overhead_category ?? undefined,
    invoiceId: t.invoice_id,
    desc: t.description ?? undefined,
    date: t.tx_date,
    retainerYM: t.retainer_ym ?? undefined,
  }));

  const leads: Lead[] = (leadsRes.data ?? []).map((l) => ({
    id: l.id,
    name: l.name,
    clientId: l.client_id,
    value: n(l.value),
    stage: l.stage,
    lostReason: l.lost_reason ?? undefined,
    date: l.created_on,
  }));

  const fixedExpenses: FixedExpense[] = (fixedRes.data ?? []).map((f) => ({
    id: f.id,
    name: f.name,
    amount: n(f.amount),
    category: f.category,
    date: f.created_on,
    lastGen: f.last_gen ?? "",
  }));

  return { clients, projects, invoices, transactions, leads, fixedExpenses };
});
