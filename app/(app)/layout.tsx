import { redirect } from "next/navigation";
import { getOrgContext } from "@/lib/auth/context";
import { AppShell } from "@/components/shell/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");

  return (
    <AppShell orgName={ctx.orgName} role={ctx.role} locale={ctx.locale}>
      {children}
    </AppShell>
  );
}
