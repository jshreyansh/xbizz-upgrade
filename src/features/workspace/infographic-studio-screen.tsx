"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SwishXMark } from "@/components/ui/swishx-mark";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { cn } from "@/lib/cn";

interface InfographicData {
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

const DEFAULT_INFOGRAPHIC_DATA: InfographicData = {
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

const CLAIMS_LIST = [
  { id: "claim-1", tag: "Claim §1.1 · Indication", desc: "Approved in adults aged 18+ for moderate-to-severe plaque psoriasis", source: "Prescribing Information p.3" },
  { id: "claim-2", tag: "Claim §2.4 · Efficacy (52% PASI 90)", desc: "Statistically significant skin clearance vs 18% in placebo (p < 0.001)", source: "EMBRACE-3 readout Table 2.4" },
  { id: "claim-3", tag: "Claim §3.1 · Mechanism (SGLT2 / Kinase)", desc: "Selective cellular kinase receptor binding and downstream cytokine inhibition", source: "Lancet Derm 2024; 42:118" },
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
    copilotPanelOpen,
    toggleCopilotPanel,
    setView,
    setVideoSubStage,
  } = useWorkspaceStore();

  const [activeTab, setActiveTab] = useState<"assistant" | "edit" | "evidence">("assistant");
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [selectedBlockId, setSelectedBlockId] = useState<"header" | "heroStat" | "moa" | "chart" | "isi">("heroStat");
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [brandColor, setBrandColor] = useState<string>("#fd4816");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Editable data for all canvas elements
  const [data, setData] = useState<InfographicData>(DEFAULT_INFOGRAPHIC_DATA);

  // Chat conversation
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "swishx"; text: string }>>([
    {
      role: "swishx",
      text: "I've structured your clinical infographic grounded in the active Brand Dossier. Click any component on the canvas or use the **Edit** tab to customize the text and layout in real-time.",
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSelectBlock = (blockId: "header" | "heroStat" | "moa" | "chart" | "isi") => {
    setSelectedBlockId(blockId);
    setActiveTab("edit");
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    setChatMessages((prev) => [...prev, { role: "user", text }]);
    setChatInput("");

    setTimeout(() => {
      const lower = text.toLowerCase();
      if (lower.includes("headline") || lower.includes("header") || lower.includes("title")) {
        setData((prev) => ({
          ...prev,
          header: {
            ...prev.header,
            subtitle: "Rapid Clinical Clearance & Once-Daily Tolerability in Plaque Psoriasis",
          },
        }));
        setChatMessages((prev) => [
          ...prev,
          {
            role: "swishx",
            text: "Updated the infographic header tagline to highlight rapid clinical clearance and once-daily dosing. The canvas has been refreshed.",
          },
        ]);
      } else if (lower.includes("pasi") || lower.includes("stat") || lower.includes("metric") || lower.includes("efficacy")) {
        setData((prev) => ({
          ...prev,
          heroStat: {
            ...prev.heroStat,
            metric: "52% PASI 90 Clear Skin",
            detail: "52% of patients achieved PASI 90 at Week 16 vs 18% in placebo (p < 0.001), sustained through Week 52.",
          },
        }));
        setChatMessages((prev) => [
          ...prev,
          {
            role: "swishx",
            text: "Updated the primary efficacy hero card to PASI 90 clear skin with full 52-week extension grounding.",
          },
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          {
            role: "swishx",
            text: `Applied direction for "${text}". The infographic layout, styling, and verified FDA/CDSCO citations remain 100% compliant.`,
          },
        ]);
      }
    }, 600);
  };

  return (
    <div className="flex h-screen min-h-[720px] flex-col overflow-hidden bg-[#edf0ed] text-left">
      {/* ─── Top Studio Header Bar (Matching Video Studio Header Design) ─── */}
      <header className="z-30 flex h-[60px] shrink-0 items-center justify-between border-b border-[var(--line)] bg-white px-3 sm:px-5">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => {
              setView("directions");
              setVideoSubStage("directions");
            }}
            className="focus-ring mr-1 grid size-8 place-items-center rounded-lg text-[var(--ink-muted)] hover:bg-black/5 hover:text-[var(--ink)] cursor-pointer"
            title="Back to Plan"
            aria-label="Back to Plan"
          >
            <ArrowLeft className="size-4" />
          </button>

          <SwishXMark compact />
          <div className="mx-2.5 h-5 w-px bg-[var(--line)]" />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-[13px] font-[850] text-[var(--ink)] tracking-tight">
                Velmora HCP Infographic
              </span>
              <span className="hidden rounded-full bg-[#edf1ee] px-2 py-0.5 text-[9px] font-bold text-[#69736e] sm:inline">
                Draft v1
              </span>
            </div>
            <div className="mt-0.5 hidden text-[9.5px] text-[var(--ink-muted)] sm:block">
              Saved just now · MagicCanvas™ · {infographicPages === "2" ? "2 Pages" : "1 Page"} ({pageShape === "16:9" ? "16:9 Landscape" : pageShape === "A4" ? "A4 Print" : "3:4 Tablet"})
            </div>
          </div>

          <div className="ml-4 hidden items-center gap-1.5 md:flex">
            <span className="rounded-full bg-[var(--tint)] px-2.5 py-0.5 text-[10.5px] font-extrabold text-[var(--brand-deep)] border border-[var(--tint-line)]">
              Canvas Editor
            </span>
          </div>
        </div>

        {/* Center Canvas Zoom Controls */}
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

        {/* Right Actions: Export PDF + Sidebar Toggle */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setExportModalOpen(true)}
            className="gap-1.5 bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white text-[12px] font-bold shadow-xs cursor-pointer px-4"
          >
            <Download className="size-3.5" />
            <span>Export PDF</span>
          </Button>

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

      {/* ─── Main Studio Body (Left Thumbnail / Graphic Canvas / Right Sidebar) ─── */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* ── LEFT SIDEBAR: Pages Thumbnails & Graphic Layers ── */}
        <aside className="w-56 sm:w-60 border-r border-[var(--line)] bg-[#f8f9f7] flex flex-col shrink-0 overflow-y-auto">
          {/* Pages Strip Header */}
          <div className="p-3 border-b border-[var(--line)] bg-white flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--ink-muted)]">
              Pages ({infographicPages === "2" ? "2" : "1"})
            </span>
            <button
              type="button"
              onClick={() => showToast("Added Page 2")}
              className="p-1 text-[var(--brand)] hover:bg-[var(--tint)] rounded cursor-pointer"
              title="Add Page"
            >
              <Plus className="size-3.5" />
            </button>
          </div>

          {/* Page Thumbnails List */}
          <div className="p-3 space-y-3 border-b border-[var(--line)]">
            <button
              type="button"
              onClick={() => setInfographicActivePage(1)}
              className={cn(
                "w-full flex flex-col gap-1.5 p-2.5 rounded-xl border text-left transition cursor-pointer relative shadow-2xs",
                infographicActivePage === 1
                  ? "border-[var(--brand)] bg-[var(--tint)]/50 ring-2 ring-[var(--brand)]/15"
                  : "border-black/10 bg-white hover:border-black/20"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[var(--ink)]">Page 1: Front Summary</span>
                {infographicActivePage === 1 && <span className="size-2 rounded-full bg-[var(--brand)]" />}
              </div>
              <div className="aspect-[3/4] w-full rounded-lg bg-white border border-black/10 p-2 flex flex-col justify-between overflow-hidden shadow-inner-xs">
                <div className="h-2 w-14 bg-[#14233c] rounded" />
                <div className="h-4 w-full bg-[var(--brand)]/20 rounded" />
                <div className="h-6 w-full bg-black/5 rounded" />
                <div className="h-2 w-full bg-black/10 rounded" />
              </div>
            </button>

            {infographicPages === "2" && (
              <button
                type="button"
                onClick={() => setInfographicActivePage(2)}
                className={cn(
                  "w-full flex flex-col gap-1.5 p-2.5 rounded-xl border text-left transition cursor-pointer relative shadow-2xs",
                  infographicActivePage === 2
                    ? "border-[var(--brand)] bg-[var(--tint)]/50 ring-2 ring-[var(--brand)]/15"
                    : "border-black/10 bg-white hover:border-black/20"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[var(--ink)]">Page 2: Clinical Evidence</span>
                  {infographicActivePage === 2 && <span className="size-2 rounded-full bg-[var(--brand)]" />}
                </div>
                <div className="aspect-[3/4] w-full rounded-lg bg-white border border-black/10 p-2 flex flex-col justify-between overflow-hidden shadow-inner-xs">
                  <div className="h-2 w-14 bg-blue-600 rounded" />
                  <div className="h-7 w-full bg-black/5 rounded" />
                  <div className="h-2 w-full bg-black/10 rounded" />
                </div>
              </button>
            )}
          </div>

          {/* Graphic Layers Tree */}
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
        </aside>

        {/* ── CENTER CANVAS: High-Resolution Graphic Infographic ── */}
        <main className="flex-1 overflow-auto p-6 sm:p-10 flex items-center justify-center bg-[#e5e8e4]">
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "center top" }}
            className={cn(
              "w-full max-w-[700px] rounded-[24px] bg-white shadow-2xl border border-black/10 overflow-hidden text-left transition-transform duration-150 flex flex-col select-none",
              pageShape === "16:9" ? "aspect-video" : "min-h-[880px]"
            )}
          >
            {/* 1. Header Band */}
            <div
              onClick={() => handleSelectBlock("header")}
              className={cn(
                "p-6 pb-5 bg-gradient-to-r from-[#0c1524] via-[#14233c] to-[#1e3458] text-white relative transition cursor-pointer group",
                selectedBlockId === "header"
                  ? "ring-3 ring-inset ring-[var(--brand)] shadow-inner"
                  : "hover:brightness-105"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-white border border-white/20">
                  {data.header.badge}
                </span>
                <span className="text-[10px] font-mono text-white/70">{data.header.approvalTag}</span>
              </div>
              <h1 className="text-[23px] font-[850] text-white tracking-tight leading-tight">
                {data.header.title}
              </h1>
              <p className="text-[12px] text-white/80 font-medium mt-1">
                {data.header.subtitle}
              </p>
            </div>

            {/* Infographic Body Blocks */}
            <div className="p-6 space-y-4 flex-1 flex flex-col">
              {/* 2. Stat Hero */}
              <div
                onClick={() => handleSelectBlock("heroStat")}
                className={cn(
                  "p-4 rounded-2xl bg-[#fff7f4] border border-[#ffdbce] shadow-2xs transition cursor-pointer relative group",
                  selectedBlockId === "heroStat"
                    ? "ring-2 ring-[var(--brand)] shadow-sm bg-white"
                    : "hover:border-[var(--brand)]/60"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--brand-deep)]">
                    {data.heroStat.category}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.2 text-[9.5px] font-bold">
                    <Check className="size-2.5 stroke-[3]" />
                    {data.heroStat.citation}
                  </span>
                </div>
                <div className="flex items-baseline gap-2.5">
                  <div
                    style={{ color: brandColor }}
                    className="text-[32px] font-[900] leading-tight tracking-tight"
                  >
                    {data.heroStat.metric}
                  </div>
                  <span className="text-[13px] font-bold text-[var(--ink-2)]">
                    {data.heroStat.comparison}
                  </span>
                </div>
                <p className="text-[12px] text-[var(--ink-2)] font-medium mt-0.5 leading-relaxed">
                  {data.heroStat.detail}
                </p>
              </div>

              {/* 3. MoA Pathway */}
              <div
                onClick={() => handleSelectBlock("moa")}
                className={cn(
                  "p-4 rounded-2xl bg-[#f8faf8] border border-black/[0.08] shadow-2xs transition cursor-pointer relative group",
                  selectedBlockId === "moa"
                    ? "ring-2 ring-[var(--brand)] shadow-sm bg-white"
                    : "hover:border-black/20"
                )}
              >
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--ink-muted)] block mb-1">
                  {data.moa.title}
                </span>
                <p className="text-[11.5px] text-[var(--ink-2)] leading-relaxed mb-2.5">
                  {data.moa.detail}
                </p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {data.moa.steps.map((step, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-white border border-black/[0.06] shadow-2xs">
                      <span className="text-[10.5px] font-bold text-[var(--ink)] block">{step}</span>
                      <span className="text-[9px] text-[var(--ink-muted)] mt-0.5 block">Cellular Target</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Chart Block */}
              <div
                onClick={() => handleSelectBlock("chart")}
                className={cn(
                  "p-4 rounded-2xl bg-white border border-black/[0.08] shadow-2xs transition cursor-pointer relative group",
                  selectedBlockId === "chart"
                    ? "ring-2 ring-[var(--brand)] shadow-sm"
                    : "hover:border-black/20"
                )}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11.5px] font-bold text-[var(--ink)]">
                    {data.chart.title}
                  </span>
                  <span className="text-[10px] text-[var(--ink-muted)] font-mono">{data.chart.cohort}</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[10.5px] font-bold mb-1">
                      <span>{data.chart.arm1Label}</span>
                      <span style={{ color: brandColor }}>{data.chart.arm1Val}%</span>
                    </div>
                    <div className="h-3 w-full bg-black/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${data.chart.arm1Val}%`, background: brandColor }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10.5px] font-bold mb-1 text-[var(--ink-muted)]">
                      <span>{data.chart.arm2Label}</span>
                      <span>{data.chart.arm2Val}%</span>
                    </div>
                    <div className="h-3 w-full bg-black/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-black/20 rounded-full transition-all duration-300"
                        style={{ width: `${data.chart.arm2Val}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. ISI Safety Footer */}
              <div
                onClick={() => handleSelectBlock("isi")}
                className={cn(
                  "mt-auto p-3.5 rounded-2xl bg-[#fafafa] border border-black/[0.08] text-[9.5px] text-[var(--ink-muted)] leading-relaxed relative transition cursor-pointer group",
                  selectedBlockId === "isi"
                    ? "ring-2 ring-[var(--brand)] shadow-sm bg-white"
                    : "hover:border-black/20"
                )}
              >
                <b className="text-[var(--ink)] font-bold block mb-0.5">{data.isi.title}:</b>
                {data.isi.content}
                <span className="block mt-1 font-mono text-[8.5px] text-[var(--brand)] font-semibold">
                  {data.isi.citation}
                </span>
              </div>
            </div>
          </div>
        </main>

        {/* ── RIGHT SIDEBAR: Matching Video Studio Sidebar Design & Functionality ── */}
        <aside
          style={{
            width: copilotPanelOpen ? 410 : 0,
            minWidth: copilotPanelOpen ? 410 : 0,
            maxWidth: copilotPanelOpen ? 410 : 0,
            transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          className={cn(
            "shrink-0 border-l border-[var(--line)] bg-white flex flex-col min-h-0 shadow-[-4px_0_20px_rgba(0,0,0,0.04)] z-10 overflow-hidden",
            !copilotPanelOpen && "border-none pointer-events-none"
          )}
        >
          {/* Top Tab Bar (Matching Video Studio InspectorTabButton) */}
          <div className="p-2.5 border-b border-[var(--line)] bg-[#f4f6f4]">
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#e6ebe6] rounded-2xl border border-black/[0.04] shadow-inner-xs">
              <button
                type="button"
                onClick={() => setActiveTab("assistant")}
                className={cn(
                  "group relative flex items-center justify-center gap-1 h-8.5 px-2 rounded-xl text-[12px] transition-all duration-150 cursor-pointer font-[800] select-none whitespace-nowrap",
                  activeTab === "assistant"
                    ? "bg-white text-[var(--ink)] shadow-xs border border-black/[0.08]"
                    : "text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-white/50 border border-transparent"
                )}
              >
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0 mr-1" />
                <span>Chat</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={cn(
                  "group relative flex items-center justify-center gap-1 h-8.5 px-2 rounded-xl text-[12px] transition-all duration-150 cursor-pointer font-[800] select-none whitespace-nowrap",
                  activeTab === "edit"
                    ? "bg-white text-[var(--ink)] shadow-xs border border-black/[0.08]"
                    : "text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-white/50 border border-transparent"
                )}
              >
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("evidence")}
                className={cn(
                  "group relative flex items-center justify-center gap-1 h-8.5 px-2 rounded-xl text-[12px] transition-all duration-150 cursor-pointer font-[800] select-none whitespace-nowrap",
                  activeTab === "evidence"
                    ? "bg-white text-[var(--ink)] shadow-xs border border-black/[0.08]"
                    : "text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-white/50 border border-transparent"
                )}
              >
                <span>Claims</span>
                <span
                  className={cn(
                    "text-[10px] font-extrabold px-1.5 py-0.2 rounded-full transition-colors ml-0.5",
                    activeTab === "evidence"
                      ? "bg-[var(--tint-strong)] text-[var(--brand-deep)] border border-[var(--brand)]/20"
                      : "bg-black/5 text-gray-500"
                  )}
                >
                  24
                </span>
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            {/* ── TAB 1: DIRECT WITH SWISHX CHAT ── */}
            {activeTab === "assistant" && (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="px-4 py-2 border-b border-black/[0.06] bg-[#fafbf9] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11.5px] font-extrabold text-[var(--ink)]">Direct with SwishX · Online</span>
                  </div>
                  <span className="text-[10px] text-[var(--ink-muted)] font-semibold">Pharma-Compliant Copilot</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex flex-col max-w-[88%] text-[13px] leading-relaxed transition-all",
                        msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                      )}
                    >
                      {msg.role === "swishx" && (
                        <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-[var(--brand-deep)]">
                          <span className="flex size-4.5 items-center justify-center rounded-full bg-[var(--brand)] text-[8.5px] font-black text-white">
                            SX
                          </span>
                          <span>SwishX Director</span>
                        </div>
                      )}
                      <div
                        className={cn(
                          "rounded-2xl p-3.5 shadow-2xs",
                          msg.role === "user"
                            ? "bg-[var(--brand)] text-white rounded-tr-xs"
                            : "bg-[#f5f7f5] text-[var(--ink)] border border-black/8 rounded-tl-xs"
                        )}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input Bar */}
                <div className="p-3 border-t border-[var(--line)] bg-[#fafbf9]">
                  <div className="flex items-center gap-1.5 rounded-2xl border border-black/10 bg-white p-2 shadow-2xs focus-within:border-[var(--brand)] focus-within:ring-2 focus-within:ring-[var(--brand)]/15">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Ask SwishX to rephrase, highlight endpoints..."
                      className="flex-1 bg-transparent px-2 text-[12.5px] outline-none text-[var(--ink)]"
                    />
                    <Button
                      size="sm"
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim()}
                      className="size-7 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white p-0 flex items-center justify-center cursor-pointer shadow-xs disabled:opacity-30"
                    >
                      <Send className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: LIVE GRAPHIC ELEMENT CONTENT & STYLE INSPECTOR ── */}
            {activeTab === "edit" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="border-b border-[var(--line)] pb-3 flex items-center justify-between">
                  <div>
                    <div className="text-[9px] font-extrabold uppercase tracking-wider text-[var(--ink-muted)]">
                      Component Inspector
                    </div>
                    <h3 className="text-[15px] font-[850] text-[var(--ink)] mt-0.5 capitalize">
                      {selectedBlockId === "header"
                        ? "1. Brand & Formulation Header"
                        : selectedBlockId === "heroStat"
                        ? "2. Stat Hero (Primary Endpoint)"
                        : selectedBlockId === "moa"
                        ? "3. Cellular Mechanism of Action"
                        : selectedBlockId === "chart"
                        ? "4. EMBRACE-3 Clinical Chart"
                        : "5. Fair Balance & ISI"}
                    </h3>
                  </div>
                  <span className="rounded-full bg-[var(--tint)] border border-[var(--brand)]/30 px-2.5 py-0.5 text-[10.5px] font-extrabold text-[var(--brand-deep)]">
                    Active
                  </span>
                </div>

                {/* ── EDIT FIELDS FOR HEADER ── */}
                {selectedBlockId === "header" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-[var(--ink-2)] block mb-1">
                        Brand &amp; Molecule Title
                      </label>
                      <input
                        type="text"
                        value={data.header.title}
                        onChange={(e) =>
                          setData((prev) => ({
                            ...prev,
                            header: { ...prev.header, title: e.target.value },
                          }))
                        }
                        className="w-full rounded-xl border border-black/10 bg-[#fbfcfb] focus:bg-white p-2.5 text-[12px] font-medium focus:outline-none focus:border-[var(--brand)] shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[var(--ink-2)] block mb-1">
                        Indication &amp; Class Tagline
                      </label>
                      <textarea
                        rows={2}
                        value={data.header.subtitle}
                        onChange={(e) =>
                          setData((prev) => ({
                            ...prev,
                            header: { ...prev.header, subtitle: e.target.value },
                          }))
                        }
                        className="w-full rounded-xl border border-black/10 bg-[#fbfcfb] focus:bg-white p-2.5 text-[12px] font-medium resize-none focus:outline-none focus:border-[var(--brand)] shadow-2xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-[var(--ink-2)] block mb-1">
                          Audience Badge
                        </label>
                        <input
                          type="text"
                          value={data.header.badge}
                          onChange={(e) =>
                            setData((prev) => ({
                              ...prev,
                              header: { ...prev.header, badge: e.target.value },
                            }))
                          }
                          className="w-full rounded-xl border border-black/10 bg-[#fbfcfb] p-2 text-[11.5px]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-[var(--ink-2)] block mb-1">
                          Approval Stamp
                        </label>
                        <input
                          type="text"
                          value={data.header.approvalTag}
                          onChange={(e) =>
                            setData((prev) => ({
                              ...prev,
                              header: { ...prev.header, approvalTag: e.target.value },
                            }))
                          }
                          className="w-full rounded-xl border border-black/10 bg-[#fbfcfb] p-2 text-[11.5px]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── EDIT FIELDS FOR STAT HERO ── */}
                {selectedBlockId === "heroStat" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-[var(--ink-2)] block mb-1">
                        Category Tag
                      </label>
                      <input
                        type="text"
                        value={data.heroStat.category}
                        onChange={(e) =>
                          setData((prev) => ({
                            ...prev,
                            heroStat: { ...prev.heroStat, category: e.target.value },
                          }))
                        }
                        className="w-full rounded-xl border border-black/10 bg-[#fbfcfb] focus:bg-white p-2.5 text-[12px] font-medium focus:outline-none focus:border-[var(--brand)] shadow-2xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-[var(--ink-2)] block mb-1">
                          Hero Metric Figure
                        </label>
                        <input
                          type="text"
                          value={data.heroStat.metric}
                          onChange={(e) =>
                            setData((prev) => ({
                              ...prev,
                              heroStat: { ...prev.heroStat, metric: e.target.value },
                            }))
                          }
                          className="w-full rounded-xl border border-black/10 bg-[#fbfcfb] focus:bg-white p-2.5 text-[12px] font-extrabold focus:outline-none focus:border-[var(--brand)] shadow-2xs text-[var(--brand-deep)]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-[var(--ink-2)] block mb-1">
                          Comparison Pill
                        </label>
                        <input
                          type="text"
                          value={data.heroStat.comparison}
                          onChange={(e) =>
                            setData((prev) => ({
                              ...prev,
                              heroStat: { ...prev.heroStat, comparison: e.target.value },
                            }))
                          }
                          className="w-full rounded-xl border border-black/10 bg-[#fbfcfb] focus:bg-white p-2.5 text-[12px] font-medium focus:outline-none focus:border-[var(--brand)] shadow-2xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[var(--ink-2)] block mb-1">
                        Clinical Endpoint Narrative
                      </label>
                      <textarea
                        rows={3}
                        value={data.heroStat.detail}
                        onChange={(e) =>
                          setData((prev) => ({
                            ...prev,
                            heroStat: { ...prev.heroStat, detail: e.target.value },
                          }))
                        }
                        className="w-full rounded-xl border border-black/10 bg-[#fbfcfb] focus:bg-white p-2.5 text-[12px] font-medium resize-none focus:outline-none focus:border-[var(--brand)] shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[var(--ink-2)] block mb-1">
                        Citation Reference
                      </label>
                      <input
                        type="text"
                        value={data.heroStat.citation}
                        onChange={(e) =>
                          setData((prev) => ({
                            ...prev,
                            heroStat: { ...prev.heroStat, citation: e.target.value },
                          }))
                        }
                        className="w-full rounded-xl border border-black/10 bg-[#fbfcfb] p-2 text-[11.5px]"
                      />
                    </div>
                  </div>
                )}

                {/* ── EDIT FIELDS FOR MOA PATHWAY ── */}
                {selectedBlockId === "moa" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-[var(--ink-2)] block mb-1">
                        Mechanism Title
                      </label>
                      <input
                        type="text"
                        value={data.moa.title}
                        onChange={(e) =>
                          setData((prev) => ({
                            ...prev,
                            moa: { ...prev.moa, title: e.target.value },
                          }))
                        }
                        className="w-full rounded-xl border border-black/10 bg-[#fbfcfb] focus:bg-white p-2.5 text-[12px] font-medium focus:outline-none focus:border-[var(--brand)] shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[var(--ink-2)] block mb-1">
                        Pathway Description
                      </label>
                      <textarea
                        rows={3}
                        value={data.moa.detail}
                        onChange={(e) =>
                          setData((prev) => ({
                            ...prev,
                            moa: { ...prev.moa, detail: e.target.value },
                          }))
                        }
                        className="w-full rounded-xl border border-black/10 bg-[#fbfcfb] focus:bg-white p-2.5 text-[12px] font-medium resize-none focus:outline-none focus:border-[var(--brand)] shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[var(--ink-2)] block mb-1">
                        Pathway Steps (1, 2, 3)
                      </label>
                      <div className="space-y-1.5">
                        {data.moa.steps.map((step, idx) => (
                          <input
                            key={idx}
                            type="text"
                            value={step}
                            onChange={(e) => {
                              const nextSteps = [...data.moa.steps] as [string, string, string];
                              nextSteps[idx] = e.target.value;
                              setData((prev) => ({
                                ...prev,
                                moa: { ...prev.moa, steps: nextSteps },
                              }));
                            }}
                            className="w-full rounded-lg border border-black/10 bg-[#fbfcfb] p-2 text-[11.5px]"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── EDIT FIELDS FOR TRIAL CHART ── */}
                {selectedBlockId === "chart" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-[var(--ink-2)] block mb-1">
                        Chart / Study Title
                      </label>
                      <input
                        type="text"
                        value={data.chart.title}
                        onChange={(e) =>
                          setData((prev) => ({
                            ...prev,
                            chart: { ...prev.chart, title: e.target.value },
                          }))
                        }
                        className="w-full rounded-xl border border-black/10 bg-[#fbfcfb] focus:bg-white p-2.5 text-[12px] font-medium focus:outline-none focus:border-[var(--brand)] shadow-2xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-[var(--ink-2)] block mb-1">
                          Arm 1 Name
                        </label>
                        <input
                          type="text"
                          value={data.chart.arm1Label}
                          onChange={(e) =>
                            setData((prev) => ({
                              ...prev,
                              chart: { ...prev.chart, arm1Label: e.target.value },
                            }))
                          }
                          className="w-full rounded-xl border border-black/10 bg-[#fbfcfb] p-2 text-[11.5px]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-[var(--ink-2)] block mb-1">
                          Arm 1 % Value
                        </label>
                        <input
                          type="number"
                          value={data.chart.arm1Val}
                          onChange={(e) =>
                            setData((prev) => ({
                              ...prev,
                              chart: { ...prev.chart, arm1Val: Number(e.target.value) },
                            }))
                          }
                          className="w-full rounded-xl border border-black/10 bg-[#fbfcfb] p-2 text-[11.5px]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-[var(--ink-2)] block mb-1">
                          Arm 2 Name
                        </label>
                        <input
                          type="text"
                          value={data.chart.arm2Label}
                          onChange={(e) =>
                            setData((prev) => ({
                              ...prev,
                              chart: { ...prev.chart, arm2Label: e.target.value },
                            }))
                          }
                          className="w-full rounded-xl border border-black/10 bg-[#fbfcfb] p-2 text-[11.5px]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-[var(--ink-2)] block mb-1">
                          Arm 2 % Value
                        </label>
                        <input
                          type="number"
                          value={data.chart.arm2Val}
                          onChange={(e) =>
                            setData((prev) => ({
                              ...prev,
                              chart: { ...prev.chart, arm2Val: Number(e.target.value) },
                            }))
                          }
                          className="w-full rounded-xl border border-black/10 bg-[#fbfcfb] p-2 text-[11.5px]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── EDIT FIELDS FOR FAIR BALANCE ISI ── */}
                {selectedBlockId === "isi" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-[var(--ink-2)] block mb-1">
                        Section Headline
                      </label>
                      <input
                        type="text"
                        value={data.isi.title}
                        onChange={(e) =>
                          setData((prev) => ({
                            ...prev,
                            isi: { ...prev.isi, title: e.target.value },
                          }))
                        }
                        className="w-full rounded-xl border border-black/10 bg-[#fbfcfb] focus:bg-white p-2.5 text-[12px] font-medium focus:outline-none focus:border-[var(--brand)] shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[var(--ink-2)] block mb-1">
                        Mandatory Warnings &amp; Adverse Reactions
                      </label>
                      <textarea
                        rows={4}
                        value={data.isi.content}
                        onChange={(e) =>
                          setData((prev) => ({
                            ...prev,
                            isi: { ...prev.isi, content: e.target.value },
                          }))
                        }
                        className="w-full rounded-xl border border-black/10 bg-[#fbfcfb] focus:bg-white p-2.5 text-[12px] font-medium resize-none focus:outline-none focus:border-[var(--brand)] shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[var(--ink-2)] block mb-1">
                        Prescribing Information Linkage
                      </label>
                      <input
                        type="text"
                        value={data.isi.citation}
                        onChange={(e) =>
                          setData((prev) => ({
                            ...prev,
                            isi: { ...prev.isi, citation: e.target.value },
                          }))
                        }
                        className="w-full rounded-xl border border-black/10 bg-[#fbfcfb] p-2 text-[11.5px]"
                      />
                    </div>
                  </div>
                )}

                {/* Visual Palette Selector */}
                <div className="pt-2 border-t border-[var(--line)]">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--ink-muted)] block mb-2">
                    Primary Visual Palette
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { color: "#fd4816", label: "Coral Brand" },
                      { color: "#0f5132", label: "Clinical Emerald" },
                      { color: "#1d4ed8", label: "Precision Blue" },
                      { color: "#6b21a8", label: "Deep Purple" },
                    ].map((item) => (
                      <button
                        key={item.color}
                        type="button"
                        onClick={() => setBrandColor(item.color)}
                        style={{ background: item.color }}
                        className={cn(
                          "h-8 rounded-xl border border-black/10 shadow-2xs hover:scale-105 transition cursor-pointer relative",
                          brandColor === item.color && "ring-2 ring-black ring-offset-2"
                        )}
                        title={item.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setData(DEFAULT_INFOGRAPHIC_DATA);
                      showToast("Reset to brand dossier defaults");
                    }}
                    className="w-full text-[11.5px] font-bold gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="size-3.5" />
                    <span>Reset Component to Dossier Default</span>
                  </Button>
                </div>
              </div>
            )}

            {/* ── TAB 3: REGULATORY CLAIMS VERIFICATION (24 Grounded) ── */}
            {activeTab === "evidence" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-[11.5px] font-bold shadow-2xs">
                  <CheckCircle2 className="size-4.5 shrink-0 text-emerald-600" />
                  <div>
                    <div>100% On-Label Regulatory Coverage</div>
                    <div className="text-[10px] text-emerald-700 font-normal">
                      Every statement and number is verified against approved sources.
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {CLAIMS_LIST.map((claim) => (
                    <div
                      key={claim.id}
                      onClick={() => showToast(`Linked: ${claim.tag}`)}
                      className="p-3 rounded-xl bg-[#fbfcfb] hover:bg-white border border-black/10 hover:border-[var(--brand)] space-y-1 transition cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[var(--ink)]">{claim.tag}</span>
                        <span className="text-[9px] font-extrabold uppercase text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                          Approved
                        </span>
                      </div>
                      <p className="text-[10.5px] text-[var(--ink-2)]">{claim.desc}</p>
                      <div className="text-[9.5px] font-mono text-[var(--ink-muted)] pt-0.5">
                        {claim.source}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Export Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-black/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[var(--ink)]">Export Infographic</h3>
              <button
                onClick={() => setExportModalOpen(false)}
                className="text-[var(--ink-2)] hover:text-black cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="text-[12px] text-[var(--ink-2)]">
              Choose your export specification. PDF exports are CMYK-ready with full bleed and crop marks.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setExportModalOpen(false);
                  showToast("Downloading Print PDF (CMYK + 3mm Bleed)");
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-black/10 hover:border-[var(--brand)] text-left cursor-pointer"
              >
                <div>
                  <div className="text-[12px] font-bold">Print PDF (CMYK + 3mm Bleed)</div>
                  <div className="text-[10px] text-[var(--ink-muted)]">High-resolution for journal leave-behinds</div>
                </div>
                <Download className="size-4 text-[var(--brand)]" />
              </button>
              <button
                onClick={() => {
                  setExportModalOpen(false);
                  showToast("Downloading Vector SVG & PNG");
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-black/10 hover:border-[var(--brand)] text-left cursor-pointer"
              >
                <div>
                  <div className="text-[12px] font-bold">Vector SVG &amp; PNG</div>
                  <div className="text-[10px] text-[var(--ink-muted)]">For digital portals and email briefs</div>
                </div>
                <Download className="size-4 text-[var(--brand)]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full bg-[var(--ink)] text-white px-4 py-2 text-[12px] font-bold shadow-lg animate-in fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
