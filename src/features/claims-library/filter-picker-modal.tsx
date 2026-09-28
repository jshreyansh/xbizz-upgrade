"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Check, Search, X } from "lucide-react";
import { Portal } from "@/components/ui/portal";
import { cn } from "@/lib/cn";

export interface FilterPickerItem {
  id: string;
  label: string;
  sublabel?: string;
  /** Artwork or an icon plate, 36px square. */
  leading: ReactNode;
  /** Claims this item would show, given the library's other filters. */
  count: number;
  /** Extra text the search should match, e.g. molecule or therapy area. */
  keywords?: string[];
}

/** A checkbox mark: this filter is multi-select, so every row is a tick. */
function Tick({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-5 shrink-0 place-items-center rounded-glyph border transition-colors",
        on ? "border-brand bg-brand text-white" : "border-hair-3 bg-card text-transparent"
      )}
    >
      <Check className="size-3" strokeWidth={3.5} />
    </span>
  );
}

/**
 * Pick any number of values for one filter — brands, or evidence sources.
 *
 * The same dialog for both, so the two filters behave alike: tick as many
 * as you want, see the list behind the dialog narrow as you go, and close
 * it with the count of what you will get. "All …" at the top clears the
 * picks, since selecting nothing and selecting everything mean the same.
 *
 * Search appears only when the list is long enough to need it; four
 * sources do not.
 */
export function FilterPickerModal({
  title,
  description,
  allLabel,
  allSublabel,
  searchPlaceholder,
  items,
  selectedIds,
  onChange,
  resultCount,
  onClose,
}: {
  title: string;
  description: string;
  allLabel: string;
  allSublabel: string;
  searchPlaceholder: string;
  items: FilterPickerItem[];
  selectedIds: string[];
  onChange: (next: string[]) => void;
  /** Claims the library shows with the current picks. */
  resultCount: number;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const searchable = items.length > 6;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [item.label, item.sublabel ?? "", ...(item.keywords ?? [])].some((text) => text.toLowerCase().includes(q))
    );
  }, [items, query]);

  const toggle = (id: string) =>
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[9999] grid place-items-center bg-ink/55 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={onClose}
      >
        <div
          className="flex max-h-[80vh] w-full max-w-[560px] flex-col overflow-hidden rounded-card border border-hair bg-card shadow-float"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3 border-b border-hair px-5 py-4">
            <div>
              <h2 className="text-subhead font-[850] tracking-tight text-ink">{title}</h2>
              <p className="mt-0.5 text-label text-ink-3">{description}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-ink-3 transition hover:bg-black/5 hover:text-ink"
            >
              <X className="size-4" />
            </button>
          </div>

          {searchable && (
            <div className="border-b border-hair px-5 py-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-4" />
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-control border border-hair-2 bg-card py-2 pl-9 pr-3 text-body text-ink outline-none transition placeholder:text-ink-4 focus:border-brand focus:ring-2 focus:ring-brand/15"
                />
              </div>
            </div>
          )}

          <div role="listbox" aria-multiselectable="true" className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-3">
            <button
              type="button"
              role="option"
              aria-selected={selectedIds.length === 0}
              onClick={() => onChange([])}
              className={cn(
                "flex w-full cursor-pointer items-center gap-3 rounded-control border p-3 text-left transition",
                selectedIds.length === 0 ? "border-brand bg-tint" : "border-hair-2 bg-card hover:border-hair-3 hover:bg-canvas"
              )}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-control bg-subtle text-caption font-extrabold text-ink-3">
                All
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-body-lg font-bold text-ink">{allLabel}</span>
                <span className="block text-caption text-ink-4">{allSublabel}</span>
              </span>
              <Tick on={selectedIds.length === 0} />
            </button>

            {results.map((item) => {
              const on = selectedIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={on}
                  onClick={() => toggle(item.id)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-3 rounded-control border p-3 text-left transition",
                    on ? "border-brand bg-tint" : "border-hair-2 bg-card hover:border-hair-3 hover:bg-canvas"
                  )}
                >
                  {item.leading}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body-lg font-bold text-ink">{item.label}</span>
                    {item.sublabel && <span className="block truncate text-caption text-ink-4">{item.sublabel}</span>}
                  </span>
                  <span className="shrink-0 rounded-chip bg-subtle px-2 py-0.5 text-caption font-bold tabular-nums text-ink-3">
                    {item.count} {item.count === 1 ? "claim" : "claims"}
                  </span>
                  <Tick on={on} />
                </button>
              );
            })}

            {results.length === 0 && (
              <p className="px-3 py-10 text-center text-body text-ink-4">Nothing matches &ldquo;{query}&rdquo;.</p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-hair px-5 py-3">
            <span className="text-label text-ink-3">
              {selectedIds.length === 0 ? "None picked, showing all" : `${selectedIds.length} picked`}
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="ml-2 cursor-pointer font-bold text-brand hover:text-brand-deep"
                >
                  Clear
                </button>
              )}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-control bg-brand px-4 py-2 text-body font-bold text-white shadow-brand-lift transition hover:bg-brand-deep"
            >
              Show {resultCount} {resultCount === 1 ? "claim" : "claims"}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
