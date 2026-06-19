// Instant navigation feedback: this skeleton renders in the content slot the
// moment a link is clicked, while the destination's server render streams in.
// The shell (sidebar/topbar) stays put — only the content area swaps.
export default function Loading() {
  return (
    <div style={{ animation: "fxFade .2s" }}>
      <div className="fx-skel" style={{ height: "30px", width: "220px", marginBottom: "10px" }} />
      <div className="fx-skel" style={{ height: "16px", width: "320px", marginBottom: "24px", opacity: 0.7 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "14px", marginBottom: "22px" }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="fx-skel" style={{ height: "92px" }} />
        ))}
      </div>
      <div className="fx-skel" style={{ height: "260px" }} />
    </div>
  );
}
