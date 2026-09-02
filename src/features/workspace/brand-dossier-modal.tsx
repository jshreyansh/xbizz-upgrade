"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Building2,
  Check,
  ChevronDown,
  FileText,
  Search,
  ShieldCheck,
  X,
  ArrowRight,
  Stethoscope,
  HeartHandshake,
  Briefcase,
  Layers,
  Monitor,
  Smartphone,
  Square,
  FileSpreadsheet,
  FlaskConical,
  Truck,
  ShoppingCart,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
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
  { id: "velmora", name: "Velmora", genericName: "tirzelamide", therapyAreas: ["Dermatology", "Cardiology"], hasDossier: true, dossierIds: ["velmora-commercial", "velmora-smpc", "velmora-heor"] },
  { id: "onkavia", name: "Onkavia", genericName: "relunocitinib", therapyAreas: ["Oncology"], hasDossier: true, dossierIds: ["onkavia-ema", "onkavia-fda"] },
  { id: "nirvexa", name: "Nirvexa", genericName: "brentaxaban", therapyAreas: ["Immunology"], hasDossier: true, dossierIds: ["nirvexa-mhra", "nirvexa-fda"] },
  { id: "cardioxa", name: "Cardioxa", genericName: "levomilnacipran ER", therapyAreas: ["Cardiology"], hasDossier: true, dossierIds: ["cardioxa-sample"] },
  { id: "pulmovax", name: "PulmoVax", genericName: "albuterol / budesonide", therapyAreas: ["Respiratory"], hasDossier: true, dossierIds: ["pulmovax-sample"] },
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
    id: "velmora-commercial", brandId: "velmora", name: "Velmora Commercial Launch Dossier", molecule: "tirzelamide", market: "US · FDA",
    sections: 18, claims: 214, heldOut: 0, avatarBg: "linear-gradient(140deg,#4f83ff,#1d4ed8)", skeletonWidths: [88, 72, 94, 60, 80],
    documents: [{ name: "FDA Approved Prescribing Information (Rev. 04/2026)", citations: 112 }, { name: "CLARITY-CV Phase III Pivotal Readout (NEJM 2025)", citations: 64 }, { name: "Global HEOR Budget Impact & QALY Analysis", citations: 20 }, { name: "ClinicalTrials.gov Protocol NCT04892110", citations: 18 }],
  },
  "velmora-smpc": {
    id: "velmora-smpc", brandId: "velmora", name: "Velmora EU Summary of Product Characteristics (SmPC)", molecule: "tirzelamide", market: "EU · EMA",
    sections: 19, claims: 186, heldOut: 0, avatarBg: "linear-gradient(140deg,#22c07a,#12784a)", skeletonWidths: [92, 65, 84, 55, 78],
    documents: [{ name: "EMA Approved Summary of Product Characteristics (SmPC)", citations: 104 }, { name: "EU Multi-Center CLARITY-EU Phase III Sub-study", citations: 52 }, { name: "European HTA Joint Clinical Assessment Submission", citations: 30 }],
  },
  "velmora-heor": {
    id: "velmora-heor", brandId: "velmora", name: "Velmora HEOR & Value Evidence Dossier", molecule: "tirzelamide", market: "Global · HEOR",
    sections: 14, claims: 128, heldOut: 0, avatarBg: "linear-gradient(140deg,#f59e0b,#d97706)", skeletonWidths: [80, 85, 70, 90, 65],
    documents: [{ name: "Global Health Economics & QALY Impact Dossier", citations: 76 }, { name: "30-Day Hospital Readmission Reduction Health Economic Model", citations: 52 }],
  },
  "onkavia-ema": {
    id: "onkavia-ema", brandId: "onkavia", name: "Onkavia Clinical Reference Dossier", molecule: "relunocitinib", market: "EU · EMA",
    sections: 19, claims: 188, heldOut: 0, avatarBg: "linear-gradient(140deg,#22c07a,#12784a)", skeletonWidths: [92, 65, 84, 55, 78],
    documents: [{ name: "EMA Summary of Product Characteristics (SmPC)", citations: 96 }, { name: "EMBRACE-3 Pivotal Trial Readout (Lancet Oncology)", citations: 58 }, { name: "EU HEOR Relative Effectiveness Dossier", citations: 34 }],
  },
  "onkavia-fda": {
    id: "onkavia-fda", brandId: "onkavia", name: "Onkavia US Prescribing Dossier", molecule: "relunocitinib", market: "US · FDA",
    sections: 17, claims: 172, heldOut: 0, avatarBg: "linear-gradient(140deg,#4f83ff,#1d4ed8)", skeletonWidths: [85, 70, 90, 65, 75],
    documents: [{ name: "FDA Prescribing Information §14 Clinical Studies", citations: 88 }, { name: "US Oncology Core Visual Claims Library", citations: 54 }, { name: "NCCN Clinical Practice Guidelines in Oncology Review", citations: 30 }],
  },
  "nirvexa-mhra": {
    id: "nirvexa-mhra", brandId: "nirvexa", name: "Nirvexa Regulatory Launch Dossier", molecule: "brentaxaban", market: "UK · MHRA",
    sections: 16, claims: 142, heldOut: 0, avatarBg: "linear-gradient(140deg,#a855f7,#7e22ce)", skeletonWidths: [80, 88, 65, 75, 90],
    documents: [{ name: "MHRA Assessment Report & Great Britain Authorisation", citations: 74 }, { name: "NICE Single Technology Appraisal (STA) Submission", citations: 48 }, { name: "Pivotal TARGET-RA Phase III Study Readout", citations: 20 }],
  },
  "nirvexa-fda": {
    id: "nirvexa-fda", brandId: "nirvexa", name: "Nirvexa US Commercial Claims Library", molecule: "brentaxaban", market: "US · FDA",
    sections: 15, claims: 136, heldOut: 0, avatarBg: "linear-gradient(140deg,#4f83ff,#1d4ed8)", skeletonWidths: [82, 74, 86, 68, 70],
    documents: [{ name: "FDA Approved Label (Full Prescribing Info)", citations: 82 }, { name: "US Rheumatology Advisory Board Consensus", citations: 34 }, { name: "ACR Guidelines Evidence Synthesis", citations: 20 }],
  },
  "cardioxa-sample": {
    id: "cardioxa-sample", brandId: "cardioxa", name: "Cardioxa Cardiology Evidence Brief", molecule: "levomilnacipran ER", market: "US · FDA",
    sections: 14, claims: 96, heldOut: 0, avatarBg: "linear-gradient(140deg,#ef4444,#b91c1c)", skeletonWidths: [78, 82, 60, 70, 85],
    documents: [{ name: "FDA Approved Prescribing Information", citations: 58 }, { name: "Heart Failure Association Clinical Review", citations: 38 }],
  },
  "pulmovax-sample": {
    id: "pulmovax-sample", brandId: "pulmovax", name: "PulmoVax Respiratory Core Dossier", molecule: "albuterol / budesonide", market: "US · FDA",
    sections: 15, claims: 110, heldOut: 0, avatarBg: "linear-gradient(140deg,#06b6d4,#0891b2)", skeletonWidths: [85, 75, 90, 65, 80],
    documents: [{ name: "FDA Approved Label & Inhaler Instructions", citations: 68 }, { name: "MANDALA Phase III Pivotal Trial Readout", citations: 42 }],
  },
};

// ── Disease / Therapy Area options ──
export const DISEASE_OPTIONS = [
  { id: "dermatology", label: "Dermatology", desc: "Psoriasis, Eczema, Acne, Atopic Dermatitis" },
  { id: "oncology", label: "Oncology", desc: "Lung Cancer, Breast Cancer, Melanoma, Lymphoma" },
  { id: "cardiology", label: "Cardiology", desc: "Heart Failure, Atrial Fibrillation, Hypertension" },
  { id: "immunology", label: "Immunology & Rheumatology", desc: "Rheumatoid Arthritis, Lupus, Crohn's Disease" },
  { id: "respiratory", label: "Respiratory", desc: "Asthma, COPD, Interstitial Pulmonary Fibrosis" },
  { id: "neurology", label: "Neurology", desc: "Multiple Sclerosis, Parkinson's, Alzheimer's" },
  { id: "diabetes", label: "Diabetes & Metabolism", desc: "Type 1 & Type 2 Diabetes, Obesity, Thyroid" },
  { id: "nephrology", label: "Nephrology & Urology", desc: "CKD, IgA Nephropathy, Bladder Cancer" },
  { id: "gastroenterology", label: "Gastroenterology", desc: "IBD, Ulcerative Colitis, GERD, NAFLD" },
  { id: "anti-infectives", label: "Anti-infectives", desc: "HIV, TB, Bacterial Infections, Antifungals" },
  { id: "psychiatry", label: "Psychiatry & CNS", desc: "Depression, Schizophrenia, ADHD, Anxiety" },
  { id: "endocrinology", label: "Endocrinology", desc: "Thyroid Disorders, Adrenal, Pituitary Conditions" },
];

// ── HCP Specialities ──
const HCP_SPECIALITIES = [
  "Dermatologist", "Oncologist", "Cardiologist", "Rheumatologist", "Neurologist",
  "Pulmonologist", "Gastroenterologist", "Nephrologist", "Immunologist",
  "General Practitioner", "Endocrinologist", "Psychiatrist", "Hospitalist", "Surgeon",
];

// ── Audience Options ──
const AUDIENCE_OPTIONS: Array<{ id: Audience; title: string; subtitle: string; icon: any }> = [
  { id: "HCP", title: "HCP", subtitle: "Doctors, Specialists, KOLs", icon: Stethoscope },
  { id: "Patient", title: "Patients", subtitle: "Disease clarity & adherence", icon: HeartHandshake },
  { id: "Field team", title: "Field Force", subtitle: "Detailing aids & rep decks", icon: Briefcase },
  { id: "Hospital", title: "Hospital Procurement", subtitle: "Formulary & budget impact", icon: Building2 },
  { id: "Distributor", title: "Distributors", subtitle: "Trade & market access", icon: Truck },
  { id: "Consumer", title: "Consumers", subtitle: "Public & symptom awareness", icon: ShoppingCart },
];

// ── Audience-aware Clinical Topics ──
const TOPICS_BY_AUDIENCE: Record<Audience, Array<{ id: string; label: string; detail: string }>> = {
  HCP: [
    { id: "moa", label: "Mechanism of Action", detail: "Receptor binding, phosphorylation blockade, cellular cascade" },
    { id: "efficacy", label: "Efficacy & Clinical Readout", detail: "Primary endpoints, PASI 90 / MACE reduction, responder rates" },
    { id: "safety", label: "Safety & Tolerability", detail: "Adverse events, hepatic/renal cut-offs, black-box warnings" },
    { id: "dosing", label: "Dosing & Administration", detail: "Once-daily oral regimen, titration schedule, missed dose guidance" },
    { id: "patient-profile", label: "Patient Profile", detail: "Indication, contraindications, comorbidities, eGFR thresholds" },
    { id: "head-to-head", label: "Comparative Head-to-Head", detail: "Non-inferiority and superiority metrics vs Standard of Care" },
  ],
  Patient: [
    { id: "how-it-works", label: "How it Works", detail: "Simple explanation of mechanism in plain language" },
    { id: "what-to-expect", label: "What to Expect", detail: "Onset of action, how quickly you may see results" },
    { id: "side-effects", label: "Side Effects & Safety", detail: "Common side effects, when to contact your doctor" },
    { id: "how-to-take", label: "How to Take It", detail: "Dosing schedule, missed dose instructions, storage" },
    { id: "living-with", label: "Living with the Condition", detail: "Lifestyle tips, diet, support resources" },
    { id: "real-outcomes", label: "Real Patient Outcomes", detail: "PRO scores, quality of life improvements, adherence data" },
  ],
  "Field team": [
    { id: "key-messages", label: "Key Selling Messages", detail: "Core brand claims, approved differentiation points" },
    { id: "objection-handling", label: "Objection Handling", detail: "Common HCP objections and evidence-based responses" },
    { id: "clinical-evidence", label: "Clinical Evidence Summary", detail: "Pivotal trial highlights condensed for field use" },
    { id: "dosing-guide", label: "Dosing Guide", detail: "Quick-reference dosing, titration, administration reminders" },
    { id: "competitive", label: "Competitive Positioning", detail: "Head-to-head data, market positioning vs competitors" },
    { id: "fair-balance", label: "Fair Balance & ISI", detail: "Required safety statements and black-box warnings" },
  ],
  Hospital: [
    { id: "budget-impact", label: "Budget Impact", detail: "Cost-per-patient analysis, hospital formulary cost model" },
    { id: "heor", label: "HEOR & QALY", detail: "Health economic outcomes, quality-adjusted life year data" },
    { id: "formulary", label: "Formulary Positioning", detail: "Formulary placement rationale, tier status, step edits" },
    { id: "cost-effectiveness", label: "Cost-Effectiveness", detail: "ICERs, NNT, comparative cost vs standard of care" },
    { id: "contracting", label: "Contracting & GPO", detail: "GPO contracts, rebate structure, pull-through support" },
    { id: "hta", label: "HTA Submissions", detail: "NICE, HAS, G-BA dossier highlights for procurement teams" },
  ],
  Distributor: [
    { id: "product-overview", label: "Product Overview", detail: "Indication, mechanism summary, approved markets" },
    { id: "market-opportunity", label: "Market Opportunity", detail: "Patient population size, market growth forecasts" },
    { id: "supply-logistics", label: "Supply & Logistics", detail: "Cold-chain requirements, shelf life, supply timelines" },
    { id: "sku-packaging", label: "SKU & Packaging", detail: "Available pack sizes, barcode, unit-of-use details" },
    { id: "reimbursement", label: "Reimbursement Landscape", detail: "Payer coverage, co-pay programs, access support" },
    { id: "distribution-terms", label: "Distribution Terms", detail: "Trade terms, margin, exclusivity, territory rights" },
  ],
  Consumer: [
    { id: "what-it-does", label: "What it Does", detail: "Plain-language description of the medicine's purpose" },
    { id: "who-its-for", label: "Who it's For", detail: "Who is prescribed this medicine and why" },
    { id: "how-to-take-consumer", label: "How to Take It", detail: "Simple dosing instructions and reminders" },
    { id: "side-effects-consumer", label: "Possible Side Effects", detail: "Most common side effects in everyday language" },
    { id: "talk-to-doctor", label: "Talking to Your Doctor", detail: "Questions to ask your healthcare provider" },
    { id: "lifestyle", label: "Lifestyle Tips", detail: "Diet, exercise, and habit advice alongside treatment" },
  ],
};

const VIDEO_SIZE_OPTIONS = [
  { id: "16:9", ratio: "16:9", label: "Landscape Master", desc: "1920×1080 · Desktop & Congress", icon: Monitor },
  { id: "9:16", ratio: "9:16", label: "Vertical Reel", desc: "1080×1920 · Mobile & WhatsApp", icon: Smartphone },
  { id: "1:1", ratio: "1:1", label: "Square Feed", desc: "1080×1080 · iPad & Multi-Panel", icon: Square },
  { id: "4:5", ratio: "4:5", label: "Portrait Social", desc: "1080×1350 · Medical Networks", icon: Layers },
];

const INFOGRAPHIC_SIZE_OPTIONS = [
  { id: "3:4", ratio: "3:4", label: "Tablet Detailer", desc: "1536×2048 · iPad Detailing & Leave-Behind", icon: Smartphone },
  { id: "16:9", ratio: "16:9", label: "Landscape Slide", desc: "1920×1080 · Slide Decks & Congress Panels", icon: Monitor },
  { id: "A4", ratio: "A4", label: "Print Document", desc: "2480×3508 · Print-Ready Journal Leave-Behind", icon: FileSpreadsheet },
  { id: "9:16", ratio: "9:16", label: "Mobile Digest", desc: "1080×1920 · Digital Leave-Behind for Mobile", icon: Smartphone },
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

  // 1. Focus: Brand (Single-select) vs Therapy Area (Multi-select)
  const [sourceMode, setSourceMode] = useState<"brand" | "disease">("brand");
  const [brandSearch, setBrandSearch] = useState("");
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [diseaseSearch, setDiseaseSearch] = useState("");
  const [diseaseDropdownOpen, setDiseaseDropdownOpen] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState<string>("velmora");
  const [selectedDiseaseIds, setSelectedDiseaseIds] = useState<string[]>([]);

  // 2. Audience & Speciality
  const [audience, setAudience] = useState<Audience>("HCP");
  const [selectedSpecialities, setSelectedSpecialities] = useState<string[]>([]);
  const [specialityDropdownOpen, setSpecialityDropdownOpen] = useState(false);

  // 3. Format Size
  const [selectedSize, setSelectedSize] = useState<string>(assetType === "infographic" ? "3:4" : "16:9");

  // 4. Focus Topics
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (open) {
      setSourceMode("brand");
      setSelectedBrandId("velmora");
      setSelectedDiseaseIds([]);
      setBrandSearch("Velmora");
      setDiseaseSearch("");
      setBrandDropdownOpen(false);
      setDiseaseDropdownOpen(false);
      setAudience("HCP");
      setSelectedSpecialities([]);
      setSelectedSize(assetType === "infographic" ? "3:4" : "16:9");
      const def = TOPICS_BY_AUDIENCE["HCP"];
      setSelectedTopics([def[0].label, def[1].label]);
    }
  }, [open, assetType]);

  useEffect(() => {
    const topics = TOPICS_BY_AUDIENCE[audience];
    if (topics) setSelectedTopics([topics[0].label, topics[1].label]);
    setSelectedSpecialities([]);
  }, [audience]);

  const selectedBrand = useMemo(() => INITIAL_BRANDS.find((b) => b.id === selectedBrandId) || null, [selectedBrandId]);

  const filteredBrands = useMemo(() => {
    const q = brandSearch.toLowerCase().trim();
    if (!q) return INITIAL_BRANDS;
    return INITIAL_BRANDS.filter((b) => b.name.toLowerCase().includes(q) || b.genericName.toLowerCase().includes(q) || b.therapyAreas.some((t) => t.toLowerCase().includes(q)));
  }, [brandSearch]);

  const filteredDiseases = useMemo(() => {
    const q = diseaseSearch.toLowerCase().trim();
    if (!q) return DISEASE_OPTIONS;
    return DISEASE_OPTIONS.filter((d) => d.label.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q));
  }, [diseaseSearch]);

  const currentTopics = TOPICS_BY_AUDIENCE[audience] || TOPICS_BY_AUDIENCE.HCP;
  const sizeOptions = assetType === "infographic" ? INFOGRAPHIC_SIZE_OPTIONS : VIDEO_SIZE_OPTIONS;

  const canProceed = (sourceMode === "brand" ? !!selectedBrandId : selectedDiseaseIds.length > 0) && selectedTopics.length > 0;

  const toggleTopic = (label: string) => {
    if (selectedTopics.includes(label)) {
      if (selectedTopics.length > 1) setSelectedTopics(selectedTopics.filter((t) => t !== label));
    } else {
      setSelectedTopics([...selectedTopics, label]);
    }
  };

  const toggleSpeciality = (spec: string) => {
    setSelectedSpecialities((prev) => prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]);
  };

  const toggleDisease = (diseaseId: string) => {
    setSelectedDiseaseIds((prev) =>
      prev.includes(diseaseId) ? prev.filter((id) => id !== diseaseId) : [...prev, diseaseId]
    );
  };

  const handleSelectBrand = (brand: BrandItem) => {
    setSelectedBrandId(brand.id);
    setBrandSearch(brand.name);
    setBrandDropdownOpen(false);
  };

  const handleStartProject = () => {
    setSourceType("dossier");
    if (sourceMode === "brand") {
      const primaryDossier = selectedBrand?.dossierIds?.[0] || selectedBrandId;
      setSourcePayload({ dossierId: primaryDossier });
      if (onSelectDossier && selectedBrandId) onSelectDossier(selectedBrandId, primaryDossier);
    } else {
      setSourcePayload({ dossierId: selectedDiseaseIds.join(",") });
    }
    setAudienceStore(audience);
    setTopicsStore(selectedTopics);
    if (assetType === "infographic") {
      const s = selectedSize as "3:4" | "16:9" | "A4";
      setPageShapeStore(s === "A4" ? "A4" : s === "16:9" ? "16:9" : "3:4");
    } else setFormatStore(selectedSize);
    setView("create");
    setVideoSubStage("intake");
    onClose();
  };

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 backdrop-blur-md p-3 sm:p-6 lg:p-8 animate-in fade-in duration-200"
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, width: "100vw", height: "100vh" }}
      role="dialog" aria-modal="true"
    >
      <div className="relative flex h-[94vh] max-h-[960px] w-full max-w-[1280px] flex-col rounded-[28px] border border-black/10 bg-[#fafbfa] shadow-2xl overflow-hidden text-left">

        {/* ── Modal Header (Clean Single-Step) ── */}
        <div className="flex items-center justify-between border-b border-[var(--line)] bg-white px-8 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-[var(--tint)] text-[var(--brand-deep)] border border-[var(--tint-line)] shadow-2xs">
              <Sparkles className="size-4.5 text-[var(--brand)]" />
            </div>
            <div>
              <h2 className="text-[17px] font-[850] text-[var(--ink)] tracking-tight">
                Start New {assetType === "infographic" ? "Creative / Infographic" : "Video"} Project
              </h2>
              <p className="text-[12px] text-[var(--ink-muted)]">
                Configure clinical focus, target audience, format ratio, and focus topics in one step.
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

        {/* ── Scrollable Body with Unified Sections ── */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">

          {/* ═══════ 1. Choose Focus (Brand or Therapy Area) ═══════ */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-[var(--brand)]/10 text-[11px] font-bold text-[var(--brand-deep)]">1</span>
                <h3 className="text-[14.5px] font-[850] text-[var(--ink)]">Choose Focus</h3>
                <span className="text-[11.5px] text-[var(--ink-muted)]">(Select brand or therapy areas)</span>
              </div>

              {/* Mode toggle */}
              <div className="inline-flex rounded-[12px] border border-black/10 bg-white p-1 gap-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => { setSourceMode("brand"); setSelectedDiseaseIds([]); setDiseaseSearch(""); }}
                  className={cn("flex items-center gap-1.5 rounded-[9px] px-3.5 py-1.5 text-[12px] font-bold transition-all cursor-pointer", sourceMode === "brand" ? "bg-[var(--brand)] text-white shadow-xs" : "text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-black/5")}
                >
                  <ShieldCheck className="size-3.5" /> Brand
                </button>
                <button
                  type="button"
                  onClick={() => { setSourceMode("disease"); setSelectedBrandId(""); setBrandSearch(""); }}
                  className={cn("flex items-center gap-1.5 rounded-[9px] px-3.5 py-1.5 text-[12px] font-bold transition-all cursor-pointer", sourceMode === "disease" ? "bg-[var(--brand)] text-white shadow-xs" : "text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-black/5")}
                >
                  <FlaskConical className="size-3.5" /> Disease / Therapy Area
                </button>
              </div>
            </div>

            {/* Brand path (Single Select) */}
            {sourceMode === "brand" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div className="relative" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setBrandDropdownOpen(false); }}>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-[13px] size-4 text-[var(--ink-muted)]" />
                    <input
                      type="text"
                      value={brandSearch}
                      onChange={(e) => { setBrandSearch(e.target.value); setBrandDropdownOpen(true); if (!e.target.value) setSelectedBrandId(""); }}
                      onFocus={() => setBrandDropdownOpen(true)}
                      placeholder="Search brand name, molecule, or therapy area..."
                      className="w-full rounded-[14px] border border-black/12 bg-white pl-10 pr-4 py-2.5 text-[13.5px] font-medium focus:outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/15 shadow-2xs transition-all"
                    />
                    {selectedBrandId && (
                      <span className="absolute right-3.5 top-[11px] flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <Check className="size-3 stroke-[3]" /> Selected
                      </span>
                    )}
                  </div>
                  {brandDropdownOpen && filteredBrands.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 mt-1.5 rounded-[18px] border border-black/10 bg-white shadow-[0_16px_48px_rgba(0,0,0,0.14)] overflow-hidden max-h-[260px] overflow-y-auto">
                      {filteredBrands.map((brand) => {
                        const isSel = brand.id === selectedBrandId;
                        return (
                          <button
                            key={brand.id}
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); handleSelectBrand(brand); }}
                            className={cn("flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer border-b border-black/[0.04] last:border-0", isSel ? "bg-[var(--tint)] text-[var(--brand-deep)]" : "hover:bg-black/[0.03] text-[var(--ink)]")}
                          >
                            <div className={cn("grid size-7 place-items-center rounded-lg text-[10.5px] font-black border shrink-0", isSel ? "bg-[var(--brand)] text-white border-[var(--brand)]" : "bg-[var(--tint)]/70 text-[var(--brand-deep)] border-[var(--tint-line)]")}>
                              {brand.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[12.5px] font-[850]">{brand.name}</div>
                              <div className="text-[10.5px] text-[var(--ink-muted)] italic">{brand.genericName} · {brand.therapyAreas[0]}</div>
                            </div>
                            <div className="shrink-0 flex items-center gap-2">
                              {brand.hasDossier ? (
                                <span className="rounded bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 text-[9.5px] font-bold">
                                  Approved SmPC
                                </span>
                              ) : (
                                <span className="text-[9.5px] text-[var(--ink-muted)] italic">No dossier</span>
                              )}
                              {isSel && <Check className="size-3.5 text-[var(--brand)] stroke-[3]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Selected Brand Confirmation Card */}
                {selectedBrand ? (
                  <div className="rounded-[16px] border border-emerald-300 bg-emerald-50/50 p-3.5 flex items-center justify-between gap-3 shadow-2xs animate-in fade-in">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="grid size-9 place-items-center rounded-xl bg-emerald-700 text-white shrink-0 text-[12px] font-black">
                        {selectedBrand.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13.5px] font-[850] text-[var(--ink)] truncate">{selectedBrand.name}</div>
                        <div className="text-[11.5px] text-[var(--ink-muted)] italic truncate">
                          {selectedBrand.genericName} · {selectedBrand.therapyAreas.join(", ")}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10.5px] font-bold text-emerald-800 bg-white border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                      ✓ Ready for Grounding
                    </span>
                  </div>
                ) : (
                  <div className="rounded-[16px] border border-dashed border-black/15 bg-white p-3.5 text-center text-[12px] text-[var(--ink-muted)]">
                    Select a brand to ground scenes and claims.
                  </div>
                )}
              </div>
            )}

            {/* Disease path (Multi Select) */}
            {sourceMode === "disease" && (
              <div className="space-y-3">
                <div className="relative max-w-[560px]" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDiseaseDropdownOpen(false); }}>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-[13px] size-4 text-[var(--ink-muted)]" />
                    <input
                      type="text"
                      value={diseaseSearch}
                      onChange={(e) => { setDiseaseSearch(e.target.value); setDiseaseDropdownOpen(true); }}
                      onFocus={() => setDiseaseDropdownOpen(true)}
                      placeholder="Search and select therapy areas (multi-select)..."
                      className="w-full rounded-[14px] border border-black/12 bg-white pl-10 pr-4 py-2.5 text-[13.5px] font-medium focus:outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/15 shadow-2xs transition-all"
                    />
                    {selectedDiseaseIds.length > 0 && (
                      <span className="absolute right-3.5 top-[11px] flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        {selectedDiseaseIds.length} Selected
                      </span>
                    )}
                  </div>
                  {diseaseDropdownOpen && filteredDiseases.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 mt-1.5 rounded-[18px] border border-black/10 bg-white shadow-[0_16px_48px_rgba(0,0,0,0.14)] overflow-hidden max-h-[260px] overflow-y-auto">
                      {filteredDiseases.map((disease) => {
                        const isSel = selectedDiseaseIds.includes(disease.id);
                        return (
                          <button
                            key={disease.id}
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); toggleDisease(disease.id); }}
                            className={cn("flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer border-b border-black/[0.04] last:border-0", isSel ? "bg-[var(--tint)] text-[var(--brand-deep)]" : "hover:bg-black/[0.03] text-[var(--ink)]")}
                          >
                            <div className={cn("grid size-7 place-items-center rounded-lg text-[10.5px] font-black border shrink-0", isSel ? "bg-[var(--brand)] text-white border-[var(--brand)]" : "bg-[var(--tint)]/70 text-[var(--brand-deep)] border-[var(--tint-line)]")}>
                              {disease.label.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[12.5px] font-[850]">{disease.label}</div>
                              <div className="text-[10.5px] text-[var(--ink-muted)]">{disease.desc}</div>
                            </div>
                            <div className={cn("size-4 rounded-md border flex items-center justify-center shrink-0 transition-colors", isSel ? "border-[var(--brand)] bg-[var(--brand)] text-white" : "border-black/20 bg-white")}>
                              {isSel && <Check className="size-2.5 stroke-[3]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Selected Therapy Area Chips */}
                {selectedDiseaseIds.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedDiseaseIds.map((id) => {
                      const disease = DISEASE_OPTIONS.find((d) => d.id === id);
                      if (!disease) return null;
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--tint)] border border-[var(--tint-line)] px-3 py-1 text-[12px] font-bold text-[var(--brand-deep)] shadow-2xs animate-in fade-in"
                        >
                          <FlaskConical className="size-3.5 text-[var(--brand)]" />
                          <span>{disease.label}</span>
                          <button
                            type="button"
                            onClick={() => toggleDisease(id)}
                            className="hover:text-red-600 transition-colors cursor-pointer"
                            aria-label="Remove"
                          >
                            <X className="size-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[12px] text-[var(--ink-muted)] italic">
                    No therapy areas selected yet. Content will be grounded in general clinical evidence.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ═══════ 2. Target Audience ═══════ */}
          <div className="space-y-3 pt-6 border-t border-[var(--line)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-[var(--brand)]/10 text-[11px] font-bold text-[var(--brand-deep)]">2</span>
                <h3 className="text-[14.5px] font-[850] text-[var(--ink)]">Target Audience</h3>
                <span className="text-[11.5px] text-[var(--ink-muted)]">(Tone and narrative focus)</span>
              </div>
              <span className="text-[11px] font-bold text-[var(--brand-deep)] bg-[var(--tint)] px-2.5 py-0.5 rounded-full border border-[var(--tint-line)]">
                Active: {AUDIENCE_OPTIONS.find((a) => a.id === audience)?.title}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {AUDIENCE_OPTIONS.map((item) => {
                const isSel = audience === item.id;
                const IconComp = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAudience(item.id)}
                    className={cn(
                      "group relative flex flex-col justify-between p-3.5 rounded-[18px] border-2 text-left transition-all duration-150 cursor-pointer shadow-2xs min-h-[96px]",
                      isSel
                        ? "border-[var(--brand)] bg-white ring-2 ring-[var(--brand)]/15 shadow-sm"
                        : "border-black/[0.08] bg-white/80 hover:bg-white hover:border-black/20"
                    )}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className={cn("grid size-7 place-items-center rounded-lg transition-colors", isSel ? "bg-[var(--brand)] text-white shadow-2xs" : "bg-[var(--tint)] text-[var(--brand-deep)] group-hover:bg-[var(--brand)] group-hover:text-white")}>
                          <IconComp className="size-3.5" />
                        </div>
                        {isSel && (
                          <span className="flex size-4.5 items-center justify-center rounded-full bg-[var(--brand)] text-white">
                            <Check className="size-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-[12.5px] font-[850] text-[var(--ink)]">{item.title}</div>
                        <div className="text-[10px] text-[var(--ink-muted)] mt-0.5 leading-snug line-clamp-1">{item.subtitle}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* HCP Speciality */}
            {audience === "HCP" && (
              <div className="pt-2 space-y-2 pl-1">
                <div className="flex items-center gap-2">
                  <UserCheck className="size-3.5 text-[var(--brand)]" />
                  <span className="text-[12px] font-bold text-[var(--ink-2)]">Doctor Speciality</span>
                  <span className="text-[11px] text-[var(--ink-muted)]">(optional · multi-select)</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {selectedSpecialities.map((spec) => (
                    <span key={spec} className="inline-flex items-center gap-1.5 rounded-full bg-[var(--tint)] border border-[var(--tint-line)] px-2.5 py-1 text-[11.5px] font-bold text-[var(--brand-deep)]">
                      {spec}
                      <button type="button" onClick={() => toggleSpeciality(spec)} className="hover:text-[var(--brand)] cursor-pointer"><X className="size-3" /></button>
                    </span>
                  ))}

                  <div className="relative" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setSpecialityDropdownOpen(false); }}>
                    <button
                      type="button"
                      onClick={() => setSpecialityDropdownOpen(!specialityDropdownOpen)}
                      className="flex items-center gap-1.5 rounded-[10px] border border-black/12 bg-white px-3 py-1.5 text-[11.5px] text-[var(--ink-2)] font-semibold hover:border-[var(--brand)] transition-colors cursor-pointer shadow-2xs"
                    >
                      <span>{selectedSpecialities.length > 0 ? "+ Add speciality" : "Select speciality..."}</span>
                      <ChevronDown className={cn("size-3.5 transition-transform", specialityDropdownOpen && "rotate-180")} />
                    </button>
                    {specialityDropdownOpen && (
                      <div className="absolute z-50 left-0 mt-1.5 w-[240px] rounded-[16px] border border-black/10 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.14)] overflow-hidden max-h-[220px] overflow-y-auto">
                        {HCP_SPECIALITIES.map((spec) => {
                          const isSel = selectedSpecialities.includes(spec);
                          return (
                            <button
                              key={spec}
                              type="button"
                              onMouseDown={(e) => { e.preventDefault(); toggleSpeciality(spec); }}
                              className={cn("flex w-full items-center justify-between px-3.5 py-2 text-[12px] font-medium text-left transition-colors cursor-pointer border-b border-black/[0.04] last:border-0", isSel ? "bg-[var(--tint)] text-[var(--brand-deep)] font-bold" : "hover:bg-black/[0.03] text-[var(--ink)]")}
                            >
                              <span>{spec}</span>
                              {isSel && <Check className="size-3 text-[var(--brand)] stroke-[3]" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ═══════ 3. Output Size & Format Ratio ═══════ */}
          <div className="space-y-3 pt-6 border-t border-[var(--line)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-[var(--brand)]/10 text-[11px] font-bold text-[var(--brand-deep)]">3</span>
                <h3 className="text-[14.5px] font-[850] text-[var(--ink)]">Output Size &amp; Format Ratio</h3>
                <span className="text-[11.5px] text-[var(--ink-muted)]">(Choose aspect ratio)</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Active: {sizeOptions.find((s) => s.id === selectedSize)?.label} ({selectedSize})
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {sizeOptions.map((opt) => {
                const isSel = selectedSize === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedSize(opt.id)}
                    className={cn(
                      "group relative flex flex-col justify-between p-3.5 rounded-[18px] border-2 text-left transition-all duration-150 cursor-pointer shadow-2xs min-h-[85px]",
                      isSel
                        ? "border-[var(--brand)] bg-white ring-2 ring-[var(--brand)]/15 shadow-sm"
                        : "border-black/[0.08] bg-white/80 hover:bg-white hover:border-black/20"
                    )}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn("grid size-7 place-items-center rounded-lg font-mono text-[10.5px] font-extrabold transition-colors", isSel ? "bg-[var(--brand)] text-white shadow-2xs" : "bg-black/5 text-[var(--ink)] group-hover:bg-[var(--tint)] group-hover:text-[var(--brand-deep)]")}>
                            {opt.ratio}
                          </div>
                          <span className="text-[12.5px] font-[850] text-[var(--ink)]">{opt.label}</span>
                        </div>
                        {isSel && (
                          <span className="flex size-4.5 items-center justify-center rounded-full bg-[var(--brand)] text-white">
                            <Check className="size-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <div className="text-[10.5px] text-[var(--ink-muted)] leading-snug">{opt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ═══════ 4. Key Focus Topics ═══════ */}
          <div className="space-y-3 pt-6 border-t border-[var(--line)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-[var(--brand)]/10 text-[11px] font-bold text-[var(--brand-deep)]">4</span>
                <h3 className="text-[14.5px] font-[850] text-[var(--ink)]">Key Focus Topics</h3>
                <span className="text-[11.5px] text-[var(--ink-muted)]">(Tailored for {AUDIENCE_OPTIONS.find((a) => a.id === audience)?.title})</span>
              </div>
              <span className="text-[11px] font-bold text-[var(--brand-deep)] bg-[var(--tint)] px-2.5 py-0.5 rounded-full border border-[var(--tint-line)]">
                {selectedTopics.length} Focus Areas
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {currentTopics.map((top) => {
                const isSel = selectedTopics.includes(top.label);
                return (
                  <button
                    key={top.id}
                    type="button"
                    onClick={() => toggleTopic(top.label)}
                    className={cn(
                      "group relative flex items-start gap-3 p-3.5 rounded-[16px] border-2 text-left transition-all duration-150 cursor-pointer shadow-2xs",
                      isSel
                        ? "border-[var(--brand)] bg-white ring-2 ring-[var(--brand)]/15 shadow-sm"
                        : "border-black/[0.08] bg-white/80 hover:bg-white hover:border-black/20"
                    )}
                  >
                    <div className={cn("mt-0.5 size-4.5 rounded-md border flex items-center justify-center shrink-0 transition-colors", isSel ? "border-[var(--brand)] bg-[var(--brand)] text-white" : "border-black/20 bg-white group-hover:border-black/40")}>
                      {isSel && <Check className="size-2.5 stroke-[3]" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-bold text-[var(--ink)] leading-snug">{top.label}</div>
                      <div className="text-[11px] text-[var(--ink-muted)] mt-0.5 leading-snug">{top.detail || (top as any).description || ""}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between border-t border-[var(--line)] bg-white px-8 py-4 shrink-0">
          <div className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-[var(--ink-muted)]">
            <span className="font-bold text-[var(--ink)]">
              {sourceMode === "brand"
                ? selectedBrand ? `Brand: ${selectedBrand.name}` : "No brand selected"
                : selectedDiseaseIds.length > 0
                ? `Therapy: ${selectedDiseaseIds.map((id) => DISEASE_OPTIONS.find((d) => d.id === id)?.label).filter(Boolean).join(", ")}`
                : "No therapy area selected"}
            </span>
            <span>·</span>
            <span>{AUDIENCE_OPTIONS.find((a) => a.id === audience)?.title}</span>
            {audience === "HCP" && selectedSpecialities.length > 0 && (
              <>
                <span>·</span>
                <span className="truncate max-w-[180px] font-medium text-[var(--ink-2)]">{selectedSpecialities.join(", ")}</span>
              </>
            )}
            <span>·</span>
            <span>{selectedSize}</span>
            <span>·</span>
            <span>{selectedTopics.length} Topics</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button variant="secondary" size="sm" onClick={onClose} className="px-4 cursor-pointer font-bold text-[12.5px]">
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!canProceed}
              onClick={handleStartProject}
              className="gap-2 font-bold px-6 shadow-sm cursor-pointer disabled:opacity-40"
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
