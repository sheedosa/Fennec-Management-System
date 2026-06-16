"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, type AuthState } from "@/actions/auth";
import { Field, SubmitButton, FormMessage } from "@/components/auth/fields";

export default function LoginPage() {
  const [state, action] = useActionState<AuthState, FormData>(signIn, {});
  return (
    <div>
      <h1 style={{ margin: "0 0 4px", fontSize: "21px", fontWeight: 800, color: "var(--color-navy)" }}>
        تسجيل الدخول
      </h1>
      <p style={{ margin: "0 0 20px", fontSize: "13.5px", color: "var(--color-sub)" }}>
        أهلاً بعودتك إلى نظام إدارة فينيك المالي.
      </p>
      <FormMessage error={state.error} notice={state.notice} />
      <form action={action}>
        <Field label="اسم المستخدم أو البريد" name="email" type="text" placeholder="fennec" required dir="ltr" />
        <Field label="كلمة المرور" name="password" type="password" required dir="ltr" />
        <SubmitButton label="دخول" />
      </form>
      <p style={{ marginTop: "16px", fontSize: "13px", color: "var(--color-sub)", textAlign: "center" }}>
        ليس لديك حساب؟{" "}
        <Link href="/signup" style={{ color: "var(--color-blue)", fontWeight: 700 }}>
          أنشئ حساباً
        </Link>
      </p>
    </div>
  );
}
