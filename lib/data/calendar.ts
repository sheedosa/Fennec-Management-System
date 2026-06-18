import { createClient } from "@/lib/supabase/server";
import type { CalendarEvent } from "@/lib/types";

export interface CalendarView {
  events: CalendarEvent[];
  projects: { id: string; name: string }[];
  clients: { id: string; name: string }[];
}

export async function loadCalendar(): Promise<CalendarView> {
  const supabase = await createClient();
  const [evRes, pRes, cRes] = await Promise.all([
    supabase.from("calendar_events").select("*").is("deleted_at", null).order("starts_at", { ascending: true }),
    supabase.from("projects").select("id, name").is("deleted_at", null),
    supabase.from("clients").select("id, name").is("deleted_at", null),
  ]);
  const events: CalendarEvent[] = (evRes.data ?? []).map((e) => ({
    id: e.id, title: e.title, type: e.type, startsAt: e.starts_at, endsAt: e.ends_at,
    allDay: e.all_day, location: e.location, projectId: e.project_id, clientId: e.client_id,
    notes: e.notes, remindMinutesBefore: e.remind_minutes_before, date: e.created_on,
  }));
  return { events, projects: pRes.data ?? [], clients: cRes.data ?? [] };
}
