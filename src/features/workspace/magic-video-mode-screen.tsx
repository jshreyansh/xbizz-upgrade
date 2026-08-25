"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Film, Sparkles, UserCheck, Play, ShieldCheck } from "lucide-react";
import { useWorkspaceStore, type CreationMode } from "@/features/workspace/workspace-store";

interface SampleVideo {
  badge: string;
  aspect: string;
  gradient: string;
  glow: string;
  caption: string;
  citation: string;
}

const REEL_SAMPLES: SampleVideo[] = [
  {
    badge: "Cinematic Reel",
    aspect: "16:9 4K",
    gradient: "linear-gradient(145deg,#0c1626,#050a14 55%,#1c0c04)",
    glow: "radial-gradient(circle at 50% 40%, rgba(253,72,22,.55), transparent 68%)",
    caption: "\u201cVelmora showed a 24% relative risk reduction in primary CV endpoints.\u201d",
    citation: "CLARITY-CV Trial \u00b7 NCT04892110",
  },
  {
    badge: "MoA Graphics",
    aspect: "16:9 4K",
    gradient: "linear-gradient(145deg,#0a1f1a,#040e0b 55%,#17240f)",
    glow: "radial-gradient(circle at 50% 40%, rgba(34,192,122,.45), transparent 68%)",
    caption: "\u201cDual inhibition preserves renal perfusion while improving glycemic metrics.\u201d",
    citation: "Journal of Clinical Cardiology 2024",
  },
  {
    badge: "Safety Profile",
    aspect: "9:16 Mobile",
    gradient: "linear-gradient(145deg,#1b1028,#080512 55%,#220b18)",
    glow: "radial-gradient(circle at 50% 40%, rgba(155,107,255,.45), transparent 68%)",
    caption: "\u201cConsistent safety profile across 12,400 patients in multi-center trials.\u201d",
    citation: "FDA Prescribing Information \u00a75.1",
  },
];

const AVATAR_SAMPLES: SampleVideo[] = [
  {
    badge: "KOL Presenter",
    aspect: "16:9 Studio",
    gradient: "linear-gradient(145deg,#0f172a,#060913 55%,#081724)",
    glow: "radial-gradient(circle at 50% 40%, rgba(59,130,246,.5), transparent 68%)",
    caption: "\u201cLet\u2019s examine the primary endpoint readouts from the phase III trial.\u201d",
    citation: "Dr. Maya Kapoor \u00b7 Cardiologist, Harvard Medical",
  },
  {
    badge: "Digital Twin",
    aspect: "16:9 Studio",
    gradient: "linear-gradient(145deg,#1d140e,#0b0704 55%,#221206)",
    glow: "radial-gradient(circle at 50% 40%, rgba(255,138,76,.45), transparent 68%)",
    caption: "\u201cSecondary endpoints confirmed sustained biomarker control through week 52.\u201d",
    citation: "Dr. Rohan Mehta \u00b7 Medical Director",
  },
  {
    badge: "Doctor Briefing",
    aspect: "9:16 Presenter",
    gradient: "linear-gradient(145deg,#121d18,#050d0a 55%,#091d14)",
    glow: "radial-gradient(circle at 50% 40%, rgba(18,120,74,.5), transparent 68%)",
    caption: "\u201cOnce-daily oral administration without dietary restrictions supports compliance.\u201d",
    citation: "Dr. Aisha Shah \u00b7 Clinical Pharmacologist",
  },
];

const REEL_FEATURES = [
  "3D Mechanism of Action (MoA) scenes",
  "Broadcast voiceover & medical soundtrack",
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
  const setVideoSubStage = useWorkspaceStore((s) => s.setVideoSubStage);

  const [reelIndex, setReelIndex] = useState(0);
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [reelFeature, setReelFeature] = useState(0);
  const [avatarFeature, setAvatarFeature] = useState(0);
  const [reelHovered, setReelHovered] = useState(false);
  const [avatarHovered, setAvatarHovered] = useState(false);

  // Rotate video samples
  useEffect(() => {
    if (reelHovered) return;
    const t = setInterval(() => setReelIndex((p) => (p + 1) % REEL_SAMPLES.length), 4500);
    return () => clearInterval(t);
  }, [reelHovered]);

  useEffect(() => {
    if (avatarHovered) return;
    const t = setInterval(() => setAvatarIndex((p) => (p + 1) % AVATAR_SAMPLES.length), 5000);
    return () => clearInterval(t);
  }, [avatarHovered]);

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
    setVideoSubStage("source-select");
  };

  const curReel = REEL_SAMPLES[reelIndex];
  const curAvatar = AVATAR_SAMPLES[avatarIndex];

  return (
    <div className="mx-auto w-full max-w-[960px] py-2 sm:py-4">
      {/* Editorial Header */}
      <div className="text-center max-w-[680px] mx-auto mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--tint)] px-3.5 py-1 text-[11.5px] font-bold uppercase tracking-wider text-[var(--brand-deep)] border border-[var(--tint-line)] shadow-sm">
          <Sparkles className="size-3.5 text-[var(--brand)]" />
          <span>AI Video Engines</span>
        </div>
        <h1 className="mt-3 text-[28px] font-[800] tracking-tight text-[var(--ink)] sm:text-[34px] leading-[1.18]">
          How do you want to create your video?
        </h1>
        <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--ink-3)]">
          Select a production engine — scripting, scenes, voice, and citations are generated automatically.
        </p>
      </div>

      {/* 2 Airbnb-style compact cards */}
      <div className="grid gap-6 md:grid-cols-2 items-stretch">

        {/* ── CARD 1: MagicReel™ ── */}
        <div
          onMouseEnter={() => setReelHovered(true)}
          onMouseLeave={() => setReelHovered(false)}
          onClick={() => handleSelectMode("magic-reel")}
          className="group relative flex flex-col rounded-[22px] border border-[var(--hair-2)] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--brand)] hover:shadow-[0_12px_32px_-8px_rgba(253,72,22,0.2)] cursor-pointer overflow-hidden"
        >
          {/* Cinema Preview — dominant */}
          <div
            className="relative w-full overflow-hidden"
            style={{ height: 260, background: curReel.gradient }}
          >
            {/* Ambient Glow */}
            <div
              className="absolute inset-0 transition-all duration-700"
              style={{ background: curReel.glow, filter: "blur(36px)" }}
            />

            {/* Top meta bar */}
            <div className="absolute left-3.5 top-3.5 right-3.5 z-10 flex items-center justify-between">
              <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md border border-white/10">
                <Film className="size-3 text-[var(--brand-2)]" />
                <span>{curReel.badge}</span>
              </div>
              <div className="rounded-full bg-white/90 px-2.5 py-0.5 text-[10.5px] font-bold text-[var(--ink)] shadow-sm">
                {curReel.aspect}
              </div>
            </div>

            {/* Center Play */}
            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
              <div className="grid size-12 place-items-center rounded-full bg-gradient-to-tr from-[var(--brand-deep)] to-[var(--brand)] text-white shadow-[0_8px_24px_rgba(253,72,22,.7)] transition-transform duration-300 group-hover:scale-110">
                <Play className="size-5 fill-white ml-0.5" />
              </div>
            </div>

            {/* Prev/Next chevrons */}
            <button type="button" onClick={(e) => { e.stopPropagation(); setReelIndex((p) => (p - 1 + REEL_SAMPLES.length) % REEL_SAMPLES.length); }}
              className="absolute left-2.5 top-1/2 z-20 -translate-y-1/2 grid size-7 place-items-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100" aria-label="Previous">
              <ChevronLeft className="size-4" />
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); setReelIndex((p) => (p + 1) % REEL_SAMPLES.length); }}
              className="absolute right-2.5 top-1/2 z-20 -translate-y-1/2 grid size-7 place-items-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100" aria-label="Next">
              <ChevronRight className="size-4" />
            </button>

            {/* Caption + citation lower-third */}
            <div className="absolute bottom-8 left-4 right-4 z-10">
              <p className="text-[12.5px] font-semibold leading-snug text-white drop-shadow-md line-clamp-2">{curReel.caption}</p>
              <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-0.5 text-[9.5px] font-bold text-[var(--brand-2)] backdrop-blur-md border border-white/10">
                <ShieldCheck className="size-3" />
                <span>{curReel.citation}</span>
              </div>
            </div>

            {/* Carousel dots */}
            <div className="absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {REEL_SAMPLES.map((_, i) => (
                <button key={i} type="button" onClick={(e) => { e.stopPropagation(); setReelIndex(i); }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${reelIndex === i ? "w-5 bg-[var(--brand)]" : "w-2 bg-white/40 hover:bg-white/70"}`}
                  aria-label={`Sample ${i + 1}`} />
              ))}
            </div>
          </div>

          {/* Card info — compact */}
          <div className="flex items-center justify-between gap-3 px-4 pt-3.5 pb-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-[var(--tint)] text-[var(--brand)] border border-[var(--tint-line)]">
                <Film className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-[800] tracking-tight text-[var(--ink)] leading-none">MagicReel™</p>
                <p className="mt-0.5 text-[11.5px] text-[var(--ink-muted)] font-medium">Cinematic Medical Explainer</p>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-[var(--tint)] px-2.5 py-0.5 text-[10.5px] font-bold text-[var(--brand-deep)] border border-[var(--tint-line)]">
              Most Popular
            </span>
          </div>

          {/* Auto-rotating feature chip */}
          <div className="px-4 pb-4 pt-2">
            <div className="flex items-center gap-2 rounded-[10px] bg-[#f7f8f6] border border-[var(--hair)] px-3 py-2 min-h-[36px]">
              <div className="grid size-4 shrink-0 place-items-center rounded-full bg-[var(--ok-bg)] text-[var(--ok)]">
                <svg viewBox="0 0 12 12" className="size-2.5 fill-current"><path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span key={reelFeature} className="text-[12.5px] font-semibold text-[var(--ink-2)] animate-[fadeIn_0.4s_ease]">
                {REEL_FEATURES[reelFeature]}
              </span>
            </div>
            <button
              type="button"
              className="focus-ring mt-3 flex h-[42px] w-full items-center justify-center gap-2 rounded-[12px] bg-[var(--brand)] text-[13.5px] font-bold text-white shadow-[0_6px_18px_-4px_rgba(253,72,22,0.55)] transition-all duration-200 hover:bg-[var(--brand-deep)]"
            >
              Choose MagicReel™ →
            </button>
          </div>
        </div>

        {/* ── CARD 2: MagicAvatar™ ── */}
        <div
          onMouseEnter={() => setAvatarHovered(true)}
          onMouseLeave={() => setAvatarHovered(false)}
          onClick={() => handleSelectMode("magic-avatar")}
          className="group relative flex flex-col rounded-[22px] border border-[var(--hair-2)] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2563eb] hover:shadow-[0_12px_32px_-8px_rgba(37,99,235,0.2)] cursor-pointer overflow-hidden"
        >
          {/* Cinema Preview — dominant */}
          <div
            className="relative w-full overflow-hidden"
            style={{ height: 260, background: curAvatar.gradient }}
          >
            {/* Ambient Glow */}
            <div
              className="absolute inset-0 transition-all duration-700"
              style={{ background: curAvatar.glow, filter: "blur(36px)" }}
            />

            {/* Top meta bar */}
            <div className="absolute left-3.5 top-3.5 right-3.5 z-10 flex items-center justify-between">
              <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md border border-white/10">
                <UserCheck className="size-3 text-[#60a5fa]" />
                <span>{curAvatar.badge}</span>
              </div>
              <div className="rounded-full bg-white/90 px-2.5 py-0.5 text-[10.5px] font-bold text-[var(--ink)] shadow-sm">
                {curAvatar.aspect}
              </div>
            </div>

            {/* Center Play */}
            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
              <div className="grid size-12 place-items-center rounded-full bg-gradient-to-tr from-[#1d4ed8] to-[#2563eb] text-white shadow-[0_8px_24px_rgba(37,99,235,.7)] transition-transform duration-300 group-hover:scale-110">
                <Play className="size-5 fill-white ml-0.5" />
              </div>
            </div>

            {/* Prev/Next chevrons */}
            <button type="button" onClick={(e) => { e.stopPropagation(); setAvatarIndex((p) => (p - 1 + AVATAR_SAMPLES.length) % AVATAR_SAMPLES.length); }}
              className="absolute left-2.5 top-1/2 z-20 -translate-y-1/2 grid size-7 place-items-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100" aria-label="Previous">
              <ChevronLeft className="size-4" />
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); setAvatarIndex((p) => (p + 1) % AVATAR_SAMPLES.length); }}
              className="absolute right-2.5 top-1/2 z-20 -translate-y-1/2 grid size-7 place-items-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100" aria-label="Next">
              <ChevronRight className="size-4" />
            </button>

            {/* Caption + citation lower-third */}
            <div className="absolute bottom-8 left-4 right-4 z-10">
              <p className="text-[12.5px] font-semibold leading-snug text-white drop-shadow-md line-clamp-2">{curAvatar.caption}</p>
              <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-0.5 text-[9.5px] font-bold text-[#93c5fd] backdrop-blur-md border border-white/10">
                <UserCheck className="size-3" />
                <span>{curAvatar.citation}</span>
              </div>
            </div>

            {/* Carousel dots */}
            <div className="absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {AVATAR_SAMPLES.map((_, i) => (
                <button key={i} type="button" onClick={(e) => { e.stopPropagation(); setAvatarIndex(i); }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${avatarIndex === i ? "w-5 bg-[#3b82f6]" : "w-2 bg-white/40 hover:bg-white/70"}`}
                  aria-label={`Sample ${i + 1}`} />
              ))}
            </div>
          </div>

          {/* Card info — compact */}
          <div className="flex items-center justify-between gap-3 px-4 pt-3.5 pb-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-[#eff6ff] text-[#2563eb] border border-[#dbeafe]">
                <UserCheck className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-[800] tracking-tight text-[var(--ink)] leading-none">MagicAvatar™</p>
                <p className="mt-0.5 text-[11.5px] text-[var(--ink-muted)] font-medium">Clinical Presenter &amp; KOLs</p>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-[#eff6ff] px-2.5 py-0.5 text-[10.5px] font-bold text-[#1d4ed8] border border-[#dbeafe]">
              Digital Twin
            </span>
          </div>

          {/* Auto-rotating feature chip */}
          <div className="px-4 pb-4 pt-2">
            <div className="flex items-center gap-2 rounded-[10px] bg-[#f7f8f6] border border-[var(--hair)] px-3 py-2 min-h-[36px]">
              <div className="grid size-4 shrink-0 place-items-center rounded-full bg-[#eff6ff] text-[#2563eb]">
                <svg viewBox="0 0 12 12" className="size-2.5 fill-current"><path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span key={avatarFeature} className="text-[12.5px] font-semibold text-[var(--ink-2)] animate-[fadeIn_0.4s_ease]">
                {AVATAR_FEATURES[avatarFeature]}
              </span>
            </div>
            <button
              type="button"
              className="focus-ring mt-3 flex h-[42px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#2563eb] text-[13.5px] font-bold text-white shadow-[0_6px_18px_-4px_rgba(37,99,235,0.55)] transition-all duration-200 hover:bg-[#1d4ed8]"
            >
              Choose MagicAvatar™ →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
