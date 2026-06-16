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
        background: "linear-gradient(135deg,#fbf6ee,#f4eee3)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "22px" }}>
          <Image
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
            background: "#fff",
            border: "1px solid var(--color-border)",
            borderRadius: "18px",
            padding: "28px 26px",
            boxShadow: "0 2px 8px rgba(44,38,32,.05), 0 20px 50px rgba(44,38,32,.06)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
