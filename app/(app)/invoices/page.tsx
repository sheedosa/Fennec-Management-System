import { getOrgContext } from "@/lib/auth/context";
import { loadFennecData } from "@/lib/data/load";
import { InvoicesManager } from "@/components/invoices/InvoicesManager";

export default async function InvoicesPage() {
  const ctx = (await getOrgContext())!;
  const data = await loadFennecData();

  return (
    <InvoicesManager
      invoices={data.invoices}
      projects={data.projects.map((p) => ({ id: p.id, name: p.name }))}
      clients={data.clients.map((c) => ({ id: c.id, name: c.name }))}
      locale={ctx.locale}
      role={ctx.role}
      nowISO={new Date().toISOString()}
    />
  );
}
