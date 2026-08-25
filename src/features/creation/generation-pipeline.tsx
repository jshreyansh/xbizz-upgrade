"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Player } from "@remotion/player";
import { useCreationStore } from "@/features/creation/creation-store";
import { DermoraComposition } from "@/features/workspace/video-composition";
import { MOCK_DOSSIERS } from "@/features/dossiers/mock-dossiers";

export function GenerationPipeline() {
  const router = useRouter();
  const step = useCreationStore((s) => s.step);
  const setStep = useCreationStore((s) => s.setStep);
  const format = useCreationStore((s) => s.format);
  const duration = useCreationStore((s) => s.duration);
  const selectedDossierId = useCreationStore((s) => s.selectedDossierId);
  const dossier = MOCK_DOSSIERS.find((d) => d.id === selectedDossierId) || MOCK_DOSSIERS[0];

  const [activeChecklistIndex, setActiveChecklistIndex] = useState(0);
  const [renderProgress, setRenderProgress] = useState(0);
  const [isSentToMLR, setIsSentToMLR] = useState(false);

  const CHECKLIST = [
    { role: "Medical Writer", task: "Grounding script in approved dossier claims", doneTime: 600 },
    { role: "MLR Reviewer", task: "Verifying FDA on-screen citation anchors", doneTime: 1200 },
    { role: "Creative Producer", task: "Composing scene layouts, typography & motion", doneTime: 1800 },
    { role: "Audio Engine", task: "Synthesizing measured voiceover cadence", doneTime: 2400 },
    { role: "Project Manager", task: "Packaging regulatory audit trail package", doneTime: 3000 },
  ];

  // Generating phase
  useEffect(() => {
    if (step === "generating") {
      const interval = setInterval(() => {
        setActiveChecklistIndex((prev) => {
          if (prev >= CHECKLIST.length - 1) {
            clearInterval(interval);
            setTimeout(() => setStep("rendering"), 400);
            return CHECKLIST.length;
          }
          return prev + 1;
        });
      }, 700);
      return () => clearInterval(interval);
    }
  }, [step, setStep, CHECKLIST.length]);

  // Rendering phase
  useEffect(() => {
    if (step === "rendering") {
      const interval = setInterval(() => {
        setRenderProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStep("complete"), 500);
            return 100;
          }
          return prev + 15;
        });
      }, 350);
      return () => clearInterval(interval);
    }
  }, [step, setStep]);

  return (
    <div className="rise-in max-w-4xl mx-auto space-y-6">
      {/* ── STAGE 1: GENERATION CHECKLIST ──────────────────────────── */}
      {step === "generating" && (
        <div className="max-w-xl mx-auto text-center space-y-8 py-8">
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 20,
              background: "linear-gradient(140deg,#ff7a3d,#c9310a)",
              display: "grid",
              placeItems: "center",
              margin: "0 auto",
              boxShadow: "0 14px 34px -10px rgba(253,72,22,.8)",
              color: "#fff",
            }}
          >
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} style={{ animation: "spin 3s linear infinite" }}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>

          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.8px", margin: "0 0 6px" }}>
              Your 5 Co-Workers are Building Your Asset
            </h2>
            <p style={{ fontSize: 14.5, color: "var(--ink-3)", margin: 0 }}>
              Checking citations against {dossier.brandName} approved dossier
            </p>
          </div>

          <div style={{ background: "#fff", padding: 22, borderRadius: "var(--r-xl)", border: "1px solid var(--hair)", boxShadow: "var(--sh-1)", textAlign: "left" }} className="space-y-3">
            {CHECKLIST.map((item, idx) => {
              const isDone = idx < activeChecklistIndex;
              const isCurrent = idx === activeChecklistIndex;
              return (
                <div key={item.task} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: isDone ? "var(--ok)" : isCurrent ? "var(--brand)" : "rgba(10,13,20,.1)",
                      display: "grid",
                      placeItems: "center",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {isDone ? (
                      <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 12l6 6L20 5" />
                      </svg>
                    ) : (
                      idx + 1
                    )}
                  </span>
                  <div style={{ flex: 1 }}>
                    <b style={{ fontSize: 13, display: "block" }}>{item.role}</b>
                    <span style={{ fontSize: 12, color: isCurrent ? "var(--brand-deep)" : "var(--ink-3)" }}>
                      {item.task}
                    </span>
                  </div>
                  {isCurrent && (
                    <span style={{ fontSize: 11, color: "var(--brand)", fontWeight: 750, animation: "blink 1.5s infinite" }}>
                      Working…
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STAGE 2: RENDERING ─────────────────────────────────────── */}
      {step === "rendering" && (
        <div className="max-w-xl mx-auto text-center space-y-6 py-12">
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 20,
              background: "linear-gradient(140deg,#4f83ff,#1d4ed8)",
              display: "grid",
              placeItems: "center",
              margin: "0 auto",
              boxShadow: "0 14px 34px -10px rgba(29,78,216,.8)",
              color: "#fff",
            }}
          >
            <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M5 3l14 9-14 9z" />
            </svg>
          </div>

          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.8px", margin: "0 0 6px" }}>
              Rendering Motion Video Frames ({renderProgress}%)
            </h2>
            <p style={{ fontSize: 14.5, color: "var(--ink-3)", margin: 0 }}>
              Assembling 4k graphics, kinetic typography, and synchronized voice track
            </p>
          </div>

          <div style={{ background: "rgba(10,13,20,.08)", height: 8, borderRadius: 99, overflow: "hidden", maxWidth: 380, margin: "20px auto" }}>
            <div style={{ height: "100%", width: `${renderProgress}%`, background: "var(--blue)", borderRadius: 99, transition: "width .3s ease" }} />
          </div>
        </div>
      )}

      {/* ── STAGE 3: COMPLETE OUTPUT WITH REMOTION PLAYER ──────────── */}
      {step === "complete" && (
        <div className="space-y-6">
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 99, background: "var(--ok-bg)", color: "var(--ok)", border: "1px solid var(--ok-line)" }}>
                  ✓ Video Rendered Successfully
                </span>
                <span style={{ fontSize: 12, color: "var(--ink-4)" }}>
                  {format} · {duration} · 1080p 60fps
                </span>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.8px", margin: 0 }}>
                {dossier.brandName} — HCP Mechanism &amp; Evidence Reel
              </h1>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setIsSentToMLR(true)}
                disabled={isSentToMLR}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "11px 20px",
                  borderRadius: "var(--r)",
                  fontWeight: 700,
                  fontSize: 14,
                  background: isSentToMLR ? "var(--ok-bg)" : "linear-gradient(180deg,#ff5b2d,var(--brand))",
                  color: isSentToMLR ? "var(--ok)" : "#fff",
                  border: isSentToMLR ? "1px solid var(--ok-line)" : "none",
                  boxShadow: isSentToMLR ? "none" : "0 12px 26px -14px rgba(253,72,22,.9)",
                  cursor: isSentToMLR ? "default" : "pointer",
                }}
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 2l8 4v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6z" />
                </svg>
                {isSentToMLR ? "✓ Submitted to MLR Review Queue" : "Send to MLR Review"}
              </button>
            </div>
          </div>

          {/* Player Grid: Left Video Player + Right Evidence Trail */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>
            {/* Player Container */}
            <div style={{ background: "#000", borderRadius: "var(--r-xl)", overflow: "hidden", boxShadow: "var(--sh-3)", aspectRatio: format === "9:16" ? "9/16" : "16/9" }}>
              <Player
                component={DermoraComposition}
                durationInFrames={300}
                compositionWidth={1280}
                compositionHeight={720}
                fps={30}
                style={{ width: "100%", height: "100%" }}
                controls
                autoPlay
                loop
              />
            </div>

            {/* Right Evidence Package */}
            <div style={{ background: "#fff", borderRadius: "var(--r-xl)", border: "1px solid var(--hair)", padding: 22, boxShadow: "var(--sh-1)" }} className="space-y-4">
              <b style={{ fontSize: 14, letterSpacing: "-.3px", display: "block" }}>
                Regulatory &amp; Claims Audit Trail
              </b>

              <div className="space-y-2.5">
                {[
                  ["Regulatory Anchor", `${dossier.regulatoryAnchor} Guidance`],
                  ["Claims Checked", "4 of 4 cited on-screen"],
                  ["Prescribing Info", "Rev 04/2026 PI linked"],
                  ["Voice Cadence", "Measured (142 wpm)"],
                  ["ISI Callout", "Required lower-third included"],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, borderBottom: "1px solid var(--hair)", paddingBottom: 6 }}>
                    <span style={{ color: "var(--ink-4)" }}>{label}</span>
                    <b style={{ color: "var(--ink-2)" }}>{val}</b>
                  </div>
                ))}
              </div>

              <div style={{ background: "var(--tint)", padding: "12px 14px", borderRadius: "var(--r)", border: "1px solid var(--tint-line)", fontSize: 12, color: "var(--brand-deep)", lineHeight: 1.5 }}>
                🛡️ <b>Ready for Veeva / PromoMats</b>: All source references and timestamps are packaged for medical-legal sign-off.
              </div>

              <button
                onClick={() => router.push("/")}
                style={{ width: "100%", padding: "10px", borderRadius: "var(--r)", border: "1px solid var(--hair-2)", fontSize: 13, fontWeight: 700, background: "#fff", cursor: "pointer" }}
              >
                Return to Workspace Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
