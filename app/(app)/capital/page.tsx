import { getOrgContext } from "@/lib/auth/context";
import { loadCapital } from "@/lib/data/capital";
import { L } from "@/lib/i18n/dictionary";
import { money } from "@/lib/finance/money";
import { SectionHead, Card } from "@/components/ui/Card";
import { CapitalManager } from "@/components/capital/CapitalManager";

export default async function CapitalPage() {
  const ctx = (await getOrgContext())!;
  const locale = ctx.locale;
  const cap = await loadCapital();

  const card = (label: string, val: string, sub?: string, big?: boolean, tone?: "green") => (
    <Card style={{ padding: big ? "22px" : "18px", gridColumn: big ? "1 / -1" : undefined }}>
      <div style={{ fontSize: "13px", color: "var(--fg-muted)" }}>{label}</div>
      <div className="fx-num" style={{ fontSize: big ? "34px" : "22px", fontWeight: 800, marginTop: "6px", color: tone === "green" ? "var(--success)" : "var(--fg)" }}>{val}</div>
      {sub ? <div style={{ fontSize: "12.5px", color: "var(--fg-faint)", marginTop: "4px" }}>{sub}</div> : null}
    </Card>
  );

  return (
    <div style={{ animation: "fxFade .3s" }}>
      <SectionHead
        title={L("رأس مال الشركة", "Company Capital", locale)}
        sub={L("أصول الوكالة ونقدها ومستحقاتها — صورة كاملة لقيمة الشركة.", "The agency's assets, cash and receivables — a full picture of company worth.", locale)}
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "14px", marginBottom: "24px" }}>
        {card(L("إجمالي قيمة الشركة", "Total Company Worth", locale), money(cap.worth, locale), L("الأصول + النقد + المستحقات", "Assets + cash + receivables", locale), true, "green")}
        {card(L("النقد (صافي تراكمي)", "Cash (cumulative net)", locale), money(cap.cash, locale), L("الإيرادات ناقص كل المصاريف", "Revenue minus all expenses", locale))}
        {card(L("مستحقات (فواتير غير محصّلة)", "Receivables (outstanding)", locale), money(cap.receivables, locale))}
        {card(L("إجمالي الأصول المسجّلة", "Registered Assets", locale), money(cap.assetsTotal, locale))}
      </div>
      <CapitalManager assets={cap.assets} locale={locale} role={ctx.role} />
    </div>
  );
}
