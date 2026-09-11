"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  CaseUpper,
  MessageSquare,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Type,
} from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Direct formatting for a text element on the canvas.
 *
 * Two surfaces, deliberately not the same controls twice. The ribbon is the
 * Word position — always there, holds the full set, and is the thing you learn
 * once. The floating bar is the PowerPoint/Gamma position — it appears at the
 * selection and holds only what you reach for mid-sentence. Duplicating the
 * whole ribbon in a popover is what makes those popovers feel like clutter.
 *
 * The palette is a fixed set of swatches rather than a colour picker. On a
 * claims-grounded asset the brand colours are approved artwork, so an
 * arbitrary hex is not a feature — it is a way to ship an off-brand deck.
 */

export type TextAlign = "left" | "center" | "right";

export type TextStyle = {
  /** Pixels. Null means the template's own size is untouched. */
  size: number | null;
  weight: number | null;
  align: TextAlign | null;
  uppercase: boolean | null;
  color: string | null;
};

export const EMPTY_STYLE: TextStyle = {
  size: null,
  weight: null,
  align: null,
  uppercase: null,
  color: null,
};

/** One text run on the page that can be selected, retyped and reformatted. */
export type CanvasTextElement = {
  /** "header.title" — block, then field. */
  id: string;
  blockId: string;
  /** Shown in the ribbon and the floating bar, e.g. "Headline". */
  label: string;
  /** The size the template gives it, so the stepper starts somewhere true. */
  baseSize: number;
  baseWeight: number;
  multiline?: boolean;
  /**
   * Set when the words carry an approved claim. Retyping such an element is
   * allowed — blocking it would just push the edit into a screenshot — but it
   * costs the claim its verification, and the bar says so before you start.
   */
  citation?: string;
};

const SIZE_MIN = 8;
const SIZE_MAX = 72;

const WEIGHTS: { label: string; value: number }[] = [
  { label: "Regular", value: 400 },
  { label: "Medium", value: 600 },
  { label: "Bold", value: 700 },
  { label: "Black", value: 850 },
];

/**
 * The template's own weights are not all on the list — a 900 hero metric is a
 * real design choice, not a rounding error. The select shows the nearest
 * listed weight so it never sits on the wrong label, which is what a plain
 * value match does when the value is not an option.
 */
function nearestWeight(weight: number): number {
  return WEIGHTS.reduce((best, w) =>
    Math.abs(w.value - weight) < Math.abs(best - weight) ? w.value : best,
  WEIGHTS[0].value);
}

const SWATCHES: { label: string; value: string | null }[] = [
  { label: "Template default", value: null },
  { label: "Brand orange", value: "#fd4816" },
  { label: "Deep brand", value: "#b82f0c" },
  { label: "Ink", value: "#0a0d14" },
  { label: "White", value: "#ffffff" },
  { label: "Evidence green", value: "#12784a" },
];

/** Inline style for an element, applied over its own Tailwind classes. */
export function textStyleCss(style: TextStyle | undefined): React.CSSProperties {
  if (!style) return {};
  return {
    ...(style.size != null ? { fontSize: `${style.size}px` } : {}),
    ...(style.weight != null ? { fontWeight: style.weight } : {}),
    ...(style.align != null ? { textAlign: style.align } : {}),
    ...(style.uppercase != null
      ? { textTransform: style.uppercase ? ("uppercase" as const) : ("none" as const) }
      : {}),
    ...(style.color != null ? { color: style.color } : {}),
  };
}

export function hasOverrides(style: TextStyle | undefined): boolean {
  if (!style) return false;
  return Object.values(style).some((v) => v != null);
}

/* ─────────────────────────── shared control atoms ─────────────────────────── */

function Divider({ dark }: { dark?: boolean }) {
  return <span className={cn("h-5 w-px shrink-0", dark ? "bg-white/15" : "bg-hair-2")} />;
}

function IconToggle({
  active,
  onClick,
  title,
  dark,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  dark?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={!!active}
      className={cn(
        "focus-ring grid size-7 shrink-0 cursor-pointer place-items-center rounded-chip transition",
        dark
          ? active
            ? "bg-card text-ink"
            : "text-white/70 hover:bg-white/12 hover:text-white"
          : active
            ? "bg-brand text-white shadow-xs"
            : "text-ink-2 hover:bg-black/5 hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}

function SizeStepper({
  value,
  onChange,
  dark,
}: {
  value: number;
  onChange: (next: number) => void;
  dark?: boolean;
}) {
  const clamp = (n: number) => Math.max(SIZE_MIN, Math.min(SIZE_MAX, n));
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-0.5 rounded-chip border",
        dark ? "border-white/15 bg-white/8" : "border-hair-2 bg-subtle"
      )}
    >
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        title="Smaller text"
        aria-label="Smaller text"
        className={cn(
          "focus-ring grid size-6 cursor-pointer place-items-center rounded-chip",
          dark ? "text-white/70 hover:bg-white/12 hover:text-white" : "text-ink-2 hover:bg-card hover:text-ink"
        )}
      >
        <Minus className="size-3" />
      </button>
      <span
        className={cn(
          "min-w-[24px] text-center text-label font-bold tabular-nums",
          dark ? "text-white" : "text-ink"
        )}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        title="Larger text"
        aria-label="Larger text"
        className={cn(
          "focus-ring grid size-6 cursor-pointer place-items-center rounded-chip",
          dark ? "text-white/70 hover:bg-white/12 hover:text-white" : "text-ink-2 hover:bg-card hover:text-ink"
        )}
      >
        <Plus className="size-3" />
      </button>
    </div>
  );
}

function AlignGroup({
  value,
  onChange,
  dark,
}: {
  value: TextAlign;
  onChange: (next: TextAlign) => void;
  dark?: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <IconToggle dark={dark} active={value === "left"} onClick={() => onChange("left")} title="Align left">
        <AlignLeft className="size-3.5" />
      </IconToggle>
      <IconToggle dark={dark} active={value === "center"} onClick={() => onChange("center")} title="Align centre">
        <AlignCenter className="size-3.5" />
      </IconToggle>
      <IconToggle dark={dark} active={value === "right"} onClick={() => onChange("right")} title="Align right">
        <AlignRight className="size-3.5" />
      </IconToggle>
    </div>
  );
}

/* ───────────────────────────── the floating bar ───────────────────────────── */

/**
 * Appears directly above the selected run, like PowerPoint's mini toolbar.
 *
 * Positioned against the live rect rather than the element's box in the
 * document, because the canvas is scaled by the zoom control — a toolbar
 * placed with CSS inside a scaled container would be scaled with it, which is
 * how these bars end up at 70% size and blurry.
 */
export function FloatingTextToolbar({
  element,
  style,
  anchorRect,
  onStyle,
  onReset,
  onAddToChat,
  onEdit,
  onComment,
}: {
  element: CanvasTextElement;
  style: TextStyle | undefined;
  /** Viewport rect of the selected run. */
  anchorRect: { top: number; left: number; width: number; height: number } | null;
  onStyle: (patch: Partial<TextStyle>) => void;
  onReset: () => void;
  onAddToChat: () => void;
  onEdit: () => void;
  /** Leave a note against this run instead of acting on it now. */
  onComment?: () => void;
}) {
  if (!anchorRect || typeof document === "undefined") return null;

  /* Placed from the anchor alone, during render. Measuring the bar first and
     storing the result in state would mean a frame where it sits at the wrong
     coordinates — visible as a jump every time you select a run. Above by
     default; under the run when the top chrome would clip it. */
  const below = anchorRect.top < 150;
  const top = below ? anchorRect.top + anchorRect.height + 10 : anchorRect.top - 10;
  const centre = anchorRect.left + anchorRect.width / 2;
  /* Clamped by half the bar's *widest possible* size rather than a guessed
     constant: the bar is capped below at min(92vw, 520px), so half of that is
     the largest it can ever overhang. Measuring the real width instead would
     mean a render that reads layout, and a frame at the wrong coordinates. */
  const half = Math.min(260, window.innerWidth * 0.46);
  const left = Math.max(half + 8, Math.min(window.innerWidth - half - 8, centre));

  const size = style?.size ?? element.baseSize;
  const weight = style?.weight ?? element.baseWeight;
  const align = style?.align ?? "left";
  const upper = style?.uppercase ?? false;

  return createPortal(
    <div
      role="toolbar"
      aria-label={`Format ${element.label}`}
      style={{
        top,
        left,
        transform: below ? "translateX(-50%)" : "translate(-50%, -100%)",
      }}
      className="fixed z-[70] flex max-w-[min(92vw,520px)] items-center gap-1.5 overflow-x-auto rounded-control border border-white/12 bg-[#11161f] px-2 py-1.5 shadow-2xl"
      // The bar sits over the canvas; a click inside it must not reach the
      // stage's click-to-deselect, or the bar closes the moment you use it.
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <span className="shrink-0 pl-0.5 pr-1 text-micro font-extrabold uppercase tracking-wider text-white/45">
        {element.label}
      </span>

      <Divider dark />
      <SizeStepper dark value={size} onChange={(next) => onStyle({ size: next })} />

      <IconToggle
        dark
        active={weight >= 700}
        onClick={() => onStyle({ weight: weight >= 700 ? 400 : 850 })}
        title="Bold"
      >
        <Bold className="size-3.5" />
      </IconToggle>

      <IconToggle dark active={upper} onClick={() => onStyle({ uppercase: !upper })} title="Uppercase">
        <CaseUpper className="size-4" />
      </IconToggle>

      <Divider dark />
      <AlignGroup dark value={align} onChange={(next) => onStyle({ align: next })} />

      <Divider dark />
      <button
        type="button"
        onClick={onEdit}
        className="focus-ring inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-chip px-2 py-1 text-label font-bold text-white/80 transition hover:bg-white/12 hover:text-white"
      >
        <Type className="size-3.5" />
        Edit text
      </button>

      {onComment && (
        <IconToggle dark onClick={onComment} title="Add a comment on this element">
          <MessageSquare className="size-3.5" />
        </IconToggle>
      )}

      <button
        type="button"
        onClick={onAddToChat}
        title="Ask the agent to change this"
        className="focus-ring inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-chip bg-brand px-2 py-1 text-label font-bold text-white transition hover:bg-brand-deep"
      >
        <Sparkles className="size-3.5" />
        Ask agent
      </button>

      {hasOverrides(style) && (
        <>
          <Divider dark />
          <IconToggle dark onClick={onReset} title="Reset to template">
            <RotateCcw className="size-3.5" />
          </IconToggle>
        </>
      )}

      {element.citation && (
        <span
          title={`Grounded in ${element.citation} — retyping this run sends the claim back for verification`}
          className="ml-0.5 inline-flex shrink-0 items-center gap-1 rounded-chip bg-ok/18 px-1.5 py-0.5 text-micro font-bold text-ok-on-dark"
        >
          <ShieldCheck className="size-3" />
          Claim
        </span>
      )}
    </div>,
    document.body
  );
}

/* ──────────────────────────────── the ribbon ──────────────────────────────── */

/**
 * The persistent formatting bar under the app header.
 *
 * It is present whether or not something is selected, because a control that
 * appears and disappears cannot be learned. With nothing selected it says so
 * and dims, which is also how it teaches that formatting is per-element.
 */
export function FormatRibbon({
  element,
  style,
  blockLabel,
  onStyle,
  onReset,
  onEdit,
}: {
  element: CanvasTextElement | null;
  style: TextStyle | undefined;
  blockLabel: string;
  onStyle: (patch: Partial<TextStyle>) => void;
  onReset: () => void;
  onEdit: () => void;
}) {
  const size = style?.size ?? element?.baseSize ?? 12;
  const weight = style?.weight ?? element?.baseWeight ?? 400;
  const align = style?.align ?? "left";
  const upper = style?.uppercase ?? false;
  const live = !!element;

  return (
    <div className="flex items-center gap-2 overflow-x-auto border-b border-hair bg-canvas px-3 py-1.5 sm:px-4">
      {/* What the controls will act on. Naming it is the difference between a
          ribbon and a row of mystery buttons. */}
      <div className="flex min-w-0 shrink-0 items-center gap-1.5">
        <Type className={cn("size-3.5 shrink-0", live ? "text-brand" : "text-ink-4")} />
        {live ? (
          <span className="truncate text-label font-bold text-ink">
            {blockLabel}
            <span className="px-1 text-ink-4">›</span>
            {element.label}
          </span>
        ) : (
          <span className="truncate text-label font-semibold text-ink-3">
            Select any text on the page to format it
          </span>
        )}
      </div>

      <Divider />

      <div className={cn("flex items-center gap-1.5", !live && "pointer-events-none opacity-40")}>
        <SizeStepper value={size} onChange={(next) => onStyle({ size: next })} />

        <select
          value={nearestWeight(weight)}
          onChange={(e) => onStyle({ weight: Number(e.target.value) })}
          aria-label="Font weight"
          className="focus-ring h-7 shrink-0 cursor-pointer rounded-chip border border-hair-2 bg-subtle px-1.5 text-label font-bold text-ink"
        >
          {WEIGHTS.map((w) => (
            <option key={w.value} value={w.value}>
              {w.label}
            </option>
          ))}
        </select>

        <IconToggle
          active={weight >= 700}
          onClick={() => onStyle({ weight: weight >= 700 ? 400 : 850 })}
          title="Bold"
        >
          <Bold className="size-3.5" />
        </IconToggle>

        <IconToggle active={upper} onClick={() => onStyle({ uppercase: !upper })} title="Uppercase">
          <CaseUpper className="size-4" />
        </IconToggle>

        <Divider />
        <AlignGroup value={align} onChange={(next) => onStyle({ align: next })} />

        <Divider />
        {/* Swatches, not a picker — see the note at the top of the file. */}
        <div className="flex shrink-0 items-center gap-1">
          {SWATCHES.map((s) => {
            const active = (style?.color ?? null) === s.value;
            return (
              <button
                key={s.label}
                type="button"
                onClick={() => onStyle({ color: s.value })}
                title={s.label}
                aria-label={s.label}
                aria-pressed={active}
                className={cn(
                  "focus-ring size-5 shrink-0 cursor-pointer rounded-glyph border transition",
                  active ? "border-ink ring-2 ring-brand/30" : "border-hair-3 hover:border-ink-3"
                )}
                style={
                  s.value
                    ? { background: s.value }
                    : {
                        background:
                          "linear-gradient(135deg, #ffffff 0 46%, var(--color-hair-3) 46% 54%, #ffffff 54%)",
                      }
                }
              />
            );
          })}
        </div>

        <Divider />
        <button
          type="button"
          onClick={onEdit}
          className="focus-ring inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-chip border border-hair-2 bg-card px-2 py-1 text-label font-bold text-ink-2 transition hover:border-brand hover:text-brand"
        >
          <Type className="size-3.5" />
          Edit text
        </button>

        <button
          type="button"
          onClick={onReset}
          disabled={!hasOverrides(style)}
          className={cn(
            "focus-ring inline-flex shrink-0 items-center gap-1 rounded-chip px-2 py-1 text-label font-bold transition",
            hasOverrides(style)
              ? "cursor-pointer text-brand hover:bg-tint"
              : "cursor-not-allowed text-ink-4"
          )}
        >
          <RotateCcw className="size-3.5" />
          Reset
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────────── the editable run ───────────────────────────── */

/**
 * One selectable, retypable run of text on the canvas.
 *
 * Single click selects — which is what brings up the toolbars. Double click
 * starts editing in place. That split matters: if a single click began editing,
 * selecting a run to restyle it would put a caret in the middle of an approved
 * claim, and the commonest gesture on the page would be the riskiest one.
 */
export function EditableCanvasText({
  element,
  value,
  style,
  as = "span",
  className,
  selected,
  editing,
  locked,
  onSelect,
  onStartEdit,
  onCommit,
  onCancelEdit,
}: {
  element: CanvasTextElement;
  value: string;
  style?: TextStyle;
  as?: "span" | "h1" | "h2" | "p" | "div";
  className?: string;
  selected: boolean;
  editing: boolean;
  /** Review mode: the page is a finished asset, so nothing is selectable. */
  locked?: boolean;
  onSelect: (rect: DOMRect) => void;
  onStartEdit: () => void;
  onCommit: (next: string) => void;
  onCancelEdit: () => void;
}) {
  const Tag = as;
  const ref = useRef<HTMLElement | null>(null);

  /* Keep the toolbars pinned to the run.
   *
   * Scroll and resize are not enough: the studio's zoom control rescales the
   * whole page, which moves every run without firing either event, and the
   * bar would sit where the text used to be. A ResizeObserver on the element
   * catches that, because a scaled box is a resized box. */
  useEffect(() => {
    if (!selected || !ref.current) return;
    const node = ref.current;
    const report = () => onSelect(node.getBoundingClientRect());
    window.addEventListener("scroll", report, true);
    window.addEventListener("resize", report);
    const observer = new ResizeObserver(report);
    observer.observe(node);
    return () => {
      window.removeEventListener("scroll", report, true);
      window.removeEventListener("resize", report);
      observer.disconnect();
    };
  }, [selected, onSelect]);

  if (locked) {
    return (
      <Tag className={className} style={textStyleCss(style)}>
        {value}
      </Tag>
    );
  }

  if (editing) {
    return (
      <InlineEditor
        as={as}
        element={element}
        initialValue={value}
        style={style}
        className={className}
        onCommit={onCommit}
        onCancelEdit={onCancelEdit}
      />
    );
  }

  return (
    <Tag
      ref={ref as never}
      data-canvas-text={element.id}
      role="button"
      tabIndex={0}
      aria-label={`${element.label}: ${value}`}
      style={textStyleCss(style)}
      onPointerDown={(e: React.PointerEvent) => {
        // Beat the block's own handler — selecting a run must not also read as
        // selecting the band it sits in.
        e.stopPropagation();
      }}
      onClick={(e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        onSelect(e.currentTarget.getBoundingClientRect());
      }}
      onDoubleClick={(e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        onSelect(e.currentTarget.getBoundingClientRect());
        onStartEdit();
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(e.currentTarget.getBoundingClientRect());
          onStartEdit();
        }
      }}
      className={cn(
        className,
        "cursor-pointer rounded-[3px] transition",
        selected
          ? "ring-2 ring-brand ring-offset-1 ring-offset-transparent"
          : "hover:ring-2 hover:ring-brand/40 hover:ring-offset-1 hover:ring-offset-transparent"
      )}
    >
      {value}
    </Tag>
  );
}

/**
 * The caret half of an editable run, mounted only while editing.
 *
 * Its own component so the starting text arrives as a prop and is frozen in
 * state on mount. That is what lets the contentEditable subtree render once:
 * React never sees its children change, so it never overwrites what has been
 * typed, and Escape has something true to restore.
 */
function InlineEditor({
  as,
  element,
  initialValue,
  style,
  className,
  onCommit,
  onCancelEdit,
}: {
  as: "span" | "h1" | "h2" | "p" | "div";
  element: CanvasTextElement;
  initialValue: string;
  style?: TextStyle;
  className?: string;
  onCommit: (next: string) => void;
  onCancelEdit: () => void;
}) {
  const Tag = as;
  const ref = useRef<HTMLElement | null>(null);
  const [frozen] = useState(initialValue);

  // Take the caret on open, and put it at the end rather than at character
  // zero, which is where a fresh contentEditable would land it.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.focus();
    const range = document.createRange();
    range.selectNodeContents(node);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, []);

  return (
    <Tag
      ref={ref as never}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label={`Edit ${element.label}`}
      spellCheck
      style={textStyleCss(style)}
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        const next = (e.currentTarget.textContent ?? "").trim();
        onCommit(next.length ? next : frozen);
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === "Escape") {
          e.preventDefault();
          e.currentTarget.textContent = frozen;
          onCancelEdit();
          return;
        }
        // Enter commits a single-line run; a multiline run keeps its newlines
        // and commits on blur, as a paragraph field should.
        if (e.key === "Enter" && !element.multiline) {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
      className={cn(
        className,
        "cursor-text rounded-[3px] outline-none ring-2 ring-brand ring-offset-1 ring-offset-transparent"
      )}
    >
      {frozen}
    </Tag>
  );
}
