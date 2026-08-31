"use client";

import { useEffect, useState } from "react";
import { Loader2, Check, ArrowRight } from "lucide-react";
import { ConfettiBurst } from "@/features/dossiers/confetti-burst";
import type { BrandDossier, DossierSection, RegulatoryBody } from "@/features/dossiers/dossier-types";

/* ─── Shared building blocks for the New Brand Dossier pages ────────────────
   (/dossiers/new, /dossiers/new/path, /dossiers/new/upload,
   /dossiers/new/create) — split out of the old single-modal flow so each
   step can be its own routed page while still sharing the processing/
   success chrome and the mock-dossier generator. ─────────────────────────── */

export const REGULATORY_BODIES: RegulatoryBody[] = ["FDA", "EMA", "MHRA", "PMDA"];
export const PREVIEW_SECTIONS = ["Indication & Positioning", "Mechanism of Action", "Clinical Evidence", "Safety Profile", "Dosing & Administration", "Payer & HEOR Summary"];
export const OTHER_PRODUCT_ID = "__other__";
export const DOSSIER_CATEGORIES = ["Patient Related", "HCP Related", "Payer Related", "Commercial"];
export const TARGET_AUDIENCES = ["Trade Partner", "HCP", "Patient", "Payer"];

/* ─── Staggered "working" checklist, shared by both paths ───────────────── */
export function ProcessingChecklist({
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
    <div style={{ padding: "20px 4px 8px", textAlign: "center" }}>
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

/* ─── Success screen — confetti burst + summary, shared by both paths ──── */
export function SuccessScreen({
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
    <div style={{ padding: "16px 4px 4px", textAlign: "center", position: "relative" }}>
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

/* ─── Mock generation — builds a plausible BrandDossier from flow inputs ── */
export function buildMockDossier(input: {
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
    generatedBy: "mock",
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
