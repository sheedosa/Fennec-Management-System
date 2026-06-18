import { getOrgContext } from "@/lib/auth/context";
import { loadFennecData } from "@/lib/data/load";
import { L, fmtDate } from "@/lib/i18n/dictionary";
import { money } from "@/lib/finance/money";
import { Card, SectionHead } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

const CAT: Record<string, [string, string]> = {
  salaries: ["رواتب", "Salaries"], rent: ["إيجار", "Rent"], internet: ["إنترنت واشتراكات", "Internet & Subscriptions"], operations: ["تشغيل وضيافة", "Operations & Hospitality"],
};
const TYPE: Record<string, [string, string, string, string]> = {
  // [ar, en, color, soft-bg] — revenue keeps green; costs/overhead neutral
  revenue: ["إيراد", "Revenue", "var(--color-green)", "var(--color-green-soft)"],
  cost: ["تكلفة مشروع", "Project Cost", "var(--color-sub)", "var(--color-card-alt)"],
  overhead: ["مصروف ثابت", "Fixed Expense", "var(--color-sub)", "var(--color-card-alt)"],
};

export default async function FinancesPage() {
  const ctx = (await getOrgContext())!;
  const locale = ctx.locale;
  const data = await loadFennecData();
  const projectName = (id?: string | null) => (id ? data.projects.find((p) => p.id === id)?.name ?? "—" : "—");

  const rows = data.transactions.slice().sort((a, b) => +new Date(b.date) - +new Date(a.date));

  const th = (t: string) => (
    <th style={{ padding: "15px 18px", textAlign: locale === "en" ? "left" : "right", fontSize: "12px", fontWeight: 700, color: "var(--color-sub)", background: "var(--color-card-alt)", borderBottom: "1px solid var(--color-border)", whiteSpace: "nowrap" }}>{t}</th>
  );
  const td = (c: React.ReactNode) => (
    <td style={{ padding: "15px 18px", fontSize: "14.5px", color: "var(--color-navy)", borderBottom: "1px solid var(--color-line)", verticalAlign: "middle" }}>{c}</td>
  );

  return (
    <div style={{ animation: "fxFade .3s" }}>
      <SectionHead title={L("المالية والمصروفات", "Finance & Expenses", locale)} sub={L("سجّل الإيرادات والتكاليف والمصروفات الثابتة.", "Record revenue, costs & fixed expenses.", locale)} />
      <Card>
        <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--color-border)" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "var(--color-navy)" }}>{L("دفتر اليومية", "Journal", locale)}</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "740px" }}>
            <thead>
              <tr>
                {th(L("التاريخ", "Date", locale))}
                {th(L("النوع", "Type", locale))}
                {th(L("الوصف", "Description", locale))}
                {th(L("المشروع/التصنيف", "Project / Category", locale))}
                {th(L("المبلغ", "Amount", locale))}
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((t) => {
                  const [ar, en, color, bg] = TYPE[t.type];
                  const ref = t.type === "overhead" ? (t.category ? L(CAT[t.category][0], CAT[t.category][1], locale) : "—") : projectName(t.projectId);
                  const signed = (t.type === "revenue" ? "+" : "−") + money(t.amount, locale);
                  return (
                    <tr key={t.id}>
                      {td(fmtDate(t.date, locale))}
                      {td(
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 11px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, color, background: bg }}>
                          {L(ar, en, locale)}
                        </span>,
                      )}
                      {td(t.desc || "—")}
                      {td(ref)}
                      {td(<span className="fx-num" style={{ fontWeight: 700, color: t.type === "revenue" ? "var(--color-green)" : "var(--color-navy)" }}>{signed}</span>)}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5}>
                    <EmptyState message={L("لا توجد حركات مطابقة", "No matching entries", locale)} />
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
