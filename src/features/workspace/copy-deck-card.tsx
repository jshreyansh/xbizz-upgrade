"use client";

import { AlertTriangle, Check, Pencil } from "lucide-react";
import { cn } from "@/lib/cn";
import type { SceneCitation } from "@/types/content";
import { CitationPill } from "@/features/workspace/script-scene-card";
import { splitSegments } from "@/features/workspace/script-claims";
import { copyFit, type CopyBlockKind } from "@/features/workspace/copy-fit";

/**
 * One block of page copy, before any art exists.
 *
 * The image flow's answer to a script scene, and the same stance: the copy is
 * the reviewed artifact, so it is read-only until you ask for it. An
 * always-live textarea over approved claim text invites the one edit nobody
 * meant to make.
 *
 * What is different is fit. A scene that runs long runs long; a block that
 * runs long gets clipped, so every block carries how much of its box it uses
 * — while the copy is being written, not after the asset is rendered.
 */
export interface CopyBlock {
  id: string;
  /** "Headline", "Safety copy" — what the block is called on the page. */
  label: string;
  kind: CopyBlockKind;
  pageNumber: number;
  text: string;
  citations?: SceneCitation[];
}

export function CopyDeckCard({
  block,
  selected,
  editing,
  pending,
  onToggleSelect,
  onToggleEdit,
  onChange,
  onCitationDetails,
}: {
  block: CopyBlock;
  /** In the chat's scope, so the next instruction applies to it. */
  selected: boolean;
  editing: boolean;
  /** Being rewritten right now — content is withheld rather than half-shown. */
  pending: boolean;
  onToggleSelect: () => void;
  onToggleEdit: () => void;
  onChange: (value: string) => void;
  onCitationDetails?: (claimId: string) => void;
}) {
  const fit = copyFit(block.text, block.kind);
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  // The same splitter the citations are anchored against, imported rather
  // than repeated — an anchor computed on one split and rendered against
  // another lands past the end of the text.
  const segments = splitSegments(block.text);
  const citations = pending || editing ? [] : block.citations ?? [];

  const byAnchor = new Map<number, SceneCitation[]>();
  const loose: SceneCitation[] = [];
  for (const citation of citations) {
    const at = citation.anchor;
    if (at === undefined || at < 0 || at >= segments.length) loose.push(citation);
    else byAnchor.set(at, [...(byAnchor.get(at) ?? []), citation]);
  }

  return (
    <article
      onClick={editing ? undefined : onToggleSelect}
      aria-label={`${block.label} — ${fit.label}`}
      className={cn(
        "relative flex flex-col gap-2 rounded-card border bg-card p-2.5 transition-all duration-200",
        !editing && "cursor-pointer",
        selected
          ? "border-brand ring-2 ring-brand/15 shadow-sm"
          : fit.state === "overflows"
            ? "border-warn-line shadow-2xs"
            : "border-hair shadow-2xs hover:border-hair-3 hover:shadow-xs"
      )}
    >
      {/* ── What it is, where it lives, whether it fits ── */}
      <header className="flex items-center gap-2">
        <span
          className={cn(
            "grid size-4 shrink-0 place-items-center rounded-glyph border transition",
            selected ? "border-brand bg-brand text-white" : "border-hair-3 bg-canvas text-transparent"
          )}
          aria-hidden
        >
          <Check className="size-2.5 stroke-[3]" />
        </span>

        <span className="truncate text-caption font-extrabold uppercase tracking-wider text-ink-3">
          Page {block.pageNumber}
          <span className="px-1 text-ink-4">·</span>
          {block.label}
        </span>

        {fit.state !== "fits" && <FitChip fit={fit} />}

        <button
          type="button"
          onClick={(e) => { stop(e); onToggleEdit(); }}
          className={cn(
            "ml-auto inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-chip px-2 py-1 text-label font-bold transition",
            editing
              ? "bg-brand text-white hover:bg-brand-deep"
              : "border border-hair-2 bg-card text-ink-2 hover:border-brand hover:text-brand"
          )}
        >
          {editing ? <Check className="size-3" /> : <Pencil className="size-3" />}
          {editing ? "Save" : "Edit"}
        </button>
      </header>

      {/* ── The copy ── */}
      <div className="rounded-control bg-canvas p-2.5">
        {pending ? (
          <div className="space-y-1.5" aria-busy aria-label={`${block.label} rewriting`}>
            <span className="shimmer block h-3 w-[92%] rounded-glyph bg-black/[0.06]" />
            <span className="shimmer block h-3 w-[74%] rounded-glyph bg-black/[0.06]" />
          </div>
        ) : editing ? (
          <textarea
            value={block.text}
            onChange={(e) => onChange(e.target.value)}
            onClick={stop}
            rows={Math.max(2, Math.ceil(block.text.length / 60))}
            autoFocus
            className="w-full resize-none bg-transparent text-subhead leading-relaxed text-ink outline-none"
          />
        ) : (
          <p className="text-subhead leading-relaxed text-ink">
            {segments.map((segment, i) => (
              <span key={i}>
                {segment}
                {byAnchor.get(i) && (
                  <CitationPill citations={byAnchor.get(i)!} onDetails={onCitationDetails} />
                )}
              </span>
            ))}
            {loose.length > 0 && <CitationPill citations={loose} onDetails={onCitationDetails} />}
          </p>
        )}
      </div>

    </article>
  );
}

/**
 * Shown only when the copy does not comfortably fit.
 *
 * Every card used to carry a green "Fits" and a 18/34 counter, which is a
 * progress bar for a thing nobody is trying to fill — and a status that is
 * always present is not a status. What is left is the exception: too long, or
 * about to be.
 */
function FitChip({ fit }: { fit: ReturnType<typeof copyFit> }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-glyph border px-1.5 py-0.5 text-micro font-bold",
        fit.state === "overflows"
          ? "border-warn-line bg-warn-bg text-warn"
          : "border-tint-line bg-tint text-brand-deep"
      )}
    >
      <AlertTriangle className="size-2.5" />
      {fit.label}
    </span>
  );
}
