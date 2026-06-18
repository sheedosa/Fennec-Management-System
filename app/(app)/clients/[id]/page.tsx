import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrgContext } from "@/lib/auth/context";
import { loadFennecData } from "@/lib/data/load";
import { L, fmtDate } from "@/lib/i18n/dictionary";
import { money } from "@/lib/finance/money";
import { clientLTV, clientPayments } from "@/lib/finance/client";
import { invEffStatus } from "@/lib/finance/invoice";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = (await getOrgContext())!;
  const locale = ctx.locale;
  const data = await loadFennecData();
  const client = data.clients.find((c) => c.id === id);
  if (!client) notFound();

  const now = new Date();
  const projects = data.projects.filter((p) => p.clientId === id);
  const invoices = data.invoices.filter((iv) => iv.clientId === id);
  const ltv = clientLTV(data, id);
  const pays = clientPayments(data, id);
  const projRevenue = (pid: string) => data.transactions.filter((t) => t.type === "revenue" && t.projectId === pid).reduce((a, b) => a + b.amount, 0);

  const stat = (label: string, val: string, tone?: "green") => (
    <Card style={{ padding: "16px" }}>
      <div style={{ fontSize: "13px", color: "var(--fg-muted)" }}>{label}</div>
      <div className="fx-num" style={{ fontSize: "22px", fontWeight: 800, marginTop: "5px", color: tone === "green" ? "var(--success)" : "var(--fg)" }}>{val}</div>
    </Card>
  );

  return (
    <div style={{ animation: "fxFade .3s" }}>
      <Breadcrumbs items={[{ label: L("العملاء", "Clients", locale), href: "/clients" }, { label: client.name }]} />

      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
        <Avatar name={client.name} size={54} />
        <div>
          <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "var(--fg)" }}>{client.name}</h1>
          {client.contact ? <div style={{ color: "var(--fg-muted)", fontSize: "14px", marginTop: "3px" }}>{client.contact}</div> : null}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: "12px", marginBottom: "22px" }}>
        {stat(L("القيمة الكلية للعميل", "Lifetime Value", locale), money(ltv, locale), "green")}
        {stat(L("عدد المشاريع", "Projects", locale), String(projects.length))}
        {stat(L("عدد الفواتير", "Invoices", locale), String(invoices.length))}
      </div>

      {/* Projects — click to open the mini-dashboard */}
      <h2 style={{ fontSize: "17px", fontWeight: 800, color: "var(--fg)", margin: "0 0 12px" }}>{L("المشاريع", "Projects", locale)}</h2>
      {projects.length ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "14px", marginBottom: "26px" }}>
          {projects.map((p) => {
            const overdue = p.status !== "completed" && p.status !== "cancelled" && new Date(p.endDate) < now;
            return (
              <Link key={p.id} href={`/projects/${p.id}`} style={{ textDecoration: "none" }}>
                <Card style={{ padding: "16px", cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "10px" }}>
                    <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--fg)" }}>{p.name}</div>
                    <StatusBadge status={overdue ? "overdue" : p.status} locale={locale} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--fg-muted)" }}>
                    <span>{L("قيمة العقد", "Value", locale)}: <span className="fx-num">{money(p.value, locale)}</span></span>
                    <span style={{ color: "var(--success)" }} className="fx-num">{money(projRevenue(p.id), locale)}</span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card style={{ padding: "8px", marginBottom: "26px" }}><EmptyState message={L("لا توجد مشاريع لهذا العميل", "No projects for this client", locale)} /></Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "16px" }}>
        <Card style={{ padding: "18px" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "15px", fontWeight: 800, color: "var(--fg)" }}>{L("معلومات الاتصال", "Contact Info", locale)}</h3>
          <Row label={L("الهاتف", "Phone", locale)} value={client.phone || "—"} ltr />
          <Row label={L("البريد", "Email", locale)} value={client.email || "—"} ltr />
          <div style={{ paddingTop: "10px", color: "var(--fg-muted)", fontSize: "13px" }}>{client.notes || L("لا توجد ملاحظات", "No notes", locale)}</div>
        </Card>
        <Card style={{ padding: "18px" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "15px", fontWeight: 800, color: "var(--fg)" }}>{L("سجل المدفوعات", "Payment History", locale)}</h3>
          {pays.length ? pays.slice(0, 8).map((t) => (
            <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: "14px" }}>
              <span style={{ color: "var(--fg-muted)" }}>{fmtDate(t.date, locale)}</span>
              <span style={{ fontWeight: 700, color: "var(--success)" }} className="fx-num">{money(t.amount, locale)}</span>
            </div>
          )) : <EmptyState message={L("لا مدفوعات", "No payments", locale)} />}
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: "14px" }}>
      <span style={{ color: "var(--fg-muted)" }}>{label}</span>
      <span style={{ fontWeight: 700, direction: ltr ? "ltr" : undefined }}>{value}</span>
    </div>
  );
}
