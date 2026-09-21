"use client";

import { cn } from "@/lib/cn";
import { PaginationBar, usePaged } from "@/components/patterns/pagination";

/**
 * A list whose rows are objects, not cells.
 *
 * The product page lists its dossiers, its claims and its attachments this
 * way: each row a card of its own with a border and a gap, because each row
 * is a thing you open rather than a set of values you compare down a column.
 * A table is right when the columns are the point; this is right when the
 * row is.
 *
 * Paginated by the same hook the table uses, so a long shelf behaves the
 * same however its rows are drawn.
 */
export function TileList<T>({
  rows,
  rowKey,
  renderRow,
  onRowClick,
  emptyLabel = "Nothing here yet.",
  initialPageSize = 10,
  className,
}: {
  rows: T[];
  rowKey: (row: T) => string;
  renderRow: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
  emptyLabel?: string;
  initialPageSize?: number;
  className?: string;
}) {
  const paged = usePaged(rows, initialPageSize);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col gap-2">
        {paged.visible.map((row) => (
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
              "group flex flex-wrap items-center gap-3.5 rounded-panel border border-hair bg-card p-3.5 shadow-hair transition-all",
              onRowClick && "cursor-pointer hover:border-hair-3 hover:shadow-soft"
            )}
          >
            {renderRow(row)}
          </div>
        ))}

        {paged.visible.length === 0 && (
          <div className="rounded-panel border border-dashed border-hair-2 px-4 py-14 text-center text-body text-ink-4">
            {emptyLabel}
          </div>
        )}
      </div>

      {rows.length > 0 && (
        <PaginationBar paged={paged} className="rounded-panel border border-hair bg-card shadow-hair" />
      )}
    </div>
  );
}
