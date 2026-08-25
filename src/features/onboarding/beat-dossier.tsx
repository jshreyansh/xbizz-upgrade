export function BeatDossier() {
  return (
    <div className="rise-in flex w-full max-w-4xl gap-16 items-center">
      <div style={{ flex: 1, color: "#fff" }}>
        <div style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(255,255,255,.45)", fontWeight: 700, marginBottom: 18 }}>How it works · 2 of 3</div>
        <h2 style={{ fontSize: "clamp(30px,3vw,44px)", lineHeight: 1.08, fontWeight: 800, letterSpacing: "-1.5px", margin: "0 0 16px" }}>
          It becomes{" "}
          <em style={{ fontStyle: "normal", background: "linear-gradient(96deg,#ffd9c7,#ff8a5c 46%,#ffcfb8)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>one record</em>{" "}
          you can trust.
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.62, color: "rgba(255,255,255,.62)", margin: "0 0 22px", maxWidth: "42ch" }}>
          Every sentence carries the source it came from. Anything we cannot source is held out — you see exactly what was left behind and why.
        </p>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "13px 16px", borderRadius: "var(--r)", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", fontSize: 13.5, color: "rgba(255,255,255,.8)", maxWidth: "44ch" }}>
          <span style={{ color: "var(--brand-2)", fontWeight: 800, flexShrink: 0 }}>✓</span>
          This is the Brand Dossier. You build it once.
        </div>
      </div>

      {/* Dossier card mockup */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 340, borderRadius: "var(--r-l)", background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", backdropFilter: "blur(18px)", padding: "20px 22px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,.08)" }}>
            <span style={{ width: 32, height: 32, borderRadius: 9, background: "var(--brand)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}><path d="M2 4h7a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5H2z" /><path d="M22 4h-7a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2.5H22z" /></svg>
            </span>
            <span>
              <b style={{ display: "block", fontSize: 14, color: "#fff", fontWeight: 700 }}>Velmora</b>
              <span style={{ fontSize: 11.5, color: "rgba(255,255,255,.45)" }}>Brand Dossier · 18 sections</span>
            </span>
          </div>
          {/* Skeleton lines with cite numbers */}
          {[96, 88, 52, 92, 44, 80, 36].map((w, i) => (
            <div key={i} style={{ display: "inline-block", width: `${w}%`, height: 7, borderRadius: 5, background: "rgba(255,255,255,.12)", marginBottom: 7, verticalAlign: "middle" }} />
          ))}
          {[1, 2, 3, 4].map((n) => (
            <sup key={n} style={{ fontSize: 9, fontWeight: 800, color: "var(--brand-2)", marginLeft: 4, verticalAlign: "super" }}>{n}</sup>
          ))}
          {/* Stats footer */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.08)" }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--ok)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l6 6L20 5" /></svg>
            </span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,.8)" }}><b>214</b> claims cited</span>
            <span style={{ marginLeft: "auto", fontSize: 11.5, color: "rgba(255,255,255,.38)" }}>⌀ 63 held out</span>
          </div>
        </div>
      </div>
    </div>
  );
}
