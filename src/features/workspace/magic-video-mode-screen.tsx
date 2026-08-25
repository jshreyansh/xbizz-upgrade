"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Film, Sparkles, UserCheck, Check, Play, ShieldCheck, Tv, Video } from "lucide-react";
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
  personaTitle?: string;
}

const REEL_SAMPLES: SampleVideo[] = [
  {
    title: "Velmora Risk Reduction Explainer",
    badge: "Cinematic Reel",
    aspect: "16:9 4K",
    duration: "60s",
    gradient: "linear-gradient(145deg,#0c1626,#050a14 55%,#1c0c04)",
    glow: "radial-gradient(circle at 50% 40%, rgba(253,72,22,.5), transparent 70%)",
    caption: "“Velmora demonstrated a 24% relative risk reduction in primary CV endpoints.”",
    citation: "CLARITY-CV Trial · NCT04892110",
  },
  {
    title: "Mechanism of Action (MoA) Visual",
    badge: "MoA Graphics",
    aspect: "16:9 4K",
    duration: "45s",
    gradient: "linear-gradient(145deg,#0a1f1a,#040e0b 55%,#17240f)",
    glow: "radial-gradient(circle at 50% 40%, rgba(34,192,122,.45), transparent 70%)",
    caption: "“Targeted dual inhibition preserves renal perfusion while improving glycemic metrics.”",
    citation: "Journal of Clinical Cardiology 2024",
  },
  {
    title: "Patient Safety & Tolerability Brief",
    badge: "Safety Profile",
    aspect: "9:16 Mobile",
    duration: "90s",
    gradient: "linear-gradient(145deg,#1b1028,#080512 55%,#220b18)",
    glow: "radial-gradient(circle at 50% 40%, rgba(155,107,255,.45), transparent 70%)",
    caption: "“Consistent safety profile across 12,400 patients in multi-center clinical trials.”",
    citation: "FDA Approved Prescribing Information §5.1",
  },
];

const AVATAR_SAMPLES: SampleVideo[] = [
  {
    title: "Dr. Maya Kapoor · Clinical Trial Briefing",
    badge: "KOL Presenter",
    aspect: "16:9 Studio",
    duration: "60s",
    gradient: "linear-gradient(145deg,#0f172a,#060913 55%,#081724)",
    glow: "radial-gradient(circle at 50% 40%, rgba(59,130,246,.5), transparent 70%)",
    caption: "“Let's examine the primary endpoint readouts from the pivotal phase III trial.”",
    citation: "Dr. Maya Kapoor · Cardiologist, Harvard Medical",
    personaTitle: "Cardiologist & Principal Investigator",
  },
  {
    title: "Dr. Rohan Mehta · Phase III Efficacy Breakdown",
    badge: "Digital Twin",
    aspect: "16:9 Studio",
    duration: "90s",
    gradient: "linear-gradient(145deg,#1d140e,#0b0704 55%,#221206)",
    glow: "radial-gradient(circle at 50% 40%, rgba(255,138,76,.45), transparent 70%)",
    caption: "“Secondary endpoints confirmed sustained biomarker control through week 52.”",
    citation: "Dr. Rohan Mehta · Medical Director",
    personaTitle: "Endocrinologist & Lead Reviewer",
  },
  {
    title: "Dr. Aisha Shah · Dosing & Titration Protocols",
    badge: "Doctor Briefing",
    aspect: "9:16 Presenter",
    duration: "45s",
    gradient: "linear-gradient(145deg,#121d18,#050d0a 55%,#091d14)",
    glow: "radial-gradient(circle at 50% 40%, rgba(18,120,74,.5), transparent 70%)",
    caption: "“Once-daily oral administration without dietary restrictions supports compliance.”",
    citation: "Dr. Aisha Shah · Clinical Pharmacologist",
    personaTitle: "Director of Clinical Pharmacology",
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
    <div className="mx-auto w-full max-w-[1120px] py-2 sm:py-4">
      {/* Editorial Header */}
      <div className="text-center max-w-[760px] mx-auto mb-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--tint)] px-3.5 py-1 text-[11.5px] font-bold uppercase tracking-wider text-[var(--brand-deep)] border border-[var(--tint-line)] shadow-sm">
          <Sparkles className="size-3.5 text-[var(--brand)]" />
          <span>AI Video Engines</span>
        </div>
        <h1 className="mt-3.5 text-[32px] font-[800] tracking-tight text-[var(--ink)] sm:text-[40px] leading-[1.15]">
          How do you want to create your video?
        </h1>
        <p className="mt-2 text-[15.5px] leading-relaxed text-[var(--ink-3)]">
          Select a production engine. Scripting, medical-grade scenes, voice talent, and cited evidence are automatically derived from your brand dossier.
        </p>
      </div>

      {/* 2 Elevated Production Engine Cards */}
      <div className="grid gap-8 md:grid-cols-2 items-stretch">
        {/* ── CARD 1: MagicReel™ ── */}
        <div
          onMouseEnter={() => setReelHovered(true)}
          onMouseLeave={() => setReelHovered(false)}
          onClick={() => handleSelectMode("magic-reel")}
          className="group relative flex flex-col rounded-[26px] border border-[var(--hair-2)] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--brand)] hover:shadow-[0_16px_36px_-12px_rgba(253,72,22,0.18)] cursor-pointer"
        >
          {/* Top Visual Cinema Frame */}
          <div
            className="relative h-[240px] w-full overflow-hidden rounded-[20px] border border-white/10 shadow-inner"
            style={{ background: curReel.gradient }}
          >
            {/* Ambient Glow */}
            <div
              className="absolute inset-0 transition-all duration-700"
              style={{ background: curReel.glow, filter: "blur(32px)" }}
            />

            {/* Top Bar inside Video */}
            <div className="absolute left-3.5 top-3.5 right-3.5 z-10 flex items-center justify-between">
              <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md border border-white/15 shadow-sm">
                <Film className="size-3 text-[var(--brand-2)]" />
                <span>{curReel.badge}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-bold text-[var(--ink)] shadow-sm">
                <span>{curReel.aspect}</span>
              </div>
            </div>

            {/* Glowing Center Play Glyph */}
            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
              <div className="grid size-13 place-items-center rounded-full bg-gradient-to-tr from-[var(--brand-deep)] to-[var(--brand)] text-white shadow-[0_10px_28px_rgba(253,72,22,.65)] transition-transform duration-300 group-hover:scale-110">
                <Play className="size-5.5 fill-white ml-0.5" />
              </div>
            </div>

            {/* Navigation Chevrons */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setReelIndex((prev) => (prev - 1 + REEL_SAMPLES.length) % REEL_SAMPLES.length);
              }}
              className="absolute left-2.5 top-1/2 z-20 -translate-y-1/2 grid size-7.5 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/90"
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
              className="absolute right-2.5 top-1/2 z-20 -translate-y-1/2 grid size-7.5 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/90"
              aria-label="Next sample"
            >
              <ChevronRight className="size-4" />
            </button>

            {/* Live Subtitle and Citation Badge */}
            <div className="absolute bottom-9 left-4 right-4 z-10">
              <div className="text-[13px] font-semibold leading-snug text-white drop-shadow-md">
                {curReel.caption}
              </div>
              <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold text-[var(--brand-2)] backdrop-blur-md border border-white/10">
                <ShieldCheck className="size-3 text-[var(--brand-2)]" />
                <span>{curReel.citation}</span>
              </div>
            </div>

            {/* Carousel Navigation Pill Dashes */}
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
              {REEL_SAMPLES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setReelIndex(i);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    reelIndex === i ? "w-6 bg-[var(--brand)]" : "w-2 bg-white/40 hover:bg-white/75"
                  }`}
                  aria-label={`Go to sample ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Lower Description & Capability Details */}
          <div className="flex flex-1 flex-col p-4 pt-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-[10px] bg-[var(--tint)] text-[var(--brand)] border border-[var(--tint-line)]">
                  <Video className="size-5" />
                </div>
                <div>
                  <h2 className="text-[20px] font-[800] tracking-tight text-[var(--ink)]">MagicReel™</h2>
                  <span className="text-[12px] font-semibold text-[var(--ink-muted)]">Cinematic Medical Explainer</span>
                </div>
              </div>
              <span className="rounded-full bg-[var(--tint)] px-3 py-1 text-[11px] font-bold text-[var(--brand-deep)] border border-[var(--tint-line)] shadow-xs">
                Most Popular
              </span>
            </div>

            <p className="mt-3 text-[14px] leading-relaxed text-[var(--ink-2)]">
              Produce rich, multi-scene video explainers with 3D Mechanism of Action (MoA) visuals, broadcast voice talent, and verified evidence citations.
            </p>

            {/* Key Capabilities Checklist */}
            <div className="mt-5 space-y-2.5 border-t border-[var(--hair)] pt-4">
              <div className="flex items-center gap-2.5 text-[13px] text-[var(--ink-2)]">
                <div className="grid size-5 shrink-0 place-items-center rounded-full bg-[var(--ok-bg)] text-[var(--ok)]">
                  <Check className="size-3.5" strokeWidth={3} />
                </div>
                <span>3D Mechanism of Action (MoA) &amp; clinical scenes</span>
              </div>
              <div className="flex items-center gap-2.5 text-[13px] text-[var(--ink-2)]">
                <div className="grid size-5 shrink-0 place-items-center rounded-full bg-[var(--ok-bg)] text-[var(--ok)]">
                  <Check className="size-3.5" strokeWidth={3} />
                </div>
                <span>Studio voiceover &amp; background medical soundtrack</span>
              </div>
              <div className="flex items-center gap-2.5 text-[13px] text-[var(--ink-2)]">
                <div className="grid size-5 shrink-0 place-items-center rounded-full bg-[var(--ok-bg)] text-[var(--ok)]">
                  <Check className="size-3.5" strokeWidth={3} />
                </div>
                <span>Automated MLR claim citations from FDA/EMA label</span>
              </div>
              <div className="flex items-center gap-2.5 text-[13px] text-[var(--ink-2)]">
                <div className="grid size-5 shrink-0 place-items-center rounded-full bg-[var(--ok-bg)] text-[var(--ok)]">
                  <Check className="size-3.5" strokeWidth={3} />
                </div>
                <span>Multi-channel outputs: 16:9, 9:16, 1:1 format</span>
              </div>
            </div>

            {/* Bottom Meta & Action Button */}
            <div className="mt-auto pt-6">
              <div className="flex items-center justify-between border-t border-[var(--hair)] pt-3 text-[12px] font-medium text-[var(--ink-muted)]">
                <span>Duration: 30–180 seconds</span>
                <span className="font-bold text-[var(--brand-deep)]">HCP &amp; Patient Ready</span>
              </div>
              <button
                type="button"
                className="focus-ring mt-3.5 flex h-[48px] w-full items-center justify-center gap-2 rounded-[14px] bg-[var(--brand)] text-[14.5px] font-bold text-white shadow-[0_8px_20px_-6px_rgba(253,72,22,0.6)] transition-all duration-200 hover:bg-[var(--brand-deep)] hover:shadow-[0_12px_28px_-6px_rgba(253,72,22,0.7)]"
              >
                <span>Choose MagicReel™</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── CARD 2: MagicAvatar™ ── */}
        <div
          onMouseEnter={() => setAvatarHovered(true)}
          onMouseLeave={() => setAvatarHovered(false)}
          onClick={() => handleSelectMode("magic-avatar")}
          className="group relative flex flex-col rounded-[26px] border border-[var(--hair-2)] bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#2563eb] hover:shadow-[0_16px_36px_-12px_rgba(37,99,235,0.18)] cursor-pointer"
        >
          {/* Top Visual Cinema Frame */}
          <div
            className="relative h-[240px] w-full overflow-hidden rounded-[20px] border border-white/10 shadow-inner"
            style={{ background: curAvatar.gradient }}
          >
            {/* Ambient Glow */}
            <div
              className="absolute inset-0 transition-all duration-700"
              style={{ background: curAvatar.glow, filter: "blur(32px)" }}
            />

            {/* Top Bar inside Video */}
            <div className="absolute left-3.5 top-3.5 right-3.5 z-10 flex items-center justify-between">
              <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md border border-white/15 shadow-sm">
                <UserCheck className="size-3 text-[#60a5fa]" />
                <span>{curAvatar.badge}</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-bold text-[var(--ink)] shadow-sm">
                <span>{curAvatar.aspect}</span>
              </div>
            </div>

            {/* Glowing Center Play Glyph */}
            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
              <div className="grid size-13 place-items-center rounded-full bg-gradient-to-tr from-[#1d4ed8] to-[#2563eb] text-white shadow-[0_10px_28px_rgba(37,99,235,.65)] transition-transform duration-300 group-hover:scale-110">
                <Play className="size-5.5 fill-white ml-0.5" />
              </div>
            </div>

            {/* Navigation Chevrons */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setAvatarIndex((prev) => (prev - 1 + AVATAR_SAMPLES.length) % AVATAR_SAMPLES.length);
              }}
              className="absolute left-2.5 top-1/2 z-20 -translate-y-1/2 grid size-7.5 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/90"
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
              className="absolute right-2.5 top-1/2 z-20 -translate-y-1/2 grid size-7.5 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/90"
              aria-label="Next sample"
            >
              <ChevronRight className="size-4" />
            </button>

            {/* Live Subtitle and Doctor Persona Badge */}
            <div className="absolute bottom-9 left-4 right-4 z-10">
              <div className="text-[13px] font-semibold leading-snug text-white drop-shadow-md">
                {curAvatar.caption}
              </div>
              <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold text-[#93c5fd] backdrop-blur-md border border-white/10">
                <UserCheck className="size-3 text-[#93c5fd]" />
                <span>{curAvatar.citation}</span>
              </div>
            </div>

            {/* Carousel Navigation Pill Dashes */}
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
              {AVATAR_SAMPLES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAvatarIndex(i);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    avatarIndex === i ? "w-6 bg-[#3b82f6]" : "w-2 bg-white/40 hover:bg-white/75"
                  }`}
                  aria-label={`Go to sample ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Lower Description & Capability Details */}
          <div className="flex flex-1 flex-col p-4 pt-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-[10px] bg-[#eff6ff] text-[#2563eb] border border-[#dbeafe]">
                  <Tv className="size-5" />
                </div>
                <div>
                  <h2 className="text-[20px] font-[800] tracking-tight text-[var(--ink)]">MagicAvatar™</h2>
                  <span className="text-[12px] font-semibold text-[var(--ink-muted)]">Clinical Presenter &amp; KOLs</span>
                </div>
              </div>
              <span className="rounded-full bg-[#eff6ff] px-3 py-1 text-[11px] font-bold text-[#1d4ed8] border border-[#dbeafe] shadow-xs">
                Digital Twin
              </span>
            </div>

            <p className="mt-3 text-[14px] leading-relaxed text-[var(--ink-2)]">
              Deliver presenter-led clinical briefings with photorealistic AI doctor avatars, synchronized slide overlays, and medical-grade lip-sync.
            </p>

            {/* Key Capabilities Checklist */}
            <div className="mt-5 space-y-2.5 border-t border-[var(--hair)] pt-4">
              <div className="flex items-center gap-2.5 text-[13px] text-[var(--ink-2)]">
                <div className="grid size-5 shrink-0 place-items-center rounded-full bg-[#eff6ff] text-[#2563eb]">
                  <Check className="size-3.5" strokeWidth={3} />
                </div>
                <span>Verified Key Opinion Leader (KOL) doctor avatars</span>
              </div>
              <div className="flex items-center gap-2.5 text-[13px] text-[var(--ink-2)]">
                <div className="grid size-5 shrink-0 place-items-center rounded-full bg-[#eff6ff] text-[#2563eb]">
                  <Check className="size-3.5" strokeWidth={3} />
                </div>
                <span>Picture-in-picture clinical trial slide overlays</span>
              </div>
              <div className="flex items-center gap-2.5 text-[13px] text-[var(--ink-2)]">
                <div className="grid size-5 shrink-0 place-items-center rounded-full bg-[#eff6ff] text-[#2563eb]">
                  <Check className="size-3.5" strokeWidth={3} />
                </div>
                <span>Precise medical phonetics &amp; natural lip-sync</span>
              </div>
              <div className="flex items-center gap-2.5 text-[13px] text-[var(--ink-2)]">
                <div className="grid size-5 shrink-0 place-items-center rounded-full bg-[#eff6ff] text-[#2563eb]">
                  <Check className="size-3.5" strokeWidth={3} />
                </div>
                <span>16:9 Studio broadcast or 9:16 mobile briefings</span>
              </div>
            </div>

            {/* Bottom Meta & Action Button */}
            <div className="mt-auto pt-6">
              <div className="flex items-center justify-between border-t border-[var(--hair)] pt-3 text-[12px] font-medium text-[var(--ink-muted)]">
                <span>Duration: 30–90 seconds</span>
                <span className="font-bold text-[#1d4ed8]">KOL &amp; Medical Affairs</span>
              </div>
              <button
                type="button"
                className="focus-ring mt-3.5 flex h-[48px] w-full items-center justify-center gap-2 rounded-[14px] bg-[#2563eb] text-[14.5px] font-bold text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.6)] transition-all duration-200 hover:bg-[#1d4ed8] hover:shadow-[0_12px_28px_-6px_rgba(37,99,235,0.7)]"
              >
                <span>Choose MagicAvatar™</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
