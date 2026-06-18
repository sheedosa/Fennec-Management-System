"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/context";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

type AssetType = "cash" | "equipment" | "investment" | "receivable" | "other";
const TYPES: AssetType[] = ["cash", "equipment", "investment", "receivable", "other"];
const num = (v: FormDataEntryValue | null): number | null => {
  const n = parseFloat(String(v ?? "").replace(/,/g, ""));
  return isNaN(n) ? null : n;
};

export async function createAsset(formData: FormData): Promise<ActionResult> {
  const ctx = await getOrgContext();
  if (!ctx) return { ok: false, error: "غير مصرح" };
  const name = String(formData.get("name") || "").trim();
  const type = String(formData.get("type") || "other") as AssetType;
  const value = num(formData.get("value"));
  if (!name) return { ok: false, error: "الاسم مطلوب" };
  if (value === null) return { ok: false, error: "القيمة غير صالحة" };
  if (!TYPES.includes(type)) return { ok: false, error: "نوع غير صالح" };
  const supabase = await createClient();
  const { error } = await supabase.from("capital_assets").insert({
    org_id: ctx.orgId,
    name,
    type,
    value,
    acquired_on: String(formData.get("acquiredOn") || "") || null,
    notes: String(formData.get("notes") || "") || null,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/capital");
  return { ok: true };
}

export async function updateAsset(formData: FormData): Promise<ActionResult> {
  const ctx = await getOrgContext();
  if (!ctx) return { ok: false, error: "غير مصرح" };
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const type = String(formData.get("type") || "other") as AssetType;
  const value = num(formData.get("value"));
  if (!id || !name || value === null || !TYPES.includes(type)) return { ok: false, error: "بيانات غير صالحة" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("capital_assets")
    .update({ name, type, value, acquired_on: String(formData.get("acquiredOn") || "") || null, notes: String(formData.get("notes") || "") || null })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/capital");
  return { ok: true };
}

export async function deleteAsset(id: string): Promise<ActionResult> {
  const ctx = await getOrgContext();
  if (!ctx) return { ok: false, error: "غير مصرح" };
  if (ctx.role !== "manager") return { ok: false, error: "الحذف مسموح للمدير فقط" };
  const supabase = await createClient();
  const { error } = await supabase.from("capital_assets").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/capital");
  return { ok: true };
}
