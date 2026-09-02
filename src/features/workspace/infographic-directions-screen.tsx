"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  FileCheck2,
  FileText,
  Globe2,
  History,
  Image as ImageIcon,
  Info,
  Layers,
  LayoutGrid,
  MoreHorizontal,
  Palette,
  PanelRight,
  Paperclip,
  Plus,
  Redo2,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Undo2,
  Upload,
  Users,
  X,
  ExternalLink,
  ChevronUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SwishXMark } from "@/components/ui/swishx-mark";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { cn } from "@/lib/cn";

type InfographicSubStep = "brief" | "content";
type PlanSectionId = "sources" | "treatment" | "audience" | "format" | "design" | "objective" | "assets";

interface AudienceOption {
  id: string;
  title: string;
  desc: string;
  whyFits: string;
}

const AUDIENCE_OPTIONS: AudienceOption[] = [
  { id: "hcp", title: "Doctor / HCP", desc: "Clinical detail, peer-to-peer tone", whyFits: "Deep mechanistic clarity with primary clinical endpoints & prescribing limits." },
  { id: "rep", title: "Sales Rep / Medical Rep", desc: "30-sec pitch, objection handling", whyFits: "Rapid 3-point value proposition and head-to-head objection handling." },
  { id: "patient", title: "Patient", desc: "Plain-language, what to expect", whyFits: "Clear, reassuring everyday language focusing on symptom relief and safety." },
  { id: "consumer", title: "Consumer", desc: "Benefit-led, everyday language", whyFits: "Accessible benefit-driven narrative without heavy clinical jargon." },
  { id: "procurement", title: "Hospital Procurement", desc: "Formulary value, evidence, supply & cost", whyFits: "Cost-effectiveness, hospital formulary integration, and supply reliability." },
  { id: "retailer", title: "Retailer / Stockist", desc: "Demand, margins, stocking decisions", whyFits: "Prescription velocity, stock turn rates, and pharmacy dispensing margins." },
];

const SPECIALTIES = [
  "Any specialty",
  "Dermatology",
  "Cardiology",
  "Oncology",
  "Endocrinology",
  "Neurology",
  "Rheumatology",
  "General Medicine",
];

const FORMAT_OPTIONS = [
  { id: "16:9", label: "Landscape 16:9", sub: "Screens, laptops, projected", whyFits: "Best for Veeva digital detailers and slide deck presentations." },
  { id: "3:4", label: "Portrait 3:4", sub: "Held upright, and prints well", whyFits: "Ideal for iPad clinical discussions and vertical digital reading." },
  { id: "A4", label: "A4 Document", sub: "Printed and left behind", whyFits: "Standard clinic leave-behind format with high-density evidence layout." },
];

const OBJECTIVE_OPTIONS = [
  { id: "awareness", label: "Awareness", desc: "They may not know the problem exists", whyFits: "Highlights disease burden and unmet clinical need in current treatment pathways." },
  { id: "consideration", label: "Consideration", desc: "They know it and are weighing it up", whyFits: "Compares novel mechanism and Phase III endpoints against current standard of care." },
  { id: "adoption", label: "Adoption", desc: "They are ready to prescribe or order", whyFits: "Focuses on dosing titration, eGFR cut-offs, and first-line prescription protocols." },
  { id: "retention", label: "Retention", desc: "They already use it", whyFits: "Reiterates 52-week durable skin clearance and long-term tolerability." },
];

const CONTENT_ANGLES = [
  "Product Introduction",
  "Mechanism of Action",
  "Indications",
  "Dosage & Safety",
  "Drug Interactions",
  "Side Effects",
];

const LOGO_PLACEMENTS = [
  { id: "bottom-right", label: "Bottom right", desc: "Beside the job code — the usual place" },
  { id: "bottom-left", label: "Bottom left", desc: "Footer, leading side" },
  { id: "top-right", label: "Top right", desc: "Trailing corner, above the content" },
  { id: "top-left", label: "Top left", desc: "Leading corner, above the content" },
  { id: "none", label: "No logo", desc: "Leave every page unbranded" },
];

interface TemplateArchetype {
  id: "stat-hero" | "trial-summary" | "bench-data" | "moa-scroll" | "burden-disease";
  name: string;
  tagline: string;
  accent: string;
  previewBg: string;
  badge: string;
  metric: string;
  metricSub: string;
  points: string[];
}

const TEMPLATE_ARCHETYPES: TemplateArchetype[] = [
  {
    id: "stat-hero",
    name: "Stat Hero",
    tagline: "A dark hero band, then two oversized headline figures, an icon grid and one chart. Suits a single result read from across a room.",
    accent: "#fd4816",
    previewBg: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
    badge: "PASI 90 Primary Readout",
    metric: "52% PASI 90",
    metricSub: "vs 18% Placebo (p < 0.001)",
    points: ["Over 50% skin clearance at Week 16", "Maintained through Week 52 extension", "Single daily oral administration"],
  },
  {
    id: "trial-summary",
    name: "Trial Summary",
    tagline: "Light and airy: pulled-out highlights box, credential bullets and time-course chart. For a single trial told properly.",
    accent: "#0284c7",
    previewBg: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
    badge: "EMBRACE-3 Pivotal Study",
    metric: "N=613 Patients",
    metricSub: "Multi-Center Randomized Trial",
    points: ["Dual kinase blockade mechanism", "CDSCO §2.1 label indication partition", "Zero microvascular adverse accumulation"],
  },
  {
    id: "bench-data",
    name: "Bench Data",
    tagline: "Circular callouts around measured values, with horizontal bar comparisons under them. Suits a head-to-head on key metrics.",
    accent: "#059669",
    previewBg: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
    badge: "Pharmacokinetic Profile",
    metric: "eGFR ≥25",
    metricSub: "Prescribing Cut-Off Threshold",
    points: ["Clear therapeutic window boundary", "Predictable systemic clearance", "Validated in renal impairment cohorts"],
  },
  {
    id: "moa-scroll",
    name: "Anatomy & MoA Scroll",
    tagline: "3D cellular pathways with dual kinase cascade diagram and tissue uptake markers.",
    accent: "#7c3aed",
    previewBg: "linear-gradient(135deg, #1e1035 0%, #2e1852 100%)",
    badge: "3D Cellular Cascade",
    metric: "Dual Kinase Block",
    metricSub: "Receptor Selectivity >350x",
    points: ["Selectively suppresses inflammatory cytokines", "Preserves peripheral vascular perfusion", "Fast receptor binding in dermis"],
  },
  {
    id: "burden-disease",
    name: "Burden of Disease",
    tagline: "Population epidemiology hero chart with prevalence curves and unmet need callouts.",
    accent: "#d97706",
    previewBg: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
    badge: "Epidemiological Need",
    metric: "8.2M Patients",
    metricSub: "Moderate-to-Severe Psoriasis",
    points: ["High flare recurrence under topical-only", "Substantial quality of life disruption", "Urgent requirement for targeted oral options"],
  },
];

interface SectionCitationItem {
  doc: string;
  quote: string;
  claimId: string;
  mlrRef: string;
}

interface ContentPlanSection {
  num: number;
  title: string;
  role: string;
  body: string;
  citations: SectionCitationItem[];
}

const CONTENT_PLAN_SECTIONS: ContentPlanSection[] = [
  {
    num: 1,
    title: "One molecule, three organ systems",
    role: "opens the artefact — core molecule introduction",
    body: "The opening line orients the reader: Velmora is a single once-daily oral dual kinase inhibitor whose approved licence spans moderate-to-severe plaque psoriasis, psoriatic arthritis, and systemic clinical clearance.",
    citations: [
      {
        doc: "VELMORA™ Summary of Product Characteristics (SmPC) §1.1",
        quote: "Velmora (tirzelamide) 200mg is a selective dual kinase inhibitor indicated for moderate-to-severe plaque psoriasis and multi-organ inflammatory management.",
        claimId: "Claim #104",
        mlrRef: "CDSCO SmPC §1.1 · Approved 2026",
      },
    ],
  },
  {
    num: 2,
    title: "Approved in India for three indications",
    role: "how it is used · a partition across domains",
    body: "The CDSCO-approved uses, side by side: moderate-to-severe plaque psoriasis in adults 18+ to achieve rapid skin clearance; active psoriatic arthritis; and sustained reduction of flare recurrence risk.",
    citations: [
      {
        doc: "CDSCO Prescribing Information §1.1 · Indication Scope",
        quote: "Indicated for the treatment of moderate-to-severe plaque psoriasis in adult patients who are candidates for systemic therapy or phototherapy.",
        claimId: "Claim #112",
        mlrRef: "CDSCO Approval §1.1",
      },
      {
        doc: "CDSCO Prescribing Information §1.2 · Arthritis Indication",
        quote: "Approved for active psoriatic arthritis in adults with inadequate response or intolerance to conventional DMARD therapy.",
        claimId: "Claim #113",
        mlrRef: "CDSCO Approval §1.2",
      },
      {
        doc: "Prescribing Information §1.4 · Recurrence Prevention",
        quote: "Significantly lowers the rate of annual cutaneous flare recurrence in sustained maintenance cohorts.",
        claimId: "Claim #115",
        mlrRef: "CDSCO Efficacy Readout §1.4",
      },
    ],
  },
  {
    num: 3,
    title: "Where the licence stops: eGFR ≥25",
    role: "how it is used · a comparison at one moment",
    body: "The one threshold a prescriber has to know at a first meeting: for chronic management, initiation is not recommended below eGFR 25 mL/min/1.73m². Patients already on treatment may continue 10 mg once daily under monitoring.",
    citations: [
      {
        doc: "Dosing & Administration §2.1 (Renal Impairment Threshold)",
        quote: "Initiation of Velmora is not recommended in patients with an estimated glomerular filtration rate (eGFR) below 25 mL/min/1.73 m².",
        claimId: "Claim #128",
        mlrRef: "CDSCO Dosing Guidance §2.1",
      },
    ],
  },
  {
    num: 4,
    title: "Dual Mechanism of Action",
    role: "how it works · a causal chain",
    body: "Dual-action cellular kinase blockade selectively suppresses inflammatory phosphorylation cascades, lowering tissue cytokines while preserving peripheral microvascular perfusion.",
    citations: [
      {
        doc: "Lancet Dermatology 2024; 42:118-129 · MoA Characterization",
        quote: "Tirzelamide selectively inhibits kinase phosphorylation cascades with >350-fold selectivity, suppressing IL-23 and IL-17 cytokine output without microvascular accumulation.",
        claimId: "Claim #142",
        mlrRef: "Lancet Derm 2024; 42:118",
      },
      {
        doc: "Cellular Immunology Journal §3.4",
        quote: "Selective target occupancy in dermal tissue confirms localized anti-inflammatory suppression with rapid systemic clearance.",
        claimId: "Claim #144",
        mlrRef: "Cellular Imm §3.4",
      },
    ],
  },
  {
    num: 5,
    title: "Primary Efficacy Endpoint: 52% PASI 90",
    role: "clinical proof · pivotal trial results",
    body: "In the pivotal EMBRACE-3 study (N=613), 52% of patients achieved PASI 90 clear skin at Week 16 vs 18% in placebo (p < 0.001), maintained through Week 52.",
    citations: [
      {
        doc: "EMBRACE-3 Pivotal Phase III Study Readout Table 2.4",
        quote: "52.4% of patients receiving Velmora 200mg achieved PASI 90 at Week 16 compared with 18.1% receiving placebo (p < 0.001; 95% CI: 26.8%–41.8%).",
        claimId: "Claim #214",
        mlrRef: "EMBRACE-3 Readout Table 2.4",
      },
      {
        doc: "EMBRACE-3 Long-Term Extension Cohort §4.2",
        quote: "84.6% of Week 16 PASI 90 responders maintained clear or almost clear skin through Week 52 open-label extension.",
        claimId: "Claim #216",
        mlrRef: "EMBRACE-3 52-Week Data",
      },
    ],
  },
  {
    num: 6,
    title: "Important Safety Information (ISI) & Tolerability",
    role: "mandatory fair balance · compliance grounding",
    body: "Contraindicated in patients with severe hepatic impairment. Most common adverse events include transient mild headache (5.1%) and nausea (4.2%). Full prescribing guidance provided.",
    citations: [
      {
        doc: "CDSCO Safety Section §5.2 · Adverse Reactions & Contraindications",
        quote: "Contraindicated in patients with severe hepatic impairment (Child-Pugh Class C). Most common adverse events were mild headache (5.1%) and nausea (4.2%).",
        claimId: "Claim #290",
        mlrRef: "CDSCO Safety §5.2",
      },
    ],
  },
];

export function InfographicDirectionsScreen() {
  const router = useRouter();
  const {
    brief,
    audience,
    topics,
    pageShape,
    infographicPages,
    infographicTemplate,
    infographicLogoPlacement,
    sourcePayload,
    chatMessages,
    setChatMessages,
    addChatMessage,
    setAudience,
    setPageShape,
    setInfographicPages,
    setInfographicTemplate,
    setInfographicLogoPlacement,
    setTopics,
    setBrief,
    setView,
    setVideoSubStage,
    copilotPanelOpen,
    toggleCopilotPanel,
  } = useWorkspaceStore();

  const brandName = sourcePayload?.dossierId === "onkavia" ? "Onkavia" : sourcePayload?.dossierId === "pulmovax" ? "PulmoVax" : "Velmora";

  const [currentStep, setCurrentStep] = useState<InfographicSubStep>("brief");
  const [openSection, setOpenSection] = useState<PlanSectionId | null>("sources");
  const [sourceGroundingMode, setSourceGroundingMode] = useState<"both" | "my-sources" | "swishx-only">("both");
  const [uploadedDocs, setUploadedDocs] = useState<Array<{ name: string; size: string; date: string }>>([
    { name: `${brandName}_Clinical_Summary_LeaveBehind.pdf`, size: "3.6 MB", date: "Today" },
    { name: `${brandName}_Visual_Claims_Master.docx`, size: "720 KB", date: "Today" },
  ]);
  const docUploadRef = useRef<HTMLInputElement>(null);

  // Local state for brief questions
  const [selectedAudienceId, setSelectedAudienceId] = useState<string>(audience === "Patient" ? "patient" : audience === "Consumer" ? "consumer" : "hcp");
  const [specialty, setSpecialty] = useState<string>("Dermatology");
  const [language, setLanguage] = useState<string>("English");
  const [objective, setObjective] = useState<string>("adoption");
  const [selectedAngles, setSelectedAngles] = useState<string[]>(["Product Introduction", "Mechanism of Action", "Indications"]);
  const [packshots, setPackshots] = useState<Array<{ id: string; name: string; url: string }>>([
    {
      id: "packshot-1",
      name: `${brandName}_Autoinjector_3D_Packshot.png`,
      url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
    },
  ]);

  // Expanded citations state in Content step
  const [expandedCitations, setExpandedCitations] = useState<Record<number, boolean>>({
    2: true, // Expand section 2 by default for discovery
    5: true,
  });

  const toggleCitation = (secNum: number) => {
    setExpandedCitations((prev) => ({
      ...prev,
      [secNum]: !prev[secNum],
    }));
  };

  // Chat state
  const [chatInput, setChatInput] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const fileUploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, currentStep]);

  const toggleAngle = (angle: string) => {
    setSelectedAngles((prev) =>
      prev.includes(angle) ? prev.filter((a) => a !== angle) : [...prev, angle]
    );
  };

  const handleSendChat = (directText?: string) => {
    const text = directText || chatInput.trim();
    if (!text) return;

    addChatMessage({ role: "user", text });
    if (!directText) setChatInput("");

    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = `Understood. I have updated the creative parameters grounded in the **${brandName}** dossier.`;

      if (lower.includes("16:9") || lower.includes("landscape")) {
        setPageShape("16:9");
        reply = `Updated page shape to **Landscape 16:9** (optimized for screen projection and desktop detailers).`;
      } else if (lower.includes("3:4") || lower.includes("portrait")) {
        setPageShape("3:4");
        reply = `Updated page shape to **Portrait 3:4** (ideal for iPad detailers and vertical reading).`;
      } else if (lower.includes("a4") || lower.includes("print")) {
        setPageShape("A4");
        reply = `Updated page format to **A4 Print** with standard 3mm bleed and print-ready typography.`;
      } else if (lower.includes("stat hero") || lower.includes("stat")) {
        setInfographicTemplate("stat-hero");
        reply = `Selected **Stat Hero** template: dark hero band with high-impact PASI 90 clearance callouts.`;
      } else if (lower.includes("trial summary") || lower.includes("trial")) {
        setInfographicTemplate("trial-summary");
        reply = `Selected **Trial Summary** template: clean highlights box with study credential markers.`;
      } else if (lower.includes("bench data") || lower.includes("bench")) {
        setInfographicTemplate("bench-data");
        reply = `Selected **Bench Data** template: circular callouts and horizontal bar metrics.`;
      } else if (lower.includes("2 page") || lower.includes("two")) {
        setInfographicPages("2");
        reply = `Expanded format to **Two Pages** (Front summary + back evidence and safety breakdown).`;
      } else if (lower.includes("1 page") || lower.includes("one")) {
        setInfographicPages("1");
        reply = `Set format to **One Page** concise executive leave-behind.`;
      }

      addChatMessage({ role: "swishx", text: reply });
    }, 450);
  };

  const selectedTemplate = TEMPLATE_ARCHETYPES.find((t) => t.id === infographicTemplate) || TEMPLATE_ARCHETYPES[0];

  return (
    <div className="flex h-screen min-h-[720px] flex-col overflow-hidden bg-[#eef1ed] text-left">
      {/* ─── Clean Header Bar (Identical to Video Screen) ─── */}
      <header className="z-30 flex h-[60px] shrink-0 items-center border-b border-[var(--line)] bg-white px-3 sm:px-5">
        <button
          type="button"
          onClick={() => {
            if (currentStep === "content") setCurrentStep("brief");
            else {
              setVideoSubStage("intake");
              setView("create");
            }
          }}
          className="focus-ring mr-2 grid size-8 place-items-center rounded-lg text-[var(--ink-muted)] hover:bg-black/5 cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="size-4" />
        </button>

        <SwishXMark compact />
        <div className="mx-3 h-5 w-px bg-[var(--line)]" />

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-[12.5px] font-[800] text-[var(--ink)]">
              {brandName} HCP launch
            </span>
            <span className="hidden rounded-full bg-[#edf1ee] px-2 py-0.5 text-[9px] font-bold text-[#69736e] sm:inline">
              Draft v1
            </span>
          </div>
          <div className="mt-0.5 hidden text-[9.5px] text-[var(--ink-muted)] sm:block">
            Saved just now · Canvas Studio · MLR Ready
          </div>
        </div>

        {/* State Switcher in Header */}
        <div className="ml-6 hidden items-center gap-1 sm:flex">
          <span className="rounded-full bg-[var(--tint)] px-2.5 py-0.5 text-[10.5px] font-extrabold tracking-wide text-[var(--brand-deep)] border border-[var(--tint-line)]">
            {currentStep === "brief" ? "Plan View" : "Blueprint View"}
          </span>
        </div>

        <div className="ml-4 hidden items-center gap-0.5 lg:flex">
          <Button variant="ghost" size="icon" aria-label="Undo">
            <Undo2 className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Redo" disabled>
            <Redo2 className="size-4" />
          </Button>
          <div className="mx-1 h-5 w-px bg-[var(--line)]" />
          <Button variant="ghost" size="sm">
            <History className="size-3.5" /> Versions
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Toggle Right Sidebar Panel Button */}
          <button
            type="button"
            onClick={toggleCopilotPanel}
            className={cn(
              "grid size-8 place-items-center rounded-lg border transition-colors cursor-pointer",
              copilotPanelOpen
                ? "border-black/15 bg-black/5 text-[var(--ink)] hover:bg-black/10"
                : "border-black/10 bg-white text-[var(--ink-muted)] hover:text-[var(--ink)] hover:border-[var(--brand)] shadow-2xs"
            )}
            title={copilotPanelOpen ? "Collapse sidebar (⌘\\)" : "Expand sidebar (⌘\\)"}
          >
            <PanelRight className="size-4" />
          </button>
        </div>
      </header>

      {/* ─── Main Body: Left Planning Canvas / Right SwishX Assistant ─── */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* ── LEFT CANVAS ── */}
        <section
          style={{
            width: copilotPanelOpen ? "calc(100% - 410px)" : "100%",
            minWidth: copilotPanelOpen ? "calc(100% - 410px)" : "100%",
            maxWidth: copilotPanelOpen ? "calc(100% - 410px)" : "100%",
            transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          className="flex flex-col shrink-0 min-h-0 border-r border-[var(--line)] bg-[#eef1ed] overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-4 relative"
        >
          {/* ══════════════════════════════════════════════════════════════════
              STAGE 1: BRIEF & CREATIVE PARAMETERS (Exact Layout as Video Screen)
             ══════════════════════════════════════════════════════════════════ */}
          {currentStep === "brief" && (
            <>
              {/* Header in Left Canvas (Identical to Video Screen) */}
              <div className="flex items-center justify-between pb-1 shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--brand)]">
                      Available Context
                    </span>
                    <span className="rounded-full bg-[var(--ok-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--ok)] border border-emerald-200">
                      Grounding active
                    </span>
                  </div>
                  <h2 className="text-[20px] font-[850] text-[var(--ink)] tracking-tight mt-0.5">
                    {brandName} Dossier Plan &amp; Creative Parameters
                  </h2>
                  <p className="text-[12.5px] text-[var(--ink-muted)] mt-0.5">
                    Refine audience target, page format, layout archetype, and clinical angles before confirming the creative.
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-[11.5px] font-bold text-[var(--ok)] border border-[var(--line)] shadow-2xs">
                    ✓ 214 approved claims cited
                  </span>
                </div>
              </div>

              {/* ─── Rich Accordion Sections with Distinct Icons & Zoom Animation ─── */}
              <div className="space-y-3 min-w-0 w-full">
                {/* 1. Research & Sources (Unified Top Starting Tile) */}
                <CreativePlanSection
                  icon={ShieldCheck}
                  title="Research and Sources"
                  summary={
                    sourceGroundingMode === "both"
                      ? `${brandName} SmPC Dossier + ${uploadedDocs.length} custom files active`
                      : sourceGroundingMode === "my-sources"
                      ? `${uploadedDocs.length} custom files active · Dossier ignored`
                      : `${brandName} SmPC Approved Dossier · 214 claims`
                  }
                  status="From source"
                  tone="done"
                  open={openSection === "sources"}
                  onToggle={() => setOpenSection(openSection === "sources" ? null : "sources")}
                >
                  <div className="space-y-4">
                    <p className="text-[12.5px] text-[var(--ink-2)] leading-relaxed">
                      Select how SwishX grounds every clinical chart, scientific claim, and citation against verified evidence and research materials.
                    </p>

                    {/* Pre-built dossiers matching the brand/disease */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                          Prebuilt Approved Dossiers ({brandName})
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          ✓ Verified SmPC / Label Data
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {[
                          {
                            name: `${brandName} Core SmPC & Prescribing Info`,
                            market: "🇺🇸 US · FDA",
                            claims: "214 claims",
                            doc: "Prescribing Info (Rev. 04/2026)",
                            citations: "112 citations",
                          },
                          {
                            name: `${brandName} Phase III Pivotal Readout`,
                            market: "🌐 Global · NEJM",
                            claims: "64 claims",
                            doc: "CLARITY-CV Phase III Trial",
                            citations: "64 citations",
                          },
                          {
                            name: `${brandName} HEOR & Value Evidence`,
                            market: "🇪🇺 EU · EMA",
                            claims: "128 claims",
                            doc: "QALY & Budget Impact Model",
                            citations: "30 citations",
                          },
                        ].map((dossier, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "p-3 rounded-[14px] border text-left flex flex-col justify-between transition-all",
                              sourceGroundingMode === "my-sources"
                                ? "opacity-50 border-black/10 bg-[#f9faf9] grayscale"
                                : "border-[#e3e8e5] bg-white shadow-2xs"
                            )}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[10px] font-extrabold uppercase tracking-wide text-[var(--ink-muted)]">
                                  {dossier.market}
                                </span>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                                  {dossier.claims}
                                </span>
                              </div>
                              <div className="text-[12.5px] font-bold text-[var(--ink)] leading-snug line-clamp-1">
                                {dossier.name}
                              </div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-black/5 flex items-center justify-between text-[11px] text-[var(--ink-muted)]">
                              <span className="truncate max-w-[130px]">📄 {dossier.doc}</span>
                              <span className="font-semibold text-[var(--ink-2)] shrink-0">{dossier.citations}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 3 Grounding Options */}
                    <div className="space-y-2 pt-2 border-t border-black/5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                        Select Grounding Source Mode
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {[
                          {
                            id: "both" as const,
                            title: "Both SwishX dossiers and My sources / attachments",
                            desc: "Both documents are referenced, and every claim is cited to the one it came from.",
                          },
                          {
                            id: "my-sources" as const,
                            title: "Only My sources and attachments",
                            desc: "The dossier is ignored as a source; claims are grounded strictly in your files.",
                          },
                          {
                            id: "swishx-only" as const,
                            title: "Only SwishX approved dossiers",
                            desc: "Grounds strictly on verified SmPC, FDA prescribing info, and clinical packages.",
                          },
                        ].map((opt) => {
                          const isSelected = sourceGroundingMode === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setSourceGroundingMode(opt.id)}
                              className={cn(
                                "p-3.5 rounded-[16px] border text-left transition cursor-pointer flex flex-col justify-between min-h-[95px]",
                                isSelected
                                  ? "border-2 border-[var(--brand)] bg-white text-[var(--ink)] shadow-2xs ring-2 ring-[var(--brand)]/15"
                                  : "border-[#e3e8e5] bg-white hover:border-[#cbd6d0] hover:bg-[#fafbf9]"
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="font-bold text-[13px] leading-snug">{opt.title}</div>
                                <div
                                  className={cn(
                                    "size-4.5 rounded-full border-2 grid place-items-center shrink-0 mt-0.5",
                                    isSelected
                                      ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                                      : "border-[#cbd6d0]"
                                  )}
                                >
                                  {isSelected && <Check className="size-3 stroke-[3]" />}
                                </div>
                              </div>
                              <div className="text-[11px] text-[var(--ink-muted)] mt-2 leading-snug">{opt.desc}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Uploaded Documents Context */}
                    {(sourceGroundingMode === "both" || sourceGroundingMode === "my-sources") && (
                      <div className="space-y-2 pt-2 border-t border-black/5 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                            My Uploaded Documents & Briefs ({uploadedDocs.length})
                          </span>
                          <button
                            type="button"
                            onClick={() => docUploadRef.current?.click()}
                            className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[var(--brand)] hover:underline cursor-pointer"
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
                              setUploadedDocs((prev) => [...prev, ...newFiles]);
                            }
                          }}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {uploadedDocs.map((doc, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between gap-2 p-2.5 rounded-[12px] bg-white border border-[#e3e8e5] text-[12px]"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="size-4 text-[var(--brand)] shrink-0" />
                                <span className="font-semibold text-[var(--ink)] truncate">{doc.name}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] text-[var(--ink-muted)]">{doc.size}</span>
                                <button
                                  type="button"
                                  onClick={() => setUploadedDocs((prev) => prev.filter((_, i) => i !== idx))}
                                  className="grid size-5 place-items-center rounded-full text-[var(--ink-muted)] hover:bg-black/5 hover:text-red-600 transition-colors cursor-pointer"
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
                        onClick={() => setOpenSection("format")}
                        className="text-[12px] font-bold gap-1 cursor-pointer"
                      >
                        <span>Save &amp; Continue</span>
                        <ArrowRight className="size-3" />
                      </Button>
                    </div>
                  </div>
                </CreativePlanSection>

                {/* 2. Format & Page Shape */}
                <CreativePlanSection
                  icon={LayoutGrid}
                  title="Format & Page shape"
                  summary={`${FORMAT_OPTIONS.find((f) => f.id === pageShape)?.label || "Portrait 3:4"}`}
                  status="From brief"
                  tone="done"
                  open={openSection === "format"}
                  onToggle={() => setOpenSection(openSection === "format" ? null : "format")}
                >
                  <div className="space-y-4">
                    <div className="rounded-xl bg-[#f5f8f6] p-3 border border-[#e1e9e4]">
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--brand-deep)] mb-0.5">
                        Why this fits
                      </div>
                      <p className="text-[12.5px] text-[var(--ink-2)]">
                        {FORMAT_OPTIONS.find((f) => f.id === pageShape)?.whyFits || "Ideal for iPad clinical discussions and vertical digital reading."}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {FORMAT_OPTIONS.map((fmt) => {
                        const isSelected = pageShape === fmt.id;
                        return (
                          <button
                            key={fmt.id}
                            type="button"
                            onClick={() => setPageShape(fmt.id as any)}
                            className={cn(
                              "relative p-3.5 rounded-[14px] border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[85px]",
                              isSelected
                                ? "border-2 border-[var(--brand)] bg-white text-[var(--ink)] shadow-xs"
                                : "border-[#e3e8e5] bg-white hover:border-[#cbd6d0] hover:bg-[#fafbf9]"
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="font-bold text-[13.5px]">{fmt.label}</div>
                              <div
                                className={cn(
                                  "size-4.5 rounded-full border-2 grid place-items-center shrink-0 mt-0.5",
                                  isSelected
                                    ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                                    : "border-[#cbd6d0]"
                                )}
                              >
                                {isSelected && <Check className="size-2.5 stroke-[3]" />}
                              </div>
                            </div>
                            <div className="text-[11.5px] text-[var(--ink-muted)] mt-1">{fmt.sub}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </CreativePlanSection>

                {/* 2. Message and Audience */}
                <CreativePlanSection
                  icon={Users}
                  title="Message and audience"
                  summary={`${AUDIENCE_OPTIONS.find((a) => a.id === selectedAudienceId)?.title || "Doctor / HCP"} · ${specialty} · ${language}`}
                  status="Confirmed"
                  tone="done"
                  open={openSection === "audience"}
                  onToggle={() => setOpenSection(openSection === "audience" ? null : "audience")}
                >
                  <div className="space-y-4">
                    <div className="rounded-xl bg-[#f5f8f6] p-3 border border-[#e1e9e4]">
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--brand-deep)] mb-0.5">
                        Why this fits
                      </div>
                      <p className="text-[12.5px] text-[var(--ink-2)]">
                        {AUDIENCE_OPTIONS.find((a) => a.id === selectedAudienceId)?.whyFits || "Deep mechanistic clarity with primary clinical endpoints & prescribing limits."}
                      </p>
                    </div>

                    <div>
                      <div className="text-[13px] font-bold text-[var(--ink)] mb-2.5">Who is this for?</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {AUDIENCE_OPTIONS.map((opt) => {
                          const isSelected = selectedAudienceId === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setSelectedAudienceId(opt.id);
                                setAudience(opt.title.split("/")[0].trim() as any);
                              }}
                              className={cn(
                                "relative p-3.5 rounded-[14px] border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[90px]",
                                isSelected
                                  ? "border-2 border-[var(--brand)] bg-white text-[var(--ink)] shadow-xs"
                                  : "border-[#e3e8e5] bg-white hover:border-[#cbd6d0] hover:bg-[#fafbf9]"
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="font-bold text-[13.5px] text-[var(--ink)]">{opt.title}</div>
                                <div
                                  className={cn(
                                    "size-4.5 rounded-full border-2 grid place-items-center shrink-0 mt-0.5",
                                    isSelected
                                      ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                                      : "border-[#cbd6d0]"
                                  )}
                                >
                                  {isSelected && <Check className="size-2.5 stroke-[3]" />}
                                </div>
                              </div>
                              <div className="text-[11.5px] text-[var(--ink-muted)] mt-1.5 leading-snug">{opt.desc}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-[12px] font-bold text-[var(--ink)] mb-1">
                          Specialty (optional)
                        </label>
                        <select
                          value={specialty}
                          onChange={(e) => setSpecialty(e.target.value)}
                          className="w-full h-10 rounded-xl border border-black/15 bg-[#f7f8f6] px-3 text-[13px] font-semibold text-[var(--ink)] outline-none focus:border-[var(--brand)]"
                        >
                          {SPECIALTIES.map((sp) => (
                            <option key={sp} value={sp}>
                              {sp}
                            </option>
                          ))}
                        </select>
                        <p className="text-[10.5px] text-[var(--ink-muted)] mt-1">
                          Decides which endpoints and terminology count as key messages.
                        </p>
                      </div>

                      <div>
                        <label className="block text-[12px] font-bold text-[var(--ink)] mb-1">Language</label>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full h-10 rounded-xl border border-black/15 bg-[#f7f8f6] px-3 text-[13px] font-semibold text-[var(--ink)] outline-none focus:border-[var(--brand)]"
                        >
                          <option value="English">English</option>
                          <option value="Hindi">Hindi</option>
                          <option value="Spanish">Spanish</option>
                          <option value="French">French</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </CreativePlanSection>

                {/* 3. Design & Layout Archetype */}
                <CreativePlanSection
                  icon={Palette}
                  title="Design & Layout Archetype"
                  summary={`${selectedTemplate.name} · ${selectedTemplate.badge}`}
                  status="Recommended"
                  tone="done"
                  open={openSection === "design"}
                  onToggle={() => setOpenSection(openSection === "design" ? null : "design")}
                >
                  <div className="space-y-4">
                    <div className="rounded-xl bg-[#f5f8f6] p-3 border border-[#e1e9e4]">
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--brand-deep)] mb-0.5">
                        Visual layout structure
                      </div>
                      <p className="text-[12.5px] text-[var(--ink-2)]">
                        The deck is built from one of these archetypes. Each sample carries the typography, charts, and layout elements the creative will use.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                      {TEMPLATE_ARCHETYPES.map((tpl) => {
                        const isSelected = infographicTemplate === tpl.id;
                        return (
                          <div
                            key={tpl.id}
                            onClick={() => setInfographicTemplate(tpl.id)}
                            className={cn(
                              "rounded-[14px] border bg-white p-3.5 transition-all duration-200 flex flex-col justify-between cursor-pointer relative shadow-2xs hover:shadow-md",
                              isSelected
                                ? "border-2 border-[var(--brand)] bg-white shadow-xs"
                                : "border-[#e3e8e5] hover:border-[#cbd6d0] hover:bg-[#fafbf9]"
                            )}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="text-[14.5px] font-bold text-[var(--ink)]">{tpl.name}</h3>
                                {isSelected ? (
                                  <span className="size-4.5 rounded-full bg-[var(--brand)] text-white grid place-items-center text-[10px] font-black">
                                    ✓
                                  </span>
                                ) : (
                                  <span className="size-4.5 rounded-full border-2 border-[#cbd6d0] shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] text-[var(--ink-muted)] leading-snug mb-2.5 line-clamp-2">{tpl.tagline}</p>

                              <div
                                style={{ background: tpl.previewBg }}
                                className="rounded-xl p-3 text-white mb-2.5 shadow-inner min-h-[115px] flex flex-col justify-between"
                              >
                                <div>
                                  <span className="inline-block px-1.5 py-0.5 rounded bg-white/20 text-[8.5px] font-extrabold uppercase tracking-wide">
                                    {tpl.badge}
                                  </span>
                                  <div className="text-[17px] font-black tracking-tight mt-1 leading-none">
                                    {tpl.metric}
                                  </div>
                                  <div className="text-[9.5px] text-white/70 mt-0.5">{tpl.metricSub}</div>
                                </div>

                                <div className="space-y-0.5 pt-1.5 border-t border-white/15">
                                  {tpl.points.slice(0, 2).map((pt, i) => (
                                    <div key={i} className="text-[9px] text-white/85 flex items-center gap-1 truncate">
                                      <span className="size-1 rounded-full bg-white/60 shrink-0" />
                                      <span>{pt}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <Button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setInfographicTemplate(tpl.id);
                              }}
                              variant={isSelected ? "primary" : "secondary"}
                              size="sm"
                              className={cn(
                                "w-full h-8 rounded-xl text-[11.5px] font-bold transition cursor-pointer",
                                isSelected
                                  ? "bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white"
                                  : "border-black/15 hover:border-[var(--brand)] text-[var(--ink)]"
                              )}
                            >
                              {isSelected ? `Using ${tpl.name}` : `Use ${tpl.name}`}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CreativePlanSection>

                {/* 4. What should this deck achieve? (Objective & Angle) */}
                <CreativePlanSection
                  icon={Target}
                  title="What should this deck achieve? (Objective & Angle)"
                  summary={`${OBJECTIVE_OPTIONS.find((o) => o.id === objective)?.label || "Adoption"} · ${selectedAngles.length} topics`}
                  status="Recommended"
                  tone="done"
                  open={openSection === "objective"}
                  onToggle={() => setOpenSection(openSection === "objective" ? null : "objective")}
                >
                  <div className="space-y-4">
                    <div className="rounded-xl bg-[#f5f8f6] p-3 border border-[#e1e9e4]">
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--brand-deep)] mb-0.5">
                        Why this fits
                      </div>
                      <p className="text-[12.5px] text-[var(--ink-2)]">
                        {OBJECTIVE_OPTIONS.find((o) => o.id === objective)?.whyFits || "Focuses on dosing titration, eGFR cut-offs, and first-line prescription protocols."}
                      </p>
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-[var(--ink)] mb-1.5">
                        Campaign Objective
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                        {OBJECTIVE_OPTIONS.map((obj) => {
                          const isSelected = objective === obj.id;
                          return (
                            <button
                              key={obj.id}
                              type="button"
                              onClick={() => setObjective(obj.id)}
                              className={cn(
                                "relative p-3 rounded-[14px] border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[80px]",
                                isSelected
                                  ? "border-2 border-[var(--brand)] bg-white text-[var(--ink)] shadow-xs"
                                  : "border-[#e3e8e5] bg-white hover:border-[#cbd6d0] hover:bg-[#fafbf9]"
                              )}
                            >
                              <div className="flex items-start justify-between">
                                <div className="font-bold text-[13px]">{obj.label}</div>
                                <div
                                  className={cn(
                                    "size-4.5 rounded-full border-2 grid place-items-center shrink-0",
                                    isSelected
                                      ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                                      : "border-[#cbd6d0]"
                                  )}
                                >
                                  {isSelected && <Check className="size-2.5 stroke-[3]" />}
                                </div>
                              </div>
                              <div className="text-[10.5px] text-[var(--ink-muted)] mt-1 leading-tight">{obj.desc}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-[var(--ink)] mb-1.5">
                        Content Angles (Select topics to prioritize)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {CONTENT_ANGLES.map((ang) => {
                          const isSelected = selectedAngles.includes(ang);
                          return (
                            <button
                              key={ang}
                              type="button"
                              onClick={() => toggleAngle(ang)}
                              className={cn(
                                "px-3.5 py-1.5 rounded-xl border text-[12px] font-bold transition cursor-pointer flex items-center gap-1.5",
                                isSelected
                                  ? "bg-[var(--brand)] text-white border-[var(--brand)] shadow-2xs hover:bg-[var(--brand-deep)]"
                                  : "bg-white text-[var(--ink-2)] border-black/10 hover:border-black/25 hover:bg-[#fafbf9]"
                              )}
                            >
                              {isSelected && <Check className="size-3 stroke-[3]" />}
                              <span>{ang}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CreativePlanSection>

                {/* 5. Product & Brand Visual Assets */}
                <CreativePlanSection
                  icon={ImageIcon}
                  title="Product & Device Visual Assets"
                  summary={`${LOGO_PLACEMENTS.find((l) => l.id === infographicLogoPlacement)?.label || "Bottom right"} · ${infographicPages === "2" ? "2 pages" : "1 page"}`}
                  status="Optional"
                  tone="default"
                  open={openSection === "assets"}
                  onToggle={() => setOpenSection(openSection === "assets" ? null : "assets")}
                >
                  <div className="space-y-4">
                    <div>
                      <div className="text-[12.5px] font-bold text-[var(--ink)] mb-1">Logo placement</div>
                      <p className="text-[11px] text-[var(--ink-muted)] mb-2">
                        Every page keeps this corner clear, and your approved logo is placed into it after the page is drawn.
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {LOGO_PLACEMENTS.map((lp) => {
                          const isSelected = infographicLogoPlacement === lp.id;
                          return (
                            <button
                              key={lp.id}
                              type="button"
                              onClick={() => setInfographicLogoPlacement(lp.id as any)}
                              className={cn(
                                "p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between min-h-[75px]",
                                isSelected
                                  ? "border-2 border-[var(--brand)] bg-white text-[var(--ink)] shadow-2xs"
                                  : "border-[#e3e8e5] bg-white hover:border-[#cbd6d0] hover:bg-[#fafbf9]"
                              )}
                            >
                              <div className="flex items-start justify-between">
                                <div className="font-bold text-[12px]">{lp.label}</div>
                                <div
                                  className={cn(
                                    "size-4 rounded-full border-2 grid place-items-center shrink-0",
                                    isSelected
                                      ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                                      : "border-[#cbd6d0]"
                                  )}
                                >
                                  {isSelected && <Check className="size-2.5 stroke-[3]" />}
                                </div>
                              </div>
                              <div className="text-[9.5px] text-[var(--ink-muted)] mt-0.5 leading-tight">{lp.desc}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="text-[12.5px] font-bold text-[var(--ink)] mb-1">Product packshots (Optional)</div>
                      <div className="flex flex-wrap items-center gap-3">
                        {packshots.map((ps) => (
                          <div key={ps.id} className="relative group rounded-xl border border-black/10 overflow-hidden bg-white p-1 shadow-2xs">
                            <img src={ps.url} alt={ps.name} className="size-16 object-cover rounded-lg" />
                            <span className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-[8.5px] font-bold px-1 rounded truncate">
                              {ps.name}
                            </span>
                          </div>
                        ))}
                        <input type="file" ref={fileUploadRef} className="hidden" />
                        <button
                          type="button"
                          onClick={() => fileUploadRef.current?.click()}
                          className="h-16 px-4 rounded-xl border-2 border-dashed border-black/20 hover:border-[var(--brand)] flex flex-col items-center justify-center gap-1 text-[11px] font-bold text-[var(--ink-2)] hover:text-[var(--brand)] bg-white cursor-pointer transition"
                        >
                          <Upload className="size-4" />
                          <span>Add product image</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="text-[12.5px] font-bold text-[var(--ink)] mb-1.5">How many pages?</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[460px]">
                        <button
                          type="button"
                          onClick={() => setInfographicPages("1")}
                          className={cn(
                            "p-3 rounded-[14px] border text-left transition cursor-pointer flex flex-col justify-between min-h-[75px]",
                            infographicPages === "1"
                              ? "border-2 border-[var(--brand)] bg-white text-[var(--ink)] shadow-2xs"
                              : "border-[#e3e8e5] bg-white hover:border-[#cbd6d0] hover:bg-[#fafbf9]"
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="font-bold text-[13.5px]">One page</div>
                            <div
                              className={cn(
                                "size-4.5 rounded-full border-2 grid place-items-center shrink-0",
                                infographicPages === "1"
                                  ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                                  : "border-[#cbd6d0]"
                              )}
                            >
                              {infographicPages === "1" && <Check className="size-3 stroke-[3]" />}
                            </div>
                          </div>
                          <div className="text-[11px] text-[var(--ink-muted)] mt-0.5">A single concise surface</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setInfographicPages("2")}
                          className={cn(
                            "p-3 rounded-[14px] border text-left transition cursor-pointer flex flex-col justify-between min-h-[75px]",
                            infographicPages === "2"
                              ? "border-2 border-[var(--brand)] bg-white text-[var(--ink)] shadow-2xs"
                              : "border-[#e3e8e5] bg-white hover:border-[#cbd6d0] hover:bg-[#fafbf9]"
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="font-bold text-[13.5px]">Two pages</div>
                            <div
                              className={cn(
                                "size-4.5 rounded-full border-2 grid place-items-center shrink-0",
                                infographicPages === "2"
                                  ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                                  : "border-[#cbd6d0]"
                              )}
                            >
                              {infographicPages === "2" && <Check className="size-3 stroke-[3]" />}
                            </div>
                          </div>
                          <div className="text-[11px] text-[var(--ink-muted)] mt-0.5">A front summary and back evidence spread</div>
                        </button>
                      </div>
                    </div>
                  </div>
                </CreativePlanSection>


              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STAGE 2: CONTENT BLUEPRINT / PLAN (Expandable Citations)
             ══════════════════════════════════════════════════════════════════ */}
          {currentStep === "content" && (
            <div className="space-y-4 max-w-[880px] mx-auto w-full">
              {/* Header Box */}
              <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--brand)] mb-1">
                  Content Blueprint &amp; Claim Partition
                </div>
                <h2 className="text-[20px] font-black tracking-tight text-[var(--ink)]">
                  One tablet, three approved jobs: {brandName} (tirzelamide) in moderate-to-severe plaque psoriasis
                </h2>
                <p className="text-[12px] text-[var(--ink-muted)] mt-1">
                  8 sections on {infographicPages === "2" ? "2 pages" : "1 page"} · 13 verified claims grounded in CDSCO / FDA dossier
                </p>
              </div>

              {/* Transparent "Left Out" Box (MLR Discipline) */}
              <div className="rounded-2xl border border-amber-300/80 bg-amber-50/70 p-4 shadow-2xs">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-[12.5px] mb-1.5">
                  <ShieldCheck className="size-4 text-amber-700 shrink-0" />
                  <span>Left out deliberately for MLR Compliance</span>
                </div>
                <p className="text-[11.5px] text-amber-900/90 leading-relaxed">
                  The dossier contains no head-to-head comparator study against biologic X — no comparative superiority claim is made. Only approved CDSCO primary endpoints (52% PASI 90 at Week 16) are cited. Left out deliberately: (a) non-approved indication claims, (b) unverified exploratory endpoints, (c) uncalibrated dosing titration outside §2.1.
                </p>
              </div>

              {/* Numbered Sections List with Interactive Expandable Citations */}
              <div className="space-y-3">
                {CONTENT_PLAN_SECTIONS.map((sec) => {
                  const isExpanded = expandedCitations[sec.num];
                  return (
                    <div
                      key={sec.num}
                      className="bg-white p-4.5 rounded-2xl border border-black/10 shadow-2xs hover:border-black/20 transition-all duration-200"
                    >
                      <div className="flex items-start gap-3">
                        <span className="size-6.5 rounded-full bg-[var(--tint)] text-[var(--brand-deep)] font-black text-[12px] grid place-items-center shrink-0 mt-0.5">
                          {sec.num}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-[14.5px] text-[var(--ink)]">{sec.title}</h4>
                            <span className="text-[10.5px] text-[var(--ink-muted)] font-normal italic">
                              ({sec.role})
                            </span>
                          </div>
                          <p className="text-[12.5px] text-[var(--ink-2)] mt-1.5 leading-relaxed">{sec.body}</p>

                          {/* Expandable Citation Button */}
                          <div className="mt-2.5">
                            <button
                              type="button"
                              onClick={() => toggleCitation(sec.num)}
                              className={cn(
                                "text-[11px] font-bold px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 border transition cursor-pointer",
                                isExpanded
                                  ? "bg-emerald-100/80 text-emerald-900 border-emerald-300 ring-2 ring-emerald-400/20"
                                  : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/60"
                              )}
                            >
                              <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                              <span>{sec.citations.length} {sec.citations.length === 1 ? "citation" : "citations"} · Grounded in label</span>
                              <ChevronDown className={cn("size-3.5 transition-transform", isExpanded && "rotate-180")} />
                            </button>

                            {/* Rich Expanded Citations Drawer */}
                            {isExpanded && (
                              <div className="mt-2.5 space-y-2 rounded-xl bg-[#f7faf8] p-3 border border-emerald-200/80 text-[11.5px] animate-in fade-in slide-in-from-top-1 duration-200">
                                <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                                  <FileCheck2 className="size-3 text-emerald-600" />
                                  <span>Verified Dossier Citations &amp; Label Grounding</span>
                                </div>

                                {sec.citations.map((cit, cIdx) => (
                                  <div
                                    key={cIdx}
                                    className="p-2.5 rounded-lg bg-white border border-emerald-100 shadow-2xs space-y-1"
                                  >
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                      <div className="font-bold text-[12px] text-[var(--ink)] flex items-center gap-1.5">
                                        <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                                        <span>{cit.doc}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[9.5px] font-extrabold text-[var(--brand-deep)] bg-[var(--tint)] px-1.5 py-0.5 rounded border border-[var(--tint-line)]">
                                          {cit.claimId}
                                        </span>
                                        <span className="text-[9.5px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                          {cit.mlrRef}
                                        </span>
                                      </div>
                                    </div>
                                    <p className="text-[11px] text-[var(--ink-muted)] italic leading-relaxed pl-3 border-l-2 border-emerald-300">
                                      &ldquo;{cit.quote}&rdquo;
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              UNIFIED FLOATING ACTION PILL AT MIDDLE BOTTOM (Exact Video Twin)
             ══════════════════════════════════════════════════════════════════ */}
          <div className="sticky bottom-4 z-30 flex justify-center pointer-events-none mt-auto pt-6 pb-2">
            <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-[#111614] text-white p-1.5 pl-4 pr-1.5 shadow-[0_14px_40px_rgba(0,0,0,0.4)] border border-white/12 backdrop-blur-md transition-all duration-200 hover:scale-[1.01]">
              <div className="flex items-center gap-2 text-left min-w-0 pr-2">
                <span className="size-6 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 grid place-items-center shrink-0">
                  <Check className="size-3.5 stroke-[3]" />
                </span>
                <div className="min-w-0">
                  <div className="text-[12px] font-bold text-white tracking-tight truncate">
                    {currentStep === "brief"
                      ? "Ready to create creative"
                      : "Ready to generate canvas"}
                  </div>
                  <div className="text-[10px] text-white/70 truncate">
                    Grounded against 214 approved claims
                  </div>
                </div>
              </div>

              <Button
                onClick={() => {
                  if (currentStep === "brief") setCurrentStep("content");
                  else {
                    setView("studio");
                    setVideoSubStage("studio");
                  }
                }}
                className="h-9 px-5 rounded-full text-[12.5px] font-bold shadow-sm transition-all duration-200 shrink-0 bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white cursor-pointer hover:scale-105"
              >
                <span>
                  {currentStep === "brief"
                    ? "Confirm Plan & Review Blueprint"
                    : "Approve Plan & Open Canvas Studio"}
                </span>
                <ArrowRight className="size-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        </section>

        {/* ── RIGHT PANEL (Chat Assistant with Docked Action Cards) ── */}
        <aside
          style={{
            width: copilotPanelOpen ? 410 : 0,
            minWidth: copilotPanelOpen ? 410 : 0,
            maxWidth: copilotPanelOpen ? 410 : 0,
            transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          className={cn(
            "flex flex-col shrink-0 min-h-0 bg-white border-l border-[var(--line)] shadow-[-4px_0_20px_rgba(0,0,0,0.04)] z-10 overflow-hidden",
            !copilotPanelOpen && "border-none pointer-events-none"
          )}
        >
          {/* Chat Top Banner */}
          <div className="p-3.5 border-b border-[var(--line)] bg-white shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[12px] font-bold text-[var(--brand)]">
                <Sparkles className="size-3.5" />
                <span>Direct with SwishX</span>
              </div>
              <span className="rounded-full bg-emerald-500/15 text-emerald-700 px-2 py-0.5 text-[9.5px] font-bold">
                Online
              </span>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex gap-2.5 max-w-full",
                  msg.role === "user" ? "ml-auto justify-end" : "mr-auto"
                )}
              >
                {msg.role === "swishx" && (
                  <div className="size-7 rounded-full bg-[var(--brand)] text-white grid place-items-center font-bold text-[10px] shrink-0 mt-0.5 shadow-2xs">
                    SX
                  </div>
                )}
                <div className="space-y-2 max-w-[88%]">
                  <div
                    className={cn(
                      "rounded-2xl p-3 text-[12.5px] leading-relaxed",
                      msg.role === "user"
                        ? "bg-[var(--brand)] text-white rounded-tr-xs"
                        : "bg-[#f4f6f4] text-[var(--ink)] border border-black/5 rounded-tl-xs"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  {/* Suggestion Chips in SwishX bubble */}
                  {msg.role === "swishx" && idx === chatMessages.length - 1 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        "Switch to Portrait 3:4",
                        "Use Stat Hero Template",
                        "Elevate MoA in Section 2",
                        "Set to 2 Pages",
                      ].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => handleSendChat(chip)}
                          className="text-[11px] font-semibold text-[var(--ink-2)] bg-white hover:bg-[var(--tint)] hover:text-[var(--brand)] border border-black/10 rounded-full px-2.5 py-1 transition cursor-pointer shadow-2xs"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Area with Synchronized Docked Action Bar */}
          <div className="p-3 border-t border-black/[0.06] bg-white shrink-0 space-y-2">
            {/* ── Sub-step 1 Action Bar ── */}
            {currentStep === "brief" && (
              <div className="rounded-xl border border-[var(--brand)]/20 bg-gradient-to-r from-[var(--tint)] via-white to-[var(--tint)] p-2.5 shadow-2xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="size-6 rounded-full bg-emerald-600 text-white grid place-items-center shrink-0">
                    <Check className="size-3.5 stroke-[3]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11.5px] font-bold text-[var(--ink)] truncate">
                      Ready to generate blueprint
                    </div>
                    <div className="text-[9.5px] text-[var(--ink-muted)] truncate">
                      Grounded against 214 approved claims
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => setCurrentStep("content")}
                  size="sm"
                  className="h-7.5 px-3 rounded-lg text-[11.5px] font-bold shadow-xs transition-all shrink-0 cursor-pointer bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white hover:scale-[1.02]"
                >
                  <span>Review Blueprint</span>
                  <ArrowRight className="size-3 ml-1" />
                </Button>
              </div>
            )}

            {/* ── Sub-step 2 Action Bar ── */}
            {currentStep === "content" && (
              <div className="rounded-xl border border-[var(--brand)]/20 bg-gradient-to-r from-[var(--tint)] via-white to-[var(--tint)] p-2.5 shadow-2xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="size-6 rounded-full bg-emerald-600 text-white grid place-items-center shrink-0">
                    <Sparkles className="size-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11.5px] font-bold text-[var(--ink)] truncate">
                      Content plan approved
                    </div>
                    <div className="text-[9.5px] text-[var(--ink-muted)] truncate">
                      8 sections · 13 citations
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    setView("studio");
                    setVideoSubStage("studio");
                  }}
                  size="sm"
                  className="h-7.5 px-3 rounded-lg text-[11.5px] font-bold shadow-xs transition-all shrink-0 cursor-pointer bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white hover:scale-[1.02]"
                >
                  <span>Open Studio</span>
                  <ArrowRight className="size-3 ml-1" />
                </Button>
              </div>
            )}

            {/* Input Bar */}
            <div className="relative">
              <div className="flex items-center gap-2 rounded-[12px] border border-black/15 bg-[#f7f8f6] px-3 py-2 focus-within:border-[var(--brand)] focus-within:bg-white focus-within:shadow-xs transition">
                <Plus className="size-3.5 text-[var(--ink-muted)] shrink-0" />
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendChat();
                  }}
                  placeholder="Ask or request changes..."
                  className="flex-1 bg-transparent text-[12.5px] outline-none text-[var(--ink)] placeholder:text-[var(--ink-muted)]"
                />
                <button
                  type="button"
                  onClick={() => handleSendChat()}
                  disabled={!chatInput.trim()}
                  className="grid size-6 place-items-center rounded-lg bg-[var(--brand)] text-white disabled:opacity-30 hover:bg-[var(--brand-deep)] transition cursor-pointer disabled:cursor-not-allowed shrink-0"
                >
                  <Send className="size-3" />
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ── CreativePlanSection with Zoom & Dimming Focus Animations (Matching Video Flow) ──
function CreativePlanSection({
  icon: Icon,
  title,
  summary,
  status,
  open,
  onToggle,
  tone = "default",
  children,
}: {
  icon: LucideIcon;
  title: string;
  summary: string;
  status: string;
  open: boolean;
  onToggle: () => void;
  tone?: "default" | "done" | "attention";
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "squircle-card relative transition-all duration-300 ease-[cubic-bezier(.2,.8,.2,1)]",
        open
          ? "z-20 w-full scale-100 bg-white border border-[var(--brand)] shadow-[0_12px_36px_rgba(235,94,40,0.14),0_2px_10px_rgba(0,0,0,0.06)] rounded-[20px] my-3.5"
          : "z-0 w-[93%] sm:w-[94%] mx-auto scale-[0.985] bg-white/80 opacity-[.76] hover:opacity-100 hover:bg-white hover:shadow-xs border border-black/[0.08] hover:border-black/20 rounded-[14px] my-1"
      )}
    >
      <button
        onClick={onToggle}
        className={cn(
          "focus-ring group flex w-full items-center gap-3 text-left transition-all duration-200 cursor-pointer",
          open ? "min-h-[70px] px-4 sm:px-5" : "min-h-[44px] py-1.5 px-3 sm:px-3.5"
        )}
        aria-expanded={open}
      >
        <span
          className={cn(
            "squircle-control grid shrink-0 place-items-center transition-transform group-hover:scale-105",
            open ? "size-10 rounded-[12px]" : "size-7 rounded-[8px]",
            open
              ? "bg-[var(--brand)] text-white shadow-xs"
              : tone === "done"
              ? "bg-[var(--brand)]/15 text-[var(--brand)]"
              : "bg-[#edf3ef] text-[var(--brand)]"
          )}
        >
          {open ? (
            <Check className="size-4" strokeWidth={3} />
          ) : (
            <Icon className="size-3.5" />
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block font-bold tracking-tight transition-colors leading-snug",
              open ? "text-[16px] text-[var(--ink)]" : "text-[13px] text-[var(--ink-2)]"
            )}
          >
            {title}
          </span>
          <span
            className={cn(
              "block truncate text-[var(--ink-muted)]",
              open ? "mt-0.5 text-[12.5px]" : "text-[11px] max-w-[380px]"
            )}
          >
            {summary}
          </span>
        </span>

        <span
          className={cn(
            "hidden rounded-full font-bold sm:inline border",
            open ? "px-2.5 py-1 text-[11px]" : "px-2 py-0.5 text-[9.5px]",
            status === "Confirmed"
              ? "bg-[var(--tint)] text-[var(--brand-deep)] border-[var(--tint-line)]"
              : status === "Optional"
              ? "bg-[#f5f5f5] text-[#737373] border-[#e5e5e5]"
              : "bg-[#eef2ef] text-[#66736c] border-[#e2e8e4]"
          )}
        >
          {status}
        </span>

        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-[#6f7c75] transition-transform duration-200",
            open && "rotate-180 text-[var(--brand)]"
          )}
        />
      </button>

      {open && (
        <div className="border-t border-[#edf2ef] px-4 pt-4 pb-5 sm:px-5 animate-in fade-in duration-200">
          {children}
        </div>
      )}
    </section>
  );
}
