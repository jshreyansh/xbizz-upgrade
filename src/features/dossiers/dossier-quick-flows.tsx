"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, Sparkles, FileText, Loader2, Check, X, ArrowRight, ChevronLeft, ChevronDown } from "lucide-react";
import { ConfettiBurst } from "@/features/dossiers/confetti-burst";
import { BRAND_REGISTRY } from "@/features/dossiers/mock-dossiers";
import type { BrandDossier, DossierSection, RegulatoryBody } from "@/features/dossiers/dossier-types";

/* ─── Shared modal shell ─────────────────────────────────────────────────────── */
function FlowModal({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          borderRadius: "var(--r-xl)",
          background: "#fff",
          border: "1px solid var(--hair)",
          boxShadow: "0 30px 60px -20px rgba(16,24,40,.35)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      aria-label="Back"
      style={{
        position: "absolute",
        top: 14,
        left: 14,
        width: 30,
        height: 30,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        color: "var(--ink-3)",
        background: "var(--surface-subtle)",
        zIndex: 2,
      }}
    >
      <ChevronLeft size={16} />
    </button>
  );
}

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Close"
      style={{
        position: "absolute",
        top: 14,
        right: 14,
        width: 30,
        height: 30,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        color: "var(--ink-3)",
        background: "var(--surface-subtle)",
        zIndex: 2,
      }}
    >
      <X size={15} />
    </button>
  );
}

/* ─── Staggered "working" checklist, shared by both flows ──────────────────── */
function ProcessingChecklist({
  title,
  items,
  onDone,
}: {
  title: string;
  items: string[];
  onDone: () => void;
}) {
  const [doneCount, setDoneCount] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    items.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setDoneCount((c) => c + 1);
        }, 480 + i * 620)
      );
    });
    timers.push(setTimeout(onDone, 480 + items.length * 620 + 420));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: "40px 32px 34px", textAlign: "center" }}>
      <div
        style={{
          width: 52,
          height: 52,
          margin: "0 auto 18px",
          borderRadius: 16,
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(180deg,#ff5b2d,var(--brand))",
          color: "#fff",
          boxShadow: "0 10px 22px -10px rgba(253,72,22,.5)",
        }}
      >
        <Loader2 size={22} className="animate-spin" />
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-.3px", margin: "0 0 4px", color: "var(--ink)" }}>
        {title}
      </h3>
      <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 22px" }}>
        This usually takes a few seconds.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}>
        {items.map((item, i) => {
          const isDone = i < doneCount;
          const isActive = i === doneCount;
          return (
            <div
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: "var(--r)",
                background: isActive ? "var(--tint-2)" : "transparent",
                border: isActive ? "1px solid var(--tint-line)" : "1px solid transparent",
                transition: "all .2s ease",
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  background: isDone ? "var(--ok)" : "#fff",
                  border: isDone ? "none" : "1.5px solid var(--hair-2)",
                }}
              >
                {isDone && <Check size={11} color="#fff" strokeWidth={3} />}
                {isActive && !isDone && <Loader2 size={11} className="animate-spin" color="var(--brand)" />}
              </span>
              <span style={{ fontSize: 13, fontWeight: isActive || isDone ? 650 : 500, color: isDone ? "var(--ink-2)" : isActive ? "var(--ink)" : "var(--ink-4)" }}>
                {item}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Success screen — confetti burst + summary, shared by both flows ──────── */
function SuccessScreen({
  headline,
  subtitle,
  dossier,
  onViewDossier,
  onClose,
}: {
  headline: string;
  subtitle: string;
  dossier: BrandDossier;
  onViewDossier: () => void;
  onClose: () => void;
}) {
  return (
    <div style={{ padding: "40px 32px 30px", textAlign: "center", position: "relative" }}>
      <ConfettiBurst />
      <div
        style={{
          width: 60,
          height: 60,
          margin: "0 auto 18px",
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(140deg,#22c07a,#12784a)",
          color: "#fff",
          boxShadow: "0 12px 26px -10px rgba(18,120,74,.55)",
          animation: "success-pop-in .45s cubic-bezier(0.2, 0.8, 0.2, 1) both",
          position: "relative",
        }}
      >
        <Check size={28} strokeWidth={3} />
      </div>
      <h3 style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-.4px", margin: "0 0 6px", color: "var(--ink)", position: "relative" }}>
        {headline}
      </h3>
      <p style={{ fontSize: 13.5, color: "var(--ink-3)", margin: "0 0 22px", position: "relative" }}>
        {subtitle}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8,
          padding: "12px 10px",
          background: "var(--tint-2)",
          border: "1px solid var(--tint-line)",
          borderRadius: "var(--r)",
          marginBottom: 22,
          position: "relative",
        }}
      >
        {[
          [String(dossier.sectionsCount), "Sections"],
          [String(dossier.claimsCited), "Claims cited"],
          [String(dossier.sourcesCount), "Sources"],
        ].map(([val, label]) => (
          <div key={label}>
            <b style={{ display: "block", fontSize: 16, fontWeight: 800, color: "var(--brand-deep)" }}>{val}</b>
            <span style={{ fontSize: 9.5, color: "var(--ink-4)", textTransform: "uppercase", fontWeight: 700, letterSpacing: ".03em" }}>{label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, position: "relative" }}>
        <button
          type="button"
          onClick={onClose}
          style={{ flex: 1, padding: "11px 0", borderRadius: "var(--r)", fontWeight: 700, fontSize: 13.5, color: "var(--ink-3)", background: "var(--surface-subtle)", border: "1px solid var(--hair)" }}
        >
          Close
        </button>
        <button
          type="button"
          onClick={onViewDossier}
          style={{
            flex: 1.4,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "11px 0",
            borderRadius: "var(--r)",
            fontWeight: 750,
            fontSize: 13.5,
            color: "#fff",
            background: "linear-gradient(180deg,#ff5b2d,var(--brand))",
            boxShadow: "0 10px 20px -10px rgba(253,72,22,.6)",
          }}
        >
          View dossier
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

/* ─── Mock generation — builds a plausible BrandDossier from flow inputs ────── */
function buildMockDossier(input: {
  brandName: string;
  genericName: string;
  indication: string;
  regulatoryAnchor: RegulatoryBody;
  sectionTitles?: string[];
  category?: string;
  targetAudience?: string[];
}): BrandDossier {
  const id = `${input.brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;
  const gradients = [
    "linear-gradient(145deg,#1b2a4a,#2f4a7d 50%,#5b7fb8)",
    "linear-gradient(145deg,#3a1e4d,#63307a 48%,#a06bc4)",
    "linear-gradient(145deg,#12332c,#1d5a4a 48%,#3f9c7f)",
  ];
  const gradient = gradients[Math.floor(Math.random() * gradients.length)];
  const sectionTitles =
    input.sectionTitles ?? ["Indication & Positioning", "Mechanism of Action", "Clinical Evidence", "Safety Profile", "Dosing & Administration", "Payer & HEOR Summary"];

  const sections: DossierSection[] = sectionTitles.map((title, i) => ({
    id: `sec-${i}`,
    number: i + 1,
    title,
    category: (["clinical", "commercial", "regulatory", "safety"] as const)[i % 4],
    content: `Grounded summary of ${title.toLowerCase()} for ${input.brandName}, generated from approved sources.`,
    claimsCount: 4 + (i % 3),
    heldOutCount: 0,
    citations: [],
  }));

  return {
    id,
    brandName: input.brandName,
    genericName: input.genericName || input.brandName.toLowerCase(),
    indication: input.indication || "Indication pending source confirmation.",
    therapyArea: "General Medicine",
    regulatoryAnchor: input.regulatoryAnchor,
    documentType: "commercial",
    gradient,
    accentColor: "#22c07a",
    initials: input.brandName.slice(0, 2).toUpperCase(),
    sectionsCount: sections.length,
    claimsCited: sections.reduce((sum, s) => sum + s.claimsCount, 0),
    claimsHeldOut: 0,
    verifiedClaimsCount: sections.reduce((sum, s) => sum + s.claimsCount, 0),
    totalClaimsCount: sections.reduce((sum, s) => sum + s.claimsCount, 0),
    healthStatus: "healthy",
    sourcesCount: 4,
    lastUpdated: "Just now",
    status: "complete",
    isSample: false,
    category: input.category,
    targetAudience: input.targetAudience,
    sources: [
      { id: "src-1", name: `${input.regulatoryAnchor} Approved Prescribing Information`, type: "label", date: "This year", status: "approved", details: "Core label", citationCount: sections.length * 3 },
      { id: "src-2", name: "PubMed literature review", type: "pubmed", date: "This year", status: "approved", details: "Published trial data", citationCount: sections.length * 2 },
    ],
    sections,
    approvals: [
      { role: "Medical Writer", name: "Medical Writer", initials: "MW", gradient: "linear-gradient(140deg,#ff7a3d,#c9310a)", status: "pending" },
      { role: "MLR Reviewer", name: "MLR Reviewer", initials: "MR", gradient: "linear-gradient(140deg,#22c07a,#12784a)", status: "pending" },
      { role: "Project Manager", name: "Project Manager", initials: "PM", gradient: "linear-gradient(140deg,#9b6bff,#5b21b6)", status: "pending" },
      { role: "Brand Lead", name: "You", initials: "N", gradient: "linear-gradient(140deg,#3a3f4b,#0d1017)", status: "pending" },
    ],
  };
}

const REGULATORY_BODIES: RegulatoryBody[] = ["FDA", "EMA", "MHRA", "PMDA"];
const PREVIEW_SECTIONS = ["Indication & Positioning", "Mechanism of Action", "Clinical Evidence", "Safety Profile", "Dosing & Administration", "Payer & HEOR Summary"];
const OTHER_PRODUCT_ID = "__other__";
const DOSSIER_CATEGORIES = ["Patient Related", "HCP Related", "Payer Related", "Commercial"];
const TARGET_AUDIENCES = ["Trade Partner", "HCP", "Patient", "Payer"];

/* ─── Single consolidated flow — one CTA on the list page opens this.
   Steps: pick the product -> choose Create or Upload -> that path's
   input -> processing -> (preview, create-path only) -> success. ───── */
type FlowStep = "product" | "path" | "upload-input" | "create-input" | "processing" | "preview" | "success";
type FlowPath = "create" | "upload";

export function NewDossierFlow({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (dossier: BrandDossier) => void;
}) {
  const [step, setStep] = useState<FlowStep>("product");
  const [path, setPath] = useState<FlowPath | null>(null);

  // Step 1 — product
  const [productId, setProductId] = useState("");
  const [brandName, setBrandName] = useState("");
  const [genericName, setGenericName] = useState("");
  const [anchor, setAnchor] = useState<RegulatoryBody>("FDA");
  const [category, setCategory] = useState("");
  const [audiences, setAudiences] = useState<string[]>([]);
  const [supportingFiles, setSupportingFiles] = useState<File[]>([]);
  const isOtherProduct = productId === OTHER_PRODUCT_ID;
  const supportingFilesRef = useRef<HTMLInputElement>(null);

  // Upload path
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create path
  const [indication, setIndication] = useState("");

  function toggleAudience(a: string) {
    setAudiences((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  function handleSupportingFilesPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length) setSupportingFiles((prev) => [...prev, ...files]);
  }

  const [dossier, setDossier] = useState<BrandDossier | null>(null);

  function handleProductChange(id: string) {
    setProductId(id);
    if (id === OTHER_PRODUCT_ID) {
      setBrandName("");
      setGenericName("");
      return;
    }
    const brand = BRAND_REGISTRY.find((b) => b.id === id);
    if (brand) {
      setBrandName(brand.name);
      setGenericName(brand.genericName);
      setAnchor(brand.regulatoryAnchor);
    }
  }

  function handleFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  }

  function startVerification() {
    setDossier(buildMockDossier({ brandName, genericName, indication: `Extracted from ${fileName}`, regulatoryAnchor: anchor, category, targetAudience: audiences }));
    setStep("processing");
  }

  function startAnalysis() {
    setDossier(buildMockDossier({ brandName, genericName, indication, regulatoryAnchor: anchor, sectionTitles: PREVIEW_SECTIONS, category, targetAudience: audiences }));
    setStep("processing");
  }

  const productChosen = isOtherProduct ? brandName.trim().length > 0 : productId.length > 0;
  const canUpload = brandName.trim().length > 0 && !!fileName;
  const canAnalyze = brandName.trim().length > 0 && indication.trim().length > 0;

  return (
    <FlowModal onClose={onClose}>
      {step !== "product" && (
        <BackButton
          onBack={() => {
            if (step === "path") setStep("product");
            else if (step === "upload-input" || step === "create-input") setStep("path");
          }}
        />
      )}
      <CloseButton onClose={onClose} />

      {step === "product" && (
        <div style={{ padding: "32px 28px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ width: 36, height: 36, borderRadius: 11, display: "grid", placeItems: "center", background: "var(--tint)", color: "var(--brand-deep)" }}>
              <Sparkles size={17} />
            </span>
            <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-.3px", margin: 0, color: "var(--ink)" }}>New brand dossier</h3>
          </div>
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "6px 0 20px" }}>
            Which product is this for?
          </p>

          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink-2)", marginBottom: 6 }}>Product</label>
          <div style={{ position: "relative", marginBottom: isOtherProduct ? 16 : 22 }}>
            <select
              value={productId}
              onChange={(e) => handleProductChange(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 34px 10px 12px",
                borderRadius: "var(--r)",
                border: "1px solid var(--hair-2)",
                fontSize: 13.5,
                color: productId ? "var(--ink)" : "var(--ink-4)",
                background: "#fff",
                appearance: "none",
                cursor: "pointer",
              }}
            >
              <option value="" disabled>
                Choose a product…
              </option>
              {BRAND_REGISTRY.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} — {b.therapyArea}
                  {b.hasDossier ? " (has a dossier)" : ""}
                </option>
              ))}
              <option value={OTHER_PRODUCT_ID}>Other / new product…</option>
            </select>
            <ChevronDown size={15} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ink-4)", pointerEvents: "none" }} />
          </div>

          {isOtherProduct && (
            <>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink-2)", marginBottom: 6 }}>Brand name</label>
              <input
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Velmora"
                style={{ width: "100%", padding: "10px 12px", borderRadius: "var(--r)", border: "1px solid var(--hair-2)", fontSize: 13.5, marginBottom: 16, color: "var(--ink)" }}
              />
            </>
          )}

          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink-2)", marginBottom: 6 }}>Dossier category</label>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 34px 10px 12px",
                borderRadius: "var(--r)",
                border: "1px solid var(--hair-2)",
                fontSize: 13.5,
                color: category ? "var(--ink)" : "var(--ink-4)",
                background: "#fff",
                appearance: "none",
                cursor: "pointer",
              }}
            >
              <option value="">Choose a category…</option>
              {DOSSIER_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown size={15} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ink-4)", pointerEvents: "none" }} />
          </div>

          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink-2)", marginBottom: 6 }}>Target audience</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {TARGET_AUDIENCES.map((a) => {
              const selected = audiences.includes(a);
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAudience(a)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 99,
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: selected ? "#fff" : "var(--ink-3)",
                    background: selected ? "var(--ink)" : "var(--surface-subtle)",
                    border: "1px solid var(--hair)",
                  }}
                >
                  {a}
                </button>
              );
            })}
          </div>

          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink-2)", marginBottom: 6 }}>Supporting documents (optional)</label>
          <button
            type="button"
            onClick={() => supportingFilesRef.current?.click()}
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              padding: "16px",
              borderRadius: "var(--r-l)",
              border: `1.5px dashed ${supportingFiles.length ? "var(--brand)" : "var(--hair-2)"}`,
              background: supportingFiles.length ? "var(--tint-2)" : "var(--surface-subtle)",
              cursor: "pointer",
              marginBottom: 22,
            }}
          >
            <Upload size={18} color={supportingFiles.length ? "var(--brand-deep)" : "var(--ink-4)"} />
            <span style={{ fontSize: 12, fontWeight: 650, color: supportingFiles.length ? "var(--brand-deep)" : "var(--ink-3)" }}>
              {supportingFiles.length
                ? `${supportingFiles.length} file${supportingFiles.length > 1 ? "s" : ""} attached — click to add more`
                : "Any label, deck, or reference doc — we'll bring it into the dossier flow"}
            </span>
          </button>
          <input ref={supportingFilesRef} type="file" multiple onChange={handleSupportingFilesPicked} style={{ display: "none" }} />

          <button
            type="button"
            disabled={!productChosen}
            onClick={() => setStep("path")}
            style={{
              width: "100%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "12px 0",
              borderRadius: "var(--r)",
              fontWeight: 750,
              fontSize: 14,
              color: "#fff",
              background: !productChosen ? "var(--ink-4)" : "linear-gradient(180deg,#ff5b2d,var(--brand))",
              opacity: !productChosen ? 0.5 : 1,
              cursor: !productChosen ? "not-allowed" : "pointer",
              boxShadow: !productChosen ? "none" : "0 12px 24px -12px rgba(253,72,22,.6)",
            }}
          >
            Next
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {step === "path" && (
        <div style={{ padding: "36px 28px 28px" }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-.3px", margin: "0 0 4px", color: "var(--ink)", textAlign: "center" }}>
            How do you want to build {brandName}&rsquo;s dossier?
          </h3>
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 20px", textAlign: "center" }}>
            Either way, it&rsquo;ll be grounded and MLR-ready.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <button
              type="button"
              onClick={() => {
                setPath("create");
                setStep("create-input");
              }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "22px 14px", borderRadius: "var(--r-l)", border: "1px solid var(--hair-2)", background: "#fff", cursor: "pointer", textAlign: "center" }}
              className="hover:-translate-y-0.5 transition-transform"
            >
              <span style={{ width: 42, height: 42, borderRadius: 13, display: "grid", placeItems: "center", background: "linear-gradient(180deg,#ff5b2d,var(--brand))", color: "#fff" }}>
                <Sparkles size={19} />
              </span>
              <b style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)" }}>Create</b>
              <span style={{ fontSize: 11.5, color: "var(--ink-3)", lineHeight: 1.4 }}>AI drafts it from approved sources</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPath("upload");
                setStep("upload-input");
              }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "22px 14px", borderRadius: "var(--r-l)", border: "1px solid var(--hair-2)", background: "#fff", cursor: "pointer", textAlign: "center" }}
              className="hover:-translate-y-0.5 transition-transform"
            >
              <span style={{ width: 42, height: 42, borderRadius: 13, display: "grid", placeItems: "center", background: "var(--ink)", color: "#fff" }}>
                <Upload size={19} />
              </span>
              <b style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)" }}>Upload</b>
              <span style={{ fontSize: 11.5, color: "var(--ink-3)", lineHeight: 1.4 }}>Bring an existing document</span>
            </button>
          </div>
        </div>
      )}

      {step === "upload-input" && (
        <div style={{ padding: "32px 28px 28px" }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-.3px", margin: "0 0 4px", color: "var(--ink)" }}>Upload {brandName}&rsquo;s dossier</h3>
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 12px" }}>
            We&rsquo;ll verify and validate it against the {anchor} anchor.
          </p>
          {supportingFiles.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 12px", borderRadius: "var(--r)", background: "var(--tint-2)", border: "1px solid var(--tint-line)", fontSize: 12, color: "var(--brand-deep)", fontWeight: 650, marginBottom: 16 }}>
              <FileText size={13} />
              {supportingFiles.length} supporting document{supportingFiles.length > 1 ? "s" : ""} carried over from the product step
            </div>
          )}

          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink-2)", marginBottom: 6 }}>Dossier file</label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              padding: "22px 16px",
              borderRadius: "var(--r-l)",
              border: `1.5px dashed ${fileName ? "var(--brand)" : "var(--hair-2)"}`,
              background: fileName ? "var(--tint-2)" : "var(--surface-subtle)",
              cursor: "pointer",
              marginBottom: 22,
            }}
          >
            {fileName ? <FileText size={20} color="var(--brand-deep)" /> : <Upload size={20} color="var(--ink-4)" />}
            <span style={{ fontSize: 12.5, fontWeight: 650, color: fileName ? "var(--brand-deep)" : "var(--ink-3)" }}>
              {fileName ?? "Click to browse — PDF, DOCX, or PPTX"}
            </span>
          </button>
          <input ref={fileInputRef} type="file" onChange={handleFilePicked} style={{ display: "none" }} accept=".pdf,.doc,.docx,.ppt,.pptx" />

          <button
            type="button"
            disabled={!canUpload}
            onClick={startVerification}
            style={{
              width: "100%",
              padding: "12px 0",
              borderRadius: "var(--r)",
              fontWeight: 750,
              fontSize: 14,
              color: "#fff",
              background: !canUpload ? "var(--ink-4)" : "linear-gradient(180deg,#ff5b2d,var(--brand))",
              opacity: !canUpload ? 0.5 : 1,
              cursor: !canUpload ? "not-allowed" : "pointer",
              boxShadow: !canUpload ? "none" : "0 12px 24px -12px rgba(253,72,22,.6)",
            }}
          >
            Verify &amp; validate
          </button>
        </div>
      )}

      {step === "create-input" && (
        <div style={{ padding: "32px 28px 28px" }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-.3px", margin: "0 0 4px", color: "var(--ink)" }}>Create {brandName}&rsquo;s dossier</h3>
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 12px" }}>
            Give us the brief — we&rsquo;ll analyze approved sources and draft a preview.
          </p>
          {supportingFiles.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 12px", borderRadius: "var(--r)", background: "var(--tint-2)", border: "1px solid var(--tint-line)", fontSize: 12, color: "var(--brand-deep)", fontWeight: 650, marginBottom: 16 }}>
              <FileText size={13} />
              {supportingFiles.length} supporting document{supportingFiles.length > 1 ? "s" : ""} carried over from the product step
            </div>
          )}

          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink-2)", marginBottom: 6 }}>Indication / brief</label>
          <textarea
            value={indication}
            onChange={(e) => setIndication(e.target.value)}
            rows={3}
            placeholder="What is this brand for, and who's the audience?"
            style={{ width: "100%", padding: "10px 12px", borderRadius: "var(--r)", border: "1px solid var(--hair-2)", fontSize: 13.5, marginBottom: 16, resize: "vertical", color: "var(--ink)", fontFamily: "inherit" }}
          />

          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink-2)", marginBottom: 6 }}>Regulatory anchor</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
            {REGULATORY_BODIES.map((body) => (
              <button
                key={body}
                type="button"
                onClick={() => setAnchor(body)}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: "var(--r)",
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: anchor === body ? "#fff" : "var(--ink-3)",
                  background: anchor === body ? "var(--ink)" : "var(--surface-subtle)",
                  border: "1px solid var(--hair)",
                }}
              >
                {body}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={!canAnalyze}
            onClick={startAnalysis}
            style={{
              width: "100%",
              padding: "12px 0",
              borderRadius: "var(--r)",
              fontWeight: 750,
              fontSize: 14,
              color: "#fff",
              background: !canAnalyze ? "var(--ink-4)" : "linear-gradient(180deg,#ff5b2d,var(--brand))",
              opacity: !canAnalyze ? 0.5 : 1,
              cursor: !canAnalyze ? "not-allowed" : "pointer",
              boxShadow: !canAnalyze ? "none" : "0 12px 24px -12px rgba(253,72,22,.6)",
            }}
          >
            Analyze &amp; create
          </button>
        </div>
      )}

      {step === "processing" && path === "upload" && (
        <ProcessingChecklist
          title="Verifying & validating"
          items={["Scanning document structure", "Extracting brand & indication", "Matching regulatory anchor", "Cross-referencing citations"]}
          onDone={() => setStep("success")}
        />
      )}

      {step === "processing" && path === "create" && (
        <ProcessingChecklist
          title="Analyzing brand & building preview"
          items={["Reading approved label & literature", "Drafting section outline", "Grounding claims to sources", "Building preview"]}
          onDone={() => setStep("preview")}
        />
      )}

      {step === "preview" && dossier && (
        <div style={{ padding: "30px 28px 28px" }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-.3px", margin: "0 0 4px", color: "var(--ink)" }}>
            Preview — {dossier.brandName}
          </h3>
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 16px" }}>
            {dossier.sectionsCount} sections drafted and grounded to {dossier.sourcesCount} sources.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 22, maxHeight: 240, overflowY: "auto" }}>
            {dossier.sections.map((s) => (
              <div
                key={s.id}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: "var(--r)", background: "var(--surface-subtle)", border: "1px solid var(--hair)" }}
              >
                <span style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center", background: "var(--ok-bg)", border: "1px solid var(--ok-line)", fontSize: 10, fontWeight: 800, color: "var(--ok)" }}>
                  {s.number}
                </span>
                <span style={{ fontSize: 13, fontWeight: 650, color: "var(--ink-2)", flex: 1 }}>{s.title}</span>
                <span style={{ fontSize: 9.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".03em", color: "var(--ink-4)" }}>{s.claimsCount} claims</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setStep("success")}
            style={{
              width: "100%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "12px 0",
              borderRadius: "var(--r)",
              fontWeight: 750,
              fontSize: 14,
              color: "#fff",
              background: "linear-gradient(180deg,#ff5b2d,var(--brand))",
              boxShadow: "0 12px 24px -12px rgba(253,72,22,.6)",
            }}
          >
            Looks good — finish
            <ArrowRight size={15} />
          </button>
        </div>
      )}

      {step === "success" && dossier && (
        <SuccessScreen
          headline={path === "upload" ? "Dossier verified & validated" : "Brand dossier created"}
          subtitle={
            path === "upload"
              ? `${dossier.brandName} passed all checks and is ready to use.`
              : `${dossier.brandName} is drafted, grounded, and ready for review.`
          }
          dossier={dossier}
          onClose={onClose}
          onViewDossier={() => {
            onCreated(dossier);
            onClose();
          }}
        />
      )}
    </FlowModal>
  );
}
