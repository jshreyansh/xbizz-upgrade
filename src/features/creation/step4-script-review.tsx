"use client";

import { useCreationStore, type MVScriptStructure, type MVLength, KEPT_OUT_CLAIMS } from "@/features/creation/creation-store";

const STRUCTURES: { id: MVScriptStructure; type: string; title: string; desc: string; flow: string[] }[] = [
  {
    id: "problem",
    type: "Team-written",
    title: "Problem → Solution",
    desc: "Open on a pain point your audience feels, then resolve it with the product.",
    flow: ["Problem", "Solution", "Proof"],
  },
  {
    id: "product",
    type: "Team-written",
    title: "Product → Proof",
    desc: "Introduce the product up front, then build the case with benefits and proof.",
    flow: ["Product", "Benefits", "Proof"],
  },
  {
    id: "custom",
    type: "Your words",
    title: "Use my own script",
    desc: "Paste your own narration — we skip AI writing and jump straight to voice and visuals.",
    flow: ["Your script", "Voice", "Visuals"],
  },
];

export function Step4ScriptReview() {
  const scriptStructure = useCreationStore((s) => s.scriptStructure);
  const setScriptStructure = useCreationStore((s) => s.setScriptStructure);
  const length = useCreationStore((s) => s.length);
  const setLength = useCreationStore((s) => s.setLength);
  const scenes = useCreationStore((s) => s.scenes);
  const setStage = useCreationStore((s) => s.setStage);

  const totalWords = scenes.reduce((acc, sc) => acc + sc.text.split(" ").length, 0);

  return (
    <div className="page-enter space-y-6">
      {/* Studio Header Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 12, borderBottom: "1px solid var(--hair)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--ok)", display: "block" }} />
          <b style={{ fontSize: 16, fontWeight: 800 }}>Magic Video Studio · Velmora</b>
          <span style={{ fontSize: 12, color: "var(--ink-4)" }}>v1.0 · FDA Target Market</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["1. Brief", "2. Script (Active)", "3. Scenes", "4. Render"].map((tab, i) => (
            <span
              key={tab}
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: 99,
                background: i === 1 ? "var(--tint)" : "rgba(10,13,20,.04)",
                color: i === 1 ? "var(--brand-deep)" : "var(--ink-4)",
                border: i === 1 ? "1px solid var(--tint-line)" : "none",
              }}
            >
              {tab}
            </span>
          ))}
        </div>
      </div>

      {/* AI Content Strategist message */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 18px",
          borderRadius: "var(--r)",
          background: "var(--amber-bg)",
          border: "1px solid var(--amber-line)",
          color: "var(--amber-text)",
          fontSize: 13.5,
        }}
      >
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#ff9a4d,#d95116)",
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontSize: 11,
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          CS
        </span>
        <span>
          I’ll draft the script; the MLR Reviewer clears each scene as it lands.
        </span>
      </div>

      {/* 2-col layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>
        {/* Left Stack */}
        <div style={{ display: "grid", gap: 16 }}>
          {/* Card 1: Script Structure */}
          <div style={{ background: "#fff", borderRadius: "var(--r-l)", border: "1px solid var(--hair)", padding: "20px 22px" }}>
            <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 12 }}>
              Script structure
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {STRUCTURES.map((st) => {
                const isSelected = scriptStructure === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => setScriptStructure(st.id)}
                    className={`transition-all duration-200 ${
                      isSelected
                        ? "opacity-100 ring-2 ring-brand shadow-sm bg-tint"
                        : "opacity-70 hover:opacity-100 hover:-translate-y-0.5 bg-white"
                    }`}
                    style={{
                      display: "block",
                      padding: "16px 14px",
                      borderRadius: "var(--r)",
                      border: `1.5px solid ${isSelected ? "var(--brand)" : "var(--hair-2)"}`,
                      textAlign: "left",
                      position: "relative",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: 10,
                        fontWeight: 800,
                        padding: "2px 8px",
                        borderRadius: 99,
                        background: isSelected ? "rgba(253,72,22,.15)" : "rgba(10,13,20,.06)",
                        color: isSelected ? "var(--brand-deep)" : "var(--ink-3)",
                        marginBottom: 8,
                      }}
                    >
                      {st.type}
                    </span>
                    <b style={{ display: "block", fontSize: 14.5, fontWeight: 780, color: isSelected ? "var(--brand-deep)" : "var(--ink)", marginBottom: 4 }}>
                      {st.title}
                    </b>
                    <span style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.45, display: "block", marginBottom: 12 }}>
                      {st.desc}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                      {st.flow.map((f, idx) => (
                        <span key={f} style={{ fontSize: 11, color: isSelected && idx === 0 ? "var(--brand)" : "var(--ink-4)", fontWeight: 700 }}>
                          {idx > 0 && "› "}
                          {f}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 2: Target Length */}
          <div style={{ background: "#fff", borderRadius: "var(--r-l)", border: "1px solid var(--hair)", padding: "16px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 2 }}>
                Target length
              </div>
              <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>Script pacing calculated at 140 words per minute</span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {["30s", "60s", "90s", "120s", "150s", "180s"].map((l) => (
                <button
                  key={l}
                  onClick={() => setLength(l as MVLength)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 99,
                    border: `1.5px solid ${length === l ? "var(--brand)" : "var(--hair-2)"}`,
                    background: length === l ? "var(--tint)" : "#fff",
                    color: length === l ? "var(--brand-deep)" : "var(--ink)",
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Card 3: Generated Script & Scenes */}
          <div style={{ background: "#fff", borderRadius: "var(--r-l)", border: "1px solid var(--hair)", padding: "22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 14, flexWrap: "wrap" }}>
              <b style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-.4px" }}>Script · {scenes.length} scenes</b>
              <span style={{ fontSize: 11.5, fontWeight: 700, background: "rgba(253,72,22,.1)", color: "var(--brand)", padding: "2px 8px", borderRadius: 99 }}>
                v1.0
              </span>
              <span style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--ink-4)" }}>
                {totalWords} words · {scenes.length} spoken scenes · Doctor / HCP
              </span>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {scenes.map((sc, i) => (
                <div
                  key={sc.id}
                  style={{
                    display: "flex",
                    gap: 14,
                    padding: "14px 16px",
                    borderRadius: "var(--r)",
                    border: "1px solid var(--hair-2)",
                    background: "#fff",
                  }}
                >
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: "var(--ink-4)", flex: "0 0 22px", marginTop: 2 }}>
                    S{i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 6px", fontSize: 13.5, color: "var(--ink)", lineHeight: 1.55 }}>
                      {sc.text}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: "var(--ink-4)" }}>
                      <span>sourced to {sc.source}</span>
                      <span style={{ padding: "2px 6px", borderRadius: 4, background: "var(--ok-bg)", color: "var(--ok)", fontWeight: 750, border: "1px solid var(--ok-line)" }}>
                        ✓ ON-LABEL
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: 11.5, color: "var(--ink-4)", fontWeight: 650, flexShrink: 0 }}>
                    {sc.duration}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Kept Out Claims (MLR Filter) */}
          <div style={{ background: "#faf9f8", borderRadius: "var(--r-l)", border: "1px solid var(--hair)", padding: "18px 20px" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
              <span
                style={{
                  padding: "6px 9px",
                  borderRadius: "var(--r)",
                  background: "var(--brand)",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 800,
                  lineHeight: 1.2,
                  textAlign: "center",
                  flexShrink: 0,
                }}
              >
                63 claims
                <br />
                kept out
              </span>
              <span style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55 }}>
                The MLR Reviewer removed these off-label / unsupported claims — they never reach the reel.
              </span>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {KEPT_OUT_CLAIMS.map((claim) => (
                <div
                  key={claim}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "var(--r)",
                    background: "#fff",
                    border: "1px solid var(--hair)",
                    fontSize: 12.5,
                    color: "var(--ink-3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{claim}</span>
                  <span style={{ fontSize: 10.5, color: "var(--ink-4)", fontStyle: "italic" }}>not selected for this reel</span>
                </div>
              ))}
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 11.5, color: "var(--ink-4)" }}>
              + 60 more held out by MLR Reviewer
            </p>
          </div>
        </div>

        {/* Right Stack: Source Card */}
        <div style={{ background: "#fff", borderRadius: "var(--r-l)", border: "1px solid var(--hair)", padding: "20px 22px", position: "sticky", top: 16 }}>
          <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 12 }}>
            What I&apos;m starting from
          </div>
          <div
            style={{
              padding: "12px",
              borderRadius: "var(--r)",
              background: "var(--amber-bg)",
              border: "1px solid var(--amber-line)",
              color: "var(--amber-text)",
              fontSize: 12.5,
              lineHeight: 1.55,
              marginBottom: 14,
            }}
          >
            I’ll draft only from <b>Velmora</b> — every line grounded in its cited claims.
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {[
              ["FDA Prescribing Info", "Section 1, 2, 6.1 verified"],
              ["CLARITY-CV Phase III", "NCT04892110 · NEJM 2025"],
              ["HEOR Budget Impact", "ICER < $50k / QALY"],
            ].map(([t, sub]) => (
              <div key={t} style={{ padding: "10px 12px", borderRadius: "var(--r)", background: "rgba(10,13,20,.03)", border: "1px solid var(--hair)" }}>
                <b style={{ display: "block", fontSize: 12.5 }}>{t}</b>
                <span style={{ fontSize: 11, color: "var(--ink-4)" }}>{sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          background: "#fff",
          borderRadius: "var(--r-l)",
          border: "1px solid var(--hair)",
          boxShadow: "var(--sh-1)",
        }}
      >
        <button
          onClick={() => setStage(3)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "10px 18px",
            borderRadius: "var(--r)",
            border: "1px solid var(--hair-2)",
            background: "#fff",
            fontSize: 13.5,
            fontWeight: 650,
            color: "var(--ink-3)",
            cursor: "pointer",
          }}
        >
          ← Back to Brief
        </button>
        <span style={{ fontSize: 13.5, color: "var(--ink-3)" }}>
          {scenes.length} scenes · {totalWords} words · 0 uncited claims
        </span>
        <button
          onClick={() => setStage(5)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            padding: "12px 24px",
            borderRadius: "var(--r)",
            fontWeight: 700,
            fontSize: 14.5,
            background: "linear-gradient(180deg,#ff5b2d,var(--brand))",
            color: "#fff",
            boxShadow: "0 12px 26px -14px rgba(253,72,22,.95),inset 0 1px 0 rgba(255,255,255,.28)",
            cursor: "pointer",
          }}
        >
          Review scenes
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
