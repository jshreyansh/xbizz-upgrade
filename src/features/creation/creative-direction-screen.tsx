"use client";

import { useCreationStore } from "@/features/creation/creation-store";
import { creativeDirections } from "@/features/workspace/mock-data";

export function CreativeDirectionScreen() {
  const directionId = useCreationStore((s) => s.directionId);
  const setDirectionId = useCreationStore((s) => s.setDirectionId);
  const setStep = useCreationStore((s) => s.setStep);

  return (
    <div className="rise-in max-w-4xl mx-auto space-y-6">
      <div>
        <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--brand)", fontWeight: 800, marginBottom: 4 }}>
          Step 3 of 4 · Creative Direction
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.8px", margin: "0 0 6px" }}>
          Select Editorial Treatment &amp; Pacing
        </h2>
        <p style={{ fontSize: 14, color: "var(--ink-3)", margin: 0 }}>
          Your Creative Producer crafted 3 distinct angles grounded in the approved dossier claims.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {creativeDirections.map((dir) => {
          const isSelected = directionId === dir.id;
          return (
            <button
              key={dir.id}
              onClick={() => setDirectionId(dir.id)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "24px 20px",
                borderRadius: "var(--r-xl)",
                background: isSelected ? "var(--tint)" : "#fff",
                border: `1.5px solid ${isSelected ? "var(--brand)" : "var(--hair-2)"}`,
                textAlign: "left",
                boxShadow: isSelected ? "var(--sh-2)" : "var(--sh-1)",
                cursor: "pointer",
                position: "relative",
              }}
              className="hover:scale-[1.01] transition-transform"
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                {dir.palette.map((color, idx) => (
                  <span
                    key={idx}
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: color,
                      border: "1px solid rgba(0,0,0,.1)",
                    }}
                  />
                ))}
                <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 800, color: "var(--ink-4)", textTransform: "uppercase" }}>
                  {dir.risk} MLR Risk
                </span>
              </div>

              <div style={{ fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 800, color: "var(--brand)", marginBottom: 4 }}>
                {dir.eyebrow}
              </div>
              <b style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-.4px", marginBottom: 8 }}>
                {dir.name}
              </b>
              <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--ink-3)", lineHeight: 1.5 }}>
                {dir.summary}
              </p>

              {/* Narrative beats */}
              <div style={{ marginTop: "auto", width: "100%", borderTop: "1px solid var(--hair)", paddingTop: 12 }}>
                <span style={{ fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase", fontWeight: 750, color: "var(--ink-4)", display: "block", marginBottom: 6 }}>
                  Narrative Arc
                </span>
                <div style={{ display: "grid", gap: 4 }}>
                  {dir.structure.map((item, idx) => (
                    <div key={idx} style={{ fontSize: 11.5, color: "var(--ink-2)", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: "var(--brand)", fontWeight: 800 }}>•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={() => setStep("brief")}
          style={{
            padding: "14px 22px",
            borderRadius: "var(--r)",
            fontWeight: 700,
            fontSize: 14,
            background: "#fff",
            border: "1px solid var(--hair-2)",
            color: "var(--ink-3)",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
        <button
          onClick={() => setStep("script")}
          style={{
            flex: 1,
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
          Review Scene Script &amp; Evidence Anchors →
        </button>
      </div>
    </div>
  );
}
