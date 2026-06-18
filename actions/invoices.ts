"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/context";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

const num = (v: FormDataEntryValue | null): number | null => {
  const n = parseFloat(String(v ?? "").replace(/,/g, ""));
  return isNaN(n) ? null : n;
};

interface LineItem {
  desc: string;
  amount: number;
}

function parseItems(raw: string): LineItem[] {
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .map((x) => ({ desc: String(x.desc ?? "").trim(), amount: Number(x.amount) || 0 }))
      .filter((x) => x.desc && x.amount > 0);
  } catch {
    return [];
  }
}

const ALLOWED = ["application/pdf", "image/png", "image/jpeg", "image/webp"];

/** Create an invoice: structured line items OR an uploaded file (with a total). */
export async function createInvoice(formData: FormData): Promise<ActionResult> {
  const ctx = await getOrgContext();
  if (!ctx) return { ok: false, error: "غير مصرح" };
  const supabase = await createClient();

  const number = String(formData.get("number") || "").trim();
  const projectId = String(formData.get("projectId") || "");
  const issueDate = String(formData.get("issueDate") || "");
  const dueDate = String(formData.get("dueDate") || "");
  const status = String(formData.get("status") || "draft");
  const mode = String(formData.get("mode") || "build");
  if (!number) return { ok: false, error: "رقم الفاتورة مطلوب" };
  if (!projectId) return { ok: false, error: "اختر المشروع" };
  if (!issueDate || !dueDate) return { ok: false, error: "التواريخ مطلوبة" };

  // derive client from the project (RLS-scoped)
  const { data: project } = await supabase.from("projects").select("client_id").eq("id", projectId).single();
  if (!project) return { ok: false, error: "مشروع غير صالح" };

  // build the line items
  let items: LineItem[];
  if (mode === "upload") {
    const total = num(formData.get("total"));
    if (total === null || total <= 0) return { ok: false, error: "قيمة الفاتورة غير صالحة" };
    items = [{ desc: "إجمالي الفاتورة", amount: total }];
  } else {
    items = parseItems(String(formData.get("items") || "[]"));
    if (!items.length) return { ok: false, error: "أضف بنداً واحداً على الأقل بقيمة صحيحة" };
  }

  const { data: inv, error } = await supabase
    .from("invoices")
    .insert({
      org_id: ctx.orgId,
      client_id: project.client_id,
      project_id: projectId,
      number,
      issue_date: issueDate,
      due_date: dueDate,
      status: status as "draft" | "sent" | "paid" | "overdue",
      paid_amount: 0,
    })
    .select("id")
    .single();
  if (error || !inv) return { ok: false, error: error?.message || "تعذّر الإنشاء" };

  const { error: itemsErr } = await supabase
    .from("invoice_items")
    .insert(items.map((it, i) => ({ org_id: ctx.orgId, invoice_id: inv.id, description: it.desc, amount: it.amount, position: i })));
  if (itemsErr) return { ok: false, error: itemsErr.message };

  // optional file upload (runs on the user client; Storage RLS scopes by org)
  const file = formData.get("file");
  if (file && file instanceof File && file.size > 0) {
    if (!ALLOWED.includes(file.type)) return { ok: false, error: "نوع الملف غير مدعوم" };
    if (file.size > 10 * 1024 * 1024) return { ok: false, error: "الملف أكبر من 10 ميجابايت" };
    const safe = file.name.replace(/[^\w.\-]+/g, "_");
    const path = `${ctx.orgId}/${inv.id}/${safe}`;
    const { error: upErr } = await supabase.storage.from("invoices").upload(path, file, { upsert: true });
    if (upErr) return { ok: false, error: "تعذّر رفع الملف: " + upErr.message };
    await supabase.from("invoices").update({ file_path: path }).eq("id", inv.id);
  }

  revalidatePath("/invoices");
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Update an invoice's header + replace its line items. */
export async function updateInvoice(formData: FormData): Promise<ActionResult> {
  const ctx = await getOrgContext();
  if (!ctx) return { ok: false, error: "غير مصرح" };
  const supabase = await createClient();

  const id = String(formData.get("id") || "");
  if (!id) return { ok: false, error: "معرّف غير صالح" };
  const number = String(formData.get("number") || "").trim();
  const projectId = String(formData.get("projectId") || "");
  const issueDate = String(formData.get("issueDate") || "");
  const dueDate = String(formData.get("dueDate") || "");
  const status = String(formData.get("status") || "draft");
  const mode = String(formData.get("mode") || "build");
  if (!number || !projectId || !issueDate || !dueDate) return { ok: false, error: "الحقول المطلوبة ناقصة" };

  const { data: project } = await supabase.from("projects").select("client_id").eq("id", projectId).single();
  if (!project) return { ok: false, error: "مشروع غير صالح" };

  let items: LineItem[];
  if (mode === "upload") {
    const total = num(formData.get("total"));
    if (total === null || total <= 0) return { ok: false, error: "قيمة الفاتورة غير صالحة" };
    items = [{ desc: "إجمالي الفاتورة", amount: total }];
  } else {
    items = parseItems(String(formData.get("items") || "[]"));
    if (!items.length) return { ok: false, error: "أضف بنداً واحداً على الأقل" };
  }

  const { error } = await supabase
    .from("invoices")
    .update({ number, project_id: projectId, client_id: project.client_id, issue_date: issueDate, due_date: dueDate, status: status as "draft" | "sent" | "paid" | "overdue" })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  // replace items (cascade-safe: delete then insert)
  await supabase.from("invoice_items").delete().eq("invoice_id", id);
  await supabase.from("invoice_items").insert(items.map((it, i) => ({ org_id: ctx.orgId, invoice_id: id, description: it.desc, amount: it.amount, position: i })));

  const file = formData.get("file");
  if (file && file instanceof File && file.size > 0) {
    if (!ALLOWED.includes(file.type)) return { ok: false, error: "نوع الملف غير مدعوم" };
    const safe = file.name.replace(/[^\w.\-]+/g, "_");
    const path = `${ctx.orgId}/${id}/${safe}`;
    const { error: upErr } = await supabase.storage.from("invoices").upload(path, file, { upsert: true });
    if (upErr) return { ok: false, error: "تعذّر رفع الملف" };
    await supabase.from("invoices").update({ file_path: path }).eq("id", id);
  }

  revalidatePath("/invoices");
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Soft-delete an invoice (manager only). */
export async function deleteInvoice(id: string): Promise<ActionResult> {
  const ctx = await getOrgContext();
  if (!ctx) return { ok: false, error: "غير مصرح" };
  if (ctx.role !== "manager") return { ok: false, error: "الحذف مسموح للمدير فقط" };
  const supabase = await createClient();
  const { error } = await supabase.from("invoices").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/invoices");
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Record a (partial) payment: bumps paid_amount, flips status, logs revenue. */
export async function recordPayment(invoiceId: string, amount: number, payDate: string): Promise<ActionResult> {
  const ctx = await getOrgContext();
  if (!ctx) return { ok: false, error: "غير مصرح" };
  if (!(amount > 0) || !payDate) return { ok: false, error: "بيانات الدفعة غير صالحة" };
  const supabase = await createClient();

  const { data: inv } = await supabase
    .from("invoices")
    .select("id, number, project_id, paid_amount")
    .eq("id", invoiceId)
    .single();
  if (!inv) return { ok: false, error: "فاتورة غير موجودة" };
  const { data: itemRows } = await supabase.from("invoice_items").select("amount").eq("invoice_id", invoiceId);

  const total = (itemRows ?? []).reduce((a, b) => a + Number(b.amount), 0);
  const newPaid = Number(inv.paid_amount) + amount;
  const status = newPaid >= total ? "paid" : "sent";

  await supabase.from("invoices").update({ paid_amount: newPaid, status }).eq("id", invoiceId);
  await supabase.from("transactions").insert({
    org_id: ctx.orgId,
    type: "revenue",
    amount,
    project_id: inv.project_id,
    invoice_id: inv.id,
    description: "تحصيل فاتورة " + inv.number,
    tx_date: payDate,
  });

  revalidatePath("/invoices");
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Short-lived signed URL to view an invoice's attached file. */
export async function getInvoiceFileUrl(invoiceId: string): Promise<{ url?: string; error?: string }> {
  const ctx = await getOrgContext();
  if (!ctx) return { error: "غير مصرح" };
  const supabase = await createClient();
  const { data: inv } = await supabase.from("invoices").select("file_path").eq("id", invoiceId).single();
  if (!inv?.file_path) return { error: "لا يوجد ملف" };
  const { data, error } = await supabase.storage.from("invoices").createSignedUrl(inv.file_path, 120);
  if (error || !data) return { error: "تعذّر فتح الملف" };
  return { url: data.signedUrl };
}
