"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { SceneCitation } from "@/types/content";


/**
 * One line's sources, shown as a count rather than a list. A rewritten line
 * typically resolves to two or three, and printing all of them inline buries
 * the narration the card exists to show — so the pill carries the first
 * source's name and a count, and paging happens in the popover.
 */
/** Shared with the content plan: the same inline badge, so a citation behaves
 *  identically whether it sits in a narration line or a page block. */
export function CitationPill({
  citations,
  onDetails,
  detailsLabel = "Details",
}: {
  citations: SceneCitation[];
  onDetails?: (claimId: string) => void;
  /** What the jump is called where it lands. In a dossier it opens the
   *  section's whole claims rail, which "Details" does not describe. */
  detailsLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [coords, setCoords] = useState<{ left: number; top: number } | null>(null);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  /**
   * Positioned in a portal against the viewport rather than inside the card.
   * The script canvas is an overflow-y-auto column, so an absolutely
   * positioned popover was clipped at its edges — the card lost its right
   * side and its counter. Clamped to stay on screen, and flipped above the
   * badge when there is no room below.
   */
  const place = useCallback(() => {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = 290;
    const height = cardRef.current?.offsetHeight ?? 150;
    const left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));
    const below = rect.bottom + 6;
    const top = below + height > window.innerHeight - 12 ? Math.max(12, rect.top - height - 6) : below;
    setCoords({ left, top });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (anchorRef.current?.contains(target) || cardRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); setCoords(null); } };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    // capture: the canvas column scrolls, not the window.
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, place]);

  if (citations.length === 0) return null;
  const current = citations[Math.min(index, citations.length - 1)];

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        // Measured here rather than in an effect: an effect that positions on
        // mount sets state during render-commit, and the popover would flash
        // at the wrong place for one frame before correcting.
        onClick={(e) => {
          e.stopPropagation();
          if (open) { setOpen(false); setCoords(null); return; }
          place();
          setOpen(true);
        }}
        aria-expanded={open}
        aria-label={`${citations.length} source${citations.length > 1 ? "s" : ""} for this line`}
        className={cn(
          "mx-1 inline-flex translate-y-[-1px] items-center rounded-full px-1.5 py-0.5 align-middle text-micro font-bold leading-none transition-colors cursor-pointer",
          open ? "bg-brand text-white" : "bg-ink text-white hover:bg-brand"
        )}
      >
        +{citations.length}
      </button>

      {open && createPortal(
        <div
          ref={cardRef}
          onClick={(e) => e.stopPropagation()}
          style={{ left: coords?.left ?? -9999, top: coords?.top ?? -9999 }}
          className="fixed z-[9999] w-[290px] rounded-panel border border-hair-2 bg-card p-3 shadow-float"
        >
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={index === 0}
                aria-label="Previous source"
                className="grid size-6 place-items-center rounded-glyph text-ink-3 transition-colors hover:bg-subtle hover:text-ink disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronLeft className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIndex((i) => Math.min(citations.length - 1, i + 1))}
                disabled={index >= citations.length - 1}
                aria-label="Next source"
                className="grid size-6 place-items-center rounded-glyph text-ink-3 transition-colors hover:bg-subtle hover:text-ink disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronRight className="size-3.5" />
              </button>
            </div>
            <span className="text-caption font-bold tabular-nums text-ink-4">
              {Math.min(index, citations.length - 1) + 1}/{citations.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="size-4 shrink-0 rounded-full bg-ink-3" aria-hidden />
            <span className="text-label font-bold text-ink">{current.source}</span>
          </div>
          <p className="mt-1 text-body leading-snug text-ink-2">{current.title}</p>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <span className="min-w-0 truncate text-caption text-ink-4">{current.date}</span>
            {current.claimId && onDetails && (
              <button
                type="button"
                onClick={() => { setOpen(false); onDetails(current.claimId!); }}
                className="inline-flex shrink-0 items-center gap-1 rounded-glyph px-1.5 py-0.5 text-caption font-bold text-brand transition-colors hover:bg-tint cursor-pointer"
              >
                <span>{detailsLabel}</span>
                <ChevronRight className="size-3" />
              </button>
            )}
          </div>

          {/* The source itself, one click away. A citation you cannot open is
              a citation you have to take on trust. */}
          {current.url && (
            <a
              href={current.url}
              target="_blank"
              rel="noreferrer noopener"
              onClick={(e) => e.stopPropagation()}
              className="mt-2 flex items-center justify-center gap-1.5 rounded-glyph border border-hair-2 bg-subtle px-2 py-1.5 text-caption font-bold text-ink-2 transition-colors hover:border-brand hover:bg-tint hover:text-brand cursor-pointer"
            >
              <span>View source</span>
              <ExternalLink className="size-3" />
            </a>
          )}
        </div>,
        document.body
      )}
    </>
  );
}

/**
 * Editing a scene in place is off until the step is finished.
 *
 * Adding and rewriting a scene here has to reconcile with the claims bound to
 * it, the timing of the scenes around it, and what the chat already knows
 * about the plan — none of which is wired yet. A control that half-works is
 * worse than one that is not there, so both the per-scene Edit and the two
 * "Add Script Scene" buttons are hidden behind this one flag. Flip it to true
 * to bring all three back.
 */
export const SCRIPT_EDITING_ENABLED = false;
