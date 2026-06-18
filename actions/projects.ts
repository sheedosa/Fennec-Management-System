"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/context";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

type ProjectStatus = "active" | "hold" | "completed" | "cancelled";
const STATUSES: ProjectStatus[] = ["active", "hold", "completed", "cancelled"];

const num = (v: FormDataEntryValue | null): number | null => {
  const n = parseFloat(String(v ?? "").replace(/,/g, ""));
  return isNaN(n) ? null : n;
};

export async function updateProjectStatus(projectId: string, status: string): Promise<ActionResult> {
  const ctx = await getOrgContext();
  if (!ctx) return { ok: false, error: "غير مصرح" };
  if (!STATUSES.includes(status as ProjectStatus)) return { ok: false, error: "حالة غير صالحة" };
  const supabase = await createClient();
  const { error } = await supabase.from("projects").update({ status: status as ProjectStatus }).eq("id", projectId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateProject(formData: FormData): Promise<ActionResult> {
  const ctx = await getOrgContext();
  if (!ctx) return { ok: false, error: "غير مصرح" };
  const supabase = await createClient();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const startDate = String(formData.get("startDate") || "");
  const endDate = String(formData.get("endDate") || "");
  const value = num(formData.get("value"));
  if (!id || !name || !startDate || !endDate) return { ok: false, error: "الحقول المطلوبة ناقصة" };
  const patch: { name: string; start_date: string; end_date: string; value?: number } = { name, start_date: startDate, end_date: endDate };
  if (value !== null && value > 0) patch.value = value;
  const { error } = await supabase.from("projects").update(patch).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/projects/${id}`);
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Create a project under a client (from the client hub). */
export async function createProject(formData: FormData): Promise<{ ok: boolean; error?: string; id?: string }> {
  const ctx = await getOrgContext();
  if (!ctx) return { ok: false, error: "غير مصرح" };
  const supabase = await createClient();
  const clientId = String(formData.get("clientId") || "");
  const name = String(formData.get("name") || "").trim();
  const type = String(formData.get("type") || "oneoff") === "retainer" ? "retainer" : "oneoff";
  const value = num(formData.get("value"));
  const monthly = num(formData.get("monthly"));
  const startDate = String(formData.get("startDate") || "");
  const endDate = String(formData.get("endDate") || "");
  if (!clientId || !name || value === null || value <= 0 || !startDate || !endDate) return { ok: false, error: "الحقول المطلوبة ناقصة" };
  const { data, error } = await supabase
    .from("projects")
    .insert({ org_id: ctx.orgId, client_id: clientId, name, type, value, monthly: type === "retainer" ? monthly ?? 0 : null, start_date: startDate, end_date: endDate, status: "active" })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: error?.message || "تعذّر الإنشاء" };
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/", "layout");
  return { ok: true, id: data.id };
}

export async function deleteProject(projectId: string): Promise<ActionResult> {
  const ctx = await getOrgContext();
  if (!ctx) return { ok: false, error: "غير مصرح" };
  if (ctx.role !== "manager") return { ok: false, error: "الحذف مسموح للمدير فقط" };
  const supabase = await createClient();
  const { error } = await supabase.from("projects").update({ deleted_at: new Date().toISOString() }).eq("id", projectId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}
