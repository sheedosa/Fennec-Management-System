"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/context";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

/** Record a project cost (expense) on the mini-dashboard. */
export async function createProjectCost(projectId: string, amount: number, desc: string, date: string): Promise<ActionResult> {
  const ctx = await getOrgContext();
  if (!ctx) return { ok: false, error: "غير مصرح" };
  if (!(amount > 0) || !date) return { ok: false, error: "بيانات غير صالحة" };
  const supabase = await createClient();
  const { error } = await supabase.from("transactions").insert({
    org_id: ctx.orgId,
    type: "cost",
    amount,
    project_id: projectId,
    description: desc || null,
    tx_date: date,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteTransaction(id: string, projectId: string): Promise<ActionResult> {
  const ctx = await getOrgContext();
  if (!ctx) return { ok: false, error: "غير مصرح" };
  if (ctx.role !== "manager") return { ok: false, error: "الحذف مسموح للمدير فقط" };
  const supabase = await createClient();
  const { error } = await supabase.from("transactions").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/", "layout");
  return { ok: true };
}
