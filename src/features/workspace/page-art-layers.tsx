"use client";

import { BarChart3, ImageIcon, Layers } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * The art on a page, before and after it exists.
 *
 * Layers are absolutely placed in percentages of the page box and painted in
 * z-order, so the layout pass can settle every position while the art is still
 * rendering. That is the whole point of splitting the two passes: an arriving
 * render changes what is inside a box, never where the box is — so a page you
 * are editing at twenty seconds does not jump at forty.
 *
 * Percentages rather than pixels because the page is zoomed by the studio
 * control and can be A4, 16:9 or 3:4. A pixel box would be right at 100% on
 * one shape and wrong everywhere else.
 */
export interface ArtLayerView {
  id: string;
  label: string;
  kind: "image" | "graph" | "background";
  box: { x: number; y: number; w: number; h: number };
  z: number;
  readyAt: number;
}

export function PageArtLayers({
  layers,
  elapsed,
  selectedId,
  onSelect,
  interactive,
}: {
  layers: ArtLayerView[];
  /** Milliseconds since generation began. */
  elapsed: number;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** Review mode is a finished asset: nothing on it is selectable. */
  interactive?: boolean;
}) {
  return (
    <div aria-hidden={false} className="pointer-events-none absolute inset-0">
      {[...layers]
        .sort((a, b) => a.z - b.z)
        .map((layer) => {
          const ready = elapsed >= layer.readyAt;
          const selected = selectedId === layer.id;
          return (
            <div
              key={layer.id}
              style={{
                left: `${layer.box.x}%`,
                top: `${layer.box.y}%`,
                width: `${layer.box.w}%`,
                height: `${layer.box.h}%`,
                zIndex: layer.z,
              }}
              className={cn("absolute", interactive && "pointer-events-auto")}
            >
              {ready ? (
                <FinishedArt layer={layer} selected={selected} onSelect={onSelect} interactive={interactive} />
              ) : (
                <PendingArt layer={layer} elapsed={elapsed} selected={selected} onSelect={onSelect} interactive={interactive} />
              )}
            </div>
          );
        })}
    </div>
  );
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
 * A slot whose art has not arrived.
 *
 * Solid rather than translucent, and carrying its own label and countdown,
 * for the same reason the video flow's placeholder does: a see-through box
 * reads as a rendering fault, where a filled panel reads as a slot that is
 * reserved. The seconds are the real schedule, not a guess — a wrong number
 * here is worse than none.
 */
function PendingArt({
  layer,
  elapsed,
  selected,
  onSelect,
  interactive,
}: {
  layer: ArtLayerView;
  elapsed: number;
  selected?: boolean;
  onSelect?: (id: string) => void;
  interactive?: boolean;
}) {
  const secondsLeft = Math.max(0, Math.ceil((layer.readyAt - elapsed) / 1000));
  const background = layer.kind === "background";

  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-busy
      aria-label={`${layer.label} generating — ${secondsLeft}s`}
      onClick={(e) => {
        if (!interactive) return;
        e.stopPropagation();
        onSelect?.(layer.id);
      }}
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center gap-1 overflow-hidden border",
        background ? "rounded-none bg-[#0d1521]/[0.04]" : "rounded-control bg-[#0e1a16]",
        interactive && "cursor-pointer",
        selected ? "border-brand ring-2 ring-brand/25" : background ? "border-transparent" : "border-white/12"
      )}
    >
      <span aria-hidden className="shimmer pointer-events-none absolute inset-0" />
      {!background && (
        <>
          <span className="relative grid size-7 place-items-center rounded-chip border border-white/12 bg-white/8">
            <KindGlyph kind={layer.kind} className="size-3.5 text-white/80" />
          </span>
          <span className="dot-cycle relative inline-flex items-baseline text-micro font-bold text-white/60">
            Generating
            <span aria-hidden>.</span>
            <span aria-hidden>.</span>
            <span aria-hidden>.</span>
          </span>
          <span className="relative line-clamp-2 max-w-[90%] px-2 text-center text-micro leading-snug text-white/45">
            {layer.label}
          </span>
          <span className="relative text-micro font-bold tabular-nums text-white/70">{secondsLeft}s</span>
        </>
      )}
    </div>
  );
}

/** The art, once it has landed. Same box, same z — only the contents changed. */
function FinishedArt({
  layer,
  selected,
  onSelect,
  interactive,
}: {
  layer: ArtLayerView;
  selected?: boolean;
  onSelect?: (id: string) => void;
  interactive?: boolean;
}) {
  if (layer.kind === "background") {
    return (
      <div
        aria-label={layer.label}
        className="h-full w-full bg-[radial-gradient(120%_90%_at_82%_-10%,rgba(253,72,22,0.07),transparent_58%),radial-gradient(100%_80%_at_-10%_110%,rgba(29,78,216,0.07),transparent_55%)]"
      />
    );
  }

  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={layer.label}
      onClick={(e) => {
        if (!interactive) return;
        e.stopPropagation();
        onSelect?.(layer.id);
      }}
      className={cn(
        "relative flex h-full w-full items-end overflow-hidden rounded-control border shadow-2xs transition",
        layer.kind === "graph"
          ? "border-info-line bg-[linear-gradient(180deg,#f4f8ff_0%,#e7efff_100%)]"
          : "border-tint-line bg-[linear-gradient(160deg,#1a2740_0%,#2b1a12_100%)]",
        interactive && "cursor-pointer",
        selected && "border-brand ring-2 ring-brand/25"
      )}
    >
      {/* Enough of a suggestion of the render to read as art rather than as an
          empty panel, without pretending to be the finished asset. */}
      {layer.kind === "graph" ? (
        <div className="flex h-full w-full items-end gap-[6%] px-[8%] pb-[14%]">
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
          "relative m-1.5 inline-flex items-center gap-1 rounded-glyph px-1.5 py-0.5 text-micro font-bold",
          layer.kind === "graph" ? "bg-card/85 text-ink-2" : "bg-black/45 text-white/85"
        )}
      >
        <KindGlyph kind={layer.kind} className="size-2.5" />
        {layer.label}
      </span>
    </div>
  );
}
