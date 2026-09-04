"use client";

import { useRef, useState } from "react";
import {
  ShieldCheck,
  Eye,
  Check,
  ChevronDown,
  Plus,
  X,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { DossierPreviewData } from "@/features/workspace/dossier-preview-modal";

export interface ResearchSourcesSectionProps {
  brandName: string;
  sourceGroundingMode: "both" | "my-sources" | "swishx-only";
  onSetSourceGroundingMode: (mode: "both" | "my-sources" | "swishx-only") => void;
  uploadedDocs: Array<{ name: string; size: string; date: string }>;
  onSetUploadedDocs: React.Dispatch<React.SetStateAction<Array<{ name: string; size: string; date: string }>>>;
  onPreviewDossier: (dossier: DossierPreviewData) => void;
  onContinue: () => void;
}

export function ResearchSourcesContent({
  brandName,
  sourceGroundingMode,
  onSetSourceGroundingMode,
  uploadedDocs,
  onSetUploadedDocs,
  onPreviewDossier,
  onContinue,
}: ResearchSourcesSectionProps) {
  const docUploadRef = useRef<HTMLInputElement>(null);
  const [dossiersOpen, setDossiersOpen] = useState(false);

  const molecule =
    brandName === "Onkavia"
      ? "relunocitinib"
      : brandName === "PulmoVax"
      ? "albuterol / budesonide"
      : brandName === "Nirvexa"
      ? "brentaxaban"
      : brandName === "Cardioxa"
      ? "levomilnacipran ER"
      : "tirzelamide";

  const prebuiltDossiers: DossierPreviewData[] = [
    {
      name: `${brandName} USA HCP Launch Dossier`,
      molecule,
      market: "USA · FDA",
      sections: 18,
      claims: 214,
      documents: [
        { name: "FDA Approved Prescribing Information (Rev. 04/2026)", citations: 112 },
        { name: "CLARITY-CV Phase III Pivotal Trial Readout", citations: 64 },
        { name: "ClinicalTrials.gov Protocol NCT04892110", citations: 18 },
      ],
      keyClaims: [
        {
          category: "Efficacy & Primary Endpoints",
          claim: "Achieved primary endpoint response in 68.4% of patients at Week 16 vs 14.2% placebo (p < 0.001).",
          citation: "FDA Approved Label §14.1 · CLARITY-CV Pivotal Readout",
        },
        {
          category: "Mechanism of Action",
          claim: "Selectively inhibits target cellular phosphorylation cascade with >100-fold specificity.",
          citation: "FDA Prescribing Information §12.1 Clinical Pharmacology",
        },
        {
          category: "Dosing & Administration",
          claim: "Once-daily oral administration (50mg tablet) with or without food.",
          citation: "FDA Approved Label §2.1 Dosage & Administration",
        },
      ],
    },
    {
      name: `${brandName} India HCP Clinical Dossier`,
      molecule,
      market: "India · CDSCO",
      sections: 16,
      claims: 186,
      documents: [
        { name: "CDSCO Approved Package Insert & Product Monograph", citations: 96 },
        { name: "India Multi-Center Clinical Evaluation Sub-study", citations: 58 },
        { name: "National Formulary Clinical Summary", citations: 32 },
      ],
      keyClaims: [
        {
          category: "Clinical Evaluation",
          claim: "Clinically validated in adult populations across 14 tertiary care multi-speciality centers.",
          citation: "CDSCO Approved Monograph §7.2 Clinical Safety",
        },
        {
          category: "Long-term Tolerability",
          claim: "Demonstrated durable tolerability and consistent safety profile over 52 weeks.",
          citation: "India Multi-Center Evaluation Trial Report 2025",
        },
        {
          category: "Administration & Packaging",
          claim: "Standardized once-daily regimen with blister strip packaging for tropical stability.",
          citation: "CDSCO Package Insert §4 Dosage Guidelines",
        },
      ],
    },
    {
      name: `${brandName} Global Distributor Dossier`,
      molecule,
      market: "Global · Distributors",
      sections: 14,
      claims: 128,
      documents: [
        { name: "Global Commercial Product Specification & Logistics Protocol", citations: 76 },
        { name: "Global Trade Access, SKU Packaging & Storage Dossier", citations: 52 },
      ],
      keyClaims: [
        {
          category: "Storage & Stability",
          claim: "Room-temperature stable (15°C to 25°C) with 24-month certified shelf life.",
          citation: "Global Quality & Stability Summary §3.4",
        },
        {
          category: "Packaging & Serialization",
          claim: "Standardized tamper-evident blister packaging with GS1 DataMatrix 2D serialization.",
          citation: "Commercial Distribution Specification Rev. 2026",
        },
        {
          category: "Market Authorization",
          claim: "Full regulatory clearance across 28 export territories with active master files.",
          citation: "Global Regulatory Affairs Summary 2026",
        },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {/* 3 Grounding Options */}
      <div className="space-y-2">
        <span className="text-label font-bold uppercase tracking-wider text-ink-3">
          Select Grounding Source Mode
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            {
              id: "both" as const,
              title: "Both SwishX dossiers and My attachments",
              desc: "Combines verified regulatory label data with your uploaded attachments.",
            },
            {
              id: "my-sources" as const,
              title: "Only My sources & attachments",
              desc: "Strictly uses your files; ignores the prebuilt regulatory dossier.",
            },
            {
              id: "swishx-only" as const,
              title: "Only SwishX approved dossiers",
              desc: "Strictly uses verified SmPC and FDA prescribing label packages.",
            },
          ].map((opt) => {
            const isSelected = sourceGroundingMode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSetSourceGroundingMode(opt.id)}
                className={cn(
                  "p-3.5 rounded-[16px] border text-left transition cursor-pointer flex flex-col justify-between min-h-[90px]",
                  isSelected
                    ? "border-2 border-brand bg-card text-ink shadow-2xs ring-2 ring-brand/15"
                    : "border-hair-2 bg-card hover:border-hair-3 hover:bg-canvas"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-body-lg leading-snug">{opt.title}</div>
                  <div
                    className={cn(
                      "size-4.5 rounded-full border-2 grid place-items-center shrink-0 mt-0.5",
                      isSelected
                        ? "border-brand bg-brand text-white"
                        : "border-hair-3"
                    )}
                  >
                    {isSelected && <Check className="size-3 stroke-[3]" />}
                  </div>
                </div>
                <div className="text-label text-ink-3 mt-1.5 leading-snug">{opt.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Verified dossiers. Reference material, not a decision, so it sits
          BELOW the choice and starts collapsed. */}
      <div className="rounded-panel bg-[#f4f6f3] border border-[#e2e8e3]">
        <button
          type="button"
          onClick={() => setDossiersOpen((v) => !v)}
          aria-expanded={dossiersOpen}
          className="flex w-full cursor-pointer items-center justify-between gap-2 p-4 text-left"
        >
          <div className="flex min-w-0 items-center gap-2">
            <ShieldCheck className="size-4 shrink-0 text-ok" />
            <span className="text-body font-extrabold text-ink truncate">
              Verified SwishX Regulatory Dossiers ({brandName || "Brand"})
            </span>
            <span className="shrink-0 text-caption font-bold text-ok bg-ok-bg/70 border border-ok-line px-2 py-0.2 rounded-full">
              SmPC &amp; Label Active
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden text-label text-ink-3 sm:inline">
              {dossiersOpen
                ? "Click View to inspect full claims & sources"
                : `${prebuiltDossiers.length} verified dossiers`}
            </span>
            <ChevronDown className={cn("size-4 text-ink-3 transition-transform duration-200", dossiersOpen && "rotate-180")} />
          </div>
        </button>

        {dossiersOpen && (
          <div className="px-4 pb-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {prebuiltDossiers.map((dossier, idx) => (
              <div
                key={idx}
                className="p-3 rounded-control bg-card border border-[#dce3de] flex flex-col justify-between shadow-2xs gap-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-caption font-extrabold uppercase tracking-wide text-brand-deep bg-tint px-1.5 py-0.2 rounded border border-tint-line">
                      {dossier.market}
                    </span>
                    <span className="text-caption font-bold text-ok bg-ok-bg px-1.5 py-0.2 rounded">
                      {dossier.claims} claims
                    </span>
                  </div>
                  <div className="text-body font-bold text-ink leading-snug line-clamp-1">
                    {dossier.name}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onPreviewDossier(dossier)}
                  className="mt-1 flex items-center justify-center gap-1.5 w-full py-1.5 rounded-chip bg-[#f0f4f1] hover:bg-tint text-brand-deep text-label font-bold border border-[#d8e0da] transition-colors cursor-pointer"
                >
                  <Eye className="size-3.5 text-brand" />
                  <span>View</span>
                </button>
              </div>
            ))}
          </div>
          </div>
        )}
      </div>

      {/* Uploaded Documents Context (Shown when Option 1 or 2 is selected) */}
      {(sourceGroundingMode === "both" || sourceGroundingMode === "my-sources") && (
        <div className="space-y-2 pt-2 border-t border-hair animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-label font-bold uppercase tracking-wider text-ink-3">
              My Uploaded Documents &amp; Briefs ({uploadedDocs.length})
            </span>
            <button
              type="button"
              onClick={() => docUploadRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-label font-bold text-brand hover:underline cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Add more files</span>
            </button>
          </div>

          <input
            ref={docUploadRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                const newFiles = Array.from(e.target.files).map((f) => ({
                  name: f.name,
                  size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
                  date: "Just now",
                }));
                onSetUploadedDocs((prev) => [...prev, ...newFiles]);
              }
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {uploadedDocs.map((doc, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 p-2.5 rounded-[12px] bg-card border border-hair-2 text-body"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="size-4 text-brand shrink-0" />
                  <span className="font-semibold text-ink truncate">{doc.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-caption text-ink-3">{doc.size}</span>
                  <button
                    type="button"
                    onClick={() => onSetUploadedDocs((prev) => prev.filter((_, i) => i !== idx))}
                    className="grid size-5 place-items-center rounded-full text-ink-3 hover:bg-black/5 hover:text-danger transition-colors cursor-pointer"
                    aria-label="Remove"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Continue action */}
      <div className="pt-2 flex justify-end">
        <Button
          size="sm"
          variant="secondary"
          onClick={onContinue}
          className="text-body font-bold gap-1 cursor-pointer"
        >
          <span>Save &amp; Continue</span>
          <ArrowRight className="size-3" />
        </Button>
      </div>
    </div>
  );
}
