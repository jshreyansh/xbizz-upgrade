"use client";

import { useCreationStore, type MVAudience, type MVVoice, type MVLength } from "@/features/creation/creation-store";
import { MVHeader } from "@/features/creation/mv-header";

const AUDIENCES: { id: MVAudience; title: string; desc: string }[] = [
  { id: "hcp", title: "Doctor / HCP", desc: "Clinical detail, peer-to-peer" },
  { id: "rep", title: "Field force", desc: "30-sec pitch, objections" },
  { id: "patient", title: "Patient", desc: "Plain language, what to expect" },
  { id: "payer", title: "Payer", desc: "Budget impact and value" },
];

const VOICES: { id: MVVoice; name: string; desc: string }[] = [
  { id: "ava", name: "Ava", desc: "Warm · English (US)" },
  { id: "marcus", name: "Marcus", desc: "Authoritative · English (US)" },
  { id: "sofia", name: "Sofia", desc: "Calm · Spanish (US)" },
  { id: "hana", name: "Hana", desc: "Calm · Japanese" },
];

const LENGTHS: MVLength[] = ["30s", "60s", "90s", "120s", "180s"];

export function Step3AudienceVoice() {
  const audience = useCreationStore((s) => s.audience);
  const setAudience = useCreationStore((s) => s.setAudience);
  const voice = useCreationStore((s) => s.voice);
  const setVoice = useCreationStore((s) => s.setVoice);
  const length = useCreationStore((s) => s.length);
  const setLength = useCreationStore((s) => s.setLength);
  const formatType = useCreationStore((s) => s.formatType);
  const setStage = useCreationStore((s) => s.setStage);

  const curAud = AUDIENCES.find((a) => a.id === audience) || AUDIENCES[0];
  const curVoice = VOICES.find((v) => v.id === voice) || VOICES[0];
  const formatName = formatType === "avatar" ? "Digital Twin · MagicAvatar™" : "Short Video · MagicReel™";
  const cost = formatType === "avatar" ? "8,000 tokens" : "5,000 tokens";

  return (
    <div className="page-enter space-y-6">
      <MVHeader currentSubStep={2} />

      {/* AI Creative Producer message */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 18px",
          borderRadius: "var(--r)",
          background: "rgba(79,131,255,.08)",
          border: "1px solid rgba(79,131,255,.2)",
          color: "#1d4ed8",
          fontSize: 13.5,
        }}
      >
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#4f83ff,#1d4ed8)",
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontSize: 11,
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          CP
        </span>
        <span>
          Last step. Tell me who is watching and whose voice they hear — I will match the reading level, the pace and the proof I lead with.
        </span>
      </div>

      {/* 2-col layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>
        {/* Left Stack */}
        <div style={{ display: "grid", gap: 16 }}>
          {/* Card: Who it speaks to */}
          <div style={{ background: "#fff", borderRadius: "var(--r-l)", border: "1px solid var(--hair)", padding: "20px 22px" }}>
            <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 12 }}>
              Who it speaks to
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {AUDIENCES.map((a) => {
                const isSelected = audience === a.id;
                return (
                  <button
                    key={a.id}
                    onClick={() => setAudience(a.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 14px",
                      borderRadius: "var(--r)",
                      border: `1.5px solid ${isSelected ? "var(--brand)" : "var(--hair-2)"}`,
                      background: isSelected ? "var(--tint)" : "#fff",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <b style={{ display: "block", fontSize: 13.5, color: isSelected ? "var(--brand-deep)" : "var(--ink)" }}>{a.title}</b>
                      <span style={{ fontSize: 11.5, color: "var(--ink-3)", lineHeight: 1.4, display: "block", marginTop: 2 }}>{a.desc}</span>
                    </div>
                    <span
                      style={{
                        width: 18,
                        height: 18,
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
                        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" width={10} height={10}>
                          <path d="M4 12l6 6L20 5" />
                        </svg>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card: Whose voice */}
          <div style={{ background: "#fff", borderRadius: "var(--r-l)", border: "1px solid var(--hair)", padding: "20px 22px" }}>
            <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 12 }}>
              Whose voice
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {VOICES.map((v) => {
                const isSelected = voice === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setVoice(v.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 14px",
                      borderRadius: "var(--r)",
                      border: `1.5px solid ${isSelected ? "var(--brand)" : "var(--hair-2)"}`,
                      background: isSelected ? "var(--tint)" : "#fff",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(10,13,20,.06)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                      <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 4l14 8-14 8z" />
                      </svg>
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <b style={{ display: "block", fontSize: 13, color: isSelected ? "var(--brand-deep)" : "var(--ink)" }}>{v.name}</b>
                      <span style={{ fontSize: 11, color: "var(--ink-4)", display: "block" }}>{v.desc}</span>
                    </div>
                    <span
                      style={{
                        width: 18,
                        height: 18,
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
                        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" width={10} height={10}>
                          <path d="M4 12l6 6L20 5" />
                        </svg>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              style={{
                marginTop: 12,
                width: "100%",
                padding: "9px",
                borderRadius: "var(--r)",
                border: "1px dashed var(--hair-3)",
                background: "#fff",
                fontSize: 12.5,
                fontWeight: 650,
                color: "var(--brand)",
                cursor: "pointer",
              }}
            >
              🎙 Clone a new voice — record or upload 5–10s
            </button>
          </div>

          {/* Card: How long */}
          <div style={{ background: "#fff", borderRadius: "var(--r-l)", border: "1px solid var(--hair)", padding: "20px 22px" }}>
            <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 12 }}>
              How long
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {LENGTHS.map((l) => {
                const isSelected = length === l;
                return (
                  <button
                    key={l}
                    onClick={() => setLength(l)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 99,
                      border: `1.5px solid ${isSelected ? "var(--brand)" : "var(--hair-2)"}`,
                      background: isSelected ? "var(--tint)" : "#fff",
                      color: isSelected ? "var(--brand-deep)" : "var(--ink)",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
            <p style={{ margin: "12px 0 0", fontSize: 12.5, color: "var(--ink-4)", lineHeight: 1.55 }}>
              Sixty seconds is roughly 120 spoken words — enough for the mechanism plus one pivotal result.
            </p>
          </div>
        </div>

        {/* Right Sticky Card: What you will get */}
        <div style={{ background: "#fff", borderRadius: "var(--r-l)", border: "1px solid var(--hair)", padding: "22px", boxShadow: "var(--sh-1)", position: "sticky", top: 16 }}>
          <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 14 }}>
            What you will get
          </div>

          <div style={{ display: "grid", gap: 9 }}>
            {[
              ["Format", formatName],
              ["Source", "Velmora dossier · 214 claims"],
              ["Market", "🇺🇸 United States · FDA"],
              ["Audience", curAud.title],
              ["Voice", `${curVoice.name} · ${curVoice.desc.split(" · ")[1]}`],
              ["Length", length],
              ["Cost to render", cost],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--hair)", fontSize: 13 }}>
                <span style={{ color: "var(--ink-3)" }}>{k}</span>
                <b style={{ color: "var(--ink)", textAlign: "right" }}>{v}</b>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 16,
              padding: "12px",
              borderRadius: "var(--r)",
              background: "var(--ok-bg)",
              border: "1px solid var(--ok-line)",
              fontSize: 12.5,
              lineHeight: 1.55,
              color: "var(--ok)",
            }}
          >
            <b>Every claim cited.</b> Anything without an allow-listed source is held out before it reaches the script.
          </div>

          <p style={{ margin: "14px 0 0", fontSize: 11.5, color: "var(--ink-4)", lineHeight: 1.55 }}>
            Nothing is charged yet. You will see the full script, with every source, before a single token is spent on rendering.
          </p>
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
          onClick={() => setStage(2)}
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
          ← Previous
        </button>
        <span style={{ fontSize: 13.5, color: "var(--ink-3)" }}>
          <b>Short Video</b> · {curAud.title} · {curVoice.name} · {length} — ready to write
        </span>
        <button
          onClick={() => setStage(4)}
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
          ⚡ Write my script
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
