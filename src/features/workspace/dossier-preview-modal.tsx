"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ShieldCheck,
  FileText,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Layers,
  Sparkles,
  AlertCircle,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DossierPreviewData {
  name: string;
  molecule: string;
  market: string;
  sections: number;
  claims: number;
  documents: Array<{ name: string; citations: number; type?: string }>;
  keyClaims?: Array<{ category: string; claim: string; citation: string }>;
  indication?: string;
}

export function DossierPreviewModal({
  dossier,
  onClose,
}: {
  dossier: DossierPreviewData | null;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!dossier) return null;

  const claimsList = dossier.keyClaims || [
    {
      category: "Efficacy & Primary Endpoints",
      claim: "Achieved PASI 90 skin clearance in 68.4% of patients at Week 16 vs 14.2% placebo (p < 0.001).",
      citation: "FDA Approved Label §14.1 · CLARITY-CV Pivotal Readout",
    },
    {
      category: "Mechanism of Action",
      claim: "Selectively inhibits target cellular phosphorylation cascade with >100-fold specificity over related kinases.",
      citation: "FDA Prescribing Information §12.1 Clinical Pharmacology",
    },
    {
      category: "Dosing & Administration",
      claim: "Once-daily oral administration (50mg tablet) with or without food. No initial titration required.",
      citation: "FDA Approved Label §2.1 Dosage & Administration",
    },
    {
      category: "Safety & Tolerability",
      claim: "Adverse event rates comparable to placebo; monitor hepatic transaminases prior to initiation and periodically.",
      citation: "FDA Approved Label §5.1 Warnings & Precautions",
    },
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 sm:p-6 lg:p-8 animate-in fade-in duration-150"
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, width: "100vw", height: "100vh" }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative flex h-[88vh] max-h-[840px] w-full max-w-[920px] flex-col rounded-[24px] border border-black/10 bg-white shadow-2xl overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-black/10 bg-[#fafbfa] px-7 py-5 shrink-0">
          <div className="flex items-start gap-3.5">
            <div className="grid size-11 place-items-center rounded-2xl bg-[var(--tint)] text-[var(--brand-deep)] border border-[var(--tint-line)] shrink-0 shadow-2xs">
              <ShieldCheck className="size-6 text-[var(--brand)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--brand-deep)] bg-[var(--tint)] px-2 py-0.5 rounded-md border border-[var(--tint-line)]">
                  {dossier.market}
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="size-3" /> Verified SmPC & Label
                </span>
              </div>
              <h2 className="text-[19px] font-[850] text-[var(--ink)] mt-1 tracking-tight">
                {dossier.name}
              </h2>
              <p className="text-[12.5px] text-[var(--ink-muted)] italic">
                Active Molecule: {dossier.molecule} · {dossier.sections} Sections · {dossier.claims} Approved Claims
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-full text-[var(--ink-muted)] hover:bg-black/5 hover:text-[var(--ink)] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-7 space-y-6">
          {/* Section 1: Attached Regulatory Source Documents */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[13.5px] font-[850] text-[var(--ink)] flex items-center gap-2">
                <BookOpen className="size-4 text-[var(--brand)]" />
                <span>Attached Regulatory Documents & Cited Literature ({dossier.documents.length})</span>
              </h3>
              <span className="text-[11px] text-[var(--ink-muted)]">Citations cross-referenced</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {dossier.documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-[14px] bg-[#f9faf9] border border-black/8 flex items-start justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <FileText className="size-4 text-[var(--brand)] shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-bold text-[var(--ink)] leading-snug line-clamp-2">
                        {doc.name}
                      </div>
                      <div className="text-[11px] text-[var(--ink-muted)] mt-0.5">
                        Approved Regulatory Label
                      </div>
                    </div>
                  </div>
                  <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                    {doc.citations} citations
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Approved Claims Sample */}
          <div className="space-y-3 pt-4 border-t border-black/8">
            <div className="flex items-center justify-between">
              <h3 className="text-[13.5px] font-[850] text-[var(--ink)] flex items-center gap-2">
                <Sparkles className="size-4 text-[var(--brand)]" />
                <span>Approved Clinical Claims & Evidence Summary</span>
              </h3>
              <span className="text-[11px] font-bold text-[var(--brand-deep)] bg-[var(--tint)] px-2 py-0.5 rounded-full">
                {dossier.claims} total claims available
              </span>
            </div>

            <div className="space-y-2.5">
              {claimsList.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-[16px] border border-black/8 bg-white space-y-1.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--brand-deep)]">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                      ✓ MLR Approved
                    </span>
                  </div>
                  <p className="text-[13px] font-medium text-[var(--ink)] leading-relaxed">
                    "{item.claim}"
                  </p>
                  <div className="text-[11px] text-[var(--ink-muted)] flex items-center gap-1.5">
                    <span className="font-semibold text-[var(--ink-2)]">Citation:</span>
                    <span>{item.citation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-black/10 bg-[#fafbfa] px-7 py-4 shrink-0">
          <span className="text-[12px] text-[var(--ink-muted)]">
            This dossier is ready to ground scenes, copy, and citations for your campaign.
          </span>
          <Button
            size="sm"
            variant="primary"
            onClick={onClose}
            className="px-5 font-bold cursor-pointer"
          >
            Close Preview
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
