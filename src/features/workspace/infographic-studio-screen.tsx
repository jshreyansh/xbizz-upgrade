"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  FileCheck2,
  FileText,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  Maximize2,
  MessageSquare,
  MoreHorizontal,
  Move,
  Palette,
  PanelRight,
  Paperclip,
  Pencil,
  Plus,
  RotateCcw,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Type,
  Undo2,
  ZoomIn,
  ZoomOut,
  X,
  Trash2,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SwishXMark } from "@/components/ui/swishx-mark";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { cn } from "@/lib/cn";

export type CreativeStudioMode = "editor" | "generating" | "review";

interface InfographicPageData {
  id: number;
  name: string;
  subtitle: string;
  header: {
    title: string;
    subtitle: string;
    badge: string;
    approvalTag: string;
  };
  heroStat: {
    category: string;
    metric: string;
    comparison: string;
    detail: string;
    citation: string;
  };
  moa: {
    title: string;
    detail: string;
    steps: [string, string, string];
  };
  chart: {
    title: string;
    cohort: string;
    arm1Label: string;
    arm1Val: number;
    arm2Label: string;
    arm2Val: number;
  };
  isi: {
    title: string;
    content: string;
    citation: string;
  };
}

const DEFAULT_PAGE_1: InfographicPageData = {
  id: 1,
  name: "Page 1: Front Summary",
  subtitle: "Executive Readout & MoA",
  header: {
    title: "VELMORA™ (tirzelamide) · 200mg",
    subtitle: "First-in-Class Dual Mechanism Kinase Inhibitor for Moderate-to-Severe Plaque Psoriasis",
    badge: "HCP Clinical Brief",
    approvalTag: "CDSCO Approved · 2026",
  },
  heroStat: {
    category: "Primary Efficacy Endpoint · Week 16",
    metric: "52% PASI 90",
    comparison: "vs 18% Placebo (p < 0.001)",
    detail: "Over half of patients achieved clear or almost clear skin by Week 16 vs 18% in placebo cohort.",
    citation: "Verified §2.4 · EMBRACE-3",
  },
  moa: {
    title: "Dual-Action Cellular Mechanism",
    detail: "Selectively inhibits kinase phosphorylation cascades, suppressing inflammatory cytokines while preserving peripheral microvascular perfusion.",
    steps: ["1. Receptor Binding", "2. Kinase Blockade", "3. Plaque Reduction"],
  },
  chart: {
    title: "Pivotal EMBRACE-3 Trial Results",
    cohort: "N=613 Patients",
    arm1Label: "Velmora 200mg",
    arm1Val: 52,
    arm2Label: "Placebo Control",
    arm2Val: 18,
  },
  isi: {
    title: "Important Safety Information (ISI)",
    content: "Contraindicated in patients with severe hepatic impairment. Most common adverse events include mild nausea (6.2%) and headache (5.1%). Please review full Prescribing Information before administration.",
    citation: "CDSCO Prescribing Information §5.2",
  },
};

const DEFAULT_PAGE_2: InfographicPageData = {
  id: 2,
  name: "Page 2: Evidence & Tolerability",
  subtitle: "52-Week Durability & Renal Boundary",
  header: {
    title: "VELMORA™ · Clinical Evidence & Safety",
    subtitle: "Long-Term Extension Cohorts, Organ Safety & Prescribing Thresholds",
    badge: "Clinical Evidence Spread",
    approvalTag: "CDSCO Section 2.1 & 5.2",
  },
  heroStat: {
    category: "52-Week Open-Label Extension",
    metric: "84.6% Durability",
    comparison: "Maintained Clear Skin (Week 52)",
    detail: "High rate of sustained cutaneous response through 1-year follow-up without microvascular toxicity.",
    citation: "EMBRACE-3 Long-Term Study §4.2",
  },
  moa: {
    title: "Renal Safety & Dosing Threshold",
    detail: "Clearance profile validated across mild-to-moderate renal impairment cohorts without dosage adjustment above eGFR 25.",
    steps: ["1. eGFR ≥25 Standard", "2. Once-Daily 200mg", "3. Hepatic Caution §5.2"],
  },
  chart: {
    title: "52-Week Maintained PASI 90 Response",
    cohort: "N=492 Responders",
    arm1Label: "Week 52 Extension",
    arm1Val: 85,
    arm2Label: "Discontinuation Arm",
    arm2Val: 24,
  },
  isi: {
    title: "Important Safety Information & Precautions",
    content: "Initiation is not recommended in patients with eGFR < 25 mL/min/1.73m². Co-administration with strong CYP3A4 inhibitors should be monitored. Consult full CDSCO SmPC.",
    citation: "CDSCO SmPC §2.1 & §5.2",
  },
};

const CLAIMS_LIST = [
  { id: "claim-1", tag: "Claim §1.1 · Indication", desc: "Approved in adults aged 18+ for moderate-to-severe plaque psoriasis", source: "Prescribing Information p.3" },
  { id: "claim-2", tag: "Claim §2.4 · Efficacy (52% PASI 90)", desc: "Statistically significant skin clearance vs 18% in placebo (p < 0.001)", source: "EMBRACE-3 readout Table 2.4" },
  { id: "claim-3", tag: "Claim §3.1 · Mechanism (Dual Kinase)", desc: "Selective cellular kinase receptor binding and downstream cytokine inhibition", source: "Lancet Derm 2024; 42:118" },
  { id: "claim-4", tag: "Claim §4.2 · Durability (Week 52)", desc: "Clearance maintained through 52-week open-label extension cohort", source: "EMBRACE-3 Long-Term Study" },
  { id: "claim-5", tag: "Claim §5.2 · Tolerability & Safety", desc: "Contraindicated in severe hepatic impairment. Transient mild headache (<6%)", source: "CDSCO Safety Section §5.2" },
  { id: "claim-6", tag: "Claim §6.1 · Prescribing Cut-Off", desc: "Recommended for eGFR ≥25 mL/min/1.73m² with once-daily oral dosing", source: "Dosing & Administration §2.1" },
];

export function InfographicStudioScreen() {
  const router = useRouter();
  const {
    brief,
    audience,
    topics,
    pageShape,
    infographicPages,
    infographicTemplate,
    infographicActivePage,
    setInfographicActivePage,
    setInfographicPages,
    sourcePayload,
    chatMessages,
    addChatMessage,
    copilotPanelOpen,
    toggleCopilotPanel,
    setView,
    setVideoSubStage,
  } = useWorkspaceStore();

  const brandName = sourcePayload?.dossierId === "onkavia" ? "Onkavia" : sourcePayload?.dossierId === "pulmovax" ? "PulmoVax" : "Velmora";

  // Studio Mode: Editor -> Generating -> Shared Review View
  const [studioMode, setStudioMode] = useState<CreativeStudioMode>("editor");
  const [generationStep, setGenerationStep] = useState<number>(1);

  // Tab State in Review/Editor right panel
  const [activeTab, setActiveTab] = useState<"assistant" | "edit" | "comments" | "evidence">(
    studioMode === "review" ? "comments" : "assistant"
  );

  // Zoom & UI state
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [selectedBlockId, setSelectedBlockId] = useState<"header" | "heroStat" | "moa" | "chart" | "isi">("heroStat");
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [confirmGenerateModalOpen, setConfirmGenerateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Multi-page management
  const [pagesList, setPagesList] = useState<InfographicPageData[]>([DEFAULT_PAGE_1]);
  const activePageId = infographicActivePage || 1;

  // Sync with store pages
  useEffect(() => {
    if (infographicPages === "2" && pagesList.length === 1) {
      setPagesList([DEFAULT_PAGE_1, DEFAULT_PAGE_2]);
    }
  }, [infographicPages, pagesList.length]);

  const currentPage = useMemo(() => {
    return pagesList.find((p) => p.id === activePageId) || pagesList[0] || DEFAULT_PAGE_1;
  }, [pagesList, activePageId]);

  // Reviewer Comments State
  const [commentsList, setCommentsList] = useState([
    {
      id: "c-1",
      author: "Sarah Lin (Medical Director)",
      role: "Medical Reviewer",
      avatar: "SL",
      page: 1,
      text: "Ensure the EMBRACE-3 PASI 90 p-value (p < 0.001) is clearly displayed alongside the Week 16 primary endpoint.",
      time: "10m ago",
      resolved: false,
    },
    {
      id: "c-2",
      author: "David Vance (Regulatory Lead)",
      role: "MLR Officer",
      avatar: "DV",
      page: 1,
      text: "Grounded accurately in CDSCO §2.1. The eGFR ≥25 cut-off warning in the footer meets fair balance standards.",
      time: "18m ago",
      resolved: true,
    },
  ]);
  const [newCommentText, setNewCommentText] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Add Page Handler
  const handleAddPage = () => {
    if (pagesList.length >= 3) {
      showToast("Maximum 3 pages supported for this archetype");
      return;
    }
    const newPageNum = pagesList.length + 1;
    const newPage: InfographicPageData = {
      ...DEFAULT_PAGE_2,
      id: newPageNum,
      name: `Page ${newPageNum}: Clinical Evidence & Tolerability`,
    };
    setPagesList((prev) => [...prev, newPage]);
    setInfographicPages(String(newPageNum) as any);
    setInfographicActivePage(newPageNum);
    showToast(`Added Page ${newPageNum}`);
  };

  // Edit handler for active block
  const handleSelectBlock = (blockId: "header" | "heroStat" | "moa" | "chart" | "isi") => {
    setSelectedBlockId(blockId);
    setActiveTab("edit");
  };

  // Update current page field
  const updateCurrentPage = (updater: (prev: InfographicPageData) => InfographicPageData) => {
    setPagesList((prev) =>
      prev.map((p) => (p.id === activePageId ? updater(p) : p))
    );
  };

  // Chat message handler connected directly to Workspace Store
  const [chatInput, setChatInput] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, activeTab, studioMode]);

  const [mlrCheckResolved, setMlrCheckResolved] = useState(false);
  const [qaCheckResolved, setQaCheckResolved] = useState(false);
  const hasBlockers = !mlrCheckResolved || !qaCheckResolved;
  const blockerCount = (!mlrCheckResolved ? 1 : 0) + (!qaCheckResolved ? 1 : 0);

  const handleFixMlrBlocker = () => {
    setConfirmGenerateModalOpen(false);
    if (!copilotPanelOpen) toggleCopilotPanel();
    setActiveTab("assistant");
    setChatInput("@MLR Check: Please revise the primary efficacy comparison to cite verified EMBRACE-3 PASI 90 placebo rates (p < 0.001) without unverified superiority claims.");
    showToast("Tagged MLR issue in SwishX Chat");
  };

  const handleFixQaBlocker = () => {
    setConfirmGenerateModalOpen(false);
    if (!copilotPanelOpen) toggleCopilotPanel();
    setActiveTab("assistant");
    setChatInput("@Quality Check: Remove redundant subtitle phrasing and standardize chemical nomenclature formatting.");
    showToast("Tagged Quality issue in SwishX Chat");
  };

  const handleAutoFixBoth = () => {
    setMlrCheckResolved(true);
    setQaCheckResolved(true);
    updateCurrentPage((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        subtitle: "First-in-Class Dual Mechanism Kinase Inhibitor · Once-Daily 200mg Oral Formulation",
      },
      heroStat: {
        ...prev.heroStat,
        metric: "52% PASI 90",
        comparison: "vs 18% Placebo (p < 0.001)",
        detail: "52% of patients achieved PASI 90 at Week 16 vs 18% in placebo cohort (p < 0.001), sustained through Week 52.",
      },
    }));
    addChatMessage({
      role: "swishx",
      text: "✓ **Quality & MLR Pre-Flight Passed**: Auto-resolved both blockers. Grounded hero efficacy in EMBRACE-3 Table 2.4 and polished headline phrasing. Ready to Generate and Publish.",
    });
    showToast("Resolved 2 pre-flight blockers with AI");
  };

  const handleSendMessage = (directText?: string) => {
    const text = directText || chatInput.trim();
    if (!text) return;

    addChatMessage({ role: "user", text });
    if (!directText) setChatInput("");

    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = `Understood. I have adjusted the graphic layout grounded in the **${brandName}** dossier.`;

      if (lower.includes("mlr") || lower.includes("comparative") || lower.includes("embrace-3")) {
        setMlrCheckResolved(true);
        updateCurrentPage((prev) => ({
          ...prev,
          heroStat: {
            ...prev.heroStat,
            metric: "52% PASI 90",
            comparison: "vs 18% Placebo (p < 0.001)",
            detail: "52% of patients achieved PASI 90 at Week 16 vs 18% in placebo (p < 0.001), sustained through Week 52.",
          },
        }));
        reply = "✓ **MLR Blocker Resolved**: Updated primary efficacy hero card to cite EMBRACE-3 Table 2.4 (52% PASI 90 vs 18% Placebo, p < 0.001). Removed ungrounded superiority claims. Pre-flight check cleared.";
      } else if (lower.includes("quality") || lower.includes("phrasing") || lower.includes("subtitle") || lower.includes("nomenclature") || lower.includes("cadence")) {
        setQaCheckResolved(true);
        updateCurrentPage((prev) => ({
          ...prev,
          header: {
            ...prev.header,
            subtitle: "First-in-Class Dual Mechanism Kinase Inhibitor · Once-Daily 200mg Oral Formulation",
          },
        }));
        reply = "✓ **Quality Blocker Resolved**: Condensed and standardized headline tagline. Chemical and generic drug nomenclature verified.";
      } else if (lower.includes("headline") || lower.includes("header") || lower.includes("title")) {
        updateCurrentPage((prev) => ({
          ...prev,
          header: {
            ...prev.header,
            subtitle: "Rapid Clinical Clearance & Once-Daily Tolerability in Plaque Psoriasis",
          },
        }));
        reply = "Updated the infographic header tagline to highlight rapid clinical clearance and once-daily dosing. The canvas has been refreshed.";
      } else if (lower.includes("pasi") || lower.includes("stat") || lower.includes("metric") || lower.includes("efficacy")) {
        updateCurrentPage((prev) => ({
          ...prev,
          heroStat: {
            ...prev.heroStat,
            metric: "52% PASI 90 Clear Skin",
            detail: "52% of patients achieved PASI 90 at Week 16 vs 18% in placebo (p < 0.001), sustained through Week 52.",
          },
        }));
        reply = "Updated the primary efficacy hero card to PASI 90 clear skin with full 52-week extension grounding.";
      } else {
        reply = `Applied direction for "${text}". The infographic layout, styling, and verified FDA/CDSCO citations remain 100% compliant.`;
      }

      addChatMessage({ role: "swishx", text: reply });
    }, 500);
  };

  // Generate Creative & Open Shared Review
  const handlePublishCreative = () => {
    setStudioMode("generating");
    setGenerationStep(1);

    setTimeout(() => setGenerationStep(2), 700);
    setTimeout(() => setGenerationStep(3), 1500);
    setTimeout(() => {
      setStudioMode("review");
      setActiveTab("comments");
      showToast("Creative published · Opened Shared Review View");
    }, 2300);
  };

  const handleAddComment = () => {
    if (!newCommentText.trim()) return;
    const newC = {
      id: `c-${Date.now()}`,
      author: "Maya Kapoor (Lead Author)",
      role: "Creative Author",
      avatar: "MK",
      page: activePageId,
      text: newCommentText.trim(),
      time: "Just now",
      resolved: false,
    };
    setCommentsList((prev) => [newC, ...prev]);
    setNewCommentText("");
    showToast("Review comment posted");
  };

  return (
    <div className="flex h-screen min-h-[720px] flex-col overflow-hidden bg-[#edf0ed] text-left">
      {/* ─── Top Header Bar ─── */}
      <header className="z-30 flex h-[60px] shrink-0 items-center justify-between border-b border-[var(--line)] bg-white px-3 sm:px-5">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => {
              if (studioMode === "review") {
                setStudioMode("editor");
              } else {
                setView("directions");
                setVideoSubStage("directions");
              }
            }}
            className="focus-ring mr-1 grid size-8 place-items-center rounded-lg text-[var(--ink-muted)] hover:bg-black/5 hover:text-[var(--ink)] cursor-pointer"
            title="Back"
            aria-label="Back"
          >
            <ArrowLeft className="size-4" />
          </button>

          <SwishXMark compact />
          <div className="mx-2.5 h-5 w-px bg-[var(--line)]" />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-[13px] font-[850] text-[var(--ink)] tracking-tight">
                {brandName} HCP Infographic
              </span>
              <span className="hidden rounded-full bg-[#edf1ee] px-2 py-0.5 text-[9px] font-bold text-[#69736e] sm:inline">
                Draft v1
              </span>
            </div>
            <div className="mt-0.5 hidden text-[9.5px] text-[var(--ink-muted)] sm:block">
              Saved just now · MagicCanvas™ · {pagesList.length} {pagesList.length === 1 ? "Page" : "Pages"} ({pageShape === "16:9" ? "16:9 Landscape" : pageShape === "A4" ? "A4 Print" : "3:4 Tablet"})
            </div>
          </div>

          {/* Mode Switchers */}
          <div className="ml-4 hidden items-center gap-1.5 md:flex">
            {studioMode === "editor" && (
              <span className="rounded-full bg-[var(--tint)] px-2.5 py-0.5 text-[10.5px] font-extrabold text-[var(--brand-deep)] border border-[var(--tint-line)]">
                Canvas Editor
              </span>
            )}
            {studioMode === "generating" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 border border-orange-200 px-3 py-1 text-[10.5px] font-extrabold text-orange-800 animate-pulse">
                <Sparkles className="size-3 text-orange-600 animate-spin" />
                <span>Generating High-Res Creative...</span>
              </span>
            )}
            {studioMode === "review" && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setStudioMode("editor")}
                  className="focus-ring flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[#fafbf9] px-2.5 py-1 text-[11px] font-bold text-[var(--ink-2)] transition hover:border-[var(--brand)] hover:bg-[var(--tint)] hover:text-[var(--brand)] shadow-xs cursor-pointer"
                >
                  <Pencil className="size-3 text-[var(--brand)]" />
                  <span>Editor</span>
                </button>
                <span className="text-[var(--ink-muted)]">/</span>
                <span className="rounded-full bg-emerald-50 px-3 py-0.5 text-[10.5px] font-extrabold text-emerald-800 border border-emerald-200">
                  Shared Review View · Final Asset
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Center Canvas Zoom Controls */}
        {studioMode !== "generating" && (
          <div className="hidden sm:flex items-center gap-1 rounded-xl border border-black/10 bg-[#f7f8f6] p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
              className="p-1 text-[var(--ink-2)] hover:text-black rounded hover:bg-white cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="size-3.5" />
            </button>
            <span className="text-[11px] font-mono font-bold text-[var(--ink)] px-1.5 min-w-[45px] text-center">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
              className="p-1 text-[var(--ink-2)] hover:text-black rounded hover:bg-white cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(100)}
              className="px-2 py-0.5 text-[10px] font-bold text-[var(--brand)] hover:bg-white rounded cursor-pointer"
            >
              Fit
            </button>
          </div>
        )}

        {/* Right Actions: Generate/Publish in Editor OR Export/Share in Review */}
        <div className="flex items-center gap-2">
          {studioMode === "editor" && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setExportModalOpen(true)}
                className="gap-1.5 text-[12px] font-bold border-black/15 hover:border-[var(--brand)] px-3.5 cursor-pointer"
              >
                <Download className="size-3.5" />
                <span>Export PDF</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setConfirmGenerateModalOpen(true)}
                className="gap-1.5 bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white text-[12px] font-bold shadow-xs cursor-pointer px-4.5 hover:scale-[1.02] transition-transform"
              >
                <Sparkles className="size-3.5" />
                <span>Generate and Publish</span>
              </Button>
            </>
          )}

          {studioMode === "review" && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShareModalOpen(true)}
                className="gap-1.5 text-[12px] font-bold border-black/15 hover:border-[var(--brand)] px-3.5 cursor-pointer"
              >
                <Share2 className="size-3.5" />
                <span>Share Link</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setExportModalOpen(true)}
                className="gap-1.5 bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white text-[12px] font-bold shadow-xs cursor-pointer px-4.5"
              >
                <Download className="size-3.5" />
                <span>Export PDF</span>
              </Button>
            </>
          )}

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
            aria-label="Toggle sidebar"
          >
            <PanelRight className="size-4" />
          </button>
        </div>
      </header>

      {/* ─── Main Studio Body ─── */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* ── GENERATING HIGH-RES OVERLAY ── */}
        {studioMode === "generating" && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#f7f8f6] animate-in fade-in duration-300">
            <div className="size-20 rounded-3xl bg-[var(--tint)] border border-[var(--tint-line)] flex items-center justify-center mb-6 shadow-sm">
              <Sparkles className="size-10 text-[var(--brand)] animate-pulse" />
            </div>
            <h3 className="text-[22px] font-extrabold text-[var(--ink)] tracking-tight">
              Generating High-Resolution Creative &amp; Proofs...
            </h3>
            <p className="text-[13.5px] text-[var(--ink-muted)] mt-1.5 max-w-[440px]">
              Synthesizing publication-grade vectors, clinical PASI 90 stat heroes, and PromoMats-verified claim links.
            </p>

            <div className="mt-8 w-full max-w-[360px] space-y-2.5 text-left text-[12.5px]">
              <div className={cn("flex items-center gap-3 p-3 rounded-xl border transition", generationStep >= 1 ? "bg-white border-black/10 text-[var(--ink)] shadow-2xs" : "opacity-40")}>
                <Check className={cn("size-4.5 shrink-0", generationStep >= 1 ? "text-[var(--ok)]" : "text-black/30")} strokeWidth={2.5} />
                <span className="font-semibold">Validated 214 CDSCO / FDA dossier claims</span>
              </div>
              <div className={cn("flex items-center gap-3 p-3 rounded-xl border transition", generationStep >= 2 ? "bg-white border-black/10 text-[var(--ink)] shadow-2xs" : "opacity-40")}>
                <Check className={cn("size-4.5 shrink-0", generationStep >= 2 ? "text-[var(--ok)]" : "text-black/30")} strokeWidth={2.5} />
                <span className="font-semibold">Synthesized high-res vectors &amp; layout</span>
              </div>
              <div className={cn("flex items-center gap-3 p-3 rounded-xl border transition", generationStep >= 3 ? "bg-white border-black/10 text-[var(--ink)] shadow-2xs" : "opacity-40")}>
                <Check className={cn("size-4.5 shrink-0", generationStep >= 3 ? "text-[var(--ok)]" : "text-black/30")} strokeWidth={2.5} />
                <span className="font-semibold">Grounded ISI fair balance tables &amp; leave-behind</span>
              </div>
            </div>
          </div>
        )}

        {/* ── LEFT SIDEBAR: Pages Thumbnails & Graphic Layers (Editor & Review) ── */}
        {studioMode !== "generating" && (
          <aside className="w-56 sm:w-60 border-r border-[var(--line)] bg-[#f8f9f7] flex flex-col shrink-0 overflow-y-auto">
            {/* Pages Strip Header */}
            <div className="p-3 border-b border-[var(--line)] bg-white flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--ink-muted)]">
                Pages ({pagesList.length})
              </span>
              <button
                type="button"
                onClick={handleAddPage}
                className="p-1 text-[var(--brand)] hover:bg-[var(--tint)] rounded cursor-pointer transition-colors"
                title="Add Page"
              >
                <Plus className="size-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Page Thumbnails List */}
            <div className="p-3 space-y-3 border-b border-[var(--line)]">
              {pagesList.map((pg) => {
                const isActive = activePageId === pg.id;
                return (
                  <button
                    key={pg.id}
                    type="button"
                    onClick={() => setInfographicActivePage(pg.id)}
                    className={cn(
                      "w-full flex flex-col gap-1.5 p-2.5 rounded-xl border text-left transition cursor-pointer relative shadow-2xs",
                      isActive
                        ? "border-[var(--brand)] bg-[var(--tint)]/50 ring-2 ring-[var(--brand)]/15"
                        : "border-black/10 bg-white hover:border-black/20"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[var(--ink)] truncate">{pg.name}</span>
                      {isActive && <span className="size-2 rounded-full bg-[var(--brand)]" />}
                    </div>
                    <div className="aspect-[3/4] w-full rounded-lg bg-white border border-black/10 p-2 flex flex-col justify-between overflow-hidden shadow-inner-xs">
                      <div className={cn("h-2 w-14 rounded", pg.id === 1 ? "bg-[#14233c]" : "bg-blue-600")} />
                      <div className="h-4 w-full bg-[var(--brand)]/20 rounded" />
                      <div className="h-6 w-full bg-black/5 rounded" />
                      <div className="h-2 w-full bg-black/10 rounded" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Graphic Layers Tree (In Editor Mode) */}
            {studioMode === "editor" && (
              <div className="p-3 flex-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--ink-muted)] block mb-2">
                  Graphic Layers
                </span>
                <div className="space-y-1">
                  {[
                    { id: "header", label: "1. Brand & Formulation Header" },
                    { id: "heroStat", label: "2. Stat Hero (52% PASI 90)" },
                    { id: "moa", label: "3. Cellular MoA Cascade" },
                    { id: "chart", label: "4. Pivotal EMBRACE-3 Chart" },
                    { id: "isi", label: "5. Fair Balance & ISI" },
                  ].map((layer) => (
                    <button
                      key={layer.id}
                      type="button"
                      onClick={() => handleSelectBlock(layer.id as any)}
                      className={cn(
                        "w-full flex items-center justify-between p-2 rounded-lg text-left text-[11px] font-medium transition cursor-pointer",
                        selectedBlockId === layer.id
                          ? "bg-[var(--tint)] font-bold text-[var(--brand-deep)] shadow-2xs border border-[var(--brand)]/20"
                          : "hover:bg-black/5 text-[var(--ink)]"
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Layers className="size-3 text-[var(--ink-muted)] shrink-0" />
                        <span className="truncate">{layer.label}</span>
                      </div>
                      {selectedBlockId === layer.id && <span className="size-1.5 rounded-full bg-[var(--brand)]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Review Info (In Review Mode) */}
            {studioMode === "review" && (
              <div className="p-3.5 space-y-3 flex-1 text-[11.5px]">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-2.5 text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-[11px]">
                    <ShieldCheck className="size-3.5 text-emerald-700" />
                    <span>MLR Clearance Grounded</span>
                  </div>
                  <p className="text-[10.5px] text-emerald-800 leading-snug">
                    Passed label verification against CDSCO §1.1, §2.1 and §5.2.
                  </p>
                </div>
              </div>
            )}
          </aside>
        )}

        {/* ── CENTER CANVAS: Fixed Top-Clipping & Full Interactive Rendering ── */}
        {studioMode !== "generating" && (
          <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10 bg-[#e5e8e4] flex justify-center items-start">
            <div className="w-full max-w-[720px] flex justify-center py-4 my-auto">
              <div
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "center top" }}
                className={cn(
                  "w-full max-w-[700px] rounded-[24px] bg-white shadow-2xl border border-black/10 overflow-hidden text-left transition-transform duration-150 flex flex-col select-none",
                  pageShape === "16:9" ? "aspect-video" : "min-h-[880px]"
                )}
              >
                {/* 1. Header Band */}
                <div
                  onClick={() => studioMode === "editor" && handleSelectBlock("header")}
                  className={cn(
                    "p-6 pb-5 bg-gradient-to-r from-[#0c1524] via-[#14233c] to-[#1e3458] text-white relative transition group",
                    studioMode === "editor" && "cursor-pointer",
                    selectedBlockId === "header" && studioMode === "editor"
                      ? "ring-3 ring-inset ring-[var(--brand)] shadow-inner"
                      : "hover:brightness-105"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-white border border-white/20">
                      {currentPage.header.badge}
                    </span>
                    <span className="text-[10px] font-mono text-white/70">{currentPage.header.approvalTag}</span>
                  </div>
                  <h1 className="text-[23px] font-[850] text-white tracking-tight leading-tight">
                    {currentPage.header.title}
                  </h1>
                  <p className="text-[12px] text-white/80 font-medium mt-1">
                    {currentPage.header.subtitle}
                  </p>
                </div>

                {/* Infographic Body Blocks */}
                <div className="p-6 space-y-4 flex-1 flex flex-col">
                  {/* 2. Stat Hero */}
                  <div
                    onClick={() => studioMode === "editor" && handleSelectBlock("heroStat")}
                    className={cn(
                      "p-4 rounded-2xl bg-[#fff7f4] border border-[#ffdbce] shadow-2xs transition relative group",
                      studioMode === "editor" && "cursor-pointer",
                      selectedBlockId === "heroStat" && studioMode === "editor"
                        ? "ring-2 ring-[var(--brand)] shadow-sm bg-white"
                        : "hover:border-[var(--brand)]/60"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--brand-deep)]">
                        {currentPage.heroStat.category}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.2 text-[9.5px] font-bold">
                        <Check className="size-2.5 stroke-[3]" />
                        {currentPage.heroStat.citation}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2.5">
                      <div className="text-[32px] font-[900] leading-tight tracking-tight text-[var(--brand)]">
                        {currentPage.heroStat.metric}
                      </div>
                      <span className="text-[13px] font-bold text-[var(--ink-2)]">
                        {currentPage.heroStat.comparison}
                      </span>
                    </div>
                    <p className="text-[12px] text-[var(--ink-2)] font-medium mt-0.5 leading-relaxed">
                      {currentPage.heroStat.detail}
                    </p>
                  </div>

                  {/* 3. MoA Pathway */}
                  <div
                    onClick={() => studioMode === "editor" && handleSelectBlock("moa")}
                    className={cn(
                      "p-4 rounded-2xl bg-[#f8faf8] border border-black/[0.08] shadow-2xs transition relative group",
                      studioMode === "editor" && "cursor-pointer",
                      selectedBlockId === "moa" && studioMode === "editor"
                        ? "ring-2 ring-[var(--brand)] shadow-sm bg-white"
                        : "hover:border-black/20"
                    )}
                  >
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--ink-muted)] block mb-1">
                      {currentPage.moa.title}
                    </span>
                    <p className="text-[12px] text-[var(--ink-2)] leading-relaxed mb-3">
                      {currentPage.moa.detail}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {currentPage.moa.steps.map((step, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-xl bg-white border border-black/8 shadow-2xs text-center"
                        >
                          <span className="block text-[11px] font-extrabold text-[var(--ink)]">{step}</span>
                          <span className="block text-[9.5px] text-[var(--ink-muted)]">Cellular Target</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Chart / Comparison Section */}
                  <div
                    onClick={() => studioMode === "editor" && handleSelectBlock("chart")}
                    className={cn(
                      "p-4 rounded-2xl bg-white border border-black/[0.08] shadow-2xs transition relative group",
                      studioMode === "editor" && "cursor-pointer",
                      selectedBlockId === "chart" && studioMode === "editor"
                        ? "ring-2 ring-[var(--brand)] shadow-sm"
                        : "hover:border-black/20"
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[12px] font-bold text-[var(--ink)]">{currentPage.chart.title}</span>
                      <span className="text-[10.5px] font-mono text-[var(--ink-muted)]">
                        {currentPage.chart.cohort}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-[11px] font-bold mb-1">
                          <span>{currentPage.chart.arm1Label}</span>
                          <span className="text-[var(--brand)]">{currentPage.chart.arm1Val}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-black/5 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${currentPage.chart.arm1Val}%` }}
                            className="h-full bg-[var(--brand)] rounded-full transition-all duration-300"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[var(--ink-muted)] mb-1">
                          <span>{currentPage.chart.arm2Label}</span>
                          <span>{currentPage.chart.arm2Val}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-black/5 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${currentPage.chart.arm2Val}%` }}
                            className="h-full bg-black/25 rounded-full transition-all duration-300"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5. ISI / Fair Balance Footnote */}
                  <div
                    onClick={() => studioMode === "editor" && handleSelectBlock("isi")}
                    className={cn(
                      "p-3.5 rounded-2xl bg-[#fafafa] border border-black/[0.06] mt-auto transition relative group",
                      studioMode === "editor" && "cursor-pointer",
                      selectedBlockId === "isi" && studioMode === "editor"
                        ? "ring-2 ring-[var(--brand)] shadow-sm bg-white"
                        : "hover:border-black/20"
                    )}
                  >
                    <div className="text-[9.5px] font-bold text-[var(--ink-muted)] mb-1">
                      {currentPage.isi.title}:
                    </div>
                    <p className="text-[10px] text-[var(--ink-muted)] leading-normal">
                      {currentPage.isi.content}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* ── RIGHT PANEL (Chat Assistant, Editable Properties, Comments & Claims) ── */}
        {studioMode !== "generating" && (
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
            {/* Top Tabs Switcher */}
            <div className="p-3 border-b border-[var(--line)] bg-[#fafbf9] shrink-0">
              <div className="flex rounded-xl bg-[#edeef0] p-1 text-[12px] font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab("assistant")}
                  className={cn(
                    "flex-1 py-1.5 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-1.5",
                    activeTab === "assistant"
                      ? "bg-white text-[var(--ink)] shadow-2xs"
                      : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                  )}
                >
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  <span>Chat</span>
                </button>

                {studioMode === "editor" ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab("edit")}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-center transition cursor-pointer",
                      activeTab === "edit"
                        ? "bg-white text-[var(--ink)] shadow-2xs"
                        : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                    )}
                  >
                    Edit
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveTab("comments")}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-1",
                      activeTab === "comments"
                        ? "bg-white text-[var(--ink)] shadow-2xs"
                        : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                    )}
                  >
                    <span>Comments</span>
                    <span className="size-4 rounded-full bg-[var(--tint)] text-[var(--brand-deep)] text-[10px] font-black grid place-items-center">
                      {commentsList.length}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveTab("evidence")}
                  className={cn(
                    "flex-1 py-1.5 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-1",
                    activeTab === "evidence"
                      ? "bg-white text-[var(--ink)] shadow-2xs"
                      : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                  )}
                >
                  <span>Claims</span>
                  <span className="text-[10px] text-[var(--ink-muted)] font-normal">24</span>
                </button>
              </div>
            </div>

            {/* ── TAB 1: DIRECT CHAT WITH SWISHX (Persisted From Brief Screen) ── */}
            {activeTab === "assistant" && (
              <div className="flex-1 flex flex-col min-h-0">
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
                      <div
                        className={cn(
                          "rounded-2xl p-3 text-[12.5px] leading-relaxed max-w-[85%]",
                          msg.role === "user"
                            ? "bg-[var(--brand)] text-white rounded-tr-xs"
                            : "bg-[#f4f6f4] text-[var(--ink)] border border-black/5 rounded-tl-xs"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>

                <div className="p-3 border-t border-black/[0.06] bg-white shrink-0 space-y-2">
                  <div className="flex items-center gap-2 rounded-[12px] border border-black/15 bg-[#f7f8f6] px-3 py-2 focus-within:border-[var(--brand)] focus-within:bg-white focus-within:shadow-xs transition">
                    <Plus className="size-3.5 text-[var(--ink-muted)] shrink-0" />
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendMessage();
                      }}
                      placeholder="Ask SwishX to rephrase, highlight endpoints..."
                      className="flex-1 bg-transparent text-[12.5px] outline-none text-[var(--ink)] placeholder:text-[var(--ink-muted)]"
                    />
                    <button
                      type="button"
                      onClick={() => handleSendMessage()}
                      disabled={!chatInput.trim()}
                      className="grid size-6 place-items-center rounded-lg bg-[var(--brand)] text-white disabled:opacity-30 hover:bg-[var(--brand-deep)] transition cursor-pointer disabled:cursor-not-allowed shrink-0"
                    >
                      <Send className="size-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: EDIT CANVAS PROPERTIES (In Editor Mode) ── */}
            {activeTab === "edit" && studioMode === "editor" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
                  <span className="text-[12.5px] font-bold text-[var(--ink)] flex items-center gap-1.5">
                    <Pencil className="size-3.5 text-[var(--brand)]" />
                    Editing {selectedBlockId.toUpperCase()} Component
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("assistant")}
                    className="text-[11px] font-bold text-[var(--brand)] hover:underline cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                {selectedBlockId === "header" && (
                  <div className="space-y-3 text-[12px]">
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--ink-2)] mb-1">Headline Title</label>
                      <input
                        type="text"
                        value={currentPage.header.title}
                        onChange={(e) =>
                          updateCurrentPage((prev) => ({
                            ...prev,
                            header: { ...prev.header, title: e.target.value },
                          }))
                        }
                        className="w-full rounded-xl border border-black/15 p-2 text-[12.5px] font-semibold text-[var(--ink)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--ink-2)] mb-1">Subtitle / Mechanism Tagline</label>
                      <textarea
                        value={currentPage.header.subtitle}
                        onChange={(e) =>
                          updateCurrentPage((prev) => ({
                            ...prev,
                            header: { ...prev.header, subtitle: e.target.value },
                          }))
                        }
                        rows={2}
                        className="w-full rounded-xl border border-black/15 p-2 text-[12px] text-[var(--ink)] resize-none"
                      />
                    </div>
                  </div>
                )}

                {selectedBlockId === "heroStat" && (
                  <div className="space-y-3 text-[12px]">
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--ink-2)] mb-1">Hero Metric</label>
                      <input
                        type="text"
                        value={currentPage.heroStat.metric}
                        onChange={(e) =>
                          updateCurrentPage((prev) => ({
                            ...prev,
                            heroStat: { ...prev.heroStat, metric: e.target.value },
                          }))
                        }
                        className="w-full rounded-xl border border-black/15 p-2 text-[13px] font-bold text-[var(--ink)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--ink-2)] mb-1">Comparison Label</label>
                      <input
                        type="text"
                        value={currentPage.heroStat.comparison}
                        onChange={(e) =>
                          updateCurrentPage((prev) => ({
                            ...prev,
                            heroStat: { ...prev.heroStat, comparison: e.target.value },
                          }))
                        }
                        className="w-full rounded-xl border border-black/15 p-2 text-[12px] text-[var(--ink)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--ink-2)] mb-1">Clinical Detail</label>
                      <textarea
                        value={currentPage.heroStat.detail}
                        onChange={(e) =>
                          updateCurrentPage((prev) => ({
                            ...prev,
                            heroStat: { ...prev.heroStat, detail: e.target.value },
                          }))
                        }
                        rows={3}
                        className="w-full rounded-xl border border-black/15 p-2 text-[12px] text-[var(--ink)] resize-none"
                      />
                    </div>
                  </div>
                )}

                {selectedBlockId === "moa" && (
                  <div className="space-y-3 text-[12px]">
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--ink-2)] mb-1">MoA Section Title</label>
                      <input
                        type="text"
                        value={currentPage.moa.title}
                        onChange={(e) =>
                          updateCurrentPage((prev) => ({
                            ...prev,
                            moa: { ...prev.moa, title: e.target.value },
                          }))
                        }
                        className="w-full rounded-xl border border-black/15 p-2 text-[12.5px] font-semibold text-[var(--ink)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--ink-2)] mb-1">Cellular Description</label>
                      <textarea
                        value={currentPage.moa.detail}
                        onChange={(e) =>
                          updateCurrentPage((prev) => ({
                            ...prev,
                            moa: { ...prev.moa, detail: e.target.value },
                          }))
                        }
                        rows={3}
                        className="w-full rounded-xl border border-black/15 p-2 text-[12px] text-[var(--ink)] resize-none"
                      />
                    </div>
                  </div>
                )}

                {selectedBlockId === "chart" && (
                  <div className="space-y-3 text-[12px]">
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--ink-2)] mb-1">Arm 1 Value (%)</label>
                      <input
                        type="number"
                        value={currentPage.chart.arm1Val}
                        onChange={(e) =>
                          updateCurrentPage((prev) => ({
                            ...prev,
                            chart: { ...prev.chart, arm1Val: Number(e.target.value) },
                          }))
                        }
                        className="w-full rounded-xl border border-black/15 p-2 text-[13px] font-bold text-[var(--ink)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--ink-2)] mb-1">Arm 2 (Placebo) Value (%)</label>
                      <input
                        type="number"
                        value={currentPage.chart.arm2Val}
                        onChange={(e) =>
                          updateCurrentPage((prev) => ({
                            ...prev,
                            chart: { ...prev.chart, arm2Val: Number(e.target.value) },
                          }))
                        }
                        className="w-full rounded-xl border border-black/15 p-2 text-[13px] font-bold text-[var(--ink)]"
                      />
                    </div>
                  </div>
                )}

                {selectedBlockId === "isi" && (
                  <div className="space-y-3 text-[12px]">
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--ink-2)] mb-1">ISI Content (Fair Balance)</label>
                      <textarea
                        value={currentPage.isi.content}
                        onChange={(e) =>
                          updateCurrentPage((prev) => ({
                            ...prev,
                            isi: { ...prev.isi, content: e.target.value },
                          }))
                        }
                        rows={5}
                        className="w-full rounded-xl border border-black/15 p-2 text-[11.5px] text-[var(--ink)] resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 2: REVIEWER COMMENTS (In Review Mode) ── */}
            {activeTab === "comments" && studioMode === "review" && (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="p-3.5 border-b border-[var(--line)] bg-[#fafbf9] space-y-2 shrink-0">
                  <div className="flex items-center justify-between text-[11.5px] font-bold text-[var(--ink)]">
                    <span>Add Reviewer Comment</span>
                    <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Page {activePageId}
                    </span>
                  </div>
                  <textarea
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    rows={2}
                    placeholder="Provide compliance or marketing feedback on this page..."
                    className="w-full rounded-xl border border-black/15 p-2.5 text-[12px] text-[var(--ink)] resize-none outline-none focus:border-[var(--brand)]"
                  />
                  <Button
                    size="sm"
                    onClick={handleAddComment}
                    disabled={!newCommentText.trim()}
                    className="w-full h-8.5 rounded-xl bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white text-[11.5px] font-bold cursor-pointer disabled:opacity-40"
                  >
                    Post Comment
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
                  {commentsList.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl border border-black/8 bg-white shadow-2xs space-y-1.5 text-left"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className="size-6 rounded-full bg-[var(--tint)] text-[var(--brand-deep)] font-extrabold text-[10px] grid place-items-center">
                            {c.avatar}
                          </span>
                          <span className="font-bold text-[12px] text-[var(--ink)] truncate">{c.author}</span>
                        </div>
                        <span className="text-[10px] text-[var(--ink-muted)]">{c.time}</span>
                      </div>
                      <p className="text-[11.5px] text-[var(--ink-2)] leading-relaxed pl-7">{c.text}</p>
                      <div className="pl-7 pt-1 flex items-center justify-between text-[10.5px]">
                        <span className="text-[var(--brand)] font-bold cursor-pointer hover:underline">Reply</span>
                        {c.resolved ? (
                          <span className="text-emerald-700 font-bold">✓ Resolved</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setCommentsList((prev) =>
                                prev.map((item) => (item.id === c.id ? { ...item, resolved: true } : item))
                              );
                              showToast("Comment marked as resolved");
                            }}
                            className="text-[var(--ink-muted)] hover:text-[var(--ink)] cursor-pointer"
                          >
                            Mark as resolved
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB 3: CLAIMS & EVIDENCE LIBRARY ── */}
            {activeTab === "evidence" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5">
                  <div>
                    <div className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[var(--ink-muted)]">
                      Compliance Grounding
                    </div>
                    <h2 className="mt-0.5 text-[14px] font-[800] text-[var(--ink)]">24 Approved Claims</h2>
                  </div>
                  <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[9.5px] font-bold">
                    ✓ PromoMats Verified
                  </span>
                </div>

                <div className="space-y-2.5">
                  {CLAIMS_LIST.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-xl border border-black/[0.06] bg-[#fafbf9] p-3 text-left hover:border-[var(--brand)]/40 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9.5px] font-bold text-[var(--brand-deep)] bg-[var(--tint)] px-2 py-0.5 rounded-md">
                          {c.tag}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700">✓ Approved</span>
                      </div>
                      <p className="text-[11.5px] text-[var(--ink-2)] leading-relaxed mt-1">{c.desc}</p>
                      <div className="text-[10px] text-[var(--ink-muted)] mt-1.5 pt-1 border-t border-black/5 flex items-center justify-between">
                        <span>Source: {c.source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* ── SHARE MODAL ── */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[460px] rounded-2xl bg-white p-6 shadow-2xl border border-black/10 text-left space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="size-8 rounded-full bg-[var(--tint)] text-[var(--brand)] grid place-items-center font-bold">
                  <Share2 className="size-4" />
                </span>
                <h3 className="text-[16px] font-black text-[var(--ink)]">Share Review Link</h3>
              </div>
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="size-7 rounded-full hover:bg-black/5 grid place-items-center text-[var(--ink-muted)]"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="text-[12.5px] text-[var(--ink-muted)]">
              Anyone with this internal review link can inspect clinical claims, leave comments, and download high-resolution PDF proofs.
            </p>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#f7f8f6] border border-black/10">
              <input
                type="text"
                readOnly
                value={`https://swishx.biz/review/creatives/${brandName.toLowerCase()}-hcp-v1`}
                className="flex-1 bg-transparent text-[11.5px] font-mono text-[var(--ink)] outline-none select-all"
              />
              <Button
                size="sm"
                onClick={() => {
                  navigator.clipboard?.writeText(`https://swishx.biz/review/creatives/${brandName.toLowerCase()}-hcp-v1`);
                  showToast("Shareable link copied to clipboard");
                  setShareModalOpen(false);
                }}
                className="h-7.5 px-3 rounded-lg bg-[var(--brand)] text-white text-[11px] font-bold"
              >
                <Copy className="size-3 mr-1" />
                Copy
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── EXPORT MODAL ── */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[460px] rounded-2xl bg-white p-6 shadow-2xl border border-black/10 text-left space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="size-8 rounded-full bg-[var(--tint)] text-[var(--brand)] grid place-items-center font-bold">
                  <Download className="size-4" />
                </span>
                <h3 className="text-[16px] font-black text-[var(--ink)]">Export High-Res Package</h3>
              </div>
              <button
                type="button"
                onClick={() => setExportModalOpen(false)}
                className="size-7 rounded-full hover:bg-black/5 grid place-items-center text-[var(--ink-muted)]"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="text-[12.5px] text-[var(--ink-muted)]">
              Select desired export format for {brandName} HCP Leave-Behind ({pagesList.length} pages):
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  showToast("Generated CMYK Print-Ready PDF with 3mm Bleed");
                  setExportModalOpen(false);
                }}
                className="w-full p-3 rounded-xl border border-black/10 hover:border-[var(--brand)] hover:bg-[var(--tint)]/30 text-left flex items-center justify-between cursor-pointer transition"
              >
                <div>
                  <div className="font-bold text-[13px] text-[var(--ink)]">Print-Ready PDF (CMYK · 300 DPI)</div>
                  <div className="text-[11px] text-[var(--ink-muted)]">Includes crop marks and 3mm bleed for commercial print</div>
                </div>
                <Download className="size-4 text-[var(--brand)]" />
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast("Downloaded Digital RGB Tablet PDF");
                  setExportModalOpen(false);
                }}
                className="w-full p-3 rounded-xl border border-black/10 hover:border-[var(--brand)] hover:bg-[var(--tint)]/30 text-left flex items-center justify-between cursor-pointer transition"
              >
                <div>
                  <div className="font-bold text-[13px] text-[var(--ink)]">Digital Screen PDF (RGB · 150 DPI)</div>
                  <div className="text-[11px] text-[var(--ink-muted)]">Optimized for iPad detailing &amp; Veeva CLM presentation</div>
                </div>
                <Download className="size-4 text-[var(--brand)]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIRM CREATIVE GENERATION MODAL (Matching Exact Form & Rate Spec with Quality & MLR Layer) ── */}
      {confirmGenerateModalOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#10231c]/50 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm Creative Generation"
        >
          <div className="rise-in w-full max-w-[560px] overflow-hidden rounded-[24px] border border-white/50 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.18)] text-left">
            <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4.5 bg-[#fafbf9]">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--brand)]">
                  <Sparkles className="size-3.5" /> Generation Engine
                </div>
                <h2 className="mt-0.5 text-[20px] font-[850] tracking-tight text-[var(--ink)]">
                  Confirm Creative Generation
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setConfirmGenerateModalOpen(false)}
                className="size-8 rounded-full hover:bg-black/5 cursor-pointer"
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="p-6 space-y-5">
              {/* Cost & Spec Card */}
              <div className="rounded-2xl bg-[#121614] border border-white/10 p-5 text-white shadow-md">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-white/60">
                      Credits Deducted
                    </div>
                    <div className="text-[20px] font-[900] text-white mt-0.5">
                      ⚡ {(pagesList.length * 300).toLocaleString()} Credits
                    </div>
                  </div>
                  <span className="rounded-full bg-[var(--brand)]/20 border border-[var(--brand)] px-3 py-1 text-[11px] font-bold text-[var(--brand)]">
                    Vector 300 DPI
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 text-[11.5px] text-white/75">
                  <div>
                    <span className="text-white/50 block text-[10px] uppercase font-bold">Pages &amp; Format</span>
                    <strong className="text-white">
                      {pagesList.length} {pagesList.length === 1 ? "Page" : "Pages"} · {pageShape === "16:9" ? "16:9 Landscape" : pageShape === "A4" ? "A4 Print" : "3:4 Tablet"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-white/50 block text-[10px] uppercase font-bold">Estimated Render Time</span>
                    <strong className="text-white">~30–45 sec</strong>
                  </div>
                  <div>
                    <span className="text-white/50 block text-[10px] uppercase font-bold">Team Balance</span>
                    <strong className="text-emerald-400">50,000 Credits</strong>
                  </div>
                  <div>
                    <span className="text-white/50 block text-[10px] uppercase font-bold">Balance Remaining</span>
                    <strong className="text-white">
                      {(50000 - pagesList.length * 300).toLocaleString()} Credits
                    </strong>
                  </div>
                </div>
              </div>

              {/* Automated Quality & MLR Pre-Flight Verification Card */}
              <div
                className={cn(
                  "rounded-2xl border p-4 space-y-2.5 text-[12px] transition",
                  hasBlockers
                    ? "border-amber-200 bg-amber-50/60 text-amber-950"
                    : "border-emerald-200 bg-emerald-50/70 text-emerald-900"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold">
                    {hasBlockers ? (
                      <AlertTriangle className="size-4 text-amber-700 shrink-0" />
                    ) : (
                      <ShieldCheck className="size-4 text-emerald-700 shrink-0" />
                    )}
                    <span>Quality &amp; MLR Pre-Flight Verification</span>
                  </div>
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold",
                      hasBlockers
                        ? "bg-rose-100 text-rose-800 border-rose-300"
                        : "bg-emerald-100 text-emerald-800 border-emerald-300"
                    )}
                  >
                    {hasBlockers ? `${6 - blockerCount}/6 Passed · ${blockerCount} Blockers` : "6/6 Passed · 0 Blockers"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                  {/* 1. MLR Check Card (With Blocker & Fix Action) */}
                  {!mlrCheckResolved ? (
                    <div className="flex flex-col justify-between bg-rose-50/90 rounded-lg p-2.5 border border-rose-200 text-rose-950">
                      <div className="flex items-start gap-1.5">
                        <AlertTriangle className="size-3.5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block text-rose-900">MLR: Unverified Comparative Claim</span>
                          <span className="text-[10px] text-rose-800/80 leading-tight block mt-0.5">
                            Hero card compares efficacy without citing comparator placebo cohort.
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleFixMlrBlocker}
                        className="mt-2 inline-flex items-center gap-1 self-start rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-2 py-0.5 shadow-2xs cursor-pointer transition"
                      >
                        <Sparkles className="size-2.5" />
                        <span>Fix with SwishX →</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start gap-1.5 bg-white/70 rounded-lg p-2.5 border border-emerald-100 text-emerald-900">
                      <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-[var(--ink)]">24 Verified Claims Cited</span>
                        <span className="text-[10px] text-[var(--ink-muted)]">EMBRACE-3 §2.4 grounded (p &lt; 0.001)</span>
                      </div>
                    </div>
                  )}

                  {/* 2. Quality Check Card (With Blocker & Fix Action) */}
                  {!qaCheckResolved ? (
                    <div className="flex flex-col justify-between bg-amber-50/90 rounded-lg p-2.5 border border-amber-200 text-amber-950">
                      <div className="flex items-start gap-1.5">
                        <AlertTriangle className="size-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block text-amber-900">Quality: Subtitle Phrasing Redundancy</span>
                          <span className="text-[10px] text-amber-800/80 leading-tight block mt-0.5">
                            Tagline contains redundant descriptors and unstandardized dosing syntax.
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleFixQaBlocker}
                        className="mt-2 inline-flex items-center gap-1 self-start rounded-md bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold px-2 py-0.5 shadow-2xs cursor-pointer transition"
                      >
                        <Sparkles className="size-2.5" />
                        <span>Fix with SwishX →</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start gap-1.5 bg-white/70 rounded-lg p-2.5 border border-emerald-100 text-emerald-900">
                      <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-[var(--ink)]">Editorial &amp; Spelling Clear</span>
                        <span className="text-[10px] text-[var(--ink-muted)]">Nomenclature and syntax verified</span>
                      </div>
                    </div>
                  )}

                  {/* 3. Fair Balance & ISI Present */}
                  <div className="flex items-start gap-1.5 bg-white/70 rounded-lg p-2.5 border border-emerald-100 text-emerald-900">
                    <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-[var(--ink)]">Fair Balance &amp; ISI Present</span>
                      <span className="text-[10px] text-[var(--ink-muted)]">eGFR ≥25 &amp; box warnings verified</span>
                    </div>
                  </div>

                  {/* 4. Vector Layout & Contrast */}
                  <div className="flex items-start gap-1.5 bg-white/70 rounded-lg p-2.5 border border-emerald-100 text-emerald-900">
                    <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-[var(--ink)]">Vector Layout &amp; Contrast</span>
                      <span className="text-[10px] text-[var(--ink-muted)]">300 DPI CMYK ready hierarchy</span>
                    </div>
                  </div>
                </div>

                {/* Optional Auto-Fix helper */}
                {hasBlockers && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-black/[0.04] text-[11px] font-semibold text-[var(--ink-2)] border border-black/5 mt-1">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="size-3 text-[var(--brand)]" />
                      Want SwishX to auto-fix both blockers instantly?
                    </span>
                    <button
                      type="button"
                      onClick={handleAutoFixBoth}
                      className="text-[var(--brand)] font-bold hover:underline cursor-pointer"
                    >
                      Auto-Fix Both ⚡
                    </button>
                  </div>
                )}
              </div>

              {/* Informational Notice */}
              <p className="text-[12px] text-[var(--ink-muted)] leading-relaxed">
                Generation renders in the background using publication vector models. You will receive an email notification when processing completes, and can continue working in SwishX.
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]">
                {hasBlockers ? (
                  <span className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                    <AlertTriangle className="size-3 shrink-0" />
                    Fix {blockerCount} {blockerCount === 1 ? "blocker" : "blockers"} to enable generation
                  </span>
                ) : (
                  <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                    All Quality &amp; MLR checks verified
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setConfirmGenerateModalOpen(false)}
                    className="font-bold cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    disabled={hasBlockers}
                    onClick={() => {
                      if (hasBlockers) return;
                      setConfirmGenerateModalOpen(false);
                      handlePublishCreative();
                    }}
                    className={cn(
                      "font-bold px-5 gap-1.5 transition-all",
                      hasBlockers
                        ? "bg-black/10 text-black/35 cursor-not-allowed border-none shadow-none"
                        : "bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white cursor-pointer shadow-xs"
                    )}
                  >
                    <Sparkles className="size-3.5" />
                    <span>Confirm &amp; Generate Creative</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST NOTIFICATION ── */}
      {toastMessage && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-[#111614] text-white px-4 py-2 text-[12px] font-bold shadow-2xl border border-white/15 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="size-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
