import { redirect } from "next/navigation";
import { getOrgContext } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { ConfigNotice } from "@/components/ConfigNotice";

// Entry point: route by auth/org state.
export default async function Home() {
  if (!supabaseConfigured()) return <ConfigNotice />;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const ctx = await getOrgContext();
  redirect(ctx ? "/dashboard" : "/onboarding");
}
