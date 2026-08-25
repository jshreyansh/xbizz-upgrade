"use client";

import { useCreationStore } from "@/features/creation/creation-store";

export function SceneScriptScreen() {
  const scenes = useCreationStore((s) => s.scenes);
  const setScenes = useCreationStore((s) => s.setScenes);
  const setStep = useCreationStore((s) => s.setStep);

  const handleUpdateNarration = (index: number, text: string) => {
    const updated = [...scenes];
    updated[index] = { ...updated[index], narration: text };
    setScenes(updated);
  };

  return (
    <div className="rise-in max-w-4xl mx-auto space-y-6">
      <div>
        <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--brand)", fontWeight: 800, marginBottom: 4 }}>
          Step 4 of 4 · Scene Script &amp; Evidence Grounding
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.8px", margin: "0 0 6px" }}>
          Scene-by-Scene Script &amp; Visual Prompts
        </h2>
        <p style={{ fontSize: 14, color: "var(--ink-3)", margin: 0 }}>
          Every sentence is anchored in an allow-listed claim from your dossier.
        </p>
      </div>

      {/* Scenes List */}
      <div className="space-y-4">
        {scenes.map((scene, idx) => (
          <div
            key={scene.id}
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: "var(--r-xl)",
              border: "1px solid var(--hair)",
              boxShadow: "var(--sh-1)",
            }}
            className="space-y-4"
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--hair)", paddingBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "var(--ink)",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  {scene.number}
                </span>
                <b style={{ fontSize: 15, fontWeight: 800 }}>{scene.title}</b>
                <span style={{ fontSize: 11, color: "var(--ink-4)", fontWeight: 650 }}>
                  ⏱️ {scene.duration}s
                </span>
              </div>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 800,
                  padding: "2px 8px",
                  borderRadius: 99,
                  background: "var(--ok-bg)",
                  color: "var(--ok)",
                  border: "1px solid var(--ok-line)",
                }}
              >
                ✓ Claim Anchored
              </span>
            </div>

            {/* Narration */}
            <div>
              <label style={{ display: "block", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 6 }}>
                Narration Voiceover
              </label>
              <textarea
                rows={2}
                value={scene.narration}
                onChange={(e) => handleUpdateNarration(idx, e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "var(--r)",
                  border: "1px solid var(--hair-2)",
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              />
            </div>

            {/* Visual description & Claim */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ background: "var(--canvas)", padding: "12px 14px", borderRadius: "var(--r)", border: "1px solid var(--hair)" }}>
                <span style={{ fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", display: "block", marginBottom: 4 }}>
                  🎨 Visual Scene Prompt
                </span>
                <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.5 }}>
                  {scene.visual}
                </p>
              </div>
              <div style={{ background: "var(--tint-2)", padding: "12px 14px", borderRadius: "var(--r)", border: "1px solid var(--tint-line)" }}>
                <span style={{ fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 800, color: "var(--brand-deep)", display: "block", marginBottom: 4 }}>
                  📜 Approved Dossier Claim
                </span>
                <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.5 }}>
                  {scene.claim}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={() => setStep("direction")}
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
          onClick={() => setStep("generating")}
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
          ⚡ Generate &amp; Render Magic Video (5,000 tokens) →
        </button>
      </div>
    </div>
  );
}
