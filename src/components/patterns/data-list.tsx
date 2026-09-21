"use client";

import { cn } from "@/lib/cn";
import { PaginationBar, usePaged } from "@/components/patterns/pagination";

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
  const paged = usePaged(rows, initialPageSize);
  const visible = paged.visible;

  /* One grid template drives the header and every row, so a cell cannot
     drift out of line with its own heading. */
  const template = columns
    .map((c) => (c.width ? `${c.width}px` : `minmax(${c.minWidth ?? 180}px, 1fr)`))
    .join(" ");
  const minRowWidth = columns.reduce((sum, c) => sum + (c.width ?? c.minWidth ?? 180), 0);

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

      <PaginationBar paged={paged} className="border-t border-hair bg-canvas" />
    </div>
  );
}
