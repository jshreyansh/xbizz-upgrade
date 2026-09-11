"use client";

import { BarChart3, ImageIcon, Layers } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * The art on a page, before and after it exists.
 *
 * Art occupies a slot the layout reserves for it, not a floating box over the
 * page. The first version placed layers absolutely at percentages of the page
 * and they landed on top of the copy — a packshot across the headline, a chart
 * across the stat. Percentages are only meaningful against a composition, and
 * the composition is exactly what changes when the page shape does.
 *
 * So the layout reserves the space and the art fills it. That keeps the
 * property the two-pass generation depends on — the box is settled before the
 * art exists, so an arriving render never reflows the page — and it makes the
 * box a real part of the composition rather than a guess laid over it.
 */
export interface ArtLayerView {
  id: string;
  label: string;
  kind: "image" | "graph" | "background";
  /** Which block reserves room for it. */
  slot: "header" | "heroStat" | "moa" | "chart" | "page";
  z: number;
  /** Milliseconds from the start of generation when this art lands. */
  readyAt: number;
}

/** The glyph for a layer kind, as a component rather than a local binding:
 *  a capitalised value assigned during render is a component created during
 *  render, which resets its own state on every pass. */
function KindGlyph({ kind, className }: { kind: ArtLayerView["kind"]; className?: string }) {
  if (kind === "graph") return <BarChart3 className={className} />;
  if (kind === "background") return <Layers className={className} />;
  return <ImageIcon className={className} />;
}

/**
 * One reserved slot, filling whatever the layout gave it.
 *
 * Solid rather than translucent while it waits, and carrying its own label and
 * countdown, for the same reason the video flow's placeholder does: a
 * see-through box reads as a rendering fault, where a filled panel reads as a
 * slot that is reserved. The seconds are the real schedule — a wrong number
 * here would be worse than none.
 */
export function ArtSlot({
  layer,
  elapsed,
  selected,
  onSelect,
  interactive,
  className,
}: {
  layer: ArtLayerView;
  /** Milliseconds since generation began. */
  elapsed: number;
  selected?: boolean;
  onSelect?: (id: string) => void;
  /** Review mode is a finished asset: nothing on it is selectable. */
  interactive?: boolean;
  className?: string;
}) {
  const ready = elapsed >= layer.readyAt;
  const secondsLeft = Math.max(0, Math.ceil((layer.readyAt - elapsed) / 1000));

  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-busy={!ready}
      aria-label={ready ? layer.label : `${layer.label} generating — ${secondsLeft}s`}
      onClick={(e) => {
        if (!interactive) return;
        e.stopPropagation();
        onSelect?.(layer.id);
      }}
      className={cn(
        "relative flex min-w-0 items-center justify-center overflow-hidden rounded-control border transition",
        interactive && "cursor-pointer",
        ready
          ? layer.kind === "graph"
            ? "border-info-line bg-[linear-gradient(180deg,#f4f8ff_0%,#e7efff_100%)]"
            : "border-tint-line bg-[linear-gradient(160deg,#1a2740_0%,#2b1a12_100%)]"
          : "border-white/12 bg-[#0e1a16]",
        selected && "border-brand ring-2 ring-brand/25",
        className
      )}
    >
      {ready ? <FinishedArt layer={layer} /> : <PendingArt layer={layer} secondsLeft={secondsLeft} />}
    </div>
  );
}

function PendingArt({ layer, secondsLeft }: { layer: ArtLayerView; secondsLeft: number }) {
  return (
    <>
      <span aria-hidden className="shimmer pointer-events-none absolute inset-0" />
      <div className="relative flex min-w-0 flex-col items-center gap-0.5 px-2 py-1.5 text-center">
        <span className="grid size-6 place-items-center rounded-chip border border-white/12 bg-white/8">
          <KindGlyph kind={layer.kind} className="size-3 text-white/80" />
        </span>
        <span className="dot-cycle inline-flex items-baseline text-micro font-bold text-white/60">
          Generating
          <span aria-hidden>.</span>
          <span aria-hidden>.</span>
          <span aria-hidden>.</span>
        </span>
        <span className="line-clamp-1 max-w-full text-micro leading-snug text-white/45">{layer.label}</span>
        <span className="text-micro font-bold tabular-nums text-white/70">{secondsLeft}s</span>
      </div>
    </>
  );
}

/** The art, once it has landed. Same slot, same size — only the contents. */
function FinishedArt({ layer }: { layer: ArtLayerView }) {
  return (
    <>
      {layer.kind === "graph" ? (
        <div className="absolute inset-0 flex items-end gap-[6%] px-[8%] pb-[12%]">
          {[38, 62, 81, 74, 90].map((h, i) => (
            <span
              key={i}
              style={{ height: `${h}%` }}
              className={cn("flex-1 rounded-t-[2px]", i === 4 ? "bg-brand" : "bg-info-strong/35")}
            />
          ))}
        </div>
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_30%_25%,rgba(255,138,76,0.42),transparent_62%),radial-gradient(60%_60%_at_78%_80%,rgba(125,211,252,0.3),transparent_60%)]" />
      )}

      <span
        className={cn(
          "absolute bottom-1 left-1 inline-flex max-w-[calc(100%-0.5rem)] items-center gap-1 rounded-glyph px-1.5 py-0.5 text-micro font-bold",
          layer.kind === "graph" ? "bg-card/85 text-ink-2" : "bg-black/45 text-white/85"
        )}
      >
        <KindGlyph kind={layer.kind} className="size-2.5 shrink-0" />
        <span className="truncate">{layer.label}</span>
      </span>
    </>
  );
}

/**
 * The page's background wash — the one layer that genuinely is an overlay,
 * because it sits behind everything rather than taking space from anything.
 */
export function PageBackgroundArt({
  layer,
  elapsed,
}: {
  layer: ArtLayerView | undefined;
  elapsed: number;
}) {
  if (!layer) return null;
  const ready = elapsed >= layer.readyAt;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      {ready ? (
        <div className="h-full w-full bg-[radial-gradient(120%_90%_at_82%_-10%,rgba(253,72,22,0.07),transparent_58%),radial-gradient(100%_80%_at_-10%_110%,rgba(29,78,216,0.07),transparent_55%)]" />
      ) : (
        <span className="shimmer absolute inset-0 bg-[#0d1521]/[0.04]" />
      )}
    </div>
  );
}
