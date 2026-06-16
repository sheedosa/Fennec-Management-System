import { getOrgContext } from "@/lib/auth/context";
import { loadFennecData } from "@/lib/data/load";
import { L } from "@/lib/i18n/dictionary";
import { money } from "@/lib/finance/money";
import { pipelineStats } from "@/lib/finance/pipeline";
import { Card, SectionHead } from "@/components/ui/Card";

const COLS: { stage: string; ar: string; en: string; color: string }[] = [
  { stage: "contact", ar: "تواصل أولي", en: "Initial Contact", color: "#8c8175" },
  { stage: "proposal", ar: "تم إرسال العرض", en: "Proposal Sent", color: "#b8542f" },
  { stage: "negotiation", ar: "تفاوض نهائي", en: "Final Negotiation", color: "#c9821f" },
  { stage: "lost", ar: "خسارة", en: "Lost", color: "#d24b3e" },
];
const LOST: Record<string, [string, string]> = {
  price: ["السعر", "Price"], timing: ["التوقيت", "Timing"], competitor: ["منافس", "Competitor"], noresponse: ["عدم رد", "No response"], other: ["أخرى", "Other"],
};

export default async function PipelinePage() {
  const ctx = (await getOrgContext())!;
  const locale = ctx.locale;
  const data = await loadFennecData();
  const stats = pipelineStats(data.leads);
  const clientName = (id: string) => data.clients.find((c) => c.id === id)?.name ?? "—";

  const stat = (label: string, val: string, color?: string) => (
    <Card style={{ padding: "16px" }}>
      <div style={{ fontSize: "12.5px", color: "var(--color-sub)" }}>{label}</div>
      <div className="fx-num" style={{ fontSize: "22px", fontWeight: 800, marginTop: "5px", color: color || "var(--color-navy)" }}>{val}</div>
    </Card>
  );

  return (
    <div style={{ animation: "fxFade .3s" }}>
      <SectionHead title={L("الفرص البيعية", "Pipeline", locale)} sub={L("تتبّع الصفقات من التواصل حتى الإغلاق.", "Track deals from contact to close.", locale)} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "14px", marginBottom: "22px" }}>
        {stat(L("القيمة المرجّحة للأنبوب", "Weighted Pipeline Value", locale), money(stats.weighted, locale), "var(--color-blue)")}
        {stat(L("معدّل الإغلاق (الفوز)", "Win Rate", locale), stats.winRate.toFixed(0) + "%")}
        {stat(L("صفقات مكسوبة", "Deals Won", locale), String(stats.won), "var(--color-green)")}
        {stat(L("صفقات خاسرة", "Deals Lost", locale), String(stats.lost), "var(--color-red)")}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "14px", alignItems: "start" }}>
        {COLS.map((col) => {
          const leads = data.leads.filter((l) => l.stage === col.stage).sort((a, b) => b.value - a.value);
          return (
            <div key={col.stage}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", padding: "0 4px" }}>
                <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: col.color }} />
                <span style={{ fontWeight: 800, fontSize: "14px", color: "var(--color-navy)" }}>{L(col.ar, col.en, locale)}</span>
                <span className="fx-num" style={{ fontSize: "12px", color: "var(--color-sub)", fontWeight: 700 }}>{leads.length}</span>
              </div>
              {leads.map((l) => (
                <div key={l.id} style={{ background: "#fff", border: "1px solid var(--color-border)", borderRadius: "13px", padding: "14px", marginBottom: "10px", boxShadow: "0 1px 2px rgba(44,38,32,.05)" }}>
                  <div style={{ fontWeight: 700, fontSize: "14.5px", color: "var(--color-navy)" }}>{l.name}</div>
                  <div style={{ fontSize: "12.5px", color: "var(--color-sub)", margin: "5px 0 9px" }}>{clientName(l.clientId)}</div>
                  <div className="fx-num" style={{ fontWeight: 800, color: "var(--color-navy)", fontSize: "16px" }}>{money(l.value, locale)}</div>
                  {l.stage === "lost" && l.lostReason ? (
                    <div style={{ fontSize: "12px", color: "var(--color-red)", background: "#fbece9", padding: "5px 9px", borderRadius: "8px", marginTop: "9px", fontWeight: 600 }}>
                      {L("السبب: ", "Reason: ", locale) + L(LOST[l.lostReason][0], LOST[l.lostReason][1], locale)}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
