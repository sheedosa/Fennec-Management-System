import { redirect } from "next/navigation";
import { getOrgContext } from "@/lib/auth/context";
import { getThemePref } from "@/lib/theme";
import { supabaseConfigured } from "@/lib/supabase/env";
import { ConfigNotice } from "@/components/ConfigNotice";
import { AppShell } from "@/components/shell/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!supabaseConfigured()) return <ConfigNotice />;
  const ctx = await getOrgContext();
  if (!ctx) redirect("/onboarding");

  // Drive the toggle from the cookie-resolved pref (what's actually painted),
  // falling back to the org's stored default, so the icon never diverges from
  // the rendered theme on first load.
  const themePref = (await getThemePref()) ?? ctx.theme;

  return (
    <AppShell orgName={ctx.orgName} role={ctx.role} locale={ctx.locale} theme={themePref}>
      {children}
    </AppShell>
  );
}
