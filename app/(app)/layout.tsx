import { redirect } from "next/navigation";
import { getOrgContext } from "@/lib/auth/context";
import { supabaseConfigured } from "@/lib/supabase/env";
import { ConfigNotice } from "@/components/ConfigNotice";
import { AppShell } from "@/components/shell/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!supabaseConfigured()) return <ConfigNotice />;
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");

  return (
    <AppShell orgName={ctx.orgName} role={ctx.role} locale={ctx.locale}>
      {children}
    </AppShell>
  );
}
