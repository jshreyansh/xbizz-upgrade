"use client";

import { FileSearch, Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { FilterPickerModal } from "@/features/claims-library/filter-picker-modal";

/**
 * The controls every list of claims shares — the Claims Library across
 * brands, and one brand's own Claims tab. Written once so the search, the
 * filter buttons and the source dialog look and behave the same in both.
 */

/** Where the evidence behind a claim can be checked, most-cited first. */
const SOURCE_ORDER = ["FDA", "PubMed", "ClinicalTrials.gov", "Data on file"];
const SOURCE_DETAIL: Record<string, string> = {
  FDA: "Prescribing information and approved labelling",
  PubMed: "Peer-reviewed literature",
  "ClinicalTrials.gov": "Registered trial records",
  "Data on file": "The company's own data on file",
};

/** The distinct sources, in a fixed order so a list never reshuffles. */
export function orderedSources(values: string[]): string[] {
  return [...new Set(values)].sort(
    (x, y) => (SOURCE_ORDER.indexOf(x) + 1 || 99) - (SOURCE_ORDER.indexOf(y) + 1 || 99)
  );
}

/** "Affolmy", or "Affolmy +2" once there is more than one. */
export function pickedLabel(names: string[], all: string) {
  if (names.length === 0) return all;
  return names.length === 1 ? names[0] : `${names[0]} +${names.length - 1}`;
}

export function ClaimSearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative min-w-[220px] max-w-[420px] flex-1">
      <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-4" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-control border border-hair-2 bg-card py-2.5 pl-9 pr-3 text-body-lg text-ink outline-none transition placeholder:text-ink-4 focus:border-brand focus:ring-2 focus:ring-brand/15"
      />
    </div>
  );
}

/**
 * The button that opens a filter, and the × that clears it. Outlined while
 * showing everything, tinted once it narrows the list, so a filtered shelf
 * never looks like the whole one.
 */
export function FilterTrigger({
  label,
  active,
  onOpen,
  onClear,
  clearLabel,
}: {
  label: string;
  active: boolean;
  onOpen: () => void;
  onClear: () => void;
  clearLabel: string;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-control border px-3 py-2 text-body font-bold transition-colors",
          active
            ? "border-brand bg-tint text-brand-deep"
            : "border-hair-2 bg-card text-ink-2 hover:border-hair-3 hover:bg-canvas"
        )}
      >
        <SlidersHorizontal size={14} />
        {label}
      </button>
      {active && (
        <button
          type="button"
          onClick={onClear}
          aria-label={clearLabel}
          className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-control text-ink-4 transition hover:bg-subtle hover:text-ink"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

/** Pick any number of evidence sources. */
export function SourceFilterModal({
  sources,
  counts,
  selected,
  onChange,
  resultCount,
  onClose,
}: {
  /** The sources to offer, already ordered. */
  sources: string[];
  /** Claims per source, given the list's other filters. */
  counts: Record<string, number>;
  selected: string[];
  onChange: (next: string[]) => void;
  resultCount: number;
  onClose: () => void;
}) {
  return (
    <FilterPickerModal
      title="Filter by source"
      description="Show the claims whose evidence comes from the sources you pick."
      allLabel="All sources"
      allSublabel={`Every claim across ${sources.length} sources`}
      searchPlaceholder="Search sources…"
      items={sources.map((source) => ({
        id: source,
        label: source,
        sublabel: SOURCE_DETAIL[source],
        count: counts[source] ?? 0,
        leading: (
          <span className="grid size-9 shrink-0 place-items-center rounded-control bg-tint-2 text-brand-deep">
            <FileSearch size={16} />
          </span>
        ),
      }))}
      selectedIds={selected}
      onChange={onChange}
      resultCount={resultCount}
      onClose={onClose}
    />
  );
}
