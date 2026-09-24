"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Eye, X } from "lucide-react";
import { Portal } from "@/components/ui/portal";
import { cn } from "@/lib/cn";

/**
 * One starting point on a Create screen — video or creative, same shape.
 *
 * The example comes first and the words come after it, because what you are
 * choosing between is the kind of thing being made, and the picture says that
 * faster than the label does. Each tile holds two or three examples and
 * cycles through them on its own, so the range is visible without having to
 * point at every tile to find it.
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

/**
 * The example itself, drawn once.
 *
 * A tile shows it at card size and the preview shows it filling a dialog;
 * they have to be the same picture or the preview is of something else. So
 * the frame is a component, and only the scale changes.
 */
function ExampleFrame({
  example,
  large,
  videoRef,
  controls,
}: {
  example: StartingPointExample;
  /** Type steps up with the frame — a caption sized for a tile disappears. */
  large?: boolean;
  videoRef?: React.Ref<HTMLVideoElement>;
  controls?: boolean;
}) {
  if (example.videoSrc) {
    return (
      <>
        <video
          key={example.id}
          ref={videoRef}
          src={example.videoSrc}
          loop
          muted
          autoPlay={controls}
          controls={controls}
          playsInline
          preload="auto"
          // Nudged off zero so a frame is decoded and painted: a video parked
          // at 0 with no poster renders as an empty box in some browsers.
          onLoadedData={(e) => {
            if (e.currentTarget.currentTime === 0) e.currentTarget.currentTime = 0.1;
          }}
          className={cn(
            "absolute inset-0 h-full w-full object-cover opacity-85",
            !controls && "pointer-events-none"
          )}
        />
      </>
    );
  }

  /* A composition draws itself: the same figure and citation the real page
     would lead on. Every line is clamped and every row can shrink — at tile
     size this frame is a third of a row wide, and a figure that wraps onto
     the caption below it is the one thing it must not do. */
  return (
    <div className={cn("pointer-events-none absolute inset-0 flex flex-col justify-between", large ? "gap-4 p-8" : "gap-2 p-4")}>
      <div className="min-w-0">
        {example.eyebrow && (
          <div className={cn("truncate font-bold uppercase tracking-wider text-white/70", large ? "text-body" : "text-label")}>
            {example.eyebrow}
          </div>
        )}
        <div className={cn("truncate font-black leading-tight tracking-tight text-white", large ? "text-hero" : "text-display")}>
          {example.metric}
        </div>
        {example.metricLabel && (
          <div className={cn("truncate font-semibold text-ok-on-dark", large ? "text-body-lg" : "text-body")}>
            {example.metricLabel}
          </div>
        )}
      </div>

      <div className="min-w-0">
        {example.caption && (
          <p className={cn("font-semibold leading-snug text-white drop-shadow-md", large ? "max-w-[60ch] text-body-lg" : "line-clamp-2 text-body")}>
            {example.caption}
          </p>
        )}
        {example.citation && (
          <span className={cn("mt-1.5 inline-flex max-w-full items-center gap-1 rounded-glyph border border-white/10 bg-black/60 px-2 py-0.5 font-medium text-white/85 backdrop-blur-sm", large ? "text-body" : "text-caption")}>
            <Check className="size-2.5 shrink-0 text-ok-on-dark" />
            <span className="truncate">{example.citation}</span>
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * The example, at the size it was made for.
 *
 * Clicking a tile starts a project, which is a commitment you should be able
 * to make after looking rather than in order to look. So Preview is its own
 * control and its own dialog: the same frame the tile draws, filling the
 * screen, with the tile's other examples a click away and the way in still
 * offered at the bottom.
 */
export function StartingPointPreviewModal({
  title,
  subtitle,
  examples,
  index,
  onIndex,
  onClose,
}: {
  title: string;
  subtitle: string;
  examples: StartingPointExample[];
  index: number;
  onIndex: (next: number) => void;
  onClose: () => void;
}) {
  const many = examples.length > 1;
  const current = examples[Math.min(index, examples.length - 1)] ?? examples[0];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (many && event.key === "ArrowRight") onIndex((index + 1) % examples.length);
      if (many && event.key === "ArrowLeft") onIndex((index - 1 + examples.length) % examples.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onIndex, index, examples.length, many]);

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[9999] grid place-items-center bg-ink/60 p-4 backdrop-blur-sm sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label={`${title} preview`}
        onClick={onClose}
      >
        <div
          className="flex max-h-[92vh] w-full max-w-[900px] flex-col overflow-hidden rounded-card border border-hair bg-card shadow-float"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-hair bg-canvas px-5 py-3.5">
            <div className="min-w-0">
              <span className="truncate text-body-lg font-extrabold text-ink">{title}</span>
              <p className="truncate text-label text-ink-3">{subtitle}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-ink-3 transition hover:bg-black/5 hover:text-ink"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-[#0b0d12] p-4">
            <div
              className="relative mx-auto w-full max-w-[760px] overflow-hidden rounded-control"
              style={{ aspectRatio: "16 / 9", background: current.bg }}
            >
              <ExampleFrame example={current} large controls={Boolean(current.videoSrc)} />
            </div>
          </div>

          {/* Paging only. The preview is for looking; committing to a
              starting point is what the tile behind it is for, and putting
              the same commitment inside the look made the dialog a second
              way to start a project. */}
          {many && (
            <div className="flex shrink-0 items-center justify-center gap-2 border-t border-hair bg-canvas px-5 py-3">
              <button
                type="button"
                onClick={() => onIndex((index - 1 + examples.length) % examples.length)}
                aria-label="Previous example"
                className="grid size-7 cursor-pointer place-items-center rounded-full text-ink-3 transition hover:bg-black/5 hover:text-ink"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="text-caption font-bold tabular-nums text-ink-4">
                {Math.min(index, examples.length - 1) + 1} / {examples.length}
              </span>
              <button
                type="button"
                onClick={() => onIndex((index + 1) % examples.length)}
                aria-label="Next example"
                className="grid size-7 cursor-pointer place-items-center rounded-full text-ink-3 transition hover:bg-black/5 hover:text-ink"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}

export function StartingPointCard({
  title,
  subtitle,
  examples,
  onSelect,
  delayMs = 0,
}: {
  title: string;
  subtitle: string;
  examples: StartingPointExample[];
  onSelect: () => void;
  delayMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const current = examples[index] ?? examples[0];
  const many = examples.length > 1;

  /* Cycling belongs to the tile you are pointing at. Six tiles playing and
     rotating on their own is six things moving while you read the seventh. */
  useEffect(() => {
    if (!hovered || !many || previewing) return;
    const t = setInterval(() => setIndex((p) => (p + 1) % examples.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [hovered, many, previewing, examples.length]);

  /* A clip runs while pointed at and holds a painted frame otherwise, so a
     screen of tiles is one decoder rather than six. */
  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;
    if (hovered && !previewing) void node.play().catch(() => {});
    else node.pause();
  }, [hovered, previewing, index]);

  const step = (delta: number) =>
    setIndex((p) => (p + delta + examples.length) % examples.length);

  return (
    <>
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
        <ExampleFrame example={current} videoRef={videoRef} />

        {/* Looking is not choosing. The tile starts a project, so the one
            thing you might want first — a proper look — gets a control of
            its own. Bottom right, because bottom centre is where the tile
            already says how many examples it holds. */}
        <span
          role="button"
          tabIndex={-1}
          aria-label={`Preview ${title}`}
          onClick={(e) => { e.stopPropagation(); setPreviewing(true); }}
          className="absolute bottom-2.5 right-2.5 z-20 inline-flex cursor-pointer items-center gap-1.5 rounded-chip bg-card px-2.5 py-1.5 text-label font-bold text-ink shadow-soft opacity-0 transition-all duration-200 hover:bg-tint hover:text-brand-deep group-hover:opacity-100"
        >
          <Eye className="size-3.5" />
          Preview
        </span>

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

    {previewing && (
      <StartingPointPreviewModal
        title={title}
        subtitle={subtitle}
        examples={examples}
        index={index}
        onIndex={setIndex}
        onClose={() => setPreviewing(false)}
       
      />
    )}
    </>
  );
}
