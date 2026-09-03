"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Building2,
  Check,
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
  Plus,
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

// ── Initial Disease / Therapy Area options ──
export const INITIAL_DISEASE_OPTIONS = [
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

// ── Initial HCP Specialities ──
const INITIAL_HCP_SPECIALITIES = [
  "Dermatologist", "Oncologist", "Cardiologist", "Rheumatologist", "Neurologist",
  "Pulmonologist", "Gastroenterologist", "Nephrologist", "Immunologist",
  "General Practitioner", "Endocrinologist", "Psychiatrist",
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

// ── ONLY 3 Precise Geometric Aspect Ratio Options: Landscape, Portrait, Square ──
export type OutputShape = "landscape" | "portrait" | "square";

const SHAPE_OPTIONS = [
  {
    id: "landscape" as OutputShape,
    label: "Landscape",
    renderIcon: (isSel: boolean) => (
      <svg className={cn("size-4.5 shrink-0 transition-colors", isSel ? "text-brand" : "text-ink-3")} viewBox="0 0 20 14" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="1.5" y="1.5" width="17" height="11" rx="2" fill={isSel ? "currentColor" : "none"} fillOpacity={isSel ? 0.18 : 0} />
      </svg>
    ),
  },
  {
    id: "portrait" as OutputShape,
    label: "Portrait",
    renderIcon: (isSel: boolean) => (
      <svg className={cn("size-4.5 shrink-0 transition-colors", isSel ? "text-brand" : "text-ink-3")} viewBox="0 0 14 20" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="1.5" y="1.5" width="11" height="17" rx="2" fill={isSel ? "currentColor" : "none"} fillOpacity={isSel ? 0.18 : 0} />
      </svg>
    ),
  },
  {
    id: "square" as OutputShape,
    label: "Square",
    renderIcon: (isSel: boolean) => (
      <svg className={cn("size-4.5 shrink-0 transition-colors", isSel ? "text-brand" : "text-ink-3")} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="1.5" y="1.5" width="13" height="13" rx="2" fill={isSel ? "currentColor" : "none"} fillOpacity={isSel ? 0.18 : 0} />
      </svg>
    ),
  },
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

  // 1. Focus: Brand vs Therapy Area (Starts completely empty)
  const [sourceMode, setSourceMode] = useState<"brand" | "disease">("brand");
  const [brandSearch, setBrandSearch] = useState("");
  const [diseaseSearch, setDiseaseSearch] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [selectedDiseaseIds, setSelectedDiseaseIds] = useState<string[]>([]);
  const [customDiseases, setCustomDiseases] = useState<Array<{ id: string; label: string; desc: string }>>([]);
  const [customDiseaseInput, setCustomDiseaseInput] = useState("");
  const [showCustomDiseaseBox, setShowCustomDiseaseBox] = useState(false);

  // 2. Audience & Speciality
  const [audience, setAudience] = useState<Audience>("HCP");
  const [selectedSpecialities, setSelectedSpecialities] = useState<string[]>([]);
  const [customSpecialities, setCustomSpecialities] = useState<string[]>([]);
  const [customSpecialityInput, setCustomSpecialityInput] = useState("");
  const [showCustomSpecialityBox, setShowCustomSpecialityBox] = useState(false);

  // 3. Format Shape (Landscape, Portrait, Square)
  const [selectedShape, setSelectedShape] = useState<OutputShape>("landscape");

  // 4. Focus Topics
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (open) {
      setStage("focus");
      setSourceMode("brand");
      setSelectedBrandId("");
      setSelectedDiseaseIds([]);
      setCustomDiseases([]);
      setCustomDiseaseInput("");
      setShowCustomDiseaseBox(false);
      setBrandSearch("");
      setDiseaseSearch("");
      setAudience("HCP");
      setSelectedSpecialities([]);
      setCustomSpecialities([]);
      setCustomSpecialityInput("");
      setShowCustomSpecialityBox(false);
      setSelectedShape("landscape");
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

  const allDiseases = useMemo(() => [...INITIAL_DISEASE_OPTIONS, ...customDiseases], [customDiseases]);

  const filteredDiseases = useMemo(() => {
    const q = diseaseSearch.toLowerCase().trim();
    if (!q) return allDiseases;
    return allDiseases.filter((d) => d.label.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q));
  }, [diseaseSearch, allDiseases]);

  const allSpecialities = useMemo(() => [...INITIAL_HCP_SPECIALITIES, ...customSpecialities], [customSpecialities]);

  const currentTopics = TOPICS_BY_AUDIENCE[audience] || TOPICS_BY_AUDIENCE.HCP;

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

  const handleAddCustomDisease = () => {
    const trimmed = customDiseaseInput.trim();
    if (!trimmed) return;
    const newId = `custom-${Date.now()}`;
    const newEntry = { id: newId, label: trimmed, desc: "Custom Specified Area" };
    setCustomDiseases((prev) => [...prev, newEntry]);
    setSelectedDiseaseIds((prev) => [...prev, newId]);
    setCustomDiseaseInput("");
    setShowCustomDiseaseBox(false);
  };

  const handleAddCustomSpeciality = () => {
    const trimmed = customSpecialityInput.trim();
    if (!trimmed) return;
    setCustomSpecialities((prev) => [...prev, trimmed]);
    setSelectedSpecialities((prev) => [...prev, trimmed]);
    setCustomSpecialityInput("");
    setShowCustomSpecialityBox(false);
  };

  const handleSelectBrand = (brand: BrandItem) => {
    setSelectedBrandId(brand.id);
    setBrandSearch(brand.name);
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
    
    // Map the 3 shapes to the target store format
    if (assetType === "infographic") {
      const pageShape = selectedShape === "portrait" ? "3:4" : selectedShape === "square" ? "3:4" : "16:9";
      setPageShapeStore(pageShape);
    } else {
      const format = selectedShape === "portrait" ? "9:16" : selectedShape === "square" ? "1:1" : "16:9";
      setFormatStore(format);
    }
    
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
      <div className="relative flex min-h-[580px] max-h-[92vh] w-full max-w-[880px] flex-col rounded-card border border-[#d8deda] bg-card shadow-2xl overflow-hidden text-left">

        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between border-b border-hair-2 bg-canvas px-7 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-tint text-brand-deep border border-tint-line shadow-2xs">
              <Sparkles className="size-4.5 text-brand" />
            </div>
            <div>
              <h2 className="text-title font-[850] text-ink tracking-tight">
                New {assetType === "infographic" ? "Creative / Infographic" : "Video"} Project
              </h2>
              <p className="text-body text-ink-3">
                Answer each focus decision to configure your project.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full text-ink-3 hover:bg-black/5 hover:text-ink transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* ── Progressive Reveal Canvas ── */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-4">

          {/* ══════════════ 1. CLINICAL GROUNDING ══════════════ */}
          <div className={cn(
            "rounded-panel border transition-all duration-200",
            stage === "focus"
              ? "border-brand/40 bg-[#f9faf9] shadow-xs p-5"
              : "border-[#e5ebe6] bg-card hover:border-[#ccd6ce] p-3.5"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={cn(
                  "grid size-6 place-items-center rounded-full text-label font-extrabold transition-colors",
                  stage !== "focus" && (selectedBrandId || selectedDiseaseIds.length > 0)
                    ? "bg-ok-bg text-ok"
                    : "bg-black/8 text-ink-3"
                )}>
                  {stage !== "focus" && (selectedBrandId || selectedDiseaseIds.length > 0) ? "✓" : "1"}
                </div>
                <span className="text-body-lg font-extrabold text-ink">
                  1. Clinical Grounding
                </span>
                {stage !== "focus" && (
                  <span className="text-body font-semibold text-brand-deep bg-tint px-2.5 py-0.5 rounded-full border border-tint-line ml-2">
                    {sourceMode === "brand"
                      ? selectedBrand?.name || "Brand Selected"
                      : `${selectedDiseaseIds.length} Therapy Areas: ${selectedDiseaseIds.map((id) => allDiseases.find((d) => d.id === id)?.label).filter(Boolean).join(", ")}`}
                  </span>
                )}
              </div>

              {stage !== "focus" ? (
                <button
                  type="button"
                  onClick={() => setStage("focus")}
                  className="flex items-center gap-1 text-label font-bold text-brand hover:underline cursor-pointer"
                >
                  <Edit3 className="size-3" />
                  <span>Change</span>
                </button>
              ) : (
                <div className="inline-flex rounded-lg border border-hair bg-card p-0.5 gap-0.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => { setSourceMode("brand"); setSelectedDiseaseIds([]); setDiseaseSearch(""); }}
                    className={cn("px-2.5 py-0.5 rounded-[6px] text-label font-bold transition-all cursor-pointer", sourceMode === "brand" ? "bg-brand text-white" : "text-ink-3 hover:text-ink")}
                  >
                    Brand
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSourceMode("disease"); setSelectedBrandId(""); setBrandSearch(""); }}
                    className={cn("px-2.5 py-0.5 rounded-[6px] text-label font-bold transition-all cursor-pointer", sourceMode === "disease" ? "bg-brand text-white" : "text-ink-3 hover:text-ink")}
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
                  <div className="space-y-3">
                    <div className="relative flex items-center">
                      <Search className="absolute left-3.5 size-4 text-ink-4" />
                      <input
                        type="text"
                        value={brandSearch}
                        onChange={(e) => { setBrandSearch(e.target.value); }}
                        placeholder="Search brand name or molecule (e.g. Velmora, Onkavia, Nirvexa)..."
                        className="w-full rounded-control border border-hair-2 bg-card pl-10 pr-4 py-2.5 text-body-lg font-medium text-ink-2 placeholder:text-ink-4 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 shadow-2xs transition-all"
                        autoFocus
                      />
                    </div>

                    {/* In-Flow Brand Selection List */}
                    <div className="rounded-[16px] border border-hair-2/90 bg-card shadow-2xs divide-y divide-hair max-h-[220px] overflow-y-auto">
                      {filteredBrands.map((brand) => {
                        const isSel = brand.id === selectedBrandId;
                        return (
                          <button
                            key={brand.id}
                            type="button"
                            onClick={() => handleSelectBrand(brand)}
                            className={cn(
                              "flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors cursor-pointer",
                              isSel ? "bg-tint text-brand-deep font-bold" : "hover:bg-subtle text-ink-2"
                            )}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={cn("grid size-7 place-items-center rounded-lg text-caption font-black border shrink-0", isSel ? "bg-brand text-white border-brand" : "bg-subtle text-ink-2 border-hair-2")}>
                                {brand.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="text-body font-bold">{brand.name}</div>
                                <div className="text-label text-ink-3 italic truncate">{brand.genericName} · {brand.therapyAreas.join(", ")}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              {brand.hasDossier && (
                                <span className="text-caption font-bold text-ok bg-ok-bg px-2 py-0.5 rounded-full border border-ok-line">
                                  SmPC Ready
                                </span>
                              )}
                              <span className="text-label font-bold text-brand flex items-center gap-0.5">
                                Select <ChevronRight className="size-3" />
                              </span>
                            </div>
                          </button>
                        );
                      })}
                      {filteredBrands.length === 0 && (
                        <div className="py-6 text-center text-body text-ink-4">
                          No brands matching &quot;{brandSearch}&quot;
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative flex items-center">
                      <Search className="absolute left-3.5 size-4 text-ink-4" />
                      <input
                        type="text"
                        value={diseaseSearch}
                        onChange={(e) => setDiseaseSearch(e.target.value)}
                        placeholder="Search therapy areas (e.g. Dermatology, Oncology, Cardiology)..."
                        className="w-full rounded-control border border-hair-2 bg-card pl-10 pr-4 py-2.5 text-body-lg font-medium text-ink-2 placeholder:text-ink-4 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 shadow-2xs transition-all"
                        autoFocus
                      />
                    </div>

                    {/* Direct 1-Click Therapy Area Chips + "Other" Option */}
                    <div className="flex flex-wrap gap-2 max-h-[170px] overflow-y-auto p-1">
                      {filteredDiseases.map((disease) => {
                        const isSel = selectedDiseaseIds.includes(disease.id);
                        return (
                          <button
                            key={disease.id}
                            type="button"
                            onClick={() => toggleDisease(disease.id)}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-body font-semibold border transition-all cursor-pointer flex items-center gap-1.5",
                              isSel
                                ? "bg-tint border-brand text-brand-deep font-bold shadow-2xs"
                                : "bg-card border-hair-2 text-ink-2 hover:border-hair-3 hover:bg-subtle"
                            )}
                          >
                            {isSel && <Check className="size-3 text-brand stroke-[3]" />}
                            <span>{disease.label}</span>
                          </button>
                        );
                      })}

                      {/* + Other button */}
                      <button
                        type="button"
                        onClick={() => setShowCustomDiseaseBox(!showCustomDiseaseBox)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-body font-semibold border border-dashed transition-all cursor-pointer flex items-center gap-1.5",
                          showCustomDiseaseBox
                            ? "bg-ink border-ink text-white shadow-2xs font-bold"
                            : "bg-card border-hair-3 text-ink-2 hover:border-hair-3 hover:bg-subtle"
                        )}
                      >
                        <Plus className="size-3" />
                        <span>Other (Specify)</span>
                      </button>
                    </div>

                    {/* Inline Custom Area Input Box */}
                    {showCustomDiseaseBox && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-subtle border border-hair-2 animate-in fade-in duration-100">
                        <input
                          type="text"
                          value={customDiseaseInput}
                          onChange={(e) => setCustomDiseaseInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleAddCustomDisease(); }}
                          placeholder="Type custom therapy or disease area (e.g. Rare Diseases, Ophthalmology)..."
                          className="flex-1 bg-card rounded-lg border border-hair-2 px-3 py-1.5 text-body font-medium text-ink-2 placeholder:text-ink-4 focus:outline-none focus:border-brand"
                          autoFocus
                        />
                        <Button size="sm" variant="primary" onClick={handleAddCustomDisease} disabled={!customDiseaseInput.trim()} className="h-7.5 text-label font-bold px-3.5 cursor-pointer">
                          <span>Add Area</span>
                        </Button>
                      </div>
                    )}

                    {selectedDiseaseIds.length > 0 && (
                      <div className="flex items-center justify-between pt-2 border-t border-hair">
                        <span className="text-label font-bold text-ink-3">
                          {selectedDiseaseIds.length} therapy area{selectedDiseaseIds.length > 1 ? "s" : ""} selected
                        </span>
                        <Button size="sm" variant="primary" onClick={() => setStage("audience")} className="h-7.5 text-label font-bold px-4 cursor-pointer shadow-sm">
                          <span>Confirm &amp; Next</span>
                          <ChevronRight className="size-3.5" />
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
            <div className="rounded-panel border border-dashed border-hair-2 bg-canvas p-3.5 flex items-center justify-between opacity-60">
              <div className="flex items-center gap-2.5">
                <div className="grid size-6 place-items-center rounded-full bg-black/5 text-label font-bold text-ink-3">
                  2
                </div>
                <span className="text-body font-bold text-ink-3">
                  2. Target Audience
                </span>
              </div>
              <span className="text-label text-ink-3 flex items-center gap-1">
                <Lock className="size-3" /> Select grounding first
              </span>
            </div>
          ) : (
            <div className={cn(
              "rounded-panel border transition-all duration-200",
              stage === "audience"
                ? "border-brand/40 bg-[#f9faf9] shadow-xs p-5"
                : "border-[#e5ebe6] bg-card hover:border-[#ccd6ce] p-3.5"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "grid size-6 place-items-center rounded-full text-label font-extrabold transition-colors",
                    stage === "details"
                      ? "bg-ok-bg text-ok"
                      : "bg-black/8 text-ink-3"
                  )}>
                    {stage === "details" ? "✓" : "2"}
                  </div>
                  <span className="text-body-lg font-extrabold text-ink">
                    2. Target Audience
                  </span>
                  {stage !== "audience" && (
                    <span className="text-body font-semibold text-brand-deep bg-tint px-2.5 py-0.5 rounded-full border border-tint-line ml-2">
                      {AUDIENCE_OPTIONS.find((a) => a.id === audience)?.title}
                      {audience === "HCP" && selectedSpecialities.length > 0 ? ` (${selectedSpecialities.join(", ")})` : ""}
                    </span>
                  )}
                </div>

                {stage !== "audience" ? (
                  <button
                    type="button"
                    onClick={() => setStage("audience")}
                    className="flex items-center gap-1 text-label font-bold text-brand hover:underline cursor-pointer"
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
                            "flex flex-col items-center justify-center p-3 rounded-control border-2 text-center transition-all cursor-pointer shadow-2xs min-h-[85px] gap-1.5",
                            isSel
                              ? "border-brand bg-card ring-2 ring-brand/15 shadow-sm"
                              : "border-hair bg-card hover:border-hair-3"
                          )}
                        >
                          <div className={cn("grid size-7 place-items-center rounded-lg shrink-0 transition-colors", isSel ? "bg-brand text-white" : "bg-tint text-brand-deep")}>
                            <IconComp className="size-3.5" />
                          </div>
                          <div className="text-body font-[850] text-ink leading-none">{item.title}</div>
                          <div className="text-micro text-ink-3 leading-none">{item.subtitle}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* ── Direct 1-Click Doctor Speciality Chips + "Other" ── */}
                  {audience === "HCP" && (
                    <div className="pt-3 border-t border-hair-2/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-label font-bold text-ink-2">
                          Doctor Speciality (Optional):
                        </span>
                        {selectedSpecialities.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setSelectedSpecialities([])}
                            className="text-caption font-semibold text-ink-4 hover:text-ink-2 cursor-pointer"
                          >
                            Clear all
                          </button>
                        )}
                      </div>

                      {/* Clickable Speciality Chips */}
                      <div className="flex flex-wrap gap-1.5">
                        {allSpecialities.map((spec) => {
                          const isSel = selectedSpecialities.includes(spec);
                          return (
                            <button
                              key={spec}
                              type="button"
                              onClick={() => toggleSpeciality(spec)}
                              className={cn(
                                "px-2.5 py-1 rounded-full text-label font-semibold border transition-all cursor-pointer flex items-center gap-1",
                                isSel
                                  ? "bg-tint border-brand text-brand-deep font-bold shadow-2xs"
                                  : "bg-card border-hair-2 text-ink-2 hover:border-hair-3 hover:bg-subtle"
                              )}
                            >
                              {isSel && <Check className="size-2.5 text-brand stroke-[3]" />}
                              <span>{spec}</span>
                            </button>
                          );
                        })}

                        {/* + Other Speciality */}
                        <button
                          type="button"
                          onClick={() => setShowCustomSpecialityBox(!showCustomSpecialityBox)}
                          className={cn(
                            "px-2.5 py-1 rounded-full text-label font-semibold border border-dashed transition-all cursor-pointer flex items-center gap-1",
                            showCustomSpecialityBox
                              ? "bg-ink border-ink text-white font-bold"
                              : "bg-card border-hair-3 text-ink-2 hover:border-hair-3 hover:bg-subtle"
                          )}
                        >
                          <Plus className="size-3" />
                          <span>Other</span>
                        </button>
                      </div>

                      {/* Custom Speciality Input Box */}
                      {showCustomSpecialityBox && (
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-subtle border border-hair-2 animate-in fade-in duration-100">
                          <input
                            type="text"
                            value={customSpecialityInput}
                            onChange={(e) => setCustomSpecialityInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleAddCustomSpeciality(); }}
                            placeholder="Type custom doctor speciality (e.g. Hematologist, Pathologist)..."
                            className="flex-1 bg-card rounded-lg border border-hair-2 px-3 py-1.5 text-body font-medium text-ink-2 placeholder:text-ink-4 focus:outline-none focus:border-brand"
                            autoFocus
                          />
                          <Button size="sm" variant="primary" onClick={handleAddCustomSpeciality} disabled={!customSpecialityInput.trim()} className="h-7 text-label font-bold px-3 cursor-pointer">
                            <span>Add</span>
                          </Button>
                        </div>
                      )}

                      {/* Continue to Shape */}
                      <div className="flex justify-end pt-1">
                        <Button size="sm" variant="primary" onClick={() => setStage("details")} className="h-7.5 text-label font-bold px-4 cursor-pointer shadow-sm">
                          <span>Continue to Output Shape</span>
                          <ChevronRight className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══════════════ 3 & 4: OUTPUT SIZE + CLINICAL FOCUS TOPICS ══════════════ */}
          {stage !== "details" ? (
            <div className="rounded-panel border border-dashed border-hair-2 bg-canvas p-3.5 flex items-center justify-between opacity-60">
              <div className="flex items-center gap-2.5">
                <div className="grid size-6 place-items-center rounded-full bg-black/5 text-label font-bold text-ink-3">
                  3
                </div>
                <span className="text-body font-bold text-ink-3">
                  3. Output Shape &amp; Clinical Focus Topics
                </span>
              </div>
              <span className="text-label text-ink-3 flex items-center gap-1">
                <Lock className="size-3" /> Select audience first
              </span>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* 3. Output Shape (ONLY 3: Landscape, Portrait, Square with Clean Geometric Icons) */}
              <div className="rounded-panel border border-[#e5ebe6] bg-card p-4 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="grid size-5.5 place-items-center rounded-full bg-tint text-brand-deep text-caption font-extrabold">
                      3
                    </div>
                    <span className="text-body font-extrabold text-ink">
                      Output Shape
                    </span>
                  </div>
                  <span className="text-label font-bold text-ok bg-ok-bg px-2.5 py-0.5 rounded-full border border-ok-line">
                    {SHAPE_OPTIONS.find((s) => s.id === selectedShape)?.label}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {SHAPE_OPTIONS.map((opt) => {
                    const isSel = selectedShape === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedShape(opt.id)}
                        className={cn(
                          "flex items-center justify-center gap-2.5 py-3 px-4 rounded-control border-2 transition-all cursor-pointer shadow-2xs",
                          isSel
                            ? "border-brand bg-tint text-brand-deep font-extrabold shadow-2xs ring-2 ring-brand/15"
                            : "border-hair bg-card hover:border-hair-3 text-ink"
                        )}
                      >
                        {opt.renderIcon(isSel)}
                        <span className="text-body-lg font-bold">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Clinical Focus Topics (Audience-tailored Hero Cards) */}
              <div className="rounded-panel border border-[#e5ebe6] bg-card p-5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="grid size-5.5 place-items-center rounded-full bg-tint text-brand-deep text-caption font-extrabold">
                      4
                    </div>
                    <div>
                      <h3 className="text-body-lg font-extrabold text-ink">
                        Clinical Focus Topics
                      </h3>
                      <p className="text-label text-ink-3">
                        Select 1 to 3 story pillars (tailored for {AUDIENCE_OPTIONS.find((a) => a.id === audience)?.title}).
                      </p>
                    </div>
                  </div>
                  <span className="text-label font-bold text-brand-deep bg-tint px-2.5 py-0.5 rounded-full border border-tint-line shrink-0">
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
                          "group relative flex flex-col justify-between p-3.5 rounded-control border-2 text-left transition-all duration-150 cursor-pointer shadow-2xs min-h-[92px]",
                          isSel
                            ? "border-brand bg-[#f3f9f5] ring-2 ring-brand/15 shadow-sm"
                            : "border-hair-2 bg-card hover:border-hair-3 hover:bg-canvas"
                        )}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className={cn("grid size-6 place-items-center rounded-md transition-colors shrink-0", isSel ? "bg-brand text-white shadow-2xs" : "bg-tint text-brand-deep group-hover:bg-brand group-hover:text-white")}>
                              <IconComp className="size-3" />
                            </div>
                            <div className={cn("size-3.5 rounded-full border flex items-center justify-center transition-colors shrink-0", isSel ? "border-brand bg-brand text-white" : "border-hair-3 bg-card")}>
                              {isSel && <Check className="size-2 stroke-[3]" />}
                            </div>
                          </div>
                          <div>
                            <div className="text-body font-bold text-ink leading-snug">{top.label}</div>
                            <div className="text-caption text-ink-3 mt-0.5 leading-snug line-clamp-2">{top.detail}</div>
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
        <div className="flex items-center justify-between border-t border-hair-2 bg-canvas px-7 py-4 shrink-0">
          <div className="flex flex-wrap items-center gap-1.5 text-body text-ink-3">
            <span className="font-bold text-ink">
              {sourceMode === "brand"
                ? selectedBrand ? `${selectedBrand.name}` : "No brand selected"
                : selectedDiseaseIds.length > 0
                ? `${selectedDiseaseIds.map((id) => allDiseases.find((d) => d.id === id)?.label).filter(Boolean).join(", ")}`
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
                <span>{SHAPE_OPTIONS.find((s) => s.id === selectedShape)?.label}</span>
                <span>·</span>
                <span className="font-bold text-brand-deep">{selectedTopics.length} Topics</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button variant="secondary" size="sm" onClick={onClose} className="px-4 cursor-pointer font-bold text-body">
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!canProceed}
              onClick={handleStartProject}
              className="gap-2 font-bold px-6 shadow-sm cursor-pointer disabled:opacity-40 text-body"
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
