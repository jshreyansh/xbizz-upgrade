"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Building2,
  Check,
  FileText,
  FolderPlus,
  Plus,
  Search,
  ShieldCheck,
  X,
  ArrowRight,
  ArrowLeft,
  Stethoscope,
  HeartHandshake,
  Briefcase,
  Users,
  Layers,
  Monitor,
  Smartphone,
  Square,
  FileSpreadsheet,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SwishXMark } from "@/components/ui/swishx-mark";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { LogoMark } from "@/components/ui/logo-mark";
import { cn } from "@/lib/cn";
import type { Audience } from "@/types/content";

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
  { id: "abd-1", name: "ABD 1", genericName: "Abacavir + Dolutegravir", therapyAreas: ["Anti-infectives"], hasDossier: false },
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

const QUICK_DOSSIER_GRADIENTS = [
  "linear-gradient(140deg,#ff7a3d,#c9310a)",
  "linear-gradient(140deg,#4f83ff,#1d4ed8)",
  "linear-gradient(140deg,#9b6bff,#5b21b6)",
  "linear-gradient(140deg,#22c07a,#12784a)",
];

function createQuickDossier(brand: BrandItem, brief: string): DossierItem {
  const id = `${brand.id}-quick-${Date.now().toString(36)}`;
  const gradient = QUICK_DOSSIER_GRADIENTS[Math.floor(Math.random() * QUICK_DOSSIER_GRADIENTS.length)];
  return {
    id,
    brandId: brand.id,
    name: `${brand.name} Marketing & Branding Dossier`,
    molecule: brand.genericName,
    market: "🌐 Global · Marketing",
    sections: 6,
    claims: 24,
    heldOut: 0,
    avatarBg: gradient,
    skeletonWidths: [82, 68, 90, 60, 76, 70],
    isSample: false,
    documents: brief.trim() ? [{ name: `Brief: ${brief.trim().slice(0, 70)}`, citations: 0 }] : undefined,
  };
}

const AUDIENCE_OPTIONS: Array<{ id: Audience; title: string; subtitle: string; icon: any }> = [
  { id: "HCP", title: "HCPs & Specialists", subtitle: "Physicians, Specialists, Key Opinion Leaders, Hospitalists", icon: Stethoscope },
  { id: "Patient", title: "Patients & Caregivers", subtitle: "Disease understanding, treatment adherence, QoL", icon: HeartHandshake },
  { id: "Field team", title: "Field Force & Reps", subtitle: "Detailing aids, objection handling, MSL decks", icon: Briefcase },
  { id: "Payer", title: "Payers & Formularies", subtitle: "Health economics, QALY impact, budget models", icon: Building2 },
  { id: "Consumer", title: "Consumers & OTC", subtitle: "General public, symptom recognition, brand awareness", icon: Users },
];

const VIDEO_SIZE_OPTIONS = [
  { id: "16:9", ratio: "16:9", label: "Landscape Master", desc: "1920×1080 · Desktop, Congress Displays, Web Portals", icon: Monitor },
  { id: "9:16", ratio: "9:16", label: "Vertical Reel", desc: "1080×1920 · Mobile Briefs, WhatsApp, Social Digest", icon: Smartphone },
  { id: "1:1", ratio: "1:1", label: "Square Feed", desc: "1080×1080 · iPad Detailing, Multi-Panel Carousel", icon: Square },
  { id: "4:5", ratio: "4:5", label: "Portrait Social", desc: "1080×1350 · Professional Medical Networks", icon: Layers },
];

const INFOGRAPHIC_SIZE_OPTIONS = [
  { id: "3:4", ratio: "3:4", label: "Tablet Detailer", desc: "1536×2048 · iPad Detailing, Field Aid, Clinical Summary", icon: Smartphone },
  { id: "16:9", ratio: "16:9", label: "Landscape Slide", desc: "1920×1080 · Slide Decks, Congress Scientific Panels", icon: Monitor },
  { id: "A4", ratio: "A4", label: "Print Document", desc: "2480×3508 · Print-Ready CMYK Journal Leave-Behind", icon: FileSpreadsheet },
  { id: "9:16", ratio: "9:16", label: "Mobile Digest", desc: "1080×1920 · Digital Leave-Behind for Smartphones", icon: Smartphone },
];

const CLINICAL_TOPIC_OPTIONS = [
  { id: "efficacy", label: "Efficacy & Clinical Readout", detail: "Primary endpoints, PASI 90 / MACE reduction, responder rates" },
  { id: "moa", label: "Mechanism of Action (MoA)", detail: "Receptor binding, phosphorylation blockade, cellular cascade" },
  { id: "safety", label: "Safety & Tolerability Profile", detail: "Adverse events, hepatic/renal cut-offs, black-box warnings" },
  { id: "dosing", label: "Dosing & Administration", detail: "Once-daily oral regimen, titration schedule, missed dose guidance" },
  { id: "qol", label: "Patient Compliance & QoL", detail: "Convenience vs injections, patient-reported outcome scores" },
  { id: "head-to-head", label: "Comparative Head-to-Head", detail: "Non-inferiority and superiority metrics vs Standard of Care" },
];

interface BrandDossierModalProps {
  open: boolean;
  onClose: () => void;
  onSelectDossier?: (brandId: string, dossierId: string) => void;
}

export function BrandDossierModal({ open, onClose, onSelectDossier }: BrandDossierModalProps) {
  const assetType = useWorkspaceStore((s) => s.assetType);
  const setSourcePayload = useWorkspaceStore((s) => s.setSourcePayload);
  const setSourceType = useWorkspaceStore((s) => s.setSourceType);
  const setVideoSubStage = useWorkspaceStore((s) => s.setVideoSubStage);
  const setView = useWorkspaceStore((s) => s.setView);
  const setAudienceStore = useWorkspaceStore((s) => s.setAudience);
  const setFormatStore = useWorkspaceStore((s) => s.setFormat);
  const setPageShapeStore = useWorkspaceStore((s) => s.setPageShape);
  const setTopicsStore = useWorkspaceStore((s) => s.setTopics);

  // Stepper state: Step 1 (Brand & Dossier) -> Step 2 (Audience, Size, Topics)
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 selections
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [selectedDossierId, setSelectedDossierId] = useState<string>("");
  const [brandSearch, setBrandSearch] = useState("");

  // Dossiers quick-created inline
  const [extraDossiers, setExtraDossiers] = useState<Record<string, DossierItem>>({});
  const [extraBrandDossierIds, setExtraBrandDossierIds] = useState<Record<string, string[]>>({});
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [quickCreateBrief, setQuickCreateBrief] = useState("");
  const [quickCreating, setQuickCreating] = useState(false);

  // Step 2 selections
  const [audience, setAudience] = useState<Audience>("HCP");
  const [selectedSize, setSelectedSize] = useState<string>(assetType === "infographic" ? "3:4" : "16:9");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    "Efficacy & Clinical Readout",
    "Mechanism of Action (MoA)",
  ]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset selection when modal opens
  useEffect(() => {
    if (open) {
      setStep(1);
      setSelectedBrandId("");
      setSelectedDossierId("");
      setBrandSearch("");
      setQuickCreateOpen(false);
      setQuickCreateBrief("");
      setQuickCreating(false);
      setAudience("HCP");
      setSelectedSize(assetType === "infographic" ? "3:4" : "16:9");
      setSelectedTopics(["Efficacy & Clinical Readout", "Mechanism of Action (MoA)"]);
    }
  }, [open, assetType]);

  const allBrands = useMemo(() => {
    return INITIAL_BRANDS.map((b) => {
      const extraIds = extraBrandDossierIds[b.id];
      if (!extraIds?.length) return b;
      return { ...b, hasDossier: true, dossierIds: [...(b.dossierIds || []), ...extraIds] };
    });
  }, [extraBrandDossierIds]);

  const allDossiers = useMemo(() => ({ ...DOSSIERS, ...extraDossiers }), [extraDossiers]);

  const selectedBrand = useMemo(() => {
    return allBrands.find((b) => b.id === selectedBrandId) || null;
  }, [allBrands, selectedBrandId]);

  const availableDossiers = useMemo(() => {
    if (!selectedBrandId) return [];
    return Object.values(allDossiers).filter((d) => d.brandId === selectedBrandId);
  }, [allDossiers, selectedBrandId]);

  const filteredBrands = useMemo(() => {
    const q = brandSearch.toLowerCase().trim();
    if (!q) return allBrands;
    return allBrands.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.genericName.toLowerCase().includes(q) ||
        b.therapyAreas.some((t) => t.toLowerCase().includes(q))
    );
  }, [allBrands, brandSearch]);

  function handleQuickCreate() {
    if (!selectedBrand) return;
    setQuickCreating(true);
    setTimeout(() => {
      const newDossier = createQuickDossier(selectedBrand, quickCreateBrief);
      setExtraDossiers((prev) => ({ ...prev, [newDossier.id]: newDossier }));
      setExtraBrandDossierIds((prev) => ({
        ...prev,
        [selectedBrand.id]: [...(prev[selectedBrand.id] || []), newDossier.id],
      }));
      setSelectedDossierId(newDossier.id);
      setQuickCreating(false);
      setQuickCreateOpen(false);
      setQuickCreateBrief("");
    }, 1100);
  }

  const sizeOptions = assetType === "infographic" ? INFOGRAPHIC_SIZE_OPTIONS : VIDEO_SIZE_OPTIONS;

  const toggleTopic = (topicLabel: string) => {
    if (selectedTopics.includes(topicLabel)) {
      if (selectedTopics.length > 1) {
        setSelectedTopics(selectedTopics.filter((t) => t !== topicLabel));
      }
    } else {
      setSelectedTopics([...selectedTopics, topicLabel]);
    }
  };

  if (!open || !mounted) return null;

  const handleStartProject = () => {
    if (!selectedBrandId || !selectedDossierId) return;

    // Commit all parameters to Workspace store
    setSourceType("dossier");
    setSourcePayload({ dossierId: selectedDossierId });
    setAudienceStore(audience);
    setTopicsStore(selectedTopics);

    if (assetType === "infographic") {
      const mainSize = selectedSize as "3:4" | "16:9" | "A4";
      setPageShapeStore(mainSize === "A4" ? "A4" : mainSize === "16:9" ? "16:9" : "3:4");
    } else {
      setFormatStore(selectedSize);
    }

    if (onSelectDossier) {
      onSelectDossier(selectedBrandId, selectedDossierId);
    }
    setView("create");
    setVideoSubStage("intake");
    onClose();
  };

  const handleSelectBrand = (brand: BrandItem) => {
    setSelectedBrandId(brand.id);
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
      <div className="relative flex h-[94vh] max-h-[960px] w-full max-w-[1380px] flex-col rounded-[28px] border border-black/10 bg-[#fafbfa] shadow-2xl overflow-hidden text-left">
        {/* ── Modal Top Header with Centered 2-Step Progress Indicator ── */}
        <div className="relative flex items-center justify-between border-b border-[var(--line)] bg-white px-8 py-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--ink-muted)]">
              {step === 1 ? "Step 1 of 2" : "Step 2 of 2"}
            </span>
          </div>

          {/* Stepper centered in the middle of the modal header */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4 select-none">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-[12px] font-bold transition-all",
                  step === 1
                    ? "bg-[var(--brand)] text-white shadow-xs"
                    : "bg-emerald-600 text-white"
                )}
              >
                {step === 2 ? <Check className="size-4 stroke-[3]" /> : "1"}
              </span>
              <span className={cn("text-[13px] font-bold", step === 1 ? "text-[var(--ink)]" : "text-[var(--ink-muted)]")}>
                Brand &amp; Dossier
              </span>
            </div>

            <div className="h-0.5 w-10 bg-black/15" />

            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-[12px] font-bold transition-all",
                  step === 2
                    ? "bg-[var(--brand)] text-white shadow-xs ring-2 ring-[var(--brand)]/20"
                    : "bg-black/10 text-[var(--ink-muted)]"
                )}
              >
                2
              </span>
              <span className={cn("text-[13px] font-bold", step === 2 ? "text-[var(--ink)]" : "text-[var(--ink-muted)]")}>
                Audience, Size &amp; Topics
              </span>
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

        {/* ── Modal Body: Step 1 vs Step 2 ── */}
        <div className="flex-1 overflow-y-auto p-8 space-y-7">
          {/* ═══════════════════════════════════════════════════════════════
              STEP 1: SELECT BRAND & APPROVED DOSSIER
             ═══════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-7 animate-in fade-in duration-200">
              {/* 1.1 Brand Selection Grid */}
              <div className="space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-[var(--brand)]/10 text-[11px] font-bold text-[var(--brand-deep)]">
                      1
                    </span>
                    <span className="text-[14px] font-[850] text-[var(--ink)]">
                      Select Brand
                    </span>
                    <span className="text-[11.5px] text-[var(--ink-muted)]">
                      (Choose the pharmaceutical brand to ground your content)
                    </span>
                  </div>

                  {/* Search input */}
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-2.5 size-3.5 text-[var(--ink-muted)]" />
                    <input
                      type="text"
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      placeholder="Search brand, molecule, area..."
                      className="w-full rounded-xl border border-black/10 bg-white pl-8 pr-3 py-1.5 text-[12px] focus:outline-none focus:border-[var(--brand)] shadow-2xs"
                    />
                  </div>
                </div>

                {/* Brands Responsive Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {filteredBrands.map((brand) => {
                    const isSelected = brand.id === selectedBrandId;
                    return (
                      <button
                        key={brand.id}
                        type="button"
                        onClick={() => handleSelectBrand(brand)}
                        className={cn(
                          "group relative flex flex-col justify-between p-3.5 rounded-[18px] border-2 text-left transition-all duration-150 cursor-pointer shadow-2xs",
                          isSelected
                            ? "border-[var(--brand)] bg-white ring-2 ring-[var(--brand)]/20 shadow-sm"
                            : "border-black/[0.07] bg-white/75 hover:bg-white hover:border-black/20 hover:-translate-y-0.5"
                        )}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <div
                              className={cn(
                                "grid size-8 place-items-center rounded-lg text-[11.5px] font-black border transition-colors",
                                isSelected
                                  ? "bg-[var(--brand)] text-white border-[var(--brand)]"
                                  : "bg-[var(--tint)]/70 text-[var(--brand-deep)] border-[var(--tint-line)] group-hover:bg-[var(--tint)]"
                              )}
                            >
                              {brand.name.slice(0, 2).toUpperCase()}
                            </div>

                            {isSelected && (
                              <span className="flex size-5 items-center justify-center rounded-full bg-[var(--brand)] text-white">
                                <Check className="size-3 stroke-[3]" />
                              </span>
                            )}
                          </div>

                          <div className="text-[13.5px] font-[850] text-[var(--ink)] truncate">
                            {brand.name}
                          </div>
                          <div className="text-[10.5px] text-[var(--ink-muted)] truncate italic">
                            {brand.genericName}
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-black/[0.05] flex items-center justify-between gap-1">
                          <span className="text-[9.5px] text-[var(--ink-muted)] truncate">
                            {brand.therapyAreas[0] || "General"}
                          </span>
                          {brand.hasDossier ? (
                            <span className="rounded bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 text-[9px] font-bold shrink-0">
                              {brand.dossierIds?.length || 1} {brand.dossierIds?.length === 1 ? "dossier" : "dossiers"}
                            </span>
                          ) : (
                            <span className="text-[9px] text-[var(--ink-muted)] italic shrink-0">
                              No dossier
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 1.2 Dossier Selection */}
              <div className="space-y-3.5 pt-2 border-t border-[var(--line)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-[var(--brand)]/10 text-[11px] font-bold text-[var(--brand-deep)]">
                      2
                    </span>
                    <span className="text-[14px] font-[850] text-[var(--ink)]">
                      {selectedBrand
                        ? `Available Dossiers for ${selectedBrand.name}`
                        : "Available Dossiers & Regulatory Sources"}
                    </span>
                    {selectedBrand && availableDossiers.length > 0 && (
                      <span className="text-[11px] text-[var(--ink-muted)]">
                        ({availableDossiers.length} approved options on file)
                      </span>
                    )}
                  </div>

                  {selectedBrand && availableDossiers.length > 0 && (
                    <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      ✓ Verified SmPC / Label Data
                    </span>
                  )}
                </div>

                {!selectedBrand ? (
                  <div className="rounded-[22px] border-2 border-dashed border-black/12 bg-white/60 p-10 text-center space-y-2.5">
                    <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[var(--tint)] text-[var(--brand-deep)] border border-[var(--tint-line)]">
                      <FileText className="size-6 text-[var(--brand)]" />
                    </div>
                    <div className="max-w-[420px] mx-auto">
                      <h4 className="text-[15px] font-[850] text-[var(--ink)]">
                        Select a brand above to view its approved dossiers
                      </h4>
                      <p className="text-[12px] text-[var(--ink-muted)] mt-0.5 leading-relaxed">
                        Choose from your organization's brand library in Step 1 to load associated SmPC, FDA prescribing info, and clinical evidence packages.
                      </p>
                    </div>
                  </div>
                ) : availableDossiers.length > 0 ? (
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
                ) : quickCreateOpen ? (
                  /* Quick-create a marketing & branding dossier, offline */
                  <div className="rounded-[24px] border-2 border-black/10 bg-white p-7 space-y-4">
                    <div className="flex items-center gap-2.5">
                      <div className="grid size-9 place-items-center rounded-xl bg-[var(--tint)] text-[var(--brand-deep)] border border-[var(--tint-line)]">
                        <Sparkles className="size-4" />
                      </div>
                      <div>
                        <h4 className="text-[14.5px] font-[850] text-[var(--ink)]">
                          Quick marketing &amp; branding dossier for {selectedBrand.name}
                        </h4>
                        <p className="text-[11.5px] text-[var(--ink-muted)]">
                          A lightweight starter dossier, generated instantly — no external service required.
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[var(--ink-2)] mb-1.5 block">
                        Brief (optional)
                      </label>
                      <textarea
                        value={quickCreateBrief}
                        onChange={(e) => setQuickCreateBrief(e.target.value)}
                        rows={3}
                        disabled={quickCreating}
                        placeholder={`What is ${selectedBrand.name} for, and who's the audience?`}
                        className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-[13px] text-[var(--ink)] resize-none disabled:opacity-60"
                      />
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Button variant="secondary" size="sm" disabled={quickCreating} onClick={() => setQuickCreateOpen(false)} className="px-4">
                        Back
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={quickCreating}
                        onClick={handleQuickCreate}
                        className="gap-2 font-bold px-5 flex-1 justify-center"
                      >
                        {quickCreating ? (
                          <>
                            <LogoMark size={14} className="animate-brand-spin" />
                            <span>Building dossier…</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="size-3.5" />
                            <span>Create dossier</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Brand Selected but No Dossiers Exist */
                  <div className="rounded-[24px] border-2 border-dashed border-black/15 bg-white p-9 text-center space-y-3">
                    <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
                      <FolderPlus className="size-6" />
                    </div>
                    <div className="max-w-[420px] mx-auto">
                      <h4 className="text-[15px] font-[850] text-[var(--ink)]">
                        No dossier found for {selectedBrand.name}
                      </h4>
                      <p className="text-[12px] text-[var(--ink-muted)] mt-1">
                        Create a quick marketing &amp; branding dossier now so you can keep going — you can build the full regulatory dossier later from the Brand Dossiers page.
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      className="gap-2 text-[12px] font-bold"
                      onClick={() => setQuickCreateOpen(true)}
                    >
                      <Plus className="size-3.5" />
                      <span>Create for {selectedBrand.name}</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 2: TARGET AUDIENCE, SIZE (SINGLE-SELECT), AND TOPICS
             ═══════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-7 animate-in fade-in duration-200">
              {/* 2.1 Target Audience */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-[var(--brand)]/10 text-[11px] font-bold text-[var(--brand-deep)]">
                      1
                    </span>
                    <h3 className="text-[14.5px] font-[850] text-[var(--ink)]">
                      Target Audience
                    </h3>
                    <span className="text-[11.5px] text-[var(--ink-muted)]">
                      (Who is this clinical content tailored for?)
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[var(--brand-deep)] bg-[var(--tint)] px-2.5 py-0.5 rounded-full border border-[var(--tint-line)]">
                    Active: {AUDIENCE_OPTIONS.find((a) => a.id === audience)?.title}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {AUDIENCE_OPTIONS.map((item) => {
                    const isSelected = audience === item.id;
                    const IconComp = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setAudience(item.id)}
                        className={cn(
                          "group relative flex flex-col justify-between p-4 rounded-[20px] border-2 text-left transition-all duration-150 cursor-pointer shadow-2xs",
                          isSelected
                            ? "border-[var(--brand)] bg-white ring-2 ring-[var(--brand)]/15 shadow-sm"
                            : "border-black/[0.08] bg-white/80 hover:bg-white hover:border-black/20"
                        )}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div
                              className={cn(
                                "grid size-8 place-items-center rounded-xl transition-colors",
                                isSelected
                                  ? "bg-[var(--brand)] text-white shadow-2xs"
                                  : "bg-[var(--tint)] text-[var(--brand-deep)] group-hover:bg-[var(--brand)] group-hover:text-white"
                              )}
                            >
                              <IconComp className="size-4" />
                            </div>
                            {isSelected && (
                              <span className="flex size-5 items-center justify-center rounded-full bg-[var(--brand)] text-white">
                                <Check className="size-3 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="text-[13px] font-[850] text-[var(--ink)]">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-[var(--ink-muted)] mt-0.5 leading-snug">
                              {item.subtitle}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2.2 Output Size & Format Ratio (Single Select) */}
              <div className="space-y-3 pt-4 border-t border-[var(--line)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-[var(--brand)]/10 text-[11px] font-bold text-[var(--brand-deep)]">
                      2
                    </span>
                    <h3 className="text-[14.5px] font-[850] text-[var(--ink)]">
                      Output Size &amp; Format Ratio
                    </h3>
                    <span className="text-[11.5px] text-[var(--ink-muted)]">
                      (Choose target aspect ratio for generation)
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Active: {sizeOptions.find((s) => s.id === selectedSize)?.label} ({selectedSize})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {sizeOptions.map((opt) => {
                    const isSelected = selectedSize === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedSize(opt.id)}
                        className={cn(
                          "group relative flex flex-col justify-between p-4 rounded-[20px] border-2 text-left transition-all duration-150 cursor-pointer shadow-2xs",
                          isSelected
                            ? "border-[var(--brand)] bg-white ring-2 ring-[var(--brand)]/15 shadow-sm"
                            : "border-black/[0.08] bg-white/80 hover:bg-white hover:border-black/20"
                        )}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "grid size-8 place-items-center rounded-xl font-mono text-[11px] font-extrabold transition-colors",
                                  isSelected
                                    ? "bg-[var(--brand)] text-white shadow-2xs"
                                    : "bg-black/5 text-[var(--ink)] group-hover:bg-[var(--tint)] group-hover:text-[var(--brand-deep)]"
                                )}
                              >
                                {opt.ratio}
                              </div>
                              <span className="text-[13px] font-[850] text-[var(--ink)]">
                                {opt.label}
                              </span>
                            </div>
                            {isSelected && (
                              <span className="flex size-5 items-center justify-center rounded-full bg-[var(--brand)] text-white">
                                <Check className="size-3 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[var(--ink-muted)] leading-snug">
                            {opt.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2.3 Clinical Focus Topics */}
              <div className="space-y-3 pt-4 border-t border-[var(--line)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-[var(--brand)]/10 text-[11px] font-bold text-[var(--brand-deep)]">
                      3
                    </span>
                    <h3 className="text-[14.5px] font-[850] text-[var(--ink)]">
                      Key Clinical Topics
                    </h3>
                    <span className="text-[11.5px] text-[var(--ink-muted)]">
                      (Select focus claims grounded in the {selectedBrand?.name} dossier)
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[var(--brand-deep)] bg-[var(--tint)] px-2.5 py-0.5 rounded-full border border-[var(--tint-line)]">
                    {selectedTopics.length} Focus Areas
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {CLINICAL_TOPIC_OPTIONS.map((top) => {
                    const isSelected = selectedTopics.includes(top.label);
                    return (
                      <button
                        key={top.id}
                        type="button"
                        onClick={() => toggleTopic(top.label)}
                        className={cn(
                          "group relative flex items-start gap-3 p-3.5 rounded-[18px] border-2 text-left transition-all duration-150 cursor-pointer shadow-2xs",
                          isSelected
                            ? "border-[var(--brand)] bg-white ring-2 ring-[var(--brand)]/15 shadow-sm"
                            : "border-black/[0.08] bg-white/80 hover:bg-white hover:border-black/20"
                        )}
                      >
                        <div
                          className={cn(
                            "mt-0.5 size-4.5 rounded-md border flex items-center justify-center shrink-0 transition-colors",
                            isSelected
                              ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                              : "border-black/20 bg-white group-hover:border-black/40"
                          )}
                        >
                          {isSelected && <Check className="size-3 stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[12.5px] font-bold text-[var(--ink)] leading-snug">
                            {top.label}
                          </div>
                          <div className="text-[11px] text-[var(--ink-muted)] mt-0.5 leading-snug">
                            {top.detail}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Modal Footer with Step 1 / Step 2 Actions ── */}
        <div className="flex items-center justify-between border-t border-[var(--line)] bg-white px-8 py-4 shrink-0">
          <div className="flex items-center gap-2">
            {step === 1 ? (
              <span className="text-[12.5px] text-[var(--ink-muted)]">
                {!selectedBrandId ? (
                  "Please select a brand in Step 1 to continue"
                ) : !selectedDossierId ? (
                  <span>
                    Selected Brand: <strong className="text-[var(--ink)]">{selectedBrand?.name}</strong> · Please pick a dossier in Step 2
                  </span>
                ) : (
                  <span className="font-semibold text-[var(--ink)] flex items-center gap-1.5">
                    <ShieldCheck className="size-4 text-emerald-600" />
                    {allDossiers[selectedDossierId]?.name || "Dossier Selected"} ({selectedBrand?.name})
                  </span>
                )}
              </span>
            ) : (
              <div className="flex items-center gap-2 text-[12.5px] text-[var(--ink-muted)]">
                <span className="font-bold text-[var(--ink)]">{selectedBrand?.name}</span>
                <span>·</span>
                <span>{audience}</span>
                <span>·</span>
                <span>{selectedSize}</span>
                <span>·</span>
                <span>{selectedTopics.length} Topics</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {step === 2 ? (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setStep(1)}
                  className="gap-1.5 px-4 cursor-pointer font-bold text-[12.5px]"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Back to Brand</span>
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleStartProject}
                  className="gap-2 font-bold px-6 shadow-sm cursor-pointer"
                >
                  <span>Start Project</span>
                  <ArrowRight className="size-3.5" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" size="sm" onClick={onClose} className="px-4 cursor-pointer">
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!selectedBrandId || !selectedDossierId}
                  onClick={() => setStep(2)}
                  className="gap-2 font-bold px-5 shadow-sm cursor-pointer disabled:opacity-40"
                >
                  <span>Continue to Setup</span>
                  <ArrowRight className="size-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
