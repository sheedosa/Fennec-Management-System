import { getOrgContext } from "@/lib/auth/context";
import { loadFennecData } from "@/lib/data/load";
import { loadEmployees } from "@/lib/data/employees";
import { L, fmtDate } from "@/lib/i18n/dictionary";
import { money } from "@/lib/finance/money";
import { projectReturns } from "@/lib/finance/charts";
import { metrics } from "@/lib/finance/metrics";
import { Card, SectionHead } from "@/components/ui/Card";
import { Table, type Column } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SalariesSection } from "@/components/finances/SalariesSection";
import type { Transaction } from "@/lib/types";

const CAT: Record<string, [string, string]> = {
  salaries: ["رواتب", "Salaries"], rent: ["إيجار", "Rent"], internet: ["إنترنت واشتراكات", "Internet"], operations: ["تشغيل وضيافة", "Operations"],
};
const TYPE: Record<string, [string, string]> = {
  revenue: ["إيراد", "Revenue"], cost: ["تكلفة مشروع", "Project Cost"], overhead: ["مصروف ثابت", "Overhead"],
};

export default async function FinancesPage() {
  const ctx = (await getOrgContext())!;
  const locale = ctx.locale;
  const [data, emp] = await Promise.all([loadFennecData(), loadEmployees()]);
  const now = new Date();
  const m = metrics(data, "all", now);

  const clientName = (id: string) => data.clients.find((c) => c.id === id)?.name ?? "—";
  const projectName = (id?: string | null) => (id ? data.projects.find((p) => p.id === id)?.name ?? "—" : "—");
  const returns = projectReturns(data, "all", now).filter((r) => r.rev || r.cost);

  // Per-project P&L
  type PnL = { projectId: string; rev: number; cost: number; net: number };
  const pnlCols: Column<PnL>[] = [
    { key: "project", header: L("المشروع", "Project", locale), render: (r) => { const p = data.projects.find((x) => x.id === r.projectId)!; return <div><div style={{ fontWeight: 700 }}>{p.name}</div><div style={{ fontSize: "12px", color: "var(--fg-muted)" }}>{clientName(p.clientId)}</div></div>; } },
    { key: "rev", header: L("المحصّل", "Collected", locale), align: "end", render: (r) => <span className="fx-num" style={{ color: "var(--success)" }}>{money(r.rev, locale)}</span> },
    { key: "cost", header: L("المصاريف", "Expenses", locale), align: "end", render: (r) => <span className="fx-num">{money(r.cost, locale)}</span> },
    { key: "net", header: L("الصافي", "Net", locale), align: "end", render: (r) => <span className="fx-num" style={{ fontWeight: 800, color: r.net >= 0 ? "var(--success)" : "var(--danger)" }}>{money(r.net, locale)}</span> },
  ];

  // Journal
  const rows = data.transactions.slice().sort((a, b) => +new Date(b.date) - +new Date(a.date));
  const ledgerCols: Column<Transaction>[] = [
    { key: "date", header: L("التاريخ", "Date", locale), render: (t) => fmtDate(t.date, locale) },
    { key: "type", header: L("النوع", "Type", locale), render: (t) => <Badge tone={t.type === "revenue" ? "success" : "neutral"}>{L(TYPE[t.type][0], TYPE[t.type][1], locale)}</Badge> },
    { key: "desc", header: L("الوصف", "Description", locale), render: (t) => t.desc || "—" },
    { key: "ref", header: L("المشروع/التصنيف", "Project / Category", locale), render: (t) => (t.type === "overhead" ? (t.category ? L(CAT[t.category][0], CAT[t.category][1], locale) : "—") : projectName(t.projectId)) },
    { key: "amount", header: L("المبلغ", "Amount", locale), align: "end", render: (t) => <span className="fx-num" style={{ fontWeight: 700, color: t.type === "revenue" ? "var(--success)" : "var(--fg)" }}>{(t.type === "revenue" ? "+" : "−") + money(t.amount, locale)}</span> },
  ];

  const summary = (label: string, val: string, tone?: "green" | "red") => (
    <Card style={{ padding: "16px" }}>
      <div style={{ fontSize: "13px", color: "var(--fg-muted)" }}>{label}</div>
      <div className="fx-num" style={{ fontSize: "21px", fontWeight: 800, marginTop: "5px", color: tone === "green" ? "var(--success)" : tone === "red" ? "var(--danger)" : "var(--fg)" }}>{val}</div>
    </Card>
  );

  return (
    <div style={{ animation: "fxFade .3s" }}>
      <SectionHead title={L("المالية والمصروفات", "Finance & Expenses", locale)} sub={L("صورة شاملة لكل المشاريع والرواتب والمصروفات.", "An all-in-one view of every project, salary and expense.", locale)} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: "12px", marginBottom: "26px" }}>
        {summary(L("الإيرادات", "Revenue", locale), money(m.revenue, locale), "green")}
        {summary(L("تكاليف المشاريع", "Project Costs", locale), money(m.costs, locale))}
        {summary(L("المصاريف الثابتة", "Overhead", locale), money(m.overhead, locale))}
        {summary(L("الصافي", "Net", locale), money(m.net, locale), m.net >= 0 ? "green" : "red")}
      </div>

      {/* Salaries */}
      <SalariesSection employees={emp.employees} pending={emp.pending} monthlyTotal={emp.monthlyTotal} locale={locale} role={ctx.role} />

      {/* Per-project P&L */}
      <h2 style={{ fontSize: "17px", fontWeight: 800, color: "var(--fg)", margin: "0 0 12px" }}>{L("الربحية حسب المشروع", "Profit by Project", locale)}</h2>
      <Card style={{ overflow: "hidden", marginBottom: "26px" }}>
        <Table columns={pnlCols} rows={returns} rowKey={(r) => r.projectId} empty={<EmptyState message={L("لا توجد بيانات مشاريع", "No project data", locale)} />} />
      </Card>

      {/* Journal */}
      <h2 style={{ fontSize: "17px", fontWeight: 800, color: "var(--fg)", margin: "0 0 12px" }}>{L("دفتر اليومية", "Journal", locale)}</h2>
      <Card style={{ overflow: "hidden" }}>
        <Table columns={ledgerCols} rows={rows} rowKey={(t) => t.id} empty={<EmptyState message={L("لا توجد حركات", "No entries", locale)} />} />
      </Card>
    </div>
  );
}
