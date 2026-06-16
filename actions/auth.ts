"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthState {
  error?: string;
  notice?: string;
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const raw = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!raw || !password) return { error: "البريد وكلمة المرور مطلوبان" };
  // Allow a bare username (e.g. "fennec") — resolve it to the default domain.
  const email = raw.includes("@") ? raw : `${raw.toLowerCase()}@fennec.ly`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("fullName") || "").trim();
  if (!email || !password) return { error: "البريد وكلمة المرور مطلوبان" };
  if (password.length < 8) return { error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) return { error: error.message };

  // If email confirmation is required there is no session yet.
  if (!data.session) {
    return { notice: "تم إنشاء الحساب — تحقق من بريدك لتأكيد الحساب ثم سجّل الدخول." };
  }

  revalidatePath("/", "layout");
  redirect("/onboarding");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
