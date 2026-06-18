"use server";

import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/context";

export interface Reminder {
  id: string;
  title: string;
  startsAt: string;
  remind: number;
}

/** Events starting within the next 24h that have a reminder set. */
export async function getUpcomingReminders(): Promise<Reminder[]> {
  const ctx = await getOrgContext();
  if (!ctx) return [];
  const supabase = await createClient();
  const now = new Date();
  const in24 = new Date(now.getTime() + 24 * 3600 * 1000);
  const { data } = await supabase
    .from("calendar_events")
    .select("id, title, starts_at, remind_minutes_before")
    .is("deleted_at", null)
    .not("remind_minutes_before", "is", null)
    .gte("starts_at", now.toISOString())
    .lte("starts_at", in24.toISOString());
  return (data ?? []).map((e) => ({ id: e.id, title: e.title, startsAt: e.starts_at, remind: e.remind_minutes_before ?? 0 }));
}
