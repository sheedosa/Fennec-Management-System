import { getOrgContext } from "@/lib/auth/context";
import { loadFennecData } from "@/lib/data/load";
import { loadDemoData } from "@/actions/org";
import type { Period } from "@/lib/types";
import { L } from "@/lib/i18n/dictionary";
import { money } from "@/lib/finance/money";
import { metrics } from "@/lib/finance/metrics";
import { trendSeries, donutSegments, topClients, projectReturns } from "@/lib/finance/charts";
import { Card, SectionHead } from "@/components/ui/Card";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { TrendChart } from "@/components/charts/TrendChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { TopClientsChart } from "@/components/charts/TopClientsChart";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const ctx = (await getOrgContext())!;
  const locale = ctx.locale;
  const data = await loadFennecData();
  const sp = await searchParams;
  const period = (["month", "quarter", "year", "all"].includes(sp.period ?? "") ? sp.period : "year") as Period;
  const now = new Date();

  const isEmpty =
    !data.clients.length && !data.projects.length && !data.transactions.length && !data.invoices.length;

  if (isEmpty) {
    return (
      <div style={{ animation: "fxFade .3s" }}>
        <SectionHead title={L("نظرة عامة", "Overview", locale)} sub={L("لا توجد بيانات بعد.", "No data yet.", locale)} />
        <Card style={{ padding: "8px" }}>
          <EmptyState
            message={L(
              "منظمتك جاهزة. حمّل البيانات التجريبية لاستكشاف النظام، أو ابدأ بإضافة عملائك ومشاريعك.",
              "Your organization is ready. Load demo data to explore, or start by adding your clients and projects.",
              locale,
            )}
            cta={
              <form action={loadDemoData}>
                <button
                  type="submit"
                  style={{ padding: "11px 17px", borderRadius: "12px", border: "1px solid var(--color-blue)", background: "var(--color-blue)", color: "#fff", fontWeight: 700, fontSize: "14.5px", cursor: "pointer", boxShadow: "0 4px 12px rgba(184,84,47,.26)" }}
                >
                  {L("تحميل البيانات التجريبية", "Load demo data", locale)}
                </button>
              </form>
            }
          />
        </Card>
      </div>
    );
  }

  const m = metrics(data, period, now);
  const trend = trendSeries(data, now);
  const donut = donutSegments(data, period, now);
  const clientName = (id: string) => data.clients.find((c) => c.id === id)?.name ?? "—";
  const top = topClients(data, period, now).map((r) => ({ name: clientName(r.clientId), val: r.val }));
  const returns = projectReturns(data, period, now);
  const projById = (id: string) => data.projects.find((p) => p.id === id)!;

  const kpis = [
    { label: L("إجمالي الإيرادات المحصّلة", "Total Revenue Collected", locale), val: money(m.revenue, locale), color: "var(--color-green)" },
    { label: L("فواتير غير محصّلة", "Outstanding Invoices", locale), val: money(m.outstanding, locale), color: "var(--color-amber)" },
    { label: L("مصاريف مباشرة للمشاريع", "Direct Project Expenses", locale), val: money(m.costs, locale), color: "var(--color-gray)" },
    { label: L("مصاريف ثابتة (تشغيلية)", "Fixed Overhead", locale), val: money(m.overhead, locale), color: "var(--color-gray)" },
    { label: L("صافي الربح / الخسارة", "Net Profit / Loss", locale), val: money(m.net, locale), color: m.net >= 0 ? "var(--color-green)" : "var(--color-red)", foot: L("هامش الربح: ", "Profit margin: ", locale) + m.margin.toFixed(1) + "%" },
    { label: L("المشاريع النشطة", "Active Projects", locale), val: String(m.active), color: "var(--color-navy)" },
  ];

  const th = (t: string) => (
    <th style={{ padding: "15px 18px", textAlign: locale === "en" ? "left" : "right", fontSize: "12px", fontWeight: 700, color: "var(--color-sub)", background: "var(--color-card-alt)", borderBottom: "1px solid var(--color-border)", whiteSpace: "nowrap" }}>{t}</th>
  );
  const td = (c: React.ReactNode, st?: React.CSSProperties) => (
    <td style={{ padding: "15px 18px", fontSize: "14.5px", color: "var(--color-navy)", borderBottom: "1px solid var(--color-line)", verticalAlign: "middle", ...st }}>{c}</td>
  );

  return (
    <div style={{ animation: "fxFade .3s" }}>
      <SectionHead
        title={L("نظرة عامة", "Overview", locale)}
        sub={L("نظرة سريعة على الوضع المالي للوكالة — بدّل بين الفترات لمتابعة الأداء.", "A quick look at the agency's finances — switch periods to track performance.", locale)}
      />
      <div style={{ marginBottom: "20px" }}>
        <PeriodSelector current={period} locale={locale} />
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: "16px", marginBottom: "22px" }}>
        {kpis.map((k, i) => (
          <Card key={i} style={{ padding: "20px" }}>
            <div style={{ fontSize: "13px", color: "var(--color-sub)", fontWeight: 600 }}>{k.label}</div>
            <div className="fx-num" style={{ fontSize: "28px", fontWeight: 800, marginTop: "14px", color: k.color, direction: locale === "en" ? "ltr" : "rtl", textAlign: locale === "en" ? "left" : "right" }}>{k.val}</div>
            {k.foot ? <div style={{ fontSize: "12.5px", color: "var(--color-sub)", marginTop: "5px" }}>{k.foot}</div> : null}
          </Card>
        ))}
      </div>

      {/* charts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "16px", marginBottom: "22px" }}>
        <Card style={{ padding: "22px", gridColumn: "1 / -1" }}>
          <div style={{ marginBottom: "14px" }}>
            <h3 style={{ margin: 0, fontSize: "16.5px", fontWeight: 800, color: "var(--color-navy)" }}>{L("الإيرادات مقابل المصروفات", "Revenue vs Expenses", locale)}</h3>
            <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: "var(--color-sub)" }}>{L("آخر 6 أشهر", "Last 6 months", locale)}</p>
          </div>
          <TrendChart data={trend} locale={locale} />
        </Card>
        <Card style={{ padding: "22px" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: "16.5px", fontWeight: 800, color: "var(--color-navy)" }}>{L("توزيع المصروفات", "Expense Breakdown", locale)}</h3>
          <DonutChart segments={donut} locale={locale} />
        </Card>
        <Card style={{ padding: "22px" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: "16.5px", fontWeight: 800, color: "var(--color-navy)" }}>{L("أعلى العملاء بالإيرادات", "Top Clients by Revenue", locale)}</h3>
          <TopClientsChart rows={top} locale={locale} />
        </Card>
      </div>

      {/* master table */}
      <Card>
        <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--color-border)" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "var(--color-navy)" }}>{L("العائد الصافي لكل مشروع", "Net Return per Project", locale)}</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "640px" }}>
            <thead>
              <tr>
                {th(L("المشروع", "Project", locale))}
                {th(L("العميل", "Client", locale))}
                {th(L("النوع", "Type", locale))}
                {th(L("قيمة العقد", "Contract Value", locale))}
                {th(L("المحصّل", "Collected", locale))}
                {th(L("المصاريف", "Expenses", locale))}
                {th(L("الصافي", "Net", locale))}
              </tr>
            </thead>
            <tbody>
              {returns.length ? (
                returns.map((r) => {
                  const p = projById(r.projectId);
                  return (
                    <tr key={r.projectId}>
                      {td(<span style={{ fontWeight: 700 }}>{p.name}</span>)}
                      {td(clientName(p.clientId))}
                      {td(L(p.type === "retainer" ? "اشتراك شهري" : "إنتاج لمرة", p.type === "retainer" ? "Retainer" : "One-off", locale))}
                      {td(money(p.value, locale))}
                      {td(money(r.rev, locale))}
                      {td(money(r.cost, locale))}
                      {td(<span style={{ fontWeight: 800, color: r.net >= 0 ? "var(--color-green)" : "var(--color-red)" }}>{money(r.net, locale)}</span>)}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7}>
                    <EmptyState message={L("لا توجد مشاريع", "No projects", locale)} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
