"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Pencil,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { Scene, SceneCitation } from "@/types/content";
import { splitSegments } from "@/features/workspace/script-claims";

/**
 * One line's sources, shown as a count rather than a list. A rewritten line
 * typically resolves to two or three, and printing all of them inline buries
 * the narration the card exists to show — so the pill carries the first
 * source's name and a count, and paging happens in the popover.
 */
/** Shared with the content plan: the same inline badge, so a citation behaves
 *  identically whether it sits in a narration line or a page block. */
export function CitationPill({ citations, onDetails }: { citations: SceneCitation[]; onDetails?: (claimId: string) => void }) {
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
            <span className="text-caption text-ink-4">{current.date}</span>
            {current.claimId && onDetails && (
              <button
                type="button"
                onClick={() => { setOpen(false); onDetails(current.claimId!); }}
                className="inline-flex items-center gap-1 rounded-glyph px-1.5 py-0.5 text-caption font-bold text-brand transition-colors hover:bg-tint cursor-pointer"
              >
                <span>Details</span>
                <ChevronRight className="size-3" />
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export interface ScriptSceneCardProps {
  scene: Scene;
  /** In the chat's scope, so the next instruction applies to it. */
  selected: boolean;
  onToggleSelect: () => void;
  editing: boolean;
  onToggleEdit: () => void;
  /** Being rewritten right now — content is withheld rather than half-shown. */
  pending: boolean;
  /** Jump to the approved claim behind a citation. */
  onCitationDetails?: (claimId: string) => void;
  onTitleChange: (value: string) => void;
  onNarrationChange: (value: string) => void;
}

/**
 * A script scene. Narration is read-only until you ask for it — the script is
 * the reviewed artifact here, and an always-live textarea invites accidental
 * edits to approved copy. Selecting the card puts it in the chat's scope, so
 * the two ways of aiming an instruction (the chat's attach menu and the canvas)
 * write to the same list.
 *
 * Concentric radii: shell 24 with 10px padding puts the inner blocks at 14.
 */
export function ScriptSceneCard({
  scene,
  selected, onToggleSelect, editing, onToggleEdit, pending, onCitationDetails,
  onTitleChange, onNarrationChange,
}: ScriptSceneCardProps) {
  const words = scene.narration ? scene.narration.split(" ").filter(Boolean).length : 0;
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  /**
   * The SAME splitter citationsFor anchors against — importing it rather than
   * repeating the regex, because an anchor computed against one split and
   * rendered against another lands past the end of the text and the badge
   * silently drops to the fallback row.
   *
   * Trailing whitespace stays inside each piece so the paragraph still flows
   * as one block with the badges sitting inside it.
   */
  const sentences = splitSegments(scene.narration);
  const citations = pending ? [] : scene.citations ?? [];

  const byAnchor = new Map<number, SceneCitation[]>();
  const unanchored: SceneCitation[] = [];
  for (const citation of citations) {
    const at = citation.anchor;
    // An anchor past the end of the text has lost its sentence — usually
    // because the line was edited down. Show it in the row rather than drop it.
    if (at === undefined || at < 0 || at >= sentences.length || editing) {
      unanchored.push(citation);
    } else {
      byAnchor.set(at, [...(byAnchor.get(at) ?? []), citation]);
    }
  }

  return (
    <article
      // Clicking the card aims the chat at it. Suppressed while editing, so
      // working in the text never changes what the next instruction targets.
      onClick={editing ? undefined : onToggleSelect}
      className={cn(
        "relative flex flex-col gap-2 rounded-card border bg-card p-2.5 transition-all duration-200",
        !editing && "cursor-pointer",
        selected
          ? "border-brand ring-2 ring-brand/15 shadow-sm"
          : "border-hair shadow-2xs hover:border-hair-3 hover:shadow-xs"
      )}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-2 px-1 pb-2 border-b border-hair">
        <div className="flex min-w-0 items-center gap-1.5">

          {/* The scope tick. Always drawn, so the affordance is discoverable
              rather than appearing only on hover. */}
          <button
            type="button"
            onClick={(e) => { stop(e); onToggleSelect(); }}
            aria-pressed={selected}
            aria-label={selected ? `Remove scene ${scene.number} from chat scope` : `Add scene ${scene.number} to chat scope`}
            className={cn(
              "grid size-5 shrink-0 place-items-center rounded-full border transition-all cursor-pointer",
              selected
                ? "border-brand bg-brand text-white"
                : "border-hair-3 bg-card text-transparent hover:border-brand hover:text-brand/40"
            )}
          >
            <Check className="size-3 stroke-[3]" />
          </button>

          <span className={cn(
            "grid size-6 shrink-0 place-items-center rounded-chip text-label font-bold shadow-2xs",
            selected ? "bg-brand text-white" : "bg-ink text-white"
          )}>
            {scene.number}
          </span>

          <input
            type="text"
            value={scene.title}
            onChange={(e) => onTitleChange(e.target.value)}
            onClick={stop}
            placeholder="Scene Title"
            className="min-w-0 flex-1 rounded-glyph border-b border-transparent bg-transparent px-1 py-0.5 text-body-lg font-[850] text-ink transition-all hover:border-hair-3 focus:border-brand focus:outline-none"
          />
        </div>

        <div className="flex shrink-0 items-center gap-1.5">

          <span className="flex items-center gap-1 rounded-glyph border border-hair bg-subtle px-2 py-0.5 text-caption font-bold text-ink-3">
            <Clock className="size-2.5" />
            {scene.duration || 10}s
          </span>

        </div>
      </div>

      {/* ── Narration ── */}
      <div className={cn(
        "rounded-control border p-3 transition-colors",
        editing ? "border-brand bg-card" : "border-hair-2 bg-canvas"
      )}>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-caption font-extrabold uppercase tracking-wider text-ink-3">
            Narration
          </span>
          <div className="flex items-center gap-2">
            <span className="text-caption font-semibold tabular-nums text-ink-4">{words} words</span>
            <button
              type="button"
              onClick={(e) => { stop(e); onToggleEdit(); }}
              disabled={pending}
              className={cn(
                "inline-flex items-center gap-1 rounded-glyph px-2 py-0.5 text-caption font-bold transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-40",
                editing
                  ? "bg-brand text-white hover:bg-brand-deep"
                  : "text-ink-3 hover:bg-tint hover:text-brand"
              )}
            >
              {editing ? <Check className="size-3" /> : <Pencil className="size-3" />}
              <span>{editing ? "Save" : "Edit"}</span>
            </button>
          </div>
        </div>

        {pending ? (
          /* Withheld, not half-shown: a line mid-rewrite is not the line. */
          <div className="space-y-2" aria-live="polite" aria-busy>
            <div className="shimmer h-4 w-full rounded-glyph bg-hair" />
            <div className="shimmer h-4 w-[82%] rounded-glyph bg-hair" />
            <span className="block pt-0.5 text-caption font-bold text-brand">Rewriting…</span>
          </div>
        ) : editing ? (
          <textarea
            value={scene.narration}
            onChange={(e) => onNarrationChange(e.target.value)}
            onClick={stop}
            placeholder="Enter clinical voiceover script for this scene..."
            rows={3}
            autoFocus
            className="w-full resize-none bg-transparent text-subhead leading-relaxed text-ink focus:outline-none"
          />
        ) : (
          <p className="text-subhead leading-relaxed text-ink">
            {scene.narration
              ? sentences.map((sentence, i) => (
                  <span key={i}>
                    {sentence}
                    {byAnchor.get(i) && <CitationPill citations={byAnchor.get(i)!} onDetails={onCitationDetails} />}
                  </span>
                ))
              : <span className="text-ink-4">No narration yet. Choose Edit to write it.</span>}
          </p>
        )}

        {/* Inline badges cannot live inside a textarea, and a source whose
            anchor no longer matches a sentence would otherwise vanish — both
            fall back to a row under the field. */}
        {!pending && unanchored.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-hair pt-2.5">
            <span className="text-caption font-extrabold uppercase tracking-wider text-ink-4">
              Sources
            </span>
            <CitationPill citations={unanchored} onDetails={onCitationDetails} />
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between gap-2 px-1 text-caption">
        <span className="inline-flex items-center gap-1.5 rounded-glyph border border-ok-line/60 bg-ok-bg px-2 py-0.5 font-semibold text-ok">
          <ShieldCheck className="size-3 text-ok" />
          <span className="truncate">{scene.claim}</span>
        </span>
        {selected ? (
          <span className="shrink-0 font-bold text-brand">In chat scope</span>
        ) : (
          <span className="shrink-0 text-ink-4">
            Tag: <strong>({scene.narrativeTag || "Evidence"})</strong>
          </span>
        )}
      </div>
    </article>
  );
}
