import Image from "next/image";

// Temporary landing page. Phase 1 replaces this with auth-gated routing:
// signed-out → /login, signed-in → /dashboard.
export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <Image
        src="/assets/fennec-logo-dark.png"
        alt="Fennec"
        width={180}
        height={48}
        style={{ height: "auto", width: "180px" }}
        priority
      />
      <div style={{ color: "var(--color-faint)", letterSpacing: "3.5px", fontSize: "11px" }}>
        FINANCE SUITE
      </div>
      <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 800, color: "var(--color-navy)" }}>
        نظام الإدارة المالية — Fennec Management System
      </h1>
      <p style={{ color: "var(--color-sub)", maxWidth: "440px", lineHeight: 1.7 }}>
        المنصة قيد البناء على Next.js + Supabase. الواجهات المالية الستّ والمنطق
        المحاسبي يُعاد بناؤها بدقة من النموذج الأصلي.
      </p>
    </main>
  );
}
