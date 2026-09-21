"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

const PAGE_SIZES = [10, 25, 50];

export interface Paged<T> {
  visible: T[];
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  pageCount: number;
  first: number;
  last: number;
  total: number;
}

/**
 * Where you are in a long list.
 *
 * Shared because the table and the tile list are the same list shown two
 * ways — a shelf that paginates differently depending on whether its rows
 * have borders is two shelves.
 */
export function usePaged<T>(rows: T[], initialPageSize = 10): Paged<T> {
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

  return {
    visible,
    page: safePage,
    setPage,
    pageSize,
    setPageSize: (size: number) => {
      setPageSize(size);
      setPage(1);
    },
    pageCount,
    first: rows.length === 0 ? 0 : (safePage - 1) * pageSize + 1,
    last: Math.min(safePage * pageSize, rows.length),
    total: rows.length,
  };
}

/**
 * Everything about position in the list, in one place. Split across the top
 * and bottom it reads as two controls that happen to share a subject.
 */
export function PaginationBar<T>({ paged, className }: { paged: Paged<T>; className?: string }) {
  const { page, setPage, pageSize, setPageSize, pageCount, first, last, total } = paged;

  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3 px-4 py-2.5", className)}>
      <div className="flex items-center gap-2 text-caption text-ink-3">
        <span className="font-bold text-ink-4">Rows</span>
        <div className="flex gap-0.5 rounded-glyph border border-hair-2 bg-subtle p-0.5">
          {PAGE_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              aria-pressed={pageSize === size}
              onClick={() => setPageSize(size)}
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
          {first}–{last} of {total}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          aria-label="Previous page"
          className="grid size-7 cursor-pointer place-items-center rounded-glyph text-ink-3 transition hover:bg-black/5 hover:text-ink disabled:opacity-35"
        >
          <ChevronLeft className="size-4" />
        </button>

        {Array.from({ length: pageCount }, (_, i) => i + 1)
          /* Long lists show the ends and a window around where you are,
             rather than forty buttons. */
          .filter((n) => n === 1 || n === pageCount || Math.abs(n - page) <= 1)
          .map((n, index, shown) => (
            <span key={n} className="flex items-center">
              {index > 0 && shown[index - 1] !== n - 1 && (
                <span className="px-1 text-caption text-ink-4">…</span>
              )}
              <button
                type="button"
                onClick={() => setPage(n)}
                aria-current={n === page ? "page" : undefined}
                className={cn(
                  "grid size-7 cursor-pointer place-items-center rounded-glyph text-caption font-bold tabular-nums transition-colors",
                  n === page ? "bg-brand text-white" : "text-ink-3 hover:bg-black/5 hover:text-ink"
                )}
              >
                {n}
              </button>
            </span>
          ))}

        <button
          type="button"
          onClick={() => setPage(Math.min(pageCount, page + 1))}
          disabled={page === pageCount}
          aria-label="Next page"
          className="grid size-7 cursor-pointer place-items-center rounded-glyph text-ink-3 transition hover:bg-black/5 hover:text-ink disabled:opacity-35"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
