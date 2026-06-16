import { getOrgContext } from "@/lib/auth/context";
import { loadFennecData } from "@/lib/data/load";
import { L, fmtDate } from "@/lib/i18n/dictionary";
import { money } from "@/lib/finance/money";
import { invEffStatus, invTotal } from "@/lib/finance/invoice";
import { Card, SectionHead } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default async function InvoicesPage() {
  const ctx = (await getOrgContext())!;
  const locale = ctx.locale;
  const data = await loadFennecData();
  const now = new Date();
  const clientName = (id: string) => data.clients.find((c) => c.id === id)?.name ?? "—";
  const projectName = (id?: string | null) => (id ? data.projects.find((p) => p.id === id)?.name ?? "—" : "—");

  const withStatus = data.invoices.map((iv) => ({ iv, eff: invEffStatus(iv, now), total: invTotal(iv) }));
  const receivables = withStatus.filter((x) => x.eff === "sent" || x.eff === "overdue").reduce((a, x) => a + (x.total - (x.iv.paidAmount || 0)), 0);
  const overdueCount = withStatus.filter((x) => x.eff === "overdue").length;

  const stat = (label: string, val: string, color?: string) => (
    <Card style={{ padding: "18px" }}>
      <div style={{ fontSize: "13px", color: "var(--color-sub)" }}>{label}</div>
      <div className="fx-num" style={{ fontSize: "24px", fontWeight: 800, marginTop: "6px", color: color || "var(--color-navy)" }}>{val}</div>
    </Card>
  );
  const th = (t: string) => (
    <th style={{ padding: "15px 18px", textAlign: locale === "en" ? "left" : "right", fontSize: "12px", fontWeight: 700, color: "var(--color-sub)", background: "var(--color-card-alt)", borderBottom: "1px solid var(--color-border)", whiteSpace: "nowrap" }}>{t}</th>
  );
  const td = (c: React.ReactNode) => (
    <td style={{ padding: "15px 18px", fontSize: "14.5px", color: "var(--color-navy)", borderBottom: "1px solid var(--color-line)", verticalAlign: "middle", whiteSpace: "nowrap" }}>{c}</td>
  );

  return (
    <div style={{ animation: "fxFade .3s" }}>
      <SectionHead title={L("الفواتير", "Invoices", locale)} sub={L("إدارة الفواتير والتحصيل.", "Manage invoices & collections.", locale)} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "14px", marginBottom: "20px" }}>
        {stat(L("إجمالي المستحقات (غير محصّلة)", "Total Receivables (Outstanding)", locale), money(receivables, locale), "var(--color-amber)")}
        {stat(L("فواتير متأخرة", "Overdue Invoices", locale), String(overdueCount), overdueCount ? "var(--color-red)" : undefined)}
        {stat(L("إجمالي الفواتير", "Total Invoices", locale), String(data.invoices.length))}
      </div>
      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "820px" }}>
            <thead>
              <tr>
                {th(L("رقم الفاتورة", "Invoice #", locale))}
                {th(L("العميل", "Client", locale))}
                {th(L("المشروع", "Project", locale))}
                {th(L("الإصدار", "Issued", locale))}
                {th(L("الاستحقاق", "Due", locale))}
                {th(L("المبلغ", "Amount", locale))}
                {th(L("الحالة", "Status", locale))}
              </tr>
            </thead>
            <tbody>
              {withStatus.length ? (
                withStatus.map(({ iv, eff, total }) => (
                  <tr key={iv.id}>
                    {td(<span style={{ fontWeight: 700 }} dir="ltr">{iv.number}</span>)}
                    {td(clientName(iv.clientId))}
                    {td(projectName(iv.projectId))}
                    {td(fmtDate(iv.issueDate, locale))}
                    {td(fmtDate(iv.dueDate, locale))}
                    {td(<span className="fx-num">{money(total, locale)}</span>)}
                    {td(<StatusBadge status={eff} locale={locale} />)}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <EmptyState message={L("لا توجد فواتير", "No invoices", locale)} icon={["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6"]} />
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
