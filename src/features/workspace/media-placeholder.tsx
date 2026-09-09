"use client";

import { BarChart3, Clock, ImageIcon, Layers, Video } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ElementTiming } from "@/types/content";
import { elementMotion, motionTransition } from "@/features/workspace/element-motion";

/**
 * A media asset that has not arrived yet.
 *
 * This is not a spinner in a grey box. The placeholder already carries the
 * three things a layout decision depends on — where the asset sits, the
 * seconds it is on screen, and how it enters — so the frame is finished before
 * the asset exists. That is what makes editing during generation safe: an
 * arriving asset changes what is inside the box and nothing about the box.
 *
 * It follows that this component must be given real timing, not placeholder
 * timing. A guess here would move the frame later, which is the exact thing
 * the two-phase generation is designed to avoid.
 *
 * Solid rather than translucent on purpose. A see-through box over a dark
 * stage reads as a rendering fault — something that failed to paint — where a
 * filled panel reads as a slot that is reserved and occupied.
 */
export function MediaPlaceholder({
  kind,
  label,
  timing,
  currentTime,
  onSelect,
  selected = false,
  className,
}: {
  kind: "image" | "video" | "background" | "graph";
  /** What is coming, e.g. "Cardiac & Vascular Model". */
  label: string;
  /**
   * The element's real in/out and transition, from the scene. Optional
   * because a scene may not declare one — and in that case the box says so
   * rather than showing invented seconds.
   */
  timing?: ElementTiming;
  /**
   * The scene playhead in seconds. The slot honours its own in and out against
   * this and plays its transitions, so you can watch how the asset will enter
   * and leave before there is an asset. Omit it and the slot is always shown.
   */
  currentTime?: number;
  /**
   * Select this slot. A generating slot has to be selectable — it is the
   * moment you are most likely to want to say something about the asset, and
   * the real element it stands in for is selectable, so the stand-in must be
   * too or the canvas loses a capability halfway through every render.
   */
  onSelect?: () => void;
  selected?: boolean;
  className?: string;
}) {
  const Icon = kind === "video" ? Video : kind === "image" ? ImageIcon : kind === "graph" ? BarChart3 : Layers;
  const noun = kind === "video" ? "Video" : kind === "image" ? "Image" : kind === "graph" ? "Chart" : "Background";

  // The same motion the real asset will use — see element-motion.
  const motion = elementMotion(timing, currentTime);
  const { onScreen } = motion;

  return (
    <div
      style={{
        ...motionTransition(motion.durationMs),
        opacity: motion.opacity,
        transform: motion.transform || "none",
      }}
      onClick={(e) => {
        // Stops the stage's click-to-deselect from undoing the selection.
        e.stopPropagation();
        onSelect?.();
      }}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-control border bg-[#0e1a16]",
        onSelect && "pointer-events-auto cursor-pointer",
        selected ? "border-brand ring-2 ring-brand/25" : "border-white/12",
        // Off its own window it takes no space and no clicks, exactly as the
        // real asset will not.
        !onScreen && "pointer-events-none",
        className
      )}
      aria-hidden={!onScreen}
      aria-busy
      aria-label={`${noun} generating — ${label}${timing ? ` — ${timing.inAt}s to ${timing.outAt}s, ${timing.transitionIn}` : ""}`}
    >
      {/* The sweep says work in progress; the solid ground beneath it says the
          slot is real. Both are needed — the sweep alone on a transparent box
          just looks like a broken asset shimmering. */}
      <span aria-hidden className="shimmer pointer-events-none absolute inset-0" />

      {/* ── What it is, in the middle ── */}
      <div className="relative flex flex-1 flex-col items-center justify-center gap-2 px-3 py-4 text-center">
        <span className="grid size-9 place-items-center rounded-chip border border-white/12 bg-white/8">
          <Icon className="size-4 text-white/80" />
        </span>

        <span className="text-body-lg font-[850] tracking-tight text-white">{noun}</span>

        <span className="dot-cycle inline-flex items-baseline text-label font-bold text-white/60">
          Generating
          <span aria-hidden>.</span>
          <span aria-hidden>.</span>
          <span aria-hidden>.</span>
        </span>

        <span className="line-clamp-2 max-w-[92%] text-caption leading-snug text-white/45">
          {label}
        </span>
      </div>

      {/* ── The part that makes the frame final ── */}
      <div className="relative border-t border-white/10 px-2.5 py-1.5">
        {timing ? (
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-micro text-white/55">
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Clock className="size-2.5" />
              {timing.inAt.toFixed(1)}s – {timing.outAt.toFixed(1)}s
            </span>
            <span className="text-white/25">·</span>
            <span className="truncate">{timing.transitionIn}</span>
          </div>
        ) : (
          <div className="text-center text-micro italic text-white/40">
            Timing not set for this element
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Audio still rendering, under the frame.
 *
 * Voice-over and sound effects were the two assets with no generating state at
 * all — they simply were not there and then they were, with nothing saying a
 * render was in flight. They get the same treatment as the visual slots and
 * for the same reason: the timing is known before the audio exists, so it can
 * be shown.
 *
 * A pill rather than a box because audio occupies no space in the frame. It
 * shimmers while rendering and is gone once the take lands — a finished asset
 * needs no label.
 */
export function AudioGeneratingPill({
  label,
  timing,
}: {
  label: string;
  timing?: ElementTiming;
}) {
  return (
    <div
      aria-busy
      aria-label={`${label} generating${timing ? ` — ${timing.inAt}s to ${timing.outAt}s` : ""}`}
      className="relative inline-flex items-center gap-2.5 overflow-hidden rounded-chip bg-brand px-3.5 py-2 shadow-brand-lift"
    >
      <span aria-hidden className="shimmer pointer-events-none absolute inset-0" />
      <span className="relative text-body-lg font-[850] text-white">{label}</span>
      <span className="dot-cycle relative inline-flex items-baseline text-label font-bold italic text-white/80">
        Generating
        <span aria-hidden>.</span>
        <span aria-hidden>.</span>
        <span aria-hidden>.</span>
      </span>
      {timing && (
        <span className="relative text-caption tabular-nums text-white/60">
          {timing.inAt.toFixed(1)}s – {timing.outAt.toFixed(1)}s
        </span>
      )}
    </div>
  );
}
