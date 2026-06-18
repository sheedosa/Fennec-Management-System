"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/context";
import { curYM } from "@/lib/finance/period";

export interface ActionResult {
  ok: boolean;
  error?: string;
  count?: number;
}

const num = (v: FormDataEntryValue | null): number | null => {
  const n = parseFloat(String(v ?? "").replace(/,/g, ""));
  return isNaN(n) ? null : n;
};

export async function createEmployee(formData: FormData): Promise<ActionResult> {
  const ctx = await getOrgContext();
  if (!ctx) return { ok: false, error: "غير مصرح" };
  const name = String(formData.get("name") || "").trim();
  const role = String(formData.get("role") || "").trim();
  const salary = num(formData.get("monthlySalary"));
  if (!name) return { ok: false, error: "الاسم مطلوب" };
  if (salary === null || salary < 0) return { ok: false, error: "الراتب غير صالح" };
  const supabase = await createClient();
  const { error } = await supabase.from("employees").insert({
    org_id: ctx.orgId, name, role: role || null, monthly_salary: salary, active: true,
    start_date: String(formData.get("startDate") || "") || null,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/finances");
  return { ok: true };
}

export async function updateEmployee(formData: FormData): Promise<ActionResult> {
  const ctx = await getOrgContext();
  if (!ctx) return { ok: false, error: "غير مصرح" };
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const salary = num(formData.get("monthlySalary"));
  const active = String(formData.get("active") || "true") === "true";
  if (!id || !name || salary === null) return { ok: false, error: "بيانات غير صالحة" };
  const supabase = await createClient();
  const { error } = await supabase.from("employees").update({ name, role: String(formData.get("role") || "") || null, monthly_salary: salary, active }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/finances");
  return { ok: true };
}

export async function deleteEmployee(id: string): Promise<ActionResult> {
  const ctx = await getOrgContext();
  if (!ctx) return { ok: false, error: "غير مصرح" };
  if (ctx.role !== "manager") return { ok: false, error: "الحذف مسموح للمدير فقط" };
  const supabase = await createClient();
  const { error } = await supabase.from("employees").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/finances");
  return { ok: true };
}

/** Post this month's salaries as overhead transactions, once per employee
 *  (dedup via last_salary_ym). Feeds metrics().overhead automatically. */
export async function logMonthSalaries(): Promise<ActionResult> {
  const ctx = await getOrgContext();
  if (!ctx) return { ok: false, error: "غير مصرح" };
  const supabase = await createClient();
  const ym = curYM(new Date());
  const today = new Date().toISOString().slice(0, 10);

  const { data: emps } = await supabase.from("employees").select("*").eq("active", true).is("deleted_at", null);
  const due = (emps ?? []).filter((e) => e.last_salary_ym !== ym);
  if (!due.length) return { ok: true, count: 0 };

  const txRows = due.map((e) => ({
    org_id: ctx.orgId, type: "overhead" as const, amount: Number(e.monthly_salary),
    overhead_category: "salaries" as const, description: "راتب " + e.name + " - " + ym, tx_date: today,
  }));
  const { error } = await supabase.from("transactions").insert(txRows);
  if (error) return { ok: false, error: error.message };
  await Promise.all(due.map((e) => supabase.from("employees").update({ last_salary_ym: ym }).eq("id", e.id)));

  revalidatePath("/finances");
  revalidatePath("/", "layout");
  return { ok: true, count: due.length };
}
