import { getOrgContext } from "@/lib/auth/context";
import { loadFennecData } from "@/lib/data/load";
import { L } from "@/lib/i18n/dictionary";
import { money } from "@/lib/finance/money";
import { clientLTV } from "@/lib/finance/client";
import { Card, SectionHead } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

// Monochrome avatar gradients (greys read on both white and black cards).
const PALS: [string, string][] = [
  ["#3f3f46", "#52525b"], ["#52525b", "#71717a"], ["#27272a", "#3f3f46"],
  ["#46464d", "#5e5e66"], ["#33333a", "#4a4a52"], ["#5a5a62", "#7a7a82"],
];
function avatarGrad(seed: string): [string, string] {
  let n = 0;
  for (let i = 0; i < (seed || "").length; i++) n += seed.charCodeAt(i);
  return PALS[n % PALS.length];
}

export default async function ClientsPage() {
  const ctx = (await getOrgContext())!;
  const locale = ctx.locale;
  const data = await loadFennecData();

  return (
    <div style={{ animation: "fxFade .3s" }}>
      <SectionHead
        title={L("العملاء", "Clients", locale)}
        sub={L("الجهات التي تعمل معها.", "The businesses you work with.", locale)}
      />
      {data.clients.length ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(264px,1fr))", gap: "16px" }}>
          {data.clients.map((c) => {
            const projs = data.projects.filter((p) => p.clientId === c.id);
            const ltv = clientLTV(data, c.id);
            const g = avatarGrad(c.name);
            return (
              <Card key={c.id} style={{ padding: "18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                  <div style={{ width: "46px", height: "46px", borderRadius: "13px", background: `linear-gradient(135deg,${g[0]},${g[1]})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "18px", flexShrink: 0 }}>{c.name.charAt(0)}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: "16px", color: "var(--color-navy)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                    <div style={{ fontSize: "13px", color: "var(--color-sub)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.contact || "—"}</div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--color-line)", paddingTop: "13px" }}>
                  <div>
                    <div style={{ fontSize: "11.5px", color: "var(--color-sub)", marginBottom: "2px" }}>{L("القيمة الكلية", "Lifetime value", locale)}</div>
                    <div className="fx-num" style={{ fontWeight: 800, color: "var(--color-green)", fontSize: "15.5px" }}>{money(ltv, locale)}</div>
                  </div>
                  <div style={{ textAlign: locale === "en" ? "right" : "left" }}>
                    <div style={{ fontSize: "11.5px", color: "var(--color-sub)", marginBottom: "2px" }}>{L("المشاريع", "Projects", locale)}</div>
                    <div className="fx-num" style={{ fontWeight: 800, color: "var(--color-navy)", fontSize: "15.5px" }}>{projs.length}</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card style={{ padding: "8px" }}>
          <EmptyState
            message={L("لا يوجد عملاء بعد.", "No clients yet.", locale)}
            icon={["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8"]}
          />
        </Card>
      )}
    </div>
  );
}
