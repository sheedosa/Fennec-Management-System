import { createClient } from "@/lib/supabase/server";
import type { Project, Client, Invoice, Transaction, ProjectTask, CalendarEvent } from "@/lib/types";
import { invTotal, invRemaining, invEffStatus } from "@/lib/finance/invoice";

const n = (v: number | string | null) => Number(v ?? 0);

export interface ProjectDetail {
  project: Project;
  client: Client | null;
  tasks: ProjectTask[];
  costs: Transaction[];
  revenues: Transaction[];
  invoices: Invoice[];
  events: CalendarEvent[];
  kpis: { contractValue: number; collected: number; expenses: number; net: number; outstanding: number };
}

/** Everything the project mini-dashboard needs. RLS scopes to the caller's org. */
export async function loadProjectDetail(projectId: string): Promise<ProjectDetail | null> {
  const supabase = await createClient();

  const { data: p } = await supabase.from("projects").select("*").eq("id", projectId).is("deleted_at", null).maybeSingle();
  if (!p) return null;

  const [clientRes, tasksRes, txRes, invRes, itemsRes, evRes] = await Promise.all([
    supabase.from("clients").select("*").eq("id", p.client_id).maybeSingle(),
    supabase.from("project_tasks").select("*").eq("project_id", projectId).is("deleted_at", null).order("position", { ascending: true }),
    supabase.from("transactions").select("*").eq("project_id", projectId).is("deleted_at", null).order("tx_date", { ascending: false }),
    supabase.from("invoices").select("*").eq("project_id", projectId).is("deleted_at", null),
    supabase.from("invoice_items").select("*"),
    supabase.from("calendar_events").select("*").eq("project_id", projectId).is("deleted_at", null).order("starts_at", { ascending: true }),
  ]);

  const project: Project = {
    id: p.id, name: p.name, clientId: p.client_id, type: p.type, value: n(p.value),
    monthly: p.monthly == null ? undefined : n(p.monthly), startDate: p.start_date, endDate: p.end_date,
    status: p.status, date: p.created_on,
  };
  const c = clientRes.data;
  const client: Client | null = c
    ? { id: c.id, name: c.name, contact: c.contact ?? undefined, phone: c.phone ?? undefined, email: c.email ?? undefined, notes: c.notes ?? undefined, date: c.created_on }
    : null;

  const tasks: ProjectTask[] = (tasksRes.data ?? []).map((t) => ({ id: t.id, projectId: t.project_id, title: t.title, done: t.done, dueDate: t.due_date, position: t.position, date: t.created_on }));

  const allTx: Transaction[] = (txRes.data ?? []).map((t) => ({ id: t.id, type: t.type, amount: n(t.amount), projectId: t.project_id, category: t.overhead_category ?? undefined, invoiceId: t.invoice_id, desc: t.description ?? undefined, date: t.tx_date, retainerYM: t.retainer_ym ?? undefined }));
  const costs = allTx.filter((t) => t.type === "cost");
  const revenues = allTx.filter((t) => t.type === "revenue");

  const itemsByInv = new Map<string, { desc: string; amount: number }[]>();
  for (const it of itemsRes.data ?? []) {
    const arr = itemsByInv.get(it.invoice_id) ?? [];
    arr.push({ desc: it.description, amount: n(it.amount) });
    itemsByInv.set(it.invoice_id, arr);
  }
  const invoices: Invoice[] = (invRes.data ?? []).map((iv) => ({ id: iv.id, number: iv.number, projectId: iv.project_id, clientId: iv.client_id, issueDate: iv.issue_date, dueDate: iv.due_date, items: itemsByInv.get(iv.id) ?? [], status: iv.status, paidAmount: n(iv.paid_amount), filePath: iv.file_path, date: iv.created_on }));

  const events: CalendarEvent[] = (evRes.data ?? []).map((e) => ({ id: e.id, title: e.title, type: e.type, startsAt: e.starts_at, endsAt: e.ends_at, allDay: e.all_day, location: e.location, projectId: e.project_id, clientId: e.client_id, notes: e.notes, remindMinutesBefore: e.remind_minutes_before, date: e.created_on }));

  const collected = revenues.reduce((a, b) => a + b.amount, 0);
  const expenses = costs.reduce((a, b) => a + b.amount, 0);
  const now = new Date();
  const outstanding = invoices
    .filter((iv) => { const s = invEffStatus(iv, now); return s === "sent" || s === "overdue"; })
    .reduce((a, iv) => a + invRemaining(iv), 0);

  return {
    project, client, tasks, costs, revenues, invoices, events,
    kpis: { contractValue: project.value, collected, expenses, net: collected - expenses, outstanding },
  };
}
