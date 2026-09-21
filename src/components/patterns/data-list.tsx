"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * The list view, once.
 *
 * Every library had its own: a row of flex children with hand-tuned widths,
 * no header, and no way to tell which number was which because nothing was
 * labelled. Three implementations meant three column orders for the same
 * idea, and adding a column anywhere meant re-tuning the widths by eye.
 *
 * This one is a table in behaviour and a list in appearance: real headers,
 * columns that carry their own width, a body that scrolls sideways when the
 * columns outgrow the screen rather than crushing them, and pagination that
 * lives in one place at the bottom.
 */
export interface DataColumn<T> {
  id: string;
  header: string;
  /** Fixed track width in pixels. Omit for the one column that takes the slack. */
  width?: number;
  /** Smallest this column may get before the row scrolls sideways instead. */
  minWidth?: number;
  align?: "left" | "right";
  /** Kept out of the header row when the cell speaks for itself. */
  hideHeader?: boolean;
  cell: (row: T) => React.ReactNode;
}

const PAGE_SIZES = [10, 25, 50];

export function DataList<T>({
  rows,
  columns,
  rowKey,
  onRowClick,
  emptyLabel = "Nothing here yet.",
  initialPageSize = 10,
  /** Height at which the body starts scrolling instead of growing. */
  maxBodyHeight,
  className,
}: {
  rows: T[];
  columns: DataColumn<T>[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyLabel?: string;
  initialPageSize?: number;
  maxBodyHeight?: number;
  className?: string;
}) {
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));

  /* Clamped as it is read, not corrected in an effect: a filter that
     shortens the list must not leave you on a page that no longer exists,
     and fixing that after the fact renders the empty page first. */
  const safePage = Math.min(page, pageCount);

  const visible = useMemo(
    () => rows.slice((safePage - 1) * pageSize, safePage * pageSize),
    [rows, safePage, pageSize]
  );

  /* One grid template drives the header and every row, so a cell cannot
     drift out of line with its own heading. */
  const template = columns
    .map((c) => (c.width ? `${c.width}px` : `minmax(${c.minWidth ?? 180}px, 1fr)`))
    .join(" ");
  const minRowWidth = columns.reduce((sum, c) => sum + (c.width ?? c.minWidth ?? 180), 0);

  const first = rows.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const last = Math.min(safePage * pageSize, rows.length);

  return (
    <div className={cn("overflow-hidden rounded-panel border border-hair bg-card shadow-hair", className)}>
      <div className="overflow-x-auto">
        <div style={{ minWidth: minRowWidth }}>
          <div
            className="grid items-center gap-3 border-b border-hair bg-canvas px-4 py-2.5"
            style={{ gridTemplateColumns: template }}
          >
            {columns.map((column) => (
              <span
                key={column.id}
                className={cn(
                  "truncate text-micro font-bold uppercase tracking-[.06em] text-ink-4",
                  column.align === "right" && "text-right"
                )}
              >
                {column.hideHeader ? "" : column.header}
              </span>
            ))}
          </div>

          <div
            className={cn("divide-y divide-hair", maxBodyHeight && "overflow-y-auto")}
            style={maxBodyHeight ? { maxHeight: maxBodyHeight } : undefined}
          >
            {visible.map((row) => (
              <div
                key={rowKey(row)}
                role={onRowClick ? "button" : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        if (e.key === "Enter") onRowClick(row);
                      }
                    : undefined
                }
                className={cn(
                  "grid items-center gap-3 px-4 py-2.5 transition-colors",
                  onRowClick && "cursor-pointer hover:bg-canvas"
                )}
                style={{ gridTemplateColumns: template }}
              >
                {columns.map((column) => (
                  <div
                    key={column.id}
                    className={cn("min-w-0", column.align === "right" && "flex justify-end")}
                  >
                    {column.cell(row)}
                  </div>
                ))}
              </div>
            ))}

            {visible.length === 0 && (
              <div className="px-4 py-14 text-center text-body text-ink-4">{emptyLabel}</div>
            )}
          </div>
        </div>
      </div>

      {/* Everything about position in the list, in one place. Split across the
          top and bottom it reads as two controls that happen to share a
          subject. */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hair bg-canvas px-4 py-2.5">
        <div className="flex items-center gap-2 text-caption text-ink-3">
          <span className="font-bold text-ink-4">Rows</span>
          <div className="flex gap-0.5 rounded-glyph border border-hair-2 bg-subtle p-0.5">
            {PAGE_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                aria-pressed={pageSize === size}
                onClick={() => {
                  setPageSize(size);
                  setPage(1);
                }}
                className={cn(
                  "cursor-pointer rounded-[3px] px-2 py-0.5 text-caption font-bold tabular-nums transition-colors",
                  pageSize === size ? "bg-card text-brand-deep shadow-2xs" : "text-ink-3 hover:text-ink"
                )}
              >
                {size}
              </button>
            ))}
          </div>
          <span className="tabular-nums">
            {first}–{last} of {rows.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            aria-label="Previous page"
            className="grid size-7 cursor-pointer place-items-center rounded-glyph text-ink-3 transition hover:bg-black/5 hover:text-ink disabled:opacity-35"
          >
            <ChevronLeft className="size-4" />
          </button>

          {Array.from({ length: pageCount }, (_, i) => i + 1)
            /* Long lists show the ends and a window around where you are,
               rather than forty buttons. */
            .filter((n) => n === 1 || n === pageCount || Math.abs(n - safePage) <= 1)
            .map((n, index, shown) => (
              <span key={n} className="flex items-center">
                {index > 0 && shown[index - 1] !== n - 1 && (
                  <span className="px-1 text-caption text-ink-4">…</span>
                )}
                <button
                  type="button"
                  onClick={() => setPage(n)}
                  aria-current={n === safePage ? "page" : undefined}
                  className={cn(
                    "grid size-7 cursor-pointer place-items-center rounded-glyph text-caption font-bold tabular-nums transition-colors",
                    n === safePage
                      ? "bg-brand text-white"
                      : "text-ink-3 hover:bg-black/5 hover:text-ink"
                  )}
                >
                  {n}
                </button>
              </span>
            ))}

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={safePage === pageCount}
            aria-label="Next page"
            className="grid size-7 cursor-pointer place-items-center rounded-glyph text-ink-3 transition hover:bg-black/5 hover:text-ink disabled:opacity-35"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
