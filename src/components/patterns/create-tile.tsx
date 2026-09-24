"use client";

import { Plus } from "lucide-react";

/**
 * "Start something", as a tile in the grid it starts.
 *
 * The Characters shelf and the two Create screens each had their own, and
 * they disagreed about where the words go: one put the title under the frame
 * like the tiles beside it, the other put a bare "Start blank" in the middle
 * and the title below, so the same action read as two different things one
 * click apart.
 *
 * Everything sits in the middle here, the glyph, what it makes, and a line
 * saying what you get, because unlike its neighbours this tile has no
 * preview to lead with, and centring is what tells you that at a glance.
 *
 * One plus, not two. The disc and a "+ New doc" underneath were the same
 * affordance drawn twice, which reads as two actions on a tile that has one.
 *
 * It has to hold its own in a row of tiles that lead with photography, and a
 * dashed outline on the page's own tone did not: it read as the gap before
 * the first card rather than a card. So it sits on the card surface with a
 * brand wash behind the glyph, and the thing it makes is drawn in the frame
 * that would otherwise be empty, three ruled lines standing for the blank
 * brief you are about to write.
 */
export function CreateTile({
  icon,
  title,
  subtitle,
  onSelect,
  delayMs = 0,
  className,
}: {
  /** The glyph in the disc. Defaults to a plus. */
  icon?: React.ReactNode;
  title: string;
  subtitle: string;
  onSelect: () => void;
  delayMs?: number;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{ animationDelay: `${delayMs}ms` }}
      className={`rise-in-stagger group relative flex min-h-[260px] cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-card border border-dashed border-hair-3 bg-card p-6 text-center shadow-hair transition-all duration-200 hover:-translate-y-1 hover:border-brand hover:shadow-soft ${className ?? ""}`}
    >
      {/* The light the glyph sits in. Warms on hover rather than the whole
          surface flooding, so the plus stays the brightest thing on it. */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[38%] size-[190px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "radial-gradient(circle, var(--tint) 0%, transparent 68%)" }}
      />

      <span className="relative grid size-14 place-items-center rounded-full bg-tint text-brand-deep ring-1 ring-tint-line transition-all duration-200 group-hover:scale-105 group-hover:bg-brand group-hover:text-white group-hover:ring-brand/30">
        {icon ?? <Plus className="size-6" />}
      </span>

      <span className="relative flex flex-col items-center gap-1">
        <span className="text-body-lg font-extrabold text-ink">{title}</span>
        <span className="max-w-[30ch] text-caption leading-snug text-ink-3">{subtitle}</span>
      </span>

      {/* The blank you are starting on. Three rules and a short third line,
          which is what an unwritten brief looks like. */}
      <span aria-hidden className="relative mt-1 flex w-[62%] flex-col items-center gap-1.5">
        <span className="h-px w-full bg-hair-2 transition-colors duration-200 group-hover:bg-tint-line" />
        <span className="h-px w-full bg-hair-2 transition-colors duration-200 group-hover:bg-tint-line" />
        <span className="h-px w-1/2 bg-hair-2 transition-colors duration-200 group-hover:bg-tint-line" />
      </span>
    </button>
  );
}
