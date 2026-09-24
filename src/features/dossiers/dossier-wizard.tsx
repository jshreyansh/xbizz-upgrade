"use client";

import { useState, useEffect } from "react";
import type { BrandDossier, BrandOption, DossierApproval, DossierSource, DossierWizardStep, RegulatoryBody } from "@/features/dossiers/dossier-types";
import { NEW_DOSSIER_TEMPLATE } from "@/features/dossiers/mock-dossiers";
import { BrandLoader } from "@/components/ui/brand-loader";
import { CreateBrandModal } from "@/features/product-library/create-brand-modal";
import { useBrandCatalog } from "@/features/dossiers/brand-catalog";
import { DossierReader } from "@/features/dossiers/dossier-reader";
import type { LibraryProduct } from "@/features/product-library/product-library-types";

import {
  DOCUMENT_TYPES,
  PENDING_APPROVALS,
  PHARMA_SECTIONS,
  REQUIRED_SOURCES,
  SOURCE_TIER_META,
} from "@/features/dossiers/dossier-wizard-data";
import type {
  RequiredSource,
} from "@/features/dossiers/dossier-wizard-data";

interface DossierWizardProps {
  initialDossier?: BrandDossier | null;
  onBackToList: () => void;
  onDossierCreated: (dossier: BrandDossier) => void;
}

export function DossierWizard({
  initialDossier,
  onBackToList,
  onDossierCreated,
}: DossierWizardProps) {
  const [step, setStep] = useState<DossierWizardStep>(initialDossier ? "view" : "product");
  const [activeDossier, setActiveDossier] = useState<BrandDossier>(initialDossier || NEW_DOSSIER_TEMPLATE);
  const [selectedSections, setSelectedSections] = useState<string[]>(PHARMA_SECTIONS.map((s) => s.id));
  const [writerProgress, setWriterProgress] = useState(0);
  const [currentWritingSection, setCurrentWritingSection] = useState("Indications & Target Specificity");
  const [approvals, setApprovals] = useState<DossierApproval[]>(PENDING_APPROVALS);
  const [changesNote, setChangesNote] = useState("");
  const [showChangesForm, setShowChangesForm] = useState(false);
  const [uploadingType, setUploadingType] = useState<string | null>(null);

  // Step 1: brand picker
  const [brandQuery, setBrandQuery] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [isNewBrand, setIsNewBrand] = useState(!initialDossier);
  const [createBrandOpen, setCreateBrandOpen] = useState(false);

  // The brand list is shared with Product Library rather than this file's
  // own static registry — a brand created from either flow is pickable in
  // both.
  const brandOptions = useBrandCatalog();

  // Step 2: supporting documents (real files, not persisted anywhere — this is a prototype)
  const [supportingFiles, setSupportingFiles] = useState<File[]>([]);

  // Step 6: send the finished dossier to the internal team

  // Claims Verification Panel State (Collapses index into numbers 01, 02 and opens rightside verification drawer)

  const uploadedSourceTypes = new Set(activeDossier.sources.map((s) => s.type));
  const requiredSources = REQUIRED_SOURCES.filter((r) => r.tier === "required");
  const requiredUploadedCount = requiredSources.filter((r) => uploadedSourceTypes.has(r.type)).length;
  const requiredSourcesMet = requiredUploadedCount === requiredSources.length;

  function uploadSource(req: RequiredSource) {
    if (uploadingType || uploadedSourceTypes.has(req.type)) return;
    setUploadingType(req.type);
    setTimeout(() => {
      setActiveDossier((prev) => {
        if (prev.sources.some((s) => s.type === req.type)) return prev;
        const newSource: DossierSource = {
          id: `src-${req.type}-${prev.sources.length + 1}`,
          name: `${prev.brandName} · ${req.label(prev.regulatoryAnchor)}`,
          type: req.type,
          date: "Just now",
          status: "approved",
          details: req.detail,
          citationCount: req.tier === "required" ? 24 : 12,
        };
        return { ...prev, sources: [...prev.sources, newSource], sourcesCount: prev.sourcesCount + 1 };
      });
      setUploadingType(null);
    }, 900);
  }

  function selectExistingBrand(option: BrandOption) {
    setSelectedBrandId(option.id);
    setIsNewBrand(false);
    setActiveDossier((prev) => ({
      ...prev,
      brandName: option.name,
      genericName: option.genericName,
      therapyArea: option.therapyArea,
      regulatoryAnchor: option.regulatoryAnchor,
    }));
  }

  function startNewBrand() {
    setCreateBrandOpen(true);
  }

  /** Product Library's Create Brand modal hands the finished brand back here
   *  instead of navigating away — it's selected exactly like an existing
   *  brand would be, then indication/regulatory anchor still need a beat to
   *  complete since Product Library doesn't collect those. */
  function handleBrandCreated(product: LibraryProduct) {
    setSelectedBrandId(product.id);
    setIsNewBrand(true);
    setActiveDossier((prev) => ({
      ...prev,
      brandName: product.name,
      genericName: product.genericName,
      gradient: product.gradient,
      initials: product.name.slice(0, 2).toUpperCase(),
    }));
    setCreateBrandOpen(false);
  }

  function updateNewBrandField(field: "brandName" | "genericName" | "indication", value: string) {
    setActiveDossier((prev) => ({ ...prev, [field]: value }));
  }

  function addSupportingFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setSupportingFiles((prev) => [...prev, ...Array.from(files)]);
  }

  function removeSupportingFile(index: number) {
    setSupportingFiles((prev) => prev.filter((_, i) => i !== index));
  }

  const canContinueFromBrand = isNewBrand
    ? activeDossier.brandName.trim().length > 0 && activeDossier.genericName.trim().length > 0
    : selectedBrandId !== null;

  const selectedBrandOption = brandOptions.find((b) => b.id === selectedBrandId) || null;

  // Step 4: Medical Writer streaming generation simulation
  useEffect(() => {
    if (step === "writing") {
      const interval = setInterval(() => {
        setWriterProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setApprovals(PENDING_APPROVALS.map((a) => ({ ...a })));
              setStep("approval");
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
  }, [step]);

  // Step 5: the Medical Writer certifies their own draft first (content
  // sign-off), then MLR and the Project Manager review in turn; the Brand
  // Lead ("You") gives the final approval by hand.
  useEffect(() => {
    if (step !== "approval") return;
    const timers = [
      setTimeout(() => setApprovals((prev) => prev.map((a) => (a.role === "Medical Writer" ? { ...a, status: "approved" } : a))), 300),
      setTimeout(() => setApprovals((prev) => prev.map((a) => (a.role === "MLR Reviewer" ? { ...a, status: "reviewing" } : a))), 600),
      setTimeout(() => setApprovals((prev) => prev.map((a) => (a.role === "MLR Reviewer" ? { ...a, status: "approved" } : a))), 1800),
      setTimeout(() => setApprovals((prev) => prev.map((a) => (a.role === "Project Manager" ? { ...a, status: "reviewing" } : a))), 1100),
      setTimeout(() => setApprovals((prev) => prev.map((a) => (a.role === "Project Manager" ? { ...a, status: "approved" } : a))), 2500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [step]);

  const teamReady = approvals.filter((a) => a.role !== "Brand Lead").every((a) => a.status === "approved");

  function approveDossier() {
    const finalApprovals = approvals.map((a) => (a.role === "Brand Lead" ? { ...a, status: "approved" as const } : a));
    const approvedDossier: BrandDossier = { ...activeDossier, status: "complete", approvals: finalApprovals };
    setApprovals(finalApprovals);
    setActiveDossier(approvedDossier);
    onDossierCreated(approvedDossier);
    setStep("view");
  }

  function submitChangesRequest() {
    setApprovals((prev) => prev.map((a) => (a.role === "Brand Lead" ? { ...a, status: "changes-requested" } : a)));
    setShowChangesForm(false);
    setChangesNote("");
    setStep("plan");
  }

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
          onClick={step === "view" ? onBackToList : () => {
            if (step === "product") onBackToList();
            else if (step === "sources") setStep("product");
            else if (step === "plan") setStep("sources");
            else if (step === "writing" || step === "approval") setStep("plan");
            else setStep("list");
          }}
          style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 700, color: "var(--ink-3)" }}
        >
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {step === "view" ? "Back to Brand Dossiers" : "Back"}
        </button>

        {step !== "view" && step !== "writing" && step !== "approval" && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12.5, fontWeight: 700 }}>
            <span style={{ color: step === "product" ? "var(--brand)" : "var(--ink-4)" }}>1. Product</span>
            <span style={{ color: "var(--hair-3)" }}>/</span>
            <span style={{ color: step === "sources" ? "var(--brand)" : "var(--ink-4)" }}>2. Sources</span>
            <span style={{ color: "var(--hair-3)" }}>/</span>
            <span style={{ color: step === "plan" ? "var(--brand)" : "var(--ink-4)" }}>3. Plan</span>
          </div>
        )}
      </div>

      {/* ── STEP 1: BRAND ─────────────────────────────────────────── */}
      {step === "product" && (
        <div className="rise-in grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* LEFT — pick a brand, then a document type */}
          <div className="space-y-5">
            <div>
              <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--brand)", fontWeight: 800, marginBottom: 4 }}>
                Step 1 of 5
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.8px", margin: "0 0 6px" }}>
                Create a new Brand Dossier
              </h2>
              <p style={{ fontSize: 14, color: "var(--ink-3)", margin: 0 }}>
                Pick a brand and a document type, I’ll ground every section in the sources you approve next.
              </p>
            </div>

            {/* 1 · Brand */}
            <div style={{ background: "#fff", borderRadius: "var(--r-xl)", border: "1px solid var(--hair)", boxShadow: "var(--sh-1)", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px 12px" }}>
                <div style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 10 }}>
                  1 · Brand
                </div>
                <input
                  value={brandQuery}
                  onChange={(e) => setBrandQuery(e.target.value)}
                  placeholder="Search brands…"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--r)", border: "1px solid var(--hair-2)", fontSize: 14 }}
                />
              </div>

              <div style={{ maxHeight: 260, overflowY: "auto" }}>
                {brandOptions.filter((b) => b.name.toLowerCase().includes(brandQuery.toLowerCase())).map((b) => (
                  <button
                    key={b.id}
                    onClick={() => selectExistingBrand(b)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      padding: "12px 20px",
                      borderTop: "1px solid var(--hair)",
                      background: selectedBrandId === b.id ? "var(--tint-2)" : "transparent",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <b style={{ fontSize: 14, fontWeight: 750, display: "block" }}>{b.name}</b>
                      <span style={{ fontSize: 12, color: "var(--ink-4)" }}>{b.genericName} · {b.therapyArea}</span>
                    </div>
                    <span
                      style={{
                        width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                        border: `2px solid ${selectedBrandId === b.id ? "var(--brand)" : "var(--hair-3)"}`,
                        display: "grid", placeItems: "center",
                      }}
                    >
                      {selectedBrandId === b.id && <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--brand)" }} />}
                    </span>
                  </button>
                ))}
                <button
                  onClick={startNewBrand}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "14px 20px",
                    borderTop: "1px solid var(--hair)",
                    background: isNewBrand ? "var(--tint-2)" : "transparent",
                    color: "var(--brand)",
                    fontWeight: 700,
                    fontSize: 13.5,
                  }}
                >
                  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}><path d="M12 5v14M5 12h14" /></svg>
                  Add a new brand
                </button>
              </div>

              {isNewBrand && (
                <div style={{ padding: "16px 20px 20px", borderTop: "1px solid var(--hair)", background: "var(--surface-subtle)" }} className="space-y-3">
                  <div>
                    <label style={{ display: "block", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 6 }}>
                      Brand name
                    </label>
                    <input
                      value={activeDossier.brandName}
                      onChange={(e) => updateNewBrandField("brandName", e.target.value)}
                      placeholder="e.g. Aveloxa"
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "var(--r)", border: "1px solid var(--hair-2)", fontSize: 14, fontWeight: 600, background: "#fff" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 6 }}>
                      Generic / molecular name
                    </label>
                    <input
                      value={activeDossier.genericName}
                      onChange={(e) => updateNewBrandField("genericName", e.target.value)}
                      placeholder="e.g. aveloxotide dipropionate"
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "var(--r)", border: "1px solid var(--hair-2)", fontSize: 13.5, background: "#fff" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 6 }}>
                      Primary indication
                    </label>
                    <textarea
                      rows={2}
                      value={activeDossier.indication}
                      onChange={(e) => updateNewBrandField("indication", e.target.value)}
                      placeholder="What is it prescribed for?"
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "var(--r)", border: "1px solid var(--hair-2)", fontSize: 13.5, background: "#fff" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 6 }}>
                      Regulatory anchor
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {[
                        { label: "🇺🇸 FDA", val: "FDA" as RegulatoryBody },
                        { label: "🇪🇺 EMA", val: "EMA" as RegulatoryBody },
                      ].map((item) => (
                        <button
                          key={item.val}
                          onClick={() => setActiveDossier((prev) => ({ ...prev, regulatoryAnchor: item.val }))}
                          style={{
                            padding: "9px 12px",
                            borderRadius: "var(--r)",
                            border: `1px solid ${activeDossier.regulatoryAnchor === item.val ? "var(--brand)" : "var(--hair-2)"}`,
                            background: activeDossier.regulatoryAnchor === item.val ? "var(--tint)" : "#fff",
                            fontWeight: 700,
                            fontSize: 13,
                            textAlign: "left",
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2 · Document type */}
            <div style={{ background: "#fff", borderRadius: "var(--r-xl)", border: "1px solid var(--hair)", boxShadow: "var(--sh-1)", padding: 20 }} className="space-y-2">
              <div style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)", marginBottom: 4 }}>
                2 · Document type, what am I building?
              </div>
              {DOCUMENT_TYPES.map((dt) => (
                <button
                  key={dt.type}
                  onClick={() => setActiveDossier((prev) => ({ ...prev, documentType: dt.type }))}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "13px 16px",
                    borderRadius: "var(--r-l)",
                    border: `1px solid ${activeDossier.documentType === dt.type ? "var(--brand)" : "var(--hair)"}`,
                    background: activeDossier.documentType === dt.type ? "var(--tint-2)" : "transparent",
                    textAlign: "left",
                  }}
                >
                  <div>
                    <b style={{ fontSize: 13.5, fontWeight: 750, display: "block" }}>{dt.label}</b>
                    <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{dt.description}</span>
                  </div>
                  <span
                    style={{
                      width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                      border: `2px solid ${activeDossier.documentType === dt.type ? "var(--brand)" : "var(--hair-3)"}`,
                      display: "grid", placeItems: "center",
                    }}
                  >
                    {activeDossier.documentType === dt.type && <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--brand)" }} />}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep("sources")}
              disabled={!canContinueFromBrand}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "var(--r)",
                fontWeight: 750,
                fontSize: 14.5,
                background: canContinueFromBrand ? "linear-gradient(180deg,#ff5b2d,var(--brand))" : "var(--hair-2)",
                color: canContinueFromBrand ? "#fff" : "var(--ink-4)",
                border: "none",
                boxShadow: canContinueFromBrand ? "0 12px 26px -14px rgba(253,72,22,.9)" : "none",
                cursor: canContinueFromBrand ? "pointer" : "default",
                transition: ".2s var(--e)",
              }}
            >
              {canContinueFromBrand ? "Continue with your Medical Writer →" : isNewBrand ? "Name the brand to continue" : "Pick a brand to continue"}
            </button>
          </div>

          {/* RIGHT — what the Medical Writer is starting from */}
          <div className="space-y-3">
            <div style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)" }}>
              What I’m starting from
            </div>
            <div style={{ background: "var(--tint-2)", border: "1px solid var(--tint-line)", borderRadius: "var(--r-l)", padding: 16, display: "flex", gap: 12 }}>
              <span style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(140deg,#ff7a3d,#c9310a)", flexShrink: 0, display: "grid", placeItems: "center", color: "#fff", fontSize: 11, fontWeight: 800 }}>MW</span>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55 }}>
                <b>Medical Writer</b>{" · "}
                {isNewBrand
                  ? "Tell me the brand and generic name, and I’ll ground everything I write in the sources you approve next."
                  : "Select a brand and I’ll do the groundwork: existing record first, then a fresh source scan."}
              </p>
            </div>

            {!isNewBrand && selectedBrandOption && (
              selectedBrandOption.hasDossier ? (
                <div style={{ background: "#fff", border: "1px solid var(--hair)", borderRadius: "var(--r-l)", padding: 16, boxShadow: "var(--sh-1)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--ok)" }} />
                    <b style={{ fontSize: 13.5, fontWeight: 750 }}>Already on record</b>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--ink-3)", lineHeight: 1.55 }}>
                    {selectedBrandOption.name} already has a dossier. I’ll refresh it against fresh sources rather than start over.
                  </p>
                </div>
              ) : (
                <div style={{ background: "#fff", border: "1px solid var(--hair)", borderRadius: "var(--r-l)", padding: 16, boxShadow: "var(--sh-1)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--warn)" }} />
                    <b style={{ fontSize: 13.5, fontWeight: 750 }}>New product. No record yet</b>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--ink-3)", lineHeight: 1.55 }}>
                    Nothing on file for {selectedBrandOption.name}. I’ll build the full dossier from the sources you upload next.
                  </p>
                </div>
              )
            )}

            {isNewBrand && !activeDossier.brandName.trim() && (
              <div style={{ padding: "16px 4px", color: "var(--ink-4)", fontSize: 13 }}>
                Select a brand to see what’s already on record.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 2: SOURCES SELECTION ──────────────────────────────── */}
      {step === "sources" && (
        <div className="rise-in max-w-5xl mx-auto space-y-6">
          <div>
            <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--brand)", fontWeight: 800, marginBottom: 4 }}>
              Step 2 of 5
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.8px", margin: "0 0 6px" }}>
              Approved Sources &amp; Clinical Allow-list
            </h2>
            <p style={{ fontSize: 14, color: "var(--ink-3)", margin: 0 }}>
              The Medical Writer and MLR Reviewer will only ground sentences in what’s verified here.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 20, alignItems: "start" }} className="grid-cols-1 lg:grid-cols-2">
            {/* ── LEFT: upload progress checklist ── */}
            <div style={{ background: "#fff", borderRadius: "var(--r-xl)", border: "1px solid var(--hair)", boxShadow: "var(--sh-1)", overflow: "hidden" }}>
              <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--hair)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <b style={{ fontSize: 14.5, fontWeight: 800 }}>Upload progress</b>
                  <span
                    style={{
                      fontSize: 11.5, fontWeight: 800, padding: "3px 9px", borderRadius: 99,
                      background: requiredSourcesMet ? "var(--ok-bg)" : "var(--warn-bg)",
                      color: requiredSourcesMet ? "var(--ok)" : "var(--warn)",
                      border: `1px solid ${requiredSourcesMet ? "var(--ok-line)" : "#f3dfb0"}`,
                    }}
                  >
                    {requiredSourcesMet ? "✓ Ready to draft" : `${requiredUploadedCount} of ${requiredSources.length} required`}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink-3)" }}>
                  What {activeDossier.regulatoryAnchor} promotional-review law requires before a word is drafted.
                </p>
                <div style={{ background: "var(--hair)", height: 6, borderRadius: 99, overflow: "hidden", marginTop: 12 }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${(requiredUploadedCount / requiredSources.length) * 100}%`,
                      background: requiredSourcesMet ? "var(--ok)" : "var(--brand)",
                      borderRadius: 99,
                      transition: "width .3s ease",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid" }}>
                {REQUIRED_SOURCES.map((req, i) => {
                  const uploaded = uploadedSourceTypes.has(req.type);
                  const uploading = uploadingType === req.type;
                  const tierMeta = SOURCE_TIER_META[req.tier];
                  return (
                    <div
                      key={req.type}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        padding: "16px 20px",
                        borderBottom: i < REQUIRED_SOURCES.length - 1 ? "1px solid var(--hair)" : "none",
                        background: !uploaded && req.tier === "required" ? "var(--tint-2)" : "transparent",
                      }}
                    >
                      <span
                        style={{
                          width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                          background: uploaded ? "var(--ok-bg)" : "var(--tint)",
                          color: uploaded ? "var(--ok)" : "var(--brand)",
                          display: "grid", placeItems: "center", fontWeight: 800, fontSize: 10,
                        }}
                      >
                        {uploaded ? (
                          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l6 6L20 5" /></svg>
                        ) : req.badge}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                          <b style={{ fontSize: 13.5, fontWeight: 750 }}>{req.label(activeDossier.regulatoryAnchor)}</b>
                          <span style={{ fontSize: 9, letterSpacing: ".05em", fontWeight: 800, padding: "2px 6px", borderRadius: 5, background: tierMeta.bg, color: tierMeta.color, border: `1px solid ${tierMeta.line}` }}>
                            {tierMeta.label.toUpperCase()}
                          </span>
                        </div>
                        <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--ink-3)" }}>{req.detail}</p>
                      </div>
                      {uploaded ? (
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ok)", flexShrink: 0, marginTop: 6 }}>Uploaded</span>
                      ) : (
                        <button
                          onClick={() => uploadSource(req)}
                          disabled={uploading}
                          style={{
                            flexShrink: 0, marginTop: 2, padding: "7px 14px", borderRadius: "var(--r-s)", fontSize: 12.5, fontWeight: 700,
                            background: uploading ? "var(--hair-2)" : "#fff",
                            border: `1px solid ${uploading ? "var(--hair-2)" : "var(--hair-3)"}`,
                            color: uploading ? "var(--ink-4)" : "var(--ink-2)",
                            cursor: uploading ? "default" : "pointer",
                          }}
                        >
                          {uploading ? "Uploading…" : "Upload"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── RIGHT: complete brand dossier, high-level ── */}
            <div style={{ background: "#fff", borderRadius: "var(--r-xl)", border: "1px solid var(--hair)", boxShadow: "var(--sh-1)", overflow: "hidden" }}>
              <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--hair)", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: activeDossier.gradient, color: "#fff", display: "grid", placeItems: "center", fontSize: 14, fontWeight: 800, flexShrink: 0 }}>
                  {activeDossier.initials}
                </div>
                <div style={{ minWidth: 0 }}>
                  <b style={{ fontSize: 14.5, fontWeight: 800, display: "block" }}>{activeDossier.brandName}, Brand Dossier</b>
                  <span style={{ fontSize: 12, color: "var(--ink-4)" }}>{activeDossier.regulatoryAnchor} anchored · {PHARMA_SECTIONS.length} sections planned</span>
                </div>
              </div>

              <div style={{ padding: "6px 20px 16px" }}>
                {(["Clinical", "Safety", "Regulatory", "Commercial"] as const).map((cat) => {
                  const sectionsInCat = PHARMA_SECTIONS.filter((s) => s.cat === cat);
                  if (sectionsInCat.length === 0) return null;
                  return (
                    <div key={cat} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--hair)" }}>
                      <span style={{ fontSize: 13, fontWeight: 650, color: "var(--ink-2)" }}>{cat}</span>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-4)", padding: "2px 8px", borderRadius: 99, background: "var(--surface-subtle)" }}>
                        {sectionsInCat.length} section{sectionsInCat.length === 1 ? "" : "s"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div style={{ padding: "12px 20px 18px", background: "var(--surface-subtle)", borderTop: "1px solid var(--hair)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--ink-3)" }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--ink-4)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M12 8v4M12 16h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" /></svg>
                  Every section is drafted only from sources verified on the left, then cleared by MLR before this dossier goes live.
                </div>
              </div>
            </div>
          </div>

          {/* ── Supporting documents (optional, not required by law) ── */}
          <div style={{ background: "#fff", borderRadius: "var(--r-xl)", border: "1px solid var(--hair)", boxShadow: "var(--sh-1)", padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <b style={{ fontSize: 14.5, fontWeight: 800 }}>Supporting documents</b>
              <span style={{ fontSize: 11, fontWeight: 750, color: "var(--ink-4)" }}>Optional</span>
            </div>
            <p style={{ margin: "0 0 14px", fontSize: 12.5, color: "var(--ink-3)" }}>
              Anything else worth grounding claims in, slide decks, competitor teardowns, reference images. Not required by law, just extra context for your team.
            </p>

            <label
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                padding: "24px 16px", borderRadius: "var(--r-l)", border: "1.5px dashed var(--hair-3)",
                background: "var(--surface-subtle)", cursor: "pointer", textAlign: "center",
              }}
            >
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="var(--ink-4)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4M12 4l-4 4M12 4l4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>
              <span style={{ fontSize: 13, fontWeight: 650, color: "var(--ink-2)" }}>Click to attach files or images</span>
              <span style={{ fontSize: 11.5, color: "var(--ink-4)" }}>PDF, DOC, PNG, JPG, any size</span>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={(e) => addSupportingFiles(e.target.files)}
                style={{ display: "none" }}
              />
            </label>

            {supportingFiles.length > 0 && (
              <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
                {supportingFiles.map((file, i) => (
                  <div key={`${file.name}-${i}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: "var(--r)", background: "var(--surface-subtle)" }}>
                    <span style={{ width: 28, height: 28, borderRadius: 8, background: "var(--tint)", color: "var(--brand)", display: "grid", placeItems: "center", fontSize: 9, fontWeight: 800, flexShrink: 0 }}>
                      {file.type.startsWith("image/") ? "IMG" : file.name.split(".").pop()?.slice(0, 4).toUpperCase() || "DOC"}
                    </span>
                    <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
                    <span style={{ fontSize: 11, color: "var(--ink-4)", flexShrink: 0 }}>{(file.size / 1024).toFixed(0)} KB</span>
                    <button onClick={() => removeSupportingFile(i)} style={{ flexShrink: 0, width: 22, height: 22, borderRadius: "50%", display: "grid", placeItems: "center", color: "var(--ink-4)" }}>
                      <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setStep("plan")}
            disabled={!requiredSourcesMet}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "var(--r)",
              fontWeight: 750,
              fontSize: 14.5,
              background: requiredSourcesMet ? "linear-gradient(180deg,#ff5b2d,var(--brand))" : "var(--hair-2)",
              color: requiredSourcesMet ? "#fff" : "var(--ink-4)",
              border: "none",
              boxShadow: requiredSourcesMet ? "0 12px 26px -14px rgba(253,72,22,.9)" : "none",
              cursor: requiredSourcesMet ? "pointer" : "default",
              transition: ".2s var(--e)",
            }}
          >
            {requiredSourcesMet ? "Review 18-Section Content Plan →" : `Upload ${requiredSources.length - requiredUploadedCount} more required source${requiredSources.length - requiredUploadedCount === 1 ? "" : "s"} to continue`}
          </button>
        </div>
      )}

      {/* ── STEP 3: CONTENT PLAN ──────────────────────────────────── */}
      {step === "plan" && (
        <div className="rise-in max-w-3xl mx-auto space-y-6">
          <div>
            <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--brand)", fontWeight: 800, marginBottom: 4 }}>
              Step 3 of 5
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
              Grounded in {activeDossier.sources.length} approved source{activeDossier.sources.length === 1 ? "" : "s"} · Checking claims against {activeDossier.regulatoryAnchor} guidance
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

      {/* ── STEP 5: TEAM APPROVAL ───────────────────────────────────── */}
      {step === "approval" && (
        <div className="rise-in max-w-xl mx-auto space-y-6 py-8">
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--brand)", fontWeight: 800, marginBottom: 4 }}>
              Step 5 of 5
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.8px", margin: "0 0 8px" }}>
              Team review before {activeDossier.brandName} goes live
            </h2>
            <p style={{ fontSize: 14.5, color: "var(--ink-3)", margin: "0 auto", maxWidth: "48ch" }}>
              Nothing built from this dossier ships until every reviewer below signs off.
            </p>
          </div>

          <div style={{ background: "#fff", borderRadius: "var(--r-xl)", border: "1px solid var(--hair)", boxShadow: "var(--sh-1)", overflow: "hidden" }}>
            {approvals.map((a, i) => (
              <div
                key={a.role}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "16px 20px",
                  borderBottom: i < approvals.length - 1 ? "1px solid var(--hair)" : "none",
                }}
              >
                <span
                  style={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                    background: a.gradient, display: "grid", placeItems: "center",
                    color: "#fff", fontSize: 12, fontWeight: 800,
                  }}
                >
                  {a.initials}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ fontSize: 14, fontWeight: 750, display: "block" }}>{a.name}</b>
                  <span style={{ fontSize: 12, color: "var(--ink-4)" }}>{a.role}</span>
                </div>
                {a.status === "pending" && (
                  <span style={{ fontSize: 11.5, fontWeight: 750, color: "var(--ink-4)", background: "var(--hair)", padding: "4px 10px", borderRadius: 99 }}>
                    Pending
                  </span>
                )}
                {a.status === "reviewing" && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 750, color: "var(--brand-deep)", background: "var(--tint)", padding: "4px 10px", borderRadius: 99 }}>
                    <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} className="animate-brand-spin" style={{ animationDuration: "1s" }}>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Reviewing…
                  </span>
                )}
                {a.status === "approved" && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 750, color: "var(--ok)", background: "var(--ok-bg)", border: "1px solid var(--ok-line)", padding: "4px 10px", borderRadius: 99 }}>
                    <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l6 6L20 5" /></svg>
                    Approved
                  </span>
                )}
              </div>
            ))}
          </div>

          {!showChangesForm ? (
            <div className="space-y-3">
              <button
                onClick={approveDossier}
                disabled={!teamReady}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "var(--r)",
                  fontWeight: 750,
                  fontSize: 14.5,
                  background: teamReady ? "linear-gradient(180deg,#ff5b2d,var(--brand))" : "var(--hair-2)",
                  color: teamReady ? "#fff" : "var(--ink-4)",
                  border: "none",
                  boxShadow: teamReady ? "0 12px 26px -14px rgba(253,72,22,.9)" : "none",
                  cursor: teamReady ? "pointer" : "default",
                  transition: ".2s var(--e)",
                }}
              >
                {teamReady ? "✓ Approve & Publish Dossier →" : "Waiting on the team to finish reviewing…"}
              </button>
              <button
                onClick={() => setShowChangesForm(true)}
                style={{ width: "100%", padding: "12px", borderRadius: "var(--r)", fontWeight: 650, fontSize: 13.5, background: "#fff", border: "1px solid var(--hair-2)", color: "var(--ink-3)" }}
              >
                Request changes instead
              </button>
            </div>
          ) : (
            <div style={{ background: "#fff", borderRadius: "var(--r-l)", border: "1px solid var(--hair)", padding: 18 }} className="space-y-3">
              <label style={{ display: "block", fontSize: 11.5, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-4)" }}>
                What needs to change?
              </label>
              <textarea
                rows={3}
                value={changesNote}
                onChange={(e) => setChangesNote(e.target.value)}
                placeholder="e.g. Re-check the safety section citations before this goes back to the team."
                style={{ width: "100%", padding: "12px 14px", borderRadius: "var(--r)", border: "1px solid var(--hair-2)", fontSize: 13.5 }}
              />
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setShowChangesForm(false)}
                  style={{ flex: 1, padding: "12px", borderRadius: "var(--r)", fontWeight: 650, fontSize: 13.5, background: "#fff", border: "1px solid var(--hair-2)", color: "var(--ink-3)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={submitChangesRequest}
                  disabled={!changesNote.trim()}
                  style={{ flex: 2, padding: "12px", borderRadius: "var(--r)", fontWeight: 700, fontSize: 13.5, background: changesNote.trim() ? "var(--ink)" : "var(--hair-2)", color: changesNote.trim() ? "#fff" : "var(--ink-4)", border: "none" }}
                >
                  Send back to Content Plan
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 6: MASTER DOSSIER VIEW ───────────────────────────── */}
      {step === "view" && <DossierReader dossier={activeDossier} />}

      <CreateBrandModal open={createBrandOpen} onClose={() => setCreateBrandOpen(false)} onCreated={handleBrandCreated} />
    </div>
  );
}

