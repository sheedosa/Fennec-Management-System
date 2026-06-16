"use client";

import Image from "next/image";
import { useActionState } from "react";
import { createOrganization, type OrgActionState } from "@/actions/org";
import { Field, SubmitButton, FormMessage } from "@/components/auth/fields";

export default function OnboardingPage() {
  const [state, action] = useActionState<OrgActionState, FormData>(createOrganization, {});
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "linear-gradient(135deg,#fbf6ee,#f4eee3)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "22px" }}>
          <Image
            src="/assets/fennec-logo-dark.png"
            alt="Fennec"
            width={160}
            height={42}
            style={{ width: "160px", height: "auto", margin: "0 auto" }}
            priority
          />
        </div>
        <div
          style={{
            background: "#fff",
            border: "1px solid var(--color-border)",
            borderRadius: "18px",
            padding: "28px 26px",
            boxShadow: "0 2px 8px rgba(44,38,32,.05), 0 20px 50px rgba(44,38,32,.06)",
          }}
        >
          <h1 style={{ margin: "0 0 4px", fontSize: "21px", fontWeight: 800, color: "var(--color-navy)" }}>
            أنشئ منظمتك
          </h1>
          <p style={{ margin: "0 0 20px", fontSize: "13.5px", color: "var(--color-sub)" }}>
            ستكون مديرها — يمكنك دعوة فريقك لاحقاً.
          </p>
          <FormMessage error={state.error} />
          <form action={action}>
            <Field label="اسم المنظمة / الوكالة" name="name" placeholder="مثال: وكالة فينيك" required />
            <label style={{ display: "block", marginBottom: "16px" }}>
              <span
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "var(--color-sub)",
                  marginBottom: "6px",
                }}
              >
                لغة الواجهة
              </span>
              <select
                name="locale"
                defaultValue="ar"
                style={{
                  width: "100%",
                  padding: "11px 13px",
                  borderRadius: "12px",
                  border: "1px solid var(--color-border)",
                  background: "#fff",
                  fontSize: "14.5px",
                  color: "var(--color-navy)",
                }}
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </label>
            <SubmitButton label="إنشاء المنظمة" />
          </form>
        </div>
      </div>
    </div>
  );
}
