"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/context";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

type EventType = "shoot" | "meeting" | "deadline" | "delivery" | "other";
const TYPES: EventType[] = ["shoot", "meeting", "deadline", "delivery", "other"];

function fields(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const type = String(formData.get("type") || "other") as EventType;
  const date = String(formData.get("date") || "");
  const time = String(formData.get("time") || "");
  const allDay = String(formData.get("allDay") || "") === "on" || String(formData.get("allDay") || "") === "true";
  const remind = parseInt(String(formData.get("remind") || "0"), 10);
  const starts_at = date ? (allDay ? `${date}T00:00:00` : `${date}T${time || "09:00"}:00`) : "";
  return {
    title,
    starts_at,
    type: TYPES.includes(type) ? type : ("other" as EventType),
    all_day: allDay,
    location: String(formData.get("location") || "") || null,
    project_id: String(formData.get("projectId") || "") || null,
    client_id: String(formData.get("clientId") || "") || null,
    notes: String(formData.get("notes") || "") || null,
    remind_minutes_before: remind > 0 ? remind : null,
  };
}

export async function createEvent(formData: FormData): Promise<ActionResult> {
  const ctx = await getOrgContext();
  if (!ctx) return { ok: false, error: "غير مصرح" };
  const f = fields(formData);
  if (!f.title) return { ok: false, error: "العنوان مطلوب" };
  if (!f.starts_at) return { ok: false, error: "التاريخ مطلوب" };
  const supabase = await createClient();
  const { error } = await supabase.from("calendar_events").insert({ org_id: ctx.orgId, ...f });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/calendar");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateEvent(formData: FormData): Promise<ActionResult> {
  const ctx = await getOrgContext();
  if (!ctx) return { ok: false, error: "غير مصرح" };
  const id = String(formData.get("id") || "");
  const f = fields(formData);
  if (!id || !f.title || !f.starts_at) return { ok: false, error: "بيانات غير صالحة" };
  const supabase = await createClient();
  const { error } = await supabase.from("calendar_events").update(f).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/calendar");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  const ctx = await getOrgContext();
  if (!ctx) return { ok: false, error: "غير مصرح" };
  const supabase = await createClient();
  const { error } = await supabase.from("calendar_events").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/calendar");
  revalidatePath("/", "layout");
  return { ok: true };
}
