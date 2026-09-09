"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  GripVertical,
  Pencil,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { Scene, SceneCitation } from "@/types/content";

/**
 * One line's sources, shown as a count rather than a list. A rewritten line
 * typically resolves to two or three, and printing all of them inline buries
 * the narration the card exists to show — so the pill carries the first
 * source's name and a count, and paging happens in the popover.
 */
function CitationPill({ citations }: { citations: SceneCitation[] }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (citations.length === 0) return null;
  const current = citations[Math.min(index, citations.length - 1)];

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-chip border px-2 py-0.5 text-caption font-bold transition-colors cursor-pointer",
          open
            ? "border-brand bg-tint text-brand-deep"
            : "border-hair-2 bg-card text-ink-2 hover:border-brand hover:text-brand-deep"
        )}
      >
        <span className="size-3 shrink-0 rounded-full bg-ink-3" aria-hidden />
        <span className="max-w-[120px] truncate">{citations[0].source}</span>
        {citations.length > 1 && (
          <span className="rounded-full bg-ink px-1.5 text-micro font-bold text-white">
            +{citations.length - 1}
          </span>
        )}
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute left-0 top-full z-50 mt-1.5 w-[290px] rounded-panel border border-hair-2 bg-card p-3 shadow-float"
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
          <p className="mt-1.5 text-caption text-ink-4">{current.date}</p>
        </div>
      )}
    </div>
  );
}

export interface ScriptSceneCardProps {
  scene: Scene;
  index: number;
  total: number;
  tagOptions: Array<{ id: string; label: string }>;
  /** In the chat's scope, so the next instruction applies to it. */
  selected: boolean;
  onToggleSelect: () => void;
  editing: boolean;
  onToggleEdit: () => void;
  /** Being rewritten right now — content is withheld rather than half-shown. */
  pending: boolean;
  dragging: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onTitleChange: (value: string) => void;
  onTagChange: (value: string) => void;
  onNarrationChange: (value: string) => void;
  onMove: (direction: "up" | "down") => void;
  onDelete: () => void;
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
  scene, index, total, tagOptions,
  selected, onToggleSelect, editing, onToggleEdit, pending,
  dragging, onDragStart, onDragOver, onDragEnd,
  onTitleChange, onTagChange, onNarrationChange, onMove, onDelete,
}: ScriptSceneCardProps) {
  const words = scene.narration ? scene.narration.split(" ").filter(Boolean).length : 0;
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <article
      draggable={!editing}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={(e) => e.preventDefault()}
      onDragEnd={onDragEnd}
      // Clicking the card aims the chat at it. Suppressed while editing, so
      // working in the text never changes what the next instruction targets.
      onClick={editing ? undefined : onToggleSelect}
      className={cn(
        "relative flex flex-col gap-2 rounded-card border bg-card p-2.5 transition-all duration-200",
        !editing && "cursor-pointer",
        dragging
          ? "border-dashed border-brand opacity-40"
          : selected
          ? "border-brand ring-2 ring-brand/15 shadow-sm"
          : "border-hair shadow-2xs hover:border-hair-3 hover:shadow-xs"
      )}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-2 px-1 pb-2 border-b border-hair">
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className={cn(
              "shrink-0 rounded-glyph p-0.5 text-ink-4 transition-colors",
              editing ? "opacity-30" : "cursor-grab hover:text-ink active:cursor-grabbing"
            )}
            title={editing ? "Save to reorder" : "Drag to reorder"}
          >
            <GripVertical className="size-4" />
          </span>

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
          <div className="relative">
            <select
              value={scene.narrativeTag || "Evidence"}
              onChange={(e) => onTagChange(e.target.value)}
              onClick={stop}
              className="cursor-pointer appearance-none rounded-chip border border-brand/20 bg-tint px-2 py-0.5 pr-5 text-caption font-bold text-brand-deep transition-colors hover:bg-tint-strong focus:outline-none"
            >
              {tagOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>({opt.label})</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 size-2.5 -translate-y-1/2 text-brand-deep opacity-70" />
          </div>

          <span className="flex items-center gap-1 rounded-glyph border border-hair bg-subtle px-2 py-0.5 text-caption font-bold text-ink-3">
            <Clock className="size-2.5" />
            {scene.duration || 10}s
          </span>

          <div className="ml-1 flex items-center gap-0.5 border-l border-hair-2 pl-1">
            <button
              type="button"
              onClick={(e) => { stop(e); onMove("up"); }}
              disabled={index === 0}
              title="Move up"
              className="cursor-pointer rounded-glyph p-1 text-ink-4 transition-colors hover:bg-black/5 hover:text-ink disabled:pointer-events-none disabled:opacity-20"
            >
              <ArrowUp className="size-3" />
            </button>
            <button
              type="button"
              onClick={(e) => { stop(e); onMove("down"); }}
              disabled={index === total - 1}
              title="Move down"
              className="cursor-pointer rounded-glyph p-1 text-ink-4 transition-colors hover:bg-black/5 hover:text-ink disabled:pointer-events-none disabled:opacity-20"
            >
              <ArrowDown className="size-3" />
            </button>
            <button
              type="button"
              onClick={(e) => { stop(e); onDelete(); }}
              title="Delete scene"
              className="ml-0.5 cursor-pointer rounded-glyph p-1 text-ink-4 transition-colors hover:bg-danger-bg hover:text-danger"
            >
              <Trash2 className="size-3" />
            </button>
          </div>
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
            {scene.narration || (
              <span className="text-ink-4">No narration yet. Choose Edit to write it.</span>
            )}
          </p>
        )}

        {!pending && scene.citations && scene.citations.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-hair pt-2.5">
            <span className="text-caption font-extrabold uppercase tracking-wider text-ink-4">
              Sources
            </span>
            <CitationPill citations={scene.citations} />
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
