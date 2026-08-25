"use client";

import { useCreationStore } from "@/features/creation/creation-store";

export function Step6RenderConfirm() {
  const videoMode = useCreationStore((s) => s.videoMode);
  const setVideoMode = useCreationStore((s) => s.setVideoMode);
  const mlrCitations = useCreationStore((s) => s.mlrCitations);
  const setMlrCitations = useCreationStore((s) => s.setMlrCitations);
  const mlrReferencesCard = useCreationStore((s) => s.mlrReferencesCard);
  const setMlrReferencesCard = useCreationStore((s) => s.setMlrReferencesCard);
  const mlrIsiCard = useCreationStore((s) => s.mlrIsiCard);
  const setMlrIsiCard = useCreationStore((s) => s.setMlrIsiCard);
  const setStage = useCreationStore((s) => s.setStage);

  const tokenCost = videoMode === "cinematic" ? "15,000" : "5,000";
  const balanceAfter = videoMode === "cinematic" ? "2,435,000" : "2,445,000";

  return (
    <div className="page-enter space-y-6">
      {/* Studio Header Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 12, borderBottom: "1px solid var(--hair)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--ok)", display: "block" }} />
          <b style={{ fontSize: 16, fontWeight: 800 }}>Magic Video Studio · Production Queue</b>
          <span style={{ fontSize: 12, color: "var(--ink-4)" }}>Pre-render verification</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["1. Brief", "2. Script", "3. Scenes", "4. Render (Active)"].map((tab, i) => (
            <span
              key={tab}
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: 99,
                background: i === 3 ? "var(--tint)" : "rgba(10,13,20,.04)",
                color: i === 3 ? "var(--brand-deep)" : "var(--ink-4)",
                border: i === 3 ? "1px solid var(--tint-line)" : "none",
              }}
            >
              {tab}
            </span>
          ))}
        </div>
      </div>

      {/* AI Producer message */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 18px",
          borderRadius: "var(--r)",
          background: "rgba(147,51,234,.08)",
          border: "1px solid rgba(147,51,234,.2)",
          color: "#7e22ce",
          fontSize: 13.5,
        }}
      >
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "#9333ea",
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontSize: 11,
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          PR
        </span>
        <span>
          I’ll render and assemble the reel, then ping the team when it’s done.
        </span>
      </div>

      {/* 2-col layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>
        {/* Left Stack */}
        <div style={{ display: "grid", gap: 16 }}>
          {/* Video mode */}
          <div style={{ background: "#fff", borderRadius: "var(--r-l)", border: "1px solid var(--hair)", padding: "20px 22px" }}>
            <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 12 }}>
              Video mode
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <button
                onClick={() => setVideoMode("hd")}
                style={{
                  padding: "18px 16px",
                  borderRadius: "var(--r)",
                  border: `1.5px solid ${videoMode === "hd" ? "var(--brand)" : "var(--hair-2)"}`,
                  background: videoMode === "hd" ? "var(--tint)" : "#fff",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <h3 style={{ margin: "0 0 4px", fontSize: 16.5, fontWeight: 800, color: videoMode === "hd" ? "var(--brand-deep)" : "var(--ink)" }}>HD</h3>
                <p style={{ margin: "0 0 12px", fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.5 }}>
                  Lifelike motion that stops the scroll — for launches &amp; big moments.
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "var(--brand)", background: "rgba(253,72,22,.1)", padding: "2px 7px", borderRadius: 99 }}>
                    ⚡ 5,000 tokens
                  </span>
                  <span style={{ fontSize: 11.5, color: "var(--ink-4)" }}>◷ 10–12 min</span>
                </div>
              </button>

              <button
                onClick={() => setVideoMode("cinematic")}
                style={{
                  padding: "18px 16px",
                  borderRadius: "var(--r)",
                  border: `1.5px solid ${videoMode === "cinematic" ? "var(--brand)" : "var(--hair-2)"}`,
                  background: videoMode === "cinematic" ? "var(--tint)" : "#fff",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <h3 style={{ margin: "0 0 4px", fontSize: 16.5, fontWeight: 800, color: videoMode === "cinematic" ? "var(--brand-deep)" : "var(--ink)" }}>Cinematic</h3>
                <p style={{ margin: "0 0 12px", fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.5 }}>
                  Ultra-realistic, fully generated scenes — for flagship launches.
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "var(--ink-3)", background: "rgba(10,13,20,.06)", padding: "2px 7px", borderRadius: 99 }}>
                    ⚡ 15,000 tokens
                  </span>
                  <span style={{ fontSize: 11.5, color: "var(--ink-4)" }}>◷ 16–19 min</span>
                </div>
              </button>
            </div>
          </div>

          {/* MLR recommends */}
          <div style={{ background: "#fff", borderRadius: "var(--r-l)", border: "1px solid var(--hair)", padding: "20px 22px" }}>
            <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 14 }}>
              MLR recommends
            </div>
            <div style={{ display: "grid", gap: 14 }}>
              {[
                {
                  title: "On-screen source citations",
                  desc: "A lower-third source on each of the 5 evidence scenes.",
                  val: mlrCitations,
                  set: setMlrCitations,
                },
                {
                  title: "References & disclaimer end-card",
                  desc: "A closing card listing every source + the HCP-only disclaimer.",
                  val: mlrReferencesCard,
                  set: setMlrReferencesCard,
                },
                {
                  title: "Important Safety Information (ISI) card",
                  desc: "A dedicated ISI card before the outro, as required for US promotional video.",
                  val: mlrIsiCard,
                  set: setMlrIsiCard,
                },
              ].map((item, idx) => (
                <div
                  key={item.title}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    paddingBottom: idx < 2 ? 14 : 0,
                    borderBottom: idx < 2 ? "1px solid var(--hair)" : "none",
                  }}
                >
                  <button
                    onClick={() => item.set(!item.val)}
                    style={{
                      width: 42,
                      height: 24,
                      borderRadius: 99,
                      background: item.val ? "var(--ok)" : "rgba(10,13,20,.18)",
                      position: "relative",
                      border: "none",
                      cursor: "pointer",
                      transition: "background .2s ease",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: 2,
                        left: item.val ? 20 : 2,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "#fff",
                        transition: "left .2s ease",
                        boxShadow: "0 2px 4px rgba(0,0,0,.2)",
                      }}
                    />
                  </button>
                  <div>
                    <b style={{ display: "block", fontSize: 13.5 }}>{item.title}</b>
                    <span style={{ fontSize: 12, color: "var(--ink-4)" }}>{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Token balance card */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "16px 20px",
              borderRadius: "var(--r-l)",
              background: "linear-gradient(120deg,var(--tint),#fff)",
              border: "1px solid var(--tint-line)",
            }}
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth={2}>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v10M9 10h6" />
            </svg>
            <span style={{ fontSize: 13.5, color: "var(--ink-2)" }}>
              This render costs <b>{tokenCost} tokens</b>. Balance after: <b>{balanceAfter}</b>.
            </span>
          </div>
        </div>

        {/* Right Stack */}
        <div style={{ background: "#fff", borderRadius: "var(--r-l)", border: "1px solid var(--hair)", padding: "20px 22px" }}>
          <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 12 }}>
            Production specs
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {[
              ["Aspect ratio", "9:16 (Portrait)"],
              ["Resolution", "1080 × 1920 (Full HD)"],
              ["Audio mix", "Ava (US English) · 142 wpm"],
              ["Regulatory scope", "🇺🇸 FDA OPDP compliant"],
              ["Citations locked", "5 of 5 scenes"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "5px 0", borderBottom: "1px solid var(--hair)" }}>
                <span style={{ color: "var(--ink-4)" }}>{k}</span>
                <b>{v}</b>
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
          onClick={() => setStage(5)}
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
          ← Back to Scenes
        </button>
        <span style={{ fontSize: 13.5, color: "var(--ink-3)" }}>
          HD · {tokenCost} tokens · balance after {balanceAfter}
        </span>
        <button
          onClick={() => setStage(7)}
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
          ⚡ Generate reel
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
