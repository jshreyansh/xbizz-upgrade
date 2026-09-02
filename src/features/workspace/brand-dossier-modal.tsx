"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
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
  TrendingUp,
  Activity,
  Pill,
  Scale,
  Clock,
  AlertCircle,
  Heart,
  CheckCircle2,
  Target,
  MessageSquareQuote,
  BookOpen,
  ShieldAlert,
  Coins,
  BarChart3,
  BookOpenCheck,
  Package,
  Box,
  CreditCard,
  Users,
  Edit3,
  Lock,
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
  { id: "HCP", title: "HCP", subtitle: "Doctors & Specialists", icon: Stethoscope },
  { id: "Patient", title: "Patients", subtitle: "Clarity & Adherence", icon: HeartHandshake },
  { id: "Field team", title: "Field Force", subtitle: "Detailing & Sales", icon: Briefcase },
  { id: "Hospital", title: "Hospital", subtitle: "Formulary & Value", icon: Building2 },
  { id: "Distributor", title: "Distributors", subtitle: "Trade & Logistics", icon: Truck },
  { id: "Consumer", title: "Consumers", subtitle: "Public Awareness", icon: ShoppingCart },
];

// ── Audience-aware Clinical Topics with Semantic Icons ──
const TOPICS_BY_AUDIENCE: Record<Audience, Array<{ id: string; label: string; detail: string; icon: any }>> = {
  HCP: [
    { id: "moa", label: "Mechanism of Action", detail: "Receptor binding, phosphorylation blockade, cellular cascade", icon: Activity },
    { id: "efficacy", label: "Efficacy & Clinical Readout", detail: "Primary endpoints, PASI 90 / MACE reduction, responder rates", icon: TrendingUp },
    { id: "safety", label: "Safety & Tolerability", detail: "Adverse events, hepatic/renal cut-offs, black-box warnings", icon: ShieldCheck },
    { id: "dosing", label: "Dosing & Administration", detail: "Once-daily oral regimen, titration schedule, missed dose guidance", icon: Pill },
    { id: "patient-profile", label: "Patient Profile", detail: "Indication, contraindications, comorbidities, eGFR thresholds", icon: UserCheck },
    { id: "head-to-head", label: "Comparative Head-to-Head", detail: "Non-inferiority and superiority metrics vs Standard of Care", icon: Scale },
  ],
  Patient: [
    { id: "how-it-works", label: "How it Works", detail: "Simple explanation of mechanism in plain language", icon: Sparkles },
    { id: "what-to-expect", label: "What to Expect", detail: "Onset of action, how quickly you may see results", icon: Clock },
    { id: "side-effects", label: "Side Effects & Safety", detail: "Common side effects, when to contact your doctor", icon: AlertCircle },
    { id: "how-to-take", label: "How to Take It", detail: "Dosing schedule, missed dose instructions, storage", icon: Pill },
    { id: "living-with", label: "Living with the Condition", detail: "Lifestyle tips, diet, support resources", icon: Heart },
    { id: "real-outcomes", label: "Real Patient Outcomes", detail: "PRO scores, quality of life improvements, adherence data", icon: CheckCircle2 },
  ],
  "Field team": [
    { id: "key-messages", label: "Key Selling Messages", detail: "Core brand claims, approved differentiation points", icon: Target },
    { id: "objection-handling", label: "Objection Handling", detail: "Common HCP objections and evidence-based responses", icon: MessageSquareQuote },
    { id: "clinical-evidence", label: "Clinical Evidence Summary", detail: "Pivotal trial highlights condensed for field use", icon: BookOpen },
    { id: "dosing-guide", label: "Dosing Guide", detail: "Quick-reference dosing, titration, administration reminders", icon: Pill },
    { id: "competitive", label: "Competitive Positioning", detail: "Head-to-head data, market positioning vs competitors", icon: TrendingUp },
    { id: "fair-balance", label: "Fair Balance & ISI", detail: "Required safety statements and black-box warnings", icon: ShieldAlert },
  ],
  Hospital: [
    { id: "budget-impact", label: "Budget Impact", detail: "Cost-per-patient analysis, hospital formulary cost model", icon: Coins },
    { id: "heor", label: "HEOR & QALY", detail: "Health economic outcomes, quality-adjusted life year data", icon: BarChart3 },
    { id: "formulary", label: "Formulary Positioning", detail: "Formulary placement rationale, tier status, step edits", icon: Building2 },
    { id: "cost-effectiveness", label: "Cost-Effectiveness", detail: "ICERs, NNT, comparative cost vs standard of care", icon: Scale },
    { id: "contracting", label: "Contracting & GPO", detail: "GPO contracts, rebate structure, pull-through support", icon: FileText },
    { id: "hta", label: "HTA Submissions", detail: "NICE, HAS, G-BA dossier highlights for procurement teams", icon: BookOpenCheck },
  ],
  Distributor: [
    { id: "product-overview", label: "Product Overview", detail: "Indication, mechanism summary, approved markets", icon: Package },
    { id: "market-opportunity", label: "Market Opportunity", detail: "Patient population size, market growth forecasts", icon: TrendingUp },
    { id: "supply-logistics", label: "Supply & Logistics", detail: "Cold-chain requirements, shelf life, supply timelines", icon: Truck },
    { id: "sku-packaging", label: "SKU & Packaging", detail: "Available pack sizes, barcode, unit-of-use details", icon: Box },
    { id: "reimbursement", label: "Reimbursement Landscape", detail: "Payer coverage, co-pay programs, access support", icon: CreditCard },
    { id: "distribution-terms", label: "Distribution Terms", detail: "Trade terms, margin, exclusivity, territory rights", icon: FileSpreadsheet },
  ],
  Consumer: [
    { id: "what-it-does", label: "What it Does", detail: "Plain-language description of the medicine's purpose", icon: Sparkles },
    { id: "who-its-for", label: "Who it's For", detail: "Who is prescribed this medicine and why", icon: Users },
    { id: "how-to-take-consumer", label: "How to Take It", detail: "Simple dosing instructions and reminders", icon: Pill },
    { id: "side-effects-consumer", label: "Possible Side Effects", detail: "Most common side effects in everyday language", icon: AlertCircle },
    { id: "talk-to-doctor", label: "Talking to Your Doctor", detail: "Questions to ask your healthcare provider", icon: Stethoscope },
    { id: "lifestyle", label: "Lifestyle Tips", detail: "Diet, exercise, and habit advice alongside treatment", icon: Heart },
  ],
};

// ── Clean Size Options with Icons and Simple Shape Names ──
const VIDEO_SIZE_OPTIONS = [
  { id: "16:9", label: "Landscape", icon: Monitor },
  { id: "9:16", label: "Vertical / Reel", icon: Smartphone },
  { id: "1:1", label: "Square", icon: Square },
  { id: "4:5", label: "Portrait", icon: Layers },
];

const INFOGRAPHIC_SIZE_OPTIONS = [
  { id: "3:4", label: "Portrait Detailer", icon: Smartphone },
  { id: "16:9", label: "Landscape Slide", icon: Monitor },
  { id: "1:1", label: "Square", icon: Square },
  { id: "A4", label: "Print Document", icon: FileText },
];

type RevealStage = "focus" | "audience" | "details";

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

  // Progressive Stage: "focus" -> "audience" -> "details"
  const [stage, setStage] = useState<RevealStage>("focus");

  // 1. Focus: Brand vs Therapy Area
  const [sourceMode, setSourceMode] = useState<"brand" | "disease">("brand");
  const [brandSearch, setBrandSearch] = useState("Velmora");
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
      setStage("focus");
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
    setStage("audience");
  };

  const handleSelectAudience = (itemAudience: Audience) => {
    setAudience(itemAudience);
    if (itemAudience !== "HCP") {
      setStage("details");
    }
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
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-150"
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, width: "100vw", height: "100vh" }}
      role="dialog" aria-modal="true"
    >
      <div className="relative flex min-h-[560px] max-h-[92vh] w-full max-w-[880px] flex-col rounded-[24px] border border-[#d8deda] bg-white shadow-2xl overflow-visible text-left">

        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between border-b border-[#e9ece9] bg-[#fafbfa] px-7 py-4 shrink-0 rounded-t-[24px]">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-[var(--tint)] text-[var(--brand-deep)] border border-[var(--tint-line)] shadow-2xs">
              <Sparkles className="size-4.5 text-[var(--brand)]" />
            </div>
            <div>
              <h2 className="text-[17px] font-[850] text-[var(--ink)] tracking-tight">
                New {assetType === "infographic" ? "Creative / Infographic" : "Video"} Project
              </h2>
              <p className="text-[12px] text-[var(--ink-muted)]">
                Answer each focus decision to configure your project.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full text-[var(--ink-muted)] hover:bg-black/5 hover:text-[var(--ink)] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* ── Progressive Reveal Canvas ── */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-4">

          {/* ══════════════ 1. CLINICAL GROUNDING ══════════════ */}
          <div className={cn(
            "rounded-[18px] border transition-all duration-200 relative",
            stage === "focus"
              ? "border-[var(--brand)]/40 bg-[#f9faf9] shadow-xs p-5 z-30"
              : "border-[#e5ebe6] bg-white hover:border-[#ccd6ce] p-3.5 z-10"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={cn(
                  "grid size-6 place-items-center rounded-full text-[11px] font-extrabold transition-colors",
                  stage !== "focus" && (selectedBrandId || selectedDiseaseIds.length > 0)
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-black/8 text-[var(--ink-muted)]"
                )}>
                  {stage !== "focus" && (selectedBrandId || selectedDiseaseIds.length > 0) ? "✓" : "1"}
                </div>
                <span className="text-[13px] font-extrabold text-[var(--ink)]">
                  1. Clinical Grounding
                </span>
                {stage !== "focus" && (
                  <span className="text-[12px] font-semibold text-[var(--brand-deep)] bg-[var(--tint)] px-2.5 py-0.5 rounded-full border border-[var(--tint-line)] ml-2">
                    {sourceMode === "brand" ? selectedBrand?.name || "Brand Selected" : `${selectedDiseaseIds.length} Therapy Areas`}
                  </span>
                )}
              </div>

              {stage !== "focus" ? (
                <button
                  type="button"
                  onClick={() => setStage("focus")}
                  className="flex items-center gap-1 text-[11.5px] font-bold text-[var(--brand)] hover:underline cursor-pointer"
                >
                  <Edit3 className="size-3" />
                  <span>Change</span>
                </button>
              ) : (
                <div className="inline-flex rounded-lg border border-black/8 bg-white p-0.5 gap-0.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => { setSourceMode("brand"); setSelectedDiseaseIds([]); setDiseaseSearch(""); }}
                    className={cn("px-2.5 py-0.5 rounded-[6px] text-[11px] font-bold transition-all cursor-pointer", sourceMode === "brand" ? "bg-[var(--brand)] text-white" : "text-[var(--ink-muted)] hover:text-[var(--ink)]")}
                  >
                    Brand
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSourceMode("disease"); setSelectedBrandId(""); setBrandSearch(""); }}
                    className={cn("px-2.5 py-0.5 rounded-[6px] text-[11px] font-bold transition-all cursor-pointer", sourceMode === "disease" ? "bg-[var(--brand)] text-white" : "text-[var(--ink-muted)] hover:text-[var(--ink)]")}
                  >
                    Therapy Area
                  </button>
                </div>
              )}
            </div>

            {/* Expanded Body for Step 1 */}
            {stage === "focus" && (
              <div className="pt-4 space-y-3 animate-in fade-in duration-150">
                {sourceMode === "brand" ? (
                  <div className="space-y-2.5 relative">
                    <div className="relative flex items-center">
                      <Search className="absolute left-3 size-3.5 text-[var(--ink-muted)]" />
                      <input
                        type="text"
                        value={brandSearch}
                        onChange={(e) => { setBrandSearch(e.target.value); setBrandDropdownOpen(true); if (!e.target.value) setSelectedBrandId(""); }}
                        onFocus={() => setBrandDropdownOpen(true)}
                        placeholder="Type brand name or molecule (e.g. Velmora, Onkavia)..."
                        className="w-full rounded-[12px] border border-black/12 bg-white pl-9 pr-24 py-2.5 text-[13px] font-medium text-[var(--ink)] focus:outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/15 shadow-2xs transition-all"
                      />
                    </div>

                    {/* Clean Dropdown List */}
                    {brandDropdownOpen && filteredBrands.length > 0 && (
                      <div className="rounded-[16px] border border-black/10 bg-white shadow-lg overflow-hidden max-h-[220px] overflow-y-auto mt-1 z-50">
                        {filteredBrands.map((brand) => {
                          const isSel = brand.id === selectedBrandId;
                          return (
                            <button
                              key={brand.id}
                              type="button"
                              onMouseDown={(e) => { e.preventDefault(); handleSelectBrand(brand); }}
                              className={cn("flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors cursor-pointer border-b border-black/[0.04] last:border-0", isSel ? "bg-[var(--tint)] text-[var(--brand-deep)] font-bold" : "hover:bg-black/[0.03] text-[var(--ink)]")}
                            >
                              <div className={cn("grid size-6 place-items-center rounded text-[10px] font-black border shrink-0", isSel ? "bg-[var(--brand)] text-white border-[var(--brand)]" : "bg-[var(--tint)]/70 text-[var(--brand-deep)] border-[var(--tint-line)]")}>
                                {brand.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[12.5px] font-[850]">{brand.name}</div>
                                <div className="text-[10.5px] text-[var(--ink-muted)] italic truncate">{brand.genericName} · {brand.therapyAreas.join(", ")}</div>
                              </div>
                              {isSel && <Check className="size-3.5 text-[var(--brand)] stroke-[3]" />}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {selectedBrand && !brandDropdownOpen && (
                      <div className="flex items-center justify-between p-3 rounded-[12px] bg-white border border-[#dce3de] shadow-2xs">
                        <div className="flex items-center gap-2.5">
                          <div className="grid size-7 place-items-center rounded-lg bg-emerald-700 text-white font-bold text-[10.5px]">
                            {selectedBrand.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-[12.5px] font-bold text-[var(--ink)]">{selectedBrand.name}</div>
                            <div className="text-[10.5px] text-[var(--ink-muted)] italic">{selectedBrand.genericName} · {selectedBrand.therapyAreas.join(", ")}</div>
                          </div>
                        </div>
                        <Button size="sm" variant="primary" onClick={() => setStage("audience")} className="h-7 text-[11px] font-bold px-3 cursor-pointer">
                          <span>Confirm &amp; Next</span>
                          <ChevronRight className="size-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2.5 relative">
                    <div className="relative flex items-center">
                      <Search className="absolute left-3 size-3.5 text-[var(--ink-muted)]" />
                      <input
                        type="text"
                        value={diseaseSearch}
                        onChange={(e) => { setDiseaseSearch(e.target.value); setDiseaseDropdownOpen(true); }}
                        onFocus={() => setDiseaseDropdownOpen(true)}
                        placeholder="Search therapy areas (multi-select)..."
                        className="w-full rounded-[12px] border border-black/12 bg-white pl-9 pr-3 py-2 text-[12.5px] font-medium focus:outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/15 shadow-2xs transition-all"
                      />
                    </div>

                    {diseaseDropdownOpen && filteredDiseases.length > 0 && (
                      <div className="rounded-[16px] border border-black/10 bg-white shadow-lg overflow-hidden max-h-[200px] overflow-y-auto mt-1 z-50">
                        {filteredDiseases.map((disease) => {
                          const isSel = selectedDiseaseIds.includes(disease.id);
                          return (
                            <button
                              key={disease.id}
                              type="button"
                              onMouseDown={(e) => { e.preventDefault(); toggleDisease(disease.id); }}
                              className={cn("flex w-full items-center justify-between px-3.5 py-2 text-left transition-colors cursor-pointer border-b border-black/[0.04] last:border-0", isSel ? "bg-[var(--tint)] text-[var(--brand-deep)] font-bold" : "hover:bg-black/[0.03] text-[var(--ink)]")}
                            >
                              <div>
                                <div className="text-[12.5px] font-bold">{disease.label}</div>
                                <div className="text-[10.5px] text-[var(--ink-muted)]">{disease.desc}</div>
                              </div>
                              <div className={cn("size-3.5 rounded border flex items-center justify-center shrink-0", isSel ? "border-[var(--brand)] bg-[var(--brand)] text-white" : "border-black/20 bg-white")}>
                                {isSel && <Check className="size-2 stroke-[3]" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {selectedDiseaseIds.length > 0 && (
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex flex-wrap gap-1.5">
                          {selectedDiseaseIds.map((id) => {
                            const d = DISEASE_OPTIONS.find((opt) => opt.id === id);
                            if (!d) return null;
                            return (
                              <span key={id} className="inline-flex items-center gap-1 rounded-full bg-[var(--tint)] border border-[var(--tint-line)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--brand-deep)]">
                                {d.label}
                                <button type="button" onClick={() => toggleDisease(id)} className="hover:text-red-600 cursor-pointer"><X className="size-2.5" /></button>
                              </span>
                            );
                          })}
                        </div>
                        <Button size="sm" variant="primary" onClick={() => { setDiseaseDropdownOpen(false); setStage("audience"); }} className="h-7 text-[11px] font-bold px-3 cursor-pointer shrink-0">
                          <span>Confirm &amp; Next</span>
                          <ChevronRight className="size-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ══════════════ 2. TARGET AUDIENCE ══════════════ */}
          {stage === "focus" ? (
            <div className="rounded-[18px] border border-dashed border-black/10 bg-[#fafbfa] p-3.5 flex items-center justify-between opacity-60">
              <div className="flex items-center gap-2.5">
                <div className="grid size-6 place-items-center rounded-full bg-black/5 text-[11px] font-bold text-[var(--ink-muted)]">
                  2
                </div>
                <span className="text-[12.5px] font-bold text-[var(--ink-muted)]">
                  2. Target Audience
                </span>
              </div>
              <span className="text-[11px] text-[var(--ink-muted)] flex items-center gap-1">
                <Lock className="size-3" /> Select grounding first
              </span>
            </div>
          ) : (
            <div className={cn(
              "rounded-[18px] border transition-all duration-200",
              stage === "audience"
                ? "border-[var(--brand)]/40 bg-[#f9faf9] shadow-xs p-5"
                : "border-[#e5ebe6] bg-white hover:border-[#ccd6ce] p-3.5"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "grid size-6 place-items-center rounded-full text-[11px] font-extrabold transition-colors",
                    stage === "details"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-black/8 text-[var(--ink-muted)]"
                  )}>
                    {stage === "details" ? "✓" : "2"}
                  </div>
                  <span className="text-[13px] font-extrabold text-[var(--ink)]">
                    2. Target Audience
                  </span>
                  {stage !== "audience" && (
                    <span className="text-[12px] font-semibold text-[var(--brand-deep)] bg-[var(--tint)] px-2.5 py-0.5 rounded-full border border-[var(--tint-line)] ml-2">
                      {AUDIENCE_OPTIONS.find((a) => a.id === audience)?.title}
                      {audience === "HCP" && selectedSpecialities.length > 0 ? ` (${selectedSpecialities.join(", ")})` : ""}
                    </span>
                  )}
                </div>

                {stage !== "audience" ? (
                  <button
                    type="button"
                    onClick={() => setStage("audience")}
                    className="flex items-center gap-1 text-[11.5px] font-bold text-[var(--brand)] hover:underline cursor-pointer"
                  >
                    <Edit3 className="size-3" />
                    <span>Change</span>
                  </button>
                ) : null}
              </div>

              {/* Expanded Body for Step 2 */}
              {stage === "audience" && (
                <div className="pt-4 space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                    {AUDIENCE_OPTIONS.map((item) => {
                      const isSel = audience === item.id;
                      const IconComp = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectAudience(item.id)}
                          className={cn(
                            "flex flex-col items-center justify-center p-3 rounded-[14px] border-2 text-center transition-all cursor-pointer shadow-2xs min-h-[85px] gap-1.5",
                            isSel
                              ? "border-[var(--brand)] bg-white ring-2 ring-[var(--brand)]/15 shadow-sm"
                              : "border-black/8 bg-white hover:border-black/20"
                          )}
                        >
                          <div className={cn("grid size-7 place-items-center rounded-lg shrink-0 transition-colors", isSel ? "bg-[var(--brand)] text-white" : "bg-[var(--tint)] text-[var(--brand-deep)]")}>
                            <IconComp className="size-3.5" />
                          </div>
                          <div className="text-[12px] font-[850] text-[var(--ink)] leading-none">{item.title}</div>
                          <div className="text-[9.5px] text-[var(--ink-muted)] leading-none">{item.subtitle}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* If HCP, inline speciality selector + Next button */}
                  {audience === "HCP" && (
                    <div className="flex items-center justify-between pt-2 border-t border-black/6">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[var(--ink-2)]">Speciality:</span>
                        <div className="relative" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setSpecialityDropdownOpen(false); }}>
                          <button
                            type="button"
                            onClick={() => setSpecialityDropdownOpen(!specialityDropdownOpen)}
                            className="flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-2.5 py-1 text-[11px] font-bold text-[var(--brand-deep)] hover:border-[var(--brand)] transition-colors cursor-pointer shadow-2xs"
                          >
                            <span>{selectedSpecialities.length > 0 ? selectedSpecialities.join(", ") : "All Doctor Specialities"}</span>
                            <ChevronDown className="size-3" />
                          </button>
                          {specialityDropdownOpen && (
                            <div className="absolute z-50 left-0 mt-1 w-[200px] rounded-[14px] border border-black/10 bg-white shadow-lg overflow-hidden max-h-[180px] overflow-y-auto">
                              {HCP_SPECIALITIES.map((spec) => {
                                const isSel = selectedSpecialities.includes(spec);
                                return (
                                  <button
                                    key={spec}
                                    type="button"
                                    onMouseDown={(e) => { e.preventDefault(); toggleSpeciality(spec); }}
                                    className={cn("flex w-full items-center justify-between px-3 py-1.5 text-[11.5px] font-medium text-left transition-colors cursor-pointer border-b border-black/[0.04] last:border-0", isSel ? "bg-[var(--tint)] text-[var(--brand-deep)] font-bold" : "hover:bg-black/[0.03] text-[var(--ink)]")}
                                  >
                                    <span>{spec}</span>
                                    {isSel && <Check className="size-2.5 text-[var(--brand)] stroke-[3]" />}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      <Button size="sm" variant="primary" onClick={() => setStage("details")} className="h-7 text-[11px] font-bold px-3 cursor-pointer">
                        <span>Continue</span>
                        <ChevronRight className="size-3" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══════════════ 3 & 4: OUTPUT SIZE + CLINICAL FOCUS TOPICS ══════════════ */}
          {stage !== "details" ? (
            <div className="rounded-[18px] border border-dashed border-black/10 bg-[#fafbfa] p-3.5 flex items-center justify-between opacity-60">
              <div className="flex items-center gap-2.5">
                <div className="grid size-6 place-items-center rounded-full bg-black/5 text-[11px] font-bold text-[var(--ink-muted)]">
                  3
                </div>
                <span className="text-[12.5px] font-bold text-[var(--ink-muted)]">
                  3. Output Shape &amp; Clinical Focus Topics
                </span>
              </div>
              <span className="text-[11px] text-[var(--ink-muted)] flex items-center gap-1">
                <Lock className="size-3" /> Select audience first
              </span>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* 3. Output Size & Shape (Clean Icons & Simple Names) */}
              <div className="rounded-[18px] border border-[#e5ebe6] bg-white p-4 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="grid size-5.5 place-items-center rounded-full bg-[var(--tint)] text-[var(--brand-deep)] text-[10.5px] font-extrabold">
                      3
                    </div>
                    <span className="text-[12.5px] font-extrabold text-[var(--ink)]">
                      Output Shape &amp; Ratio
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {sizeOptions.find((s) => s.id === selectedSize)?.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {sizeOptions.map((opt) => {
                    const isSel = selectedSize === opt.id;
                    const IconComp = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedSize(opt.id)}
                        className={cn(
                          "flex items-center justify-center gap-2 py-2.5 px-3 rounded-[12px] border-2 transition-all cursor-pointer shadow-2xs",
                          isSel
                            ? "border-[var(--brand)] bg-[var(--tint)] text-[var(--brand-deep)] font-extrabold shadow-2xs ring-2 ring-[var(--brand)]/15"
                            : "border-black/8 bg-white hover:border-black/20 text-[var(--ink)]"
                        )}
                      >
                        <IconComp className={cn("size-3.5", isSel ? "text-[var(--brand)]" : "text-[var(--ink-muted)]")} />
                        <span className="text-[12px]">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Clinical Focus Topics (Audience-tailored Hero Cards) */}
              <div className="rounded-[18px] border border-[#e5ebe6] bg-white p-5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="grid size-5.5 place-items-center rounded-full bg-[var(--tint)] text-[var(--brand-deep)] text-[10.5px] font-extrabold">
                      4
                    </div>
                    <div>
                      <h3 className="text-[13px] font-extrabold text-[var(--ink)]">
                        Clinical Focus Topics
                      </h3>
                      <p className="text-[11px] text-[var(--ink-muted)]">
                        Select 1 to 3 story pillars (tailored for {AUDIENCE_OPTIONS.find((a) => a.id === audience)?.title}).
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[var(--brand-deep)] bg-[var(--tint)] px-2.5 py-0.5 rounded-full border border-[var(--tint-line)] shrink-0">
                    {selectedTopics.length} Selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                  {currentTopics.map((top) => {
                    const isSel = selectedTopics.includes(top.label);
                    const IconComp = top.icon;
                    return (
                      <button
                        key={top.id}
                        type="button"
                        onClick={() => toggleTopic(top.label)}
                        className={cn(
                          "group relative flex flex-col justify-between p-3.5 rounded-[14px] border-2 text-left transition-all duration-150 cursor-pointer shadow-2xs min-h-[92px]",
                          isSel
                            ? "border-[var(--brand)] bg-[#f3f9f5] ring-2 ring-[var(--brand)]/15 shadow-sm"
                            : "border-[#e3e8e5] bg-white hover:border-[#cbd6d0] hover:bg-[#fafbfa]"
                        )}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className={cn("grid size-6 place-items-center rounded-md transition-colors shrink-0", isSel ? "bg-[var(--brand)] text-white shadow-2xs" : "bg-[var(--tint)] text-[var(--brand-deep)] group-hover:bg-[var(--brand)] group-hover:text-white")}>
                              <IconComp className="size-3" />
                            </div>
                            <div className={cn("size-3.5 rounded-full border flex items-center justify-center transition-colors shrink-0", isSel ? "border-[var(--brand)] bg-[var(--brand)] text-white" : "border-black/20 bg-white")}>
                              {isSel && <Check className="size-2 stroke-[3]" />}
                            </div>
                          </div>
                          <div>
                            <div className="text-[12.5px] font-bold text-[var(--ink)] leading-snug">{top.label}</div>
                            <div className="text-[10.5px] text-[var(--ink-muted)] mt-0.5 leading-snug line-clamp-2">{top.detail}</div>
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

        {/* ── Footer ── */}
        <div className="flex items-center justify-between border-t border-[#e9ece9] bg-[#fafbfa] px-7 py-4 shrink-0 rounded-b-[24px]">
          <div className="flex flex-wrap items-center gap-1.5 text-[12px] text-[var(--ink-muted)]">
            <span className="font-bold text-[var(--ink)]">
              {sourceMode === "brand"
                ? selectedBrand ? `${selectedBrand.name}` : "No brand"
                : selectedDiseaseIds.length > 0
                ? `${selectedDiseaseIds.map((id) => DISEASE_OPTIONS.find((d) => d.id === id)?.label).filter(Boolean).join(", ")}`
                : "General evidence"}
            </span>
            {stage === "details" && (
              <>
                <span>·</span>
                <span>{AUDIENCE_OPTIONS.find((a) => a.id === audience)?.title}</span>
                {audience === "HCP" && selectedSpecialities.length > 0 && (
                  <span>({selectedSpecialities.join(", ")})</span>
                )}
                <span>·</span>
                <span>{sizeOptions.find((s) => s.id === selectedSize)?.label}</span>
                <span>·</span>
                <span className="font-bold text-[var(--brand-deep)]">{selectedTopics.length} Topics</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button variant="secondary" size="sm" onClick={onClose} className="px-4 cursor-pointer font-bold text-[12px]">
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!canProceed}
              onClick={handleStartProject}
              className="gap-2 font-bold px-6 shadow-sm cursor-pointer disabled:opacity-40 text-[12.5px]"
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
