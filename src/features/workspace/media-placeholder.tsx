"use client";

import { Clock, ImageIcon, Layers, Video } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ElementTiming } from "@/types/content";

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
 */
export function MediaPlaceholder({
  kind,
  label,
  timing,
  className,
}: {
  kind: "image" | "video" | "background";
  /** What is coming, e.g. "Cardiac & Vascular Model". */
  label: string;
  /**
   * The element's real in/out and transition, from the scene. Optional
   * because a scene may not declare one — and in that case the box says so
   * rather than showing invented seconds.
   */
  timing?: ElementTiming;
  className?: string;
}) {
  const Icon = kind === "video" ? Video : kind === "image" ? ImageIcon : Layers;
  const noun = kind === "video" ? "Video" : kind === "image" ? "Image" : "Background";

  return (
    <div
      className={cn(
        "relative flex flex-col justify-between overflow-hidden rounded-control border border-dashed border-white/25 bg-white/5 p-2.5",
        className
      )}
      aria-busy
      aria-label={`${noun} generating — ${label}${timing ? ` — ${timing.inAt}s to ${timing.outAt}s, ${timing.transitionIn}` : ""}`}
    >
      {/* The sweep reads as work in progress rather than a broken asset. */}
      <span aria-hidden className="shimmer pointer-events-none absolute inset-0" />

      <div className="relative flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5">
          <Icon className="size-3 shrink-0 text-white/70" />
          <span className="truncate text-micro font-extrabold uppercase tracking-wider text-white/70">
            {noun}
          </span>
        </span>
        <span className="shrink-0 rounded-glyph bg-white/15 px-1.5 py-0.5 text-micro font-bold text-white/80">
          Generating
        </span>
      </div>

      <div className="relative min-w-0">
        <p className="truncate text-caption font-bold text-white/85">{label}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-micro text-white/60">
          {timing ? (
            <>
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Clock className="size-2.5" />
                {timing.inAt.toFixed(1)}s – {timing.outAt.toFixed(1)}s
              </span>
              <span className="text-white/30">·</span>
              <span className="truncate">{timing.transitionIn}</span>
            </>
          ) : (
            <span className="italic text-white/45">Timing not set for this element</span>
          )}
        </div>
      </div>
    </div>
  );
}
