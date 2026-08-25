"use client";

import { useRouter } from "next/navigation";
import { useCreationStore } from "@/features/creation/creation-store";
import { MVHeader } from "@/features/creation/mv-header";

const WORKSPACE_DOSSIERS = [
  { id: "velmora", name: "Velmora · tirzelamide", meta: "HFrEF · 18 sections · 214 claims · 🇺🇸 FDA" },
  { id: "onkavia", name: "Onkavia · zalvatinib", meta: "NSCLC EGFR+ · 18 sections · 189 claims · 🇪🇺 EMA" },
  { id: "nirvexa", name: "Nirvexa · pamrevlumab", meta: "Idiopathic Pulmonary Fibrosis · 18 sections · 162 claims · 🇺🇸 FDA" },
];

const CHECKLIST_ITEMS = [
  "What the drug is, and the disease it treats",
  "The approved claims you are allowed to make",
  "The source behind every single claim",
  "Safety, dosing, interactions and contraindications",
  "Health economics and market access, where it exists",
];

export function Step2Sources() {
  const router = useRouter();
  const selectedDossier = useCreationStore((s) => s.selectedDossier);
  const setSelectedDossier = useCreationStore((s) => s.setSelectedDossier);
  const setStage = useCreationStore((s) => s.setStage);

  return (
    <div className="page-enter space-y-6">
      <MVHeader currentSubStep={1} />

      {/* AI Medical Writer message */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 18px",
          borderRadius: "var(--r)",
          background: "var(--tint)",
          border: "1px solid var(--tint-line)",
          color: "var(--brand-deep)",
          fontSize: 13.5,
        }}
      >
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "var(--brand)",
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontSize: 11,
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          MW
        </span>
        <span>
          Every video is written from a Brand Dossier, so nothing is invented. Give me a brand and I will build it from the label and the published evidence — you just approve.
        </span>
      </div>

      <div>
        <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 12 }}>
          Choose what it is written from
        </div>

        {/* 2 Big Route Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {/* Card 1: Build brand dossier */}
          <button
            onClick={() => router.push("/dossiers")}
            className="group block w-full text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            style={{
              padding: "24px 22px",
              background: "#fff",
              borderRadius: "var(--r-xl)",
              border: "1.5px solid var(--hair-2)",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <span
                className="transition-transform duration-200 group-hover:scale-105"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "var(--r)",
                  background: "linear-gradient(140deg,#ff7a3d,#c9310a)",
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  boxShadow: "0 8px 18px rgba(253,72,22,.4)",
                }}
              >
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
              <div>
                <h3 style={{ margin: "0 0 2px", fontSize: 16.5, fontWeight: 800, letterSpacing: "-.4px" }}>
                  Build my Brand Dossier
                </h3>
                <span style={{ fontSize: 11.5, color: "var(--ink-4)", fontWeight: 650 }}>
                  Recommended · about 4 minutes
                </span>
              </div>
            </div>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--ink-3)", lineHeight: 1.6 }}>
              Everything true about your brand in one place: what the drug is, who it is for, what you are allowed to claim, and the source behind each claim. Build it once — every video, email and visual aid after this is written from it.
            </p>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 9px", borderRadius: 99, background: "var(--ok-bg)", color: "var(--ok)", border: "1px solid var(--ok-line)" }}>
                Free on trial credits
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 9px", borderRadius: 99, background: "rgba(10,13,20,.05)", color: "var(--ink-3)" }}>
                19 sections
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 9px", borderRadius: 99, background: "rgba(10,13,20,.05)", color: "var(--ink-3)" }}>
                Every claim cited
              </span>
            </div>
          </button>

          {/* Card 2: Try sample dossier */}
          <button
            onClick={() => {
              setSelectedDossier("velmora");
              setStage(3);
            }}
            className="group block w-full text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            style={{
              padding: "24px 22px",
              background: "#fff",
              borderRadius: "var(--r-xl)",
              border: "1.5px solid var(--brand)",
              boxShadow: "0 0 0 1px var(--brand), var(--sh-2)",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <span
                className="transition-transform duration-200 group-hover:scale-105"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "var(--r)",
                  background: "linear-gradient(140deg,#4f83ff,#1d4ed8)",
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  boxShadow: "0 8px 18px rgba(79,131,255,.4)",
                }}
              >
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
                  <path d="M5 3l14 9-14 9z" />
                </svg>
              </span>
              <div>
                <h3 style={{ margin: "0 0 2px", fontSize: 16.5, fontWeight: 800, letterSpacing: "-.4px" }}>
                  Try it with a sample dossier
                </h3>
                <span style={{ fontSize: 11.5, color: "var(--brand)", fontWeight: 700 }}>
                  Fastest · see a finished video in ~10 minutes
                </span>
              </div>
            </div>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--ink-3)", lineHeight: 1.6 }}>
              Use our fully-built Velmora dossier — 18 sections, 214 cited claims, FDA-anchored — to walk the whole flow now and see exactly what comes out the other end. Swap in your own brand whenever you are ready.
            </p>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 9px", borderRadius: 99, background: "var(--tint)", color: "var(--brand-deep)", border: "1px solid var(--tint-line)" }}>
                Velmora · tirzelamide
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 9px", borderRadius: 99, background: "rgba(10,13,20,.05)", color: "var(--ink-3)" }}>
                🇺🇸 FDA
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 9px", borderRadius: 99, background: "rgba(10,13,20,.05)", color: "var(--ink-3)" }}>
                214 claims
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 2-col lower info */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {/* Left: What goes in a dossier */}
        <div style={{ background: "#fff", borderRadius: "var(--r-l)", border: "1px solid var(--hair)", padding: "20px 22px" }}>
          <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 12 }}>
            What actually goes into a Brand Dossier
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 9 }}>
            {CHECKLIST_ITEMS.map((item) => (
              <li key={item} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "var(--ink-2)" }}>
                <span style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--ok-bg)", color: "var(--ok)", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 800, flexShrink: 0 }}>
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Existing dossiers picker */}
        <div style={{ background: "#fff", borderRadius: "var(--r-l)", border: "1px solid var(--hair)", padding: "20px 22px" }}>
          <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 4 }}>
            Already have one?
          </div>
          <p style={{ margin: "0 0 12px", fontSize: 12.5, color: "var(--ink-3)" }}>
            Pick from the dossiers already verified in this workspace.
          </p>
          <div style={{ display: "grid", gap: 8 }}>
            {WORKSPACE_DOSSIERS.map((d) => {
              const isSelected = selectedDossier === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDossier(d.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "11px 14px",
                    borderRadius: "var(--r)",
                    border: `1px solid ${isSelected ? "var(--brand)" : "var(--hair-2)"}`,
                    background: isSelected ? "var(--tint)" : "#fff",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: 16 }}>📋</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ display: "block", fontSize: 13.5, color: isSelected ? "var(--brand-deep)" : "var(--ink)" }}>{d.name}</b>
                    <span style={{ fontSize: 11.5, color: "var(--ink-4)" }}>{d.meta}</span>
                  </div>
                  <span
                    style={{
                      width: 20,
                      height: 20,
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
          onClick={() => setStage(1)}
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
          <b>Velmora</b> selected · 18 sections, 214 cited claims
        </span>
        <button
          onClick={() => setStage(3)}
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
          Next: audience &amp; voice
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
