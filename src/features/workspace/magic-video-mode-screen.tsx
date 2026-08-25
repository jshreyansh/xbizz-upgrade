"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Film, Sparkles, UserCheck, Compass, Check, Play, Volume2 } from "lucide-react";
import { useWorkspaceStore, type CreationMode } from "@/features/workspace/workspace-store";

interface SampleVideo {
  title: string;
  badge: string;
  aspect: string;
  duration: string;
  gradient: string;
  glow: string;
  caption: string;
  citation: string;
  currentTime: string;
  totalTime: string;
  progressPercent: number;
}

const REEL_SAMPLES: SampleVideo[] = [
  {
    title: "Velmora Risk Reduction Explainer",
    badge: "MagicReel™",
    aspect: "9:16 HD",
    duration: "60s",
    gradient: "linear-gradient(155deg,#0c1626,#050a14 55%,#1c0c04)",
    glow: "radial-gradient(circle at 50% 40%, rgba(253,72,22,.5), transparent 70%)",
    caption: "“Velmora demonstrated a 24% relative risk reduction in primary CV endpoints.”",
    citation: "[1] CLARITY-CV NCT04892110",
    currentTime: "0:24",
    totalTime: "1:00",
    progressPercent: 40,
  },
  {
    title: "Mechanism of Action (MoA) Visual",
    badge: "MagicReel™",
    aspect: "16:9 4K",
    duration: "45s",
    gradient: "linear-gradient(155deg,#0a1f1a,#040e0b 55%,#17240f)",
    glow: "radial-gradient(circle at 50% 40%, rgba(34,192,122,.45), transparent 70%)",
    caption: "“Targeted SGLT2 inhibition preserves renal perfusion while improving glycemic metrics.”",
    citation: "[2] Journal of Cardiology 2024",
    currentTime: "0:18",
    totalTime: "0:45",
    progressPercent: 40,
  },
  {
    title: "Patient Safety & Tolerability Brief",
    badge: "MagicReel™",
    aspect: "1:1 Square",
    duration: "90s",
    gradient: "linear-gradient(155deg,#1b1028,#080512 55%,#220b18)",
    glow: "radial-gradient(circle at 50% 40%, rgba(155,107,255,.45), transparent 70%)",
    caption: "“Consistent tolerability profile across 12,400 patients in double-blind trials.”",
    citation: "[3] FDA Approved Label §5.1",
    currentTime: "0:42",
    totalTime: "1:30",
    progressPercent: 46,
  },
];

const AVATAR_SAMPLES: SampleVideo[] = [
  {
    title: "Dr. Maya Kapoor · Clinical Briefing",
    badge: "MagicAvatar™",
    aspect: "9:16 Presenter",
    duration: "60s",
    gradient: "linear-gradient(155deg,#0f172a,#060913 55%,#081724)",
    glow: "radial-gradient(circle at 50% 40%, rgba(59,130,246,.5), transparent 70%)",
    caption: "“Hello colleagues. Today let's examine the subgroup readouts from CLARITY-CV.”",
    citation: "Dr. Maya Kapoor · Dermatologist",
    currentTime: "0:20",
    totalTime: "1:00",
    progressPercent: 33,
  },
  {
    title: "Dr. Rohan Mehta · Phase III Breakdown",
    badge: "MagicAvatar™",
    aspect: "16:9 Studio",
    duration: "90s",
    gradient: "linear-gradient(155deg,#1d140e,#0b0704 55%,#221206)",
    glow: "radial-gradient(circle at 50% 40%, rgba(255,138,76,.45), transparent 70%)",
    caption: "“The secondary endpoints confirmed sustained glycemic control through week 52.”",
    citation: "Dr. Rohan Mehta · Cardiologist",
    currentTime: "0:36",
    totalTime: "1:30",
    progressPercent: 40,
  },
  {
    title: "Dr. Aisha Shah · Dosing & Titration",
    badge: "MagicAvatar™",
    aspect: "9:16 Presenter",
    duration: "45s",
    gradient: "linear-gradient(155deg,#121d18,#050d0a 55%,#091d14)",
    glow: "radial-gradient(circle at 50% 40%, rgba(18,120,74,.5), transparent 70%)",
    caption: "“Once-daily oral administration without food restrictions supports adherence.”",
    citation: "Dr. Aisha Shah · Medical Director",
    currentTime: "0:15",
    totalTime: "0:45",
    progressPercent: 33,
  },
];

export function MagicVideoModeScreen() {
  const setCreationMode = useWorkspaceStore((s) => s.setCreationMode);
  const setVideoSubStage = useWorkspaceStore((s) => s.setVideoSubStage);

  const [reelIndex, setReelIndex] = useState(0);
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [reelHovered, setReelHovered] = useState(false);
  const [avatarHovered, setAvatarHovered] = useState(false);

  useEffect(() => {
    if (reelHovered) return;
    const interval = setInterval(() => {
      setReelIndex((prev) => (prev + 1) % REEL_SAMPLES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [reelHovered]);

  useEffect(() => {
    if (avatarHovered) return;
    const interval = setInterval(() => {
      setAvatarIndex((prev) => (prev + 1) % AVATAR_SAMPLES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [avatarHovered]);

  const handleSelectMode = (mode: CreationMode) => {
    setCreationMode(mode);
    setVideoSubStage("source-select");
  };

  const curReel = REEL_SAMPLES[reelIndex];
  const curAvatar = AVATAR_SAMPLES[avatarIndex];

  return (
    <div className="page-enter mx-auto w-full max-w-[1240px]">
      {/* Editorial Header inspired by Onboarding */}
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--tint)] px-3 py-1 text-[11.5px] font-bold uppercase tracking-wider text-[var(--brand-deep)] border border-[var(--tint-line)]">
            <Sparkles className="size-3.5 text-[var(--brand)]" /> Video Creation Suite
          </span>
        </div>
        <h1 className="mt-3 text-[30px] font-[800] tracking-tight text-[var(--ink)] sm:text-[36px]">
          How do you want to create your video?
        </h1>
        <p className="mt-1.5 text-[15.5px] text-[var(--ink-3)] max-w-[680px]">
          Select an AI video engine. Scripting, visual scenes, voice talent, and regulatory citations are generated from your source material.
        </p>
      </div>

      {/* 3 Masterclass Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* ── CARD 1: MagicReel™ ── */}
        <div
          onMouseEnter={() => setReelHovered(true)}
          onMouseLeave={() => setReelHovered(false)}
          onClick={() => handleSelectMode("magic-reel")}
          className="group relative flex flex-col rounded-[24px] border border-[var(--hair-2)] bg-white p-3 shadow-[var(--sh-1)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--brand)] hover:shadow-[var(--sh-3)] cursor-pointer"
        >
          {/* Inner Cinema Screen */}
          <div
            className="relative h-[224px] w-full overflow-hidden rounded-[18px] border border-white/10"
            style={{ background: curReel.gradient }}
          >
            {/* Ambient Glow */}
            <div
              className="absolute inset-0 transition-all duration-700"
              style={{ background: curReel.glow, filter: "blur(28px)" }}
            />

            {/* Top Bar inside Video */}
            <div className="absolute left-3 top-3 right-3 z-10 flex items-center justify-between">
              <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md border border-white/10">
                <Film className="size-3 text-[var(--brand-2)]" />
                <span>MagicReel™</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-0.5 text-[10.5px] font-bold text-[var(--ink)] shadow-sm">
                <span>{curReel.aspect}</span>
              </div>
            </div>

            {/* Glowing Center Play Glyph */}
            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
              <div className="grid size-12 place-items-center rounded-full bg-[var(--brand)] text-white shadow-[0_10px_24px_rgba(253,72,22,.6)] transition-transform duration-200 group-hover:scale-110">
                <Play className="size-5 fill-white ml-0.5" />
              </div>
            </div>

            {/* Navigation Chevrons */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setReelIndex((prev) => (prev - 1 + REEL_SAMPLES.length) % REEL_SAMPLES.length);
              }}
              className="absolute left-2 top-1/2 z-20 -translate-y-1/2 grid size-7 place-items-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
              aria-label="Previous sample"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setReelIndex((prev) => (prev + 1) % REEL_SAMPLES.length);
              }}
              className="absolute right-2 top-1/2 z-20 -translate-y-1/2 grid size-7 place-items-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
              aria-label="Next sample"
            >
              <ChevronRight className="size-4" />
            </button>

            {/* Live Subtitle and Citation Badge */}
            <div className="absolute bottom-9 left-3.5 right-3.5 z-10">
              <div className="text-[12.5px] font-semibold leading-snug text-white drop-shadow-md">
                {curReel.caption}
              </div>
              <div className="mt-1 inline-flex items-center gap-1 rounded bg-black/50 px-1.5 py-0.5 text-[9.5px] font-bold text-[var(--brand-2)] backdrop-blur-sm">
                {curReel.citation}
              </div>
            </div>

            {/* Apple Progress Pill Dashes */}
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
              {REEL_SAMPLES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setReelIndex(i);
                  }}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    reelIndex === i ? "w-5 bg-[var(--brand)]" : "w-1.5 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Go to sample ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Lower Content */}
          <div className="flex flex-1 flex-col p-3.5 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-extrabold text-[var(--ink)]">MagicReel™</h3>
              <span className="rounded-full bg-[var(--tint)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--brand-deep)] border border-[var(--tint-line)]">
                Most Popular
              </span>
            </div>
            <p className="mt-1 text-[13.5px] leading-snug text-[var(--ink-3)]">
              Cinematic explainer with motion scenes, graphics, voiceover & citations.
            </p>

            {/* Feature Pills */}
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#f4f5f3] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--ink-2)]">
                <Check className="size-3 text-[var(--brand)]" /> Motion Scenes
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#f4f5f3] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--ink-2)]">
                <Volume2 className="size-3 text-[var(--brand)]" /> Voiceover
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#f4f5f3] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--ink-2)]">
                <Check className="size-3 text-[var(--brand)]" /> Citations
              </span>
            </div>

            {/* Bottom Meta & Button */}
            <div className="mt-auto pt-4">
              <div className="flex items-center justify-between border-t border-[var(--hair)] pt-2.5 text-[12px] font-medium text-[var(--ink-4)]">
                <span>30–180s · HCP & Patient</span>
                <span className="font-bold text-[var(--brand-deep)]">5,000 tokens</span>
              </div>
              <button
                type="button"
                className="focus-ring mt-3 w-full rounded-[14px] bg-[var(--brand)] py-2.5 text-[13.5px] font-bold text-white shadow-sm transition-all duration-200 hover:bg-[var(--brand-deep)] hover:shadow-md"
              >
                Choose MagicReel™ →
              </button>
            </div>
          </div>
        </div>

        {/* ── CARD 2: MagicAvatar™ ── */}
        <div
          onMouseEnter={() => setAvatarHovered(true)}
          onMouseLeave={() => setAvatarHovered(false)}
          onClick={() => handleSelectMode("magic-avatar")}
          className="group relative flex flex-col rounded-[24px] border border-[var(--hair-2)] bg-white p-3 shadow-[var(--sh-1)] transition-all duration-300 hover:-translate-y-1 hover:border-[#2563eb] hover:shadow-[var(--sh-3)] cursor-pointer"
        >
          {/* Inner Cinema Screen */}
          <div
            className="relative h-[224px] w-full overflow-hidden rounded-[18px] border border-white/10"
            style={{ background: curAvatar.gradient }}
          >
            {/* Ambient Glow */}
            <div
              className="absolute inset-0 transition-all duration-700"
              style={{ background: curAvatar.glow, filter: "blur(28px)" }}
            />

            {/* Top Bar inside Video */}
            <div className="absolute left-3 top-3 right-3 z-10 flex items-center justify-between">
              <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md border border-white/10">
                <UserCheck className="size-3 text-[#60a5fa]" />
                <span>MagicAvatar™</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-0.5 text-[10.5px] font-bold text-[var(--ink)] shadow-sm">
                <span>{curAvatar.aspect}</span>
              </div>
            </div>

            {/* Glowing Center Play Glyph */}
            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
              <div className="grid size-12 place-items-center rounded-full bg-[#2563eb] text-white shadow-[0_10px_24px_rgba(37,99,235,.6)] transition-transform duration-200 group-hover:scale-110">
                <Play className="size-5 fill-white ml-0.5" />
              </div>
            </div>

            {/* Navigation Chevrons */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setAvatarIndex((prev) => (prev - 1 + AVATAR_SAMPLES.length) % AVATAR_SAMPLES.length);
              }}
              className="absolute left-2 top-1/2 z-20 -translate-y-1/2 grid size-7 place-items-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
              aria-label="Previous sample"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setAvatarIndex((prev) => (prev + 1) % AVATAR_SAMPLES.length);
              }}
              className="absolute right-2 top-1/2 z-20 -translate-y-1/2 grid size-7 place-items-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
              aria-label="Next sample"
            >
              <ChevronRight className="size-4" />
            </button>

            {/* Live Subtitle and Doctor Persona Badge */}
            <div className="absolute bottom-9 left-3.5 right-3.5 z-10">
              <div className="text-[12.5px] font-semibold leading-snug text-white drop-shadow-md">
                {curAvatar.caption}
              </div>
              <div className="mt-1 inline-flex items-center gap-1 rounded bg-black/50 px-1.5 py-0.5 text-[9.5px] font-bold text-[#93c5fd] backdrop-blur-sm">
                {curAvatar.citation}
              </div>
            </div>

            {/* Apple Progress Pill Dashes */}
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
              {AVATAR_SAMPLES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAvatarIndex(i);
                  }}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    avatarIndex === i ? "w-5 bg-[#3b82f6]" : "w-1.5 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Go to sample ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Lower Content */}
          <div className="flex flex-1 flex-col p-3.5 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-extrabold text-[var(--ink)]">MagicAvatar™</h3>
              <span className="rounded-full bg-[#eff6ff] px-2.5 py-0.5 text-[11px] font-bold text-[#1d4ed8] border border-[#dbeafe]">
                Digital Twin
              </span>
            </div>
            <p className="mt-1 text-[13.5px] leading-snug text-[var(--ink-3)]">
              Presenter-led clinical video with AI doctor digital twins & evidence slides.
            </p>

            {/* Feature Pills */}
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#f4f5f3] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--ink-2)]">
                <Check className="size-3 text-[#2563eb]" /> Doctor Avatar
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#f4f5f3] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--ink-2)]">
                <Volume2 className="size-3 text-[#2563eb]" /> Lip-Sync Audio
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#f4f5f3] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--ink-2)]">
                <Check className="size-3 text-[#2563eb]" /> Evidence Slides
              </span>
            </div>

            {/* Bottom Meta & Button */}
            <div className="mt-auto pt-4">
              <div className="flex items-center justify-between border-t border-[var(--hair)] pt-2.5 text-[12px] font-medium text-[var(--ink-4)]">
                <span>30–90s · Presenter</span>
                <span className="font-bold text-[#1d4ed8]">8,000 tokens</span>
              </div>
              <button
                type="button"
                className="focus-ring mt-3 w-full rounded-[14px] bg-[#2563eb] py-2.5 text-[13.5px] font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#1d4ed8] hover:shadow-md"
              >
                Choose MagicAvatar™ →
              </button>
            </div>
          </div>
        </div>

        {/* ── CARD 3: Create from Scratch ── */}
        <div
          onClick={() => handleSelectMode("scratch")}
          className="group relative flex flex-col rounded-[24px] border border-[var(--hair-2)] bg-white p-3 shadow-[var(--sh-1)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--brand)] hover:shadow-[var(--sh-3)] cursor-pointer"
        >
          {/* Inner Graphic Frame */}
          <div className="relative flex h-[224px] w-full flex-col items-center justify-center overflow-hidden rounded-[18px] bg-gradient-to-br from-[#1b2230] via-[#101520] to-[#080b12] p-5 text-center border border-white/10">
            <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-tr from-[#ff5b2d] to-[#fd4816] text-white shadow-[0_10px_24px_rgba(253,72,22,.5)] transition-transform duration-200 group-hover:scale-110">
              <Compass className="size-7" />
            </div>
            <h4 className="mt-3.5 text-[16px] font-bold text-white">Freeform Canvas</h4>
            <p className="mt-0.5 text-[12px] text-white/70">Custom prompt and open configuration</p>
          </div>

          {/* Lower Content */}
          <div className="flex flex-1 flex-col p-3.5 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-extrabold text-[var(--ink)]">Create from Scratch</h3>
              <span className="rounded-full bg-[#f4f5f3] px-2.5 py-0.5 text-[11px] font-bold text-[var(--ink-2)] border border-[var(--hair-2)]">
                Open
              </span>
            </div>
            <p className="mt-1 text-[13.5px] leading-snug text-[var(--ink-3)]">
              Build a custom video using your own prompt without preset constraints.
            </p>

            {/* Feature Pills */}
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#f4f5f3] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--ink-2)]">
                <Check className="size-3 text-[var(--ink-3)]" /> Custom Prompt
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#f4f5f3] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--ink-2)]">
                <Check className="size-3 text-[var(--ink-3)]" /> Any Duration
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#f4f5f3] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--ink-2)]">
                <Check className="size-3 text-[var(--ink-3)]" /> Modular Setup
              </span>
            </div>

            {/* Bottom Meta & Button */}
            <div className="mt-auto pt-4">
              <div className="flex items-center justify-between border-t border-[var(--hair)] pt-2.5 text-[12px] font-medium text-[var(--ink-4)]">
                <span>Custom length</span>
                <span className="font-bold text-[var(--ink-2)]">Standard tokens</span>
              </div>
              <button
                type="button"
                className="focus-ring mt-3 w-full rounded-[14px] border border-[var(--hair-3)] bg-white py-2.5 text-[13.5px] font-bold text-[var(--ink)] shadow-sm transition-all duration-200 hover:border-[var(--brand)] hover:bg-[var(--tint)] hover:text-[var(--brand-deep)]"
              >
                Start from Scratch →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
