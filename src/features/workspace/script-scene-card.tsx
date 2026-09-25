"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  BarChart3,
  Captions,
  AudioLines,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Image as ImageIcon,
  Palette,
  Pencil,
  ShieldCheck,
  Stamp,
  UserRound,
  Video,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { Scene, SceneCitation } from "@/types/content";
import { splitSegments } from "@/features/workspace/script-claims";

/**
 * What will actually be in the frame, read off the scene rather than written
 * down twice.
 *
 * The visual direction is a sentence about the look; this is the parts list.
 * They answer different questions — "a restrained clinical portrait" does not
 * tell you whether there is a chart in it — and the parts list is the half a
 * reviewer can check at a glance across five scenes.
 */
function sceneElements(scene: Scene) {
  const parts: Array<{ id: string; label: string; icon: typeof Captions }> = [];
  parts.push(
    scene.backgroundKind === "video"
      ? { id: "bg-video", label: "Background video", icon: Video }
      : { id: "bg-plate", label: "Gradient plate", icon: Palette }
  );
  if (scene.graph) parts.push({ id: "graph", label: "Graph", icon: BarChart3 });
  if (scene.mediaType && scene.mediaType !== "none") {
    parts.push({ id: "media", label: scene.mediaLabel || "Product media", icon: ImageIcon });
  }
  if (scene.avatar) parts.push({ id: "avatar", label: "Presenter", icon: UserRound });
  if (scene.narration?.trim()) {
    parts.push({ id: "vo", label: "Voice-over", icon: AudioLines });
    parts.push({ id: "captions", label: "Captions", icon: Captions });
  }
  /* The mark is a project property, not a scene one — it is on every frame,
     so it is on every scene's list. */
  parts.push({ id: "logo", label: "Logo mark", icon: Stamp });
  return parts;
}

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
  onVisualChange: (value: string) => void;
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
  onTitleChange, onNarrationChange, onVisualChange,
}: ScriptSceneCardProps) {
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

  const elementNames = sceneElements(scene).map((part) => part.label);

  return (
    <article
      // Clicking the row aims the chat at it. Suppressed while editing, so
      // working in the text never changes what the next instruction targets.
      onClick={editing ? undefined : onToggleSelect}
      className={cn(
        /* Banding across the full width, not a hairline between rows. A plan
           is read across, and a tinted band carries the eye from the
           narration to the scene beside it where a rule only divides them.
           Warm, not grey: the page ground behind this table is a cool
           off-green, and a grey band sat close enough to it that the table
           looked like it had holes in it. */
        "group/row relative transition-all",
        !editing && "cursor-pointer",
        selected
          /* Scope is a state you should feel, not squint for. The deeper
             tint alone reads as another band, so the selected row also
             lifts: an inset brand ring to draw its edge, and a shadow that
             bleeds onto the rows above and below it. */
          ? "z-10 bg-tint-strong shadow-soft ring-2 ring-inset ring-brand/45"
          : "even:bg-tint-2 hover:bg-tint"
      )}
    >
      {/* ── The scene's own line ──
          Spanning both columns rather than sitting inside one: the scene is
          the row. Putting its name in a cell made that cell a different
          shape from the one beside it. */}
      <header className="flex min-w-0 items-center gap-2.5 px-5 pt-4 pb-2.5">
        <button
          type="button"
          onClick={(e) => { stop(e); onToggleSelect(); }}
          aria-pressed={selected}
          aria-label={selected ? `Remove scene ${scene.number} from chat scope` : `Add scene ${scene.number} to chat scope`}
          className={cn(
            "grid size-4.5 shrink-0 cursor-pointer place-items-center rounded-full border transition-all",
            selected
              ? "border-brand bg-brand text-white"
              : "border-hair-3 bg-card text-transparent hover:border-brand hover:text-brand/40"
          )}
        >
          <Check className="size-2.5 stroke-[3]" />
        </button>

        {/* The number leads and leads loudly. A plan is walked in order, so
            "Scene 3" is what you are hunting and the title only confirms
            you found it. */}
        <span className="shrink-0 text-subhead font-[850] tracking-tight text-ink">
          Scene {scene.number}:
        </span>
        <input
          type="text"
          value={scene.title}
          onChange={(e) => onTitleChange(e.target.value)}
          onClick={stop}
          placeholder="Scene Title"
          className="min-w-0 flex-1 rounded-glyph border-b border-transparent bg-transparent py-0.5 text-body-lg font-medium text-ink-2 transition-all hover:border-hair-3 focus:border-brand focus:outline-none"
        />

        <span className="shrink-0 rounded-glyph bg-hair/60 px-2 py-0.5 text-caption font-semibold text-ink-3">
          {scene.narrativeTag || "Evidence"}
        </span>
      </header>

      {/* The rule between the cells does the dividing, so neither cell needs
          a heading of its own to say which one it is. */}
      <div className="grid min-w-0 gap-y-4 px-5 pb-4 @2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] @2xl:gap-y-0">
        {/* ── Narration ── */}
        <div className="flex min-w-0 flex-col gap-2 @2xl:pr-7">
          <span className="text-caption font-semibold text-ink-4 @2xl:hidden">Narration</span>

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
              className="w-full resize-none rounded-control border border-brand bg-card p-2 text-body-lg leading-relaxed text-ink focus:outline-none"
            />
          ) : (
            <p className="text-body-lg leading-relaxed text-ink">
              {scene.narration
                ? sentences.map((sentence, i) => (
                    <span key={i}>
                      {sentence}
                      {byAnchor.get(i) && <CitationPill citations={byAnchor.get(i)!} onDetails={onCitationDetails} />}
                    </span>
                  ))
                : <span className="text-ink-4">No narration yet.</span>}
            </p>
          )}

          {/* Inline badges cannot live inside a textarea, and a source whose
              anchor no longer matches a sentence would otherwise vanish — both
              fall back to a row under the field. */}
          {!pending && unanchored.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-caption text-ink-4">Sources</span>
              <CitationPill citations={unanchored} onDetails={onCitationDetails} />
            </div>
          )}

          {/* Quiet, and pinned to the foot of the cell so the badge sits on
              one line down the table. Every scene here is grounded, and a
              filled green pill on all eight rows is a colour that has
              stopped meaning anything. */}
          <span className="mt-auto inline-flex min-w-0 items-center gap-1.5 pt-1 text-caption text-ink-4">
            <ShieldCheck className="size-3 shrink-0 text-ok" />
            <span className="truncate">{scene.claim}</span>
          </span>

          {SCRIPT_EDITING_ENABLED && (
            <button
              type="button"
              onClick={(e) => { stop(e); onToggleEdit(); }}
              disabled={pending}
              className={cn(
                "inline-flex w-fit cursor-pointer items-center gap-1 rounded-glyph px-1.5 py-0.5 text-caption font-bold transition-colors disabled:pointer-events-none disabled:opacity-40",
                editing ? "bg-brand text-white hover:bg-brand-deep" : "text-ink-4 hover:bg-tint hover:text-brand"
              )}
            >
              {editing ? <Check className="size-3" /> : <Pencil className="size-3" />}
              <span>{editing ? "Save" : "Edit"}</span>
            </button>
          )}
        </div>

        {/* ── Scene and style ── */}
        <div className="flex min-w-0 flex-col gap-2 border-t border-hair pt-4 @2xl:border-t-0 @2xl:border-l @2xl:pt-0 @2xl:pl-7">
          <span className="text-caption font-semibold text-ink-4 @2xl:hidden">Scene and style</span>

          {pending ? (
            <div className="space-y-2" aria-busy>
              <div className="shimmer h-3.5 w-full rounded-glyph bg-hair" />
              <div className="shimmer h-3.5 w-[70%] rounded-glyph bg-hair" />
            </div>
          ) : editing ? (
            <textarea
              value={scene.visual}
              onChange={(e) => onVisualChange(e.target.value)}
              onClick={stop}
              placeholder="Describe roughly what this scene shows…"
              rows={2}
              className="w-full resize-none rounded-control border border-brand bg-card p-2 text-body-lg leading-relaxed text-ink-2 focus:outline-none"
            />
          ) : (
            <p className="text-body-lg leading-relaxed text-ink-2">
              {scene.visual || <span className="text-ink-4">No visual direction yet.</span>}
            </p>
          )}

          {/* One line, not five bordered chips. The parts of a scene are a
              list you read, and boxing each of them turned every row into a
              wall of little rectangles wrapping onto a second line. */}
          {!pending && elementNames.length > 0 && (
            <span className="mt-auto pt-1 text-caption leading-relaxed text-ink-4">
              {elementNames.join(" · ")}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

/**
 * The two columns every scene is read across, named once at the top.
 *
 * The plan was a stack of self-contained cards, each repeating its own
 * NARRATION and VISUAL labels — eight scenes meant sixteen headings for two
 * ideas. A table says it twice: once.
 */
export function ScriptPlanHeader() {
  return (
    /* Sticky against the plan column, which is why the table around it no
       longer clips its overflow: an `overflow-hidden` ancestor made this a
       scrollport of its own, so the header stuck to a box that never
       scrolled and rode away with the rows. The negative offset is that
       column's own padding: pinned at top-0 the header left a 4px slot
       above itself for rows to scroll through. */
    <div className="sticky -top-1 z-20 hidden rounded-t-panel border-b border-hair-2 bg-card px-5 py-2.5 @2xl:grid @2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <span className="pr-7 text-caption font-extrabold uppercase tracking-[.09em] text-ink-4">Narration</span>
      <span className="pl-7 text-caption font-extrabold uppercase tracking-[.09em] text-ink-4">Scene and style</span>
    </div>
  );
}
