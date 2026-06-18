"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ProjectDetail } from "@/lib/data/project";
import type { Locale, OrgRole } from "@/lib/types";
import { L, fmtDate } from "@/lib/i18n/dictionary";
import { money } from "@/lib/finance/money";
import { invEffStatus, invTotal, invRemaining } from "@/lib/finance/invoice";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Field";
import { Tabs } from "@/components/ui/Tabs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "@/components/ui/Toaster";
import { updateProjectStatus } from "@/actions/projects";
import { createTask, toggleTask, deleteTask } from "@/actions/tasks";
import { createProjectCost, deleteTransaction } from "@/actions/transactions";
import { recordPayment } from "@/actions/invoices";

const STATUS_OPTS: { v: string; ar: string; en: string }[] = [
  { v: "active", ar: "نشط", en: "Active" },
  { v: "hold", ar: "معلّق", en: "On Hold" },
  { v: "completed", ar: "مكتمل", en: "Completed" },
  { v: "cancelled", ar: "ملغى", en: "Cancelled" },
];

export function ProjectDashboard({ detail, locale, role }: { detail: ProjectDetail; locale: Locale; role: OrgRole }) {
  const router = useRouter();
  const { project, client, tasks, costs, invoices, events, kpis } = detail;
  const now = new Date();

  async function changeStatus(status: string) {
    const res = await updateProjectStatus(project.id, status);
    if (res.ok) { toast.success(L("تم تحديث الحالة", "Status updated", locale)); router.refresh(); }
    else toast.error(res.error || "خطأ");
  }

  const kpi = (label: string, val: string, tone?: "green" | "red") => (
    <Card style={{ padding: "16px" }}>
      <div style={{ fontSize: "12.5px", color: "var(--fg-muted)" }}>{label}</div>
      <div className="fx-num" style={{ fontSize: "21px", fontWeight: 800, marginTop: "5px", color: tone === "green" ? "var(--success)" : tone === "red" ? "var(--danger)" : "var(--fg)" }}>{val}</div>
    </Card>
  );

  return (
    <div style={{ animation: "fxFade .3s" }}>
      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "14px", flexWrap: "wrap", marginBottom: "20px" }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "var(--fg)" }}>{project.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px", flexWrap: "wrap", color: "var(--fg-muted)", fontSize: "13.5px" }}>
            {client ? <Link href={`/clients/${client.id}`} style={{ color: "var(--fg-muted)", fontWeight: 600 }}>{client.name}</Link> : null}
            <Badge tone="outline">{L(project.type === "retainer" ? "اشتراك شهري" : "إنتاج لمرة", project.type === "retainer" ? "Retainer" : "One-off", locale)}</Badge>
            <span>{fmtDate(project.startDate, locale)} – {fmtDate(project.endDate, locale)}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <select
            value={project.status}
            onChange={(e) => changeStatus(e.target.value)}
            aria-label={L("الحالة", "Status", locale)}
            style={{ padding: "9px 12px", borderRadius: "10px", border: "1px solid var(--border-strong)", background: "var(--surface)", color: "var(--fg)", fontSize: "14px", fontWeight: 700, cursor: "pointer", minHeight: "40px" }}
          >
            {STATUS_OPTS.map((s) => <option key={s.v} value={s.v}>{L(s.ar, s.en, locale)}</option>)}
          </select>
          <a href={`/projects/${project.id}/print`} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary">{L("تصدير PDF", "Export PDF", locale)}</Button>
          </a>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: "12px", marginBottom: "22px" }}>
        {kpi(L("قيمة العقد", "Contract Value", locale), money(kpis.contractValue, locale))}
        {kpi(L("المحصّل", "Collected", locale), money(kpis.collected, locale), "green")}
        {kpi(L("المصاريف", "Expenses", locale), money(kpis.expenses, locale))}
        {kpi(L("المتبقي", "Outstanding", locale), money(kpis.outstanding, locale), kpis.outstanding > 0 ? "red" : undefined)}
        {kpi(L("الصافي", "Net", locale), money(kpis.net, locale), kpis.net >= 0 ? "green" : "red")}
      </div>

      <Tabs
        tabs={[
          { id: "tasks", label: L("المهام", "To-do", locale), content: <TaskSection projectId={project.id} tasks={tasks} locale={locale} onChange={() => router.refresh()} /> },
          { id: "expenses", label: L("المصاريف", "Expenses", locale), content: <ExpenseSection projectId={project.id} costs={costs} role={role} locale={locale} onChange={() => router.refresh()} /> },
          { id: "payments", label: L("المدفوعات", "Payments", locale), content: <PaymentSection invoices={invoices} now={now} locale={locale} onChange={() => router.refresh()} /> },
          { id: "timeline", label: L("الجدول الزمني", "Timeline", locale), content: <TimelineSection detail={detail} locale={locale} /> },
        ]}
      />
    </div>
  );
}

function TaskSection({ projectId, tasks, locale, onChange }: { projectId: string; tasks: ProjectDetail["tasks"]; locale: Locale; onChange: () => void }) {
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const add = async () => {
    if (!title.trim()) return;
    const res = await createTask(projectId, title, due || undefined);
    if (res.ok) { setTitle(""); setDue(""); onChange(); } else toast.error(res.error || "خطأ");
  };
  return (
    <div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        <Input style={{ flex: 1, minWidth: "160px" }} placeholder={L("مهمة جديدة…", "New task…", locale)} value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") add(); }} />
        <Input style={{ width: "160px" }} type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        <Button onClick={add}>{L("إضافة", "Add", locale)}</Button>
      </div>
      {tasks.length ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {tasks.map((t) => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px" }}>
              <input type="checkbox" checked={t.done} onChange={async () => { const r = await toggleTask(t.id, !t.done, projectId); if (r.ok) onChange(); }} style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "var(--accent)" }} />
              <span style={{ flex: 1, color: t.done ? "var(--fg-faint)" : "var(--fg)", textDecoration: t.done ? "line-through" : "none", fontSize: "14.5px" }}>{t.title}</span>
              {t.dueDate ? <span style={{ fontSize: "12.5px", color: "var(--fg-muted)" }}>{fmtDate(t.dueDate, locale)}</span> : null}
              <button onClick={async () => { const r = await deleteTask(t.id, projectId); if (r.ok) onChange(); }} aria-label={L("حذف", "Delete", locale)} style={{ border: "none", background: "none", color: "var(--fg-faint)", cursor: "pointer", fontSize: "16px" }}>✕</button>
            </div>
          ))}
        </div>
      ) : <EmptyState message={L("لا توجد مهام بعد", "No tasks yet", locale)} />}
    </div>
  );
}

function ExpenseSection({ projectId, costs, role, locale, onChange }: { projectId: string; costs: ProjectDetail["costs"]; role: OrgRole; locale: Locale; onChange: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState(today);
  const add = async () => {
    const amt = parseFloat(amount.replace(/,/g, ""));
    if (!(amt > 0)) { toast.error(L("قيمة غير صالحة", "Invalid amount", locale)); return; }
    const res = await createProjectCost(projectId, amt, desc, date);
    if (res.ok) { setAmount(""); setDesc(""); onChange(); } else toast.error(res.error || "خطأ");
  };
  return (
    <div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        <Input style={{ flex: 1, minWidth: "140px" }} placeholder={L("الوصف (مثال: مصور)", "Description (e.g. Videographer)", locale)} value={desc} onChange={(e) => setDesc(e.target.value)} />
        <Input style={{ width: "120px" }} inputMode="decimal" placeholder={L("المبلغ", "Amount", locale)} value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Input style={{ width: "150px" }} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Button onClick={add}>{L("إضافة", "Add", locale)}</Button>
      </div>
      {costs.length ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {costs.map((c) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px" }}>
              <span style={{ flex: 1, fontSize: "14.5px" }}>{c.desc || "—"}</span>
              <span style={{ fontSize: "12.5px", color: "var(--fg-muted)" }}>{fmtDate(c.date, locale)}</span>
              <span className="fx-num" style={{ fontWeight: 700 }}>{money(c.amount, locale)}</span>
              {role === "manager" ? <button onClick={async () => { const r = await deleteTransaction(c.id, projectId); if (r.ok) onChange(); }} aria-label={L("حذف", "Delete", locale)} style={{ border: "none", background: "none", color: "var(--fg-faint)", cursor: "pointer", fontSize: "16px" }}>✕</button> : null}
            </div>
          ))}
        </div>
      ) : <EmptyState message={L("لا توجد مصاريف بعد", "No expenses yet", locale)} />}
    </div>
  );
}

function PaymentSection({ invoices, now, locale, onChange }: { invoices: ProjectDetail["invoices"]; now: Date; locale: Locale; onChange: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const collect = async (id: string, remaining: number) => {
    if (!(remaining > 0)) return;
    if (!confirm(L("تسجيل دفعة بالمبلغ المتبقي؟", "Record a payment for the remaining balance?", locale))) return;
    const res = await recordPayment(id, remaining, today);
    if (res.ok) { toast.success(L("تم تسجيل الدفعة", "Payment recorded", locale)); onChange(); } else toast.error(res.error || "خطأ");
  };
  if (!invoices.length) return <EmptyState message={L("لا توجد فواتير لهذا المشروع", "No invoices for this project", locale)} />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {invoices.map((iv) => {
        const eff = invEffStatus(iv, now);
        const rem = invRemaining(iv);
        return (
          <div key={iv.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", flexWrap: "wrap" }}>
            <div>
              <div dir="ltr" style={{ fontWeight: 700 }}>{iv.number}</div>
              <div style={{ fontSize: "12.5px", color: "var(--fg-muted)", marginTop: "2px" }}>
                {L("الإجمالي", "Total", locale)} {money(invTotal(iv), locale)} · {L("المتبقي", "Remaining", locale)} <span style={{ color: rem > 0 ? "var(--danger)" : "var(--success)" }}>{money(rem, locale)}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <StatusBadge status={eff} locale={locale} />
              {eff !== "paid" ? <Button size="sm" onClick={() => collect(iv.id, rem)}>{L("تحصيل", "Collect", locale)}</Button> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TimelineSection({ detail, locale }: { detail: ProjectDetail; locale: Locale }) {
  const { project, tasks, costs, revenues, invoices, events } = detail;
  type Ev = { date: string; label: string; kind: string };
  const items: Ev[] = [];
  items.push({ date: project.startDate, label: L("بداية المشروع", "Project start", locale), kind: "•" });
  items.push({ date: project.endDate, label: L("تسليم المشروع", "Delivery", locale), kind: "•" });
  tasks.filter((t) => t.dueDate).forEach((t) => items.push({ date: t.dueDate!, label: L("مهمة: ", "Task: ", locale) + t.title, kind: "☐" }));
  events.forEach((e) => items.push({ date: e.startsAt.slice(0, 10), label: e.title, kind: "📅" }));
  invoices.forEach((iv) => items.push({ date: iv.issueDate, label: L("فاتورة ", "Invoice ", locale) + iv.number, kind: "📄" }));
  revenues.forEach((r) => items.push({ date: r.date, label: L("دفعة مستلمة", "Payment received", locale) + (r.amount ? " · " + money(r.amount, locale) : ""), kind: "↓" }));
  costs.forEach((c) => items.push({ date: c.date, label: L("مصروف: ", "Expense: ", locale) + (c.desc || ""), kind: "↑" }));
  items.sort((a, b) => +new Date(a.date) - +new Date(b.date));

  if (!items.length) return <EmptyState message={L("لا توجد أحداث", "No events", locale)} />;
  return (
    <div style={{ position: "relative", paddingInlineStart: "20px" }}>
      <div style={{ position: "absolute", insetInlineStart: "5px", top: "6px", bottom: "6px", width: "2px", background: "var(--border)" }} />
      {items.map((it, i) => (
        <div key={i} style={{ position: "relative", paddingBottom: "16px" }}>
          <span style={{ position: "absolute", insetInlineStart: "-19px", top: "3px", width: "12px", height: "12px", borderRadius: "50%", background: "var(--surface)", border: "2px solid var(--fg-muted)" }} />
          <div style={{ fontSize: "12px", color: "var(--fg-muted)" }}>{fmtDate(it.date, locale)}</div>
          <div style={{ fontSize: "14px", color: "var(--fg)", marginTop: "2px" }}>{it.kind} {it.label}</div>
        </div>
      ))}
    </div>
  );
}
