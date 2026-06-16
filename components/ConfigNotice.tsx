// Shown when the Supabase env vars are missing in a deployment, so the user
// gets an actionable message instead of an opaque "server-side exception".
export function ConfigNotice() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "linear-gradient(135deg,#fbf6ee,#f4eee3)",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: "480px" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚙️</div>
        <h1 style={{ margin: "0 0 10px", fontSize: "22px", fontWeight: 800, color: "#1a1510" }}>
          الإعداد غير مكتمل · Configuration needed
        </h1>
        <p style={{ margin: 0, fontSize: "14.5px", color: "#564d42", lineHeight: 1.7 }}>
          Supabase environment variables are not set in this deployment. Add{" "}
          <code style={{ background: "#fff", padding: "2px 6px", borderRadius: "6px", border: "1px solid #e9e0d2" }}>
            NEXT_PUBLIC_SUPABASE_URL
          </code>{" "}
          and{" "}
          <code style={{ background: "#fff", padding: "2px 6px", borderRadius: "6px", border: "1px solid #e9e0d2" }}>
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </code>{" "}
          in your Vercel project (Settings → Environment Variables, Production), then redeploy.
        </p>
      </div>
    </div>
  );
}
