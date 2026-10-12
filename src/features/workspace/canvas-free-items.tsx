"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/lib/cn";
import { textStyleCss, type TextStyle } from "@/features/workspace/canvas-text-toolbar";

/**
 * Text added from Insert › Text, and the one way anything on the page moves.
 *
 * Added text is the author's own, not an approved claim, so it is typed into
 * directly. It sits on the page at a position of its own rather than in the
 * layout's flow, which is what lets it be put anywhere. Everything the layout
 * placed can be dragged too: it keeps its place in the flow and is moved from
 * there, so the layout underneath never reflows.
 */

export type FreeItemKind = "title" | "heading" | "body" | "bullets" | "numbers" | "quote" | "callout" | "footnote";

export interface FreeItem {
  id: string;
  kind: FreeItemKind;
  text: string;
  /** Page pixels, from the top left of the page. */
  x: number;
  y: number;
  /** Width in page pixels. */
  w: number;
}

/** Where something the layout placed has been dragged to, from its place in the flow. */
export interface Offset {
  x: number;
  y: number;
}

export const FREE_ITEM_PRESETS: Record<
  FreeItemKind,
  { option: string; label: string; text: string; w: number; size: number; weight: number }
> = {
  title: { option: "Title", label: "Title", text: "New title", w: 460, size: 30, weight: 850 },
  heading: { option: "Heading", label: "Heading", text: "New heading", w: 380, size: 20, weight: 800 },
  body: { option: "Body text", label: "Body text", text: "Write your text here.", w: 340, size: 13, weight: 500 },
  bullets: { option: "Bulleted list", label: "Bulleted list", text: "First point\nSecond point\nThird point", w: 320, size: 13, weight: 500 },
  numbers: { option: "Numbered list", label: "Numbered list", text: "First step\nSecond step\nThird step", w: 320, size: 13, weight: 500 },
  quote: { option: "Quote", label: "Quote", text: "“A quote from an HCP or KOL.”\n— Name, role", w: 380, size: 16, weight: 600 },
  callout: { option: "Callout box", label: "Callout box", text: "A point to highlight.", w: 340, size: 13, weight: 600 },
  footnote: { option: "Footnote", label: "Footnote", text: "¹ Footnote text.", w: 340, size: 9, weight: 400 },
};

export function kindForOption(option: string): FreeItemKind | null {
  const found = (Object.keys(FREE_ITEM_PRESETS) as FreeItemKind[]).find((k) => FREE_ITEM_PRESETS[k].option === option);
  return found ?? null;
}

/**
 * Drag whatever was pressed, in page pixels.
 *
 * The element moves itself while the pointer moves — writing state on every
 * pointer event would re-render the whole editor — and the end position is
 * committed once, on release. A press that does not travel is a click and is
 * left alone; the click after a real drag is swallowed, so letting go is not
 * also a selection.
 */
export function beginDrag(
  e: ReactPointerEvent<HTMLElement>,
  opts: {
    /** How far the page is scaled on screen, so a pixel of pointer is a pixel of page. */
    scale: number;
    from: Offset;
    /** "position" moves left/top (added text); "translate" moves from its place in the flow. */
    mode: "position" | "translate";
    onStart: () => void;
    onEnd: (to: Offset) => void;
  }
) {
  if (e.button !== 0) return;
  const el = e.currentTarget;
  const startX = e.clientX;
  const startY = e.clientY;
  let moved = false;
  const at = (ev: PointerEvent): Offset => ({
    x: Math.round(opts.from.x + (ev.clientX - startX) / opts.scale),
    y: Math.round(opts.from.y + (ev.clientY - startY) / opts.scale),
  });
  const move = (ev: PointerEvent) => {
    if (!moved && Math.hypot(ev.clientX - startX, ev.clientY - startY) < 4) return;
    if (!moved) {
      moved = true;
      opts.onStart();
      document.body.style.cursor = "grabbing";
    }
    const p = at(ev);
    if (opts.mode === "position") {
      el.style.left = `${p.x}px`;
      el.style.top = `${p.y}px`;
    } else {
      el.style.transform = `translate(${p.x}px, ${p.y}px)`;
    }
  };
  const up = (ev: PointerEvent) => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
    document.body.style.cursor = "";
    if (!moved) return;
    opts.onEnd(at(ev));
    const swallow = (ce: MouseEvent) => {
      ce.stopPropagation();
      ce.preventDefault();
    };
    window.addEventListener("click", swallow, { capture: true, once: true });
    setTimeout(() => window.removeEventListener("click", swallow, { capture: true }), 0);
  };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
}

/** The transform for something moved from its place in the flow. */
export function offsetStyle(offset: Offset | undefined): CSSProperties | undefined {
  /* Something moved sits over what it was moved onto, not under it. */
  return offset && (offset.x || offset.y)
    ? { transform: `translate(${offset.x}px, ${offset.y}px)`, position: "relative", zIndex: 2 }
    : undefined;
}

/** How each kind of added text looks, before any formatting from the toolbar. */
const KIND_CLASS: Record<FreeItemKind, string> = {
  title: "text-ink tracking-tight leading-tight",
  heading: "text-ink tracking-tight leading-snug",
  body: "text-ink-2 leading-relaxed",
  bullets: "text-ink-2 leading-relaxed",
  numbers: "text-ink-2 leading-relaxed",
  quote: "border-l-4 border-brand pl-3 italic text-ink leading-snug",
  callout: "rounded-control border border-tint-line bg-tint px-3 py-2.5 text-brand-deep leading-snug",
  footnote: "text-ink-3 leading-snug",
};

export function FreeTextItem({
  item,
  style,
  selected,
  editing,
  locked,
  scale,
  onSelect,
  onEdit,
  onCommit,
  onMoveStart,
  onMoveEnd,
}: {
  item: FreeItem;
  style?: TextStyle;
  selected: boolean;
  editing: boolean;
  /** Review mode: a finished page, nothing moves or changes. */
  locked: boolean;
  scale: number;
  onSelect: () => void;
  onEdit: () => void;
  onCommit: (text: string) => void;
  onMoveStart: () => void;
  onMoveEnd: (to: Offset) => void;
}) {
  const preset = FREE_ITEM_PRESETS[item.kind];
  const [draft, setDraft] = useState(item.text);
  const fieldRef = useRef<HTMLTextAreaElement>(null);

  /* Into the words as soon as editing starts, all of them selected, the way
     a new text box behaves in PowerPoint. */
  useEffect(() => {
    if (!editing) return;
    const field = fieldRef.current;
    if (!field) return;
    field.focus();
    field.select();
  }, [editing]);

  const css: CSSProperties = {
    fontSize: preset.size,
    fontWeight: preset.weight,
    ...textStyleCss(style),
  };
  const lines = item.text.split("\n").filter((l) => l.trim().length > 0);

  return (
    <div
      data-free-item={item.id}
      style={{ left: item.x, top: item.y, width: item.w }}
      onPointerDown={(e) => {
        if (locked || editing) return;
        e.stopPropagation();
        onSelect();
        beginDrag(e, { scale, from: { x: item.x, y: item.y }, mode: "position", onStart: onMoveStart, onEnd: onMoveEnd });
      }}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => {
        if (locked) return;
        e.stopPropagation();
        setDraft(item.text);
        onEdit();
      }}
      className={cn(
        "absolute z-[3] rounded-[3px]",
        !locked && !editing && "cursor-move",
        selected ? "ring-2 ring-brand ring-offset-2 ring-offset-transparent" : !locked && "hover:ring-2 hover:ring-brand/40 hover:ring-offset-2"
      )}
    >
      {editing ? (
        <textarea
          ref={fieldRef}
          value={draft}
          rows={Math.max(1, draft.split("\n").length)}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => onCommit(draft)}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Escape" || (e.key === "Enter" && (e.metaKey || e.ctrlKey))) {
              e.preventDefault();
              onCommit(draft);
            }
          }}
          style={css}
          className={cn("block w-full resize-none bg-transparent outline-none", KIND_CLASS[item.kind])}
        />
      ) : item.kind === "bullets" || item.kind === "numbers" ? (
        <div style={css} className={KIND_CLASS[item.kind]}>
          {item.kind === "bullets" ? (
            <ul className="list-disc space-y-0.5 pl-5 marker:text-brand">
              {lines.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          ) : (
            <ol className="list-decimal space-y-0.5 pl-5 marker:font-bold marker:text-brand">
              {lines.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ol>
          )}
        </div>
      ) : (
        <div style={css} className={cn("whitespace-pre-line", KIND_CLASS[item.kind])}>
          {item.text}
        </div>
      )}
    </div>
  );
}
