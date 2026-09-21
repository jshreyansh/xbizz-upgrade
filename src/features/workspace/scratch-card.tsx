"use client";

import { Plus } from "lucide-react";

/**
 * Start with nothing.
 *
 * Every other tile on a Create screen is a preview of the kind of thing it
 * makes. Blank has no preview — showing one was borrowing somebody else's
 * work to illustrate an empty brief — so it takes the shape the Characters
 * shelf already uses for the same idea: a dashed frame and a plus, sized to
 * sit in the same grid row as the tiles beside it.
 */
export function ScratchCard({
  title,
  subtitle,
  onSelect,
  delayMs = 0,
}: {
  title: string;
  subtitle: string;
  onSelect: () => void;
  delayMs?: number;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{ animationDelay: `${delayMs}ms` }}
      className="rise-in-stagger group flex flex-col overflow-hidden rounded-card border border-dashed border-hair-3 bg-canvas text-left transition-all duration-200 hover:-translate-y-1 hover:border-brand hover:bg-tint/40"
    >
      <div className="flex aspect-video flex-col items-center justify-center gap-2.5 px-6 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-tint text-brand-deep transition group-hover:bg-brand group-hover:text-white">
          <Plus className="size-5" />
        </span>
        <span className="text-label font-bold text-brand">Start blank</span>
      </div>

      <div className="p-3.5">
        <h3 className="text-body-lg font-[800] text-ink">{title}</h3>
        <p className="mt-0.5 text-label text-ink-3">{subtitle}</p>
      </div>
    </button>
  );
}
