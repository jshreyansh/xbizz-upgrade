"use client";

import { useEffect, useRef } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Minus,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Direct formatting for a text element on the canvas.
 *
 * The style model, the selectable run, and the small controls the editor
 * toolbar (editor-toolbar.tsx) builds its text options from. The toolbar is
 * the Word position: always there, holding the full set.
 *
 * The palette is a fixed set of swatches rather than a colour picker. On a
 * claims-grounded asset the brand colours are approved artwork, so an
 * arbitrary hex is not a feature — it is a way to ship an off-brand deck.
 */

export type TextAlign = "left" | "center" | "right";

export type TextStyle = {
  /** Pixels. Null means the template's own size is untouched. */
  size: number | null;
  /** A name from FONTS. Null means the template's own typeface. */
  font: string | null;
  weight: number | null;
  italic: boolean | null;
  underline: boolean | null;
  align: TextAlign | null;
  uppercase: boolean | null;
  color: string | null;
};

export const EMPTY_STYLE: TextStyle = {
  size: null,
  font: null,
  italic: null,
  underline: null,
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

export const SIZE_MIN = 8;
export const SIZE_MAX = 72;

/**
 * The typefaces people know from Word and PowerPoint, and the ones congress
 * guidelines name. Each carries a fallback, so a machine without Calibri
 * still shows something close rather than the browser default.
 */
export const FONTS: { label: string; stack: string }[] = [
  { label: "Arial", stack: "Arial, Helvetica, sans-serif" },
  { label: "Calibri", stack: "Calibri, Carlito, 'Segoe UI', sans-serif" },
  { label: "Helvetica", stack: "Helvetica, Arial, sans-serif" },
  { label: "Verdana", stack: "Verdana, Geneva, sans-serif" },
  { label: "Georgia", stack: "Georgia, 'Times New Roman', serif" },
  { label: "Times New Roman", stack: "'Times New Roman', Times, serif" },
];

export const fontStack = (label: string | null) => FONTS.find((f) => f.label === label)?.stack;

export const WEIGHTS: { label: string; value: number }[] = [
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
export function nearestWeight(weight: number): number {
  return WEIGHTS.reduce((best, w) =>
    Math.abs(w.value - weight) < Math.abs(best - weight) ? w.value : best,
  WEIGHTS[0].value);
}

export const SWATCHES: { label: string; value: string | null }[] = [
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
    ...(fontStack(style.font) ? { fontFamily: fontStack(style.font) } : {}),
    ...(style.weight != null ? { fontWeight: style.weight } : {}),
    ...(style.italic ? { fontStyle: "italic" as const } : {}),
    ...(style.underline ? { textDecoration: "underline" as const } : {}),
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

export function Divider({ dark }: { dark?: boolean }) {
  return <span className={cn("h-5 w-px shrink-0", dark ? "bg-white/15" : "bg-hair-2")} />;
}

export function IconToggle({
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

export function SizeStepper({
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

export function AlignGroup({
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

/* ───────────────────────────── the editable run ───────────────────────────── */

/**
 * One selectable run of text on the canvas.
 *
 * Selectable, not editable. There is no caret here: formatting is the ribbon's
 * job and wording goes through the chat, which is the same split the video
 * canvas makes. An inline caret would have been a third way to change approved
 * claim text, and the one reached by the commonest gesture on the page.
 */
export function EditableCanvasText({
  element,
  value,
  style,
  as = "span",
  className,
  selected,
  locked,
  onSelect,
  onReposition,
}: {
  element: CanvasTextElement;
  value: string;
  style?: TextStyle;
  as?: "span" | "h1" | "h2" | "p" | "div";
  className?: string;
  selected: boolean;
  /** Review mode: the page is a finished asset, so nothing is selectable. */
  locked?: boolean;
  onSelect: (rect: DOMRect) => void;
  /**
   * Where the run moved to — not the same event as "the reader picked it".
   * Routing both through onSelect meant every re-render re-attached the
   * observer, the observer reported once on attach, and that report re-opened
   * an action bar the reader had just closed. Repositioning may only move a
   * bar that is already open.
   */
  onReposition?: (rect: DOMRect) => void;
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
    const report = () => (onReposition ?? onSelect)(node.getBoundingClientRect());
    window.addEventListener("scroll", report, true);
    window.addEventListener("resize", report);
    const observer = new ResizeObserver(report);
    observer.observe(node);
    return () => {
      window.removeEventListener("scroll", report, true);
      window.removeEventListener("resize", report);
      observer.disconnect();
    };
  }, [selected, onSelect, onReposition]);

  if (locked) {
    return (
      <Tag className={className} style={textStyleCss(style)}>
        {value}
      </Tag>
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
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(e.currentTarget.getBoundingClientRect());
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
