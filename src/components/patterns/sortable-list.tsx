"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * A reorderable list. Two uses: the brand kit's typefaces, where position IS
 * the role (first is primary), and an approval chain's stages, where position
 * is the sequence.
 *
 * Native HTML drag-and-drop rather than a library — the lists are short and a
 * drag library would be the largest dependency in the app for two call sites.
 *
 * Up/down buttons sit beside the grip on purpose, not as a fallback: drag is
 * unusable by keyboard and awkward on a trackpad, and in both call sites the
 * order carries meaning, so it has to be reachable without a pointer.
 */
export interface SortableListProps<T> {
  items: T[];
  itemKey: (item: T) => string;
  onReorder: (items: T[]) => void;
  /** `position` is 0-based, for callers where the slot is the meaning. */
  renderItem: (item: T, position: number) => ReactNode;
  /** Trailing controls — remove, edit. Kept out of the drag handle's way. */
  renderActions?: (item: T, position: number) => ReactNode;
  className?: string;
}

export function SortableList<T>({
  items, itemKey, onReorder, renderItem, renderActions, className,
}: SortableListProps<T>) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    const next = items.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorder(next);
  };

  return (
    <ul className={cn("flex flex-col gap-2", className)}>
      {items.map((item, i) => {
        const key = itemKey(item);
        return (
          <li
            key={key}
            draggable
            onDragStart={() => setDragging(key)}
            onDragEnd={() => { setDragging(null); setOver(null); }}
            onDragOver={(e) => { e.preventDefault(); setOver(key); }}
            onDrop={(e) => {
              e.preventDefault();
              if (!dragging) return;
              move(items.findIndex((x) => itemKey(x) === dragging), i);
              setDragging(null); setOver(null);
            }}
            className={cn(
              "flex items-center gap-3 rounded-control border border-hair bg-card px-3 py-2.5 transition-all",
              dragging === key && "opacity-40",
              over === key && dragging !== key && "border-brand ring-2 ring-brand/15",
            )}
          >
            <GripVertical
              aria-hidden
              className="size-4 shrink-0 cursor-grab text-ink-3 active:cursor-grabbing"
            />

            <div className="min-w-0 flex-1">{renderItem(item, i)}</div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => move(i, i - 1)}
                disabled={i === 0}
                aria-label="Move up"
                className="grid size-7 place-items-center rounded-glyph text-ink-3 transition-colors hover:bg-subtle hover:text-ink disabled:pointer-events-none disabled:opacity-30 cursor-pointer"
              >
                <ChevronUp className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => move(i, i + 1)}
                disabled={i === items.length - 1}
                aria-label="Move down"
                className="grid size-7 place-items-center rounded-glyph text-ink-3 transition-colors hover:bg-subtle hover:text-ink disabled:pointer-events-none disabled:opacity-30 cursor-pointer"
              >
                <ChevronDown className="size-3.5" />
              </button>
              {renderActions?.(item, i)}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
