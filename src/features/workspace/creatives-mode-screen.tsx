"use client";

import { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Layers,
  Sparkles,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  BarChart3,
  FileText,
} from "lucide-react";
import { useWorkspaceStore, type CreationMode } from "@/features/workspace/workspace-store";
import { BrandDossierModal } from "@/features/workspace/brand-dossier-modal";

/* ─── Creative Showcase Samples ─────────────────────────────────────────────── */
interface CreativeSample {
  title: string;
  badge: string;
  aspect: string;
  metric: string;
  metricLabel: string;
  caption: string;
  citation: string;
  bgGradient: string;
}

const CHART_SAMPLES: CreativeSample[] = [
  {
    title: "Stat Hero · Primary Endpoint",
    badge: "Clinical Infographic",
    aspect: "A4 Print / 3:4",
    metric: "52% PASI 90",
    metricLabel: "vs 18% Placebo (p < 0.001)",
    caption: "Statistically significant skin clearance maintained through Week 52 with once-daily dosing.",
    citation: "EMBRACE-3 Pivotal Trial Readout, Table 2.4",
    bgGradient: "linear-gradient(135deg, #0c1524 0%, #14233c 60%, #1e3458 100%)",
  },
  {
    title: "Mechanism of Action (MoA) Cascade",
    badge: "Cellular Pathway",
    aspect: "16:9 Screen",
    metric: "Dual Kinase Block",
    metricLabel: "Targeted Cytokine Clearance",
    caption: "Selectively suppresses inflammatory phosphorylation without microvascular accumulation.",
    citation: "Lancet Dermatology 2024; 42:118-129",
    bgGradient: "linear-gradient(135deg, #0f231e 0%, #173830 60%, #225247 100%)",
  },
  {
    title: "License Boundary & Prescribing Cut-Off",
    badge: "Dosing & Cut-Off",
    aspect: "3:4 Tablet",
    metric: "eGFR ≥25",
    metricLabel: "mL/min/1.73m² Threshold",
    caption: "Approved indication cut-off with once-daily oral dosing protocol across all three organ domains.",
    citation: "CDSCO Prescribing Information §2.1",
    bgGradient: "linear-gradient(135deg, #24142e 0%, #3a204b 60%, #542e6d 100%)",
  },
];

const DECK_SAMPLES: CreativeSample[] = [
  {
    title: "Visual Detail Aid · Field Rep Flow",
    badge: "Interactive Detail Aid",
    aspect: "iPad 16:9",
    metric: "8 Slide Panels",
    metricLabel: "Efficacy vs Standard of Care",
    caption: "Interactive touch navigation with instant objection handling and citation drilldowns.",
    citation: "Veeva PromoMats Grounded Module §3",
    bgGradient: "linear-gradient(135deg, #101c2e 0%, #182d4b 60%, #24426e 100%)",
  },
  {
    title: "Scientific Congress Poster Readout",
    badge: "2×1m Scientific Panel",
    aspect: "Vector CMYK",
    metric: "N=613 Patients",
    metricLabel: "Kaplan-Meier Curves",
    caption: "High-density clinical study readouts with automated statistical footnotes and bleed marks.",
    citation: "AAD Congress 2026 Poster Readout",
    bgGradient: "linear-gradient(135deg, #1c1428 0%, #2d1f42 60%, #442d65 100%)",
  },
  {
    title: "Journal Advertisement Spread",
    badge: "A4 Journal Spread",
    aspect: "Print & Digital",
    metric: "21 CFR 202.1",
    metricLabel: "Full Fair Balance",
    caption: "Balanced visual hierarchy with automatic ISI placement and mandatory indication statements.",
    citation: "FDA Prescribing Information §5.2",
    bgGradient: "linear-gradient(135deg, #12221b 0%, #1c382d 60%, #274f40 100%)",
  },
];

const CHART_FEATURES = [
  "Pivotal Phase III clinical endpoints & leave-behinds",
  "3D Mechanism of Action (MoA) flows & cellular cascades",
  "Automated on-label citations from FDA / CDSCO label",
  "1-Page & 2-Page print-ready A4, 3:4 tablet & 16:9 canvas",
];

const DECK_FEATURES = [
  "Multi-panel interactive iPad detailing with objection tabs",
  "Modular Veeva PromoMats-approved presentation slides",
  "Automated claim-to-reference hyperlinking on every slide",
  "Print-ready A4 congress panels & digital interactive decks",
];

export function CreativesModeScreen() {
  const setCreationMode = useWorkspaceStore((s) => s.setCreationMode);
  const setAssetType = useWorkspaceStore((s) => s.setAssetType);
  const setVideoSubStage = useWorkspaceStore((s) => s.setVideoSubStage);
  const setView = useWorkspaceStore((s) => s.setView);
  const setBrief = useWorkspaceStore((s) => s.setBrief);

  const [chartIndex, setChartIndex] = useState(0);
  const [deckIndex, setDeckIndex] = useState(0);
  const [chartFeature, setChartFeature] = useState(0);
  const [deckFeature, setDeckFeature] = useState(0);
  const [dossierModalOpen, setDossierModalOpen] = useState(false);

  // Auto-rotate samples
  useEffect(() => {
    const t = setInterval(() => {
      setChartIndex((p) => (p + 1) % CHART_SAMPLES.length);
    }, 5500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setDeckIndex((p) => (p + 1) % DECK_SAMPLES.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const t = setInterval(() => setChartFeature((p) => (p + 1) % CHART_FEATURES.length), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setDeckFeature((p) => (p + 1) % DECK_FEATURES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const handleSelectMode = (mode: CreationMode) => {
    setAssetType("infographic");
    setCreationMode(mode);
    setBrief(
      mode === "magic-chart"
        ? "Create a high-impact clinical leave-behind infographic summarizing pivotal efficacy endpoints, mechanism of action, and licensed indication cut-offs."
        : "Create an interactive visual detail aid (VDA) slide deck for field representatives covering pivotal Phase III efficacy, safety, and objection handling."
    );
    setDossierModalOpen(true);
  };

  const handleSelectDossier = (dossierId: string) => {
    useWorkspaceStore.getState().setSourcePayload({ dossierId });
    useWorkspaceStore.getState().setVideoSubStage("intake");
    useWorkspaceStore.getState().setView("create");
    setDossierModalOpen(false);
  };

  const curChart = CHART_SAMPLES[chartIndex];
  const curDeck = DECK_SAMPLES[deckIndex];

  return (
    <div className="page-enter space-y-6 max-w-[1140px] text-left">
      {/* Header — Left-aligned matching Brand Dossiers and Video screen */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-4)", fontWeight: 800, marginBottom: 5 }}>
            Master Content Workflow
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-1px", margin: "0 0 8px" }}>
            Create Creatives with AI
          </h1>
          <p style={{ margin: 0, fontSize: 14.5, color: "var(--ink-3)", lineHeight: 1.6, maxWidth: "64ch" }}>
            Synthesize source-backed infographics, visual detail aids, congress posters, and journal ads in minutes — grounded in verified label claims.
          </p>
        </div>
      </div>

      {/* Mode Grid — 2 Engine Selection Cards (Exact 2x2 Grid Matching Video Studio) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch pt-2">
        {/* ════ CARD 1: Infographic/Chart (Start from Scratch) ════ */}
        <div
          onClick={() => handleSelectMode("magic-chart")}
          className="group relative flex flex-col rounded-card border-2 border-hair bg-card shadow-soft transition-all duration-300 hover:border-brand hover:shadow-brand-soft hover:-translate-y-1 cursor-pointer overflow-hidden text-left"
        >
          {/* Top Info & Features */}
          <div className="flex flex-col p-5 pb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-tint text-brand border border-tint-line">
                  <ImageIcon className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-[800] text-ink flex items-center gap-1.5">
                    Infographic/Chart
                  </h3>
                  <p className="text-xs text-ink-2 font-medium">Start from scratch · HCP &amp; Patient Infographic</p>
                </div>
              </div>
              <span className="rounded-full bg-tint px-2.5 py-0.5 text-caption font-bold text-brand border border-tint-line">
                Start from Scratch
              </span>
            </div>

            {/* Animated Rotating Feature ticker */}
            <div className="rounded-xl bg-subtle border border-hair p-3 text-xs text-ink-2 min-h-[44px] flex items-center gap-2">
              <div className="grid size-4 place-items-center rounded-full bg-ok-bg text-ok shrink-0">
                <Check className="size-2.5" />
              </div>
              <span className="font-semibold text-ink animate-fade-in transition-all duration-300">
                {CHART_FEATURES[chartFeature]}
              </span>
            </div>
          </div>

          {/* Bottom 16:10 Canvas */}
          <div
            className="relative w-full aspect-16/10 overflow-hidden mt-auto border-t border-hair p-5 flex flex-col justify-between"
            style={{ background: curChart.bgGradient }}
          >
            {/* Top meta bar */}
            <div className="flex items-center justify-between pointer-events-none z-10">
              <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-label font-bold text-white backdrop-blur-md border border-white/10">
                <ImageIcon className="size-3 text-brand" />
                <span>{curChart.badge}</span>
              </div>
              <div className="rounded-full bg-white/90 px-2.5 py-0.5 text-caption font-bold text-ink shadow-xs">
                {curChart.aspect}
              </div>
            </div>

            {/* Middle Stat Hero Figure */}
            <div className="my-auto py-2 z-10 pointer-events-none">
              <div className="text-label font-bold text-white/70 uppercase tracking-wider">{curChart.title}</div>
              <div className="text-hero font-black text-white leading-tight tracking-tight flex items-baseline gap-2 mt-0.5">
                <span>{curChart.metric}</span>
                <span className="text-body-lg font-semibold text-ok-on-dark">{curChart.metricLabel}</span>
              </div>
            </div>

            {/* Prev/Next buttons */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setChartIndex((p) => (p - 1 + CHART_SAMPLES.length) % CHART_SAMPLES.length);
              }}
              className="absolute left-2.5 top-1/2 z-20 -translate-y-1/2 grid size-7 place-items-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
              aria-label="Previous"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setChartIndex((p) => (p + 1) % CHART_SAMPLES.length);
              }}
              className="absolute right-2.5 top-1/2 z-20 -translate-y-1/2 grid size-7 place-items-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
              aria-label="Next"
            >
              <ChevronRight className="size-4" />
            </button>

            {/* Caption + citation */}
            <div className="z-10 pointer-events-none">
              <p className="text-body font-semibold leading-snug text-white drop-shadow-md line-clamp-2">{curChart.caption}</p>
              <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-black/60 px-2 py-0.5 text-caption font-medium text-white/85 backdrop-blur-sm border border-white/10">
                <Check className="size-2.5 text-ok-on-dark" />
                <span>{curChart.citation}</span>
              </div>
            </div>

            {/* Step Dots */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex gap-1 pointer-events-none">
              {CHART_SAMPLES.map((_, i) => (
                <span
                  key={i}
                  className={`size-1.5 rounded-full transition-all duration-300 ${
                    i === chartIndex ? "bg-brand w-4" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ════ CARD 2: Presentation/Deck (Visual Detail Aid & Slides) ════ */}
        <div
          onClick={() => handleSelectMode("magic-chart")}
          className="group relative flex flex-col rounded-card border-2 border-hair bg-card shadow-soft transition-all duration-300 hover:border-blue-500 hover:shadow-[0_16px_40px_rgba(59,130,246,0.14)] hover:-translate-y-1 cursor-pointer overflow-hidden text-left"
        >
          {/* Top Info & Features */}
          <div className="flex flex-col p-5 pb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-info-bg text-info border border-info-line">
                  <Layers className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-[800] text-ink flex items-center gap-1.5">
                    Presentation/Deck
                  </h3>
                  <p className="text-xs text-ink-2 font-medium">Visual Detail Aid &amp; Slide Panels</p>
                </div>
              </div>
              <span className="rounded-full bg-info-bg px-2.5 py-0.5 text-caption font-bold text-info border border-info-line">
                Field Force
              </span>
            </div>

            {/* Animated Rotating Feature ticker */}
            <div className="rounded-xl bg-subtle border border-hair p-3 text-xs text-ink-2 min-h-[44px] flex items-center gap-2">
              <div className="grid size-4 place-items-center rounded-full bg-info-bg text-info shrink-0">
                <Check className="size-2.5" />
              </div>
              <span className="font-semibold text-ink animate-fade-in transition-all duration-300">
                {DECK_FEATURES[deckFeature]}
              </span>
            </div>
          </div>

          {/* Bottom 16:10 Canvas */}
          <div
            className="relative w-full aspect-16/10 overflow-hidden mt-auto border-t border-hair p-5 flex flex-col justify-between"
            style={{ background: curDeck.bgGradient }}
          >
            {/* Top meta bar */}
            <div className="flex items-center justify-between pointer-events-none z-10">
              <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-label font-bold text-white backdrop-blur-md border border-white/10">
                <Layers className="size-3 text-blue-400" />
                <span>{curDeck.badge}</span>
              </div>
              <div className="rounded-full bg-white/90 px-2.5 py-0.5 text-caption font-bold text-ink shadow-xs">
                {curDeck.aspect}
              </div>
            </div>

            {/* Middle Figure */}
            <div className="my-auto py-2 z-10 pointer-events-none">
              <div className="text-label font-bold text-white/70 uppercase tracking-wider">{curDeck.title}</div>
              <div className="text-display-lg font-black text-white leading-tight tracking-tight flex items-baseline gap-2 mt-0.5">
                <span>{curDeck.metric}</span>
                <span className="text-body-lg font-semibold text-info-on-dark">{curDeck.metricLabel}</span>
              </div>
            </div>

            {/* Prev/Next buttons */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDeckIndex((p) => (p - 1 + DECK_SAMPLES.length) % DECK_SAMPLES.length);
              }}
              className="absolute left-2.5 top-1/2 z-20 -translate-y-1/2 grid size-7 place-items-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
              aria-label="Previous"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDeckIndex((p) => (p + 1) % DECK_SAMPLES.length);
              }}
              className="absolute right-2.5 top-1/2 z-20 -translate-y-1/2 grid size-7 place-items-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
              aria-label="Next"
            >
              <ChevronRight className="size-4" />
            </button>

            {/* Caption + citation */}
            <div className="z-10 pointer-events-none">
              <p className="text-body font-semibold leading-snug text-white drop-shadow-md line-clamp-2">{curDeck.caption}</p>
              <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-black/60 px-2 py-0.5 text-caption font-medium text-white/85 backdrop-blur-sm border border-white/10">
                <Check className="size-2.5 text-blue-400" />
                <span>{curDeck.citation}</span>
              </div>
            </div>

            {/* Step Dots */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex gap-1 pointer-events-none">
              {DECK_SAMPLES.map((_, i) => (
                <span
                  key={i}
                  className={`size-1.5 rounded-full transition-all duration-300 ${
                    i === deckIndex ? "bg-info-bg w-4" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Brand & Dossier Selection Pop-up Modal */}
      <BrandDossierModal
        open={dossierModalOpen}
        onClose={() => setDossierModalOpen(false)}
        onSelectDossier={handleSelectDossier}
      />
    </div>
  );
}
