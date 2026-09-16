"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * One starting point on a Create screen — video or creative, same shape.
 *
 * The example comes first and the words come after it, because what you are
 * choosing between is the kind of thing being made, and the picture says that
 * faster than the label does. Each tile holds two or three examples: they
 * cycle while you point at one, with arrows and dots to walk them yourself,
 * so you can see the range without committing to a tile to find out.
 */
export interface StartingPointExample {
  id: string;
  /** Behind the frame, and the whole surface for a composition. */
  bg: string;
  /** Video tiles. */
  videoSrc?: string;
  /** Composition tiles — a still the card draws itself. */
  badge?: string;
  aspect?: string;
  eyebrow?: string;
  metric?: string;
  metricLabel?: string;
  caption?: string;
  citation?: string;
}

const ROTATE_MS = 4000;

export function StartingPointCard({
  title,
  subtitle,
  examples,
  onSelect,
  delayMs = 0,
  badgeIcon,
}: {
  title: string;
  subtitle: string;
  examples: StartingPointExample[];
  onSelect: () => void;
  delayMs?: number;
  badgeIcon?: React.ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const current = examples[index] ?? examples[0];
  const many = examples.length > 1;

  /* Cycling belongs to the tile you are pointing at. Six tiles rotating on
     their own is six things moving while you read the seventh. */
  useEffect(() => {
    if (!hovered || !many) return;
    const t = setInterval(() => setIndex((p) => (p + 1) % examples.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [hovered, many, examples.length]);

  /* A clip runs while pointed at and holds a painted frame otherwise, so a
     screen of tiles is one decoder rather than six. */
  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;
    if (hovered) void node.play().catch(() => {});
    else node.pause();
  }, [hovered, index]);

  const step = (delta: number) =>
    setIndex((p) => (p + delta + examples.length) % examples.length);

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rise-in-stagger group overflow-hidden rounded-card border border-hair bg-card text-left shadow-soft transition-all duration-200 hover:-translate-y-1"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div
        className="relative aspect-video overflow-hidden"
        style={{ background: current.bg }}
      >
        {current.videoSrc ? (
          <video
            key={current.id}
            ref={videoRef}
            src={current.videoSrc}
            loop
            muted
            playsInline
            preload="auto"
            // Nudged off zero so a frame is decoded and painted: a video parked
            // at 0 with no poster renders as an empty box in some browsers.
            onLoadedData={(e) => {
              if (e.currentTarget.currentTime === 0) e.currentTarget.currentTime = 0.1;
            }}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-85"
          />
        ) : (
          /* A composition draws itself: the same figure and citation the real
             page would lead on, at tile size. */
          /* Every line is clamped and every row can shrink: the tile is a
             third of a row wide on a laptop, and a figure that wraps onto the
             caption below it is the one thing this frame must not do. */
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between gap-2 p-4">
            <div className="flex min-w-0 items-center justify-between gap-2">
              {current.badge && (
                <span className="inline-flex min-w-0 items-center gap-1.5 rounded-chip border border-white/10 bg-black/60 px-2.5 py-1 text-label font-bold text-white backdrop-blur-md">
                  {badgeIcon}
                  <span className="truncate">{current.badge}</span>
                </span>
              )}
              {current.aspect && (
                <span className="shrink-0 rounded-chip bg-white/90 px-2.5 py-0.5 text-caption font-bold text-ink shadow-xs">
                  {current.aspect}
                </span>
              )}
            </div>

            <div className="min-w-0">
              {current.eyebrow && (
                <div className="truncate text-label font-bold uppercase tracking-wider text-white/70">
                  {current.eyebrow}
                </div>
              )}
              <div className="truncate text-display font-black leading-tight tracking-tight text-white">
                {current.metric}
              </div>
              {current.metricLabel && (
                <div className="truncate text-body font-semibold text-ok-on-dark">{current.metricLabel}</div>
              )}
            </div>

            <div className="min-w-0">
              {current.caption && (
                <p className="line-clamp-2 text-body font-semibold leading-snug text-white drop-shadow-md">
                  {current.caption}
                </p>
              )}
              {current.citation && (
                <span className="mt-1.5 inline-flex max-w-full items-center gap-1 rounded-glyph border border-white/10 bg-black/60 px-2 py-0.5 text-caption font-medium text-white/85 backdrop-blur-sm">
                  <Check className="size-2.5 shrink-0 text-ok-on-dark" />
                  <span className="truncate">{current.citation}</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Walk the examples yourself. Only on hover — at rest a tile is a
            picture and a name, not a control panel. */}
        {many && (
          <>
            <span
              role="button"
              tabIndex={-1}
              aria-label="Previous example"
              onClick={(e) => { e.stopPropagation(); step(-1); }}
              className="absolute left-2.5 top-1/2 z-20 grid size-7 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <ChevronLeft className="size-4" />
            </span>
            <span
              role="button"
              tabIndex={-1}
              aria-label="Next example"
              onClick={(e) => { e.stopPropagation(); step(1); }}
              className="absolute right-2.5 top-1/2 z-20 grid size-7 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <ChevronRight className="size-4" />
            </span>
            <div className="pointer-events-none absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              {examples.map((ex, i) => (
                <span
                  key={ex.id}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === index ? "w-4 bg-brand" : "w-1.5 bg-white/45"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-3.5">
        <h3 className="text-body-lg font-[800] text-ink">{title}</h3>
        <p className="mt-0.5 text-label text-ink-3">{subtitle}</p>
      </div>
    </button>
  );
}
