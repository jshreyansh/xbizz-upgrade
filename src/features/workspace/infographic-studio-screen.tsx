"use client";

import { ProjectMenu, ProjectTitle } from "@/features/workspace/project-title";
import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BarChart3,
  Check,
  Download,
  Image as ImageIcon,
  Layers,
  LayoutTemplate,
  MessageSquare,
  PanelRight,
  Pencil,
  FilePlus2,
  FileText,
  FolderOpen,
  Package,
  Plus,
  Sparkles,
  RotateCcw,
  Share2,
  ShieldCheck,
  Type,
  ZoomIn,
  ZoomOut,
  X,
  MessageCircle,
  MessageSquareQuote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatComposer, ComposerAttachButton } from "@/components/patterns/chat-composer";
import { ComposerTray } from "@/components/patterns/composer-tray";
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
  EditableCanvasText,
  EMPTY_STYLE,
  type CanvasTextElement,
  type TextStyle,
} from "@/features/workspace/canvas-text-toolbar";
import { SwishXMark } from "@/components/ui/swishx-mark";
import { useBrandName } from "@/features/workspace/brand-catalogue";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { ShareReviewModal } from "@/features/workspace/share-review-modal";
import { cn } from "@/lib/cn";
import { ClaimsPanel } from "@/features/workspace/claims-panel";
import { ChatAttachmentRow, useChatAttachments } from "@/features/workspace/chat-attachments";
import { FormattedMessageText, ChatChips } from "@/features/workspace/chat-message";
import {
  listSuggestions,
  useSuggestionQueue,
} from "@/features/workspace/suggestion-queue";
import { InspectorTabButton, INSPECTOR_TAB_STRIP } from "@/features/workspace/inspector-tabs";
import { VersionChip, buildVersions } from "@/features/workspace/version-trail";
import { stamp, VersionHistoryButton } from "@/features/workspace/version-history";
import { ScreenHeader } from "@/components/patterns/screen-header";
import {
  EditorToolbar,
  artOptions,
  blockOptions,
  blockStyleCss,
  blockStyleOptions,
  chartExtras,
  pageOptions,
  EMPTY_BLOCK_STYLE,
  type BlockStyle,
  insertOption,
  textOptions,
  type InsertMenuId,
  type ToolbarSelection,
} from "@/features/workspace/editor-toolbar";
import { useProjectExit } from "@/features/workspace/project-exit";
import { SaveOrDiscardDialog } from "@/components/patterns/save-or-discard-dialog";
import { LogoMark } from "@/components/ui/logo-mark";
import { WorkbenchLayout } from "@/components/patterns/workbench-layout";
import { PreviewPublishModal } from "@/features/workspace/preview-publish-modal";
import { DocPagePreview } from "@/features/workspace/doc-page-preview";
import { useMlrReview } from "@/features/workspace/mlr-review";
import { GenerationProgress, type GenerationStep } from "@/features/workspace/generation-progress";
import { TemplateSwitchModal } from "@/features/workspace/template-switch-modal";
import { ReviewStatusBanner, useAssetReview } from "@/features/review/asset-review";
import type { TemplateArchetype } from "@/features/workspace/template-archetypes";
import { ArtSlot, PageBackgroundArt } from "@/features/workspace/page-art-layers";
import { CurrentTag, RequestModal } from "@/components/patterns/request-modal";
import { ImageCropModal } from "@/features/workspace/image-crop-modal";
import {
  IconPickerModal,
  MediaPickerModal,
  QrCodeModal,
  brandImageItems,
  workspaceMediaItems,
} from "@/features/workspace/insert-pickers";
import { useProductLibraryStore } from "@/features/product-library/product-library-store";
import {
  FREE_ITEM_PRESETS,
  FreeTextItem,
  beginDrag,
  kindForOption,
  offsetStyle,
  type FreeItem,
  type FreeItemKind,
  type Offset,
} from "@/features/workspace/canvas-free-items";

import { Portal } from "@/components/ui/portal";
import { Toast, useToast } from "@/components/patterns/toast";

/* Layout → Canvas Editor, reported per page and per block. */
function canvasOpenSteps(pageCount: number, blockCount: number): GenerationStep[] {
  const perPage: GenerationStep[] = [];
  for (let p = 1; p <= pageCount; p += 1) {
    for (let b = 1; b <= blockCount; b += 1) {
      perPage.push({ label: `Page ${p}, composed block ${b} of ${blockCount}`, seconds: 0.3 });
    }
  }
  return [
    { label: "Applied the chosen layout", seconds: 0.5 },
    { label: "Resolved page shape and print margins", seconds: 0.4 },
    { label: "Fitted the approved copy to the composition", seconds: 0.55 },
    ...perPage,
    { label: "Reserved space for charts and figures", seconds: 0.45 },
    { label: "Placed the brand mark & fair balance band", seconds: 0.45 },
    { label: "Queued art layers for background render", seconds: 0.5 },
  ];
}

/* Canvas Editor → Share & Review, reported per page and per art layer. */
function proofRenderSteps(pageCount: number, artCount: number): GenerationStep[] {
  const perArt: GenerationStep[] = [];
  for (let i = 1; i <= artCount; i += 1) {
    perArt.push({ label: `Rendered art layer ${i} at 300 DPI`, seconds: 0.34 });
  }
  const perPage: GenerationStep[] = [];
  for (let p = 1; p <= pageCount; p += 1) {
    perPage.push({ label: `Page ${p}, flattened vectors & type`, seconds: 0.36 });
    perPage.push({ label: `Page ${p}, proofed colour for print`, seconds: 0.3 });
  }
  return [
    { label: "Validated 214 approved dossier claims", seconds: 0.55 },
    { label: "Checked every figure against its source", seconds: 0.5 },
    ...perArt,
    { label: "Synthesized publication-grade vectors", seconds: 0.6 },
    ...perPage,
    { label: "Grounded the ISI fair balance table", seconds: 0.5 },
    { label: "Embedded fonts & citation footnotes", seconds: 0.45 },
    { label: "Wrote the print-ready master", seconds: 0.7 },
  ];
}

export type CreativeStudioMode = "opening" | "editor" | "generating" | "review";

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
  /** Read aloud by screen readers and kept in the export. */
  alt?: string;
  /** An uploaded image, cropped to the slot, in place of the generated art. */
  imageUrl?: string;
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

/** Each card's own colour in the template, for the Fill swatch. */
const TEMPLATE_FILLS: Record<string, string> = {
  header: "linear-gradient(90deg, #0c1524, #14233c, #1e3458)",
  heroStat: "#fff7f4",
  moa: "var(--color-subtle)",
  chart: "var(--color-card)",
  isi: "#fafafa",
};

/** How an Insert request is labelled in the chat. */
const INSERT_MENU_LABEL: Record<InsertMenuId, string> = {
  text: "Text",
  image: "Image",
  layout: "Layout",
  chart: "Chart",
  diagram: "Diagram",
};

/** The hidden file input behind the toolbar's Replace. */
const ART_UPLOAD_ID = "studio-art-upload";

/** The blocks between the header and the safety band, which can be reordered or removed. */
type BodyBlockId = "heroStat" | "moa" | "chart";
const DEFAULT_BODY: BodyBlockId[] = ["heroStat", "moa", "chart"];

interface InfographicPageData {
  id: number;
  name: string;
  subtitle: string;
  /** Art layers, back to front. */
  art: PageArtLayer[];
  /** The body blocks in reading order; a deleted one is left out. */
  bodyOrder?: BodyBlockId[];
  /** Text added from Insert › Text, placed anywhere on the page. */
  freeItems?: FreeItem[];
  /** Where blocks, art and runs have been dragged to, from their place in the layout. */
  offsets?: Record<string, Offset>;
  /** Each block's own fill, border, corners and shadow, over the template's. */
  blockStyles?: Record<string, BlockStyle>;
  /** The page's own background, and whether its generated background art shows. */
  pageStyle?: { fill: string | null; art: boolean };
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

/** The most pages a document can be planned at — the plan screen's ceiling too. */
const MAX_PAGES = 12;

/** Page n, after the first: the evidence layout, numbered and named for its place. */
function evidencePage(n: number): InfographicPageData {
  return n === 2
    ? DEFAULT_PAGE_2
    : { ...DEFAULT_PAGE_2, id: n, name: `Page ${n}: Clinical Evidence & Tolerability` };
}

export function InfographicStudioScreen() {
  const router = useRouter();
  const exit = useProjectExit();
  const {
    brief,
    audience,
    topics,
    pageShape,
    infographicPages,
    infographicTemplate,
    setInfographicTemplate,
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

  /* From the catalogue, not from two hard-coded ids and a "Velmora" default. */
  const brandName = useBrandName(sourcePayload?.dossierId);

  /** What the author has asked for and the agent has not done yet. */
  const suggestionQueue = useSuggestionQueue(addChatMessage);
  /** Elements added to the chat — chips in the composer's tray until sent. */
  const [chatContexts, setChatContexts] = useState<Array<{ id: string; label: string; detail: string }>>([]);
  const attachToChat = (ctx: { id: string; label: string; detail: string }) =>
    setChatContexts((prev) => [...prev.filter((c) => c.id !== ctx.id), ctx]);

  // Studio Mode: Editor -> Generating -> Shared Review View
  /* Arriving from the Content Library means the asset is already published:
     it opens on its shared review rather than composing a canvas again. */
  const openedForReview = useWorkspaceStore.getState().studioEntry === "review";
  /* Back into a document whose MLR review is still running: the editor, with
     Preview and Publish open and frozen. */
  const openedForMlr = useWorkspaceStore.getState().studioEntry === "mlr-review";
  // As in the video studio: a published asset opens under its own title.
  const storedProjectName = useWorkspaceStore((s) => s.projectName);
  const creativeTitle = storedProjectName.trim() || `${brandName} HCP Infographic`;
  /* The review funnel for this document: the creator's chain, and its item once submitted. */
  const assetReview = useAssetReview(`document:${creativeTitle}`);

  const [studioMode, setStudioMode] = useState<CreativeStudioMode>(
    openedForReview ? "review" : openedForMlr ? "editor" : "opening"
  );

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
  /* A restored document was fully drawn before its review started. */
  const [genElapsed, setGenElapsed] = useState(openedForMlr ? ART_LAST : 0);

  useEffect(() => {
    if (studioMode === "opening") return;
    genStartRef.current = Date.now() - (openedForMlr ? ART_LAST : 0);
    const tick = setInterval(() => {
      const elapsed = Date.now() - genStartRef.current;
      setGenElapsed(elapsed);
      if (elapsed >= ART_LAST) clearInterval(tick);
    }, 200);
    return () => clearInterval(tick);
    // Starts once, when the canvas first opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studioMode === "opening"]);

  /* Blocks arrive in reading order, all of them inside the layout pass. */
  const BLOCK_ORDER = ["header", "heroStat", "moa", "chart", "isi"] as const;
  const blocksLanded = Math.min(
    BLOCK_ORDER.length,
    Math.floor(genElapsed / (LAYOUT_BY / BLOCK_ORDER.length))
  );
  const blockLanded = (id: (typeof BLOCK_ORDER)[number]) => BLOCK_ORDER.indexOf(id) < blocksLanded;
  const layoutDone = blocksLanded >= BLOCK_ORDER.length;
  const [selectedArtId, setSelectedArtId] = useState<string | null>(null);

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
  /* Whether the block itself is selected, rather than a run or art inside it.
     With none of the three, nothing is selected and the toolbar offers
     Insert only. */
  const [blockFocused, setBlockFocused] = useState(false);
  /* The page itself, selected by clicking its empty space. */
  const [pageFocused, setPageFocused] = useState(false);
  /** The added text being typed into, if any. */
  const [editingFreeId, setEditingFreeId] = useState<string | null>(null);
  /* SwishX's answer to an Insert request, waiting for the request to be sent,
     keyed by the chat chip it travels with. */
  const [insertReplies, setInsertReplies] = useState<Record<string, string>>({});
  /* Image options that pick something first, in a pop-up, before the chat. */
  const [imagePicker, setImagePicker] = useState<"brand" | "media" | "icon" | "qr" | "generate" | null>(null);
  const libraryProducts = useProductLibraryStore((s) => s.products);
  /* The two requests that open a pop-up before they go to the chat. */
  const [regenArtId, setRegenArtId] = useState<string | null>(null);
  const [addPageOpen, setAddPageOpen] = useState(false);
  /* Templates: the picker, then the redraw on the canvas while the new one is applied. */
  const [templatesOpen, setTemplatesOpen] = useState(false);
  /* When this session, and so this version, began. */
  const [sessionStart] = useState(() =>
    new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  );
  const [applyingTemplate, setApplyingTemplate] = useState<{ template: TemplateArchetype; steps: GenerationStep[] } | null>(null);
  /* An uploaded replacement, being fitted to its slot before it is placed. */
  const [cropping, setCropping] = useState<{
    src: string;
    fileName: string;
    mime: string;
    layerId: string;
    layerLabel: string;
    aspect: number;
  } | null>(null);

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

  const [confirmGenerateModalOpen, setConfirmGenerateModalOpen] = useState(openedForMlr);
  /** The page as drawn, mirrored read-only by Preview and Publish. */
  const pageCanvasRef = useRef<HTMLDivElement>(null);
  const { message: toastMessage, open: toastOpen, tone: toastTone, showToast } = useToast();

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
  /* Still accumulated — the toasts quote what each render spends — but no
     longer read back: the dialog shows the budget, not a running total. */
  const [, setCreditsUsed] = useState(() => pagesListInitialCost);
  const activePageId = infographicActivePage || 1;

  /* As many pages as the plan asked for, one to twelve. The first is the
     summary; every page after it starts from the evidence layout. */
  useEffect(() => {
    const planned = Math.min(MAX_PAGES, Math.max(1, Number(infographicPages) || 1));
    if (planned > pagesList.length) {
      setPagesList((prev) => [
        ...prev,
        ...Array.from({ length: planned - prev.length }, (_, i) => evidencePage(prev.length + i + 1)),
      ]);
    }
  }, [infographicPages, pagesList.length]);

  const currentPage = useMemo(() => {
    return pagesList.find((p) => p.id === activePageId) || pagesList[0] || DEFAULT_PAGE_1;
  }, [pagesList, activePageId]);
  const bodyOrder = currentPage.bodyOrder ?? DEFAULT_BODY;

  /* ── Undo and redo ──────────────────────────────────────────────────────
     Snapshots of what the toolbar changes: formatting, art and block order.
     Wording is not here; it changes through the chat. */
  type Snapshot = { pages: InfographicPageData[]; styles: Record<string, TextStyle> };
  const [undoStack, setUndoStack] = useState<Snapshot[]>([]);
  const [redoStack, setRedoStack] = useState<Snapshot[]>([]);
  const record = () => {
    setUndoStack((stack) => [...stack.slice(-49), { pages: pagesList, styles: elementStyles }]);
    setRedoStack([]);
  };
  const undo = () => {
    const prev = undoStack[undoStack.length - 1];
    if (!prev) return;
    setUndoStack((stack) => stack.slice(0, -1));
    setRedoStack((stack) => [...stack, { pages: pagesList, styles: elementStyles }]);
    setPagesList(prev.pages);
    setElementStyles(prev.styles);
  };
  const redo = () => {
    const next = redoStack[redoStack.length - 1];
    if (!next) return;
    setRedoStack((stack) => stack.slice(0, -1));
    setUndoStack((stack) => [...stack, { pages: pagesList, styles: elementStyles }]);
    setPagesList(next.pages);
    setElementStyles(next.styles);
  };
  /* ⌘Z and ⇧⌘Z, except while typing. Re-bound each render so it always
     undoes the current state rather than the one it was bound with. */
  useEffect(() => {
    if (studioMode !== "editor") return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "z") return;
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const isReview = studioMode === "review";
  /* How many versions have shipped, not merely whether any have — a boolean
     cannot tell version 1 from version 3. Opened from the library, one exists. */
  const [publishedCount, setPublishedCount] = useState(openedForReview ? 1 : 0);
  const draftVersion = publishedCount + 1;
  const canvasOpenStepList = useMemo(
    () => canvasOpenSteps(pagesList.length, BLOCK_ORDER.length),
    [pagesList.length]
  );
  const proofRenderStepList = useMemo(
    () => proofRenderSteps(pagesList.length, currentPage.art.length),
    [pagesList.length, currentPage.art.length]
  );

  // Reviewer Comments State
  /* The same records the video studio uses. Anchored to (surface, page,
     element), so a note about the hero metric is a note about the hero metric
     and the list can say where it lives. */
  /* The trail, from what this project has actually settled. */
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
      closedInVersion: draftVersion,
      closedReason: "No change needed. The cut-off already sits in the fair balance block.",
      sentToChat: false,
    },
  ]);

  const assetVersions = useMemo(
    () => buildVersions(comments, publishedCount, isReview),
    [comments, publishedCount, isReview]
  );
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  /** Where the in-place composer is anchored — a note about a run is written
   *  next to the run, the same as on the video canvas. */
  const [commentComposerAt, setCommentComposerAt] = useState<{ x: number; y: number } | null>(null);

  // Add Page Handler
  const handleAddPage = () => {
    if (pagesList.length >= MAX_PAGES) {
      showToast(`A document runs to ${MAX_PAGES} pages at most`);
      return;
    }
    const newPageNum = pagesList.length + 1;
    const newPage = evidencePage(newPageNum);
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
    setBlockFocused(true);
    setPageFocused(false);
    // Runs and art stop their own clicks, so this was a click on the block itself.
    setSelectedElementId(null);
    setCommentComposerAt(null);
    setSelectedArtId(null);
  };

  // Update current page field
  /** The art reserved for one block, or nothing if this page has none there. */
  const artFor = (slot: PageArtLayer["slot"]) => currentPage.art.find((a) => a.slot === slot);
  const selectedArt = selectedArtId ? currentPage.art.find((a) => a.id === selectedArtId) ?? null : null;
  const anyModalOpen = confirmGenerateModalOpen || commentsModalOpen || shareModalOpen || exportModalOpen;

  /* Stacking order is the one spatial property art has here — where it sits
     and how big it is come from the slot the layout reserved for it. */
  const nudgeArtOrder = (id: string, delta: number) => {
    record();
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
    attachToChat({ id: `art-${layer.id}`, label: `Page ${activePageId} · ${layer.label}`, detail: layer.kind === "graph" ? "Chart layer" : layer.kind === "background" ? "Background layer" : "Image layer" });
    setChatInput((prev) => (prev.trim() ? prev : `Change the ${layer.label.toLowerCase()} so that `));
    showToast(`${layer.label} added to the chat`);
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
      /* Added text formats like any other run; it has no claim behind it. */
      ...Object.fromEntries(
        (currentPage.freeItems ?? []).map((item) => {
          const preset = FREE_ITEM_PRESETS[item.kind];
          return [
            `free.${item.id}`,
            { id: `free.${item.id}`, blockId: "free", label: preset.label, baseSize: preset.size, baseWeight: preset.weight, multiline: true },
          ];
        })
      ),
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
    free: "Added text",
  };

  const handleSelectElement = (id: string, rect: DOMRect | { top: number; left: number; width: number; height: number }) => {
    setPageFocused(false);
    setSelectedElementId(id);
    const el = textElements[id];
    if (el) setSelectedBlockId(el.blockId as never);
    // The action bar opens with the selection, the same as on the video canvas.
    setSelectedArtId(null);
    setCommentComposerAt({ x: rect.left + rect.width / 2, y: rect.top + rect.height });
  };

  /**
   * The run moved (zoom, scroll, resize) — follow it, but only if the bar is
   * still open. Re-anchoring a closed bar is how "dismiss" stopped working.
   * Returning the previous object when nothing moved also stops the observer
   * and the render from feeding each other.
   */
  const repositionComposer = (rect: DOMRect) => {
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height;
    setCommentComposerAt((prev) => (prev && (prev.x !== x || prev.y !== y) ? { x, y } : prev));
  };

  const clearElementSelection = () => {
    setSelectedElementId(null);
    setCommentComposerAt(null);
  };

  /* A click on the mat: nothing selected, and the toolbar folds back to Insert. */
  const clearSelection = () => {
    clearElementSelection();
    setSelectedArtId(null);
    setBlockFocused(false);
    setPageFocused(false);
  };

  /* A click on the page's own empty space selects the page. */
  const selectPage = () => {
    clearElementSelection();
    setSelectedArtId(null);
    setBlockFocused(false);
    setPageFocused(true);
  };

  /* ── A block's look, and the page's ─────────────────────────────────── */
  const blockCss = (id: string): React.CSSProperties => ({
    ...blockStyleCss(currentPage.blockStyles?.[id]),
    ...offsetStyle(currentPage.offsets?.[`block:${id}`]),
  });
  const patchBlockStyle = (id: string, patch: Partial<BlockStyle>) => {
    record();
    updateCurrentPage((prev) => ({
      ...prev,
      blockStyles: { ...prev.blockStyles, [id]: { ...EMPTY_BLOCK_STYLE, ...prev.blockStyles?.[id], ...patch } },
    }));
  };
  const pageStyle = currentPage.pageStyle ?? { fill: null, art: true };
  const patchPageStyle = (patch: Partial<{ fill: string | null; art: boolean }>) => {
    record();
    updateCurrentPage((prev) => ({ ...prev, pageStyle: { ...(prev.pageStyle ?? { fill: null, art: true }), ...patch } }));
  };

  /* ── Moving things ──────────────────────────────────────────────────────
     Anything on the page can be dragged. What the layout placed keeps its
     place in the flow and is moved from there; added text sits wherever it
     is put. Each move is one step of undo. */
  const offsetOf = (key: string) => currentPage.offsets?.[key];
  const startMove = (key: string, pick?: () => void) => (e: React.PointerEvent<HTMLElement>) => {
    if (studioMode !== "editor") return;
    beginDrag(e, {
      /* Inside the composition, which can itself be scaled to fit the page. */
      scale: pageScale * compositionFit,
      from: offsetOf(key) ?? { x: 0, y: 0 },
      mode: "translate",
      onStart: () => {
        record();
        pick?.();
      },
      onEnd: (to) => updateCurrentPage((prev) => ({ ...prev, offsets: { ...prev.offsets, [key]: to } })),
    });
  };

  const selectFree = (id: string) => {
    setPageFocused(false);
    setSelectedElementId(`free.${id}`);
    /* The Edit panel lists the selected block's text; added text is its own group. */
    setSelectedBlockId("free" as never);
    setSelectedArtId(null);
    setBlockFocused(false);
    setCommentComposerAt(null);
  };

  /* Added in the middle of the page, ready to type into. The next one goes
     just under the last, so a second insert is never hidden under the first;
     at the foot of the page it starts again from the middle. */
  const addFreeItem = (kind: FreeItemKind) => {
    const preset = FREE_ITEM_PRESETS[kind];
    const middle = Math.round(pageGeometry.height / 2 - 40);
    const lowest = Math.max(
      0,
      ...(currentPage.freeItems ?? []).map((f) => {
        const node = document.querySelector<HTMLElement>(`[data-free-item="${f.id}"]`);
        return f.y + (node?.offsetHeight ?? 40);
      })
    );
    const below = lowest + 16;
    const y = lowest === 0 || below + 60 > pageGeometry.height ? middle : below;
    const item: FreeItem = {
      /* Counted up from every page's added text, so an id is never reused. */
      id: `t${1 + Math.max(0, ...pagesList.flatMap((pg) => (pg.freeItems ?? []).map((f) => Number(f.id.slice(1)) || 0)))}`,
      kind,
      text: preset.text,
      w: Math.min(preset.w, pageGeometry.width - 48),
      x: Math.round((pageGeometry.width - Math.min(preset.w, pageGeometry.width - 48)) / 2),
      y,
    };
    record();
    updateCurrentPage((prev) => ({ ...prev, freeItems: [...(prev.freeItems ?? []), item] }));
    selectFree(item.id);
    setEditingFreeId(item.id);
    showToast(`${preset.label} added. Type to replace the text, drag to move it`);
  };

  const commitFreeText = (id: string, text: string) => {
    setEditingFreeId(null);
    const item = currentPage.freeItems?.find((f) => f.id === id);
    if (!item || item.text === text) return;
    if (!text.trim()) {
      deleteFreeItem(id);
      return;
    }
    record();
    updateCurrentPage((prev) => ({ ...prev, freeItems: prev.freeItems?.map((f) => (f.id === id ? { ...f, text } : f)) }));
  };

  const deleteFreeItem = (id: string) => {
    const item = currentPage.freeItems?.find((f) => f.id === id);
    if (!item) return;
    record();
    updateCurrentPage((prev) => ({ ...prev, freeItems: prev.freeItems?.filter((f) => f.id !== id) }));
    setSelectedElementId(null);
    setEditingFreeId(null);
    showToast(`${FREE_ITEM_PRESETS[item.kind].label} removed. Undo brings it back`);
  };

  /* Delete or Backspace removes selected added text, unless it is being typed into. */
  useEffect(() => {
    if (studioMode !== "editor") return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedElementId?.startsWith("free.") && !editingFreeId) {
        e.preventDefault();
        deleteFreeItem(selectedElementId.slice(5));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const deleteArt = (id: string) => {
    const layer = currentPage.art.find((a) => a.id === id);
    if (!layer) return;
    record();
    updateCurrentPage((prev) => ({ ...prev, art: prev.art.filter((a) => a.id !== id) }));
    setSelectedArtId(null);
    showToast(`${layer.label} removed. Undo brings it back`);
  };

  const setArtAlt = (id: string, alt: string) => {
    record();
    updateCurrentPage((prev) => ({ ...prev, art: prev.art.map((a) => (a.id === id ? { ...a, alt } : a)) }));
    showToast(alt ? "Alt text saved" : "Alt text cleared");
  };

  const moveBlock = (id: BodyBlockId, by: -1 | 1) => {
    const from = bodyOrder.indexOf(id);
    const to = from + by;
    if (from < 0 || to < 0 || to >= bodyOrder.length) return;
    record();
    const next = [...bodyOrder];
    [next[from], next[to]] = [next[to], next[from]];
    updateCurrentPage((prev) => ({ ...prev, bodyOrder: next }));
  };

  const deleteBlock = (id: BodyBlockId) => {
    record();
    updateCurrentPage((prev) => ({ ...prev, bodyOrder: (prev.bodyOrder ?? DEFAULT_BODY).filter((b) => b !== id) }));
    setBlockFocused(false);
    showToast(`${BLOCK_LABELS[id]} removed. Undo brings it back`);
  };

  const patchElementStyle = (patch: Partial<TextStyle>) => {
    if (!selectedElementId) return;
    record();
    setElementStyles((prev) => ({
      ...prev,
      [selectedElementId]: { ...EMPTY_STYLE, ...prev[selectedElementId], ...patch },
    }));
  };


  /* One text run on the page. The value is read from the page by the run's own
     id rather than passed in, so a run cannot be wired to the wrong field —
     the id is the single place the binding is stated. */
  const runValue = (id: string): string => {
    if (id.startsWith("free.")) return currentPage.freeItems?.find((f) => `free.${f.id}` === id)?.text ?? "";
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
      onReposition={repositionComposer}
      offset={currentPage.offsets?.[`run:${id}`]}
      onMovePointerDown={
        studioMode === "editor"
          ? startMove(`run:${id}`, () => {
              const node = document.querySelector(`[data-canvas-text="${id}"]`);
              if (node) handleSelectElement(id, node.getBoundingClientRect());
            })
          : undefined
      }
    />
  );

  // Chat message handler connected directly to Workspace Store
  const chatFiles = useChatAttachments();
  const [chatInput, setChatInput] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, activeTab, studioMode]);

  const [mlrCheckResolved, setMlrCheckResolved] = useState(false);
  const [qaCheckResolved, setQaCheckResolved] = useState(false);

  /* Publishing is the finished document, so it waits for the last art. */
  const docFullyRendered = genElapsed >= ART_LAST;
  /* Edits since the last MLR review: every instruction sent to the agent. */
  const editCount = chatMessages.filter((m) => m.role === "user" && !m.seeded).length;
  const mlrReview = useMlrReview(`document:${creativeTitle}`, editCount);

  const handleSendMessage = (directText?: string) => {
    /* Suggestions in the tray go with whatever was typed, as one message —
       the composer's send is the only send. */
    if (!directText && suggestionQueue.draftCount > 0 && chatFiles.files.length === 0) {
      sendSuggestions(chatInput.trim());
      return;
    }
    const attached = directText ? [] : chatFiles.take();
    const text = directText || chatInput.trim();
    if (!text && attached.length === 0) return;

    const context = directText ? [] : chatContexts.map((c) => `[Context: ${c.label} - ${c.detail}]`);
    /* An Insert request has its own answer, worked out when it was picked. */
    const insertReply = directText ? undefined : chatContexts.map((c) => insertReplies[c.id]).find(Boolean);
    addChatMessage({
      role: "user",
      text: [...context, text, ...attached.map((f) => `\u{1F4CE} ${f.name}`)].filter(Boolean).join("\n"),
    });
    if (!directText) {
      setChatInput("");
      setChatContexts([]);
    }

    /* In the editor there is no source list to file a document into, so the
       question is what the file is FOR rather than where it goes. */
    if (attached.length > 0) {
      setTimeout(() => {
        addChatMessage({
          role: "swishx",
          text:
            attached.length === 1
              ? `Got **${attached[0].name}**. Is it replacing something on the page, or reference for a change you want?`
              : `Got ${attached.length} files. Are they replacing artwork on the page, or reference for a change you want?`,
        });
      }, 600);
      if (!text) return;
    }

    if (insertReply) {
      setTimeout(() => addChatMessage({ role: "swishx", text: insertReply }), 700);
      return;
    }

    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = `Understood. I have adjusted the graphic layout grounded in the **${brandName}** dossier.`;

      const suggestionAnswer = suggestionIntent(text);

      if (suggestionAnswer === "more") {
        /* Holding. The point of asking was to apply a batch once rather than
           re-edit the page after every note. */
        const open = suggestionQueue.queue.filter((sg) => sg.status !== "done");
        addChatMessage({
          role: "swishx",
          text: `Holding ${open.length > 1 ? `all ${open.length}` : "it"}. Keep marking up the page and send the next lot when you're ready, I'll run them together.`,
        });
        return;
      }

      if (suggestionAnswer === "all" || suggestionAnswer === "one") {
        const open = suggestionQueue.scopeBatch(suggestionAnswer);
        addChatMessage({
          role: "swishx",
          text: open.length
            ? `Scoped ${open.length > 1 ? `all ${open.length}` : "it"} ${suggestionAnswer === "all" ? `to all ${pagesList.length} ${pagesList.length === 1 ? "page" : "pages"}` : "to the page each was left on"}. Nothing is changed yet, tell me to run ${open.length > 1 ? "them" : "it"}.`
            : "Nothing queued to scope.",
        });
        return;
      }

      if (suggestionAnswer === "run") {
        runSuggestionQueue();
        return;
      }

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

  // Generate Creative & Open Shared Review. The wait owns its own clock and
  // calls handleProofsRendered when it runs out.
  const handlePublishCreative = () => {
    setStudioMode("generating");
  };

  const handleProofsRendered = () => {
    setPublishedCount((n) => n + 1);
    setStudioMode("review");
    setActiveTab("comments");
    if (!copilotPanelOpen) toggleCopilotPanel();
    /* Into the creator's approval chain; with no chain it publishes as before. */
    const flags = mlrCheckResolved ? 0 : 1;
    const item = assetReview.submit({
      key: `document:${creativeTitle}`,
      title: creativeTitle,
      kind: "document",
      brand: brandName,
      spec: `${pageGeometry.label} · ${pagesList.length} ${pagesList.length === 1 ? "page" : "pages"}`,
      version: `Version ${draftVersion}`,
      ownerId: assetReview.me,
      preview: {
        gradient: "linear-gradient(150deg,#111827,#1f2937 55%,#334155)",
        badge: "HCP Clinical Brief",
        metric: "52% PASI 90",
        metricLabel: "vs 18% placebo at week 16",
      },
      stages: assetReview.stages,
      check: {
        flags,
        summary: flags ? "One comparative claim was flagged by SwishX before submission." : "Every claim resolves to an approved source.",
      },
    });
    showToast(item.status === "in_review" ? `Submitted for review · ${item.stages[item.stageIndex]?.name} is next` : "Creative published · Opened Shared Review View");
  };

  /**
   * A comment on the selected run, composed in place.
   *
   * Anchored to (page, element) like every other comment, so the list can say
   * where it lives and take you to it. "Send to chat" is one gesture rather
   * than two because the commonest thing after writing a note about your own
   * work is asking for the change.
   */
  /**
   * A suggestion about your own draft goes to the agent, not into the comment
   * list. It is an instruction, and the thing that carries instructions here
   * is the chat. Comments are somebody else's words on a published link —
   * they have to be answered, which is why they are kept and counted; a note
   * you wrote about your own work needs neither.
   */
  /**
   * A teammate's comment, taken into the same list your own notes go into.
   *
   * It used to go straight to the agent as its own message, which made a
   * reviewer's point a separate conversation from the change you were already
   * drafting — and they are usually the same change. In the list it can be
   * sent with whatever you mark up next, and resolved in one pass.
   */
  const addCommentAsSuggestion = (id: string) => {
    const comment = comments.find((c) => c.id === id);
    if (!comment) return;
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, sentToChat: true } : c)));
    setActiveTab("assistant");
    const label = `${comment.containerLabel} · ${comment.elementLabel}`;
    suggestionQueue.add(label, comment.text);
    showToast(`Added to suggestions · ${label}`);
  };

  /**
   * A note goes to the list above the input, and nowhere else yet. Nothing is
   * said to the agent until you send the batch — marking up a page should not
   * cost a round of conversation per note.
   */
  const addSuggestion = (text: string) => {
    const label = selectedElement?.label ?? ELEMENT_LABELS.page;
    setCommentComposerAt(null);
    setActiveTab("assistant");
    suggestionQueue.add(label, text);
    /* The note lands above the chat input, which is not where you were
       looking — you were looking at the page. */
    showToast(`Added to suggestions · ${label}`);
  };

  /**
   * Handing the batch over: one message with every annotation in it, and the
   * strip empties because the list is in the chat now. The agent asks the one
   * thing it cannot infer once, for the batch, rather than after every note.
   */
  const sendSuggestions = (note = "") => {
    const batch = suggestionQueue.submit();
    if (batch.length === 0) return;
    setActiveTab("assistant");
    const context = chatContexts.map((c) => `[Context: ${c.label} - ${c.detail}]`);
    addChatMessage({
      role: "user",
      text: [...context, ...batch.map((sg) => `[${sg.elementLabel}] ${sg.text}`), note.trim()].filter(Boolean).join("\n"),
    });
    setChatInput("");
    setChatContexts([]);
    setTimeout(() => {
      addChatMessage({
        role: "swishx",
        text:
          batch.length === 1
            ? `Got it. One change to **${batch[0].elementLabel}**: ${batch[0].text}\n\nShould it hold across the other pages too, or just this one? Say the word and I'll run it.`
            : `Got ${batch.length}, here's what I'm holding:\n\n${listSuggestions(batch)}\n\nShould these hold across the other pages too, or just the ones they were left on? Say the word and I'll work through them.`,
      });
    }, 700);
  };

  /**
   * What a typed reply means.
   *
   * The options used to be buttons under the message, which made a
   * conversation look like a form — and answered in the agent's words rather
   * than yours. It reads the sentence instead. Scope is checked before the
   * verb, because "apply across all pages" is an answer to the scope
   * question, not an instruction to start.
   */
  const suggestionIntent = (input: string): "all" | "one" | "more" | "run" | null => {
    if (suggestionQueue.pendingCount === 0) return null;
    const t = input.toLowerCase();
    if (/\b(all|every|each|other)\b.*\bpages?\b|\bacross all\b|\beverywhere\b/.test(t)) return "all";
    if (/\b(just|only)\b.*\b(this|that|these|those|one|them|it)\b|\bthis (page|one) only\b/.test(t)) return "one";
    if (/\b(more|another|hold|wait|not yet)\b/.test(t)) return "more";
    if (/\b(run|resolve|apply|go ahead|do it|proceed|that's all|thats all|done adding)\b/.test(t)) return "run";
    return null;
  };

  const runSuggestionQueue = () =>
    suggestionQueue.resolveAll({
      start: (count, first) =>
        `Working through ${count === 1 ? "it" : `all ${count}`}. Starting with **${first.elementLabel}**.`,
      step: (item, left) =>
        `**${item.elementLabel}**, applied${item.scope === "all" ? " across every page" : ""}. ${left} left.`,
      /* The lead-in to the recap the queue appends under it. */
      finish: (count) =>
        `That's ${count === 1 ? "it" : `all ${count}`} applied. Every claim still resolves to an approved source. Here's what went in:`,
    });

  /* Closing a comment. A team comment cannot close without a note — the
     person who wrote it only ever sees the share link, so "Resolved" with
     nothing attached reads as being ignored. The gate lives in the card;
     this only records what came back. */
  const closeComment = (id: string, as: "resolved" | "rejected", note: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: as, closedBy: "user" as const, closedInVersion: draftVersion, closedReason: note || undefined }
          : c
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

  /* ── The toolbar's selection ─────────────────────────────────────────────
     Art first, then a run of text, then a block: the innermost thing clicked
     is what the options act on. */
  const pageLabel = `Page ${activePageId}`;
  /* Something handed to the chat: the panel opens on it, with a start to the sentence. */
  const handToChat = (ctx: { id: string; label: string; detail: string }, prompt: string) => {
    setCopilotPanelOpen(true);
    setActiveTab("assistant");
    attachToChat(ctx);
    setChatInput((prev) => (prev.trim() ? prev : prompt));
  };

  let toolbarSelection: ToolbarSelection | null = null;
  if (studioMode === "editor" && selectedArt) {
    const art = selectedArt;
    toolbarSelection = {
      id: `art-${art.id}`,
      icon: art.kind === "graph" ? BarChart3 : art.kind === "background" ? Layers : ImageIcon,
      name: art.label,
      items: artOptions({
        alt: art.alt ?? "",
        z: art.z,
        ready: genElapsed >= art.readyAt,
        onReplace: () => document.getElementById(ART_UPLOAD_ID)?.click(),
        onRegenerate: () => setRegenArtId(art.id),
        onBringForward: () => nudgeArtOrder(art.id, 1),
        onSendBack: () => nudgeArtOrder(art.id, -1),
        onAlt: (alt) => setArtAlt(art.id, alt),
        onDelete: () => deleteArt(art.id),
      }),
      onAddToChat: () => addArtToChat(art.id),
    };
  } else if (studioMode === "editor" && selectedElement) {
    const el = selectedElement;
    toolbarSelection = {
      id: `text-${el.id}`,
      icon: Type,
      name: el.label,
      path: `${BLOCK_LABELS[el.blockId] ?? ""} › ${el.label}`,
      items: textOptions({
        element: el,
        style: elementStyles[el.id],
        onStyle: patchElementStyle,
        ...(el.blockId === "free"
          ? {
              onEdit: () => setEditingFreeId(el.id.slice(5)),
              onDelete: () => deleteFreeItem(el.id.slice(5)),
            }
          : {}),
        onCite: el.blockId === "free" ? undefined : () => {
          setCopilotPanelOpen(true);
          setActiveTab("evidence");
          showToast(`Pick the claim the ${el.label.toLowerCase()} cites`);
        },
      }),
      onAddToChat: () => {
        handToChat(
          { id: `run-${el.id}`, label: `${pageLabel} · ${el.label}`, detail: `"${runValue(el.id)}"` },
          `Rewrite the ${el.label.toLowerCase()} `
        );
        showToast(`${el.label} added to the chat`);
      },
    };
  } else if (studioMode === "editor" && blockFocused) {
    const id = selectedBlockId;
    const label = BLOCK_LABELS[id];
    const body = id === "heroStat" || id === "moa" || id === "chart" ? id : null;
    const at = body ? bodyOrder.indexOf(body) : -1;
    toolbarSelection = {
      id: `block-${id}`,
      icon: id === "chart" ? BarChart3 : id === "isi" ? ShieldCheck : LayoutTemplate,
      name: label,
      items: blockOptions({
        locked: id === "isi" ? "Required on every page" : id === "header" ? "Always at the top" : undefined,
        canMoveUp: at > 0,
        canMoveDown: at >= 0 && at < bodyOrder.length - 1,
        onMoveUp: () => body && moveBlock(body, -1),
        onMoveDown: () => body && moveBlock(body, 1),
        onDelete: () => body && deleteBlock(body),
        extra: [
          ...blockStyleOptions({
            style: currentPage.blockStyles?.[id],
            templateFill: TEMPLATE_FILLS[id] ?? "var(--color-card)",
            onStyle: (patch) => patchBlockStyle(id, patch),
          }),
          ...(id === "chart"
            ? chartExtras({
                source: currentPage.chart.cohort,
                onEditData: () =>
                  handToChat(
                    { id: "block-chart", label: `${pageLabel} · ${currentPage.chart.title}`, detail: "Chart data" },
                    "Change the chart data so that "
                  ),
              })
            : []),
        ],
      }),
      onAddToChat: () => {
        handToChat(
          { id: `block-${id}`, label: `${pageLabel} · ${label}`, detail: "Block" },
          `Change the ${label.toLowerCase()} so that `
        );
        showToast(`${label} added to the chat`);
      },
    };
  }

  if (studioMode === "editor" && !toolbarSelection && pageFocused) {
    toolbarSelection = {
      id: `page-${activePageId}`,
      icon: FileText,
      name: currentPage.name,
      path: `${pageLabel} · the whole page`,
      items: pageOptions({
        fill: pageStyle.fill,
        art: pageStyle.art,
        hasArt: Boolean(artFor("page")),
        onFill: (fill) => patchPageStyle({ fill }),
        onArt: (art) => patchPageStyle({ art }),
        templateFill: "var(--color-card)",
        onTemplates: () => setTemplatesOpen(true),
      }),
      onAddToChat: () => {
        handToChat(
          { id: `page-${activePageId}`, label: `${pageLabel} · ${currentPage.name}`, detail: "The whole page" },
          `Change ${pageLabel.toLowerCase()} so that `
        );
        showToast(`${pageLabel} added to the chat`);
      },
    };
  }

  /* Insert hands the request to SwishX, which writes it from the approved
     claims; an approved claim is picked from the Claims tab directly. */
  const insertTarget = toolbarSelection?.name.toLowerCase();
  const insertWhere = insertTarget ? `below the ${insertTarget}` : "at the end of the page";

  /* An Insert request, into the chat: a chip saying what and where, the
     start of the sentence, SwishX's answer for when it is sent, and a toast. */
  const queueInsert = (req: { id: string; label: string; detail: string; prompt: string; reply: string; toast: string }) => {
    handToChat({ id: req.id, label: req.label, detail: req.detail }, req.prompt);
    setInsertReplies((prev) => ({ ...prev, [req.id]: req.reply }));
    showToast(`${req.toast} added to chat`);
    /* Straight into the sentence, at its end, so the next keystroke finishes it. */
    requestAnimationFrame(() => {
      const field = document.querySelector<HTMLTextAreaElement>("[data-chat-composer]");
      if (!field) return;
      field.focus();
      field.setSelectionRange(field.value.length, field.value.length);
    });
  };

  const IMAGE_PICKERS: Record<string, NonNullable<typeof imagePicker>> = {
    "Brand images library": "brand",
    "Workspace media library": "media",
    Icon: "icon",
    "QR code": "qr",
    "Generate image": "generate",
  };

  const handleInsert = (menu: InsertMenuId, option: string) => {
    const kind = menu === "text" ? kindForOption(option) : null;
    if (kind) {
      addFreeItem(kind);
      return;
    }
    if (menu === "image" && IMAGE_PICKERS[option]) {
      setImagePicker(IMAGE_PICKERS[option]);
      return;
    }
    const where = insertWhere;
    const thing = option.toLowerCase();
    /* "a big number", "an icon", but "references". */
    const a = thing.endsWith("s") ? "" : /^[aeiou]/.test(thing) ? "an " : "a ";
    const id = `insert-${menu}-${option}`;
    const label = `${INSERT_MENU_LABEL[menu]} · ${option}`;

    /* Charts, diagrams and layouts always go through the chat: SwishX draws
       them from the dossier, and the request says what to show. The prompt
       is left open for exactly that. */
    if (menu === "chart") {
      queueInsert({
        id,
        label,
        detail: `${pageLabel}, ${where} · data from the dossier`,
        prompt: `Add ${a}${thing} ${where} showing `,
        reply: `Drafting ${a}**${thing}** ${where} from the trial data in the dossier, with every value cited to its table. Tell me if the comparison should change.`,
        toast: option,
      });
    } else if (menu === "diagram") {
      queueInsert({
        id,
        label,
        detail: `${pageLabel}, ${where}`,
        prompt: `Add ${a}${thing} ${where} that explains `,
        reply: `Drafting ${a}**${thing}** ${where}, worded from the approved mechanism and the label so it stays MLR-safe. Tell me if a step is missing.`,
        toast: option,
      });
    } else if (menu === "layout") {
      const what = insertTarget ? `the ${insertTarget}` : "the page body";
      queueInsert({
        id,
        label,
        detail: `${insertOption(menu, option)?.explain ?? option} · ${pageLabel}, ${what}`,
        prompt: `Rearrange ${what} as ${thing}. Put `,
        reply: `Rearranging ${what} as **${thing}**. Every claim keeps its words and its citation; only where it sits changes.`,
        toast: option,
      });
    } else {
      const phrase = option === "Upload" ? "an image I upload" : `${a}${thing}`;
      queueInsert({
        id,
        label,
        detail: `${pageLabel}, ${where}`,
        prompt: `Add ${phrase} ${where}. It should show `,
        reply: `Adding ${phrase} ${where}, from the approved claims.`,
        toast: option,
      });
    }
  };

  /* The drug this document is for, as the Product Library has it. */
  const brandProduct = libraryProducts.find((p) => p.name.toLowerCase() === brandName.toLowerCase());

  /* The pages as Preview and Publish shows them; Version history shows a version the same way. */
  const docPreview = (
    <DocPagePreview
      sourceRef={pageCanvasRef}
      pageSize={{ width: pageGeometry.width, height: pageGeometry.height }}
      pages={pagesList.map((pg) => ({ id: pg.id, name: pg.name }))}
      activePage={activePageId}
      onSelectPage={setInfographicActivePage}
    />
  );

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
      toolbar={
        studioMode === "editor" && !applyingTemplate ? (
          <EditorToolbar
            selection={toolbarSelection}
            onInsert={handleInsert}
            history={{ onUndo: undo, onRedo: redo, canUndo: undoStack.length > 0, canRedo: redoStack.length > 0 }}
            onTemplates={() => setTemplatesOpen(true)}
          />
        ) : undefined
      }
      header={
        <ScreenHeader spread onClose={() => (studioMode === "review" ? exit.leave() : exit.requestExit())}>
          <div className="flex items-center gap-2 min-w-0">
            <SwishXMark compact />
            <div className="mx-2.5 h-5 w-px bg-hair" />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <ProjectTitle
                  kind="document"
                  fallback={`${brandName} HCP Infographic`}
                  published={studioMode === "review"}
                  className="text-body-lg font-[850] tracking-tight"
                />
              </div>
              <div className="mt-0.5 hidden text-micro text-ink-3 sm:block">
                Saved just now · {pagesList.length} {pagesList.length === 1 ? "page" : "pages"} ({pageGeometry.label})
              </div>
            </div>

            {/* Mode Switchers */}
            <div className="ml-4 hidden items-center gap-1.5 md:flex">

              {studioMode === "generating" && (
                <span className="inline-flex items-center gap-1.5 rounded-chip bg-tint border border-tint-line px-3 py-1 text-caption font-extrabold text-brand-deep animate-pulse">
                  <LogoMark size={12} className="text-brand-deep animate-spin" />
                  <span>Generating High-Res Creative...</span>
                </span>
              )}
              {studioMode === "review" && (
                <div className="flex items-center gap-1.5">
                  <span className="rounded-chip bg-ok-bg px-3 py-0.5 text-caption font-extrabold text-ok border border-ok-line">
                    Shared Review View · Final Asset
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Actions: Generate/Publish in Editor OR Export/Share in Review */}
          <div className="flex items-center gap-2">
            {/* Rename and sharing belong to the flow, not the published preview. */}
            {studioMode !== "review" && <ProjectMenu kind="document" fallback={`${brandName} HCP Infographic`} />}
            {/* The version, beside the action that makes the next one. */}
            {studioMode !== "editor" && studioMode !== "review" && <VersionChip versions={assetVersions} variant="button" />}
            {studioMode === "editor" && (
              <VersionHistoryButton
                publishedCount={publishedCount}
                sessionStart={sessionStart}
                editCount={undoStack.length}
                author="Maya Kapoor"
                preview={docPreview}
                onRestore={(v) => {
                  showToast(`Restored ${v.label}`);
                  setCopilotPanelOpen(true);
                  setActiveTab("assistant");
                  addChatMessage({
                    role: "swishx",
                    text: `Restored **${v.label}** (${stamp(v)}). The session you were in is kept in Version history, so you can go back to it.`,
                  });
                }}
              />
            )}
            {studioMode === "editor" && (
              <Button
                size="sm"
                onClick={() => setConfirmGenerateModalOpen(true)}
                disabled={!docFullyRendered}
                title={docFullyRendered ? undefined : "Art is still being drawn"}
                className="gap-1.5 bg-brand hover:bg-brand-deep text-white text-body font-bold shadow-xs cursor-pointer px-4.5 transition-transform enabled:hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <LogoMark size={14} />
                <span>Preview and Publish</span>
              </Button>
            )}

            {/* No comments control here. Comments are a tab in the inspector,
                the same as the video editor — a header counter beside it was
                the same list offered twice, and from version 2 on both were
                on screen at once. */}

            {/* The published versions, where the editors keep Version history. */}
            {studioMode === "review" && <VersionChip versions={assetVersions} variant="button" />}
            {/* A published asset opens here from the library; Edit starts the next draft. */}
            {studioMode === "review" && assetReview.canEdit && (
              <Button size="sm" variant="secondary" onClick={() => setStudioMode("editor")} className="gap-1.5 px-3.5 font-bold">
                <Pencil className="size-3.5" />
                Edit
              </Button>
            )}
            {/* Without Create there's nothing to share from here: hidden, not greyed out. */}
            {studioMode === "review" && assetReview.canEdit && (
              <Button
                size="sm"
                onClick={() => setShareModalOpen(true)}
                disabled={assetReview.shareLocked}
                title={assetReview.shareNote}
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
                    onClick={() =>
                      pagesList.length >= MAX_PAGES
                        ? showToast(`A document runs to ${MAX_PAGES} pages at most`)
                        : setAddPageOpen(true)
                    }
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

              {/* Pages, and nothing else. A layer list under them was a
                  second way to select what the canvas already selects, and it
                  answered a question — which block am I on — that the canvas
                  itself answers by showing you. */}

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
        applyingTemplate ? (
            <GenerationProgress
              title={`Applying the ${applyingTemplate.template.name} template...`}
              subtitle="Redrawing every page in the new template. Claims keep their words and citations; the chat stays open."
              steps={applyingTemplate.steps}
              onDone={() => {
                const { template } = applyingTemplate;
                setApplyingTemplate(null);
                addChatMessage({
                  role: "swishx",
                  text: `Done. ${pagesList.length === 1 ? "The page is" : `All ${pagesList.length} pages are`} in the **${template.name}** template now. Every claim kept its words and its citation. Tell me what to change, or undo to go back.`,
                });
                showToast(`${template.name} template applied`);
              }}
            />
        ) : studioMode === "opening" ? (
            <GenerationProgress
              title="Opening the canvas editor..."
              subtitle="Applying the chosen layout and fitting the approved copy into it, before the art starts arriving."
              steps={canvasOpenStepList}
              onDone={() => setStudioMode("editor")}
            />
        ) : studioMode === "generating" ? (
            <GenerationProgress
              title="Generating high-resolution creative & proofs..."
              subtitle="Synthesizing publication-grade vectors, clinical PASI 90 stat heroes, and PromoMats-verified claim links."
              steps={proofRenderStepList}
              onDone={handleProofsRendered}
              footer={
                <span className="flex items-center gap-1.5 font-medium">
                  <span>Email notification queued. You can close this tab</span>
                </span>
              }
            />
        ) : (
          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
            {studioMode === "review" && assetReview.item && (
              <ReviewStatusBanner item={assetReview.item} onEdit={() => setStudioMode("editor")} />
            )}
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
                  Keep editing. The boxes are already final
                </span>
              </div>
            )}

            <input
              id={ART_UPLOAD_ID}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file || !selectedArt) return;
                /* The frame is the slot's own shape, measured as laid out
                   (offset sizes ignore the page's zoom). */
                const slot = document.querySelector<HTMLElement>(`[data-art-slot="${selectedArt.id}"]`);
                const aspect = slot && slot.offsetHeight > 0 ? slot.offsetWidth / slot.offsetHeight : 16 / 9;
                setCropping({
                  src: URL.createObjectURL(file),
                  fileName: file.name,
                  mime: file.type,
                  layerId: selectedArt.id,
                  layerLabel: selectedArt.label,
                  aspect,
                });
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
              if (e.target === e.currentTarget) clearSelection();
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
                ref={pageCanvasRef}
                onClick={(e) => {
                  /* Empty page, not a block, run, art or added text inside it. */
                  if (studioMode !== "editor") return;
                  const target = e.target as HTMLElement;
                  if (target.closest("[data-block], [data-free-item], [data-canvas-text], [role='button']")) return;
                  selectPage();
                }}
                style={{
                  width: pageGeometry.width,
                  height: pageGeometry.height,
                  ...(pageStyle.fill ? { backgroundColor: pageStyle.fill } : {}),
                  transform: `scale(${pageScale})`,
                  transformOrigin: "top left",
                }}
                className={cn(
                  "absolute left-0 top-0 flex select-none flex-col overflow-hidden rounded-card border border-hair-2 bg-card text-left shadow-2xl transition-transform duration-150",
                  pageFocused && studioMode === "editor" && "ring-3 ring-brand ring-offset-4 ring-offset-transparent"
                )}
              >
                {/* The one true overlay: it sits behind everything rather than
                    taking space from anything. */}
                {pageStyle.art && <PageBackgroundArt layer={artFor("page")} elapsed={genElapsed} />}

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
                    data-block={"header"}
                    style={blockCss("header")}
                    onPointerDown={startMove("block:header", () => handleSelectBlock("header"))}
                  className={cn(
                    "relative z-[1] p-6 pb-5 bg-gradient-to-r from-[#0c1524] via-[#14233c] to-[#1e3458] text-white transition group",
                    studioMode === "editor" && "cursor-pointer",
                    selectedBlockId === "header" && blockFocused && studioMode === "editor"
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
                        style={offsetStyle(offsetOf(`art:${artFor("header")!.id}`))}
                        onPointerDown={startMove(`art:${artFor("header")!.id}`, () => {
                          setSelectedArtId(artFor("header")!.id);
                          clearElementSelection();
                          setBlockFocused(false);
                        })}
                        elapsed={genElapsed}
                        selected={selectedArtId === artFor("header")!.id}
                        onSelect={(id) => { setSelectedArtId(id); clearElementSelection(); setPageFocused(false); }}
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
                  {/* 2–4. The body blocks, in the page's order: the stat hero,
                      the mechanism and the chart can be moved or removed. */}
                  {bodyOrder.map((bodyId) =>
                    bodyId === "heroStat" ? (
                  <div key="heroStat"
                    onClick={() => studioMode === "editor" && handleSelectBlock("heroStat")}
                    data-block={"heroStat"}
                    style={blockCss("heroStat")}
                    onPointerDown={startMove("block:heroStat", () => handleSelectBlock("heroStat"))}
                    className={cn(
                      "p-4 rounded-panel bg-[#fff7f4] border border-tint-line shadow-2xs transition relative group",
                      studioMode === "editor" && "cursor-pointer",
                      selectedBlockId === "heroStat" && blockFocused && studioMode === "editor"
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
                    ) : bodyId === "moa" ? (
                  <div key="moa"
                    onClick={() => studioMode === "editor" && handleSelectBlock("moa")}
                    data-block={"moa"}
                    style={blockCss("moa")}
                    onPointerDown={startMove("block:moa", () => handleSelectBlock("moa"))}
                    className={cn(
                      "p-4 rounded-panel bg-subtle border border-hair shadow-2xs transition relative group",
                      studioMode === "editor" && "cursor-pointer",
                      selectedBlockId === "moa" && blockFocused && studioMode === "editor"
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
                        style={offsetStyle(offsetOf(`art:${artFor("moa")!.id}`))}
                        onPointerDown={startMove(`art:${artFor("moa")!.id}`, () => {
                          setSelectedArtId(artFor("moa")!.id);
                          clearElementSelection();
                          setBlockFocused(false);
                        })}
                        elapsed={genElapsed}
                        selected={selectedArtId === artFor("moa")!.id}
                        onSelect={(id) => { setSelectedArtId(id); clearElementSelection(); setPageFocused(false); }}
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
                    ) : (
                  <div key="chart"
                    onClick={() => studioMode === "editor" && handleSelectBlock("chart")}
                    data-block={"chart"}
                    style={blockCss("chart")}
                    onPointerDown={startMove("block:chart", () => handleSelectBlock("chart"))}
                    className={cn(
                      "p-4 rounded-panel bg-card border border-hair shadow-2xs transition relative group",
                      studioMode === "editor" && "cursor-pointer",
                      selectedBlockId === "chart" && blockFocused && studioMode === "editor"
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
                        style={offsetStyle(offsetOf(`art:${artFor("chart")!.id}`))}
                        onPointerDown={startMove(`art:${artFor("chart")!.id}`, () => {
                          setSelectedArtId(artFor("chart")!.id);
                          clearElementSelection();
                          setBlockFocused(false);
                        })}
                        elapsed={genElapsed}
                        selected={selectedArtId === artFor("chart")!.id}
                        onSelect={(id) => { setSelectedArtId(id); clearElementSelection(); setPageFocused(false); }}
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
                    )
                  )}

                  {/* 5. ISI / Fair Balance Footnote */}
                  <div
                    onClick={() => studioMode === "editor" && handleSelectBlock("isi")}
                    data-block={"isi"}
                    style={blockCss("isi")}
                    onPointerDown={startMove("block:isi", () => handleSelectBlock("isi"))}
                    className={cn(
                      "p-3.5 rounded-panel bg-[#fafafa] border border-hair mt-auto transition relative group",
                      studioMode === "editor" && "cursor-pointer",
                      selectedBlockId === "isi" && blockFocused && studioMode === "editor"
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

                {/* Added text, over the layout, wherever it was put. */}
                {(currentPage.freeItems ?? []).map((item) => (
                  <FreeTextItem
                    key={item.id}
                    item={item}
                    style={elementStyles[`free.${item.id}`]}
                    selected={selectedElementId === `free.${item.id}`}
                    editing={editingFreeId === item.id}
                    locked={studioMode !== "editor"}
                    scale={pageScale}
                    onSelect={() => selectFree(item.id)}
                    onEdit={() => {
                      selectFree(item.id);
                      setEditingFreeId(item.id);
                    }}
                    onCommit={(text) => commitFreeText(item.id, text)}
                    onMoveStart={record}
                    onMoveEnd={(to) =>
                      updateCurrentPage((prev) => ({
                        ...prev,
                        freeItems: prev.freeItems?.map((f) => (f.id === item.id ? { ...f, ...to } : f)),
                      }))
                    }
                  />
                ))}
              </div>
            </div>
          </main>

          {/* Zoom, in the canvas's own corner: it changes how you look at the
              page, not the page, so it stays out of the editing toolbar. */}
          <div className="absolute bottom-4 right-4 z-10 hidden items-center gap-1 rounded-control border border-hair-2 bg-card p-0.5 shadow-soft sm:flex">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
              className="focus-ring cursor-pointer rounded-glyph p-1 text-ink-2 transition hover:bg-subtle hover:text-ink"
              title="Zoom out"
              aria-label="Zoom out"
            >
              <ZoomOut className="size-3.5" />
            </button>
            <span className="min-w-[42px] px-1 text-center text-caption font-bold tabular-nums text-ink">{zoomLevel}%</span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
              className="focus-ring cursor-pointer rounded-glyph p-1 text-ink-2 transition hover:bg-subtle hover:text-ink"
              title="Zoom in"
              aria-label="Zoom in"
            >
              <ZoomIn className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(100)}
              className="focus-ring cursor-pointer rounded-glyph px-2 py-0.5 text-caption font-bold text-brand transition hover:bg-subtle"
            >
              Fit
            </button>
          </div>
          </div>
        )
      }
      panel={
        studioMode !== "generating" ? (
          <>
            {/* Top Tabs Switcher */}
            <div className="p-3 border-b border-hair bg-canvas shrink-0">
              {/* The same tab row the video studio has, from the same
                  component — this was a fourth hand-rolled copy of it.
                  Comments live here in the editor too, not only in review:
                  the agent resolves a reviewer's note while you are editing,
                  and this is where you go to see that. */}
              <div className={cn(INSPECTOR_TAB_STRIP, "bg-[#edeef0]")}>
                {/* The chat changes the asset, so a viewer without Create doesn't get it. */}
                {assetReview.canEdit && (
                <InspectorTabButton
                  tab="assistant"
                  current={activeTab}
                  onClick={setActiveTab}
                  icon={MessageCircle}
                  badge={<span className="size-1.5 rounded-full bg-ok shrink-0" />}
                >
                  Chat
                </InspectorTabButton>
                )}

                {/* No Edit tab: the toolbar edits whatever is selected, and
                    selecting never moves the panel off the chat. */}

                {(publishedCount > 0 || isReview) && (
                <InspectorTabButton
                  tab="comments"
                  current={activeTab}
                  onClick={setActiveTab}
                  icon={MessageSquareQuote}
                  count={commentStats(comments).open}
                  alwaysCount
                >
                  Comments
                </InspectorTabButton>
                )}

                <InspectorTabButton
                  tab="evidence"
                  current={activeTab}
                  onClick={setActiveTab}
                  icon={ShieldCheck}
                  count={24}
                >
                  Claims
                </InspectorTabButton>
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
                        {msg.artRef && (() => {
                          const ref = msg.artRef;
                          const layer = pagesList.find((pg) => pg.id === ref.pageId)?.art.find((a) => a.id === ref.layerId);
                          return layer ? (
                            <div className="mb-2 w-44 overflow-hidden rounded-control ring-1 ring-white/30">
                              <ArtSlot layer={layer} elapsed={genElapsed} className="h-24 w-full rounded-none border-0" />
                              <div className="bg-black/40 px-2 py-1 text-caption font-bold text-white">
                                Page {ref.pageId} · {layer.label}
                              </div>
                            </div>
                          ) : null;
                        })()}
                        <FormattedMessageText text={msg.text} />
                        <ChatChips chips={msg.chips} onPick={(chip) => handleSendMessage(chip)} />
                      </div>
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>

                <div className="p-3 border-t border-hair bg-card shrink-0 space-y-2">
                  {/* What is still owed, pinned where the second Generate and
                      Publish button used to sit. That button was already in
                      the header; this is the thing you actually need in front
                      of you while you work. */}

                  {/* The same composer as every other chat in the product. */}
                  <ChatComposer
                    value={chatInput}
                    onChange={setChatInput}
                    onSubmit={() => handleSendMessage()}
                    canSendEmpty={suggestionQueue.draftCount > 0}
                    placeholder={
                      studioMode === "review"
                        ? "Ask SwishX or type 'Add comment on the hero stat that...'..."
                        : suggestionQueue.draftCount > 0
                        ? "Add a note, or send as is"
                        : "Ask SwishX to rephrase, highlight endpoints..."
                    }
                    attachControl={<ComposerAttachButton onClick={chatFiles.open} label="Attach a file" />}
                  >
                    <ChatAttachmentRow attachments={chatFiles} />
                    {/* What goes with this message: elements added to the
                        chat and suggestions left on the page, in one list. */}
                    <ComposerTray
                      items={[
                        ...chatContexts.map((c) => ({
                          id: c.id,
                          icon: <MessageSquare className="size-3" />,
                          label: c.label,
                          detail: c.detail,
                        })),
                        ...suggestionQueue.drafts.map((sg) => ({
                          id: sg.id,
                          icon: <MessageSquareQuote className="size-3" />,
                          label: sg.elementLabel,
                          quote: sg.text,
                        })),
                      ]}
                      onRemove={(id) => {
                        if (suggestionQueue.drafts.some((sg) => sg.id === id)) suggestionQueue.remove(id);
                        else setChatContexts((prev) => prev.filter((c) => c.id !== id));
                      }}
                    />
                  </ChatComposer>
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
                      Where it sits and how big it is come from the slot the layout reserved. The art fills
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
                                  attachToChat({ id: `run-${el.id}`, label: `Page ${activePageId} · ${el.label}`, detail: `"${runValue(el.id)}"` });
                                  setChatInput((prev) => (prev.trim() ? prev : `Rewrite the ${el.label.toLowerCase()} `));
                                  showToast(`${el.label} added to the chat`);
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
            {/* The tab is in the row in the editor too, so the panel has to
                be here in the editor too — gated to review, clicking it showed
                nothing. */}
            {activeTab === "comments" && (
              <ReviewComments
                comments={comments}
                stampLabel={`Page ${activePageId}`}
                review={assetReview.item}
                canClose={studioMode === "editor"}
                onAddAsSuggestion={studioMode === "editor" ? addCommentAsSuggestion : undefined}
                onResolve={(id, note) => closeComment(id, "resolved", note)}
                onReject={(id, note) => closeComment(id, "rejected", note)}
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
            {/* The same panel the video editor shows. Two hand-rolled lists
                meant the same question — what am I allowed to say — got two
                different answers, and only one of them could open the dossier
                the claim came from. */}
            {activeTab === "evidence" && <ClaimsPanel brandName={brandName} />}
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
          assetTitle={creativeTitle}
          brandName={brandName}
          onExportDirect={() => {
            setExportModalOpen(true);
          }}
          onShowToast={(msg) => showToast(msg)}
        />

        {/* ── EXPORT MODAL ── */}
        {exportModalOpen && (
          <Portal>
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
          </Portal>
        )}

        {/* ── CONFIRM CREATIVE GENERATION MODAL (Matching Exact Form & Rate Spec with Quality & MLR Layer) ── */}
        {confirmGenerateModalOpen && (
          <PreviewPublishModal
            title={creativeTitle}
            version={`Version ${draftVersion}`}
            kind="document"
            review={mlrReview}
            submit={
              assetReview.stages.length
                ? {
                    label: assetReview.item?.status === "changes" ? "Resubmit for review" : "Submit for review",
                    route: assetReview.stages.map((st) => st.name),
                  }
                : undefined
            }
            checks={[
              mlrCheckResolved
                ? { id: "mlr", source: "MLR", title: "24 verified claims cited", detail: "EMBRACE-3 §2.4 grounded (p < 0.001)" }
                : {
                    id: "mlr",
                    source: "MLR",
                    severity: "blocker" as const,
                    title: "Unverified comparative claim",
                    detail: "Hero card compares efficacy without citing the comparator placebo cohort.",
                  },
              qaCheckResolved
                ? { id: "qa", source: "Quality", title: "Editorial and spelling clear", detail: "Nomenclature and syntax verified" }
                : {
                    id: "qa",
                    source: "Quality",
                    severity: "warning" as const,
                    title: "Subtitle phrasing redundancy",
                    detail: "Tagline contains redundant descriptors and unstandardised dosing syntax.",
                  },
              { id: "isi", source: "MLR", title: "Fair balance and ISI present", detail: "eGFR ≥25 and box warnings verified" },
              { id: "vector", source: "Quality", title: "Vector layout and contrast", detail: "300 DPI CMYK ready hierarchy" },
              { id: "terms", source: "Quality", title: "Medical terminology clear", detail: "Generic name and dosing accurate" },
              { id: "refs", source: "MLR", title: "Reference list complete", detail: "All citations resolve to approved sources" },
            ]}
            onClose={() => setConfirmGenerateModalOpen(false)}
            onPublish={() => {
              setConfirmGenerateModalOpen(false);
              handlePublishCreative();
            }}
            preview={
              <DocPagePreview
                sourceRef={pageCanvasRef}
                pageSize={{ width: pageGeometry.width, height: pageGeometry.height }}
                pages={pagesList.map((pg) => ({ id: pg.id, name: pg.name }))}
                activePage={activePageId}
                onSelectPage={setInfographicActivePage}
                frozen={mlrReview.status === "running"}
              />
            }
          />
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
            onSuggest={addSuggestion}
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
        <Toast message={toastMessage} open={toastOpen} tone={toastTone} />

        {regenArtId && (() => {
          const layer = currentPage.art.find((a) => a.id === regenArtId);
          if (!layer) return null;
          const kind = layer.kind === "graph" ? "chart" : layer.kind === "background" ? "background" : "image";
          const where = layer.slot === "page" ? "behind the whole page" : `in the ${BLOCK_LABELS[layer.slot]?.toLowerCase()} block`;
          return (
            <RequestModal
              icon={RotateCcw}
              action="Regenerate"
              subject={`${pageLabel} · ${layer.label}`}
              preview={
                <div className="relative">
                  <ArtSlot layer={layer} elapsed={genElapsed} className="h-56 w-full" />
                  <CurrentTag />
                </div>
              }
              current={`The ${kind} ${where}.${layer.alt ? ` Alt text: “${layer.alt}”.` : ""}`}
              label="What should change?"
              hint="Optional. Leave it empty for a fresh take on the same direction. The claims and copy around it stay as they are."
              placeholder={
                layer.kind === "graph"
                  ? "e.g. Lighten the placebo line and label week 16"
                  : layer.kind === "background"
                    ? "e.g. A softer, lighter wash"
                    : "e.g. Closer in, with cooler light"
              }
              submitLabel={`Regenerate ${layer.label}`}
              onClose={() => setRegenArtId(null)}
              onSubmit={(note) => {
                /* Into the chat like anything else asked of SwishX, with the
                   art attached, and the redraw starts in the same box. */
                setRegenArtId(null);
                regenerateArt(layer.id);
                setCopilotPanelOpen(true);
                setActiveTab("assistant");
                addChatMessage({
                  role: "user",
                  text: note ? `Regenerate ${layer.label} on ${pageLabel}: ${note}` : `Regenerate ${layer.label} on ${pageLabel}`,
                  artRef: { pageId: activePageId, layerId: layer.id },
                });
                setTimeout(() => {
                  addChatMessage({
                    role: "swishx",
                    text: note
                      ? `Redrawing **${layer.label}** with that change. It lands in the same box in about 12 seconds; the claims and copy around it stay as they are.`
                      : `A fresh take on **${layer.label}**, same direction. It lands in the same box in about 12 seconds.`,
                  });
                }, 700);
              }}
            />
          );
        })()}

        {(imagePicker === "brand" || imagePicker === "media") && (
          <MediaPickerModal
            icon={imagePicker === "brand" ? Package : FolderOpen}
            title={imagePicker === "brand" ? `Brand images library · ${brandName}` : "Workspace media library"}
            sub={
              imagePicker === "brand"
                ? `Images attached to ${brandName} in the Product Library, every variation.`
                : "Images used across the workspace, each with the drug or project it came from."
            }
            items={
              imagePicker === "brand"
                ? brandProduct
                  ? brandImageItems(brandProduct)
                  : []
                : workspaceMediaItems(libraryProducts, brandName)
            }
            empty={`No images are attached to ${brandName} yet. Add them to the drug in the Product Library.`}
            onClose={() => setImagePicker(null)}
            onUse={(item) => {
              setImagePicker(null);
              queueInsert({
                id: `insert-image-${item.id}`,
                label: `Image · ${item.name}`,
                detail: `${item.source.kind} ${item.source.name} (${item.source.id}) · ${pageLabel}, ${insertWhere}`,
                prompt: `Place this image ${insertWhere}. `,
                reply: `Placing **${item.name}** ${insertWhere}. It keeps its source, ${item.source.kind.toLowerCase()} ${item.source.name}, so its approval travels with it.`,
                toast: item.name,
              });
            }}
          />
        )}

        {imagePicker === "icon" && (
          <IconPickerModal
            onClose={() => setImagePicker(null)}
            onUse={(name, label) => {
              setImagePicker(null);
              queueInsert({
                id: `insert-icon-${name}`,
                label: `Icon · ${label}`,
                detail: `${pageLabel}, ${insertWhere} · in the brand colour`,
                prompt: `Add the ${label.toLowerCase()} icon ${insertWhere}, next to `,
                reply: `Adding the **${label.toLowerCase()}** icon ${insertWhere}, drawn in the brand colour.`,
                toast: `${label} icon`,
              });
            }}
          />
        )}

        {imagePicker === "qr" && (
          <QrCodeModal
            onClose={() => setImagePicker(null)}
            onUse={(url) => {
              setImagePicker(null);
              queueInsert({
                id: `insert-qr-${url}`,
                label: "QR code",
                detail: `Links to ${url} · ${pageLabel}, ${insertWhere}`,
                prompt: `Place this QR code ${insertWhere}. `,
                reply: `Placing a **QR code** to ${url} ${insertWhere}. I'll add a line under it saying where it goes, so a reader knows before they scan.`,
                toast: "QR code",
              });
            }}
          />
        )}

        {imagePicker === "generate" && (
          <RequestModal
            icon={Sparkles}
            action="Generate an image"
            subject={pageLabel}
            label="Describe the image"
            hint={`It goes ${insertWhere}. SwishX keeps it to the brand look and away from anything a claim would need to back up.`}
            placeholder="e.g. A dermatologist examining a patient's forearm, soft daylight"
            submitLabel="Generate image"
            required
            onClose={() => setImagePicker(null)}
            onSubmit={(note) => {
              setImagePicker(null);
              setCopilotPanelOpen(true);
              setActiveTab("assistant");
              addChatMessage({ role: "user", text: `Generate an image ${insertWhere}: ${note}` });
              setTimeout(() => {
                addChatMessage({
                  role: "swishx",
                  text: `Generating that image ${insertWhere}. It lands in its own box when it's drawn; nothing else on the page moves.`,
                });
              }, 700);
            }}
          />
        )}

        {cropping && (
          <ImageCropModal
            src={cropping.src}
            fileName={cropping.fileName}
            mime={cropping.mime}
            aspect={cropping.aspect}
            slotLabel={`the ${cropping.layerLabel} box`}
            onClose={() => {
              URL.revokeObjectURL(cropping.src);
              setCropping(null);
            }}
            onApply={(imageUrl) => {
              record();
              updateCurrentPage((prev) => ({
                ...prev,
                art: prev.art.map((a) =>
                  a.id === cropping.layerId ? { ...a, imageUrl, label: cropping.fileName, readyAt: 0 } : a
                ),
              }));
              URL.revokeObjectURL(cropping.src);
              setCropping(null);
              showToast(`${cropping.fileName} placed in the ${cropping.layerLabel} slot`);
            }}
          />
        )}

        {templatesOpen && (
          <TemplateSwitchModal
            currentId={infographicTemplate}
            pageCount={pagesList.length}
            onClose={() => setTemplatesOpen(false)}
            onApply={(template, note) => {
              setTemplatesOpen(false);
              setInfographicTemplate(template.id);
              setCopilotPanelOpen(true);
              setActiveTab("assistant");
              addChatMessage({
                role: "user",
                text: `Switch the document to the **${template.name}** template.${note ? ` ${note}` : ""}`,
              });
              setTimeout(() => {
                addChatMessage({
                  role: "swishx",
                  text: `Applying **${template.name}** to ${pagesList.length === 1 ? "the page" : `all ${pagesList.length} pages`}${note ? ", with your note in mind" : ""}. The canvas shows the redraw; it takes a few seconds.`,
                });
              }, 500);
              setApplyingTemplate({
                template,
                steps: [
                  { label: `Loaded the ${template.name} template`, seconds: 0.5 },
                  ...pagesList.map((_, i) => ({ label: `Page ${i + 1}, laid out the blocks again`, seconds: 0.6 })),
                  { label: "Moved the approved copy across, citations intact", seconds: 0.6 },
                  { label: "Carried over added text and replaced images", seconds: 0.5 },
                  { label: "Placed the brand mark & fair balance band", seconds: 0.45 },
                ],
              });
            }}
          />
        )}
        {addPageOpen && (() => {
          const next = pagesList.length + 1;
          return (
            <RequestModal
              icon={FilePlus2}
              action="Add a page"
              subject={`Page ${next}`}
              label="What should this page be about?"
              hint="SwishX lays it out from the approved claims. You can change anything after."
              placeholder="e.g. Safety and tolerability, with the adverse event table"
              submitLabel={`Add page ${next}`}
              required
              onClose={() => setAddPageOpen(false)}
              onSubmit={(note) => {
                setAddPageOpen(false);
                handleAddPage();
                setCopilotPanelOpen(true);
                setActiveTab("assistant");
                addChatMessage({ role: "user", text: `Add page ${next}: ${note}` });
                setTimeout(() => {
                  addChatMessage({
                    role: "swishx",
                    text: `Added **Page ${next}**. I'm laying it out around that, from the approved claims, starting from the evidence layout. Tell me what to change.`,
                  });
                }, 700);
              }}
            />
          );
        })()}
        <SaveOrDiscardDialog
          open={!!exit.pending}
          destinationLabel={exit.pending?.label}
          onSaveDraft={() => exit.resolve(true)}
          onDiscard={() => exit.resolve(false)}
          onCancel={exit.cancel}
        />
        </>
      }
    />
  );
}
