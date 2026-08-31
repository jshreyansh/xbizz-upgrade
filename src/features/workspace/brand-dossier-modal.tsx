"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Building2,
  Check,
  ChevronRight,
  FileText,
  FolderPlus,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  X,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { cn } from "@/lib/cn";

export interface BrandItem {
  id: string;
  name: string;
  genericName: string;
  therapyAreas: string[];
  hasDossier: boolean;
  dossierIds?: string[];
}

export interface DossierItem {
  id: string;
  brandId: string;
  name: string;
  molecule: string;
  market: string;
  sections: number;
  claims: number;
  heldOut: number;
  avatarBg: string;
  skeletonWidths: number[];
  isSample?: boolean;
  documents?: Array<{ name: string; citations: number }>;
}

export const INITIAL_BRANDS: BrandItem[] = [
  {
    id: "velmora",
    name: "Velmora",
    genericName: "tirzelamide",
    therapyAreas: ["Dermatology", "Cardiology"],
    hasDossier: true,
    dossierIds: ["velmora-commercial", "velmora-smpc", "velmora-heor"],
  },
  {
    id: "onkavia",
    name: "Onkavia",
    genericName: "relunocitinib",
    therapyAreas: ["Oncology"],
    hasDossier: true,
    dossierIds: ["onkavia-ema", "onkavia-fda"],
  },
  {
    id: "nirvexa",
    name: "Nirvexa",
    genericName: "brentaxaban",
    therapyAreas: ["Immunology"],
    hasDossier: true,
    dossierIds: ["nirvexa-mhra", "nirvexa-fda"],
  },
  {
    id: "cardioxa",
    name: "Cardioxa",
    genericName: "levomilnacipran ER",
    therapyAreas: ["Cardiology"],
    hasDossier: true,
    dossierIds: ["cardioxa-sample"],
  },
  {
    id: "pulmovax",
    name: "PulmoVax",
    genericName: "albuterol / budesonide",
    therapyAreas: ["Respiratory"],
    hasDossier: true,
    dossierIds: ["pulmovax-sample"],
  },
  { id: "3d", name: "3D", genericName: "Diclofenac", therapyAreas: ["Rheumatology & Musculoskeletal"], hasDossier: false },
  { id: "3d-flam", name: "3D Flam", genericName: "Diclofenac", therapyAreas: ["Rheumatology & Musculoskeletal"], hasDossier: false },
  { id: "3d-plus", name: "3D-Plus", genericName: "Diclofenac + Paracetamol", therapyAreas: ["Rheumatology & Musculoskeletal"], hasDossier: false },
  { id: "abd-1", name: "ABD 1", genericName: "Abacavir + Dolutegravir", therapyAreas: ["Anti-infectives & Antimicrobials"], hasDossier: false },
  { id: "dermora", name: "Dermora", genericName: "dermoclizine fumarate", therapyAreas: ["Dermatology"], hasDossier: false },
  { id: "pulmavia", name: "Pulmavia", genericName: "pulmavatinib citrate", therapyAreas: ["Respiratory"], hasDossier: false },
  { id: "renalis", name: "Renalis", genericName: "renalisertib sodium", therapyAreas: ["Nephrology & Urology"], hasDossier: false },
];

export const DOSSIERS: Record<string, DossierItem> = {
  "velmora-commercial": {
    id: "velmora-commercial",
    brandId: "velmora",
    name: "Velmora Commercial Launch Dossier",
    molecule: "tirzelamide",
    market: "🇺🇸 US · FDA",
    sections: 18,
    claims: 214,
    heldOut: 0,
    avatarBg: "linear-gradient(140deg,#4f83ff,#1d4ed8)",
    skeletonWidths: [88, 72, 94, 60, 80],
    documents: [
      { name: "FDA Approved Prescribing Information (Rev. 04/2026)", citations: 112 },
      { name: "CLARITY-CV Phase III Pivotal Readout (NEJM 2025)", citations: 64 },
      { name: "Global HEOR Budget Impact & QALY Analysis", citations: 20 },
      { name: "ClinicalTrials.gov Protocol NCT04892110", citations: 18 },
    ],
  },
  "velmora-smpc": {
    id: "velmora-smpc",
    brandId: "velmora",
    name: "Velmora EU Summary of Product Characteristics (SmPC)",
    molecule: "tirzelamide",
    market: "🇪🇺 EU · EMA",
    sections: 19,
    claims: 186,
    heldOut: 0,
    avatarBg: "linear-gradient(140deg,#22c07a,#12784a)",
    skeletonWidths: [92, 65, 84, 55, 78],
    documents: [
      { name: "EMA Approved Summary of Product Characteristics (SmPC)", citations: 104 },
      { name: "EU Multi-Center CLARITY-EU Phase III Sub-study", citations: 52 },
      { name: "European HTA Joint Clinical Assessment Submission", citations: 30 },
    ],
  },
  "velmora-heor": {
    id: "velmora-heor",
    brandId: "velmora",
    name: "Velmora HEOR & Value Evidence Dossier",
    molecule: "tirzelamide",
    market: "🌐 Global · HEOR",
    sections: 14,
    claims: 128,
    heldOut: 0,
    avatarBg: "linear-gradient(140deg,#f59e0b,#d97706)",
    skeletonWidths: [80, 85, 70, 90, 65],
    documents: [
      { name: "Global Health Economics & QALY Impact Dossier", citations: 76 },
      { name: "30-Day Hospital Readmission Reduction Health Economic Model", citations: 52 },
    ],
  },
  "onkavia-ema": {
    id: "onkavia-ema",
    brandId: "onkavia",
    name: "Onkavia Clinical Reference Dossier",
    molecule: "relunocitinib",
    market: "🇪🇺 EU · EMA",
    sections: 19,
    claims: 188,
    heldOut: 0,
    avatarBg: "linear-gradient(140deg,#22c07a,#12784a)",
    skeletonWidths: [92, 65, 84, 55, 78],
    documents: [
      { name: "EMA Summary of Product Characteristics (SmPC)", citations: 96 },
      { name: "EMBRACE-3 Pivotal Trial Readout (Lancet Oncology)", citations: 58 },
      { name: "EU HEOR Relative Effectiveness Dossier", citations: 34 },
    ],
  },
  "onkavia-fda": {
    id: "onkavia-fda",
    brandId: "onkavia",
    name: "Onkavia US Prescribing Dossier",
    molecule: "relunocitinib",
    market: "🇺🇸 US · FDA",
    sections: 17,
    claims: 172,
    heldOut: 0,
    avatarBg: "linear-gradient(140deg,#4f83ff,#1d4ed8)",
    skeletonWidths: [85, 70, 90, 65, 75],
    documents: [
      { name: "FDA Prescribing Information §14 Clinical Studies", citations: 88 },
      { name: "US Oncology Core Visual Claims Library", citations: 54 },
      { name: "NCCN Clinical Practice Guidelines in Oncology Review", citations: 30 },
    ],
  },
  "nirvexa-mhra": {
    id: "nirvexa-mhra",
    brandId: "nirvexa",
    name: "Nirvexa Regulatory Launch Dossier",
    molecule: "brentaxaban",
    market: "🇬🇧 UK · MHRA",
    sections: 16,
    claims: 142,
    heldOut: 0,
    avatarBg: "linear-gradient(140deg,#a855f7,#7e22ce)",
    skeletonWidths: [80, 88, 65, 75, 90],
    documents: [
      { name: "MHRA Assessment Report & Great Britain Authorisation", citations: 74 },
      { name: "NICE Single Technology Appraisal (STA) Submission", citations: 48 },
      { name: "Pivotal TARGET-RA Phase III Study Readout", citations: 20 },
    ],
  },
  "nirvexa-fda": {
    id: "nirvexa-fda",
    brandId: "nirvexa",
    name: "Nirvexa US Commercial Claims Library",
    molecule: "brentaxaban",
    market: "🇺🇸 US · FDA",
    sections: 15,
    claims: 136,
    heldOut: 0,
    avatarBg: "linear-gradient(140deg,#4f83ff,#1d4ed8)",
    skeletonWidths: [82, 74, 86, 68, 70],
    documents: [
      { name: "FDA Approved Label (Full Prescribing Info)", citations: 82 },
      { name: "US Rheumatology Advisory Board Consensus", citations: 34 },
      { name: "ACR Guidelines Evidence Synthesis", citations: 20 },
    ],
  },
  "cardioxa-sample": {
    id: "cardioxa-sample",
    brandId: "cardioxa",
    name: "Cardioxa Cardiology Evidence Brief",
    molecule: "levomilnacipran ER",
    market: "🇺🇸 US · FDA",
    sections: 14,
    claims: 96,
    heldOut: 0,
    avatarBg: "linear-gradient(140deg,#ef4444,#b91c1c)",
    skeletonWidths: [78, 82, 60, 70, 85],
    documents: [
      { name: "FDA Approved Prescribing Information", citations: 58 },
      { name: "Heart Failure Association Clinical Review", citations: 38 },
    ],
  },
  "pulmovax-sample": {
    id: "pulmovax-sample",
    brandId: "pulmovax",
    name: "PulmoVax Respiratory Core Dossier",
    molecule: "albuterol / budesonide",
    market: "🇺🇸 US · FDA",
    sections: 15,
    claims: 110,
    heldOut: 0,
    avatarBg: "linear-gradient(140deg,#06b6d4,#0891b2)",
    skeletonWidths: [85, 75, 90, 65, 80],
    documents: [
      { name: "FDA Approved Label & Inhaler Instructions", citations: 68 },
      { name: "MANDALA Phase III Pivotal Trial Readout", citations: 42 },
    ],
  },
};

interface BrandDossierModalProps {
  open: boolean;
  onClose: () => void;
  onSelectDossier?: (brandId: string, dossierId: string) => void;
}

export function BrandDossierModal({ open, onClose, onSelectDossier }: BrandDossierModalProps) {
  const sourcePayload = useWorkspaceStore((s) => s.sourcePayload);
  const setSourcePayload = useWorkspaceStore((s) => s.setSourcePayload);
  const setSourceType = useWorkspaceStore((s) => s.setSourceType);
  const setVideoSubStage = useWorkspaceStore((s) => s.setVideoSubStage);
  const setView = useWorkspaceStore((s) => s.setView);

  // Derive initial brand & dossier
  const initialDossier = DOSSIERS[sourcePayload?.dossierId || "velmora-commercial"] || DOSSIERS["velmora-commercial"];
  const [selectedBrandId, setSelectedBrandId] = useState<string>(initialDossier.brandId);
  const [selectedDossierId, setSelectedDossierId] = useState<string>(initialDossier.id);
  const [brandSelectorOpen, setBrandSelectorOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedBrand = useMemo(() => {
    return INITIAL_BRANDS.find((b) => b.id === selectedBrandId) || INITIAL_BRANDS[0];
  }, [selectedBrandId]);

  const availableDossiers = useMemo(() => {
    return Object.values(DOSSIERS).filter((d) => d.brandId === selectedBrandId);
  }, [selectedBrandId]);

  const filteredBrands = useMemo(() => {
    const q = brandSearch.toLowerCase().trim();
    if (!q) return INITIAL_BRANDS;
    return INITIAL_BRANDS.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.genericName.toLowerCase().includes(q) ||
        b.therapyAreas.some((t) => t.toLowerCase().includes(q))
    );
  }, [brandSearch]);

  if (!open || !mounted) return null;

  const handleStartProject = () => {
    if (!selectedDossierId) return;
    setSourceType("dossier");
    setSourcePayload({ dossierId: selectedDossierId });
    if (onSelectDossier) {
      onSelectDossier(selectedBrandId, selectedDossierId);
    }
    setView("create");
    setVideoSubStage("intake");
    onClose();
  };

  const handleSelectBrand = (brand: BrandItem) => {
    setSelectedBrandId(brand.id);
    setBrandSelectorOpen(false);
    setBrandSearch("");
    if (brand.hasDossier && brand.dossierIds && brand.dossierIds.length > 0) {
      setSelectedDossierId(brand.dossierIds[0]);
    } else {
      setSelectedDossierId("");
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 backdrop-blur-md p-3 sm:p-6 lg:p-8 animate-in fade-in duration-200"
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, width: "100vw", height: "100vh" }}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative flex h-[94vh] max-h-[960px] w-full max-w-[1360px] flex-col rounded-[28px] border border-black/10 bg-[#fafbfa] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] bg-white px-8 py-5">
          <div className="flex items-center gap-3.5">
            <div className="flex size-8 items-center justify-center rounded-full bg-[var(--brand)] text-[13px] font-bold text-white shadow-xs">
              1
            </div>
            <div>
              <div className="text-[10.5px] font-extrabold uppercase tracking-wider text-[var(--ink-muted)]">
                Starter Step
              </div>
              <h2 className="text-[19px] font-[850] text-[var(--ink)] tracking-tight">
                Select Brand &amp; Dossier
              </h2>
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Selected Brand Banner */}
          <div className="rounded-[22px] border-2 border-[var(--brand)]/20 bg-gradient-to-r from-[var(--tint)]/50 to-white p-5 shadow-2xs">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="grid size-12 place-items-center rounded-xl bg-white border border-[var(--brand)]/30 text-[14px] font-extrabold text-[var(--brand-deep)] shadow-2xs shrink-0">
                  {selectedBrand.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--brand-deep)]">
                      Selected Brand
                    </span>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.2 text-[9.5px] font-bold">
                      {selectedBrand.hasDossier ? `✓ ${availableDossiers.length} Dossiers on file` : "No dossier yet"}
                    </span>
                  </div>
                  <div className="text-[17px] font-[850] text-[var(--ink)] truncate">
                    {selectedBrand.name}{" "}
                    <span className="text-[13.5px] font-normal text-[var(--ink-muted)] italic">
                      ({selectedBrand.genericName})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {selectedBrand.therapyAreas.map((area) => (
                      <span
                        key={area}
                        className="rounded-md bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-[var(--ink-2)]"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setBrandSelectorOpen(!brandSelectorOpen)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 bg-white hover:border-[var(--brand)] px-3.5 py-2.5 text-[12.5px] font-bold text-[var(--brand-deep)] shadow-2xs hover:bg-[var(--tint)]/40 transition-colors cursor-pointer shrink-0"
              >
                <Building2 className="size-4 text-[var(--brand)]" />
                <span>{brandSelectorOpen ? "Close list" : "Change brand"}</span>
              </button>
            </div>

            {/* Brand Dropdown Search & List */}
            {brandSelectorOpen && (
              <div className="mt-4 pt-4 border-t border-[var(--line)] space-y-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 size-4 text-[var(--ink-muted)]" />
                  <input
                    type="text"
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    placeholder="Search brand name, generic name, or therapy area..."
                    className="w-full rounded-xl border border-black/10 bg-white pl-10 pr-3.5 py-2.5 text-[13px] focus:outline-none focus:border-[var(--brand)] shadow-2xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {filteredBrands.map((brand) => {
                    const isCurrent = brand.id === selectedBrandId;
                    return (
                      <button
                        key={brand.id}
                        type="button"
                        onClick={() => handleSelectBrand(brand)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl border text-left transition-colors cursor-pointer",
                          isCurrent
                            ? "border-[var(--brand)] bg-white ring-1 ring-[var(--brand)]/20"
                            : "border-black/5 bg-white/70 hover:bg-white hover:border-black/15"
                        )}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="text-[13px] font-bold text-[var(--ink)] truncate">
                            {brand.name}
                          </div>
                          <div className="text-[11px] text-[var(--ink-muted)] truncate">
                            {brand.genericName}
                          </div>
                        </div>
                        {brand.hasDossier ? (
                          <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                            {brand.dossierIds?.length || 1} dossiers
                          </span>
                        ) : (
                          <span className="text-[9.5px] font-medium text-[var(--ink-muted)] shrink-0">
                            No dossier
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Dossiers Selection Section (2-Column Grid on Wide Screens) */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-extrabold uppercase tracking-wider text-[var(--ink-muted)] flex items-center gap-1.5">
                <FileText className="size-4 text-[var(--brand)]" />
                Available Dossiers &amp; Regulatory Sources
              </span>
              {availableDossiers.length > 0 && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full">
                  ✓ {availableDossiers.length} Options Available · Pick One
                </span>
              )}
            </div>

            {availableDossiers.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {availableDossiers.map((dossier) => {
                  const isSelected = selectedDossierId === dossier.id;
                  return (
                    <div
                      key={dossier.id}
                      onClick={() => setSelectedDossierId(dossier.id)}
                      className={cn(
                        "group relative rounded-[22px] border-2 p-5 transition-all duration-200 cursor-pointer shadow-2xs flex flex-col justify-between",
                        isSelected
                          ? "border-[var(--brand)] bg-white ring-2 ring-[var(--brand)]/15 shadow-sm"
                          : "border-black/[0.08] bg-white/80 hover:border-black/20 hover:bg-white"
                      )}
                    >
                      <div>
                        {/* Top Row: Radio & Name */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div
                              className={cn(
                                "mt-0.5 size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                                isSelected
                                  ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                                  : "border-black/25 group-hover:border-black/40"
                              )}
                            >
                              {isSelected && <Check className="size-3 stroke-[3]" />}
                            </div>

                            <div className="min-w-0">
                              <div className="text-[15px] font-[850] text-[var(--ink)] leading-snug">
                                {dossier.name}
                              </div>
                              <div className="text-[12px] text-[var(--ink-muted)] italic mt-0.5">
                                {dossier.molecule}
                              </div>
                            </div>
                          </div>

                          <span className="inline-flex items-center gap-1 rounded-md bg-black/5 px-2.5 py-1 text-[11px] font-extrabold text-[var(--ink-2)] shrink-0">
                            {dossier.market}
                          </span>
                        </div>

                        {/* Dossier Structure Skeleton Bar */}
                        <div className="mt-3.5 pt-3 border-t border-black/[0.05]">
                          <div className="flex items-center justify-between text-[11px] text-[var(--ink-muted)] mb-1.5">
                            <span className="font-semibold">Dossier Structure</span>
                            <span className="font-bold text-[var(--ink-2)]">
                              {dossier.sections} sections · {dossier.claims} approved claims
                            </span>
                          </div>
                          <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden flex gap-0.5">
                            {dossier.skeletonWidths.map((w, idx) => (
                              <div
                                key={idx}
                                style={{ width: `${w}%` }}
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  isSelected ? "bg-[var(--brand)]/70" : "bg-black/20"
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Attached Documents Citations */}
                      {dossier.documents && dossier.documents.length > 0 && (
                        <div className="mt-3.5 pt-2 space-y-1.5">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                            Attached Clinical Documents &amp; Labels ({dossier.documents.length})
                          </div>
                          <div className="space-y-1.5">
                            {dossier.documents.slice(0, 3).map((doc, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between gap-2 rounded-lg bg-[#fafbf9] border border-black/5 px-2.5 py-1 text-[11.5px]"
                              >
                                <span className="truncate text-[var(--ink-2)] font-medium">
                                  📄 {doc.name}
                                </span>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded shrink-0">
                                  {doc.citations} citations
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty state if brand has no dossier */
              <div className="rounded-[24px] border-2 border-dashed border-black/15 bg-white p-10 text-center space-y-3">
                <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
                  <FolderPlus className="size-6" />
                </div>
                <div className="max-w-[420px] mx-auto">
                  <h4 className="text-[16px] font-[850] text-[var(--ink)]">
                    No dossier found for {selectedBrand.name}
                  </h4>
                  <p className="text-[12.5px] text-[var(--ink-muted)] mt-1">
                    Upload FDA prescribing labels or clinical trial protocols to initialize an approved dossier.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  className="gap-2 text-[12.5px] font-bold"
                  onClick={() => {
                    setSelectedDossierId("velmora-commercial");
                  }}
                >
                  <Plus className="size-3.5" />
                  <span>Upload or Create for {selectedBrand.name}</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-[var(--line)] bg-white px-8 py-4">
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] text-[var(--ink-muted)]">
              {selectedDossierId ? (
                <span className="font-semibold text-[var(--ink)] flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-emerald-600" />
                  {DOSSIERS[selectedDossierId]?.name || "Dossier Selected"}
                </span>
              ) : (
                "Please select a brand dossier to continue"
              )}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={onClose} className="px-4">
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!selectedDossierId}
              onClick={handleStartProject}
              className="gap-2 font-bold px-5 shadow-sm"
            >
              <span>Start Project</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
