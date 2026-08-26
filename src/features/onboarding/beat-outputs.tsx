export function BeatOutputs() {
  const outputs = [
    { label: "Video", pos: { top: "8%", left: "6%" }, isVideo: true },
    { label: "Journal ad", pos: { top: "8%", right: "6%" } },
    { label: "Email", pos: { bottom: "8%", left: "6%" } },
    { label: "Leave-behind", pos: { bottom: "8%", right: "6%" } },
  ];

  return (
    <div className="rise-in flex w-full max-w-4xl gap-16 items-center">
      <div style={{ flex: 1, color: "#fff" }}>
        <div style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(255,255,255,.45)", fontWeight: 700, marginBottom: 18 }}>How it works · 2 of 2</div>
        <h2 style={{ fontSize: "clamp(30px,3vw,44px)", lineHeight: 1.08, fontWeight: 800, letterSpacing: "-1.5px", margin: "0 0 16px" }}>
          Then it becomes{" "}
          <em style={{ fontStyle: "normal", background: "linear-gradient(96deg,#ffd9c7,#ff8a5c 46%,#ffcfb8)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>everything else</em>.
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.62, color: "rgba(255,255,255,.62)", margin: "0 0 22px", maxWidth: "42ch" }}>
          A video, a journal ad, an email, a leave-behind — each one written from that same record, for the market it ships to. You approve; you don&apos;t start over.
        </p>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "13px 16px", borderRadius: "var(--r)", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", fontSize: 13.5, color: "rgba(255,255,255,.8)", maxWidth: "44ch" }}>
          <span style={{ color: "var(--brand-2)", fontWeight: 800, flexShrink: 0 }}>✓</span>
          One dossier, thirty-two formats, forty markets.
        </div>
      </div>

      {/* Hub & spoke diagram */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <div style={{ position: "relative", width: 320, height: 280 }}>
          {/* SVG wires */}
          <svg viewBox="0 0 320 280" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} fill="none">
            <path d="M160 140 C120 120 90 90 60 60" stroke="rgba(253,72,22,.35)" strokeWidth="1.5" />
            <path d="M160 140 C200 120 230 90 262 60" stroke="rgba(253,72,22,.35)" strokeWidth="1.5" />
            <path d="M160 140 C120 166 90 200 62 228" stroke="rgba(253,72,22,.35)" strokeWidth="1.5" />
            <path d="M160 140 C200 166 230 200 258 230" stroke="rgba(253,72,22,.35)" strokeWidth="1.5" />
          </svg>
          {/* Hub dossier icon */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 52, height: 52, borderRadius: 14, background: "var(--brand)", display: "grid", placeItems: "center", boxShadow: "0 10px 30px -10px rgba(253,72,22,.9)" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}><path d="M2 4h7a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5H2z" /><path d="M22 4h-7a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2.5H22z" /></svg>
          </div>
          {/* Output nodes */}
          {outputs.map((o) => (
            <div
              key={o.label}
              style={{
                position: "absolute",
                ...o.pos,
                padding: "8px 14px",
                borderRadius: "var(--r)",
                background: "rgba(255,255,255,.07)",
                border: "1px solid rgba(255,255,255,.12)",
                backdropFilter: "blur(12px)",
                fontSize: 12,
                fontWeight: 700,
                color: "rgba(255,255,255,.85)",
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              {o.isVideo && (
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(255,255,255,.9)", display: "grid", placeItems: "center" }}>
                  <svg width={8} height={8} viewBox="0 0 24 24" fill="#0d1017"><path d="M6 4l14 8-14 8z" /></svg>
                </span>
              )}
              {o.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
