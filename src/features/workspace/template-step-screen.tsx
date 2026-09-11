"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Layers,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { TEMPLATE_ARCHETYPES, type TemplateArchetype } from "@/features/workspace/template-archetypes";
import {
  DEFAULT_TEMPLATE_FILTERS,
  ELEMENT_LABELS,
  FAMILY_LABELS,
  TEMPLATE_LIBRARY,
  filterTemplates,
  matchingCount,
  templateCost,
  type Template,
  type TemplateElement,
  type TemplateFamily,
  type TemplateFilters,
  type TemplateShape,
} from "@/features/workspace/template-library";

/**
 * Choosing the layout, as its own step.
 *
 * It was an accordion inside the plan, which put a decision about the page's
 * whole composition beside decisions about audience and sources — and left no
 * room at all for the twelve hundred variants behind the five families.
 *
 * The five stay in front, because that is what a person chooses from. The
 * library sits behind one button, defaulted to the templates that can
 * actually carry this brief at this page shape, and brand-approved only,
 * because in pharma an unapproved layout is not a choice.
 */
export function TemplateStepScreen({
  brief,
  pageShape,
  pages,
  selectedId,
  libraryTemplateId,
  onSelectArchetype,
  onSelectTemplate,
  onBack,
  onContinue,
}: {
  brief: string;
  pageShape: TemplateShape;
  pages: number;
  selectedId: TemplateArchetype["id"];
  /** Set when the choice came out of the library rather than the shortlist. */
  libraryTemplateId: string | null;
  onSelectArchetype: (id: TemplateArchetype["id"]) => void;
  onSelectTemplate: (template: Template) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const [browsing, setBrowsing] = useState(false);

  const matching = useMemo(() => matchingCount(brief, pages, pageShape), [brief, pages, pageShape]);
  const chosen = libraryTemplateId
    ? TEMPLATE_LIBRARY.find((t) => t.id === libraryTemplateId) ?? null
    : null;

  /* Fit blocks here, which is where the decision is. It used to block on the
     plan screen, before a layout had been chosen at all — refusing a choice
     nobody had made yet. A clipped safety block is still a regulatory
     failure, so this is a block and not a warning. */
  const chosenCost = chosen
    ? templateCost(chosen, brief, pages)
    : costForFamily(selectedId, brief, pages);
  const blocked = chosenCost?.severe ?? false;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#f4f6f3]">
      <header className="flex flex-wrap items-center gap-2 border-b border-hair bg-card px-3 py-2 sm:px-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to the plan"
          className="focus-ring grid size-8 shrink-0 cursor-pointer place-items-center rounded-chip text-ink-3 hover:bg-black/5 hover:text-ink"
        >
          <ArrowLeft className="size-4" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Layers className="size-3.5 shrink-0 text-brand" />
            <span className="truncate text-body-lg font-[850] tracking-tight text-ink">
              Design &amp; layout
            </span>
          </div>
          <p className="mt-0.5 text-micro text-ink-3">
            The archetype decides the composition — which blocks exist, and how much each one holds.
          </p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-chip border border-hair-2 bg-canvas px-2.5 py-1 text-caption font-bold text-ink-2">
            {matching.toLocaleString()} of {TEMPLATE_LIBRARY.length.toLocaleString()} templates match this brief
          </span>
          <button
            type="button"
            onClick={() => setBrowsing(true)}
            className="focus-ring inline-flex cursor-pointer items-center gap-1.5 rounded-chip border border-hair-2 bg-card px-2.5 py-1 text-caption font-bold text-ink-2 transition hover:border-brand hover:text-brand"
          >
            <Search className="size-3" />
            Browse all templates
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
        <div className="mx-auto max-w-[1040px]">
          {chosen && (
            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-panel border border-brand/25 bg-tint px-3 py-2">
              <span className="rounded-glyph bg-brand px-1.5 py-0.5 text-micro font-bold text-white">
                From library
              </span>
              <span className="text-body font-bold text-ink">{chosen.name}</span>
              <span className="text-label text-ink-3">
                {FAMILY_LABELS[chosen.family]} · {chosen.shape} · {chosen.statSlots} figure
                {chosen.statSlots === 1 ? "" : "s"}
              </span>
              <button
                type="button"
                onClick={() => setBrowsing(true)}
                className="ml-auto cursor-pointer text-label font-bold text-brand hover:underline"
              >
                Change
              </button>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATE_ARCHETYPES.map((archetype) => (
              <ArchetypeCard
                key={archetype.id}
                archetype={archetype}
                selected={selectedId === archetype.id && !chosen}
                cost={costForFamily(archetype.id, brief, pages)}
                onSelect={() => onSelectArchetype(archetype.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-hair bg-card px-3 py-2.5 sm:px-4">
        <div className="mx-auto flex max-w-[1040px] flex-wrap items-center justify-between gap-2">
          <span
            className={cn(
              "min-w-0 text-micro",
              blocked ? "font-bold text-warn" : "text-ink-3"
            )}
          >
            {blocked
              ? `${chosenCost?.label} — choose a layout that can carry this brief, or shorten the request.`
              : "You can swap a single page\u2019s layout later in the studio — this sets the deck."}
          </span>
          <Button
            onClick={onContinue}
            disabled={blocked}
            className="h-9 shrink-0 cursor-pointer gap-1.5 rounded-control bg-brand px-5 text-body font-bold text-white hover:bg-brand-deep disabled:opacity-40"
          >
            Continue to copy
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </div>

      {browsing && (
        <TemplateLibraryModal
          brief={brief}
          pages={pages}
          pageShape={pageShape}
          onPick={(template) => {
            onSelectTemplate(template);
            setBrowsing(false);
          }}
          onClose={() => setBrowsing(false)}
        />
      )}
    </div>
  );
}

/** The shortlist card's own cost, computed the same way the library's is. */
function costForFamily(family: TemplateFamily, brief: string, pages: number) {
  const representative = TEMPLATE_LIBRARY.find((t) => t.family === family);
  return representative ? templateCost(representative, brief, pages) : null;
}

function ArchetypeCard({
  archetype,
  selected,
  cost,
  onSelect,
}: {
  archetype: TemplateArchetype;
  selected: boolean;
  cost: { label: string; severe: boolean } | null;
  onSelect: () => void;
}) {
  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-card border bg-card transition",
        selected ? "border-brand ring-2 ring-brand/15 shadow-sm" : "border-hair shadow-2xs"
      )}
    >
      <div className="flex items-start gap-2 p-3 pb-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-body-lg font-[850] tracking-tight text-ink">{archetype.name}</h3>
          <p className="mt-0.5 line-clamp-2 text-label leading-snug text-ink-3">{archetype.tagline}</p>
        </div>
        <span
          className={cn(
            "grid size-5 shrink-0 place-items-center rounded-full border transition",
            selected ? "border-brand bg-brand text-white" : "border-hair-3 text-transparent"
          )}
          aria-hidden
        >
          <Check className="size-3 stroke-[3]" />
        </span>
      </div>

      {/* A sample carrying the real typography and figures, so the choice is
          made against something rather than a name. */}
      <div
        style={{ background: archetype.previewBg }}
        className="mx-3 flex flex-col gap-1 rounded-panel p-3"
      >
        <span className="w-fit rounded-glyph bg-black/25 px-1.5 py-0.5 text-micro font-extrabold uppercase tracking-wider text-white/90">
          {archetype.badge}
        </span>
        <span className="text-display font-[850] leading-tight tracking-tight text-white">
          {archetype.metric}
        </span>
        <span className="text-caption text-white/70">{archetype.metricSub}</span>
        <ul className="mt-1 space-y-0.5">
          {archetype.points.slice(0, 2).map((point) => (
            <li key={point} className="flex items-start gap-1.5 text-micro text-white/75">
              <span className="mt-1 size-1 shrink-0 rounded-full bg-white/60" />
              <span className="line-clamp-1">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {cost && (
        <div
          className={cn(
            "mx-3 mt-2 flex items-start gap-1.5 rounded-control border px-2 py-1.5",
            cost.severe ? "border-warn-line bg-warn-bg" : "border-hair-2 bg-canvas"
          )}
        >
          <AlertTriangle className={cn("mt-0.5 size-3 shrink-0", cost.severe ? "text-warn" : "text-ink-4")} />
          <span className={cn("text-micro font-bold leading-snug", cost.severe ? "text-warn" : "text-ink-3")}>
            {cost.label}
          </span>
        </div>
      )}

      <div className="p-3 pt-2">
        <button
          type="button"
          onClick={onSelect}
          className={cn(
            "focus-ring h-8 w-full cursor-pointer rounded-control text-label font-bold transition",
            selected
              ? "bg-brand text-white"
              : "border border-hair-2 bg-card text-ink-2 hover:border-brand hover:text-brand"
          )}
        >
          {selected ? `Using ${archetype.name}` : `Use ${archetype.name}`}
        </button>
      </div>
    </article>
  );
}

/* ─────────────────────────────── the library ─────────────────────────────── */

const SHAPE_OPTIONS: TemplateShape[] = ["16:9", "9:16", "1:1", "3:4", "A4"];
const ELEMENT_OPTIONS: TemplateElement[] = ["chart", "packshot", "table", "isi", "moa-diagram", "photo"];

/**
 * Browsing the catalogue.
 *
 * The control that matters is the scope toggle, defaulted to the narrow side:
 * you land on a number you can actually work through, and the whole library
 * is one click away. Filters cut before the grid renders, because a grid of a
 * thousand thumbnails is how you lose the five that would have worked.
 */
function TemplateLibraryModal({
  brief,
  pages,
  pageShape,
  onPick,
  onClose,
}: {
  brief: string;
  pages: number;
  pageShape: TemplateShape;
  onPick: (template: Template) => void;
  onClose: () => void;
}) {
  const [filters, setFilters] = useState<TemplateFilters>(DEFAULT_TEMPLATE_FILTERS);

  const results = useMemo(
    () => filterTemplates(filters, brief, pages, pageShape),
    [filters, brief, pages, pageShape]
  );
  const matching = useMemo(() => matchingCount(brief, pages, pageShape), [brief, pages, pageShape]);

  const set = <K extends keyof TemplateFilters>(key: K, value: TemplateFilters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Template library"
      className="fixed inset-0 z-[9999] grid place-items-center bg-ink/50 p-4 backdrop-blur-sm"
    >
      <div className="rise-in flex h-[86vh] w-full max-w-[1080px] flex-col overflow-hidden rounded-card border border-hair-2 bg-card shadow-float">
        <div className="flex items-start justify-between gap-3 border-b border-hair-2 bg-canvas px-5 py-3.5">
          <div className="min-w-0">
            <div className="text-caption font-extrabold uppercase tracking-[0.14em] text-brand">Library</div>
            <h2 className="mt-0.5 text-display font-[850] tracking-tight text-ink">Templates</h2>
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-2 pt-1">
            <label className="relative flex min-w-0 flex-1 items-center">
              <Search className="absolute left-2.5 size-3.5 text-ink-4" />
              <input
                type="search"
                value={filters.search}
                onChange={(e) => set("search", e.target.value)}
                placeholder="Search layouts…"
                className="w-full rounded-control border border-hair-2 bg-card py-1.5 pl-8 pr-2.5 text-body text-ink outline-none focus:border-brand"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-ink-3 transition-colors hover:bg-black/5 hover:text-ink"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* Scope, first and largest: it is the difference between a usable
            list and a thousand thumbnails. */}
        <div className="flex flex-wrap items-center gap-2 border-b border-hair px-5 py-2.5">
          {[
            { id: true, label: "Matches this brief", count: matching },
            { id: false, label: "All templates", count: TEMPLATE_LIBRARY.length },
          ].map((scope) => (
            <button
              key={String(scope.id)}
              type="button"
              onClick={() => set("matchesBrief", scope.id)}
              className={cn(
                "cursor-pointer rounded-chip px-3 py-1.5 text-body font-bold transition",
                filters.matchesBrief === scope.id
                  ? "bg-brand text-white shadow-xs"
                  : "border border-hair-2 bg-card text-ink-2 hover:border-brand hover:text-brand"
              )}
            >
              {scope.label}
              <span className="ml-1.5 tabular-nums opacity-70">{scope.count.toLocaleString()}</span>
            </button>
          ))}

          <label className="ml-auto flex cursor-pointer items-center gap-1.5 text-label font-bold text-ink-2">
            <input
              type="checkbox"
              checked={filters.approvedOnly}
              onChange={(e) => set("approvedOnly", e.target.checked)}
              className="size-3.5 accent-[#fd4816]"
            />
            <ShieldCheck className="size-3.5 text-ok" />
            Brand-approved only
          </label>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* ── filters ── */}
          <aside className="hidden w-52 shrink-0 flex-col gap-3.5 overflow-y-auto border-r border-hair bg-canvas p-3.5 sm:flex">
            <FilterGroup label="Family">
              <FilterChip active={filters.family === "all"} onClick={() => set("family", "all")}>
                Any
              </FilterChip>
              {(Object.keys(FAMILY_LABELS) as TemplateFamily[]).map((family) => (
                <FilterChip
                  key={family}
                  active={filters.family === family}
                  onClick={() => set("family", family)}
                >
                  {FAMILY_LABELS[family]}
                </FilterChip>
              ))}
            </FilterGroup>

            <FilterGroup label="Page shape">
              <FilterChip active={filters.shape === "all"} onClick={() => set("shape", "all")}>
                Any
              </FilterChip>
              {SHAPE_OPTIONS.map((shape) => (
                <FilterChip key={shape} active={filters.shape === shape} onClick={() => set("shape", shape)}>
                  {shape}
                </FilterChip>
              ))}
            </FilterGroup>

            <FilterGroup label="Figures">
              <FilterChip active={filters.statSlots === 0} onClick={() => set("statSlots", 0)}>
                Any
              </FilterChip>
              {[1, 2, 3, 4].map((n) => (
                <FilterChip key={n} active={filters.statSlots === n} onClick={() => set("statSlots", n)}>
                  {n}
                </FilterChip>
              ))}
            </FilterGroup>

            <FilterGroup label="Contains">
              {ELEMENT_OPTIONS.map((element) => (
                <FilterChip
                  key={element}
                  active={filters.contains.includes(element)}
                  onClick={() =>
                    set(
                      "contains",
                      filters.contains.includes(element)
                        ? filters.contains.filter((e) => e !== element)
                        : [...filters.contains, element]
                    )
                  }
                >
                  {ELEMENT_LABELS[element]}
                </FilterChip>
              ))}
            </FilterGroup>

            <button
              type="button"
              onClick={() => setFilters(DEFAULT_TEMPLATE_FILTERS)}
              className="mt-auto cursor-pointer text-label font-bold text-brand hover:underline"
            >
              Reset filters
            </button>
          </aside>

          {/* ── results ── */}
          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto p-3.5">
            <p className="mb-2.5 text-label text-ink-3">
              {results.length.toLocaleString()} {results.length === 1 ? "layout" : "layouts"}, best fit first
            </p>

            {results.length === 0 ? (
              <div className="rounded-panel border border-dashed border-hair-2 bg-canvas px-4 py-12 text-center">
                <p className="text-body font-bold text-ink-2">Nothing matches those filters</p>
                <p className="mt-0.5 text-label text-ink-4">
                  Widen the scope to all templates, or clear a filter.
                </p>
              </div>
            ) : (
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {results.slice(0, 60).map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    cost={templateCost(template, brief, pages)}
                    onPick={() => onPick(template)}
                  />
                ))}
              </div>
            )}

            {results.length > 60 && (
              <p className="mt-3 text-center text-label text-ink-4">
                Showing the 60 best-fitting of {results.length.toLocaleString()}. Narrow the filters to see more.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-caption font-extrabold uppercase tracking-wider text-ink-3">{label}</div>
      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "cursor-pointer rounded-chip border px-2 py-0.5 text-label font-bold transition",
        active
          ? "border-brand bg-tint text-brand-deep"
          : "border-hair-2 bg-card text-ink-3 hover:border-hair-3 hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}

function TemplateCard({
  template,
  cost,
  onPick,
}: {
  template: Template;
  cost: { label: string; severe: boolean } | null;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="group flex cursor-pointer flex-col gap-2 rounded-panel border border-hair bg-card p-2.5 text-left shadow-2xs transition hover:border-brand hover:shadow-xs"
    >
      {/* A wireframe rather than a fake screenshot: it shows the skeleton the
          layout actually has, which is the thing being chosen. */}
      <div
        style={{ aspectRatio: template.shape.replace(":", " / ").replace("A4", "1 / 1.414") }}
        className="flex w-full flex-col gap-1 overflow-hidden rounded-control border border-hair-2 bg-canvas p-1.5"
      >
        <div className="h-2 w-2/3 shrink-0 rounded-glyph bg-ink/70" />
        <div className="flex flex-1 gap-1">
          <div className="flex flex-1 flex-col gap-1">
            {Array.from({ length: template.statSlots }).map((_, i) => (
              <div key={i} className="h-3 shrink-0 rounded-glyph bg-brand/30" />
            ))}
            <div className="flex-1 rounded-glyph bg-black/[0.06]" />
          </div>
          {template.elements.includes("chart") && (
            <div className="w-1/3 shrink-0 rounded-glyph bg-info-strong/20" />
          )}
        </div>
        {template.elements.includes("isi") && (
          <div className="h-1.5 shrink-0 rounded-glyph bg-black/10" />
        )}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-body font-bold text-ink group-hover:text-brand">
            {template.name}
          </span>
          {template.approved && <ShieldCheck aria-label="Brand-approved" className="size-3 shrink-0 text-ok" />}
        </div>
        <p className="truncate text-micro text-ink-3">
          {FAMILY_LABELS[template.family]} · {template.shape} ·{" "}
          {template.elements.map((e) => ELEMENT_LABELS[e]).join(", ")}
        </p>
      </div>

      {cost ? (
        <span
          className={cn(
            "inline-flex w-fit items-center gap-1 rounded-glyph border px-1.5 py-0.5 text-micro font-bold",
            cost.severe ? "border-warn-line bg-warn-bg text-warn" : "border-hair-2 bg-canvas text-ink-3"
          )}
        >
          <AlertTriangle className="size-2.5" />
          {cost.label}
        </span>
      ) : (
        <span className="inline-flex w-fit items-center gap-1 rounded-glyph border border-ok-line bg-ok-bg px-1.5 py-0.5 text-micro font-bold text-ok">
          <Check className="size-2.5" />
          Carries this brief
        </span>
      )}
    </button>
  );
}
