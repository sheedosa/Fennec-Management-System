import { notFound } from "next/navigation";
import { getOrgContext } from "@/lib/auth/context";
import { loadProjectDetail } from "@/lib/data/project";
import { L, fmtDate } from "@/lib/i18n/dictionary";
import { money } from "@/lib/finance/money";
import { invTotal, invRemaining, invEffStatus } from "@/lib/finance/invoice";
import { PrintButton } from "@/components/projects/PrintButton";

// Print-optimized project summary. Always black-on-white (for paper / PDF),
// independent of the app theme. window.print() renders Arabic/RTL correctly.
export default async function ProjectPrintPage({ params }: { params: Promise<{ pid: string }> }) {
  const { pid } = await params;
  const ctx = (await getOrgContext())!;
  const locale = ctx.locale;
  const d = await loadProjectDetail(pid);
  if (!d) notFound();
  const { project, client, tasks, costs, invoices, kpis } = d;
  const now = new Date();

  const cell: React.CSSProperties = { padding: "8px 10px", borderBottom: "1px solid #ddd", fontSize: "13px", textAlign: locale === "en" ? "left" : "right" };
  const th: React.CSSProperties = { ...cell, fontWeight: 700, background: "#f3f3f3", borderBottom: "1px solid #bbb" };

  return (
    <div dir={locale === "en" ? "ltr" : "rtl"} style={{ background: "#fff", color: "#111", minHeight: "100vh", padding: "32px", maxWidth: "820px", margin: "0 auto", fontFamily: "var(--font-tajawal), system-ui, sans-serif" }}>
      <style>{`@media print { .no-print { display: none !important } body { background: #fff } } @page { margin: 16mm }`}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <div>
          <div style={{ fontSize: "11px", letterSpacing: "2px", color: "#888" }}>FENNEC · {L("ملخص مشروع", "PROJECT SUMMARY", locale)}</div>
          <h1 style={{ margin: "6px 0 0", fontSize: "24px" }}>{project.name}</h1>
          <div style={{ color: "#555", marginTop: "4px", fontSize: "14px" }}>
            {client?.name} · {L(project.type === "retainer" ? "اشتراك شهري" : "إنتاج لمرة", project.type === "retainer" ? "Retainer" : "One-off", locale)} · {L("الحالة", "Status", locale)}: {L(({ active: "نشط", hold: "معلّق", completed: "مكتمل", cancelled: "ملغى" } as Record<string, string>)[project.status], ({ active: "Active", hold: "On Hold", completed: "Completed", cancelled: "Cancelled" } as Record<string, string>)[project.status], locale)}
          </div>
          <div style={{ color: "#555", marginTop: "2px", fontSize: "13px" }}>{fmtDate(project.startDate, locale)} – {fmtDate(project.endDate, locale)}</div>
        </div>
        <PrintButton label={L("طباعة / حفظ PDF", "Print / Save PDF", locale)} />
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "8px", margin: "20px 0" }}>
        {[
          [L("قيمة العقد", "Contract", locale), money(kpis.contractValue, locale)],
          [L("المحصّل", "Collected", locale), money(kpis.collected, locale)],
          [L("المصاريف", "Expenses", locale), money(kpis.expenses, locale)],
          [L("المتبقي", "Outstanding", locale), money(kpis.outstanding, locale)],
          [L("الصافي", "Net", locale), money(kpis.net, locale)],
        ].map(([l, v], i) => (
          <div key={i} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "10px" }}>
            <div style={{ fontSize: "11px", color: "#777" }}>{l}</div>
            <div style={{ fontSize: "15px", fontWeight: 700, marginTop: "3px" }}>{v}</div>
          </div>
        ))}
      </div>

      <Section title={L("المهام", "Tasks", locale)}>
        {tasks.length ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>{tasks.map((t) => (<tr key={t.id}><td style={cell}>{t.done ? "☑" : "☐"} {t.title}</td><td style={{ ...cell, width: "120px" }}>{t.dueDate ? fmtDate(t.dueDate, locale) : ""}</td></tr>))}</tbody>
          </table>
        ) : <Muted locale={locale} />}
      </Section>

      <Section title={L("المصاريف", "Expenses", locale)}>
        {costs.length ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={th}>{L("الوصف", "Description", locale)}</th><th style={th}>{L("التاريخ", "Date", locale)}</th><th style={th}>{L("المبلغ", "Amount", locale)}</th></tr></thead>
            <tbody>{costs.map((c) => (<tr key={c.id}><td style={cell}>{c.desc || "—"}</td><td style={cell}>{fmtDate(c.date, locale)}</td><td style={cell}>{money(c.amount, locale)}</td></tr>))}</tbody>
          </table>
        ) : <Muted locale={locale} />}
      </Section>

      <Section title={L("الفواتير والمدفوعات", "Invoices & Payments", locale)}>
        {invoices.length ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={th}>{L("رقم", "No.", locale)}</th><th style={th}>{L("الإجمالي", "Total", locale)}</th><th style={th}>{L("المتبقي", "Remaining", locale)}</th><th style={th}>{L("الحالة", "Status", locale)}</th></tr></thead>
            <tbody>{invoices.map((iv) => (<tr key={iv.id}><td style={cell} dir="ltr">{iv.number}</td><td style={cell}>{money(invTotal(iv), locale)}</td><td style={cell}>{money(invRemaining(iv), locale)}</td><td style={cell}>{invEffStatus(iv, now)}</td></tr>))}</tbody>
          </table>
        ) : <Muted locale={locale} />}
      </Section>

      <div style={{ marginTop: "30px", fontSize: "11px", color: "#999", textAlign: "center" }}>
        {L("تم الإنشاء في", "Generated", locale)} {fmtDate(now.toISOString().slice(0, 10), locale)}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: "22px" }}>
      <h2 style={{ fontSize: "15px", borderBottom: "2px solid #111", paddingBottom: "5px", marginBottom: "8px" }}>{title}</h2>
      {children}
    </div>
  );
}
function Muted({ locale }: { locale: "ar" | "en" }) {
  return <div style={{ color: "#999", fontSize: "13px" }}>{locale === "en" ? "None" : "لا يوجد"}</div>;
}
