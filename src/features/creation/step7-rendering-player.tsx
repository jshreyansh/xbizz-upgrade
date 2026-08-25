"use client";

import { useState, useEffect } from "react";
import { Player } from "@remotion/player";
import { DermoraComposition } from "@/features/workspace/video-composition";
import { useCreationStore } from "@/features/creation/creation-store";

export function Step7RenderingPlayer() {
  const [progress, setProgress] = useState(12);
  const [isRenderComplete, setIsRenderComplete] = useState(false);
  const [mlrSubmitted, setMlrSubmitted] = useState(false);
  const reset = useCreationStore((s) => s.reset);

  useEffect(() => {
    if (!isRenderComplete) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsRenderComplete(true);
            return 100;
          }
          return prev + 18;
        });
      }, 450);
      return () => clearInterval(interval);
    }
  }, [isRenderComplete]);

  return (
    <div className="page-enter space-y-6">
      {/* ── RENDERING STATE (p-reel-6) ── */}
      {!isRenderComplete ? (
        <div style={{ maxWidth: 640, margin: "40px auto", textAlign: "center" }}>
          {/* Progress Ring Hero */}
          <div
            style={{
              background: "#fff",
              borderRadius: "var(--r-xl)",
              border: "1px solid var(--hair)",
              padding: "48px 36px",
              boxShadow: "var(--sh-2)",
            }}
          >
            {/* Animated Ring */}
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: `conic-gradient(var(--brand) ${progress * 3.6}deg, rgba(10,13,20,.08) 0deg)`,
                display: "grid",
                placeItems: "center",
                margin: "0 auto 24px",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  background: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 22,
                  fontWeight: 800,
                  color: "var(--brand-deep)",
                }}
              >
                {progress}%
              </div>
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.6px", margin: "0 0 8px" }}>
              Your Creative Producer is crafting your reel…
            </h2>
            <p style={{ margin: "0 0 24px", fontSize: 13.5, color: "var(--ink-3)" }}>
              Velmora dossier · HD · 60s · Ava (English US) · FDA anchor
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 18px",
                borderRadius: "var(--r)",
                background: "rgba(10,13,20,.03)",
                border: "1px solid var(--hair)",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: 20 }}>⏳</span>
              <div>
                <b style={{ display: "block", fontSize: 13.5 }}>Synthesizing molecular kinetics &amp; on-screen citations…</b>
                <span style={{ fontSize: 12, color: "var(--ink-4)" }}>Assembling 5 scenes with zero hallucinated claims.</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── COMPLETE PLAYER STATE (p-reel-7) ── */
        <div style={{ maxWidth: 940, margin: "0 auto", display: "grid", gap: 20 }}>
          {/* Header success */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 800, background: "var(--ok-bg)", color: "var(--ok)", padding: "3px 8px", borderRadius: 99, border: "1px solid var(--ok-line)" }}>
                  ✓ Render Complete
                </span>
                <span style={{ fontSize: 12, color: "var(--ink-4)" }}>Generated in 8.4s</span>
              </div>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-.6px" }}>
                Velmora: Mechanism &amp; Phase III Readout
              </h2>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setMlrSubmitted(true)}
                disabled={mlrSubmitted}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 18px",
                  borderRadius: "var(--r)",
                  background: mlrSubmitted ? "var(--ok-bg)" : "linear-gradient(180deg,#ff5b2d,var(--brand))",
                  color: mlrSubmitted ? "var(--ok)" : "#fff",
                  border: mlrSubmitted ? "1px solid var(--ok-line)" : "none",
                  fontWeight: 700,
                  fontSize: 13.5,
                  cursor: mlrSubmitted ? "default" : "pointer",
                }}
              >
                {mlrSubmitted ? "✓ Submitted to Veeva MLR" : "Submit for MLR Approval"}
              </button>
              <button
                onClick={reset}
                style={{
                  padding: "10px 16px",
                  borderRadius: "var(--r)",
                  background: "#fff",
                  border: "1px solid var(--hair-2)",
                  fontSize: 13.5,
                  fontWeight: 650,
                  cursor: "pointer",
                }}
              >
                ＋ Create Another
              </button>
            </div>
          </div>

          {/* 2-col Player + Audit Breakdown */}
          <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 24, alignItems: "start" }}>
            {/* Left: Remotion Player */}
            <div
              style={{
                borderRadius: "var(--r-xl)",
                overflow: "hidden",
                boxShadow: "var(--sh-3)",
                background: "#000",
                aspectRatio: "9/16",
              }}
            >
              <Player
                component={DermoraComposition}
                durationInFrames={180}
                compositionWidth={1080}
                compositionHeight={1920}
                fps={30}
                style={{ width: "100%", height: "100%" }}
                controls
                autoPlay
                loop
              />
            </div>

            {/* Right: Compliance & Audit Trail */}
            <div style={{ display: "grid", gap: 16 }}>
              {/* Claims Audit Card */}
              <div style={{ background: "#fff", borderRadius: "var(--r-l)", border: "1px solid var(--hair)", padding: "22px", boxShadow: "var(--sh-1)" }}>
                <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 12 }}>
                  Regulatory Verification &amp; Audit Trail
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                  {[
                    ["Anchor Molecule", "Velmora (tirzelamide) 100mg"],
                    ["Regulatory Guidance", "FDA OPDP Promotional Guidance (21 CFR 202.1)"],
                    ["On-screen Citations", "5 scenes cited with Drugs@FDA label links"],
                    ["Disclaimers & ISI", "Important Safety Info end-card included"],
                    ["Uncited Claims", "0 (63 held out by MLR engine)"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "7px 0", borderBottom: "1px solid var(--hair)" }}>
                      <span style={{ color: "var(--ink-3)" }}>{k}</span>
                      <b style={{ color: "var(--ink)", textAlign: "right" }}>{v}</b>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export actions card */}
              <div style={{ background: "#fff", borderRadius: "var(--r-l)", border: "1px solid var(--hair)", padding: "20px 22px" }}>
                <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 12 }}>
                  Export Assets
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <button style={{ padding: "10px", borderRadius: "var(--r)", border: "1px solid var(--hair-2)", background: "#fff", fontSize: 13, fontWeight: 650, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                    📥 Download MP4 (1080p)
                  </button>
                  <button style={{ padding: "10px", borderRadius: "var(--r)", border: "1px solid var(--hair-2)", background: "#fff", fontSize: 13, fontWeight: 650, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                    📑 Export Claims PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
