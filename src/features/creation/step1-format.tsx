"use client";

import { useCreationStore, type MVFormatType } from "@/features/creation/creation-store";
import { MVHeader } from "@/features/creation/mv-header";

interface FormatDef {
  key: MVFormatType;
  name: string;
  sys: string;
  len: string;
  aud: string;
  tok: string;
  desc: string;
  cap: string;
  kb: string;
  aspect: string;
  sky: string;
  glow: string;
}

const FORMATS: FormatDef[] = [
  {
    key: "reel",
    name: "Short Video",
    sys: "MagicReel™",
    len: "30–180s",
    aud: "HCP · Patient",
    tok: "5,000",
    desc: "A drug explainer — how the molecule works, what the evidence says, in 30 to 180 seconds. Built straight from your dossier for email, rep tablets and social.",
    cap: "“How Velmora works in heart failure”",
    kb: "Drug explainer",
    aspect: "9:16 · 16:9",
    sky: "linear-gradient(165deg,#141118,#2a1a12 52%,#4a2415)",
    glow: "radial-gradient(ellipse at center,rgba(253,72,22,.55),transparent 66%)",
  },
  {
    key: "avatar",
    name: "Digital Twin",
    sys: "MagicAvatar™",
    len: "30–90s",
    aud: "Patient · HCP",
    tok: "8,000",
    desc: "A doctor presents to camera — their face lip-synced to the script — with your explainer video playing behind them. It feels as if the physician recorded it themselves.",
    cap: "“In my practice, I start patients on…”",
    kb: "Presenter-led",
    aspect: "Lip-synced",
    sky: "linear-gradient(165deg,#0f1520,#17273d 52%,#24405f)",
    glow: "radial-gradient(ellipse at center,rgba(79,131,255,.45),transparent 66%)",
  },
];

export function Step1Format() {
  const formatType = useCreationStore((s) => s.formatType);
  const setFormatType = useCreationStore((s) => s.setFormatType);
  const setStage = useCreationStore((s) => s.setStage);

  const selectedFmt = FORMATS.find((f) => f.key === formatType) || FORMATS[0];

  return (
    <div className="page-enter space-y-6">
      <MVHeader currentSubStep={0} />

      {/* AI Strategist message */}
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
          Two formats, both ready to make right now. If you are not sure, take the <b>Short Video</b> — it is what most brands start with.
        </span>
      </div>

      <div>
        <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 12 }}>
          Choose a format
        </div>

        {/* 2 Format Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {FORMATS.map((f) => {
            const isSelected = formatType === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFormatType(f.key)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  background: "#fff",
                  borderRadius: "var(--r-l)",
                  border: `1.5px solid ${isSelected ? "var(--brand)" : "var(--hair)"}`,
                  boxShadow: isSelected ? "0 0 0 4px rgba(253,72,22,.1), var(--sh-2)" : "var(--sh-1)",
                  overflow: "hidden",
                  transition: "all .2s ease",
                  cursor: "pointer",
                }}
              >
                {/* Preview top */}
                <div style={{ position: "relative", height: 200, background: "#0f1116", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, background: f.sky }} />
                  <div
                    style={{
                      position: "absolute",
                      width: "150%",
                      height: "80%",
                      left: "-25%",
                      top: "-24%",
                      borderRadius: "50%",
                      background: f.glow,
                      filter: "blur(26px)",
                      opacity: 0.6,
                    }}
                  />
                  {/* Category badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: ".1em",
                      textTransform: "uppercase",
                      color: "#fff",
                      background: "rgba(8,10,16,.5)",
                      backdropFilter: "blur(8px)",
                      padding: "5px 10px",
                      borderRadius: 7,
                    }}
                  >
                    <i style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--brand)", display: "block" }} />
                    {f.kb}
                  </div>
                  {/* Right tag */}
                  <div
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      fontSize: 10,
                      fontWeight: 800,
                      background: "rgba(255,255,255,.9)",
                      color: "#0d1017",
                      padding: "5px 10px",
                      borderRadius: 7,
                    }}
                  >
                    {f.aspect}
                  </div>
                  {/* Center play icon */}
                  <div
                    style={{
                      position: "absolute",
                      top: "45%",
                      left: "50%",
                      transform: "translate(-50%,-50%)",
                      width: 50,
                      height: 50,
                      borderRadius: "50%",
                      background: "var(--brand)",
                      display: "grid",
                      placeItems: "center",
                      boxShadow: "0 10px 24px rgba(253,72,22,.6)",
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="#fff" width={16} height={16}>
                      <path d="M6 4l14 8-14 8z" />
                    </svg>
                  </div>
                  {/* Sample caption */}
                  <div
                    style={{
                      position: "absolute",
                      left: 14,
                      right: 14,
                      bottom: 34,
                      color: "#fff",
                      fontSize: 13.5,
                      fontWeight: 650,
                      textShadow: "0 2px 12px rgba(0,0,0,.6)",
                    }}
                  >
                    {f.cap}
                  </div>
                  {/* Scrub bar */}
                  <div
                    style={{
                      position: "absolute",
                      left: 14,
                      right: 14,
                      bottom: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      color: "rgba(255,255,255,.85)",
                      fontSize: 10.5,
                      fontWeight: 600,
                    }}
                  >
                    0:22
                    <div style={{ flex: 1, height: 3, borderRadius: 9, background: "rgba(255,255,255,.28)", position: "relative" }}>
                      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "36%", background: "var(--brand)", borderRadius: 9 }} />
                    </div>
                    1:00
                  </div>
                </div>

                {/* Body bottom */}
                <div style={{ padding: "18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: isSelected ? "var(--tint)" : "rgba(10,13,20,.05)",
                        color: isSelected ? "var(--brand)" : "var(--ink-2)",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      {f.key === "avatar" ? (
                        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <circle cx="12" cy="8" r="3.6" />
                          <path d="M5 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5" />
                        </svg>
                      ) : (
                        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <rect x="2" y="6" width="14" height="12" rx="2.5" />
                          <path d="M16 10l6-3v10l-6-3z" />
                        </svg>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 800, letterSpacing: "-.4px" }}>{f.name}</h3>
                        {f.key === "reel" && (
                          <span
                            style={{
                              fontSize: 10.5,
                              fontWeight: 750,
                              background: "rgba(253,72,22,.1)",
                              color: "var(--brand)",
                              padding: "2px 7px",
                              borderRadius: 99,
                            }}
                          >
                            Start here
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 12, color: "var(--brand)", fontWeight: 700 }}>{f.sys}</span>
                    </div>
                    {/* Radio indicator */}
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        border: `1.5px solid ${isSelected ? "var(--brand)" : "var(--hair-3)"}`,
                        background: isSelected ? "var(--brand)" : "transparent",
                        display: "grid",
                        placeItems: "center",
                        color: "#fff",
                        flexShrink: 0,
                      }}
                    >
                      {isSelected && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" width={11} height={11}>
                          <path d="M4 12l6 6L20 5" />
                        </svg>
                      )}
                    </span>
                  </div>

                  <p style={{ margin: "12px 0 0", fontSize: 13, color: "var(--ink-3)", lineHeight: 1.55 }}>{f.desc}</p>

                  <div style={{ display: "flex", gap: 24, marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--hair)" }}>
                    <div>
                      <span style={{ display: "block", fontSize: 9.5, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-4)", fontWeight: 800 }}>Length</span>
                      <b style={{ fontSize: 13, fontWeight: 700 }}>{f.len}</b>
                    </div>
                    <div>
                      <span style={{ display: "block", fontSize: 9.5, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-4)", fontWeight: 800 }}>For</span>
                      <b style={{ fontSize: 13, fontWeight: 700 }}>{f.aud}</b>
                    </div>
                    <div>
                      <span style={{ display: "block", fontSize: 9.5, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-4)", fontWeight: 800 }}>Cost</span>
                      <b style={{ fontSize: 13, fontWeight: 700 }}>{f.tok} tokens</b>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Explainer detail */}
      <div style={{ background: "#fff", border: "1px solid var(--hair)", borderRadius: "var(--r)", padding: "16px 18px", fontSize: 13, color: "var(--ink-3)", lineHeight: 1.6 }}>
        <b style={{ color: "var(--ink)" }}>Not sure which one to pick?</b> Short Video is the workhorse — it explains the drug itself and works everywhere: email, a rep&apos;s tablet, congress screens, social. Digital Twin is for when the message lands better coming from a person: a KOL, an advisor, or a physician talking to patients. You can make the same script as both later, so this is not a one-way door.
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
        <span style={{ fontSize: 13.5, color: "var(--ink-3)" }}>
          <b>{selectedFmt.name}</b> selected · {selectedFmt.tok} tokens · you can change this later
        </span>
        <button
          onClick={() => setStage(2)}
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
          Next: pick your Brand Dossier
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
