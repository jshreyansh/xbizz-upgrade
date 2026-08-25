"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";
import { SwishXMark } from "@/components/ui/swishx-mark";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore, type CreationMode } from "@/features/workspace/workspace-store";

interface SampleVideo {
  title: string;
  badge: string;
  aspect: string;
  duration: string;
  gradient: string;
  glow: string;
  caption: string;
  currentTime: string;
  totalTime: string;
  progressPercent: number;
}

const REEL_SAMPLES: SampleVideo[] = [
  {
    title: "Velmora Risk Reduction Explainer",
    badge: "Short Video · MagicReel™",
    aspect: "9:16 · Mobile HD",
    duration: "60s",
    gradient: "linear-gradient(155deg,#0a1a2f,#040814 60%,#1c0c04)",
    glow: "radial-gradient(circle,rgba(253,72,22,.65),transparent 65%)",
    caption: "“Velmora demonstrated a 24% relative risk reduction in primary composite CV endpoints.”",
    currentTime: "0:24",
    totalTime: "1:00",
    progressPercent: 40,
  },
  {
    title: "Mechanism of Action (MoA) Visual",
    badge: "Short Video · MagicReel™",
    aspect: "16:9 · Widescreen",
    duration: "45s",
    gradient: "linear-gradient(155deg,#0e231e,#06130f 60%,#1a2a12)",
    glow: "radial-gradient(circle,rgba(34,192,122,.55),transparent 65%)",
    caption: "“Targeted SGLT2 inhibition preserves renal perfusion while improving glycemic metrics.”",
    currentTime: "0:18",
    totalTime: "0:45",
    progressPercent: 40,
  },
  {
    title: "Patient Safety & Tolerability Brief",
    badge: "Short Video · MagicReel™",
    aspect: "1:1 · Square",
    duration: "90s",
    gradient: "linear-gradient(155deg,#1f132e,#0c0717 60%,#280f1e)",
    glow: "radial-gradient(circle,rgba(155,107,255,.6),transparent 65%)",
    caption: "“Consistent tolerability profile across 12,400 patients in double-blind clinical trials.”",
    currentTime: "0:42",
    totalTime: "1:30",
    progressPercent: 46,
  },
];

const AVATAR_SAMPLES: SampleVideo[] = [
  {
    title: "Dr. Maya Kapoor · Clinical Briefing",
    badge: "Digital Twin · MagicAvatar™",
    aspect: "9:16 · Presenter",
    duration: "60s",
    gradient: "linear-gradient(155deg,#12182b,#080c16 60%,#091d2c)",
    glow: "radial-gradient(circle,rgba(79,131,255,.65),transparent 65%)",
    caption: "“Hello colleagues. Today let's examine the subgroup readouts from CLARITY-CV.”",
    currentTime: "0:20",
    totalTime: "1:00",
    progressPercent: 33,
  },
  {
    title: "Dr. Rohan Mehta · Phase III Breakdown",
    badge: "Digital Twin · MagicAvatar™",
    aspect: "16:9 · Studio",
    duration: "90s",
    gradient: "linear-gradient(155deg,#1f1610,#0d0905 60%,#241508)",
    glow: "radial-gradient(circle,rgba(255,154,77,.6),transparent 65%)",
    caption: "“The secondary endpoints confirmed sustained glycemic control through week 52.”",
    currentTime: "0:36",
    totalTime: "1:30",
    progressPercent: 40,
  },
  {
    title: "Dr. Aisha Shah · Dosing & Titration",
    badge: "Digital Twin · MagicAvatar™",
    aspect: "9:16 · Presenter",
    duration: "45s",
    gradient: "linear-gradient(155deg,#17211d,#08130f 60%,#0c2118)",
    glow: "radial-gradient(circle,rgba(45,156,110,.55),transparent 65%)",
    caption: "“Once-daily oral administration without food restrictions supports patient adherence.”",
    currentTime: "0:15",
    totalTime: "0:45",
    progressPercent: 33,
  },
];

export function MagicVideoModeScreen() {
  const router = useRouter();
  const setCreationMode = useWorkspaceStore((s) => s.setCreationMode);
  const setVideoSubStage = useWorkspaceStore((s) => s.setVideoSubStage);
  const setView = useWorkspaceStore((s) => s.setView);

  // Carousel active indices
  const [reelIndex, setReelIndex] = useState(0);
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [reelHovered, setReelHovered] = useState(false);
  const [avatarHovered, setAvatarHovered] = useState(false);

  // Auto-rotate carousels every 4.5 seconds unless hovered
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

  const handleBackHome = () => {
    setView("home");
    router.push("/");
  };

  const curReel = REEL_SAMPLES[reelIndex];
  const curAvatar = AVATAR_SAMPLES[avatarIndex];

  return (
    <div className="page-enter min-h-screen bg-[#f3f5f2] pb-12">
      {/* Top Header */}
      <header className="flex h-[68px] items-center border-b border-[var(--line)] bg-white/95 px-4 backdrop-blur-xl sm:px-7">
        <button
          onClick={handleBackHome}
          className="focus-ring mr-4 grid size-10 place-items-center rounded-[10px] text-[var(--ink-muted)] hover:bg-black/5"
          aria-label="Back home"
        >
          <ArrowLeft className="size-[20px]" />
        </button>
        <SwishXMark />
        <div className="ml-5 hidden h-6 w-px bg-[var(--line)] sm:block" />
        <div className="ml-5 hidden sm:block">
          <div className="text-[14px] font-bold">Magic Video</div>
          <div className="text-[13px] text-[var(--ink-muted)]">Step 1 of 3 · Choose how you want to start</div>
        </div>
        <Button onClick={handleBackHome} variant="ghost" size="icon" className="ml-auto" aria-label="Close">
          <X className="size-[20px]" />
        </Button>
      </header>

      {/* Main Container */}
      <main className="mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-7">
        {/* Title & Description */}
        <div className="mb-8 max-w-[760px]">
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-soft)] px-3 py-1 text-[12px] font-bold text-[var(--brand)]">
            <Sparkles className="size-3.5" /> Video Creation Suite
          </span>
          <h1 className="mt-3 text-[32px] font-[800] tracking-[-0.04em] sm:text-[38px]">
            What kind of video are you creating?
          </h1>
          <p className="mt-2 text-[16px] leading-6 text-[var(--ink-muted)]">
            Select a tailored engine or start completely freeform. We&apos;ll configure evidence boundaries, pacing, and visual style automatically.
          </p>
        </div>

        {/* 3-Card Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* ── CARD 1: MagicReel™ ── */}
          <div
            onMouseEnter={() => setReelHovered(true)}
            onMouseLeave={() => setReelHovered(false)}
            onClick={() => handleSelectMode("magic-reel")}
            className="group squircle-card rise-in relative flex flex-col overflow-hidden border border-[var(--line)] bg-white shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--brand)] hover:shadow-xl cursor-pointer"
          >
            {/* Top Video Preview Area with Carousel */}
            <div className="relative h-[220px] overflow-hidden" style={{ background: curReel.gradient }}>
              {/* Background Glow */}
              <div
                className="absolute inset-0 transition-all duration-700"
                style={{
                  background: curReel.glow,
                  filter: "blur(28px)",
                  opacity: 0.65,
                }}
              />

              {/* Category Badge */}
              <div className="absolute left-3.5 top-3.5 z-10 flex items-center gap-2 rounded-lg bg-black/60 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                <span className="size-2 rounded-full bg-[var(--brand)]" />
                {curReel.badge}
              </div>

              {/* Aspect Ratio Badge */}
              <div className="absolute right-3.5 top-3.5 z-10 rounded-lg bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#0d1017] shadow-sm">
                {curReel.aspect}
              </div>

              {/* Play Button */}
              <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
                <div className="grid size-14 place-items-center rounded-full bg-[var(--brand)] text-white shadow-[0_10px_26px_rgba(253,72,22,.65)] transition-transform duration-300 group-hover:scale-110">
                  <svg viewBox="0 0 24 24" fill="currentColor" width={20} height={20} className="ml-0.5">
                    <path d="M6 4l14 8-14 8z" />
                  </svg>
                </div>
              </div>

              {/* Left / Right Chevron Controls */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setReelIndex((prev) => (prev - 1 + REEL_SAMPLES.length) % REEL_SAMPLES.length);
                }}
                className="absolute left-2 top-1/2 z-20 -translate-y-1/2 grid size-8 place-items-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
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
                className="absolute right-2 top-1/2 z-20 -translate-y-1/2 grid size-8 place-items-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
                aria-label="Next sample"
              >
                <ChevronRight className="size-4" />
              </button>

              {/* Live Caption Text */}
              <div className="absolute bottom-11 left-4 right-4 z-10 text-[13px] font-semibold leading-snug text-white drop-shadow-md">
                {curReel.caption}
              </div>

              {/* Progress Scrubber */}
              <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center gap-2.5 text-[10.5px] font-semibold text-white/80">
                <span>{curReel.currentTime}</span>
                <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/25">
                  <div
                    className="absolute left-0 top-0 bottom-0 rounded-full bg-[var(--brand)] transition-all duration-300"
                    style={{ width: `${curReel.progressPercent}%` }}
                  />
                </div>
                <span>{curReel.totalTime}</span>
              </div>

              {/* Interactive 3 Pagination Dots */}
              <div className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 flex items-center gap-1.5">
                {REEL_SAMPLES.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setReelIndex(i);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      reelIndex === i ? "w-5 bg-[var(--brand)]" : "w-1.5 bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={`Sample ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Bottom Content Info */}
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-[18px] font-bold tracking-tight">MagicReel™</h3>
                <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--brand)]">
                  Start here
                </span>
              </div>
              <p className="mt-2 text-[13.5px] leading-5 text-[var(--ink-muted)]">
                Cinematic 30–180s drug explainer for HCPs & patients. Generates motion scenes, clinical graphics, voice narration, and on-screen citations.
              </p>

              <div className="mt-auto pt-4">
                <div className="flex items-center justify-between border-t border-[var(--line)] pt-3 text-[12px] font-semibold text-[var(--ink-muted)]">
                  <span>30–180 sec</span>
                  <span>HCP & Patient</span>
                  <span className="text-[var(--brand)] font-bold">5,000 tokens</span>
                </div>
                <button
                  type="button"
                  className="focus-ring mt-3 w-full rounded-[12px] bg-[var(--brand)] py-2.5 text-[13.5px] font-bold text-white shadow-sm transition hover:bg-[var(--brand-deep)]"
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
            className="group squircle-card rise-in relative flex flex-col overflow-hidden border border-[var(--line)] bg-white shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:border-[#1d4ed8] hover:shadow-xl cursor-pointer [animation-delay:80ms]"
          >
            {/* Top Video Preview Area with Carousel */}
            <div className="relative h-[220px] overflow-hidden" style={{ background: curAvatar.gradient }}>
              {/* Background Glow */}
              <div
                className="absolute inset-0 transition-all duration-700"
                style={{
                  background: curAvatar.glow,
                  filter: "blur(28px)",
                  opacity: 0.65,
                }}
              />

              {/* Category Badge */}
              <div className="absolute left-3.5 top-3.5 z-10 flex items-center gap-2 rounded-lg bg-black/60 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                <span className="size-2 rounded-full bg-[#3b82f6]" />
                {curAvatar.badge}
              </div>

              {/* Aspect Ratio Badge */}
              <div className="absolute right-3.5 top-3.5 z-10 rounded-lg bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#0d1017] shadow-sm">
                {curAvatar.aspect}
              </div>

              {/* Play Button */}
              <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
                <div className="grid size-14 place-items-center rounded-full bg-[#1d4ed8] text-white shadow-[0_10px_26px_rgba(29,78,216,.6)] transition-transform duration-300 group-hover:scale-110">
                  <svg viewBox="0 0 24 24" fill="currentColor" width={20} height={20} className="ml-0.5">
                    <path d="M6 4l14 8-14 8z" />
                  </svg>
                </div>
              </div>

              {/* Left / Right Chevron Controls */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setAvatarIndex((prev) => (prev - 1 + AVATAR_SAMPLES.length) % AVATAR_SAMPLES.length);
                }}
                className="absolute left-2 top-1/2 z-20 -translate-y-1/2 grid size-8 place-items-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
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
                className="absolute right-2 top-1/2 z-20 -translate-y-1/2 grid size-8 place-items-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
                aria-label="Next sample"
              >
                <ChevronRight className="size-4" />
              </button>

              {/* Live Caption Text */}
              <div className="absolute bottom-11 left-4 right-4 z-10 text-[13px] font-semibold leading-snug text-white drop-shadow-md">
                {curAvatar.caption}
              </div>

              {/* Progress Scrubber */}
              <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center gap-2.5 text-[10.5px] font-semibold text-white/80">
                <span>{curAvatar.currentTime}</span>
                <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/25">
                  <div
                    className="absolute left-0 top-0 bottom-0 rounded-full bg-[#3b82f6] transition-all duration-300"
                    style={{ width: `${curAvatar.progressPercent}%` }}
                  />
                </div>
                <span>{curAvatar.totalTime}</span>
              </div>

              {/* Interactive 3 Pagination Dots */}
              <div className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 flex items-center gap-1.5">
                {AVATAR_SAMPLES.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAvatarIndex(i);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      avatarIndex === i ? "w-5 bg-[#3b82f6]" : "w-1.5 bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={`Sample ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Bottom Content Info */}
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-[18px] font-bold tracking-tight">MagicAvatar™</h3>
                <span className="rounded-full bg-[#eff6ff] px-2.5 py-0.5 text-[11px] font-bold text-[#1d4ed8]">
                  Digital Twin
                </span>
              </div>
              <p className="mt-2 text-[13.5px] leading-5 text-[var(--ink-muted)]">
                Presenter-led clinical video with AI doctor digital twins. Lip-synced delivery with evidence slides, clinical backgrounds, and medical citations.
              </p>

              <div className="mt-auto pt-4">
                <div className="flex items-center justify-between border-t border-[var(--line)] pt-3 text-[12px] font-semibold text-[var(--ink-muted)]">
                  <span>30–90 sec</span>
                  <span>Presenter-led</span>
                  <span className="text-[#1d4ed8] font-bold">8,000 tokens</span>
                </div>
                <button
                  type="button"
                  className="focus-ring mt-3 w-full rounded-[12px] bg-[#1d4ed8] py-2.5 text-[13.5px] font-bold text-white shadow-sm transition hover:bg-[#1e40af]"
                >
                  Choose MagicAvatar™ →
                </button>
              </div>
            </div>
          </div>

          {/* ── CARD 3: Create from Scratch (No video carousel) ── */}
          <div
            onClick={() => handleSelectMode("scratch")}
            className="group squircle-card rise-in relative flex flex-col overflow-hidden border border-[var(--line)] bg-white shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--brand)] hover:shadow-xl cursor-pointer [animation-delay:160ms]"
          >
            {/* Top Creative Canvas Graphic Area */}
            <div className="relative flex h-[220px] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#1b2028] via-[#10141a] to-[#080a0e] p-6 text-center">
              {/* Subtle mesh pattern */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: "radial-gradient(circle,rgba(255,255,255,.3) 1px,transparent 1px)",
                  backgroundSize: "18px 18px",
                }}
              />
              <div className="relative z-10 grid size-16 place-items-center rounded-2xl bg-gradient-to-tr from-[#ff5b2d] to-[#fd4816] text-white shadow-[0_12px_28px_rgba(253,72,22,.55)] transition-transform duration-300 group-hover:scale-110">
                <Sparkles className="size-8" />
              </div>
              <h4 className="relative z-10 mt-4 text-[16px] font-bold text-white">Freeform Creative Canvas</h4>
              <p className="relative z-10 mt-1 text-[12px] text-white/70">
                Write your prompt, configure custom parameters & build from zero
              </p>
            </div>

            {/* Bottom Content Info */}
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-[18px] font-bold tracking-tight">Create from Scratch</h3>
                <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-[11px] font-bold text-[var(--ink-2)]">
                  Open prompt
                </span>
              </div>
              <p className="mt-2 text-[13.5px] leading-5 text-[var(--ink-muted)]">
                Build a tailored pharma video using your own custom prompt, custom duration, and modular creative direction without predefined constraints.
              </p>

              <div className="mt-auto pt-4">
                <div className="flex items-center justify-between border-t border-[var(--line)] pt-3 text-[12px] font-semibold text-[var(--ink-muted)]">
                  <span>Custom length</span>
                  <span>Any audience</span>
                  <span className="text-[var(--brand)] font-bold">Standard tokens</span>
                </div>
                <button
                  type="button"
                  className="focus-ring mt-3 w-full rounded-[12px] border border-[var(--line-strong)] bg-white py-2.5 text-[13.5px] font-bold text-[var(--ink)] shadow-sm transition hover:border-[var(--brand)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]"
                >
                  Start from Scratch →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
