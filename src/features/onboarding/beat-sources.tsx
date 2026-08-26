export function BeatSources() {
  const sources = [
    { initials: "FDA", bg: "linear-gradient(140deg,#4f83ff,#1d4ed8)", label: "Approved label", desc: "Indications, dosing, safety" },
    { initials: "PM", bg: "linear-gradient(140deg,#22c07a,#12784a)", label: "PubMed", desc: "Peer-reviewed literature" },
    { initials: "CT", bg: "linear-gradient(140deg,#9b6bff,#5b21b6)", label: "ClinicalTrials.gov", desc: "Registered trial results" },
  ];

  return (
    <div className="rise-in flex w-full max-w-4xl gap-16 items-center">
      {/* Left text */}
      <div style={{ flex: 1, color: "#fff" }}>
        <div style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(255,255,255,.45)", fontWeight: 700, marginBottom: 18 }}>How it works · 1 of 2</div>
        <h2 style={{ fontSize: "clamp(30px,3vw,44px)", lineHeight: 1.08, fontWeight: 800, letterSpacing: "-1.5px", margin: "0 0 16px" }}>
          We only ever start from{" "}
          <em style={{ fontStyle: "normal", background: "linear-gradient(96deg,#ffd9c7,#ff8a5c 46%,#ffcfb8)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>what is true</em>.
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.62, color: "rgba(255,255,255,.62)", margin: "0 0 22px", maxWidth: "42ch" }}>
          Before a word is written, your team reads the approved label and the published evidence. Nothing else is allowed in.
        </p>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "13px 16px", borderRadius: "var(--r)", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", fontSize: 13.5, color: "rgba(255,255,255,.8)", maxWidth: "44ch" }}>
          <span style={{ color: "var(--brand-2)", fontWeight: 800, flexShrink: 0 }}>✓</span>
          You don&apos;t upload anything to begin — we already know where to look.
        </div>
      </div>

      {/* Right: source cards + funnel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 340 }}>
          {sources.map((s) => (
            <div
              key={s.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 13,
                padding: "14px 16px",
                borderRadius: "var(--r-l)",
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.1)",
                backdropFilter: "blur(12px)",
              }}
            >
              <span style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: "grid", placeItems: "center", color: "#fff", fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{s.initials}</span>
              <span style={{ flex: 1 }}>
                <b style={{ display: "block", fontSize: 14, color: "#fff", fontWeight: 700 }}>{s.label}</b>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,.52)" }}>{s.desc}</span>
              </span>
              <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--ok)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l6 6L20 5" /></svg>
              </span>
            </div>
          ))}
        </div>
        {/* Funnel arrow */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 8, gap: 4 }}>
          <svg viewBox="0 0 220 50" style={{ width: 200, height: 50 }} fill="none">
            <path d="M28 2 C28 32 110 28 110 46" stroke="rgba(253,72,22,.4)" strokeWidth="1.5" />
            <path d="M110 2 L110 46" stroke="rgba(253,72,22,.4)" strokeWidth="1.5" />
            <path d="M192 2 C192 32 110 28 110 46" stroke="rgba(253,72,22,.4)" strokeWidth="1.5" />
          </svg>
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--brand)", boxShadow: "0 0 20px rgba(253,72,22,.8)", display: "block" }} />
        </div>
      </div>
    </div>
  );
}
