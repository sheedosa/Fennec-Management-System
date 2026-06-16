"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp, type AuthState } from "@/actions/auth";
import { Field, SubmitButton, FormMessage } from "@/components/auth/fields";

export default function SignupPage() {
  const [state, action] = useActionState<AuthState, FormData>(signUp, {});
  return (
    <div>
      <h1 style={{ margin: "0 0 4px", fontSize: "21px", fontWeight: 800, color: "var(--color-navy)" }}>
        إنشاء حساب
      </h1>
      <p style={{ margin: "0 0 20px", fontSize: "13.5px", color: "var(--color-sub)" }}>
        ابدأ بإدارة مالية وكالتك في دقائق.
      </p>
      <FormMessage error={state.error} notice={state.notice} />
      <form action={action}>
        <Field label="الاسم الكامل" name="fullName" />
        <Field label="البريد الإلكتروني" name="email" type="email" required dir="ltr" />
        <Field label="كلمة المرور (8 أحرف على الأقل)" name="password" type="password" required dir="ltr" />
        <SubmitButton label="إنشاء الحساب" />
      </form>
      <p style={{ marginTop: "16px", fontSize: "13px", color: "var(--color-sub)", textAlign: "center" }}>
        لديك حساب بالفعل؟{" "}
        <Link href="/login" style={{ color: "var(--color-blue)", fontWeight: 700 }}>
          سجّل الدخول
        </Link>
      </p>
    </div>
  );
}
