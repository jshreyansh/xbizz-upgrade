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
  { id: "Field team", title: "Field Force", subtitle: "Detailing & Sales Decks", icon: Briefcase },
  { id: "Hospital", title: "Hospital Procurement", subtitle: "Formulary & Value", icon: Building2 },
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

const VIDEO_SIZE_OPTIONS = [
  { id: "16:9", ratio: "16:9", label: "Landscape", desc: "1920×1080 · Desktop & Congress", previewRatio: "aspect-[16/9]" },
  { id: "9:16", ratio: "9:16", label: "Vertical", desc: "1080×1920 · Mobile & WhatsApp", previewRatio: "aspect-[9/16]" },
  { id: "1:1", ratio: "1:1", label: "Square", desc: "1080×1080 · iPad & Feed", previewRatio: "aspect-square" },
  { id: "4:5", ratio: "4:5", label: "Portrait", desc: "1080×1350 · Social & Detailing", previewRatio: "aspect-[4/5]" },
];

const INFOGRAPHIC_SIZE_OPTIONS = [
  { id: "3:4", ratio: "3:4", label: "Tablet Detailer", desc: "1536×2048 · iPad & Leave-Behind", previewRatio: "aspect-[3/4]" },
  { id: "16:9", ratio: "16:9", label: "Landscape Slide", desc: "1920×1080 · Decks & Congress Panels", previewRatio: "aspect-[16/9]" },
  { id: "A4", ratio: "A4", label: "Print Document", desc: "2480×3508 · Print-Ready Journal", previewRatio: "aspect-[1/1.414]" },
  { id: "9:16", ratio: "9:16", label: "Mobile Digest", desc: "1080×1920 · Digital Leave-Behind", previewRatio: "aspect-[9/16]" },
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
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 backdrop-blur-md p-3 sm:p-5 lg:p-7 animate-in fade-in duration-200"
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, width: "100vw", height: "100vh" }}
      role="dialog" aria-modal="true"
    >
      <div className="relative flex h-[92vh] max-h-[900px] w-full max-w-[1240px] flex-col rounded-[26px] border border-black/10 bg-[#fafbfa] shadow-2xl overflow-hidden text-left">

        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between border-b border-[var(--line)] bg-white px-7 py-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-[var(--tint)] text-[var(--brand-deep)] border border-[var(--tint-line)] shadow-2xs">
              <Sparkles className="size-4.5 text-[var(--brand)]" />
            </div>
            <div>
              <h2 className="text-[16.5px] font-[850] text-[var(--ink)] tracking-tight">
                Start New {assetType === "infographic" ? "Creative / Infographic" : "Video"} Project
              </h2>
              <p className="text-[11.5px] text-[var(--ink-muted)]">
                Set clinical source, output ratio, target audience, and focus topics in one step.
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

        {/* ── 2-Column Studio Configuration Body ── */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* ══════════════ LEFT COLUMN: Source & Format (5 Cols) ══════════════ */}
            <div className="lg:col-span-5 space-y-6">

              {/* 1. Clinical Source & Focus */}
              <div className="rounded-[20px] bg-white border border-[#e2e8e3] p-5 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-[var(--brand)]" />
                    <h3 className="text-[13.5px] font-[850] text-[var(--ink)]">Clinical Source</h3>
                  </div>

                  {/* Mode toggle */}
                  <div className="inline-flex rounded-[10px] border border-black/10 bg-[#f4f6f4] p-0.5 gap-0.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => { setSourceMode("brand"); setSelectedDiseaseIds([]); setDiseaseSearch(""); }}
                      className={cn(
                        "flex items-center gap-1 rounded-[8px] px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer",
                        sourceMode === "brand" ? "bg-[var(--brand)] text-white shadow-xs" : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                      )}
                    >
                      Brand
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSourceMode("disease"); setSelectedBrandId(""); setBrandSearch(""); }}
                      className={cn(
                        "flex items-center gap-1 rounded-[8px] px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer",
                        sourceMode === "disease" ? "bg-[var(--brand)] text-white shadow-xs" : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                      )}
                    >
                      Therapy Area
                    </button>
                  </div>
                </div>

                {/* Brand Selector (Single-Select) */}
                {sourceMode === "brand" && (
                  <div className="space-y-2.5">
                    <div className="relative" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setBrandDropdownOpen(false); }}>
                      <div className="relative">
                        <Search className="absolute left-3 top-[11px] size-3.5 text-[var(--ink-muted)]" />
                        <input
                          type="text"
                          value={brandSearch}
                          onChange={(e) => { setBrandSearch(e.target.value); setBrandDropdownOpen(true); if (!e.target.value) setSelectedBrandId(""); }}
                          onFocus={() => setBrandDropdownOpen(true)}
                          placeholder="Search brand, molecule..."
                          className="w-full rounded-[12px] border border-black/12 bg-[#fbfcfa] pl-9 pr-3 py-2 text-[12.5px] font-medium focus:outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/15 shadow-2xs transition-all"
                        />
                      </div>
                      {brandDropdownOpen && filteredBrands.length > 0 && (
                        <div className="absolute z-50 left-0 right-0 mt-1 rounded-[16px] border border-black/10 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.14)] overflow-hidden max-h-[220px] overflow-y-auto">
                          {filteredBrands.map((brand) => {
                            const isSel = brand.id === selectedBrandId;
                            return (
                              <button
                                key={brand.id}
                                type="button"
                                onMouseDown={(e) => { e.preventDefault(); handleSelectBrand(brand); }}
                                className={cn("flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors cursor-pointer border-b border-black/[0.04] last:border-0", isSel ? "bg-[var(--tint)] text-[var(--brand-deep)]" : "hover:bg-black/[0.03] text-[var(--ink)]")}
                              >
                                <div className={cn("grid size-6 place-items-center rounded text-[9.5px] font-black border shrink-0", isSel ? "bg-[var(--brand)] text-white border-[var(--brand)]" : "bg-[var(--tint)]/70 text-[var(--brand-deep)] border-[var(--tint-line)]")}>
                                  {brand.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[12px] font-[850]">{brand.name}</div>
                                  <div className="text-[10px] text-[var(--ink-muted)] italic truncate">{brand.genericName} · {brand.therapyAreas[0]}</div>
                                </div>
                                {isSel && <Check className="size-3 text-[var(--brand)] stroke-[3]" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Selected Brand Pill */}
                    {selectedBrand ? (
                      <div className="rounded-[12px] border border-emerald-300 bg-emerald-50/60 p-2.5 flex items-center justify-between gap-2 shadow-2xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="grid size-7 place-items-center rounded-lg bg-emerald-700 text-white shrink-0 text-[10px] font-black">
                            {selectedBrand.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[12.5px] font-[850] text-[var(--ink)] truncate">{selectedBrand.name}</div>
                            <div className="text-[10.5px] text-[var(--ink-muted)] italic truncate">
                              {selectedBrand.genericName} · {selectedBrand.therapyAreas.join(", ")}
                            </div>
                          </div>
                        </div>
                        <span className="text-[9.5px] font-bold text-emerald-800 bg-white border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                          SmPC Ready
                        </span>
                      </div>
                    ) : (
                      <div className="rounded-[12px] border border-dashed border-black/15 bg-[#fafbfa] p-2.5 text-center text-[11px] text-[var(--ink-muted)]">
                        Select a brand from the dropdown.
                      </div>
                    )}
                  </div>
                )}

                {/* Disease Selector (Multi-Select) */}
                {sourceMode === "disease" && (
                  <div className="space-y-2.5">
                    <div className="relative" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDiseaseDropdownOpen(false); }}>
                      <div className="relative">
                        <Search className="absolute left-3 top-[11px] size-3.5 text-[var(--ink-muted)]" />
                        <input
                          type="text"
                          value={diseaseSearch}
                          onChange={(e) => { setDiseaseSearch(e.target.value); setDiseaseDropdownOpen(true); }}
                          onFocus={() => setDiseaseDropdownOpen(true)}
                          placeholder="Search therapy areas (multi-select)..."
                          className="w-full rounded-[12px] border border-black/12 bg-[#fbfcfa] pl-9 pr-3 py-2 text-[12.5px] font-medium focus:outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/15 shadow-2xs transition-all"
                        />
                      </div>
                      {diseaseDropdownOpen && filteredDiseases.length > 0 && (
                        <div className="absolute z-50 left-0 right-0 mt-1 rounded-[16px] border border-black/10 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.14)] overflow-hidden max-h-[220px] overflow-y-auto">
                          {filteredDiseases.map((disease) => {
                            const isSel = selectedDiseaseIds.includes(disease.id);
                            return (
                              <button
                                key={disease.id}
                                type="button"
                                onMouseDown={(e) => { e.preventDefault(); toggleDisease(disease.id); }}
                                className={cn("flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors cursor-pointer border-b border-black/[0.04] last:border-0", isSel ? "bg-[var(--tint)] text-[var(--brand-deep)]" : "hover:bg-black/[0.03] text-[var(--ink)]")}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="text-[12px] font-[850]">{disease.label}</div>
                                  <div className="text-[10px] text-[var(--ink-muted)] truncate">{disease.desc}</div>
                                </div>
                                <div className={cn("size-3.5 rounded border flex items-center justify-center shrink-0 transition-colors", isSel ? "border-[var(--brand)] bg-[var(--brand)] text-white" : "border-black/20 bg-white")}>
                                  {isSel && <Check className="size-2 stroke-[3]" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {selectedDiseaseIds.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 max-h-[75px] overflow-y-auto">
                        {selectedDiseaseIds.map((id) => {
                          const disease = DISEASE_OPTIONS.find((d) => d.id === id);
                          if (!disease) return null;
                          return (
                            <span
                              key={id}
                              className="inline-flex items-center gap-1 rounded-full bg-[var(--tint)] border border-[var(--tint-line)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--brand-deep)] shadow-2xs"
                            >
                              <span>{disease.label}</span>
                              <button type="button" onClick={() => toggleDisease(id)} className="hover:text-red-600 cursor-pointer"><X className="size-2.5" /></button>
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[11px] text-[var(--ink-muted)] italic">
                        Select one or more therapy areas.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* 2. Canvas Size & Aspect Ratio */}
              <div className="rounded-[20px] bg-white border border-[#e2e8e3] p-5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="size-4 text-[var(--brand)]" />
                    <h3 className="text-[13.5px] font-[850] text-[var(--ink)]">Output Size &amp; Ratio</h3>
                  </div>
                  <span className="text-[10.5px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {selectedSize}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {sizeOptions.map((opt) => {
                    const isSel = selectedSize === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedSize(opt.id)}
                        className={cn(
                          "group relative flex items-center gap-3 p-3 rounded-[14px] border-2 text-left transition-all duration-150 cursor-pointer shadow-2xs",
                          isSel
                            ? "border-[var(--brand)] bg-white ring-2 ring-[var(--brand)]/15 shadow-sm"
                            : "border-black/[0.08] bg-[#fafbfa] hover:bg-white hover:border-black/20"
                        )}
                      >
                        {/* Visual aspect ratio wireframe preview */}
                        <div className="size-8 rounded-lg bg-black/[0.04] grid place-items-center shrink-0 border border-black/5 group-hover:bg-[var(--tint)] transition-colors">
                          <div className={cn("rounded-[3px] border border-black/40 bg-white transition-all", opt.previewRatio, isSel && "border-[var(--brand)] bg-[var(--brand)]/10")} style={{ width: "18px" }} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] font-[850] text-[var(--ink)]">{opt.label}</span>
                            <span className="text-[10px] font-mono font-bold text-[var(--ink-muted)]">{opt.ratio}</span>
                          </div>
                          <div className="text-[10px] text-[var(--ink-muted)] truncate leading-snug">{opt.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ══════════════ RIGHT COLUMN: Audience & Topics (7 Cols) ══════════════ */}
            <div className="lg:col-span-7 space-y-6">

              {/* 3. Target Audience & Speciality */}
              <div className="rounded-[20px] bg-white border border-[#e2e8e3] p-5 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-[var(--brand)]" />
                    <h3 className="text-[13.5px] font-[850] text-[var(--ink)]">Target Audience</h3>
                  </div>
                  <span className="text-[10.5px] font-bold text-[var(--brand-deep)] bg-[var(--tint)] px-2 py-0.5 rounded-full border border-[var(--tint-line)]">
                    {AUDIENCE_OPTIONS.find((a) => a.id === audience)?.title}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {AUDIENCE_OPTIONS.map((item) => {
                    const isSel = audience === item.id;
                    const IconComp = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setAudience(item.id)}
                        className={cn(
                          "group relative flex items-center gap-2.5 p-2.5 rounded-[14px] border-2 text-left transition-all duration-150 cursor-pointer shadow-2xs",
                          isSel
                            ? "border-[var(--brand)] bg-white ring-2 ring-[var(--brand)]/15 shadow-sm"
                            : "border-black/[0.08] bg-[#fafbfa] hover:bg-white hover:border-black/20"
                        )}
                      >
                        <div className={cn("grid size-7 place-items-center rounded-lg transition-colors shrink-0", isSel ? "bg-[var(--brand)] text-white shadow-2xs" : "bg-[var(--tint)] text-[var(--brand-deep)] group-hover:bg-[var(--brand)] group-hover:text-white")}>
                          <IconComp className="size-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[12px] font-[850] text-[var(--ink)] truncate">{item.title}</div>
                          <div className="text-[9.5px] text-[var(--ink-muted)] truncate">{item.subtitle}</div>
                        </div>
                        {isSel && (
                          <div className="size-3.5 rounded-full bg-[var(--brand)] text-white grid place-items-center shrink-0">
                            <Check className="size-2 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Doctor Speciality (Inline when HCP is selected) */}
                {audience === "HCP" && (
                  <div className="pt-2 border-t border-black/6 flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--ink-2)] shrink-0">
                      <UserCheck className="size-3 text-[var(--brand)]" />
                      <span>Doctor Speciality:</span>
                    </div>

                    {selectedSpecialities.map((spec) => (
                      <span key={spec} className="inline-flex items-center gap-1 rounded-full bg-[var(--tint)] border border-[var(--tint-line)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--brand-deep)]">
                        {spec}
                        <button type="button" onClick={() => toggleSpeciality(spec)} className="hover:text-[var(--brand)] cursor-pointer"><X className="size-2.5" /></button>
                      </span>
                    ))}

                    <div className="relative" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setSpecialityDropdownOpen(false); }}>
                      <button
                        type="button"
                        onClick={() => setSpecialityDropdownOpen(!specialityDropdownOpen)}
                        className="flex items-center gap-1 rounded-[8px] border border-black/12 bg-white px-2.5 py-1 text-[11px] text-[var(--ink-2)] font-semibold hover:border-[var(--brand)] transition-colors cursor-pointer shadow-2xs"
                      >
                        <span>{selectedSpecialities.length > 0 ? "+ Add speciality" : "Select speciality..."}</span>
                        <ChevronDown className={cn("size-3 transition-transform", specialityDropdownOpen && "rotate-180")} />
                      </button>
                      {specialityDropdownOpen && (
                        <div className="absolute z-50 left-0 mt-1 w-[200px] rounded-[14px] border border-black/10 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.14)] overflow-hidden max-h-[180px] overflow-y-auto">
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
                )}
              </div>

              {/* 4. Core Focus Topics (Audience-tailored with rich semantic icons) */}
              <div className="rounded-[20px] bg-white border border-[#e2e8e3] p-5 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-[var(--brand)]" />
                    <h3 className="text-[13.5px] font-[850] text-[var(--ink)]">Core Focus Topics</h3>
                    <span className="text-[11px] text-[var(--ink-muted)]">({AUDIENCE_OPTIONS.find((a) => a.id === audience)?.title} Pillars)</span>
                  </div>
                  <span className="text-[10.5px] font-bold text-[var(--brand-deep)] bg-[var(--tint)] px-2 py-0.5 rounded-full border border-[var(--tint-line)]">
                    {selectedTopics.length} selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentTopics.map((top) => {
                    const isSel = selectedTopics.includes(top.label);
                    const IconComp = top.icon;
                    return (
                      <button
                        key={top.id}
                        type="button"
                        onClick={() => toggleTopic(top.label)}
                        className={cn(
                          "group relative flex items-start gap-2.5 p-3 rounded-[14px] border-2 text-left transition-all duration-150 cursor-pointer shadow-2xs",
                          isSel
                            ? "border-[var(--brand)] bg-white ring-2 ring-[var(--brand)]/15 shadow-sm"
                            : "border-black/[0.08] bg-[#fafbfa] hover:bg-white hover:border-black/20"
                        )}
                      >
                        <div className={cn("grid size-7 place-items-center rounded-lg transition-colors shrink-0 mt-0.5", isSel ? "bg-[var(--brand)] text-white shadow-2xs" : "bg-[var(--tint)] text-[var(--brand-deep)] group-hover:bg-[var(--brand)] group-hover:text-white")}>
                          <IconComp className="size-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] font-bold text-[var(--ink)] leading-snug">{top.label}</span>
                            {isSel && (
                              <div className="size-3.5 rounded-full bg-[var(--brand)] text-white grid place-items-center shrink-0">
                                <Check className="size-2 stroke-[3]" />
                              </div>
                            )}
                          </div>
                          <div className="text-[10.5px] text-[var(--ink-muted)] mt-0.5 leading-snug line-clamp-2">{top.detail}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Modal Footer with Live Preset Summary ── */}
        <div className="flex items-center justify-between border-t border-[var(--line)] bg-white px-7 py-3.5 shrink-0">
          <div className="flex flex-wrap items-center gap-1.5 text-[12px] text-[var(--ink-muted)]">
            <span className="font-bold text-[var(--ink)]">
              {sourceMode === "brand"
                ? selectedBrand ? `Brand: ${selectedBrand.name}` : "No brand"
                : selectedDiseaseIds.length > 0
                ? `Therapy: ${selectedDiseaseIds.map((id) => DISEASE_OPTIONS.find((d) => d.id === id)?.label).filter(Boolean).join(", ")}`
                : "General evidence"}
            </span>
            <span>·</span>
            <span>{AUDIENCE_OPTIONS.find((a) => a.id === audience)?.title}</span>
            {audience === "HCP" && selectedSpecialities.length > 0 && (
              <>
                <span>·</span>
                <span className="truncate max-w-[150px] font-medium text-[var(--ink-2)]">{selectedSpecialities.join(", ")}</span>
              </>
            )}
            <span>·</span>
            <span>{selectedSize}</span>
            <span>·</span>
            <span className="font-bold text-[var(--brand-deep)]">{selectedTopics.length} Focus Areas</span>
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
              className="gap-2 font-bold px-5 shadow-sm cursor-pointer disabled:opacity-40 text-[12.5px]"
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
