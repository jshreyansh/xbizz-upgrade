"use client";

import { useCreationStore, type CreationIntent } from "@/features/creation/creation-store";

export function IntentScreen() {
  const setIntent = useCreationStore((s) => s.setIntent);
  const setStep = useCreationStore((s) => s.setStep);

  const handleSelect = (intent: CreationIntent) => {
    setIntent(intent);
    setStep("brief");
  };

  return (
    <div className="rise-in max-w-3xl mx-auto space-y-8 py-4">
      <div className="text-center">
        <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--brand)", fontWeight: 800, marginBottom: 6 }}>
          Magic Video Engine
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-1px", margin: "0 0 8px" }}>
          How would you like to start?
        </h1>
        <p style={{ fontSize: 14.5, color: "var(--ink-3)", margin: 0 }}>
          Pick the starting point that matches what you have ready today.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {/* Card 1: Dossier */}
        <button
          onClick={() => handleSelect("dossier")}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            padding: "24px 20px",
            borderRadius: "var(--r-xl)",
            background: "var(--tint)",
            border: "1.5px solid var(--brand)",
            textAlign: "left",
            boxShadow: "var(--sh-2)",
            position: "relative",
            cursor: "pointer",
          }}
          className="hover:scale-[1.02] transition-transform"
        >
          <span
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              fontSize: 9.5,
              fontWeight: 800,
              padding: "2px 7px",
              borderRadius: 99,
              background: "var(--brand)",
              color: "#fff",
              textTransform: "uppercase",
              letterSpacing: ".06em",
            }}
          >
            Recommended
          </span>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "linear-gradient(140deg,#ff7a3d,#c9310a)",
              display: "grid",
              placeItems: "center",
              marginBottom: 16,
              color: "#fff",
            }}
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M2 4h7a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5H2z" />
              <path d="M22 4h-7a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2.5H22z" />
            </svg>
          </div>
          <b style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>From a Brand Dossier</b>
          <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.5 }}>
            Ground every line in an existing approved dossier with pre-cited claims.
          </p>
          <span style={{ marginTop: 16, fontSize: 12.5, fontWeight: 700, color: "var(--brand)" }}>
            Select dossier →
          </span>
        </button>

        {/* Card 2: Brief */}
        <button
          onClick={() => handleSelect("brief")}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            padding: "24px 20px",
            borderRadius: "var(--r-xl)",
            background: "#fff",
            border: "1px solid var(--hair-2)",
            textAlign: "left",
            boxShadow: "var(--sh-1)",
            cursor: "pointer",
          }}
          className="hover:scale-[1.02] transition-transform"
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "linear-gradient(140deg,#4f83ff,#1d4ed8)",
              display: "grid",
              placeItems: "center",
              marginBottom: 16,
              color: "#fff",
            }}
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
            </svg>
          </div>
          <b style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>I have a custom brief</b>
          <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.5 }}>
            Paste a product brief or campaign outline and let SwishX match sources.
          </p>
          <span style={{ marginTop: 16, fontSize: 12.5, fontWeight: 700, color: "var(--blue)" }}>
            Paste brief →
          </span>
        </button>

        {/* Card 3: Scratch */}
        <button
          onClick={() => handleSelect("scratch")}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            padding: "24px 20px",
            borderRadius: "var(--r-xl)",
            background: "#fff",
            border: "1px solid var(--hair-2)",
            textAlign: "left",
            boxShadow: "var(--sh-1)",
            cursor: "pointer",
          }}
          className="hover:scale-[1.02] transition-transform"
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "linear-gradient(140deg,#9b6bff,#5b21b6)",
              display: "grid",
              placeItems: "center",
              marginBottom: 16,
              color: "#fff",
            }}
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <b style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Start from an idea</b>
          <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.5 }}>
            Tell your Creative Producer what message or concept you want to convey.
          </p>
          <span style={{ marginTop: 16, fontSize: 12.5, fontWeight: 700, color: "var(--violet)" }}>
            Ideate with team →
          </span>
        </button>
      </div>
    </div>
  );
}
