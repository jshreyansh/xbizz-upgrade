"use client";

import { useCreationStore } from "@/features/creation/creation-store";
import { MOCK_DOSSIERS } from "@/features/dossiers/mock-dossiers";

export function BriefFormatScreen() {
  const selectedDossierId = useCreationStore((s) => s.selectedDossierId);
  const setSelectedDossierId = useCreationStore((s) => s.setSelectedDossierId);
  const briefText = useCreationStore((s) => s.briefText);
  const setBriefText = useCreationStore((s) => s.setBriefText);
  const format = useCreationStore((s) => s.format);
  const setFormat = useCreationStore((s) => s.setFormat);
  const duration = useCreationStore((s) => s.duration);
  const setDuration = useCreationStore((s) => s.setDuration);
  const voice = useCreationStore((s) => s.voice);
  const setVoice = useCreationStore((s) => s.setVoice);
  const setStep = useCreationStore((s) => s.setStep);

  return (
    <div className="rise-in max-w-3xl mx-auto space-y-6">
      <div>
        <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--brand)", fontWeight: 800, marginBottom: 4 }}>
          Step 2 of 4 · Brief &amp; Format Specifications
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.8px", margin: "0 0 6px" }}>
          Target Audience &amp; Video Format
        </h2>
        <p style={{ fontSize: 14, color: "var(--ink-3)", margin: 0 }}>
          Configure your aspect ratio, voice talent, and source dossier.
        </p>
      </div>

      <div style={{ background: "#fff", padding: 26, borderRadius: "var(--r-xl)", border: "1px solid var(--hair)", boxShadow: "var(--sh-1)" }} className="space-y-6">
        {/* Dossier Selection */}
        <div>
          <label style={{ display: "block", fontSize: 11.5, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 8 }}>
            Brand Dossier Anchor
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {MOCK_DOSSIERS.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDossierId(d.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: "var(--r)",
                  border: `1px solid ${selectedDossierId === d.id ? "var(--brand)" : "var(--hair-2)"}`,
                  background: selectedDossierId === d.id ? "var(--tint)" : "#fff",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: d.gradient,
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  {d.initials}
                </span>
                <div>
                  <b style={{ fontSize: 13.5, display: "block" }}>{d.brandName}</b>
                  <span style={{ fontSize: 11, color: "var(--ink-4)" }}>{d.claimsCited} claims cited</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Brief */}
        <div>
          <label style={{ display: "block", fontSize: 11.5, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 8 }}>
            Creative Brief &amp; Angle
          </label>
          <textarea
            rows={3}
            value={briefText}
            onChange={(e) => setBriefText(e.target.value)}
            style={{ width: "100%", padding: "12px 14px", borderRadius: "var(--r)", border: "1px solid var(--hair-2)", fontSize: 14, lineHeight: 1.5 }}
          />
        </div>

        {/* Format & Duration grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {/* Aspect Ratio */}
          <div>
            <label style={{ display: "block", fontSize: 11.5, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 8 }}>
              Aspect Ratio
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {(["16:9", "9:16", "1:1"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setFormat(r)}
                  style={{
                    padding: "10px",
                    borderRadius: "var(--r)",
                    border: `1px solid ${format === r ? "var(--brand)" : "var(--hair-2)"}`,
                    background: format === r ? "var(--tint)" : "#fff",
                    fontWeight: 700,
                    fontSize: 13,
                    textAlign: "center",
                  }}
                >
                  {r === "16:9" ? "16:9 Landscape" : r === "9:16" ? "9:16 Mobile" : "1:1 Square"}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label style={{ display: "block", fontSize: 11.5, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 8 }}>
              Target Duration
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {(["30s", "45s", "60s", "90s"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  style={{
                    padding: "10px 0",
                    borderRadius: "var(--r)",
                    border: `1px solid ${duration === d ? "var(--brand)" : "var(--hair-2)"}`,
                    background: duration === d ? "var(--tint)" : "#fff",
                    fontWeight: 700,
                    fontSize: 13,
                    textAlign: "center",
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Voice talent */}
        <div>
          <label style={{ display: "block", fontSize: 11.5, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 8 }}>
            Narrator &amp; Voice Cadence
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              "Rohan · Clear & measured (Medical)",
              "Aria · Warm & approachable (Patient)",
            ].map((v) => (
              <button
                key={v}
                onClick={() => setVoice(v)}
                style={{
                  padding: "12px 14px",
                  borderRadius: "var(--r)",
                  border: `1px solid ${voice.startsWith(v.split(" ")[0]) ? "var(--brand)" : "var(--hair-2)"}`,
                  background: voice.startsWith(v.split(" ")[0]) ? "var(--tint)" : "#fff",
                  fontWeight: 700,
                  fontSize: 13.5,
                  textAlign: "left",
                }}
              >
                🎙️ {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => setStep("direction")}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "var(--r)",
          fontWeight: 750,
          fontSize: 14.5,
          background: "linear-gradient(180deg,#ff5b2d,var(--brand))",
          color: "#fff",
          border: "none",
          boxShadow: "0 12px 26px -14px rgba(253,72,22,.9)",
          cursor: "pointer",
        }}
      >
        Choose Creative Direction →
      </button>
    </div>
  );
}
