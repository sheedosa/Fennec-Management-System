"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/context";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export async function createTask(projectId: string, title: string, dueDate?: string): Promise<ActionResult> {
  const ctx = await getOrgContext();
  if (!ctx) return { ok: false, error: "غير مصرح" };
  if (!title.trim()) return { ok: false, error: "العنوان مطلوب" };
  const supabase = await createClient();
  // append to the end
  const { count } = await supabase.from("project_tasks").select("*", { count: "exact", head: true }).eq("project_id", projectId).is("deleted_at", null);
  const { error } = await supabase.from("project_tasks").insert({
    org_id: ctx.orgId,
    project_id: projectId,
    title: title.trim(),
    due_date: dueDate || null,
    position: count ?? 0,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/projects/${projectId}`);
  return { ok: true };
}

export async function toggleTask(taskId: string, done: boolean, projectId: string): Promise<ActionResult> {
  const ctx = await getOrgContext();
  if (!ctx) return { ok: false, error: "غير مصرح" };
  const supabase = await createClient();
  const { error } = await supabase.from("project_tasks").update({ done }).eq("id", taskId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/projects/${projectId}`);
  return { ok: true };
}

export async function deleteTask(taskId: string, projectId: string): Promise<ActionResult> {
  const ctx = await getOrgContext();
  if (!ctx) return { ok: false, error: "غير مصرح" };
  const supabase = await createClient();
  const { error } = await supabase.from("project_tasks").update({ deleted_at: new Date().toISOString() }).eq("id", taskId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/projects/${projectId}`);
  return { ok: true };
}
