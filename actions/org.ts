"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/context";
import { importFennecData } from "@/lib/data/import";
import { seed } from "@/lib/seed";
import { THEME_COOKIE, type ThemePref } from "@/lib/theme";

export interface OrgActionState {
  error?: string;
}

/** Create the user's organization (they become its manager) — onboarding. */
export async function createOrganization(
  _prev: OrgActionState,
  formData: FormData,
): Promise<OrgActionState> {
  const name = String(formData.get("name") || "").trim();
  const locale = String(formData.get("locale") || "ar");
  if (!name) return { error: "اسم المنظمة مطلوب" };

  const supabase = await createClient();
  const { data: orgId, error } = await supabase.rpc("create_org_and_owner", {
    org_name: name,
  });
  if (error) return { error: error.message };

  if (locale === "en" && orgId) {
    await supabase.from("organizations").update({ locale }).eq("id", orgId);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/** Switch the org's interface language. */
export async function setLocale(locale: "ar" | "en"): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/login");
  const supabase = await createClient();
  await supabase.from("organizations").update({ locale }).eq("id", ctx.orgId);
  revalidatePath("/", "layout");
}

/** Switch the theme. Persists to a cookie (for no-flash SSR) and, when
 *  signed in, to organizations.theme as the durable per-org default. */
export async function setTheme(theme: ThemePref): Promise<void> {
  const c = await cookies();
  c.set(THEME_COOKIE, theme, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  const ctx = await getOrgContext();
  if (ctx) {
    const supabase = await createClient();
    await supabase.from("organizations").update({ theme }).eq("id", ctx.orgId);
  }
  revalidatePath("/", "layout");
}

/** Populate the current org with the prototype demo dataset. */
export async function loadDemoData(): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/login");
  const supabase = await createClient();
  await importFennecData(supabase, ctx.orgId, seed());
  revalidatePath("/", "layout");
  redirect("/dashboard");
}
