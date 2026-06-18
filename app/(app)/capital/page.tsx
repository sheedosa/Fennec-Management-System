import { getOrgContext } from "@/lib/auth/context";
import { L } from "@/lib/i18n/dictionary";
import { SectionHead, Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

// Placeholder — fleshed out in M6 (asset register + live cash/receivables).
export default async function CapitalPage() {
  const ctx = (await getOrgContext())!;
  const locale = ctx.locale;
  return (
    <div style={{ animation: "fxFade .3s" }}>
      <SectionHead title={L("رأس مال الشركة", "Company Capital", locale)} sub={L("أصول الوكالة ورأس مالها.", "The agency's assets and capital.", locale)} />
      <Card style={{ padding: "8px" }}>
        <EmptyState message={L("قيد الإنشاء — سجل الأصول والنقد قادم قريباً.", "Coming soon — asset register and live cash position.", locale)} />
      </Card>
    </div>
  );
}
