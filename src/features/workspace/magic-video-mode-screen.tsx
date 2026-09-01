"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Film, UserCircle2, ArrowRight, Play, Check, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useWorkspaceStore, type CreationMode } from "@/features/workspace/workspace-store";
import { BrandDossierModal } from "@/features/workspace/brand-dossier-modal";

/* ─── Video Showcase Samples ─────────────────────────────────────────────────── */
interface VideoSample {
  title: string;
  badge: string;
  caption: string;
  citation: string;
  aspect: string;
  videoSrc?: string;
  bgGradient: string;
}

const REEL_SAMPLES: VideoSample[] = [
  {
    title: "Mechanism of Action (MoA)",
    badge: "MoA Graphics",
    caption: "\u201CDual inhibition preserves renal perfusion while improving glycemic metrics.\u201D",
    citation: "Journal of Clinical Cardiology 2024",
    aspect: "16:9 4K",
    videoSrc: "/reel-moa.mp4",
    bgGradient: "linear-gradient(135deg, #09101d 0%, #152238 60%, #1f3557 100%)",
  },
  {
    title: "Phase III Efficacy Outcomes",
    badge: "Clinical Data",
    caption: "\u201CStatistically significant 38% reduction in primary MACE composite at 24 weeks.\u201D",
    citation: "EMBRACE-3 Pivotal Trial readout, Table 2.4",
    aspect: "16:9 4K",
    videoSrc: "/21617-319452308_medium.mp4",
    bgGradient: "linear-gradient(135deg, #180924 0%, #2e1245 60%, #4a1d6e 100%)",
  },
  {
    title: "Safety & Tolerability Profile",
    badge: "Safety Profile",
    caption: "\u201CConsistent safety profile aligned with baseline expectations across all cohorts.\u201D",
    citation: "FDA Prescribing Information \u00a75.2",
    aspect: "16:9 4K",
    videoSrc: "/27019-361107952_medium.mp4",
    bgGradient: "linear-gradient(135deg, #0a1f18 0%, #13382c 60%, #1d5442 100%)",
  },
  {
    title: "Cellular Delivery Vector",
    badge: "Targeted Delivery",
    caption: "\u201CHigh-affinity receptor binding enables rapid endocytosis without systemic accumulation.\u201D",
    citation: "Lancet Oncology 2024; 25: 112-124",
    aspect: "16:9 4K",
    videoSrc: "/40781-426939561_medium.mp4",
    bgGradient: "linear-gradient(135deg, #1b1622 0%, #352b42 60%, #524266 100%)",
  },
];

const AVATAR_SAMPLES: VideoSample[] = [
  {
    title: "KOL Explainer \u2014 Dr. Ayesha Vance",
    badge: "Doctor Avatar",
    caption: "\u201COnce-daily oral administration significantly improves patient compliance over injections.\u201D",
    citation: "Dr. Ayesha Vance, VP Clinical Affairs",
    aspect: "9:16 Mobile",
    videoSrc: "/avatar-showcase.mp4",
    bgGradient: "linear-gradient(135deg, #1a1622 0%, #2c253b 60%, #443a5c 100%)",
  },
  {
    title: "Tecentriq Clinical Dialogue",
    badge: "KOL Presenter",
    caption: "\u201CPivotal trial results confirm durable response rates in PD-L1 positive patient cohorts.\u201D",
    citation: "Genentech Oncology Advisory Board 2024",
    aspect: "9:16 Mobile",
    videoSrc: "/tecentriq-reel.mp4",
    bgGradient: "linear-gradient(135deg, #221a16 0%, #3b2a25 60%, #5c413a 100%)",
  },
  {
    title: "Brevanta Patient Journey",
    badge: "Clinical Twin",
    caption: "\u201CManaging my treatment regimen became effortless after switching to weekly dosing.\u201D",
    citation: "Validated Patient Journey Program \u00a74",
    aspect: "9:16 Mobile",
    videoSrc: "/Brevanta final draft-web.mp4",
    bgGradient: "linear-gradient(135deg, #162022 0%, #25373b 60%, #3a555c 100%)",
  },
];

const REEL_FEATURES = [
  "3D Mechanism of Action (MoA) scenes",
  "Automated MLR citations from FDA/EMA label",
  "16:9, 9:16 & 1:1 multi-format outputs",
];

const AVATAR_FEATURES = [
  "Verified KOL doctor avatars",
  "Picture-in-picture trial slide overlays",
  "Medical-grade lip-sync & phonetics",
  "Studio 16:9 or mobile 9:16 briefings",
];

export function MagicVideoModeScreen() {
  const setCreationMode = useWorkspaceStore((s) => s.setCreationMode);
  const setPresentationMode = useWorkspaceStore((s) => s.setPresentationMode);
  const setVideoSubStage = useWorkspaceStore((s) => s.setVideoSubStage);

  const [reelIndex, setReelIndex] = useState(0);
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [reelFeature, setReelFeature] = useState(0);
  const [avatarFeature, setAvatarFeature] = useState(0);
  const [dossierModalOpen, setDossierModalOpen] = useState(false);

  const reelVideoRef = useRef<HTMLVideoElement>(null);
  const avatarVideoRef = useRef<HTMLVideoElement>(null);

  // Auto-play videos automatically
  useEffect(() => {
    if (reelVideoRef.current) {
      reelVideoRef.current.currentTime = 0;
      reelVideoRef.current.play().catch(() => {});
    }
  }, [reelIndex]);

  useEffect(() => {
    if (avatarVideoRef.current) {
      avatarVideoRef.current.currentTime = 0;
      avatarVideoRef.current.play().catch(() => {});
    }
  }, [avatarIndex]);

  // Rotate video samples every 5.5s automatically
  useEffect(() => {
    const t = setInterval(() => {
      setReelIndex((p) => (p + 1) % REEL_SAMPLES.length);
    }, 5500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setAvatarIndex((p) => (p + 1) % AVATAR_SAMPLES.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  // Rotate feature chips every 4s
  useEffect(() => {
    const t = setInterval(() => setReelFeature((p) => (p + 1) % REEL_FEATURES.length), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setAvatarFeature((p) => (p + 1) % AVATAR_FEATURES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const handleSelectMode = (mode: CreationMode) => {
    setCreationMode(mode);
    if (mode === "magic-avatar") {
      setPresentationMode("presenter");
    } else {
      setPresentationMode("narrated");
    }
    setDossierModalOpen(true);
  };

  const curReel = REEL_SAMPLES[reelIndex];
  const curAvatar = AVATAR_SAMPLES[avatarIndex];

  return (
    <div className="page-enter space-y-6 max-w-[1140px]">
      {/* Header — Left-aligned matching Brand Dossiers screen */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink-4)", fontWeight: 800, marginBottom: 5 }}>
            Master Content Workflow
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-1px", margin: "0 0 8px" }}>
            Create Videos with AI
          </h1>
          <p style={{ margin: 0, fontSize: 14.5, color: "var(--ink-3)", lineHeight: 1.6, maxWidth: "64ch" }}>
            Synthesize source-backed MoA animations, doctor avatars, and clinical evidence reels in minutes — grounded in verified label claims.
          </p>
        </div>
      </div>

      {/* Mode Grid — 2 Engine Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch pt-2">
        {/* ════ CARD 1: Video (Start from Scratch) ════ */}
        <div
          onClick={() => handleSelectMode("magic-reel")}
          className="group relative flex flex-col rounded-[24px] border-2 border-black/[0.08] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all duration-300 hover:border-[var(--brand)] hover:shadow-[0_16px_40px_rgba(253,72,22,0.14)] hover:-translate-y-1 cursor-pointer overflow-hidden text-left"
        >
          {/* Top Info & Features */}
          <div className="flex flex-col p-5 pb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-[var(--tint)] text-[var(--brand)] border border-[var(--tint-line)]">
                  <Film className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-[800] text-[var(--ink)] flex items-center gap-1.5">
                    Video
                  </h3>
                  <p className="text-xs text-[var(--ink-2)] font-medium">Start from scratch · Cinematic Medical Explainer</p>
                </div>
              </div>
              <span className="rounded-full bg-[var(--tint)] px-2.5 py-0.5 text-[10.5px] font-bold text-[var(--brand)] border border-[var(--tint-line)]">
                Start from Scratch
              </span>
            </div>

            {/* Animated Rotating Feature ticker */}
            <div className="rounded-xl bg-[#f8faf8] border border-black/[0.04] p-3 text-xs text-[var(--ink-2)] min-h-[44px] flex items-center gap-2">
              <div className="grid size-4 place-items-center rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                <Check className="size-2.5" />
              </div>
              <span className="font-semibold text-[var(--ink)] animate-fade-in transition-all duration-300">
                {REEL_FEATURES[reelFeature]}
              </span>
            </div>
          </div>

          {/* Bottom 16:9 Video Canvas */}
          <div
            className="relative w-full aspect-16/10 overflow-hidden mt-auto border-t border-black/[0.06]"
            style={{ background: curReel.bgGradient }}
          >
            {curReel.videoSrc && (
              <video
                ref={reelVideoRef}
                src={curReel.videoSrc}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 h-full w-full object-cover opacity-85"
              />
            )}

            {/* Top meta bar inside video */}
            <div className="absolute left-3.5 top-3.5 right-3.5 z-10 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md border border-white/10">
                <Film className="size-3 text-[var(--brand)]" />
                <span>{curReel.badge}</span>
              </div>
              <div className="rounded-full bg-white/90 px-2.5 py-0.5 text-[10.5px] font-bold text-[var(--ink)] shadow-xs">
                {curReel.aspect}
              </div>
            </div>

            {/* Standard Neutral Center Play (Clean white) */}
            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="grid size-11 place-items-center rounded-full bg-white/90 text-black shadow-md backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                <Play className="size-4 fill-black ml-0.5" />
              </div>
            </div>

            {/* Prev/Next chevrons */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setReelIndex((p) => (p - 1 + REEL_SAMPLES.length) % REEL_SAMPLES.length);
              }}
              className="absolute left-2.5 top-1/2 z-20 -translate-y-1/2 grid size-7 place-items-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Previous"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setReelIndex((p) => (p + 1) % REEL_SAMPLES.length);
              }}
              className="absolute right-2.5 top-1/2 z-20 -translate-y-1/2 grid size-7 place-items-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Next"
            >
              <ChevronRight className="size-4" />
            </button>

            {/* Caption + citation lower-third */}
            <div className="absolute bottom-8 left-4 right-4 z-10 pointer-events-none">
              <p className="text-[12.5px] font-semibold leading-snug text-white drop-shadow-md line-clamp-2">{curReel.caption}</p>
              <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white/85 backdrop-blur-sm border border-white/10">
                <Check className="size-2.5 text-emerald-400" />
                <span>{curReel.citation}</span>
              </div>
            </div>

            {/* Step Dots */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
              {REEL_SAMPLES.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === reelIndex ? "w-5 bg-[var(--brand)]" : "w-1.5 bg-white/40"}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ════ CARD 2: MagicAvatar™ ════ */}
        <div
          onClick={() => handleSelectMode("magic-avatar")}
          className="group relative flex flex-col rounded-[24px] border-2 border-black/[0.08] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all duration-300 hover:border-[var(--brand)] hover:shadow-[0_16px_40px_rgba(253,72,22,0.14)] hover:-translate-y-1 cursor-pointer overflow-hidden text-left"
        >
          {/* Top Info & Features */}
          <div className="flex flex-col p-5 pb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-[var(--tint)] text-[var(--brand)] border border-[var(--tint-line)]">
                  <UserCircle2 className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-[800] text-[var(--ink)] flex items-center gap-1.5">
                    Avatar Video
                  </h3>
                  <p className="text-xs text-[var(--ink-2)] font-medium">Clinical Presenter &amp; Digital Twin</p>
                </div>
              </div>
              <span className="rounded-full bg-[var(--tint)] px-2.5 py-0.5 text-[10.5px] font-bold text-[var(--brand)] border border-[var(--tint-line)]">
                KOL Digital Twin
              </span>
            </div>

            {/* Animated Rotating Feature ticker */}
            <div className="rounded-xl bg-[#f8faf8] border border-black/[0.04] p-3 text-xs text-[var(--ink-2)] min-h-[44px] flex items-center gap-2">
              <div className="grid size-4 place-items-center rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                <Check className="size-2.5" />
              </div>
              <span className="font-semibold text-[var(--ink)] animate-fade-in transition-all duration-300">
                {AVATAR_FEATURES[avatarFeature]}
              </span>
            </div>
          </div>

          {/* Bottom Video Canvas */}
          <div
            className="relative w-full aspect-16/10 overflow-hidden mt-auto border-t border-black/[0.06]"
            style={{ background: curAvatar.bgGradient }}
          >
            {curAvatar.videoSrc && (
              <video
                ref={avatarVideoRef}
                src={curAvatar.videoSrc}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 h-full w-full object-cover opacity-85"
              />
            )}

            {/* Top meta bar inside video */}
            <div className="absolute left-3.5 top-3.5 right-3.5 z-10 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md border border-white/10">
                <UserCircle2 className="size-3 text-[var(--brand)]" />
                <span>{curAvatar.badge}</span>
              </div>
              <div className="rounded-full bg-white/90 px-2.5 py-0.5 text-[10.5px] font-bold text-[var(--ink)] shadow-xs">
                {curAvatar.aspect}
              </div>
            </div>

            {/* Standard Neutral Center Play (Clean white) */}
            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="grid size-11 place-items-center rounded-full bg-white/90 text-black shadow-md backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                <Play className="size-4 fill-black ml-0.5" />
              </div>
            </div>

            {/* Prev/Next chevrons */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setAvatarIndex((p) => (p - 1 + AVATAR_SAMPLES.length) % AVATAR_SAMPLES.length);
              }}
              className="absolute left-2.5 top-1/2 z-20 -translate-y-1/2 grid size-7 place-items-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Previous"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setAvatarIndex((p) => (p + 1) % AVATAR_SAMPLES.length);
              }}
              className="absolute right-2.5 top-1/2 z-20 -translate-y-1/2 grid size-7 place-items-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Next"
            >
              <ChevronRight className="size-4" />
            </button>

            {/* Caption + citation lower-third */}
            <div className="absolute bottom-8 left-4 right-4 z-10 pointer-events-none">
              <p className="text-[12.5px] font-semibold leading-snug text-white drop-shadow-md line-clamp-2">{curAvatar.caption}</p>
              <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white/85 backdrop-blur-sm border border-white/10">
                <Check className="size-2.5 text-emerald-400" />
                <span>{curAvatar.citation}</span>
              </div>
            </div>

            {/* Step Dots */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
              {AVATAR_SAMPLES.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === avatarIndex ? "w-5 bg-[var(--brand)]" : "w-1.5 bg-white/40"}`}
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
      />
    </div>
  );
}
