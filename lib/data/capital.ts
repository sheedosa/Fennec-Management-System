import { createClient } from "@/lib/supabase/server";
import { loadFennecData } from "@/lib/data/load";
import { metrics } from "@/lib/finance/metrics";
import type { CapitalAsset } from "@/lib/types";

export interface CapitalView {
  assets: CapitalAsset[];
  assetsTotal: number;
  cash: number; // all-time net (revenue − costs − overhead)
  receivables: number; // outstanding invoices
  worth: number; // assets + cash + receivables
}

/** Owner-entered assets + live computed figures, reusing metrics(). */
export async function loadCapital(): Promise<CapitalView> {
  const supabase = await createClient();
  const [{ data: rows }, data] = await Promise.all([
    supabase.from("capital_assets").select("*").is("deleted_at", null).order("value", { ascending: false }),
    loadFennecData(),
  ]);

  const assets: CapitalAsset[] = (rows ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    type: a.type,
    value: Number(a.value),
    acquiredOn: a.acquired_on,
    notes: a.notes,
    date: a.created_on,
  }));

  const m = metrics(data, "all", new Date());
  const assetsTotal = assets.reduce((s, a) => s + a.value, 0);
  const cash = m.net;
  const receivables = m.outstanding;
  return { assets, assetsTotal, cash, receivables, worth: assetsTotal + cash + receivables };
}
