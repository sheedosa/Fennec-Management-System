import { notFound } from "next/navigation";
import { getOrgContext } from "@/lib/auth/context";
import { loadProjectDetail } from "@/lib/data/project";
import { ProjectDashboard } from "@/components/projects/ProjectDashboard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { L } from "@/lib/i18n/dictionary";

export default async function ProjectPage({ params }: { params: Promise<{ pid: string }> }) {
  const { pid } = await params;
  const ctx = (await getOrgContext())!;
  const detail = await loadProjectDetail(pid);
  if (!detail) notFound();

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: L("العملاء", "Clients", ctx.locale), href: "/clients" },
          ...(detail.client ? [{ label: detail.client.name, href: `/clients/${detail.client.id}` }] : []),
          { label: detail.project.name },
        ]}
      />
      <ProjectDashboard detail={detail} locale={ctx.locale} role={ctx.role} />
    </div>
  );
}
