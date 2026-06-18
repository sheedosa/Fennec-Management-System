"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CalendarEvent, EventType, Locale } from "@/lib/types";
import { L, fmtDate, months } from "@/lib/i18n/dictionary";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "@/components/ui/Toaster";
import { createEvent, updateEvent, deleteEvent } from "@/actions/calendar";

const TYPE_LABEL: Record<EventType, [string, string, string]> = {
  shoot: ["تصوير", "Shoot", "🎬"],
  meeting: ["اجتماع", "Meeting", "👥"],
  deadline: ["موعد نهائي", "Deadline", "⏰"],
  delivery: ["تسليم", "Delivery", "📦"],
  other: ["آخر", "Other", "•"],
};
const DOW_AR = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];
const DOW_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

interface Opt { id: string; name: string }

export function CalendarView({
  events,
  projects,
  clients,
  locale,
}: {
  events: CalendarEvent[];
  projects: Opt[];
  clients: Opt[];
  locale: Locale;
}) {
  const router = useRouter();
  const [view, setView] = useState(new Date());
  const [mode, setMode] = useState<"month" | "agenda">("month");
  const [editing, setEditing] = useState<CalendarEvent | { preset: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) setMode("agenda");
  }, []);

  const byDay = new Map<string, CalendarEvent[]>();
  for (const e of events) {
    const k = e.startsAt.slice(0, 10);
    const arr = byDay.get(k) ?? [];
    arr.push(e);
    byDay.set(k, arr);
  }

  const y = view.getFullYear(), mo = view.getMonth();
  const startDow = new Date(y, mo, 1).getDay();
  const daysInMonth = new Date(y, mo + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(y, mo, d));
  while (cells.length % 7 !== 0) cells.push(null);
  const todayKey = dayKey(new Date());
  const dows = locale === "en" ? DOW_EN : DOW_AR;

  async function onDelete(id: string) {
    if (!confirm(L("حذف هذا الحدث؟", "Delete this event?", locale))) return;
    const res = await deleteEvent(id);
    if (res.ok) { toast.success(L("تم الحذف", "Deleted", locale)); router.refresh(); } else toast.error(res.error || "خطأ");
  }

  const upcoming = events
    .filter((e) => new Date(e.startsAt) >= new Date(new Date().toDateString()))
    .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));

  return (
    <div style={{ animation: "fxFade .3s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Button size="sm" variant="ghost" onClick={() => setView(new Date(y, mo - 1, 1))} aria-label="prev">‹</Button>
          <span style={{ fontWeight: 800, fontSize: "17px", minWidth: "140px", textAlign: "center" }}>{months(locale)[mo]} {y}</span>
          <Button size="sm" variant="ghost" onClick={() => setView(new Date(y, mo + 1, 1))} aria-label="next">›</Button>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ display: "inline-flex", gap: "2px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "10px", padding: "3px" }}>
            {(["month", "agenda"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} style={{ padding: "6px 12px", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 700, background: mode === m ? "var(--accent)" : "transparent", color: mode === m ? "var(--accent-contrast)" : "var(--fg-muted)" }}>
                {m === "month" ? L("شهر", "Month", locale) : L("جدول", "Agenda", locale)}
              </button>
            ))}
          </div>
          <Button onClick={() => setEditing({ preset: todayKey })}>{L("+ حدث", "+ Event", locale)}</Button>
        </div>
      </div>

      {mode === "month" ? (
        <Card style={{ padding: "10px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "4px" }}>
            {dows.map((d) => <div key={d} style={{ textAlign: "center", fontSize: "11px", fontWeight: 700, color: "var(--fg-muted)", padding: "6px 0" }}>{d}</div>)}
            {cells.map((d, i) => {
              if (!d) return <div key={i} />;
              const k = dayKey(d);
              const dayEvents = byDay.get(k) ?? [];
              const isToday = k === todayKey;
              return (
                <div key={i} onClick={() => setEditing({ preset: k })} style={{ minHeight: "84px", border: "1px solid var(--border)", borderRadius: "8px", padding: "5px", cursor: "pointer", background: isToday ? "var(--surface-2)" : "var(--surface)", display: "flex", flexDirection: "column", gap: "3px" }}>
                  <div style={{ fontSize: "12px", fontWeight: isToday ? 800 : 600, color: isToday ? "var(--fg)" : "var(--fg-muted)" }}>{d.getDate()}</div>
                  {dayEvents.slice(0, 3).map((e) => (
                    <button key={e.id} onClick={(ev) => { ev.stopPropagation(); setEditing(e); }} title={e.title} style={{ textAlign: "start", border: "none", borderRadius: "5px", padding: "2px 5px", background: "var(--surface-3)", color: "var(--fg)", fontSize: "11px", cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {TYPE_LABEL[e.type][2]} {e.title}
                    </button>
                  ))}
                  {dayEvents.length > 3 ? <span style={{ fontSize: "10px", color: "var(--fg-faint)" }}>+{dayEvents.length - 3}</span> : null}
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {upcoming.length ? upcoming.map((e) => (
            <Card key={e.id} style={{ padding: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", cursor: "pointer" }}>
              <div onClick={() => setEditing(e)} style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: "14.5px" }}>{TYPE_LABEL[e.type][2]} {e.title}</div>
                <div style={{ fontSize: "12.5px", color: "var(--fg-muted)", marginTop: "3px" }}>
                  {fmtDate(e.startsAt.slice(0, 10), locale)}{e.allDay ? "" : " · " + e.startsAt.slice(11, 16)}
                  {e.location ? " · " + e.location : ""}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <Badge tone="outline">{L(TYPE_LABEL[e.type][0], TYPE_LABEL[e.type][1], locale)}</Badge>
                <button onClick={() => onDelete(e.id)} aria-label="delete" style={{ border: "none", background: "none", color: "var(--fg-faint)", cursor: "pointer", fontSize: "16px" }}>✕</button>
              </div>
            </Card>
          )) : <Card style={{ padding: "8px" }}><EmptyState message={L("لا أحداث قادمة", "No upcoming events", locale)} /></Card>}
        </div>
      )}

      {editing ? (
        <EventModal
          key={"id" in editing ? editing.id : "new"}
          event={"id" in editing ? editing : null}
          presetDate={"preset" in editing ? editing.preset : undefined}
          projects={projects}
          clients={clients}
          locale={locale}
          busy={busy}
          onClose={() => setEditing(null)}
          onDelete={"id" in editing ? () => onDelete(editing.id) : undefined}
          onSubmit={async (fd) => {
            setBusy(true);
            const res = "id" in editing ? await updateEvent(fd) : await createEvent(fd);
            setBusy(false);
            if (res.ok) { toast.success(L("تم الحفظ", "Saved", locale)); setEditing(null); router.refresh(); } else toast.error(res.error || "خطأ");
          }}
        />
      ) : null}
    </div>
  );
}

function EventModal({ event, presetDate, projects, clients, locale, busy, onClose, onSubmit, onDelete }: {
  event: CalendarEvent | null; presetDate?: string; projects: Opt[]; clients: Opt[]; locale: Locale; busy: boolean; onClose: () => void; onSubmit: (fd: FormData) => void; onDelete?: () => void;
}) {
  const [allDay, setAllDay] = useState(event?.allDay ?? false);
  const submit = (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); onSubmit(new FormData(e.currentTarget)); };
  const date = event ? event.startsAt.slice(0, 10) : presetDate ?? "";
  const time = event && !event.allDay ? event.startsAt.slice(11, 16) : "09:00";
  return (
    <Modal open onClose={onClose} title={event ? L("تعديل حدث", "Edit Event", locale) : L("حدث جديد", "New Event", locale)}>
      <form onSubmit={submit}>
        {event ? <input type="hidden" name="id" defaultValue={event.id} /> : null}
        <Field label={L("العنوان", "Title", locale)}><Input name="title" defaultValue={event?.title} required placeholder={L("مثال: تصوير حملة رمضان", "e.g. Ramadan shoot", locale)} /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <Field label={L("النوع", "Type", locale)}>
            <Select name="type" defaultValue={event?.type ?? "shoot"}>
              {(Object.keys(TYPE_LABEL) as EventType[]).map((t) => <option key={t} value={t}>{L(TYPE_LABEL[t][0], TYPE_LABEL[t][1], locale)}</option>)}
            </Select>
          </Field>
          <Field label={L("التذكير", "Reminder", locale)}>
            <Select name="remind" defaultValue={String(event?.remindMinutesBefore ?? 0)}>
              <option value="0">{L("بدون", "None", locale)}</option>
              <option value="10">{L("قبل 10 دقائق", "10 min before", locale)}</option>
              <option value="60">{L("قبل ساعة", "1 hour before", locale)}</option>
              <option value="1440">{L("قبل يوم", "1 day before", locale)}</option>
            </Select>
          </Field>
          <Field label={L("التاريخ", "Date", locale)}><Input type="date" name="date" defaultValue={date} required /></Field>
          <Field label={L("الوقت", "Time", locale)}><Input type="time" name="time" defaultValue={time} disabled={allDay} /></Field>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", margin: "0 0 14px", fontSize: "14px", cursor: "pointer" }}>
          <input type="checkbox" name="allDay" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} style={{ width: "16px", height: "16px", accentColor: "var(--accent)" }} />
          {L("طوال اليوم", "All day", locale)}
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <Field label={L("المشروع", "Project", locale)}>
            <Select name="projectId" defaultValue={event?.projectId ?? ""}>
              <option value="">{L("بدون", "None", locale)}</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </Field>
          <Field label={L("العميل", "Client", locale)}>
            <Select name="clientId" defaultValue={event?.clientId ?? ""}>
              <option value="">{L("بدون", "None", locale)}</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
        </div>
        <Field label={L("الموقع", "Location", locale)}><Input name="location" defaultValue={event?.location ?? ""} /></Field>
        <Field label={L("ملاحظات", "Notes", locale)}><Textarea name="notes" defaultValue={event?.notes ?? ""} /></Field>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginTop: "8px" }}>
          <div>{onDelete ? <Button type="button" variant="danger" onClick={onDelete}>{L("حذف", "Delete", locale)}</Button> : null}</div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Button type="button" variant="ghost" onClick={onClose}>{L("إلغاء", "Cancel", locale)}</Button>
            <Button type="submit" loading={busy}>{L("حفظ", "Save", locale)}</Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
