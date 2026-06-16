import { describe, it, expect, beforeAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import type { FennecData } from "@/lib/types";
import { importFennecData } from "@/lib/data/import";
import { seed } from "@/lib/seed";
import { metrics } from "@/lib/finance/metrics";

// End-to-end against the LIVE Supabase project, exercising the full stack:
// auth → RLS-scoped insert (import) → RLS-scoped read → finance aggregation.
// Skips automatically when Supabase env vars aren't present (e.g. plain CI).

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const run = URL && ANON ? describe : describe.skip;

run("live end-to-end (demo user)", () => {
  let supabase: SupabaseClient<Database>;
  let orgId: string;

  beforeAll(async () => {
    supabase = createClient<Database>(URL!, ANON!);
    const { error } = await supabase.auth.signInWithPassword({
      email: "demo@fennec.ly",
      password: "FennecDemo123",
    });
    if (error) throw new Error("sign-in failed: " + error.message);

    // reuse the demo user's org if it exists, else create one
    const { data: membership } = await supabase
      .from("memberships")
      .select("org_id")
      .limit(1)
      .maybeSingle();

    if (membership) {
      orgId = membership.org_id;
    } else {
      const { data, error: rpcErr } = await supabase.rpc("create_org_and_owner", {
        org_name: "وكالة فينيك",
      });
      if (rpcErr) throw new Error("create org failed: " + rpcErr.message);
      orgId = data as string;
    }

    // import demo data once (idempotent: only if org is empty)
    const { count } = await supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null);
    if (!count) {
      await importFennecData(supabase, orgId, seed());
    }
  }, 30000);

  it("RLS read returns the org's data and metrics match the prototype", async () => {
    const [clients, projects, invoices, items, tx] = await Promise.all([
      supabase.from("clients").select("*").is("deleted_at", null),
      supabase.from("projects").select("*").is("deleted_at", null),
      supabase.from("invoices").select("*").is("deleted_at", null),
      supabase.from("invoice_items").select("*"),
      supabase.from("transactions").select("*").is("deleted_at", null),
    ]);

    const itemsByInv = new Map<string, { desc: string; amount: number }[]>();
    for (const it of items.data ?? []) {
      const arr = itemsByInv.get(it.invoice_id) ?? [];
      arr.push({ desc: it.description, amount: Number(it.amount) });
      itemsByInv.set(it.invoice_id, arr);
    }
    const data: FennecData = {
      clients: (clients.data ?? []).map((c) => ({ id: c.id, name: c.name, date: c.created_on })),
      projects: (projects.data ?? []).map((p) => ({
        id: p.id, name: p.name, clientId: p.client_id, type: p.type, value: Number(p.value),
        monthly: p.monthly == null ? undefined : Number(p.monthly),
        startDate: p.start_date, endDate: p.end_date, status: p.status, date: p.created_on,
      })),
      invoices: (invoices.data ?? []).map((iv) => ({
        id: iv.id, number: iv.number, clientId: iv.client_id, projectId: iv.project_id,
        issueDate: iv.issue_date, dueDate: iv.due_date, items: itemsByInv.get(iv.id) ?? [],
        status: iv.status, paidAmount: Number(iv.paid_amount), date: iv.created_on,
      })),
      transactions: (tx.data ?? []).map((t) => ({
        id: t.id, type: t.type, amount: Number(t.amount), projectId: t.project_id,
        category: t.overhead_category ?? undefined, invoiceId: t.invoice_id,
        desc: t.description ?? undefined, date: t.tx_date, retainerYM: t.retainer_ym ?? undefined,
      })),
      leads: [],
      fixedExpenses: [],
    };

    expect(data.clients.length).toBe(6);
    expect(data.projects.length).toBe(5);

    const m = metrics(data, "year", new Date(2026, 5, 14));
    expect(m.revenue).toBe(87000);
    expect(m.costs).toBe(22100);
    expect(m.overhead).toBe(56700);
    expect(m.net).toBe(8200);
    expect(m.outstanding).toBe(63000);
    expect(m.active).toBe(4);
  });
});
