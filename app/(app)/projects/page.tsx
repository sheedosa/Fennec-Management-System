import { getOrgContext } from "@/lib/auth/context";
import { loadFennecData } from "@/lib/data/load";
import { L } from "@/lib/i18n/dictionary";
import { money } from "@/lib/finance/money";
import { fmtDate } from "@/lib/i18n/dictionary";
import { isOverdueProject } from "@/lib/finance/invoice";
import { Card, SectionHead } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default async function ProjectsPage() {
  const ctx = (await getOrgContext())!;
  const locale = ctx.locale;
  const data = await loadFennecData();
  const now = new Date();
  const clientName = (id: string) => data.clients.find((c) => c.id === id)?.name ?? "—";

  const th = (t: string) => (
    <th style={{ padding: "15px 18px", textAlign: locale === "en" ? "left" : "right", fontSize: "12px", fontWeight: 700, color: "var(--color-sub)", background: "var(--color-card-alt)", borderBottom: "1px solid var(--color-border)", whiteSpace: "nowrap" }}>{t}</th>
  );
  const td = (c: React.ReactNode) => (
    <td style={{ padding: "15px 18px", fontSize: "14.5px", color: "var(--color-navy)", borderBottom: "1px solid var(--color-line)", verticalAlign: "middle", whiteSpace: "nowrap" }}>{c}</td>
  );

  return (
    <div style={{ animation: "fxFade .3s" }}>
      <SectionHead title={L("المشاريع والعقود", "Projects & Contracts", locale)} sub={L("جميع عقود ومشاريع الوكالة.", "All agency contracts and projects.", locale)} />
      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "760px" }}>
            <thead>
              <tr>
                {th(L("المشروع", "Project", locale))}
                {th(L("العميل", "Client", locale))}
                {th(L("النوع", "Type", locale))}
                {th(L("قيمة العقد", "Contract Value", locale))}
                {th(L("البداية", "Start", locale))}
                {th(L("التسليم", "Delivery", locale))}
                {th(L("الحالة", "Status", locale))}
              </tr>
            </thead>
            <tbody>
              {data.projects.length ? (
                data.projects.map((p) => {
                  const overdue = isOverdueProject(p, now);
                  return (
                    <tr key={p.id}>
                      {td(<span style={{ fontWeight: 700 }}>{p.name}</span>)}
                      {td(clientName(p.clientId))}
                      {td(L(p.type === "retainer" ? "اشتراك شهري" : "إنتاج لمرة", p.type === "retainer" ? "Retainer" : "One-off", locale))}
                      {td(<span className="fx-num">{money(p.value, locale)}</span>)}
                      {td(fmtDate(p.startDate, locale))}
                      {td(fmtDate(p.endDate, locale))}
                      {td(<StatusBadge status={overdue ? "overdue" : p.status} locale={locale} />)}
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
