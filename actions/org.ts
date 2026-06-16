"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgContext } from "@/lib/auth/context";
import { importFennecData } from "@/lib/data/import";
import { seed } from "@/lib/seed";

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

/** Populate the current org with the prototype demo dataset. */
export async function loadDemoData(): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/login");
  const supabase = await createClient();
  await importFennecData(supabase, ctx.orgId, seed());
  revalidatePath("/", "layout");
  redirect("/dashboard");
}
