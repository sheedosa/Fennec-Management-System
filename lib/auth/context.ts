import { createClient } from "@/lib/supabase/server";
import type { Locale, OrgRole } from "@/lib/types";

export interface OrgContext {
  userId: string;
  email: string | null;
  orgId: string;
  orgName: string;
  role: OrgRole;
  locale: Locale;
}

/**
 * Resolve the signed-in user's current org context (first membership).
 * Returns null when not signed in or not yet a member of any org — callers
 * route to /login or /onboarding accordingly.
 */
export async function getOrgContext(): Promise<OrgContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("memberships")
    .select("role, org_id, organizations(name, locale)")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!membership) return null;

  const org = membership.organizations as unknown as { name: string; locale: string } | null;
  return {
    userId: user.id,
    email: user.email ?? null,
    orgId: membership.org_id,
    orgName: org?.name ?? "",
    role: membership.role,
    locale: (org?.locale as Locale) ?? "ar",
  };
}
