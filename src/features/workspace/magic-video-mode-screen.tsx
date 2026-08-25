"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
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
    badge: "MagicReel™",
    aspect: "9:16",
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
    badge: "MagicReel™",
    aspect: "16:9",
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
    badge: "MagicReel™",
    aspect: "1:1",
    duration: "90s",
    gradient: "linear-gradient(155deg,#1f132e,#0c0717 60%,#280f1e)",
    glow: "radial-gradient(circle,rgba(155,107,255,.6),transparent 65%)",
    caption: "“Consistent tolerability profile across 12,400 patients in clinical trials.”",
    currentTime: "0:42",
    totalTime: "1:30",
    progressPercent: 46,
  },
];

const AVATAR_SAMPLES: SampleVideo[] = [
  {
    title: "Dr. Maya Kapoor · Clinical Briefing",
    badge: "MagicAvatar™",
    aspect: "9:16",
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
    badge: "MagicAvatar™",
    aspect: "16:9",
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
    badge: "MagicAvatar™",
    aspect: "9:16",
    duration: "45s",
    gradient: "linear-gradient(155deg,#17211d,#08130f 60%,#0c2118)",
    glow: "radial-gradient(circle,rgba(45,156,110,.55),transparent 65%)",
    caption: "“Once-daily oral administration without food restrictions supports adherence.”",
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
    <div className="page-enter mx-auto w-full max-w-[1200px]">
      {/* Title & Description - Clean & Punchy */}
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-soft)] px-3 py-0.5 text-[11.5px] font-bold text-[var(--brand)]">
          <Sparkles className="size-3" /> Magic Video
        </span>
        <h1 className="mt-2 text-[28px] font-[800] tracking-tight sm:text-[34px]">
          Choose video format
        </h1>
        <p className="mt-1 text-[14.5px] text-[var(--ink-muted)]">
          Select an engine to start. Pacing, voice, and clinical citations are configured automatically.
        </p>
      </div>

      {/* 3-Card Grid */}
      <div className="grid gap-5 md:grid-cols-3">
        {/* ── CARD 1: MagicReel™ ── */}
        <div
          onMouseEnter={() => setReelHovered(true)}
          onMouseLeave={() => setReelHovered(false)}
          onClick={() => handleSelectMode("magic-reel")}
          className="group squircle-card rise-in relative flex flex-col overflow-hidden border border-[var(--line)] bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[var(--brand)] hover:shadow-lg cursor-pointer"
        >
          {/* Top Preview */}
          <div className="relative h-[210px] overflow-hidden" style={{ background: curReel.gradient }}>
            <div
              className="absolute inset-0 transition-all duration-700"
              style={{ background: curReel.glow, filter: "blur(26px)", opacity: 0.65 }}
            />
            <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
              <span className="size-1.5 rounded-full bg-[var(--brand)]" />
              {curReel.badge}
            </div>
            <div className="absolute right-3 top-3 z-10 rounded-md bg-white/95 px-2 py-0.5 text-[10.5px] font-bold text-[#0d1017]">
              {curReel.aspect}
            </div>

            {/* Play Button */}
            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
              <div className="grid size-12 place-items-center rounded-full bg-[var(--brand)] text-white shadow-md transition-transform duration-200 group-hover:scale-110">
                <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18} className="ml-0.5">
                  <path d="M6 4l14 8-14 8z" />
                </svg>
              </div>
            </div>

            {/* Chevrons */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setReelIndex((prev) => (prev - 1 + REEL_SAMPLES.length) % REEL_SAMPLES.length);
              }}
              className="absolute left-1.5 top-1/2 z-20 -translate-y-1/2 grid size-7 place-items-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setReelIndex((prev) => (prev + 1) % REEL_SAMPLES.length);
              }}
              className="absolute right-1.5 top-1/2 z-20 -translate-y-1/2 grid size-7 place-items-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
            >
              <ChevronRight className="size-3.5" />
            </button>

            {/* Caption */}
            <div className="absolute bottom-10 left-3.5 right-3.5 z-10 text-[12.5px] font-semibold text-white drop-shadow">
              {curReel.caption}
            </div>

            {/* Scrubber */}
            <div className="absolute bottom-2.5 left-3.5 right-3.5 z-10 flex items-center gap-2 text-[10px] font-medium text-white/80">
              <span>{curReel.currentTime}</span>
              <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/25">
                <div
                  className="absolute left-0 top-0 bottom-0 rounded-full bg-[var(--brand)]"
                  style={{ width: `${curReel.progressPercent}%` }}
                />
              </div>
              <span>{curReel.totalTime}</span>
            </div>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 flex items-center gap-1.5">
              {REEL_SAMPLES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setReelIndex(i);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    reelIndex === i ? "w-4 bg-[var(--brand)]" : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-1 flex-col p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-bold">MagicReel™</h3>
              <span className="rounded-full bg-[var(--brand-soft)] px-2 py-0.5 text-[10.5px] font-bold text-[var(--brand)]">
                Recommended
              </span>
            </div>
            <p className="mt-1 text-[13px] text-[var(--ink-muted)]">
              Cinematic short explainer with motion scenes, graphs & citations.
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="rounded-md bg-black/[0.04] px-2 py-0.5 text-[11px] font-semibold text-[var(--ink-2)]">✓ Motion Scenes</span>
              <span className="rounded-md bg-black/[0.04] px-2 py-0.5 text-[11px] font-semibold text-[var(--ink-2)]">✓ Voiceover</span>
              <span className="rounded-md bg-black/[0.04] px-2 py-0.5 text-[11px] font-semibold text-[var(--ink-2)]">✓ On-Screen Citations</span>
            </div>

            <div className="mt-auto pt-4">
              <div className="flex items-center justify-between border-t border-[var(--line)] pt-2.5 text-[11.5px] font-semibold text-[var(--ink-muted)]">
                <span>30–180s · HCP & Patient</span>
                <span className="text-[var(--brand)] font-bold">5,000 tokens</span>
              </div>
              <button
                type="button"
                className="focus-ring mt-2.5 w-full rounded-[10px] bg-[var(--brand)] py-2 text-[13px] font-bold text-white shadow-sm transition hover:bg-[var(--brand-deep)]"
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
          className="group squircle-card rise-in relative flex flex-col overflow-hidden border border-[var(--line)] bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#1d4ed8] hover:shadow-lg cursor-pointer [animation-delay:60ms]"
        >
          {/* Top Preview */}
          <div className="relative h-[210px] overflow-hidden" style={{ background: curAvatar.gradient }}>
            <div
              className="absolute inset-0 transition-all duration-700"
              style={{ background: curAvatar.glow, filter: "blur(26px)", opacity: 0.65 }}
            />
            <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
              <span className="size-1.5 rounded-full bg-[#3b82f6]" />
              {curAvatar.badge}
            </div>
            <div className="absolute right-3 top-3 z-10 rounded-md bg-white/95 px-2 py-0.5 text-[10.5px] font-bold text-[#0d1017]">
              {curAvatar.aspect}
            </div>

            {/* Play Button */}
            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
              <div className="grid size-12 place-items-center rounded-full bg-[#1d4ed8] text-white shadow-md transition-transform duration-200 group-hover:scale-110">
                <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18} className="ml-0.5">
                  <path d="M6 4l14 8-14 8z" />
                </svg>
              </div>
            </div>

            {/* Chevrons */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setAvatarIndex((prev) => (prev - 1 + AVATAR_SAMPLES.length) % AVATAR_SAMPLES.length);
              }}
              className="absolute left-1.5 top-1/2 z-20 -translate-y-1/2 grid size-7 place-items-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setAvatarIndex((prev) => (prev + 1) % AVATAR_SAMPLES.length);
              }}
              className="absolute right-1.5 top-1/2 z-20 -translate-y-1/2 grid size-7 place-items-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
            >
              <ChevronRight className="size-3.5" />
            </button>

            {/* Caption */}
            <div className="absolute bottom-10 left-3.5 right-3.5 z-10 text-[12.5px] font-semibold text-white drop-shadow">
              {curAvatar.caption}
            </div>

            {/* Scrubber */}
            <div className="absolute bottom-2.5 left-3.5 right-3.5 z-10 flex items-center gap-2 text-[10px] font-medium text-white/80">
              <span>{curAvatar.currentTime}</span>
              <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/25">
                <div
                  className="absolute left-0 top-0 bottom-0 rounded-full bg-[#3b82f6]"
                  style={{ width: `${curAvatar.progressPercent}%` }}
                />
              </div>
              <span>{curAvatar.totalTime}</span>
            </div>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 flex items-center gap-1.5">
              {AVATAR_SAMPLES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAvatarIndex(i);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    avatarIndex === i ? "w-4 bg-[#3b82f6]" : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-1 flex-col p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-bold">MagicAvatar™</h3>
              <span className="rounded-full bg-[#eff6ff] px-2 py-0.5 text-[10.5px] font-bold text-[#1d4ed8]">
                Digital Twin
              </span>
            </div>
            <p className="mt-1 text-[13px] text-[var(--ink-muted)]">
              Presenter-led clinical video with AI doctor digital twins.
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="rounded-md bg-black/[0.04] px-2 py-0.5 text-[11px] font-semibold text-[var(--ink-2)]">✓ Doctor Avatar</span>
              <span className="rounded-md bg-black/[0.04] px-2 py-0.5 text-[11px] font-semibold text-[var(--ink-2)]">✓ Lip-Sync Audio</span>
              <span className="rounded-md bg-black/[0.04] px-2 py-0.5 text-[11px] font-semibold text-[var(--ink-2)]">✓ Evidence Slides</span>
            </div>

            <div className="mt-auto pt-4">
              <div className="flex items-center justify-between border-t border-[var(--line)] pt-2.5 text-[11.5px] font-semibold text-[var(--ink-muted)]">
                <span>30–90s · Presenter</span>
                <span className="text-[#1d4ed8] font-bold">8,000 tokens</span>
              </div>
              <button
                type="button"
                className="focus-ring mt-2.5 w-full rounded-[10px] bg-[#1d4ed8] py-2 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#1e40af]"
              >
                Choose MagicAvatar™ →
              </button>
            </div>
          </div>
        </div>

        {/* ── CARD 3: Create from Scratch ── */}
        <div
          onClick={() => handleSelectMode("scratch")}
          className="group squircle-card rise-in relative flex flex-col overflow-hidden border border-[var(--line)] bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[var(--brand)] hover:shadow-lg cursor-pointer [animation-delay:120ms]"
        >
          {/* Top Graphic */}
          <div className="relative flex h-[210px] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#1b2028] via-[#10141a] to-[#080a0e] p-5 text-center">
            <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-tr from-[#ff5b2d] to-[#fd4816] text-white shadow-md transition-transform duration-200 group-hover:scale-110">
              <Sparkles className="size-7" />
            </div>
            <h4 className="mt-3 text-[15px] font-bold text-white">Freeform Canvas</h4>
            <p className="mt-0.5 text-[11.5px] text-white/70">Custom prompt and flexible duration</p>
          </div>

          {/* Info */}
          <div className="flex flex-1 flex-col p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-bold">Create from Scratch</h3>
              <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10.5px] font-bold text-[var(--ink-2)]">
                Open Prompt
              </span>
            </div>
            <p className="mt-1 text-[13px] text-[var(--ink-muted)]">
              Build a custom video using your own prompt without presets.
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="rounded-md bg-black/[0.04] px-2 py-0.5 text-[11px] font-semibold text-[var(--ink-2)]">✓ Custom Prompt</span>
              <span className="rounded-md bg-black/[0.04] px-2 py-0.5 text-[11px] font-semibold text-[var(--ink-2)]">✓ Any Duration</span>
              <span className="rounded-md bg-black/[0.04] px-2 py-0.5 text-[11px] font-semibold text-[var(--ink-2)]">✓ Modular Assets</span>
            </div>

            <div className="mt-auto pt-4">
              <div className="flex items-center justify-between border-t border-[var(--line)] pt-2.5 text-[11.5px] font-semibold text-[var(--ink-muted)]">
                <span>Custom runtime</span>
                <span className="text-[var(--brand)] font-bold">Standard tokens</span>
              </div>
              <button
                type="button"
                className="focus-ring mt-2.5 w-full rounded-[10px] border border-[var(--line-strong)] bg-white py-2 text-[13px] font-bold text-[var(--ink)] shadow-sm transition hover:border-[var(--brand)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]"
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
