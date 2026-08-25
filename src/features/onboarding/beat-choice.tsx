"use client";

interface BeatChoiceProps {
  onDone: () => void;
}

export function BeatChoice({ onDone }: BeatChoiceProps) {
  return (
    <div className="rise-in flex w-full max-w-2xl flex-col items-center text-center" style={{ color: "#fff" }}>
      <div style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(255,255,255,.45)", fontWeight: 700, marginBottom: 18 }}>You&apos;re set up</div>
      <h2 style={{ fontSize: "clamp(30px,3vw,44px)", lineHeight: 1.08, fontWeight: 800, letterSpacing: "-1.5px", margin: "0 0 14px" }}>Where would you like to start, Siva?</h2>
      <p style={{ fontSize: 16, lineHeight: 1.62, color: "rgba(255,255,255,.62)", margin: "0 0 40px", maxWidth: "44ch" }}>
        Either way your team is already in the room — ask them anything as you go.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, width: "100%" }}>
        {/* Primary choice */}
        <button
          onClick={onDone}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 12,
            padding: "22px 20px",
            borderRadius: "var(--r-l)",
            background: "rgba(253,72,22,.12)",
            border: "1px solid rgba(253,72,22,.3)",
            backdropFilter: "blur(12px)",
            textAlign: "left",
            transition: ".22s var(--e)",
          }}
        >
          <span style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(140deg,#ff7a3d,#c9310a)", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}><path d="M2 4h7a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5H2z" /><path d="M22 4h-7a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2.5H22z" /></svg>
          </span>
          <div>
            <h3 style={{ margin: "0 0 7px", fontSize: 18, fontWeight: 800, letterSpacing: "-.5px", color: "#fff" }}>Build my first dossier</h3>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,.62)", lineHeight: 1.5 }}>The three minutes that make everything after it fast. We&apos;ll do the reading; you approve.</p>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--brand-2)", display: "flex", alignItems: "center", gap: 6 }}>
            Start now
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </span>
        </button>

        {/* Secondary choice */}
        <button
          onClick={onDone}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 12,
            padding: "22px 20px",
            borderRadius: "var(--r-l)",
            background: "rgba(255,255,255,.05)",
            border: "1px solid rgba(255,255,255,.11)",
            backdropFilter: "blur(12px)",
            textAlign: "left",
            transition: ".22s var(--e)",
          }}
        >
          <span style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(140deg,#4f83ff,#1d4ed8)", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}><circle cx={11} cy={11} r={7} /><path d="M20 20l-3.5-3.5" /></svg>
          </span>
          <div>
            <h3 style={{ margin: "0 0 7px", fontSize: 18, fontWeight: 800, letterSpacing: "-.5px", color: "#fff" }}>Show me around first</h3>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,.62)", lineHeight: 1.5 }}>A ninety-second walk through the three places you&apos;ll actually use. Then start whenever.</p>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#7fb3ff", display: "flex", alignItems: "center", gap: 6 }}>
            Take the tour
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </span>
        </button>
      </div>
    </div>
  );
}
