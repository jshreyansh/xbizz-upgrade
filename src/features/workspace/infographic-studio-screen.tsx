"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BarChart3,
  ArrowLeft,
  Check,
  CheckCircle2,
  Download,
  Image as ImageIcon,
  Layers,
  MessageSquare,
  PanelRight,
  Pencil,
  Plus,
  Send,
  Share2,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommentsModal,
  ElementActionBar,
  ELEMENT_LABELS,
  commentStats,
  pageAnchor,
  type AssetComment,
} from "@/features/workspace/asset-comments";
import { ReviewComments } from "@/features/workspace/review-comments";
import {
  ArtRibbon,
  EditableCanvasText,
  FormatRibbon,
  EMPTY_STYLE,
  type CanvasTextElement,
  type TextStyle,
} from "@/features/workspace/canvas-text-toolbar";
import { SwishXMark } from "@/components/ui/swishx-mark";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { ShareReviewModal } from "@/features/workspace/share-review-modal";
import { cn } from "@/lib/cn";
import { ScreenHeader } from "@/components/patterns/screen-header";
import { LogoMark } from "@/components/ui/logo-mark";
import { WorkbenchLayout } from "@/components/patterns/workbench-layout";
import { PreflightPanel } from "@/features/workspace/preflight-panel";
import { GenerationCostCard } from "@/features/workspace/generation-cost-card";
import { ArtSlot, PageBackgroundArt } from "@/features/workspace/page-art-layers";

export type CreativeStudioMode = "editor" | "generating" | "review";

/**
 * One piece of art on a page.
 *
 * The box and the z-order are declared before the art exists, which is what
 * makes the two-pass generation safe: the layout pass settles where everything
 * sits, and the art pass only changes what is inside a box that has already
 * been placed. An arriving render cannot reflow the page.
 */
interface PageArtLayer {
  id: string;
  label: string;
  kind: "image" | "graph" | "background";
  /** Which block reserves room for it — see page-art-layers. */
  slot: "header" | "heroStat" | "moa" | "chart" | "page";
  z: number;
  /** Milliseconds from the start of generation when this art lands. */
  readyAt: number;
}

/**
 * The page's real dimensions, per shape.
 *
 * A page was being drawn at one width with `aspect-video` bolted on, so a
 * landscape page was a short letterbox with a tall column of blocks inside it
 * and `overflow-hidden` quietly eating the bottom half. The shape has to
 * decide the size AND the composition: a landscape page puts its body in two
 * columns because that is the only way a wide short box holds this much.
 */
const PAGE_GEOMETRY: Record<string, { width: number; height: number; columns: 1 | 2; label: string }> = {
  "16:9": { width: 1040, height: 585, columns: 2, label: "16:9 Landscape" },
  "9:16": { width: 520, height: 924, columns: 1, label: "9:16 Portrait" },
  "1:1": { width: 780, height: 780, columns: 1, label: "1:1 Square" },
  "3:4": { width: 720, height: 960, columns: 1, label: "3:4 Tablet" },
  A4: { width: 700, height: 990, columns: 1, label: "A4 Print" },
};

/* Layout first, across every page; then the art, one piece at a time. The
   same shape as the video flow's two passes, and the same reason — you can
   keep working on a composed page while the expensive part arrives. */
const LAYOUT_BY = 10_000;
const ART_FIRST = 20_000;
const ART_LAST = 50_000;

/** Art lands spread evenly between the first and last slot. */
function artSchedule(count: number): number[] {
  if (count <= 1) return [ART_FIRST];
  const step = (ART_LAST - ART_FIRST) / (count - 1);
  return Array.from({ length: count }, (_, i) => Math.round(ART_FIRST + i * step));
}

interface InfographicPageData {
  id: number;
  name: string;
  subtitle: string;
  /** Art layers, back to front. */
  art: PageArtLayer[];
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

const PAGE_1_ART: PageArtLayer[] = [
  { id: "p1-bg", label: "Dermal tissue wash", kind: "background", slot: "page", z: 0, readyAt: 0 },
  { id: "p1-moa", label: "Cellular cascade render", kind: "image", slot: "moa", z: 2, readyAt: 0 },
  { id: "p1-chart", label: "EMBRACE-3 response curve", kind: "graph", slot: "chart", z: 2, readyAt: 0 },
  { id: "p1-pack", label: "200mg pack shot", kind: "image", slot: "header", z: 3, readyAt: 0 },
];

const DEFAULT_PAGE_1: InfographicPageData = {
  id: 1,
  name: "Page 1: Front Summary",
  art: PAGE_1_ART.map((layer, i) => ({ ...layer, readyAt: artSchedule(PAGE_1_ART.length)[i] })),
  subtitle: "Executive Readout & MoA",
  header: {
    title: "VELMORA™ (tirzelamide) · 200mg",
    subtitle: "First-in-Class Dual Mechanism Kinase Inhibitor for Moderate-to-Severe Plaque Psoriasis",
    badge: "HCP Clinical Brief",
    approvalTag: "FDA Approved · 2026",
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
    citation: "FDA Prescribing Information §5.2",
  },
};

const PAGE_2_ART: PageArtLayer[] = [
  { id: "p2-bg", label: "Clinical gradient field", kind: "background", slot: "page", z: 0, readyAt: 0 },
  { id: "p2-durability", label: "52-week durability curve", kind: "graph", slot: "chart", z: 2, readyAt: 0 },
  { id: "p2-renal", label: "Renal clearance schematic", kind: "image", slot: "moa", z: 2, readyAt: 0 },
];

const DEFAULT_PAGE_2: InfographicPageData = {
  id: 2,
  name: "Page 2: Evidence & Tolerability",
  art: PAGE_2_ART.map((layer, i) => ({ ...layer, readyAt: artSchedule(PAGE_2_ART.length)[i] })),
  subtitle: "52-Week Durability & Renal Boundary",
  header: {
    title: "VELMORA™ · Clinical Evidence & Safety",
    subtitle: "Long-Term Extension Cohorts, Organ Safety & Prescribing Thresholds",
    badge: "Clinical Evidence Spread",
    approvalTag: "FDA Label §2.1 & §5.2",
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
    content: "Initiation is not recommended in patients with eGFR < 25 mL/min/1.73m². Co-administration with strong CYP3A4 inhibitors should be monitored. Consult the full Prescribing Information.",
    citation: "Package Insert §2.1 & §5.2",
  },
};

const CLAIMS_LIST = [
  { id: "claim-1", tag: "Claim §1.1 · Indication", desc: "Approved in adults aged 18+ for moderate-to-severe plaque psoriasis", source: "Prescribing Information p.3" },
  { id: "claim-2", tag: "Claim §2.4 · Efficacy (52% PASI 90)", desc: "Statistically significant skin clearance vs 18% in placebo (p < 0.001)", source: "EMBRACE-3 readout Table 2.4" },
  { id: "claim-3", tag: "Claim §3.1 · Mechanism (Dual Kinase)", desc: "Selective cellular kinase receptor binding and downstream cytokine inhibition", source: "Lancet Derm 2024; 42:118" },
  { id: "claim-4", tag: "Claim §4.2 · Durability (Week 52)", desc: "Clearance maintained through 52-week open-label extension cohort", source: "EMBRACE-3 Long-Term Study" },
  { id: "claim-5", tag: "Claim §5.2 · Tolerability & Safety", desc: "Contraindicated in severe hepatic impairment. Transient mild headache (<6%)", source: "FDA Label §5.2 Safety" },
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
    copilotPanelWidth,
    setCopilotPanelWidth,
    toggleCopilotPanel,
    setCopilotPanelOpen,
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

  /* ── Two-pass generation ──────────────────────────────────────────────────
     The studio opens on a page that is being built, not on a spinner. Blocks
     land through the layout pass, art fills the boxes they declared, and the
     page is editable the whole way — which is only safe because the boxes are
     settled before any art arrives. */
  // Stamped in the effect, not during render: Date.now() in a render body is
  // an impure read, and the clock should start when the studio mounts anyway.
  const genStartRef = useRef(0);
  const [genElapsed, setGenElapsed] = useState(0);

  useEffect(() => {
    genStartRef.current = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - genStartRef.current;
      setGenElapsed(elapsed);
      if (elapsed >= ART_LAST) clearInterval(tick);
    }, 200);
    return () => clearInterval(tick);
  }, []);

  /* Blocks arrive in reading order, all of them inside the layout pass. */
  const BLOCK_ORDER = ["header", "heroStat", "moa", "chart", "isi"] as const;
  const blocksLanded = Math.min(
    BLOCK_ORDER.length,
    Math.floor(genElapsed / (LAYOUT_BY / BLOCK_ORDER.length))
  );
  const blockLanded = (id: (typeof BLOCK_ORDER)[number]) => BLOCK_ORDER.indexOf(id) < blocksLanded;
  const layoutDone = blocksLanded >= BLOCK_ORDER.length;
  const [selectedArtId, setSelectedArtId] = useState<string | null>(null);
  const artUploadRef = useRef<HTMLInputElement>(null);

  /* The page is drawn at its true size and scaled to the room available, so
     the mat measures itself rather than the page guessing. */
  const canvasAreaRef = useRef<HTMLElement | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(0);

  useEffect(() => {
    const node = canvasAreaRef.current;
    if (!node) return;
    // The observer fires on observe, so there is no need to seed the width
    // from the effect body — which would be a synchronous setState in an
    // effect, and a cascading render.
    const observer = new ResizeObserver(() => setCanvasWidth(node.clientWidth));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  /* ── The composition fits the page, always ─────────────────────────────────
     A page is a fixed canvas, so a composition taller than the canvas is not
     a scrolling page — it is a clipped one, and the bottom of a clipped page
     is where fair balance lives. The content plan's fit chips keep blocks inside
     their own boxes; this is the guard for everything they cannot know about,
     like a shape change that turns a tall page into a wide one.

     Measured height is the natural height: a transform does not change layout,
     so scaling the composition cannot feed back into what is being measured.
     Width stays at 100%, so a scaled composition sits inset from the page
     edges rather than off-centre — which reads as a margin, not a fault. */
  const compositionRef = useRef<HTMLDivElement | null>(null);
  const [compositionHeight, setCompositionHeight] = useState(0);

  useEffect(() => {
    const node = compositionRef.current;
    if (!node) return;
    const observer = new ResizeObserver(() => setCompositionHeight(node.scrollHeight));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const [selectedBlockId, setSelectedBlockId] = useState<"header" | "heroStat" | "moa" | "chart" | "isi">("heroStat");

  /* ── Element-level selection ──────────────────────────────────────────────
     A block is a container; the text inside it is what people actually mean
     when they say "make that bigger". Selecting a run keeps the block
     selected too, so the inspector and the layer rail stay truthful. */
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [elementStyles, setElementStyles] = useState<Record<string, TextStyle>>({});
  /* Runs whose words were retyped after they were grounded. The claim is not
     wrong — it is unverified, which is a different and recoverable state. */
  const [reverifyElements, setReverifyElements] = useState<string[]>([]);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const [confirmGenerateModalOpen, setConfirmGenerateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Multi-page management
  /**
   * Laying out the first page spends its share of the quote, holding back the
   * render reserve — so a creative with no edits lands exactly on budget and
   * the over-budget warning only appears when something actually went over.
   */
  const pagesListInitialCost = 300 - 120;
  const [pagesList, setPagesList] = useState<InfographicPageData[]>([DEFAULT_PAGE_1]);
  /**
   * Credits as a budget against an actual, not a single deducted figure.
   *
   * The card said "Credits Deducted: pages x 300", which is the BUDGET agreed
   * at the start. By the time you reach it you have already spent credits
   * generating pages and re-running layers, and the final render costs more on
   * top — so the only figure a user can act on was the one missing.
   */
  const [creditsUsed, setCreditsUsed] = useState(() => pagesListInitialCost);
  const creditBudget = pagesList.length * 300;
  /** What rendering the final artwork costs on top of what is already spent. */
  const finalRenderCost = pagesList.length * 120;
  const creditsTotal = creditsUsed + finalRenderCost;
  const teamBalance = 50000;
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

  const isReview = studioMode === "review";

  // Reviewer Comments State
  /* The same records the video studio uses. Anchored to (surface, page,
     element), so a note about the hero metric is a note about the hero metric
     and the list can say where it lives. */
  const [comments, setComments] = useState<AssetComment[]>([
    {
      id: "c-1",
      ...pageAnchor(1),
      elementId: "heroStat.metric",
      elementLabel: ELEMENT_LABELS["heroStat.metric"],
      author: "Sarah Lin (Medical Director)",
      role: "Medical Reviewer",
      avatar: "SL",
      text: "Ensure the EMBRACE-3 PASI 90 p-value (p < 0.001) is clearly displayed alongside the Week 16 primary endpoint.",
      at: "10m ago",
      source: "team",
      status: "open",
      sentToChat: false,
    },
    {
      id: "c-2",
      ...pageAnchor(1),
      elementId: "isi.content",
      elementLabel: ELEMENT_LABELS["isi.content"],
      author: "David Vance (Regulatory Lead)",
      role: "MLR Officer",
      avatar: "DV",
      text: "Grounded accurately in FDA §2.1. The eGFR ≥25 cut-off warning in the footer meets fair balance standards.",
      at: "18m ago",
      source: "team",
      status: "resolved",
      closedBy: "user",
      closedReason: "No change needed — the cut-off already sits in the fair balance block.",
      sentToChat: false,
    },
  ]);
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  /** Where the in-place composer is anchored — a note about a run is written
   *  next to the run, the same as on the video canvas. */
  const [commentComposerAt, setCommentComposerAt] = useState<{ x: number; y: number } | null>(null);
  const commentSeq = useRef(0);

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
    // A page added after the quote is work that was not quoted for.
    setCreditsUsed((prev) => prev + 300);
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
  /** The art reserved for one block, or nothing if this page has none there. */
  const artFor = (slot: PageArtLayer["slot"]) => currentPage.art.find((a) => a.slot === slot);
  const selectedArt = selectedArtId ? currentPage.art.find((a) => a.id === selectedArtId) ?? null : null;
  const anyModalOpen = confirmGenerateModalOpen || commentsModalOpen || shareModalOpen || exportModalOpen;

  /* Stacking order is the one spatial property art has here — where it sits
     and how big it is come from the slot the layout reserved for it. */
  const nudgeArtOrder = (id: string, delta: number) => {
    updateCurrentPage((prev) => ({
      ...prev,
      art: prev.art.map((layer) =>
        layer.id === id ? { ...layer, z: Math.max(0, Math.min(9, layer.z + delta)) } : layer
      ),
    }));
  };

  /* Re-rendering one layer costs what generating it cost, and it lands back
     on the same clock — the box it occupies never moves. */
  const regenerateArt = (id: string) => {
    const layer = currentPage.art.find((a) => a.id === id);
    if (!layer) return;
    updateCurrentPage((prev) => ({
      ...prev,
      art: prev.art.map((a) => (a.id === id ? { ...a, readyAt: genElapsed + 12_000 } : a)),
    }));
    setCreditsUsed((prev) => prev + 120);
    showToast(`Re-rendering ${layer.label}`);
  };

  const addArtToChat = (id: string) => {
    const layer = currentPage.art.find((a) => a.id === id);
    if (!layer) return;
    setActiveTab("assistant");
    setChatInput(`Change the ${layer.label.toLowerCase()} so that `);
    showToast(`${layer.label} attached to chat`);
  };

  const pageGeometry = PAGE_GEOMETRY[pageShape] ?? PAGE_GEOMETRY["3:4"];
  /* Never scaled up past its true size — a 520px portrait page blown up to
     fill a wide mat would be a lie about how big the asset is. */
  const pageFitScale = canvasWidth > 0
    ? Math.min(1, (canvasWidth - 72) / pageGeometry.width)
    : 1;
  const pageScale = (zoomLevel / 100) * pageFitScale;
  const compositionFit = compositionHeight > pageGeometry.height
    ? pageGeometry.height / compositionHeight
    : 1;

  const updateCurrentPage = (updater: (prev: InfographicPageData) => InfographicPageData) => {
    setPagesList((prev) =>
      prev.map((p) => (p.id === activePageId ? updater(p) : p))
    );
  };

  /* Every text run on the page, with the size the template gives it so the
     stepper starts from the truth rather than from a round number. Citations
     come from the page data, not a literal, so the claim badge is real. */
  const textElements: Record<string, CanvasTextElement> = useMemo(
    () => ({
      "header.badge": { id: "header.badge", blockId: "header", label: "Eyebrow", baseSize: 9, baseWeight: 800 },
      "header.approvalTag": { id: "header.approvalTag", blockId: "header", label: "Reference", baseSize: 10, baseWeight: 400, citation: currentPage.header.approvalTag },
      "header.title": { id: "header.title", blockId: "header", label: "Headline", baseSize: 24, baseWeight: 850 },
      "header.subtitle": { id: "header.subtitle", blockId: "header", label: "Subhead", baseSize: 12, baseWeight: 500, multiline: true },
      "heroStat.category": { id: "heroStat.category", blockId: "heroStat", label: "Stat label", baseSize: 10, baseWeight: 800 },
      "heroStat.metric": { id: "heroStat.metric", blockId: "heroStat", label: "Hero metric", baseSize: 30, baseWeight: 900, citation: currentPage.heroStat.citation },
      "heroStat.comparison": { id: "heroStat.comparison", blockId: "heroStat", label: "Comparator", baseSize: 13, baseWeight: 700, citation: currentPage.heroStat.citation },
      "heroStat.detail": { id: "heroStat.detail", blockId: "heroStat", label: "Supporting copy", baseSize: 12, baseWeight: 500, multiline: true },
      "moa.title": { id: "moa.title", blockId: "moa", label: "Section title", baseSize: 13, baseWeight: 850 },
      "moa.detail": { id: "moa.detail", blockId: "moa", label: "Section copy", baseSize: 12, baseWeight: 500, multiline: true },
      "isi.title": { id: "isi.title", blockId: "isi", label: "Safety heading", baseSize: 11, baseWeight: 800 },
      "isi.content": { id: "isi.content", blockId: "isi", label: "Safety copy", baseSize: 10, baseWeight: 400, multiline: true, citation: currentPage.isi.citation },
    }),
    [currentPage]
  );

  const selectedElement = selectedElementId ? textElements[selectedElementId] ?? null : null;

  const BLOCK_LABELS: Record<string, string> = {
    header: "Header band",
    heroStat: "Stat hero",
    moa: "Mechanism",
    chart: "Chart",
    isi: "Safety",
  };

  const handleSelectElement = (id: string, rect: DOMRect | { top: number; left: number; width: number; height: number }) => {
    setSelectedElementId(id);
    const el = textElements[id];
    if (el) setSelectedBlockId(el.blockId as never);
    // The action bar opens with the selection, the same as on the video canvas.
    setSelectedArtId(null);
    setCommentComposerAt({ x: rect.left + rect.width / 2, y: rect.top + rect.height });
  };

  const clearElementSelection = () => {
    setSelectedElementId(null);
    setCommentComposerAt(null);
  };

  const patchElementStyle = (patch: Partial<TextStyle>) => {
    if (!selectedElementId) return;
    setElementStyles((prev) => ({
      ...prev,
      [selectedElementId]: { ...EMPTY_STYLE, ...prev[selectedElementId], ...patch },
    }));
  };

  const resetElementStyle = () => {
    if (!selectedElementId) return;
    setElementStyles((prev) => {
      const next = { ...prev };
      delete next[selectedElementId];
      return next;
    });
    showToast("Formatting reset to the template");
  };

  const addElementToChat = () => {
    if (!selectedElement) return;
    setActiveTab("assistant");
    const [blockId, field] = selectedElement.id.split(".");
    const value = ((currentPage as unknown as Record<string, Record<string, string>>)[blockId] ?? {})[field];
    setChatInput(`Rewrite the ${selectedElement.label.toLowerCase()} ("${value}") `);
    showToast(`${selectedElement.label} attached to chat`);
  };

  /* One text run on the page. The value is read from the page by the run's own
     id rather than passed in, so a run cannot be wired to the wrong field —
     the id is the single place the binding is stated. */
  const runValue = (id: string): string => {
    const [blockId, field] = id.split(".");
    const block = (currentPage as unknown as Record<string, Record<string, unknown>>)[blockId] ?? {};
    return String(block[field] ?? "");
  };

  const run = (id: string, className: string, as: "span" | "h1" | "p" | "div" = "span") => (
    <EditableCanvasText
      as={as}
      element={textElements[id]}
      value={runValue(id)}
      style={elementStyles[id]}
      className={className}
      locked={studioMode !== "editor"}
      selected={selectedElementId === id}
      onSelect={(r) => handleSelectElement(id, r)}
    />
  );

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
        reply = `Applied direction for "${text}". The infographic layout, styling, and verified FDA citations remain 100% compliant.`;
      }

      addChatMessage({ role: "swishx", text: reply });
      // Re-running a page through the agent costs, as a scene rewrite does.
      setCreditsUsed((prev) => prev + 400);
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
      if (!copilotPanelOpen) toggleCopilotPanel();
      showToast("Creative published · Opened Shared Review View");
    }, 2300);
  };

  /**
   * A comment on the selected run, composed in place.
   *
   * Anchored to (page, element) like every other comment, so the list can say
   * where it lives and take you to it. "Send to chat" is one gesture rather
   * than two because the commonest thing after writing a note about your own
   * work is asking for the change.
   */
  const addElementComment = (text: string, alsoSendToChat: boolean) => {
    // A counter rather than a timestamp: the id is needed straight away to
    // hand the comment to the agent, and a clock read is an impure call the
    // component body has no business making.
    commentSeq.current += 1;
    const id = `c-mine-${commentSeq.current}`;
    setComments((prev) => [
      {
        id,
        ...pageAnchor(activePageId),
        elementId: selectedElementId ?? "page",
        elementLabel: selectedElement?.label ?? ELEMENT_LABELS.page,
        author: "You",
        role: "Creative Author",
        avatar: "MK",
        text,
        at: "Just now",
        source: "mine",
        status: "open",
        sentToChat: false,
      },
      ...prev,
    ]);
    setCommentComposerAt(null);
    if (alsoSendToChat) setTimeout(() => sendCommentToAgent(id), 60);
    else showToast("Comment added");
  };

  /* Closing a comment. A team comment cannot close without a note — the
     person who wrote it only ever sees the share link, so "Resolved" with
     nothing attached reads as being ignored. The gate lives in the card;
     this only records what came back. */
  const closeComment = (id: string, as: "resolved" | "rejected", note: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: as, closedBy: "user" as const, closedReason: note || undefined } : c
      )
    );
    showToast(as === "resolved" ? "Comment resolved" : "Comment discarded");
  };

  /* Team comments arrive from outside. Nothing here is acted on by itself —
     it reaches the agent only when the author sends it, which is this. */
  const sendCommentToAgent = (id: string) => {
    const comment = comments.find((c) => c.id === id);
    if (!comment) return;
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, sentToChat: true } : c)));
    setActiveTab("assistant");
    addChatMessage({
      role: "user",
      text: `[${comment.containerLabel} · ${comment.elementLabel}] ${comment.text}`,
    });
    setTimeout(() => {
      addChatMessage({
        role: "swishx",
        text: `Picked that up against **${comment.containerLabel} · ${comment.elementLabel}**. Tell me to apply it and I will make the change, then you can close the comment with a note back to ${comment.author.split(" (")[0]}.`,
      });
    }, 700);
  };

  const jumpToComment = (comment: AssetComment) => {
    setInfographicActivePage(comment.containerNumber);
    if (textElements[comment.elementId]) {
      const node = document.querySelector(`[data-canvas-text="${comment.elementId}"]`);
      if (node) {
        node.scrollIntoView({ behavior: "smooth", block: "center" });
        handleSelectElement(comment.elementId, node.getBoundingClientRect());
        return;
      }
    }
    showToast(`${comment.containerLabel} · ${comment.elementLabel}`);
  };

  return (
    <WorkbenchLayout
      className="bg-[#edf0ed] text-left"
      panelOpen={copilotPanelOpen}
      onPanelOpenChange={setCopilotPanelOpen}
      panelWidth={copilotPanelWidth}
      onPanelWidthChange={setCopilotPanelWidth}
      panelStorageKey="swishx.copilotPanelWidth"
      /* Below 1024 there is not enough width for canvas + inspector:
         the panel closes once on the way down, and a deliberate
         re-open sticks. Tablet portrait is review-only by design. */
      autoCollapsePanelBelow="laptop"
      header={
        <ScreenHeader spread>
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
              className="focus-ring mr-1 grid size-8 place-items-center rounded-chip text-ink-3 hover:bg-black/5 hover:text-ink cursor-pointer"
              title="Back"
              aria-label="Back"
            >
              <ArrowLeft className="size-4" />
            </button>

            <SwishXMark compact />
            <div className="mx-2.5 h-5 w-px bg-hair" />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-body-lg font-[850] text-ink tracking-tight">
                  {brandName} HCP Infographic
                </span>
                <span className="hidden rounded-chip bg-ok-bg px-2 py-0.5 text-micro font-bold text-ink-3 sm:inline">
                  Draft v1
                </span>
              </div>
              <div className="mt-0.5 hidden text-micro text-ink-3 sm:block">
                Saved just now · Canvas Studio · {pagesList.length} {pagesList.length === 1 ? "Page" : "Pages"} ({pageGeometry.label})
              </div>
            </div>

            {/* Mode Switchers */}
            <div className="ml-4 hidden items-center gap-1.5 md:flex">
              {studioMode === "editor" && (
                <span className="rounded-chip bg-tint px-2.5 py-0.5 text-caption font-extrabold text-brand-deep border border-tint-line">
                  Canvas Editor
                </span>
              )}
              {studioMode === "generating" && (
                <span className="inline-flex items-center gap-1.5 rounded-chip bg-tint border border-tint-line px-3 py-1 text-caption font-extrabold text-brand-deep animate-pulse">
                  <LogoMark size={12} className="text-brand-deep animate-spin" />
                  <span>Generating High-Res Creative...</span>
                </span>
              )}
              {studioMode === "review" && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setStudioMode("editor")}
                    className="focus-ring flex items-center gap-1.5 rounded-chip border border-hair bg-canvas px-2.5 py-1 text-label font-bold text-ink-2 transition hover:border-brand hover:bg-tint hover:text-brand shadow-xs cursor-pointer"
                  >
                    <Pencil className="size-3 text-brand" />
                    <span>Editor</span>
                  </button>
                  <span className="text-ink-3">/</span>
                  <span className="rounded-chip bg-ok-bg px-3 py-0.5 text-caption font-extrabold text-ok border border-ok-line">
                    Shared Review View · Final Asset
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Center Canvas Zoom Controls */}
          {studioMode !== "generating" && (
            <div className="hidden sm:flex items-center gap-1 rounded-control border border-hair-2 bg-subtle p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
                className="p-1 text-ink-2 hover:text-black rounded-chip hover:bg-card cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="size-3.5" />
              </button>
              <span className="text-label font-mono font-bold text-ink px-1.5 min-w-[45px] text-center">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                className="p-1 text-ink-2 hover:text-black rounded-chip hover:bg-card cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(100)}
                className="px-2 py-0.5 text-caption font-bold text-brand hover:bg-card rounded-chip cursor-pointer"
              >
                Fit
              </button>
            </div>
          )}

          {/* Right Actions: Generate/Publish in Editor OR Export/Share in Review */}
          <div className="flex items-center gap-2">
            {studioMode === "editor" && (
              <Button
                size="sm"
                onClick={() => setConfirmGenerateModalOpen(true)}
                className="gap-1.5 bg-brand hover:bg-brand-deep text-white text-body font-bold shadow-xs cursor-pointer px-4.5 hover:scale-[1.02] transition-transform"
              >
                <LogoMark size={14} />
                <span>Generate and Publish</span>
              </Button>
            )}

            {/* The owner's way into comments, in the same place and the same
                shape as the video editor's. Hidden in review, where the
                reviewer's panel is the whole of what they see — a header
                counter there would offer the owner's My/Team view to someone
                who is not the owner. */}
            {studioMode !== "review" && (
              <button
                type="button"
                onClick={() => setCommentsModalOpen(true)}
                title="Comments"
                aria-label={`Comments — ${commentStats(comments).open} open`}
                className={cn(
                  "flex h-8 cursor-pointer items-center gap-1.5 rounded-chip border px-2.5 transition-colors",
                  commentStats(comments).open > 0
                    ? "border-brand/25 bg-tint text-brand-deep hover:bg-tint-strong"
                    : "border-hair-2 bg-card text-ink-3 shadow-2xs hover:border-brand hover:text-ink"
                )}
              >
                <MessageSquare className="size-3.5" />
                <span className="text-caption font-bold tabular-nums">{commentStats(comments).open}</span>
              </button>
            )}

            {studioMode === "review" && (
              <Button
                size="sm"
                onClick={() => setShareModalOpen(true)}
                className="gap-1.5 bg-brand hover:bg-brand-deep text-white text-body font-bold shadow-xs cursor-pointer px-4 hover:scale-[1.02] transition-transform"
              >
                <Share2 className="size-3.5" />
                <span>Share Link</span>
              </Button>
            )}

            <button
              type="button"
              onClick={toggleCopilotPanel}
              className={cn(
                "grid size-8 place-items-center rounded-chip border transition-colors cursor-pointer",
                copilotPanelOpen
                  ? "border-hair-2 bg-black/5 text-ink hover:bg-black/10"
                  : "border-hair-2 bg-card text-ink-3 hover:text-ink hover:border-brand shadow-2xs"
              )}
              title={copilotPanelOpen ? "Collapse sidebar (⌘\\)" : "Expand sidebar (⌘\\)"}
              aria-label="Toggle sidebar"
            >
              <PanelRight className="size-4" />
            </button>
          </div>
        </ScreenHeader>
      }
      rail={
        studioMode !== "generating" ? (
            <aside className="flex w-56 min-h-0 shrink-0 flex-col overflow-y-auto border-r border-hair bg-[#f8f9f7] sm:w-60">
              {/* Pages Strip Header */}
              <div className="p-3 border-b border-hair bg-card flex items-center justify-between">
                <span className="text-caption font-extrabold uppercase tracking-wider text-ink-3">
                  {isReview ? `Pages · ${pagesList.length}` : `Pages (${pagesList.length})`}
                </span>
                {!isReview && (
                  <button
                    type="button"
                    onClick={handleAddPage}
                    className="p-1 text-brand hover:bg-tint rounded-glyph cursor-pointer transition-colors"
                    title="Add Page"
                  >
                    <Plus className="size-4 stroke-[2.5]" />
                  </button>
                )}
              </div>

              {/* Page Thumbnails List */}
              <div className="p-3 space-y-3 border-b border-hair">
                {pagesList.map((pg) => {
                  const isActive = activePageId === pg.id;
                  return (
                    <button
                      key={pg.id}
                      type="button"
                      onClick={() => setInfographicActivePage(pg.id)}
                      className={cn(
                        "w-full flex flex-col gap-1.5 p-2.5 rounded-control border text-left transition cursor-pointer relative shadow-2xs",
                        isActive
                          ? "border-brand bg-tint/50 ring-2 ring-brand/15"
                          : "border-hair-2 bg-card hover:border-hair-3"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-label font-bold text-ink truncate">{pg.name}</span>
                        {isActive && <span className="size-2 rounded-full bg-brand" />}
                      </div>
                      <div
                        style={{ aspectRatio: `${pageGeometry.width} / ${pageGeometry.height}` }}
                        className="flex w-full flex-col justify-between overflow-hidden rounded-chip border border-hair-2 bg-card p-2 shadow-inner-xs"
                      >
                        <div className={cn("h-2 w-14 rounded-glyph", pg.id === 1 ? "bg-[#14233c]" : "bg-info-strong")} />
                        <div className="h-4 w-full bg-brand/20 rounded-glyph" />
                        <div className="h-6 w-full bg-black/5 rounded-glyph" />
                        <div className="h-2 w-full bg-black/10 rounded-glyph" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Graphic Layers Tree (In Editor Mode) */}
              {studioMode === "editor" && (
                <div className="p-3 flex-1">
                  <span className="text-caption font-extrabold uppercase tracking-wider text-ink-3 block mb-2">
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
                          "w-full flex items-center justify-between p-2 rounded-chip text-left text-label font-medium transition cursor-pointer",
                          selectedBlockId === layer.id
                            ? "bg-tint font-bold text-brand-deep shadow-2xs border border-brand/20"
                            : "hover:bg-black/5 text-ink"
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Layers className="size-3 text-ink-3 shrink-0" />
                          <span className="truncate">{layer.label}</span>
                        </div>
                        {!blockLanded(layer.id as (typeof BLOCK_ORDER)[number]) ? (
                          <span className="shrink-0 text-micro font-bold italic text-ink-4">laying out</span>
                        ) : (
                          selectedBlockId === layer.id && <span className="size-1.5 rounded-full bg-brand" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Art is its own list because it arrives on its own clock.
                      Folding it into the block list would suggest a block is
                      unfinished when only its art is still rendering. */}
                  <span className="mt-4 mb-2 block text-caption font-extrabold uppercase tracking-wider text-ink-3">
                    Art Layers
                  </span>
                  <div className="space-y-1">
                    {[...currentPage.art]
                      .sort((a, b) => b.z - a.z)
                      .map((layer) => {
                        const ready = genElapsed >= layer.readyAt;
                        const secondsLeft = Math.max(0, Math.ceil((layer.readyAt - genElapsed) / 1000));
                        return (
                          <button
                            key={layer.id}
                            type="button"
                            onClick={() => { setSelectedArtId(layer.id); clearElementSelection(); }}
                            className={cn(
                              "flex w-full cursor-pointer items-center justify-between gap-2 rounded-chip p-2 text-left text-label font-medium transition",
                              selectedArtId === layer.id
                                ? "border border-brand/20 bg-tint font-bold text-brand-deep shadow-2xs"
                                : "text-ink hover:bg-black/5"
                            )}
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              {layer.kind === "graph" ? (
                                <BarChart3 className="size-3 shrink-0 text-ink-3" />
                              ) : layer.kind === "background" ? (
                                <Layers className="size-3 shrink-0 text-ink-3" />
                              ) : (
                                <ImageIcon className="size-3 shrink-0 text-ink-3" />
                              )}
                              <span className="truncate">{layer.label}</span>
                            </div>
                            {ready ? (
                              <span className="shrink-0 text-micro font-bold tabular-nums text-ink-4">z{layer.z}</span>
                            ) : (
                              <span className="shrink-0 text-micro font-bold tabular-nums text-brand">{secondsLeft}s</span>
                            )}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Review Info (In Review Mode) */}
              {studioMode === "review" && (
                <div className="p-3.5 space-y-3 flex-1 text-label">
                  <div className="rounded-control border border-ok-line bg-ok-bg/70 p-2.5 text-ok space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-label">
                      <ShieldCheck className="size-3.5 text-ok" />
                      <span>MLR Clearance Grounded</span>
                    </div>
                    <p className="text-caption text-ok leading-snug">
                      Passed label verification against FDA §1.1, §2.1 and §5.2.
                    </p>
                  </div>
                </div>
              )}
            </aside>
        ) : undefined
      }
      main={
        studioMode === "generating" ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-subtle animate-in fade-in duration-300">
              <div className="size-20 rounded-card bg-tint border border-tint-line flex items-center justify-center mb-6 shadow-sm">
                <LogoMark size={40} className="text-brand animate-pulse" />
              </div>
              <h3 className="text-display font-extrabold text-ink tracking-tight">
                Generating High-Resolution Creative &amp; Proofs...
              </h3>
              <p className="text-body-lg text-ink-3 mt-1.5 max-w-[440px]">
                Synthesizing publication-grade vectors, clinical PASI 90 stat heroes, and PromoMats-verified claim links.
              </p>

              <div className="mt-8 w-full max-w-[360px] space-y-2.5 text-left text-body">
                <div className={cn("flex items-center gap-3 p-3 rounded-control border transition", generationStep >= 1 ? "bg-card border-hair-2 text-ink shadow-2xs" : "opacity-40")}>
                  <Check className={cn("size-4.5 shrink-0", generationStep >= 1 ? "text-ok" : "text-black/30")} strokeWidth={2.5} />
                  <span className="font-semibold">Validated 214 FDA dossier claims</span>
                </div>
                <div className={cn("flex items-center gap-3 p-3 rounded-control border transition", generationStep >= 2 ? "bg-card border-hair-2 text-ink shadow-2xs" : "opacity-40")}>
                  <Check className={cn("size-4.5 shrink-0", generationStep >= 2 ? "text-ok" : "text-black/30")} strokeWidth={2.5} />
                  <span className="font-semibold">Synthesized high-res vectors &amp; layout</span>
                </div>
                <div className={cn("flex items-center gap-3 p-3 rounded-control border transition", generationStep >= 3 ? "bg-card border-hair-2 text-ink shadow-2xs" : "opacity-40")}>
                  <Check className={cn("size-4.5 shrink-0", generationStep >= 3 ? "text-ok" : "text-black/30")} strokeWidth={2.5} />
                  <span className="font-semibold">Grounded ISI fair balance tables &amp; leave-behind</span>
                </div>
              </div>
            </div>
        ) : (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            {/* What is still arriving, and what you can already do. The page
                below is editable throughout — the strip is a status line, not
                a gate. */}
            {studioMode === "editor" && genElapsed < ART_LAST && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-tint-line bg-tint px-3 py-1.5 sm:px-4">
                <span className="inline-flex shrink-0 items-center gap-1.5 text-label font-bold text-brand-deep">
                  <LogoMark size={12} className="animate-spin text-brand" />
                  {layoutDone ? "Rendering art" : "Composing layout"}
                </span>

                <span className="text-label text-ink-2">
                  {layoutDone
                    ? `${currentPage.art.filter((a) => genElapsed >= a.readyAt).length} of ${currentPage.art.length} layers placed`
                    : `${blocksLanded} of ${BLOCK_ORDER.length} blocks`}
                </span>

                <div className="h-1.5 min-w-[90px] flex-1 overflow-hidden rounded-full bg-card/70">
                  <div
                    style={{ width: `${Math.min(100, (genElapsed / ART_LAST) * 100)}%` }}
                    className="h-full rounded-full bg-brand transition-[width] duration-200"
                  />
                </div>

                <span className="shrink-0 text-label font-semibold text-ink-3">
                  Keep editing — the boxes are already final
                </span>
              </div>
            )}

            {/* One bar, two control sets: what is selected decides which. A
                toolbar that only knows about type says "select any text" at an
                image and leaves you nothing to press. */}
            {studioMode === "editor" && selectedArt ? (
              <ArtRibbon
                label={selectedArt.label}
                kind={selectedArt.kind}
                z={selectedArt.z}
                ready={genElapsed >= selectedArt.readyAt}
                onSendBack={() => nudgeArtOrder(selectedArt.id, -1)}
                onBringForward={() => nudgeArtOrder(selectedArt.id, 1)}
                onRegenerate={() => regenerateArt(selectedArt.id)}
                onReplace={() => artUploadRef.current?.click()}
                onAddToChat={() => addArtToChat(selectedArt.id)}
              />
            ) : studioMode === "editor" ? (
              <FormatRibbon
                element={selectedElement}
                style={selectedElementId ? elementStyles[selectedElementId] : undefined}
                blockLabel={selectedElement ? BLOCK_LABELS[selectedElement.blockId] ?? "" : ""}
                onStyle={patchElementStyle}
                onReset={resetElementStyle}
              />
            ) : null}

            <input
              ref={artUploadRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file || !selectedArt) return;
                updateCurrentPage((prev) => ({
                  ...prev,
                  art: prev.art.map((a) =>
                    a.id === selectedArt.id ? { ...a, label: file.name, readyAt: 0 } : a
                  ),
                }));
                showToast(`${file.name} placed in the ${selectedArt.label} slot`);
                e.target.value = "";
              }}
            />
            {/* Retyping a grounded run does not make it false — it makes it
                unverified. Saying which runs, and offering the re-check, is
                the whole difference between a warning and a dead end. */}
            {studioMode === "editor" && reverifyElements.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 border-b border-warn-line bg-warn-bg px-3 py-1.5 sm:px-4">
                <AlertTriangle className="size-3.5 shrink-0 text-warn" />
                <span className="text-label font-bold text-warn">
                  {reverifyElements.length} edited {reverifyElements.length === 1 ? "claim needs" : "claims need"} re-verification
                </span>
                <span className="truncate text-label text-ink-3">
                  {reverifyElements.map((id) => textElements[id]?.label ?? id).join(", ")}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setReverifyElements([]);
                    showToast("Edited claims re-checked against the dossier");
                  }}
                  className="focus-ring ml-auto shrink-0 cursor-pointer rounded-chip bg-warn px-2.5 py-1 text-label font-bold text-white transition hover:brightness-110"
                >
                  Re-verify now
                </button>
              </div>
            )}
          <main
            ref={canvasAreaRef}
            onPointerDown={(e) => {
              // Only the mat itself deselects. Without the target check, any
              // click that bubbles out of the page would clear the selection
              // the moment you used a control inside it.
              if (e.target === e.currentTarget) clearElementSelection();
            }}
            className="flex flex-1 items-start justify-center overflow-auto bg-[#e5e8e4] p-4 sm:p-6 lg:p-8"
          >
            {/* The page is drawn at its true size for the chosen shape and
                then scaled to the room available, so a 16:9 page is a wide
                short page rather than a tall column with its bottom clipped.
                The zoom control multiplies that fit rather than replacing it. */}
            {/* A sizer at the SCALED dimensions, with the page transformed
                inside it. A transform does not change the layout box, so
                without this the mat reserved the page's full unscaled width
                and scrolled sideways past the edge of the screen. */}
            <div
              style={{
                width: pageGeometry.width * pageScale,
                height: pageGeometry.height * pageScale,
              }}
              className="relative shrink-0"
            >
              <div
                style={{
                  width: pageGeometry.width,
                  height: pageGeometry.height,
                  transform: `scale(${pageScale})`,
                  transformOrigin: "top left",
                }}
                className="absolute left-0 top-0 flex select-none flex-col overflow-hidden rounded-card border border-hair-2 bg-card text-left shadow-2xl transition-transform duration-150"
              >
                {/* The one true overlay: it sits behind everything rather than
                    taking space from anything. */}
                <PageBackgroundArt layer={artFor("page")} elapsed={genElapsed} />

                <div
                  ref={compositionRef}
                  style={{
                    transform: compositionFit < 1 ? `scale(${compositionFit})` : undefined,
                    transformOrigin: "top center",
                  }}
                  className="relative z-[1] flex min-h-0 flex-1 flex-col"
                >

                {/* 1. Header Band */}
                <div
                  onClick={() => studioMode === "editor" && handleSelectBlock("header")}
                  className={cn(
                    "relative z-[1] p-6 pb-5 bg-gradient-to-r from-[#0c1524] via-[#14233c] to-[#1e3458] text-white transition group",
                    studioMode === "editor" && "cursor-pointer",
                    selectedBlockId === "header" && studioMode === "editor"
                      ? "ring-3 ring-inset ring-brand shadow-inner"
                      : "hover:brightness-105"
                  )}
                >
                  {!blockLanded("header") && (
                    <span aria-hidden className="shimmer absolute inset-0 z-[2] rounded-[inherit] bg-[#0e1a16]/[0.06]" />
                  )}
                  <div className="flex items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        {run("header.badge", "rounded-chip bg-white/15 px-2.5 py-0.5 text-micro font-extrabold uppercase tracking-wider text-white border border-white/20")}
                        {run("header.approvalTag", "text-caption font-mono text-white/70")}
                      </div>
                      {run("header.title", "text-display-lg font-[850] text-white tracking-tight leading-tight", "h1")}
                      {run("header.subtitle", "text-body text-white/80 font-medium mt-1 block", "p")}
                    </div>

                    {/* Reserved before the render exists, which is why the
                        headline never has to move when it arrives. */}
                    {artFor("header") && (
                      <ArtSlot
                        layer={artFor("header")!}
                        elapsed={genElapsed}
                        selected={selectedArtId === artFor("header")!.id}
                        onSelect={(id) => { setSelectedArtId(id); clearElementSelection(); }}
                        interactive={studioMode === "editor"}
                        className="h-[74px] w-[108px] shrink-0"
                      />
                    )}
                  </div>
                </div>

                {/* Infographic Body Blocks */}
                <div
                  className={cn(
                    "relative z-[1] min-h-0 flex-1 gap-3 p-5",
                    pageGeometry.columns === 2
                      ? "grid grid-cols-2 content-start"
                      : "flex flex-col"
                  )}
                >
                  {/* 2. Stat Hero */}
                  <div
                    onClick={() => studioMode === "editor" && handleSelectBlock("heroStat")}
                    className={cn(
                      "p-4 rounded-panel bg-[#fff7f4] border border-tint-line shadow-2xs transition relative group",
                      studioMode === "editor" && "cursor-pointer",
                      selectedBlockId === "heroStat" && studioMode === "editor"
                        ? "ring-2 ring-brand/15 shadow-sm bg-card"
                        : "hover:border-brand"
                    )}
                  >
                  {/* The layout pass is what settles this block's place. Until
                      it lands the frame is already correct underneath — the
                      sheet only covers copy that has not arrived. */}
                  {!blockLanded("heroStat") && (
                    <span aria-hidden className="shimmer absolute inset-0 z-[2] rounded-[inherit] bg-[#0e1a16]/[0.06]" />
                  )}
                    <div className="flex items-center justify-between mb-1">
                      {run("heroStat.category", "text-caption font-extrabold uppercase tracking-wider text-brand-deep")}
                      <span className="inline-flex items-center gap-1 rounded-glyph bg-ok-bg text-ok px-1.5 py-0.2 text-micro font-bold">
                        <Check className="size-2.5 stroke-[3]" />
                        {currentPage.heroStat.citation}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2.5">
                      {run("heroStat.metric", "text-hero font-[900] leading-tight tracking-tight text-brand", "div")}
                      {run("heroStat.comparison", "text-body-lg font-bold text-ink-2")}
                    </div>
                    {run("heroStat.detail", "text-body text-ink-2 font-medium mt-0.5 leading-relaxed block", "p")}
                  </div>

                  {/* 3. MoA Pathway */}
                  <div
                    onClick={() => studioMode === "editor" && handleSelectBlock("moa")}
                    className={cn(
                      "p-4 rounded-panel bg-subtle border border-hair shadow-2xs transition relative group",
                      studioMode === "editor" && "cursor-pointer",
                      selectedBlockId === "moa" && studioMode === "editor"
                        ? "ring-2 ring-brand/15 shadow-sm bg-card"
                        : "hover:border-hair-3"
                    )}
                  >
                  {/* The layout pass is what settles this block's place. Until
                      it lands the frame is already correct underneath — the
                      sheet only covers copy that has not arrived. */}
                  {!blockLanded("moa") && (
                    <span aria-hidden className="shimmer absolute inset-0 z-[2] rounded-[inherit] bg-[#0e1a16]/[0.06]" />
                  )}
                    {run("moa.title", "text-caption font-extrabold uppercase tracking-wider text-ink-3 block mb-1")}
                    {run("moa.detail", "text-body text-ink-2 leading-relaxed mb-2.5 block", "p")}

                    {artFor("moa") && (
                      <ArtSlot
                        layer={artFor("moa")!}
                        elapsed={genElapsed}
                        selected={selectedArtId === artFor("moa")!.id}
                        onSelect={(id) => { setSelectedArtId(id); clearElementSelection(); }}
                        interactive={studioMode === "editor"}
                        className="mb-2.5 h-[96px] w-full"
                      />
                    )}

                    <div className="grid grid-cols-3 gap-2">
                      {currentPage.moa.steps.map((step, idx) => (
                        <div
                          key={idx}
                          className="rounded-control border border-hair bg-card p-1.5 text-center shadow-2xs"
                        >
                          <span className="block text-label font-extrabold leading-tight text-ink">{step}</span>
                          <span className="block text-micro text-ink-3">Cellular Target</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Chart / Comparison Section */}
                  <div
                    onClick={() => studioMode === "editor" && handleSelectBlock("chart")}
                    className={cn(
                      "p-4 rounded-panel bg-card border border-hair shadow-2xs transition relative group",
                      studioMode === "editor" && "cursor-pointer",
                      selectedBlockId === "chart" && studioMode === "editor"
                        ? "ring-2 ring-brand/15 shadow-sm"
                        : "hover:border-hair-3"
                    )}
                  >
                  {/* The layout pass is what settles this block's place. Until
                      it lands the frame is already correct underneath — the
                      sheet only covers copy that has not arrived. */}
                  {!blockLanded("chart") && (
                    <span aria-hidden className="shimmer absolute inset-0 z-[2] rounded-[inherit] bg-[#0e1a16]/[0.06]" />
                  )}
                    <div className="mb-2.5 flex items-center justify-between gap-2">
                      <span className="truncate text-body font-bold text-ink">{currentPage.chart.title}</span>
                      <span className="shrink-0 text-caption font-mono text-ink-3">
                        {currentPage.chart.cohort}
                      </span>
                    </div>

                    {/* The rendered figure sits above the bars rather than
                        replacing them: the bars are the numbers, the render is
                        the picture, and a reviewer wants both. */}
                    {artFor("chart") && (
                      <ArtSlot
                        layer={artFor("chart")!}
                        elapsed={genElapsed}
                        selected={selectedArtId === artFor("chart")!.id}
                        onSelect={(id) => { setSelectedArtId(id); clearElementSelection(); }}
                        interactive={studioMode === "editor"}
                        className="mb-2.5 h-[96px] w-full"
                      />
                    )}

                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-label font-bold mb-1">
                          <span>{currentPage.chart.arm1Label}</span>
                          <span className="text-brand">{currentPage.chart.arm1Val}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-black/5 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${currentPage.chart.arm1Val}%` }}
                            className="h-full bg-brand rounded-full transition-all duration-300"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-label font-semibold text-ink-3 mb-1">
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
                      "p-3.5 rounded-panel bg-[#fafafa] border border-hair mt-auto transition relative group",
                      studioMode === "editor" && "cursor-pointer",
                      selectedBlockId === "isi" && studioMode === "editor"
                        ? "ring-2 ring-brand/15 shadow-sm bg-card"
                        : "hover:border-hair-3"
                    )}
                  >
                  {/* The layout pass is what settles this block's place. Until
                      it lands the frame is already correct underneath — the
                      sheet only covers copy that has not arrived. */}
                  {!blockLanded("isi") && (
                    <span aria-hidden className="shimmer absolute inset-0 z-[2] rounded-[inherit] bg-[#0e1a16]/[0.06]" />
                  )}
                    <div className="mb-1 flex items-baseline text-micro font-bold text-ink-3">
                      {run("isi.title", "text-micro font-bold text-ink-3")}
                      <span>:</span>
                    </div>
                    {run("isi.content", "text-caption text-ink-3 leading-normal block", "p")}
                  </div>
                </div>
                </div>
              </div>
            </div>
          </main>
          </div>
        )
      }
      panel={
        studioMode !== "generating" ? (
          <>
            {/* Top Tabs Switcher */}
            <div className="p-3 border-b border-hair bg-canvas shrink-0">
              <div className="flex rounded-control bg-[#edeef0] p-1 text-body font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab("assistant")}
                  className={cn(
                    "flex-1 py-1.5 rounded-chip text-center transition cursor-pointer flex items-center justify-center gap-1.5",
                    activeTab === "assistant"
                      ? "bg-card text-ink shadow-2xs"
                      : "text-ink-3 hover:text-ink"
                  )}
                >
                  <span className="size-1.5 rounded-full bg-ok" />
                  <span>Chat</span>
                </button>

                {studioMode === "editor" && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("edit")}
                    className={cn(
                      "flex-1 py-1.5 rounded-chip text-center transition cursor-pointer",
                      activeTab === "edit"
                        ? "bg-card text-ink shadow-2xs"
                        : "text-ink-3 hover:text-ink"
                    )}
                  >
                    Edit
                  </button>
                )}

                  {studioMode === "review" && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("comments")}
                    className={cn(
                      "flex-1 py-1.5 rounded-chip text-center transition cursor-pointer flex items-center justify-center gap-1",
                      activeTab === "comments"
                        ? "bg-card text-ink shadow-2xs"
                        : "text-ink-3 hover:text-ink"
                    )}
                  >
                    <span>Comments</span>
                    <span className="size-4 rounded-full bg-tint text-brand-deep text-caption font-black grid place-items-center">
                      {commentStats(comments).open}
                    </span>
                  </button>
                  )}

                <button
                  type="button"
                  onClick={() => setActiveTab("evidence")}
                  className={cn(
                    "flex-1 py-1.5 rounded-chip text-center transition cursor-pointer flex items-center justify-center gap-1",
                    activeTab === "evidence"
                      ? "bg-card text-ink shadow-2xs"
                      : "text-ink-3 hover:text-ink"
                  )}
                >
                  <span>Claims</span>
                  <span className="text-caption text-ink-3 font-normal">24</span>
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
                        <div className="size-7 rounded-full bg-brand text-white grid place-items-center font-bold text-caption shrink-0 mt-0.5 shadow-2xs">
                          SX
                        </div>
                      )}
                      <div
                        className={cn(
                          "rounded-panel p-3 text-body leading-relaxed max-w-[85%]",
                          msg.role === "user"
                            ? "bg-brand text-white rounded-tr-xs"
                            : "bg-subtle text-ink border border-hair rounded-tl-xs"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>

                <div className="p-3 border-t border-hair bg-card shrink-0 space-y-2">
                  {/* Attached Primary Action Bar in Creative Editor Mode */}
                  {studioMode === "editor" && (
                    <div className="rounded-panel border border-brand/20 bg-gradient-to-r from-tint via-white to-tint p-2 shadow-2xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="size-6 rounded-full bg-brand/15 text-brand grid place-items-center shrink-0">
                          <ImageIcon className="size-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-label font-bold text-ink truncate">
                            Ready for production
                          </div>
                          <div className="text-micro text-ink-3 truncate">
                            {pagesList.length} {pagesList.length === 1 ? "page" : "pages"} customized
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={() => setConfirmGenerateModalOpen(true)}
                        size="sm"
                        className="h-7.5 px-3 rounded-chip text-label font-bold shadow-xs transition-all shrink-0 cursor-pointer bg-brand hover:bg-brand-deep text-white hover:scale-[1.02] gap-1"
                      >
                        <LogoMark size={12} className="mr-0.5 fill-current" />
                        <span>Generate and Publish</span>
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center gap-2 rounded-control border border-hair-2 bg-subtle px-3 py-2 focus-within:border-brand focus-within:bg-card focus-within:shadow-xs transition">
                    <Plus className="size-3.5 text-ink-3 shrink-0" />
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendMessage();
                      }}
                      placeholder="Ask SwishX to rephrase, highlight endpoints..."
                      className="flex-1 bg-transparent text-body outline-none text-ink placeholder:text-ink-3"
                    />
                    <button
                      type="button"
                      onClick={() => handleSendMessage()}
                      disabled={!chatInput.trim()}
                      className="grid size-6 place-items-center rounded-chip bg-brand text-white disabled:opacity-30 hover:bg-brand-deep transition cursor-pointer disabled:cursor-not-allowed shrink-0"
                    >
                      <Send className="size-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: THE SELECTED ELEMENT (In Editor Mode) ── */}
            {/*
              * Read-only, like the video editor's.
              *
              * This tab stopped being a form. The page's copy is shown so you
              * can see what is there, and changing it goes through the chat —
              * one route to a change rather than a form and a conversation
              * that can disagree about which won. What stays editable is
              * placement and stacking, because those are settings rather than
              * claims.
              */}
            {activeTab === "edit" && studioMode === "editor" && (
              <div className="flex-1 space-y-3.5 overflow-y-auto p-4">
                <div className="flex items-center justify-between border-b border-hair pb-2.5">
                  <div className="min-w-0">
                    <div className="text-micro font-extrabold uppercase tracking-[0.12em] text-ink-3">
                      Page inspector
                    </div>
                    <h3 className="mt-0.5 truncate text-subhead font-[850] text-ink">
                      {selectedArt
                        ? selectedArt.label
                        : selectedElement
                          ? `${BLOCK_LABELS[selectedElement.blockId] ?? ""} · ${selectedElement.label}`
                          : BLOCK_LABELS[selectedBlockId] ?? "Page"}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("assistant")}
                    className="shrink-0 cursor-pointer text-label font-bold text-brand hover:underline"
                  >
                    Close
                  </button>
                </div>

                {selectedArt ? (
                  <div className="space-y-2.5">
                    <div className="rounded-control border border-hair-2 bg-canvas p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-label font-bold text-ink-2">
                          {selectedArt.kind === "graph" ? "Chart layer" : selectedArt.kind === "background" ? "Background layer" : "Image layer"}
                        </span>
                        <span className="text-caption text-ink-4">
                          z{selectedArt.z} · {genElapsed >= selectedArt.readyAt ? "rendered" : "rendering"}
                        </span>
                      </div>
                      <p className="mt-1 text-body font-medium leading-relaxed text-ink">{selectedArt.label}</p>
                      <div className="mt-2 flex justify-end border-t border-hair pt-2">
                        <button
                          type="button"
                          onClick={() => addArtToChat(selectedArt.id)}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-glyph px-2 py-1 text-caption font-bold text-brand transition-colors hover:bg-tint"
                        >
                          <MessageSquare className="size-3" />
                          <span>Add to chat</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-label leading-snug text-ink-3">
                      Where it sits and how big it is come from the slot the layout reserved — the art fills
                      the box, it does not choose one.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {Object.values(textElements)
                      .filter((el) => el.blockId === selectedBlockId)
                      .map((el) => (
                        <div key={el.id}>
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <span className="text-label font-bold text-ink-2">{el.label}</span>
                            {el.citation && (
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-glyph bg-ok-bg px-1.5 py-0.5 text-micro font-bold text-ok">
                                <ShieldCheck className="size-2.5" />
                                Grounded
                              </span>
                            )}
                          </div>
                          <div
                            className={cn(
                              "rounded-control border bg-canvas p-2.5 transition",
                              selectedElementId === el.id ? "border-brand ring-2 ring-brand/15" : "border-hair-2"
                            )}
                          >
                            <p className="text-body font-medium leading-relaxed text-ink">{runValue(el.id)}</p>
                            <div className="mt-2 flex items-center justify-between gap-2 border-t border-hair pt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const node = document.querySelector(`[data-canvas-text="${el.id}"]`);
                                  if (node) handleSelectElement(el.id, node.getBoundingClientRect());
                                }}
                                className="cursor-pointer text-caption font-bold text-ink-3 transition-colors hover:text-ink"
                              >
                                Select on page
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedElementId(el.id);
                                  setActiveTab("assistant");
                                  setChatInput(`Rewrite the ${el.label.toLowerCase()} ("${runValue(el.id)}") `);
                                  showToast(`${el.label} attached to chat`);
                                }}
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-glyph px-2 py-1 text-caption font-bold text-brand transition-colors hover:bg-tint"
                              >
                                <MessageSquare className="size-3" />
                                <span>Add to chat</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}


            {/* ── TAB 2: REVIEWER COMMENTS (In Review Mode) ── */}
            {/* The video studio's reviewer panel, unchanged: review gates
                first, then the stats, then Open and Closed groups where a
                closed comment carries the reason it was closed. A reviewer on
                a share link sees only this, so "Resolved" alone is not an
                answer to them. */}
            {activeTab === "comments" && studioMode === "review" && (
              <ReviewComments
                comments={comments}
                stampLabel={`Page ${activePageId}`}
                medicalReviewDone={mlrCheckResolved}
                regulatoryReviewDone={qaCheckResolved}
                onPost={(text) => {
                  setComments((prev) => [
                    {
                      id: `c-${Date.now()}`,
                      ...pageAnchor(activePageId),
                      elementId: "page",
                      elementLabel: ELEMENT_LABELS.page,
                      author: "Sarah Lin (Medical Director)",
                      role: "Medical Reviewer",
                      avatar: "SL",
                      text,
                      at: "Just now",
                      source: "team",
                      status: "open",
                      sentToChat: false,
                    },
                    ...prev,
                  ]);
                  showToast("Review comment posted");
                }}
              />
            )}

            {/* ── TAB 3: CLAIMS & EVIDENCE LIBRARY ── */}
            {activeTab === "evidence" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-hair pb-2.5">
                  <div>
                    <div className="text-micro font-extrabold uppercase tracking-[0.12em] text-ink-3">
                      Compliance Grounding
                    </div>
                    <h2 className="mt-0.5 text-body-lg font-[800] text-ink">24 Approved Claims</h2>
                  </div>
                  <span className="rounded-chip bg-ok-bg text-ok border border-ok-line px-2.5 py-0.5 text-micro font-bold">
                    ✓ PromoMats Verified
                  </span>
                </div>

                <div className="space-y-2.5">
                  {CLAIMS_LIST.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-control border border-hair bg-canvas p-3 text-left hover:border-brand/20 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-micro font-bold text-brand-deep bg-tint px-2 py-0.5 rounded-glyph">
                          {c.tag}
                        </span>
                        <span className="text-caption font-bold text-ok">✓ Approved</span>
                      </div>
                      <p className="text-label text-ink-2 leading-relaxed mt-1">{c.desc}</p>
                      <div className="text-caption text-ink-3 mt-1.5 pt-1 border-t border-hair flex items-center justify-between">
                        <span>Source: {c.source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : undefined
      }
      overlay={
        <>
        {/* ── SHARE & DISTRIBUTE MODAL ── */}
        <ShareReviewModal
          open={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          assetType="infographic"
          assetTitle={`${brandName} HCP Infographic`}
          brandName={brandName}
          onExportDirect={() => {
            setExportModalOpen(true);
          }}
          onShowToast={(msg) => showToast(msg)}
        />

        {/* ── EXPORT MODAL ── */}
        {exportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-[460px] rounded-panel bg-card p-6 shadow-2xl border border-hair-2 text-left space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-8 rounded-full bg-tint text-brand grid place-items-center font-bold">
                    <Download className="size-4" />
                  </span>
                  <h3 className="text-subhead font-black text-ink">Export High-Res Package</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setExportModalOpen(false)}
                  className="size-7 rounded-full hover:bg-black/5 grid place-items-center text-ink-3"
                >
                  <X className="size-4" />
                </button>
              </div>
              <p className="text-body text-ink-3">
                Select desired export format for {brandName} HCP Leave-Behind ({pagesList.length} pages):
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    showToast("Generated CMYK Print-Ready PDF with 3mm Bleed");
                    setExportModalOpen(false);
                  }}
                  className="w-full p-3 rounded-control border border-hair-2 hover:border-brand hover:bg-tint/30 text-left flex items-center justify-between cursor-pointer transition"
                >
                  <div>
                    <div className="font-bold text-body-lg text-ink">Print-Ready PDF (CMYK · 300 DPI)</div>
                    <div className="text-label text-ink-3">Includes crop marks and 3mm bleed for commercial print</div>
                  </div>
                  <Download className="size-4 text-brand" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast("Downloaded Digital RGB Tablet PDF");
                    setExportModalOpen(false);
                  }}
                  className="w-full p-3 rounded-control border border-hair-2 hover:border-brand hover:bg-tint/30 text-left flex items-center justify-between cursor-pointer transition"
                >
                  <div>
                    <div className="font-bold text-body-lg text-ink">Digital Screen PDF (RGB · 150 DPI)</div>
                    <div className="text-label text-ink-3">Optimized for iPad detailing &amp; Veeva CLM presentation</div>
                  </div>
                  <Download className="size-4 text-brand" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── CONFIRM CREATIVE GENERATION MODAL (Matching Exact Form & Rate Spec with Quality & MLR Layer) ── */}
        {confirmGenerateModalOpen && (
          <div
            className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="Confirm Creative Generation"
          >
            <div className="rise-in flex max-h-[86vh] w-full max-w-[560px] flex-col overflow-hidden rounded-card border border-white/50 bg-card text-left shadow-float">
              <div className="flex items-center justify-between border-b border-hair px-6 py-4.5 bg-canvas">
                <div>
                  <div className="flex items-center gap-1.5 text-caption font-extrabold uppercase tracking-[0.14em] text-brand">
                    <LogoMark size={14} /> Generation Engine
                  </div>
                  <h2 className="mt-0.5 text-display font-[850] tracking-tight text-ink">
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

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5">
                {/* Cost & Spec Card */}
                <GenerationCostCard
                  used={creditsUsed}
                  usedLabel="Page generation and edits"
                  renderCost={finalRenderCost}
                  budget={creditBudget}
                  qualityLabel={"Vector 300 DPI"}
                  facts={[
                    { label: "Format", value: `${pagesList.length} ${pagesList.length === 1 ? "Page" : "Pages"} · ${pageGeometry.label}` },
                    { label: "Render", value: "~30–45 sec" },
                    { label: "Balance after", value: `${(teamBalance - creditsTotal).toLocaleString()} of ${teamBalance.toLocaleString()}`, tone: "ok" as const },
                  ]}
                />

                {/* Automated Quality & MLR Pre-Flight Verification */}
                <PreflightPanel
                  onFixAll={handleAutoFixBoth}
                  checks={[
                    mlrCheckResolved
                      ? {
                          id: "mlr",
                          source: "MLR",
                          title: "24 verified claims cited",
                          detail: "EMBRACE-3 §2.4 grounded (p < 0.001)",
                        }
                      : {
                          id: "mlr",
                          source: "MLR",
                          severity: "blocker" as const,
                          title: "Unverified comparative claim",
                          detail: "Hero card compares efficacy without citing the comparator placebo cohort.",
                          onFix: handleFixMlrBlocker,
                        },
                    qaCheckResolved
                      ? {
                          id: "qa",
                          source: "Quality",
                          title: "Editorial and spelling clear",
                          detail: "Nomenclature and syntax verified",
                        }
                      : {
                          id: "qa",
                          source: "Quality",
                          severity: "warning" as const,
                          title: "Subtitle phrasing redundancy",
                          detail: "Tagline contains redundant descriptors and unstandardised dosing syntax.",
                          onFix: handleFixQaBlocker,
                        },
                    { id: "isi", source: "MLR", title: "Fair balance and ISI present", detail: "eGFR ≥25 and box warnings verified" },
                    { id: "vector", source: "Quality", title: "Vector layout and contrast", detail: "300 DPI CMYK ready hierarchy" },
                    { id: "terms", source: "Quality", title: "Medical terminology clear", detail: "Generic name and dosing accurate" },
                    { id: "refs", source: "MLR", title: "Reference list complete", detail: "All citations resolve to approved sources" },
                  ]}
                />

                {/* Informational Notice */}
                <p className="text-body text-ink-3 leading-relaxed">
                  Generation renders in the background using publication vector models. You will receive an email notification when processing completes, and can continue working in SwishX.
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-hair">
                  {hasBlockers ? (
                    <span className="text-label text-danger font-semibold flex items-center gap-1">
                      <AlertTriangle className="size-3 shrink-0" />
                      Fix {blockerCount} {blockerCount === 1 ? "blocker" : "blockers"} to enable generation
                    </span>
                  ) : (
                    <span className="text-label text-ok font-bold flex items-center gap-1">
                      <CheckCircle2 className="size-3.5 text-ok shrink-0" />
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
                          : "bg-brand hover:bg-brand-deep text-white cursor-pointer shadow-xs"
                      )}
                    >
                      <LogoMark size={14} />
                      <span>Confirm &amp; Generate Creative</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── WHAT YOU CAN DO TO THE SELECTED ELEMENT ──
            The same bar the video canvas puts under a selected element, and
            the same two things: hand it to the agent, or leave a note on it.
            Formatting is the ribbon's job, and the words go through the chat —
            so there is nothing else for this bar to offer. */}
        {/* Not while a dialog is open: the bar belongs to the canvas, and
            the canvas is behind the dialog — painting it over one is the
            element bar arguing with the thing that took over the screen. */}
        {studioMode === "editor" && commentComposerAt && selectedElement && !anyModalOpen && (
          <ElementActionBar
            at={commentComposerAt}
            elementLabel={selectedElement.label}
            onAddToChat={() => {
              addElementToChat();
              setCommentComposerAt(null);
            }}
            onComment={addElementComment}
            onDismiss={() => setCommentComposerAt(null)}
          />
        )}

        {/* ── COMMENTS ── */}
        {/* The same modal the video editor opens, on the same records. Two
            different presentations of one conversation was the whole problem:
            a reviewer and an author were looking at the same comment through
            differently-shaped windows. */}
        {commentsModalOpen && (
          <CommentsModal
            comments={comments}
            teamUnlocked={studioMode === "review" || comments.some((c) => c.source === "team")}
            onResolve={(id, reason) => closeComment(id, "resolved", reason)}
            onReject={(id, reason) => closeComment(id, "rejected", reason)}
            onSendToChat={sendCommentToAgent}
            onJump={(comment) => {
              jumpToComment(comment);
              setCommentsModalOpen(false);
            }}
            onClose={() => setCommentsModalOpen(false)}
          />
        )}

        {/* ── TOAST NOTIFICATION ── */}
        {toastMessage && (
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-control bg-ink text-white px-4 py-2 text-body font-bold shadow-2xl border border-white/15 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <CheckCircle2 className="size-4 text-ok-on-dark" />
            <span>{toastMessage}</span>
          </div>
        )}
        </>
      }
    />
  );
}
