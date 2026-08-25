"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { BrandDossier, DossierWizardStep, RegulatoryBody } from "@/features/dossiers/dossier-types";
import { NEW_DOSSIER_TEMPLATE } from "@/features/dossiers/mock-dossiers";
import { BrandLoader } from "@/components/ui/brand-loader";

interface DossierWizardProps {
  initialDossier?: BrandDossier | null;
  onBackToList: () => void;
  onDossierCreated: (dossier: BrandDossier) => void;
}

const PHARMA_SECTIONS = [
  { id: "s1", name: "1. Executive Summary & Clinical Need", cat: "Clinical", defaultOn: true },
  { id: "s2", name: "2. Mechanism of Action & Target Selectivity", cat: "Clinical", defaultOn: true },
  { id: "s3", name: "3. Pivotal Phase III Efficacy Readouts", cat: "Clinical", defaultOn: true },
  { id: "s4", name: "4. Primary Composite & Key Secondary Endpoints", cat: "Clinical", defaultOn: true },
  { id: "s5", name: "5. Safety Profile & Adverse Event Adjudication", cat: "Safety", defaultOn: true },
  { id: "s6", name: "6. Warnings, Precautions & Boxed Warnings", cat: "Safety", defaultOn: true },
  { id: "s7", name: "7. Contraindications & Drug-Drug Interactions", cat: "Safety", defaultOn: true },
  { id: "s8", name: "8. Dosage, Administration & Titration", cat: "Regulatory", defaultOn: true },
  { id: "s9", name: "9. Special Populations (Renal / Hepatic / Pediatric)", cat: "Regulatory", defaultOn: true },
  { id: "s10", name: "10. Clinical Pharmacology & Pharmacokinetics", cat: "Clinical", defaultOn: true },
  { id: "s11", name: "11. HEOR Budget Impact & QALY Economic Model", cat: "Commercial", defaultOn: true },
  { id: "s12", name: "12. Hospital Readmission & ER Avoidance Model", cat: "Commercial", defaultOn: true },
  { id: "s13", name: "13. Patient Archetypes & Treatment Journey", cat: "Commercial", defaultOn: true },
  { id: "s14", name: "14. HCP Core Message Pillars & Objection Handling", cat: "Commercial", defaultOn: true },
  { id: "s15", name: "15. Congress Presentation & Symposium Abstract", cat: "Commercial", defaultOn: true },
  { id: "s16", name: "16. Field Medical FAQ & Scientific Responses", cat: "Commercial", defaultOn: true },
  { id: "s17", name: "17. Patient Counseling & Adherence Support", cat: "Commercial", defaultOn: true },
  { id: "s18", name: "18. Core Visual Identity & ISI Layout Rules", cat: "Commercial", defaultOn: true },
];

export function DossierWizard({
  initialDossier,
  onBackToList,
  onDossierCreated,
}: DossierWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<DossierWizardStep>(initialDossier ? "view" : "product");
  const [activeDossier, setActiveDossier] = useState<BrandDossier>(initialDossier || NEW_DOSSIER_TEMPLATE);
  const [selectedSections, setSelectedSections] = useState<string[]>(PHARMA_SECTIONS.map((s) => s.id));
  const [activeSectionId, setActiveSectionId] = useState<string>(activeDossier.sections[0]?.id || "sec-a1");
  const [writerProgress, setWriterProgress] = useState(0);
  const [currentWritingSection, setCurrentWritingSection] = useState("Indications & Target Specificity");

  // Step 4: Medical Writer streaming generation simulation
  useEffect(() => {
    if (step === "writing") {
      const interval = setInterval(() => {
        setWriterProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setStep("view");
              onDossierCreated(activeDossier);
            }, 600);
            return 100;
          }
          const next = prev + 12;
          if (next > 30 && next < 60) setCurrentWritingSection("Pivotal Phase III Exacerbation Analysis");
          else if (next >= 60 && next < 85) setCurrentWritingSection("Safety Profile & Adverse Event Adjudication");
          else if (next >= 85) setCurrentWritingSection("Commercial Claims & Citation Cross-referencing");
          return next;
        });
      }, 400);
      return () => clearInterval(interval);
    }
  }, [step, activeDossier, onDossierCreated]);

  const toggleSection = (id: string) => {
    setSelectedSections((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="page-enter space-y-6">
      {/* Wizard Header / Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--hair)", paddingBottom: 16 }}>
        <button
          onClick={step === "view" && initialDossier ? onBackToList : () => {
            if (step === "product") onBackToList();
            else if (step === "sources") setStep("product");
            else if (step === "plan") setStep("sources");
            else if (step === "writing") setStep("plan");
            else setStep("list");
          }}
          style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 700, color: "var(--ink-3)" }}
        >
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {step === "view" ? "Back to Brand Dossiers" : "Back"}
        </button>

        {step !== "view" && step !== "writing" && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12.5, fontWeight: 700 }}>
            <span style={{ color: step === "product" ? "var(--brand)" : "var(--ink-4)" }}>1. Product</span>
            <span style={{ color: "var(--hair-3)" }}>/</span>
            <span style={{ color: step === "sources" ? "var(--brand)" : "var(--ink-4)" }}>2. Sources</span>
            <span style={{ color: "var(--hair-3)" }}>/</span>
            <span style={{ color: step === "plan" ? "var(--brand)" : "var(--ink-4)" }}>3. Plan</span>
          </div>
        )}
      </div>

      {/* ── STEP 1: PRODUCT SELECTION ──────────────────────────────── */}
      {step === "product" && (
        <div className="rise-in max-w-2xl mx-auto space-y-6">
          <div>
            <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--brand)", fontWeight: 800, marginBottom: 4 }}>
              Step 1 of 4
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.8px", margin: "0 0 6px" }}>
              Define the Product &amp; Regulatory Anchor
            </h2>
            <p style={{ fontSize: 14, color: "var(--ink-3)", margin: 0 }}>
              The dossier is built specifically for the regulatory body that governs your promotional review.
            </p>
          </div>

          <div style={{ background: "#fff", padding: 26, borderRadius: "var(--r-xl)", border: "1px solid var(--hair)", boxShadow: "var(--sh-1)" }} className="space-y-4">
            <div>
              <label style={{ display: "block", fontSize: 11.5, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 8 }}>
                Brand Name
              </label>
              <input
                defaultValue={activeDossier.brandName}
                style={{ width: "100%", padding: "12px 14px", borderRadius: "var(--r)", border: "1px solid var(--hair-2)", fontSize: 15, fontWeight: 600 }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11.5, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 8 }}>
                Generic / Molecular Name
              </label>
              <input
                defaultValue={activeDossier.genericName}
                style={{ width: "100%", padding: "12px 14px", borderRadius: "var(--r)", border: "1px solid var(--hair-2)", fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11.5, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 8 }}>
                Primary Indication
              </label>
              <textarea
                rows={2}
                defaultValue={activeDossier.indication}
                style={{ width: "100%", padding: "12px 14px", borderRadius: "var(--r)", border: "1px solid var(--hair-2)", fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11.5, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 8 }}>
                Regulatory Anchor Body
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "🇺🇸 FDA · United States", val: "FDA" as RegulatoryBody },
                  { label: "🇪🇺 EMA · European Union", val: "EMA" as RegulatoryBody },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => setActiveDossier({ ...activeDossier, regulatoryAnchor: item.val })}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "var(--r)",
                      border: `1px solid ${activeDossier.regulatoryAnchor === item.val ? "var(--brand)" : "var(--hair-2)"}`,
                      background: activeDossier.regulatoryAnchor === item.val ? "var(--tint)" : "#fff",
                      fontWeight: 700,
                      fontSize: 13.5,
                      textAlign: "left",
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep("sources")}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "var(--r)",
              fontWeight: 750,
              fontSize: 14.5,
              background: "linear-gradient(180deg,#ff5b2d,var(--brand))",
              color: "#fff",
              border: "none",
              boxShadow: "0 12px 26px -14px rgba(253,72,22,.9)",
            }}
          >
            Continue to Sources &amp; Allow-list →
          </button>
        </div>
      )}

      {/* ── STEP 2: SOURCES SELECTION ──────────────────────────────── */}
      {step === "sources" && (
        <div className="rise-in max-w-3xl mx-auto space-y-6">
          <div>
            <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--brand)", fontWeight: 800, marginBottom: 4 }}>
              Step 2 of 4
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.8px", margin: "0 0 6px" }}>
              Approved Sources &amp; Clinical Allow-list
            </h2>
            <p style={{ fontSize: 14, color: "var(--ink-3)", margin: 0 }}>
              The Medical Writer and MLR Reviewer will only ground sentences in these verified documents.
            </p>
          </div>

          <div className="space-y-3">
            {activeDossier.sources.map((src) => (
              <div
                key={src.id}
                style={{
                  background: "#fff",
                  padding: "18px 20px",
                  borderRadius: "var(--r-l)",
                  border: "1px solid var(--hair)",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  boxShadow: "var(--sh-1)",
                }}
              >
                <span
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: "var(--tint)",
                    color: "var(--brand)",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 800,
                    fontSize: 11,
                    flexShrink: 0,
                  }}
                >
                  {src.type === "label" ? "PI" : src.type === "pubmed" ? "PUB" : src.type === "clinical-trials" ? "NCT" : "HEOR"}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <b style={{ fontSize: 14, fontWeight: 750 }}>{src.name}</b>
                    <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: "var(--ok-bg)", color: "var(--ok)" }}>
                      ✓ Verified
                    </span>
                  </div>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--ink-3)" }}>{src.details}</p>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--brand)", flexShrink: 0 }}>
                  {src.citationCount} potential claims
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep("plan")}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "var(--r)",
              fontWeight: 750,
              fontSize: 14.5,
              background: "linear-gradient(180deg,#ff5b2d,var(--brand))",
              color: "#fff",
              border: "none",
              boxShadow: "0 12px 26px -14px rgba(253,72,22,.9)",
            }}
          >
            Review 18-Section Content Plan →
          </button>
        </div>
      )}

      {/* ── STEP 3: CONTENT PLAN ──────────────────────────────────── */}
      {step === "plan" && (
        <div className="rise-in max-w-3xl mx-auto space-y-6">
          <div>
            <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--brand)", fontWeight: 800, marginBottom: 4 }}>
              Step 3 of 4
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.8px", margin: "0 0 6px" }}>
              Medical Writer 18-Section Content Plan
            </h2>
            <p style={{ fontSize: 14, color: "var(--ink-3)", margin: 0 }}>
              Select which sections you want your Medical Writer to draft from your allow-listed sources.
            </p>
          </div>

          <div style={{ background: "#fff", padding: 22, borderRadius: "var(--r-xl)", border: "1px solid var(--hair)", maxHeight: 420, overflowY: "auto" }}>
            <div style={{ display: "grid", gap: 10 }}>
              {PHARMA_SECTIONS.map((sec) => (
                <label
                  key={sec.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 14px",
                    borderRadius: "var(--r)",
                    background: selectedSections.includes(sec.id) ? "var(--tint-2)" : "transparent",
                    border: `1px solid ${selectedSections.includes(sec.id) ? "var(--tint-line)" : "var(--hair)"}`,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedSections.includes(sec.id)}
                    onChange={() => toggleSection(sec.id)}
                    style={{ accentColor: "var(--brand)", width: 16, height: 16 }}
                  />
                  <span style={{ flex: 1, fontSize: 13.5, fontWeight: 650 }}>{sec.name}</span>
                  <span style={{ fontSize: 11, color: "var(--ink-4)", fontWeight: 700, textTransform: "uppercase" }}>{sec.cat}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep("writing")}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "var(--r)",
              fontWeight: 750,
              fontSize: 14.5,
              background: "linear-gradient(180deg,#ff5b2d,var(--brand))",
              color: "#fff",
              border: "none",
              boxShadow: "0 12px 26px -14px rgba(253,72,22,.9)",
            }}
          >
            ⚡ Approve Plan &amp; Start Writing ({selectedSections.length} sections) →
          </button>
        </div>
      )}

      {/* ── STEP 4: MEDICAL WRITER STREAMING ──────────────────────── */}
      {step === "writing" && (
        <div className="rise-in max-w-xl mx-auto text-center space-y-6 py-12">
          <BrandLoader size={72} className="mx-auto" />

          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.8px", margin: "0 0 8px" }}>
              Medical Writer is drafting {activeDossier.brandName}
            </h2>
            <p style={{ fontSize: 14.5, color: "var(--ink-3)", margin: 0 }}>
              Grounded in 6 approved sources · Checking claims against FDA guidance
            </p>
          </div>

          {/* Progress bar */}
          <div style={{ background: "rgba(10,13,20,.08)", height: 8, borderRadius: 99, overflow: "hidden", maxWidth: 380, margin: "20px auto" }}>
            <div style={{ height: "100%", width: `${writerProgress}%`, background: "var(--brand)", borderRadius: 99, transition: "width .3s ease" }} />
          </div>

          <div style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 650 }}>
            Current section: <span style={{ color: "var(--brand-deep)" }}>{currentWritingSection}</span> ({writerProgress}%)
          </div>
        </div>
      )}

      {/* ── STEP 5: MASTER DOSSIER VIEW ───────────────────────────── */}
      {step === "view" && (
        <div className="rise-in space-y-6">
          {/* Top Dossier Summary Card */}
          <div
            style={{
              background: "#fff",
              borderRadius: "var(--r-xl)",
              border: "1px solid var(--hair)",
              padding: "26px 28px",
              boxShadow: "var(--sh-1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 16,
                  background: activeDossier.gradient,
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 20,
                  fontWeight: 800,
                }}
              >
                {activeDossier.initials}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.8px", margin: 0 }}>{activeDossier.brandName}</h1>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 99, background: "var(--ok-bg)", color: "var(--ok)", border: "1px solid var(--ok-line)" }}>
                    {activeDossier.regulatoryAnchor} Anchor · Live
                  </span>
                </div>
                <p style={{ margin: "3px 0 0", fontSize: 13.5, color: "var(--ink-3)" }}>
                  {activeDossier.genericName} — {activeDossier.indication}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => router.push("/create")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "11px 20px",
                  borderRadius: "var(--r)",
                  fontWeight: 700,
                  fontSize: 14,
                  background: "linear-gradient(180deg,#ff5b2d,var(--brand))",
                  color: "#fff",
                  border: "none",
                  boxShadow: "0 12px 26px -14px rgba(253,72,22,.9)",
                  cursor: "pointer",
                }}
              >
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
                  <path d="M5 3l14 9-14 9z" />
                </svg>
                Create Magic Video from Dossier
              </button>
            </div>
          </div>

          {/* 2-Column Inspector: Left Sections Tree + Right Section Body */}
          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "start" }}>
            {/* Left Section Tree */}
            <div style={{ background: "#fff", borderRadius: "var(--r-xl)", border: "1px solid var(--hair)", padding: 14, boxShadow: "var(--sh-1)" }}>
              <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", padding: "8px 10px 12px" }}>
                Dossier Sections ({activeDossier.sections.length})
              </div>
              <div style={{ display: "grid", gap: 4 }}>
                {activeDossier.sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSectionId(sec.id)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      padding: "10px 12px",
                      borderRadius: "var(--r)",
                      textAlign: "left",
                      background: activeSectionId === sec.id ? "var(--tint)" : "transparent",
                      border: activeSectionId === sec.id ? "1px solid var(--tint-line)" : "1px solid transparent",
                    }}
                  >
                    <b style={{ fontSize: 13, color: activeSectionId === sec.id ? "var(--brand-deep)" : "var(--ink)" }}>{sec.title}</b>
                    <span style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 2 }}>{sec.claimsCount} claims · {sec.citations.length} sources</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Active Section Content */}
            {(() => {
              const sec = activeDossier.sections.find((s) => s.id === activeSectionId) || activeDossier.sections[0];
              return (
                <div style={{ background: "#fff", borderRadius: "var(--r-xl)", border: "1px solid var(--hair)", padding: 30, boxShadow: "var(--sh-1)" }} className="space-y-6">
                  <div style={{ borderBottom: "1px solid var(--hair)", paddingBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "var(--brand)", textTransform: "uppercase" }}>
                        Section {sec.number}
                      </span>
                      <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 99, background: "var(--ok-bg)", color: "var(--ok)", fontWeight: 700 }}>
                        MLR Approved
                      </span>
                    </div>
                    <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-.5px", margin: 0 }}>{sec.title}</h2>
                  </div>

                  {/* Body Content with citations */}
                  <div style={{ fontSize: 15, lineHeight: 1.75, color: "var(--ink-2)" }}>
                    <p>{sec.content}</p>
                  </div>

                  {/* Citations Footer */}
                  <div style={{ background: "var(--tint-2)", padding: "16px 18px", borderRadius: "var(--r)", border: "1px solid var(--tint-line)" }}>
                    <b style={{ display: "block", fontSize: 12, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--brand-deep)", marginBottom: 8 }}>
                      On-Record Citations
                    </b>
                    <div style={{ display: "grid", gap: 6 }}>
                      {sec.citations.map((cite, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--ink-3)" }}>
                          <span style={{ color: "var(--brand)", fontWeight: 800 }}>[{i + 1}]</span>
                          <span>{cite}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
