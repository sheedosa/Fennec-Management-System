import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import type { FennecData } from "@/lib/types";

type DB = SupabaseClient<Database>;

// Inserts a full FennecData set into one org, rewiring the prototype's
// string IDs (c1, p1, inv1, …) to fresh UUIDs and threading org_id through.
// UUIDs are pre-generated so foreign keys can be mapped without round-trips.
// Shared by the demo-data loader and the Phase 5 import wizard.
export async function importFennecData(supabase: DB, orgId: string, data: FennecData) {
  const uuid = () => crypto.randomUUID();
  const clientMap = new Map<string, string>();
  const projectMap = new Map<string, string>();
  const invoiceMap = new Map<string, string>();

  // clients
  const clientRows = data.clients.map((c) => {
    const id = uuid();
    clientMap.set(c.id, id);
    return {
      id,
      org_id: orgId,
      name: c.name,
      contact: c.contact ?? null,
      phone: c.phone ?? null,
      email: c.email ?? null,
      notes: c.notes ?? null,
      created_on: c.date,
    };
  });
  if (clientRows.length) {
    const { error } = await supabase.from("clients").insert(clientRows);
    if (error) throw new Error("clients: " + error.message);
  }

  // projects
  const projectRows = data.projects.map((p) => {
    const id = uuid();
    projectMap.set(p.id, id);
    return {
      id,
      org_id: orgId,
      client_id: clientMap.get(p.clientId)!,
      name: p.name,
      type: p.type,
      value: p.value,
      monthly: p.type === "retainer" ? (p.monthly ?? 0) : null,
      start_date: p.startDate,
      end_date: p.endDate,
      status: p.status,
      created_on: p.date,
    };
  });
  if (projectRows.length) {
    const { error } = await supabase.from("projects").insert(projectRows);
    if (error) throw new Error("projects: " + error.message);
  }

  // invoices + items
  const invoiceRows = data.invoices.map((iv) => {
    const id = uuid();
    invoiceMap.set(iv.id, id);
    return {
      id,
      org_id: orgId,
      client_id: clientMap.get(iv.clientId)!,
      project_id: iv.projectId ? (projectMap.get(iv.projectId) ?? null) : null,
      number: iv.number,
      issue_date: iv.issueDate,
      due_date: iv.dueDate,
      status: iv.status,
      paid_amount: iv.paidAmount ?? 0,
      created_on: iv.date,
    };
  });
  if (invoiceRows.length) {
    const { error } = await supabase.from("invoices").insert(invoiceRows);
    if (error) throw new Error("invoices: " + error.message);
  }
  const itemRows = data.invoices.flatMap((iv) =>
    (iv.items || []).map((it, i) => ({
      org_id: orgId,
      invoice_id: invoiceMap.get(iv.id)!,
      description: it.desc,
      amount: it.amount,
      position: i,
    })),
  );
  if (itemRows.length) {
    const { error } = await supabase.from("invoice_items").insert(itemRows);
    if (error) throw new Error("invoice_items: " + error.message);
  }

  // transactions
  const txRows = data.transactions.map((t) => ({
    org_id: orgId,
    type: t.type,
    amount: t.amount,
    project_id: t.projectId ? (projectMap.get(t.projectId) ?? null) : null,
    overhead_category: t.type === "overhead" ? (t.category ?? null) : null,
    invoice_id: t.invoiceId ? (invoiceMap.get(t.invoiceId) ?? null) : null,
    description: t.desc ?? null,
    tx_date: t.date,
    retainer_ym: t.retainerYM ?? null,
  }));
  if (txRows.length) {
    const { error } = await supabase.from("transactions").insert(txRows);
    if (error) throw new Error("transactions: " + error.message);
  }

  // leads
  const leadRows = data.leads.map((l) => ({
    org_id: orgId,
    client_id: clientMap.get(l.clientId)!,
    name: l.name,
    value: l.value,
    stage: l.stage,
    lost_reason: l.stage === "lost" ? (l.lostReason ?? "other") : null,
    created_on: l.date,
  }));
  if (leadRows.length) {
    const { error } = await supabase.from("leads").insert(leadRows);
    if (error) throw new Error("leads: " + error.message);
  }

  // fixed expenses
  const fixedRows = data.fixedExpenses.map((f) => ({
    org_id: orgId,
    name: f.name,
    amount: f.amount,
    category: f.category,
    last_gen: f.lastGen || null,
    created_on: f.date,
  }));
  if (fixedRows.length) {
    const { error } = await supabase.from("fixed_expenses").insert(fixedRows);
    if (error) throw new Error("fixed_expenses: " + error.message);
  }
}
