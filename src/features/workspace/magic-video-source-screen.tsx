"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Plus,
  Sparkles,
  Users,
  Target,
  Layers,
  Activity,
  Pill,
  ShieldAlert,
  HelpCircle,
  Zap,
  ShieldCheck,
  FlaskConical,
  MonitorPlay,
  Search,
  X,
  FileText,
  Building2,
  FolderPlus,
  BookOpenCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudienceIcon } from "@/components/ui/select-icons";
import { MultiSelectMenu, SelectMenu } from "@/components/ui/select-menu";
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

const INITIAL_BRANDS: BrandItem[] = [
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

const DOSSIERS: Record<string, DossierItem> = {
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
    skeletonWidths: [88, 70, 85, 60, 75],
    documents: [
      { name: "FDA Approved Prescribing Information (Rev. 02/2026)", citations: 98 },
      { name: "US Expanded Access Oncology Safety Registry", citations: 40 },
    ],
  },
  "nirvexa-mhra": {
    id: "nirvexa-mhra",
    brandId: "nirvexa",
    name: "Nirvexa UK Commercial Dossier",
    molecule: "brentaxaban",
    market: "🇬🇧 UK · MHRA",
    sections: 16,
    claims: 142,
    heldOut: 2,
    avatarBg: "linear-gradient(140deg,#9b6bff,#5b21b6)",
    skeletonWidths: [80, 88, 60, 90, 70],
    documents: [
      { name: "MHRA Approved Summary of Product Characteristics", citations: 82 },
      { name: "NAVIGATE-2 Phase III Efficacy Readout", citations: 42 },
      { name: "NICE Technology Appraisal Submission", citations: 18 },
    ],
  },
  "nirvexa-fda": {
    id: "nirvexa-fda",
    brandId: "nirvexa",
    name: "Nirvexa US Prescribing Dossier",
    molecule: "brentaxaban",
    market: "🇺🇸 US · FDA",
    sections: 15,
    claims: 130,
    heldOut: 1,
    avatarBg: "linear-gradient(140deg,#4f83ff,#1d4ed8)",
    skeletonWidths: [85, 75, 80, 65, 70],
    documents: [
      { name: "FDA Approved Package Insert (PI)", citations: 80 },
      { name: "Global Phase III Immunology Meta-Analysis", citations: 50 },
    ],
  },
  "cardioxa-sample": {
    id: "cardioxa-sample",
    brandId: "cardioxa",
    name: "Cardioxa Sample Dossier",
    molecule: "levomilnacipran ER",
    market: "🇺🇸 US · FDA",
    sections: 17,
    claims: 165,
    heldOut: 0,
    avatarBg: "linear-gradient(140deg,#f59e0b,#d97706)",
    skeletonWidths: [85, 70, 90, 65, 75],
    isSample: true,
    documents: [
      { name: "Curated FDA Sample Prescribing Information", citations: 110 },
      { name: "Cardiology Trial Readouts & Endpoints", citations: 55 },
    ],
  },
  "pulmovax-sample": {
    id: "pulmovax-sample",
    brandId: "pulmovax",
    name: "PulmoVax Sample Dossier",
    molecule: "albuterol / budesonide",
    market: "🌐 Global · WHO",
    sections: 21,
    claims: 230,
    heldOut: 0,
    avatarBg: "linear-gradient(140deg,#ec4899,#be185d)",
    skeletonWidths: [90, 80, 75, 88, 68],
    isSample: true,
    documents: [
      { name: "WHO Guideline Formulation Reference", citations: 140 },
      { name: "Inhalation Powder Clinical Evidence", citations: 90 },
    ],
  },
};

const ALL_THERAPY_AREAS = [
  "Cardiology",
  "Diabetology & Metabolic Disorders",
  "CNS & Neurology",
  "Psychiatry",
  "Respiratory",
  "Gastroenterology",
  "Oncology",
  "Anti-infectives & Antimicrobials",
  "Gynaecology & Women's Health",
  "Dermatology",
  "Nephrology & Urology",
  "Rheumatology & Musculoskeletal",
  "Ophthalmology",
  "Paediatrics",
  "General Medicine & Primary Care",
  "Allergy & ENT",
  "Nutrition & Supplements",
  "Dermatology & Aesthetics",
  "Haematology",
  "Endocrinology",
  "Immunology",
  "Infectious Diseases",
  "Rare Diseases",
];

const AUDIENCE_OPTIONS: Audience[] = ["HCP", "Patient", "Payer", "Field team", "Consumer"];
const TOPIC_OPTIONS = [
  "Product Introduction",
  "Mechanism of Action",
  "Indications",
  "Dosage & Safety",
  "Drug Interactions",
  "Side Effects",
];

const topicIcons: Record<string, typeof Pill> = {
  "Product Introduction": Pill,
  "Mechanism of Action": Activity,
  "Indications": Target,
  "Dosage & Safety": ShieldAlert,
  "Drug Interactions": Zap,
  "Side Effects": HelpCircle,
};

export function MagicVideoSourceScreen({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const audience = useWorkspaceStore((s) => s.audience);
  const setAudience = useWorkspaceStore((s) => s.setAudience);
  const topics = useWorkspaceStore((s) => s.topics);
  const setTopics = useWorkspaceStore((s) => s.setTopics);
  const creationMode = useWorkspaceStore((s) => s.creationMode);
  const brief = useWorkspaceStore((s) => s.brief);
  const setBrief = useWorkspaceStore((s) => s.setBrief);
  const setSelectedSourceIds = useWorkspaceStore((s) => s.setSelectedSourceIds);
  const sourcePayload = useWorkspaceStore((s) => s.sourcePayload);
  const setSourcePayload = useWorkspaceStore((s) => s.setSourcePayload);
  const setVideoSubStage = useWorkspaceStore((s) => s.setVideoSubStage);
  const setView = useWorkspaceStore((s) => s.setView);
  const format = useWorkspaceStore((s) => s.format);
  const setFormat = useWorkspaceStore((s) => s.setFormat);

  // Brands State
  const [brandList, setBrandList] = useState<BrandItem[]>(INITIAL_BRANDS);
  const [selectedBrandId, setSelectedBrandId] = useState<string>("velmora");
  const [selectedDossierId, setSelectedDossierId] = useState<string>(
    sourcePayload.dossierId || "velmora-commercial"
  );
  const [brandSearchQuery, setBrandSearchQuery] = useState("");
  const [isChangingBrand, setIsChangingBrand] = useState(false);

  // Add Brand Modal State
  const [isAddBrandModalOpen, setIsAddBrandModalOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandMolecule, setNewBrandMolecule] = useState("");
  const [newBrandTherapyAreas, setNewBrandTherapyAreas] = useState<string[]>(["Dermatology"]);

  const selectedBrand = useMemo(
    () => brandList.find((b) => b.id === selectedBrandId) || brandList[0],
    [brandList, selectedBrandId]
  );

  const availableDossiers = useMemo(() => {
    if (!selectedBrand || !selectedBrand.hasDossier || !selectedBrand.dossierIds) return [];
    return selectedBrand.dossierIds.map((id) => DOSSIERS[id]).filter(Boolean);
  }, [selectedBrand]);

  const activeDossier = useMemo(() => {
    if (!selectedDossierId) return availableDossiers[0] || null;
    return DOSSIERS[selectedDossierId] || availableDossiers[0] || null;
  }, [selectedDossierId, availableDossiers]);

  // Filtered Brands
  const filteredBrands = useMemo(() => {
    const q = brandSearchQuery.trim().toLowerCase();
    if (!q) return brandList;
    return brandList.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.genericName.toLowerCase().includes(q) ||
        b.therapyAreas.some((t) => t.toLowerCase().includes(q))
    );
  }, [brandList, brandSearchQuery]);

  // Mandatory Validation Checks
  const isAudienceValid = Boolean(audience);
  const isTopicsValid = topics.length > 0;
  const isDossierValid = Boolean(selectedBrand?.hasDossier && activeDossier);
  const canContinue = isAudienceValid && isTopicsValid && isDossierValid;

  const handleSelectBrand = (brand: BrandItem) => {
    setSelectedBrandId(brand.id);
    setIsChangingBrand(false);
    if (brand.hasDossier && brand.dossierIds && brand.dossierIds.length > 0) {
      const firstDossierId = brand.dossierIds[0];
      setSelectedDossierId(firstDossierId);
      setSourcePayload({ dossierId: firstDossierId });
    } else {
      setSelectedDossierId("");
      setSourcePayload({ dossierId: "" });
    }
  };

  const handleSelectDossier = (dossier: DossierItem) => {
    setSelectedDossierId(dossier.id);
    setSourcePayload({ dossierId: dossier.id });
  };

  const handleAddBrandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;

    const newBrandId = newBrandName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const createdBrand: BrandItem = {
      id: newBrandId,
      name: newBrandName.trim(),
      genericName: newBrandMolecule.trim() || "Novel formulation",
      therapyAreas: newBrandTherapyAreas.length > 0 ? newBrandTherapyAreas : ["General Medicine & Primary Care"],
      hasDossier: false,
    };

    setBrandList((prev) => [createdBrand, ...prev]);
    setSelectedBrandId(createdBrand.id);
    setSelectedDossierId("");
    setSourcePayload({ dossierId: "" });
    setIsAddBrandModalOpen(false);
    setIsChangingBrand(false);
    setNewBrandName("");
    setNewBrandMolecule("");
    setNewBrandTherapyAreas(["Dermatology"]);
  };

  const handleToggleTherapyArea = (area: string) => {
    setNewBrandTherapyAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleSelectAllTherapyAreas = () => {
    if (newBrandTherapyAreas.length === ALL_THERAPY_AREAS.length) {
      setNewBrandTherapyAreas([]);
    } else {
      setNewBrandTherapyAreas([...ALL_THERAPY_AREAS]);
    }
  };

  const handleContinueToBrief = () => {
    if (!canContinue || !activeDossier) return;
    const dossierId = activeDossier.id;
    setSourcePayload({ dossierId });
    setSelectedSourceIds(["dermora-core", "dermora-claims", "dermora-brand"]);
    if (!brief || brief.length < 10) {
      if (creationMode === "magic-reel") {
        setBrief(`Create a concise ${selectedBrand.name} HCP launch video explaining clinical need, mechanism, and pivotal risk reduction.`);
      } else if (creationMode === "magic-avatar") {
        setBrief(`Create a presenter-led clinical briefing video highlighting the key trial readouts from the ${selectedBrand.name} dossier.`);
      }
    }
    setVideoSubStage("intake");
    setView("create");
  };

  const handleBackToMode = () => {
    setVideoSubStage("mode-select");
  };

  const content = (
    <main className="mx-auto w-full max-w-[1280px] px-6 py-6 sm:px-8">
      {/* Standardized 2-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px] items-start w-full">
        {/* Left Column: Brand & Dossier Directory */}
        <section className="squircle-card min-w-0 w-full border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-sm)] sm:p-6 space-y-5">
          {/* Section Step 1 Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
            <div className="flex items-center gap-2.5">
              <span className="grid size-6 place-items-center rounded-full bg-[var(--brand)] text-white text-[11px] font-extrabold shadow-2xs">
                1
              </span>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--ink-muted)] block">
                  Step 1
                </span>
                <h2 className="text-[16px] font-[850] text-[var(--ink)] tracking-tight">
                  Select the Brand and Dossier
                </h2>
              </div>
            </div>
            <span className="rounded-full bg-[var(--ok-bg)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--ok)]">
              Mandatory
            </span>
          </div>

          {/* ── STEP 1: BRAND SELECTION (MINIMIZED OR EXPANDED) ── */}
          {!isChangingBrand ? (
            /* Minimized Sleek Selected Brand Bar */
            <div className="rounded-2xl border border-[var(--brand)] bg-[var(--tint)]/50 p-4 shadow-2xs transition-all">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="size-11 rounded-xl bg-white border border-[var(--brand)]/30 text-[var(--brand-deep)] font-[850] text-[14px] grid place-items-center shadow-2xs shrink-0">
                    {selectedBrand.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--brand-deep)]">
                        Selected Brand
                      </span>
                      {selectedBrand.hasDossier ? (
                        <span className="rounded-md bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[9.5px] font-extrabold text-emerald-800">
                          ✓ {availableDossiers.length} Dossier{availableDossiers.length > 1 ? "s" : ""} on file
                        </span>
                      ) : (
                        <span className="rounded-md bg-amber-50 border border-amber-200/80 px-2 py-0.5 text-[9.5px] font-extrabold text-amber-800">
                          No dossier yet
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <h3 className="text-[16px] font-[850] text-[var(--ink)] tracking-tight truncate">
                        {selectedBrand.name}
                      </h3>
                      <span className="text-[12px] text-[var(--ink-muted)] italic truncate">
                        ({selectedBrand.genericName})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedBrand.therapyAreas.map((ta) => (
                        <span
                          key={ta}
                          className="inline-block rounded-md bg-white border border-black/10 px-2 py-0.5 text-[9.5px] font-semibold text-[var(--ink-2)]"
                        >
                          {ta}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsChangingBrand(true)}
                  className="rounded-xl border-black/15 bg-white hover:bg-gray-50 text-[12px] font-bold text-[var(--ink)] shadow-2xs hover:border-[var(--brand)] cursor-pointer shrink-0 gap-1.5 h-8.5 px-3"
                >
                  <Building2 className="size-3.5 text-[var(--brand)]" />
                  <span>Change brand</span>
                </Button>
              </div>
            </div>
          ) : (
            /* Expanded Brand Search & Selection Box */
            <div className="rounded-2xl border border-[var(--line)] bg-[#fafbf9] p-4 space-y-3.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid size-5.5 place-items-center rounded-full bg-[var(--brand)] text-white text-[10px] font-bold">1</span>
                  <h3 className="text-[14px] font-[850] text-[var(--ink)]">Search &amp; Pick Brand</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChangingBrand(false)}
                  className="text-[11.5px] font-bold text-gray-500 hover:text-black cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="size-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={brandSearchQuery}
                  onChange={(e) => setBrandSearchQuery(e.target.value)}
                  placeholder="Search brands (e.g. Velmora, Onkavia, 3D)..."
                  className="w-full pl-8.5 pr-4 py-2 rounded-xl border border-black/10 bg-white text-[12.5px] text-[var(--ink)] placeholder:text-gray-400 focus:outline-none focus:border-[var(--brand)] transition-all shadow-2xs"
                  autoFocus
                />
                {brandSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setBrandSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Compact Brands List */}
              <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
                {filteredBrands.map((brand) => {
                  const isSelected = selectedBrandId === brand.id;
                  return (
                    <div
                      key={brand.id}
                      onClick={() => handleSelectBrand(brand)}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer",
                        isSelected
                          ? "border-[var(--brand)] bg-[var(--tint)] font-semibold shadow-2xs"
                          : "border-black/[0.06] bg-white hover:border-black/20"
                      )}
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-[800] text-[var(--ink)] truncate">
                            {brand.name}
                          </span>
                          {brand.hasDossier ? (
                            <span className="rounded bg-emerald-50 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800 border border-emerald-200">
                              {brand.dossierIds?.length || 1} Dossier{brand.dossierIds && brand.dossierIds.length > 1 ? "s" : ""}
                            </span>
                          ) : (
                            <span className="rounded bg-amber-50 px-1.5 py-0.2 text-[9px] font-bold text-amber-800 border border-amber-200">
                              No dossier
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[var(--ink-muted)] truncate">
                          {brand.genericName} · {brand.therapyAreas.join(", ")}
                        </div>
                      </div>
                      <span
                        className={cn(
                          "grid size-4.5 place-items-center rounded-full border shrink-0",
                          isSelected
                            ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                            : "border-black/20 bg-white"
                        )}
                      >
                        {isSelected && <Check className="size-2.5" strokeWidth={3.5} />}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Add New Brand Button */}
              <button
                type="button"
                onClick={() => setIsAddBrandModalOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-[var(--line-strong)] hover:border-[var(--brand)] bg-white text-[12px] font-bold text-[var(--brand)] transition-all cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Add a new brand</span>
              </button>
            </div>
          )}

          {/* ── STEP 2: DOSSIER EVIDENCE & DOCUMENTS (MULTIPLE SELECTABLE DOSSIERS) ── */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-[var(--brand)]" />
                <h3 className="text-[15px] font-[850] text-[var(--ink)]">
                  Available Dossiers &amp; Regulatory Sources for {selectedBrand.name}
                </h3>
              </div>
              {selectedBrand.hasDossier && (
                <span className="text-[11px] font-bold text-[var(--ok)] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ✓ {availableDossiers.length} Options Available · Pick One
                </span>
              )}
            </div>

            {selectedBrand.hasDossier && availableDossiers.length > 0 ? (
              /* Case A: Multiple Selectable Dossiers for Brand */
              <div className="space-y-3.5">
                {availableDossiers.map((dossier) => {
                  const isSelected = activeDossier?.id === dossier.id;
                  return (
                    <div
                      key={dossier.id}
                      onClick={() => handleSelectDossier(dossier)}
                      className={cn(
                        "rounded-[20px] border p-4.5 transition-all duration-200 cursor-pointer",
                        isSelected
                          ? "border-[var(--brand)] bg-[var(--tint)]/60 ring-2 ring-[var(--brand)]/20 shadow-xs"
                          : "border-black/[0.08] bg-[#fafbf9] hover:border-black/20 hover:bg-white hover:shadow-2xs"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          {/* Radio Button */}
                          <span
                            className={cn(
                              "grid size-5.5 place-items-center rounded-full border transition-all shrink-0 mt-0.5",
                              isSelected
                                ? "border-[var(--brand)] bg-[var(--brand)] text-white shadow-2xs"
                                : "border-black/20 bg-white"
                            )}
                          >
                            {isSelected && <Check className="size-3" strokeWidth={3.5} />}
                          </span>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-[15.5px] font-[850] text-[var(--ink)] tracking-tight">
                                {dossier.name}
                              </h4>
                              {dossier.isSample && (
                                <span className="rounded-full bg-[#fef3c7] text-[#92400e] px-2 py-0.5 text-[9px] font-bold border border-[#fde68a]">
                                  Sample
                                </span>
                              )}
                            </div>
                            <span className="text-[11.5px] italic text-[var(--ink-3)] font-medium mt-0.5 block">
                              {dossier.molecule}
                            </span>
                          </div>
                        </div>

                        <span className="rounded-full bg-white px-2.5 py-0.5 font-bold text-[11px] text-[var(--ink-2)] border border-[var(--hair-2)] shrink-0">
                          {dossier.market}
                        </span>
                      </div>

                      {/* Visual Skeleton Bars */}
                      <div className="mt-3.5 rounded-[12px] bg-black/[0.03] p-2.5 border border-black/[0.04]">
                        <div className="flex items-center justify-between text-[11px] font-bold text-[var(--ink-3)] mb-1.5">
                          <span>Dossier Structure</span>
                          <span>{dossier.sections} sections · {dossier.claims} approved claims</span>
                        </div>
                        <div className="space-y-1.5">
                          {dossier.skeletonWidths.map((w, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <div className="h-1.5 rounded-full bg-black/10" style={{ width: `${w}%` }} />
                              <sup className="text-[8.5px] font-bold text-[var(--brand)]">[{i + 1}]</sup>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Attached Regulatory Documents */}
                      {dossier.documents && dossier.documents.length > 0 && (
                        <div className="mt-3.5 space-y-1.5 border-t border-[var(--hair)] pt-3">
                          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--ink-muted)]">
                            Attached Clinical Documents &amp; Labels ({dossier.documents.length})
                          </div>
                          {dossier.documents.map((doc, dIdx) => (
                            <div
                              key={dIdx}
                              className="flex items-center justify-between text-[11.5px] bg-white/90 border border-black/[0.06] rounded-lg px-2.5 py-1.5 shadow-2xs"
                            >
                              <span className="font-medium text-[var(--ink)] truncate max-w-[78%]">
                                📄 {doc.name}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                                {doc.citations} citations
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Case B: Brand has NO Dossier Yet */
              <div className="rounded-[22px] border border-dashed border-amber-300 bg-amber-50/50 p-6 text-center space-y-3.5">
                <div className="size-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-700 grid place-items-center mx-auto shadow-2xs">
                  <Sparkles className="size-6 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-[15.5px] font-[850] text-[var(--ink)]">
                    No Dossier Found for {selectedBrand.name}
                  </h4>
                  <p className="text-[12.5px] text-[var(--ink-muted)] max-w-[420px] mx-auto mt-1 leading-relaxed">
                    SwishX requires an approved brand dossier grounded in FDA/EMA prescribing labels and clinical readouts to synthesize compliant video.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => router.push("/dossiers")}
                  className="bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white font-extrabold text-[12.5px] h-10 px-5 rounded-xl shadow-xs gap-2 cursor-pointer transition-transform hover:-translate-y-0.5"
                >
                  <Sparkles className="size-4" />
                  <span>Upload or Create for {selectedBrand.name}</span>
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Sticky Mandatory Dropdowns Form */}
        <aside className="w-full lg:w-[390px] shrink-0 lg:sticky lg:top-[76px] self-start">
          <div className="squircle-card overflow-hidden border border-[var(--line)] bg-white shadow-[var(--shadow-sm)]">
            {/* Header */}
            <div className="border-b border-[var(--line)] bg-[#fafbf9] px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                  Step 2 · Video Configuration
                </span>
                <span className="rounded-full bg-[var(--ok-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--ok)]">
                  Mandatory
                </span>
              </div>
              <h2 className="mt-0.5 text-[16px] font-[850] tracking-tight text-[var(--ink)] truncate">
                {activeDossier ? activeDossier.name : `${selectedBrand.name} Dossier`}
              </h2>
            </div>

            {/* Dropdowns Form */}
            <div className="p-6 space-y-6">
              {/* 1. Output Frame / Aspect Ratio */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[12.5px] font-semibold text-[var(--ink-2)] tracking-tight">
                  <MonitorPlay className="size-3.5 text-[var(--brand)]" />
                  <span>Output Frame</span>
                  <span className="text-[11px] text-[var(--brand)] font-bold">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: "16:9", label: "16:9", sub: "Landscape" },
                    { id: "9:16", label: "9:16", sub: "Portrait" },
                    { id: "1:1", label: "1:1", sub: "Square" },
                  ].map((f) => {
                    const isSelected = format === f.id;
                    return (
                      <button
                        type="button"
                        key={f.id}
                        onClick={() => setFormat(f.id)}
                        className={cn(
                          "focus-ring flex flex-col items-center justify-center gap-1.5 rounded-[13px] border py-2.5 px-2 text-center transition-all duration-200 cursor-pointer",
                          isSelected
                            ? "border-[var(--brand)] bg-[var(--tint)] text-[var(--brand-deep)] font-semibold shadow-xs ring-1 ring-[var(--brand)]"
                            : "border-[var(--line)] bg-[#fafbf9] text-[var(--ink-2)] hover:border-[#cbd5d0] hover:bg-white"
                        )}
                      >
                        <span
                          className={cn(
                            "rounded-[2px] border-2 border-current block transition-colors",
                            f.id === "9:16" ? "h-5 w-3" : f.id === "1:1" ? "size-4" : "h-3.5 w-5"
                          )}
                        />
                        <div className="leading-none">
                          <span className="text-[12px] font-bold block">{f.label}</span>
                          <span className="text-[9.5px] text-[var(--ink-muted)] block mt-0.5">{f.sub}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Target Audience* */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[12.5px] font-semibold text-[var(--ink-2)] tracking-tight">
                  <Users className="size-3.5 text-[var(--brand)]" />
                  <span>Target Audience</span>
                  <span className="text-[11px] text-[var(--brand)] font-bold">*</span>
                </label>
                <SelectMenu
                  value={audience}
                  onChange={(next) => setAudience(next as Audience)}
                  options={AUDIENCE_OPTIONS}
                  ariaLabel="Target Audience"
                  placeholder="Choose target audience..."
                  renderIcon={(item) => <AudienceIcon value={item} />}
                />
              </div>

              {/* 3. Focus Topics* */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-[12.5px] font-semibold text-[var(--ink-2)] tracking-tight">
                    <Layers className="size-3.5 text-[var(--brand)]" />
                    <span>Focus Topics</span>
                    <span className="text-[11px] text-[var(--brand)] font-bold">*</span>
                  </label>
                  {topics.length > 0 && (
                    <span className="text-[10px] font-bold text-[var(--brand-deep)] bg-[var(--tint)] px-2 py-0.5 rounded-full border border-[var(--tint-line)]">
                      {topics.length} selected
                    </span>
                  )}
                </div>
                <MultiSelectMenu
                  values={topics}
                  onChange={(next) => setTopics(next)}
                  options={TOPIC_OPTIONS}
                  ariaLabel="Focus Topics"
                  placeholder="Select one or more topics..."
                  renderIcon={(item) => {
                    const Icon = topicIcons[item] || Pill;
                    return <Icon className="size-3.5 text-[var(--brand)]" />;
                  }}
                />
              </div>
            </div>

            {/* Grounding Footer Note */}
            <div className="mt-auto border-t border-[var(--line)] bg-[#f7f9f7] px-4 py-2.5 text-[11.5px] leading-4 text-[var(--ink-muted)]">
              All statements and scenes will be tailored to this configuration.
            </div>
          </div>

          {/* Standardized Continue Forward Button */}
          <Button
            onClick={handleContinueToBrief}
            size="lg"
            disabled={!canContinue}
            className="group mt-3 h-[48px] w-full px-6 rounded-[13px] text-[14.5px] font-bold shadow-md bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer"
          >
            <span>Start Project</span>
            <ArrowRight className="size-4 ml-1.5 transition-transform group-hover:translate-x-1" />
          </Button>

          <div className="mt-2 flex items-center justify-center gap-1.5 text-[11.5px] text-[var(--ink-muted)]">
            {!canContinue ? (
              <span className="text-[var(--warn)] font-medium text-center">
                {!selectedBrand.hasDossier
                  ? `Please upload or create a dossier for ${selectedBrand.name}`
                  : !isAudienceValid
                  ? "Please select an audience"
                  : "Please select at least 1 focus topic"}
              </span>
            ) : (
              <>
                <ShieldCheck className="size-3.5 text-[var(--brand)]" />
                <span>Step 1 and 2 are mandatory</span>
              </>
            )}
          </div>
        </aside>
      </div>

      {/* ── Add Brand Modal Dialog (Fixed & Sized Properly) ── */}
      {isAddBrandModalOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsAddBrandModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[490px] max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-black/10 animate-in zoom-in-95 duration-150 overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-4 shrink-0 bg-white">
              <h3 className="text-[17px] font-[850] text-[var(--ink)] tracking-tight">Add brand</h3>
              <button
                type="button"
                onClick={() => setIsAddBrandModalOpen(false)}
                className="size-7 rounded-full hover:bg-black/5 flex items-center justify-center text-gray-400 hover:text-black transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleAddBrandSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Brand Name */}
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-500 mb-1.5">
                    Brand / Product Name <span className="text-[var(--brand)]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    placeholder="e.g. Bisberry"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 text-[13px] font-medium text-[var(--ink)] focus:outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)]/20"
                    autoFocus
                  />
                </div>

                {/* Molecule(s) */}
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-500 mb-1.5">
                    Molecule(s) (Optional)
                  </label>
                  <input
                    type="text"
                    value={newBrandMolecule}
                    onChange={(e) => setNewBrandMolecule(e.target.value)}
                    placeholder="e.g. Diclofenac + Serratiopeptidase"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 text-[13px] font-medium text-[var(--ink)] focus:outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)]/20"
                  />
                  <p className="text-[10.5px] text-gray-400 mt-1">
                    For combination products, separate each molecule with + (e.g. Cetirizine + Ambroxol).
                  </p>
                </div>

                {/* Therapy Areas */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                      Therapy Area(s)
                    </label>
                    <button
                      type="button"
                      onClick={handleSelectAllTherapyAreas}
                      className="text-[11px] font-bold text-[var(--brand)] hover:underline cursor-pointer"
                    >
                      {newBrandTherapyAreas.length === ALL_THERAPY_AREAS.length
                        ? "Clear all"
                        : `Select all (${ALL_THERAPY_AREAS.length})`}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-[#f8f9f8] rounded-xl border border-black/[0.06]">
                    {ALL_THERAPY_AREAS.map((area) => {
                      const isSelected = newBrandTherapyAreas.includes(area);
                      return (
                        <button
                          type="button"
                          key={area}
                          onClick={() => handleToggleTherapyArea(area)}
                          className={cn(
                            "px-2.5 py-0.8 rounded-full text-[10.5px] font-medium transition-colors cursor-pointer border",
                            isSelected
                              ? "bg-[var(--brand)] text-white border-[var(--brand)] font-bold shadow-2xs"
                              : "bg-white text-[var(--ink-2)] border-black/10 hover:border-black/20"
                          )}
                        >
                          {area}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Sticky Modal Footer */}
              <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 border-t border-black/[0.06] bg-[#fafbf9] shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAddBrandModalOpen(false)}
                  className="font-bold text-[12.5px] text-[var(--ink-2)] h-9 px-4 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!newBrandName.trim()}
                  className="bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white font-bold text-[12.5px] h-9 px-5 rounded-xl cursor-pointer shadow-xs disabled:opacity-40"
                >
                  Add brand
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );

  if (embedded) {
    return <div className="pb-10">{content}</div>;
  }

  return (
    <div className="page-enter min-h-screen bg-[#f7f8f6] pb-10">
      {/* Minimal Back Button */}
      <div className="px-6 pt-5 pb-1">
        <button
          type="button"
          onClick={handleBackToMode}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}><path d="M15 18l-6-6 6-6" /></svg>
          Back
        </button>
      </div>
      {content}
    </div>
  );
}
