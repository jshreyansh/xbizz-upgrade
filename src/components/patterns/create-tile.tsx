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
 * Everything sits in the middle here — the glyph, what it makes, a line
 * saying what you get, and the action — because unlike its neighbours this
 * tile has no preview to lead with, and centring is what tells you that at a
 * glance.
 */
export function CreateTile({
  icon,
  title,
  subtitle,
  actionLabel,
  onSelect,
  delayMs = 0,
  className,
}: {
  /** The glyph in the disc. Defaults to a plus. */
  icon?: React.ReactNode;
  title: string;
  subtitle: string;
  actionLabel: string;
  onSelect: () => void;
  delayMs?: number;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{ animationDelay: `${delayMs}ms` }}
      className={`rise-in-stagger group flex min-h-[260px] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-card border border-dashed border-hair-3 bg-canvas p-6 text-center transition-all duration-200 hover:-translate-y-1 hover:border-brand hover:bg-tint/40 ${className ?? ""}`}
    >
      <span className="grid size-12 place-items-center rounded-full bg-tint text-brand-deep transition group-hover:bg-brand group-hover:text-white">
        {icon ?? <Plus className="size-5" />}
      </span>
      <span className="text-body-lg font-extrabold text-ink">{title}</span>
      <span className="max-w-[30ch] text-caption leading-snug text-ink-3">{subtitle}</span>
      <span className="mt-1 inline-flex items-center gap-1 text-label font-bold text-brand">
        <Plus className="size-3.5" /> {actionLabel}
      </span>
    </button>
  );
}
