"use client";

import { cn } from "@/lib/cn";
import type { LogoCorner, LogoMark } from "@/types/content";

/**
 * The brand mark, drawn over every scene.
 *
 * One component for the editor and the published video, for the same reason
 * every other layer shares one: if the mark were drawn twice it would
 * eventually be drawn differently, and the first anyone would know is a
 * reviewer asking why the share link does not match what was approved.
 *
 * It is the one layer with no generating state. The mark is approved artwork
 * that already exists, so it is there in the first frame while everything
 * else is still a placeholder — which is a useful signal rather than an
 * inconsistency: whatever else is missing, the asset is already branded.
 */

/** Where a corner sits, as a fraction of the frame — so it survives scaling. */
const CORNER_CLASS: Record<LogoCorner, string> = {
  "top-left": "left-[4%] top-[5%]",
  "top-right": "right-[4%] top-[5%]",
  "bottom-left": "bottom-[6%] left-[4%]",
  "bottom-right": "bottom-[6%] right-[4%]",
};

export function LogoWatermark({
  logo,
  /** Frame height in px, so the mark's size is a real fraction of the frame. */
  frameHeight,
  selected,
  onSelect,
  className,
}: {
  logo: LogoMark;
  frameHeight: number;
  /** Selectable in the editor; inert in the published video. */
  selected?: boolean;
  onSelect?: () => void;
  className?: string;
}) {
  if (logo.position === "none") return null;

  const height = Math.max(14, Math.round(frameHeight * logo.scale));

  return (
    <div
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-label={`Brand mark — ${logo.name}`}
      data-logo-watermark
      onClick={(e) => {
        if (!onSelect) return;
        e.stopPropagation();
        onSelect();
      }}
      onKeyDown={(e) => {
        if (!onSelect) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      style={{ height }}
      className={cn(
        "absolute z-[40] flex items-center",
        CORNER_CLASS[logo.position],
        onSelect ? "cursor-pointer" : "pointer-events-none",
        selected && "rounded-chip ring-2 ring-brand ring-offset-2 ring-offset-transparent",
        className
      )}
    >
      <LogoGlyph height={height} />
    </div>
  );
}

/**
 * A stand-in for the approved artwork.
 *
 * Drawn rather than an image file because the prototype has no brand kit
 * behind it — but drawn at the real proportions, so the space it occupies is
 * honest and the safe area below means something.
 */
function LogoGlyph({ height }: { height: number }) {
  return (
    <span
      style={{ height, paddingInline: height * 0.34, gap: height * 0.28 }}
      className="inline-flex items-center rounded-chip bg-white/92 shadow-sm backdrop-blur-sm"
    >
      <span
        aria-hidden
        style={{ width: height * 0.44, height: height * 0.44 }}
        className="shrink-0 rounded-[3px] bg-[linear-gradient(135deg,#fd4816_0%,#b82f0c_100%)]"
      />
      <span
        style={{ fontSize: height * 0.34, letterSpacing: "-0.01em" }}
        className="font-[850] leading-none text-ink"
      >
        Meridian
      </span>
    </span>
  );
}

/**
 * Whether a scene element would sit under the mark.
 *
 * The corner the logo occupies is a reserved safe area, and an element that
 * runs into it is a compliance problem rather than a layout preference — a
 * mark over a claim, or over its citation, is the one overlap nobody can sign
 * off. Boxes are fractions of the frame, matching CORNER_CLASS.
 */
export function collidesWithLogo(
  logo: LogoMark,
  element: { x: number; y: number; w: number; h: number }
): boolean {
  if (logo.position === "none") return false;

  // A generous reserve: the mark plus the clear space a brand kit demands
  // around it, which is what the corner is actually promised.
  const reserve = { w: 0.3, h: 0.18 };
  const zone =
    logo.position === "top-left"
      ? { x: 0, y: 0, ...reserve }
      : logo.position === "top-right"
        ? { x: 1 - reserve.w, y: 0, ...reserve }
        : logo.position === "bottom-left"
          ? { x: 0, y: 1 - reserve.h, ...reserve }
          : { x: 1 - reserve.w, y: 1 - reserve.h, ...reserve };

  return (
    element.x < zone.x + zone.w &&
    element.x + element.w > zone.x &&
    element.y < zone.y + zone.h &&
    element.y + element.h > zone.y
  );
}

export const LOGO_CORNERS: { id: LogoCorner | "none"; label: string; hint: string }[] = [
  { id: "bottom-right", label: "Bottom right", hint: "Beside the job code — the usual place" },
  { id: "bottom-left", label: "Bottom left", hint: "Footer, leading side" },
  { id: "top-right", label: "Top right", hint: "Trailing corner, above the content" },
  { id: "top-left", label: "Top left", hint: "Leading corner, above the content" },
  { id: "none", label: "No logo", hint: "Ships unbranded — preflight will flag it" },
];
