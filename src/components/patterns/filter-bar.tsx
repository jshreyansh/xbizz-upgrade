"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * How a library shelf is narrowed, once.
 *
 * Shelves had grown a segmented control per question — kind, stage, status,
 * language, gender — and at a laptop's width they wrapped into two or three
 * rows of pills that all looked equally important. Three tiers now:
 *
 *   1. Tabs across the top for the one split everybody makes first (what kind
 *      of thing), each with its count. Underlined, because they are the same
 *      list filtered, not somewhere else (TabNav is for somewhere else).
 *   2. One toolbar: search, a Filters button holding every secondary question
 *      with a badge for how many are set, and anything trailing (view toggle).
 *   3. What's applied, as chips you can take off one at a time — shown only
 *      when something is applied, so the resting state is two quiet rows.
 */

export interface FilterTab {
  id: string;
  label: string;
  count?: number;
}

export function FilterTabs({ items, activeId, onSelect, ariaLabel }: { items: FilterTab[]; activeId: string; onSelect: (id: string) => void; ariaLabel: string }) {
  return (
    <div role="tablist" aria-label={ariaLabel} className="flex items-end gap-5 overflow-x-auto border-b border-hair [scrollbar-width:none]">
      {items.map((tab) => {
        const on = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onSelect(tab.id)}
            className={cn(
              "-mb-px flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap border-b-2 pb-2.5 pt-1 text-body font-bold transition-colors",
              on ? "border-brand text-ink" : "border-transparent text-ink-3 hover:text-ink"
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn("rounded-glyph px-1.5 text-micro font-bold tabular-nums", on ? "bg-tint text-brand-deep" : "bg-subtle text-ink-4")}>{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export interface FilterGroup {
  id: string;
  label: string;
  options: Array<{ id: string; label: string }>;
  value: string;
  /** The "not narrowed" value: not counted, not shown as a chip. */
  defaultValue: string;
  onChange: (value: string) => void;
}

export function FilterBar({
  query,
  onQuery,
  placeholder,
  filters = [],
  trailing,
}: {
  query: string;
  onQuery: (q: string) => void;
  placeholder: string;
  filters?: FilterGroup[];
  /** Controls at the end of the row, e.g. the grid / list toggle. */
  trailing?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const applied = filters.filter((f) => f.value !== f.defaultValue);

  /* Closes on a click anywhere else, or Escape. */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2.5">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[15px] -translate-y-1/2 text-ink-4" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder={placeholder}
            className="h-10 w-full rounded-control border border-hair-2 bg-card pl-9 pr-3 text-body text-ink placeholder:text-ink-4 focus:border-brand focus:outline-none"
          />
        </label>

        {filters.length > 0 && (
          <div ref={boxRef} className="relative shrink-0">
            <button
              type="button"
              aria-expanded={open}
              aria-haspopup="dialog"
              onClick={() => setOpen((o) => !o)}
              className={cn(
                "flex h-10 cursor-pointer items-center gap-2 rounded-control border px-3.5 text-body font-bold transition-colors",
                open || applied.length ? "border-brand/40 bg-tint text-brand-deep" : "border-hair-2 bg-card text-ink-2 hover:border-hair-3"
              )}
            >
              <SlidersHorizontal className="size-4" />
              Filters
              {applied.length > 0 && <span className="grid size-5 place-items-center rounded-full bg-brand text-micro font-bold text-white">{applied.length}</span>}
            </button>

            {open && (
              <div role="dialog" aria-label="Filters" className="absolute right-0 top-[calc(100%+6px)] z-30 w-[min(360px,calc(100vw-32px))] space-y-4 rounded-panel border border-hair bg-card p-4 shadow-float">
                {filters.map((group) => (
                  <div key={group.id} className="space-y-2">
                    <div className="text-caption font-bold uppercase tracking-wider text-ink-3">{group.label}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {group.options.map((opt) => {
                        const on = group.value === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => group.onChange(opt.id)}
                            className={cn(
                              "inline-flex cursor-pointer items-center gap-1 rounded-chip border px-2.5 py-1 text-label font-semibold transition",
                              on ? "border-brand bg-tint text-brand-deep" : "border-hair-2 bg-card text-ink-2 hover:border-brand/50"
                            )}
                          >
                            {on && <Check className="size-3" />}
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-hair pt-3">
                  <button
                    type="button"
                    disabled={!applied.length}
                    onClick={() => filters.forEach((f) => f.onChange(f.defaultValue))}
                    className="cursor-pointer text-label font-bold text-ink-3 hover:text-ink disabled:cursor-default disabled:opacity-40"
                  >
                    Clear all
                  </button>
                  <button type="button" onClick={() => setOpen(false)} className="cursor-pointer rounded-control bg-ink px-3 py-1.5 text-label font-bold text-white">
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {trailing}
      </div>

      {applied.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {applied.map((f) => (
            <span key={f.id} className="inline-flex items-center gap-1 rounded-chip border border-brand/30 bg-tint py-0.5 pl-2.5 pr-1 text-label font-semibold text-brand-deep">
              <span className="text-ink-3">{f.label}:</span>
              {f.options.find((o) => o.id === f.value)?.label}
              <button type="button" aria-label={`Remove ${f.label} filter`} onClick={() => f.onChange(f.defaultValue)} className="grid size-5 cursor-pointer place-items-center rounded-full hover:bg-brand/15">
                <X className="size-3" />
              </button>
            </span>
          ))}
          <button type="button" onClick={() => filters.forEach((f) => f.onChange(f.defaultValue))} className="cursor-pointer px-1.5 text-label font-bold text-ink-3 hover:text-ink">
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
