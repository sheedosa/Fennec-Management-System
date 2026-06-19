import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Locale, OrgRole } from "@/lib/types";
import type { ThemePref } from "@/lib/theme";

export interface OrgContext {
  userId: string;
  email: string | null;
  orgId: string;
  orgName: string;
  role: OrgRole;
  locale: Locale;
  theme: ThemePref;
}

/**
 * Resolve the signed-in user's current org context (first membership).
 * Returns null when not signed in or not yet a member of any org — callers
 * route to /login or /onboarding accordingly.
 *
 * Wrapped in React cache(): the (app) layout and the page both call this in
 * one request render, so this dedupes the getUser()+membership round-trips to
 * a single execution per request.
 */
export const getOrgContext = cache(async (): Promise<OrgContext | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from("memberships")
    .select("role, org_id, organizations(name, locale, theme)")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!membership) return null;

  const org = membership.organizations as unknown as {
    name: string;
    locale: string;
    theme: string;
  } | null;
  return {
    userId: user.id,
    email: user.email ?? null,
    orgId: membership.org_id,
    orgName: org?.name ?? "",
    role: membership.role,
    locale: (org?.locale as Locale) ?? "ar",
    theme: (org?.theme as ThemePref) ?? "dark",
  };
});
