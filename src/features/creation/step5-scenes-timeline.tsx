"use client";

import { useCreationStore } from "@/features/creation/creation-store";

export function Step5ScenesTimeline() {
  const scenes = useCreationStore((s) => s.scenes);
  const activeSceneIndex = useCreationStore((s) => s.activeSceneIndex);
  const setActiveSceneIndex = useCreationStore((s) => s.setActiveSceneIndex);
  const updateScene = useCreationStore((s) => s.updateScene);
  const setStage = useCreationStore((s) => s.setStage);

  const curScene = scenes[activeSceneIndex] || scenes[0];

  return (
    <div className="page-enter space-y-6">
      {/* Studio Header Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 12, borderBottom: "1px solid var(--hair)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--ok)", display: "block" }} />
          <b style={{ fontSize: 16, fontWeight: 800 }}>Magic Video Studio · Scene Director</b>
          <span style={{ fontSize: 12, color: "var(--ink-4)" }}>Scene {activeSceneIndex + 1} of {scenes.length}</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["1. Brief", "2. Script", "3. Scenes (Active)", "4. Render"].map((tab, i) => (
            <span
              key={tab}
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: 99,
                background: i === 2 ? "var(--tint)" : "rgba(10,13,20,.04)",
                color: i === 2 ? "var(--brand-deep)" : "var(--ink-4)",
                border: i === 2 ? "1px solid var(--tint-line)" : "none",
              }}
            >
              {tab}
            </span>
          ))}
        </div>
      </div>

      {/* Main Glass Card with 2 Columns */}
      <div style={{ background: "#fff", borderRadius: "var(--r-l)", border: "1px solid var(--hair)", overflow: "hidden", boxShadow: "var(--sh-1)" }}>
        {/* Top tab row */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "0 22px", borderBottom: "1px solid var(--hair)", height: 48 }}>
          <button style={{ borderBottom: "2px solid var(--brand)", color: "var(--brand)", fontWeight: 750, fontSize: 13, height: "100%", padding: "0 4px" }}>
            Visual Director
          </button>
          <button style={{ color: "var(--ink-3)", fontWeight: 650, fontSize: 13, height: "100%", padding: "0 4px" }}>
            Narration &amp; Overlays
          </button>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--ink-4)" }}>
            {scenes.length} scenes · 142 wpm cadence
          </span>
        </div>

        {/* Editor Body */}
        <div style={{ display: "flex", gap: 24, padding: "22px", flexWrap: "wrap" }}>
          {/* Left: Phone Preview Mockup */}
          <div style={{ flex: "0 0 240px" }}>
            <div
              style={{
                position: "relative",
                aspectRatio: "9/16",
                borderRadius: "var(--r-l)",
                background: "linear-gradient(160deg,#141118 0%,#2a1a12 50%,#4a2415 100%)",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                color: "#fff",
                boxShadow: "var(--sh-3)",
                overflow: "hidden",
              }}
            >
              {/* Corner logo */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <span style={{ padding: "4px 8px", borderRadius: 6, background: "rgba(255,255,255,.9)", color: "#243b6b", fontSize: 8, fontWeight: 800, lineHeight: 1.2 }}>
                  Meridian<br />Tx
                </span>
              </div>

              {/* Center scene overlay card */}
              <div style={{ textAlign: "center", padding: "0 8px" }}>
                <h4 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 800 }}>Velmora</h4>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.8)", lineHeight: 1.35, background: "rgba(0,0,0,.55)", padding: "8px 10px", borderRadius: 8, backdropFilter: "blur(6px)" }}>
                  {curScene.overlayText}
                </div>
              </div>

              {/* Lower third citation & controls */}
              <div>
                <div style={{ fontSize: 8.5, color: "rgba(255,255,255,.65)", background: "rgba(0,0,0,.6)", padding: "4px 8px", borderRadius: 6, marginBottom: 8 }}>
                  {curScene.source}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "rgba(255,255,255,.8)" }}>
                  ▶ <span style={{ flex: 1, height: 2, background: "rgba(255,255,255,.3)", position: "relative" }}><i style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "40%", background: "var(--brand)" }} /></span> 0:04 / {curScene.duration}
                </div>
              </div>
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 11.5, color: "var(--ink-4)", textAlign: "center", lineHeight: 1.45 }}>
              Scene visuals are generated on render — this preview shows timing, cards, and on-screen text.
            </p>
          </div>

          {/* Right: Scene Prompt & Settings */}
          <div style={{ flex: 1, minWidth: 320, display: "grid", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <b style={{ fontSize: 16, fontWeight: 800 }}>Scene {activeSceneIndex + 1}</b>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setActiveSceneIndex(Math.max(0, activeSceneIndex - 1))}
                  disabled={activeSceneIndex === 0}
                  style={{ fontSize: 12.5, color: activeSceneIndex === 0 ? "var(--ink-4)" : "var(--brand)", fontWeight: 700, cursor: "pointer" }}
                >
                  ◀ Prev scene
                </button>
                <span style={{ color: "var(--hair-3)" }}>·</span>
                <button
                  onClick={() => setActiveSceneIndex(Math.min(scenes.length - 1, activeSceneIndex + 1))}
                  disabled={activeSceneIndex === scenes.length - 1}
                  style={{ fontSize: 12.5, color: activeSceneIndex === scenes.length - 1 ? "var(--ink-4)" : "var(--brand)", fontWeight: 700, cursor: "pointer" }}
                >
                  Next scene ▶
                </button>
              </div>
            </div>

            {/* Narration */}
            <div>
              <label style={{ display: "block", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 6 }}>
                🎙 Narration
              </label>
              <textarea
                value={curScene.text}
                onChange={(e) => updateScene(activeSceneIndex, { text: e.target.value })}
                rows={2}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "var(--r)", border: "1px solid var(--hair-2)", fontSize: 13.5, outline: "none" }}
              />
            </div>

            {/* Visual Prompt */}
            <div>
              <label style={{ display: "block", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 6 }}>
                🖼 Visual prompt
              </label>
              <textarea
                value={curScene.visualPrompt}
                onChange={(e) => updateScene(activeSceneIndex, { visualPrompt: e.target.value })}
                rows={3}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "var(--r)", border: "1px solid var(--hair-2)", fontSize: 13, background: "rgba(10,13,20,.02)", outline: "none" }}
              />
            </div>

            {/* Negative Prompt */}
            <div>
              <label style={{ display: "block", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 6 }}>
                🚫 Negative prompt
              </label>
              <textarea
                value={curScene.negativePrompt}
                onChange={(e) => updateScene(activeSceneIndex, { negativePrompt: e.target.value })}
                rows={2}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "var(--r)", border: "1px solid var(--hair-2)", fontSize: 12, color: "var(--ink-3)", outline: "none" }}
              />
            </div>

            {/* On-screen text */}
            <div>
              <label style={{ display: "block", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 6 }}>
                T On-screen text (burned overlay)
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  value={curScene.overlayText}
                  onChange={(e) => updateScene(activeSceneIndex, { overlayText: e.target.value })}
                  style={{ flex: 1, padding: "9px 12px", borderRadius: "var(--r)", border: "1px solid var(--hair-2)", fontSize: 13 }}
                />
                <select
                  value={curScene.overlayType}
                  onChange={(e) => updateScene(activeSceneIndex, { overlayType: e.target.value })}
                  style={{ width: 220, padding: "9px 12px", borderRadius: "var(--r)", border: "1px solid var(--hair-2)", fontSize: 12.5 }}
                >
                  <option>Key term — middle, dark box</option>
                  <option>Lower third — light</option>
                  <option>Title card — centre</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline block */}
        <div style={{ padding: "18px 22px", borderTop: "1px solid var(--hair)", background: "#faf9f8" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)" }}>
              Timeline
            </span>
            <span style={{ fontSize: 11.5, color: "var(--ink-4)" }}>Click any scene block to inspect</span>
          </div>
          <div style={{ display: "flex", gap: 6, height: 44 }}>
            <div style={{ flex: "0 0 54px", background: "rgba(10,13,20,.08)", borderRadius: 6, display: "grid", placeItems: "center", fontSize: 10, fontWeight: 800, color: "var(--ink-3)" }}>
              INTRO
            </div>
            {scenes.map((sc, i) => (
              <button
                key={sc.id}
                onClick={() => setActiveSceneIndex(i)}
                style={{
                  flex: parseFloat(sc.duration),
                  background: activeSceneIndex === i ? "var(--brand)" : "#fff",
                  color: activeSceneIndex === i ? "#fff" : "var(--ink)",
                  border: `1.5px solid ${activeSceneIndex === i ? "var(--brand)" : "var(--hair-2)"}`,
                  borderRadius: 6,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 750,
                }}
              >
                <span>S{i + 1}</span>
                <span style={{ fontSize: 9.5, opacity: 0.8 }}>{sc.duration}</span>
              </button>
            ))}
            <div style={{ flex: "0 0 54px", background: "rgba(10,13,20,.08)", borderRadius: 6, display: "grid", placeItems: "center", fontSize: 10, fontWeight: 800, color: "var(--ink-3)" }}>
              ISI
            </div>
            <div style={{ flex: "0 0 54px", background: "rgba(10,13,20,.08)", borderRadius: 6, display: "grid", placeItems: "center", fontSize: 10, fontWeight: 800, color: "var(--ink-3)" }}>
              OUTRO
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderRadius: "var(--r)", background: "rgba(79,131,255,.08)", border: "1px solid rgba(79,131,255,.2)", color: "#1d4ed8", fontSize: 13 }}>
          <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#1d4ed8", color: "#fff", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 800, flexShrink: 0 }}>CP</span>
          <span>I’ve directed each scene to read photoreal and clinical, with a negative prompt that blocks cartoon/CGI looks.</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderRadius: "var(--r)", background: "var(--ok-bg)", border: "1px solid var(--ok-line)", color: "var(--ok)", fontSize: 13 }}>
          <span style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--ok)", color: "#fff", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 800, flexShrink: 0 }}>MLR</span>
          <span>Every scene maps to a verified, on-label claim — and the ISI card is locked in before the outro.</span>
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
          onClick={() => setStage(4)}
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
          ← Back to Script
        </button>
        <span style={{ fontSize: 13.5, color: "var(--ink-3)" }}>
          {scenes.length} scenes · every one mapped to a cited claim
        </span>
        <button
          onClick={() => setStage(6)}
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
          Continue to generate
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
