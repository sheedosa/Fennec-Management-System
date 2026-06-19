import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "var(--bg)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "22px" }}>
          <Image
            className="fx-logo"
            src="/assets/fennec-logo-dark.png"
            alt="Fennec"
            width={160}
            height={42}
            style={{ width: "160px", height: "auto", margin: "0 auto" }}
            priority
          />
          <div
            style={{
              color: "var(--color-faint)",
              letterSpacing: "3.5px",
              fontSize: "10px",
              marginTop: "4px",
            }}
          >
            FINANCE SUITE
          </div>
        </div>
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "18px",
            padding: "28px 26px",
            boxShadow: "var(--elev-2)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
