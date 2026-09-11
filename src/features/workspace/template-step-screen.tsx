"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Layers, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { TEMPLATE_ARCHETYPES, type TemplateArchetype } from "@/features/workspace/template-archetypes";
import {
  ELEMENT_LABELS,
  FAMILY_LABELS,
  TEMPLATE_LIBRARY,
  filterTemplates,
  matchingCount,
  templateCost,
  type Template,
  type TemplateElement,
  type TemplateFamily,
  type TemplateShape,
} from "@/features/workspace/template-library";

/**
 * Choosing the layout, as its own step.
 *
 * It was an accordion inside the plan, which put a decision about the page's
 * whole composition beside decisions about audience and sources, and left no
 * room for the twelve hundred variants behind the five families.
 *
 * Browsing happens on this screen rather than in a modal over it. The step
 * exists precisely to choose a layout, so putting the catalogue behind a
 * dialog meant two places to look and one of them covering the other. The
 * five families become the categories, and the recommended row stays in front
 * because five is what a person starts from.
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
  /** Set when the choice came out of the catalogue rather than the shortlist. */
  libraryTemplateId: string | null;
  onSelectArchetype: (id: TemplateArchetype["id"]) => void;
  onSelectTemplate: (template: Template) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const [search, setSearch] = useState("");
  const [family, setFamily] = useState<TemplateFamily | "all">("all");
  const [shape, setShape] = useState<TemplateShape | "all">("all");
  const [statSlots, setStatSlots] = useState(0);
  const [contains, setContains] = useState<TemplateElement[]>([]);
  const [approvedOnly, setApprovedOnly] = useState(true);
  const [matchesBrief, setMatchesBrief] = useState(true);
  const [shown, setShown] = useState(24);

  const results = useMemo(
    () =>
      filterTemplates(
        { matchesBrief, family, shape, statSlots, contains, approvedOnly, search },
        brief,
        pages,
        pageShape
      ),
    [matchesBrief, family, shape, statSlots, contains, approvedOnly, search, brief, pages, pageShape]
  );

  const matching = useMemo(() => matchingCount(brief, pages, pageShape), [brief, pages, pageShape]);
  const chosen = libraryTemplateId
    ? TEMPLATE_LIBRARY.find((t) => t.id === libraryTemplateId) ?? null
    : null;

  /* Fit blocks here, which is where the decision is. It used to block on the
     plan screen, before a layout had been chosen at all. */
  const chosenCost = chosen ? templateCost(chosen, brief, pages) : costForFamily(selectedId, brief, pages);
  const blocked = chosenCost?.severe ?? false;

  /* The recommended row is the shortlist, and it only makes sense while you
     are not already looking for something specific. */
  const browsing = search.trim().length > 0 || family !== "all" || shape !== "all" || statSlots > 0 || contains.length > 0;

  const toggleContains = (element: TemplateElement) =>
    setContains((prev) => (prev.includes(element) ? prev.filter((e) => e !== element) : [...prev, element]));

  const resetFilters = () => {
    setSearch("");
    setFamily("all");
    setShape("all");
    setStatSlots(0);
    setContains([]);
  };

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col border-r border-hair bg-[#eef1ed]">
      {/* ── What this step is, and the way into the catalogue ── */}
      <header className="shrink-0 border-b border-hair bg-card px-3 py-2.5 sm:px-4">
        <div className="flex flex-wrap items-center gap-2">
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

          <label className="relative ml-auto flex min-w-[180px] max-w-[320px] flex-1 items-center">
            <Search className="absolute left-2.5 size-3.5 text-ink-4" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShown(24);
              }}
              placeholder="Search layouts…"
              className="w-full rounded-control border border-hair-2 bg-canvas py-1.5 pl-8 pr-2.5 text-body text-ink outline-none focus:border-brand focus:bg-card"
            />
          </label>
        </div>

        {/* Scope, first: it is the difference between a usable list and a
            thousand thumbnails. */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {[
            { id: true, label: "Matches this brief", count: matching },
            { id: false, label: "All templates", count: TEMPLATE_LIBRARY.length },
          ].map((scope) => (
            <button
              key={String(scope.id)}
              type="button"
              onClick={() => {
                setMatchesBrief(scope.id);
                setShown(24);
              }}
              className={cn(
                "cursor-pointer rounded-chip px-2.5 py-1 text-caption font-bold transition",
                matchesBrief === scope.id
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
              checked={approvedOnly}
              onChange={(e) => setApprovedOnly(e.target.checked)}
              className="size-3.5 accent-[#fd4816]"
            />
            <ShieldCheck className="size-3.5 text-ok" />
            Brand-approved only
          </label>
        </div>
      </header>

      {/* ── Categories, then the narrower cuts ── */}
      <div className="shrink-0 space-y-1.5 border-b border-hair bg-canvas px-3 py-2 sm:px-4">
        <div className="flex flex-wrap items-center gap-1">
          <Chip active={family === "all"} onClick={() => { setFamily("all"); setShown(24); }}>
            All categories
          </Chip>
          {(Object.keys(FAMILY_LABELS) as TemplateFamily[]).map((id) => (
            <Chip
              key={id}
              active={family === id}
              onClick={() => { setFamily(id); setShown(24); }}
            >
              {FAMILY_LABELS[id]}
            </Chip>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <FilterRow label="Shape">
            <Chip small active={shape === "all"} onClick={() => setShape("all")}>Any</Chip>
            {(["16:9", "9:16", "1:1", "3:4", "A4"] as TemplateShape[]).map((s) => (
              <Chip key={s} small active={shape === s} onClick={() => setShape(s)}>{s}</Chip>
            ))}
          </FilterRow>

          <FilterRow label="Figures">
            <Chip small active={statSlots === 0} onClick={() => setStatSlots(0)}>Any</Chip>
            {[1, 2, 3, 4].map((n) => (
              <Chip key={n} small active={statSlots === n} onClick={() => setStatSlots(n)}>{n}</Chip>
            ))}
          </FilterRow>

          <FilterRow label="Contains">
            {(Object.keys(ELEMENT_LABELS) as TemplateElement[]).map((element) => (
              <Chip
                key={element}
                small
                active={contains.includes(element)}
                onClick={() => toggleContains(element)}
              >
                {ELEMENT_LABELS[element]}
              </Chip>
            ))}
          </FilterRow>

          {browsing && (
            <button
              type="button"
              onClick={resetFilters}
              className="ml-auto shrink-0 cursor-pointer text-label font-bold text-brand hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── The catalogue ── */}
      <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
        {chosen && (
          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-panel border border-brand/25 bg-tint px-3 py-2">
            <span className="rounded-glyph bg-brand px-1.5 py-0.5 text-micro font-bold text-white">Chosen</span>
            <span className="text-body font-bold text-ink">{chosen.name}</span>
            <span className="text-label text-ink-3">
              {FAMILY_LABELS[chosen.family]} · {chosen.shape} · {chosen.statSlots} figure
              {chosen.statSlots === 1 ? "" : "s"}
            </span>
          </div>
        )}

        {!browsing && (
          <>
            <SectionLabel>Recommended for this brief</SectionLabel>
            <div className="mb-5 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
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
          </>
        )}

        <SectionLabel>
          {results.length.toLocaleString()} {results.length === 1 ? "layout" : "layouts"} · best fit first
        </SectionLabel>

        {results.length === 0 ? (
          <div className="rounded-panel border border-dashed border-hair-2 bg-canvas px-4 py-12 text-center">
            <p className="text-body font-bold text-ink-2">Nothing matches those filters</p>
            <p className="mt-0.5 text-label text-ink-4">
              Widen the scope to all templates, or clear a filter.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {results.slice(0, shown).map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  selected={chosen?.id === template.id}
                  cost={templateCost(template, brief, pages)}
                  onPick={() => onSelectTemplate(template)}
                />
              ))}
            </div>

            {results.length > shown && (
              <div className="mt-3 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShown((n) => n + 24)}
                  className="focus-ring cursor-pointer rounded-control border border-hair-2 bg-card px-4 py-2 text-label font-bold text-ink-2 transition hover:border-brand hover:text-brand"
                >
                  Show 24 more · {(results.length - shown).toLocaleString()} left
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="shrink-0 border-t border-hair bg-card px-3 py-2.5 sm:px-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={cn("min-w-0 text-micro", blocked ? "font-bold text-warn" : "text-ink-3")}>
            {blocked
              ? `${chosenCost?.label} — choose a layout that can carry this brief, or shorten the request.`
              : "You can swap a single page’s layout later in the studio — this sets the deck."}
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
    </section>
  );
}

/**
 * A family's cost against this brief, taken from its most capable layout.
 *
 * Its FIRST layout was being used, which happened to be a one-figure variant
 * in every family — so all five cards carried the same "one figure only"
 * warning and the row said nothing. A family's cost is what its best member
 * can do, because that is what choosing the family lets you reach.
 */
function costForFamily(family: TemplateFamily, brief: string, pages: number) {
  const members = TEMPLATE_LIBRARY.filter((t) => t.family === family);
  if (members.length === 0) return null;
  const best = members.reduce((a, b) => (b.statSlots > a.statSlots ? b : a));
  return templateCost(best, brief, pages);
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-caption font-extrabold uppercase tracking-wider text-ink-3">{children}</div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1">
      <span className="mr-0.5 shrink-0 text-micro font-extrabold uppercase tracking-wider text-ink-4">
        {label}
      </span>
      {children}
    </div>
  );
}

function Chip({
  active,
  small,
  onClick,
  children,
}: {
  active: boolean;
  small?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "cursor-pointer rounded-chip border font-bold transition",
        small ? "px-1.5 py-0.5 text-micro" : "px-2.5 py-1 text-label",
        active
          ? "border-brand bg-tint text-brand-deep"
          : "border-hair-2 bg-card text-ink-3 hover:border-hair-3 hover:text-ink"
      )}
    >
      {children}
    </button>
  );
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
      <div style={{ background: archetype.previewBg }} className="mx-3 flex flex-col gap-1 rounded-panel p-3">
        <span className="w-fit rounded-glyph bg-black/25 px-1.5 py-0.5 text-micro font-extrabold uppercase tracking-wider text-white/90">
          {archetype.badge}
        </span>
        <span className="text-display font-[850] leading-tight tracking-tight text-white">
          {archetype.metric}
        </span>
        <span className="text-caption text-white/70">{archetype.metricSub}</span>
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

function TemplateCard({
  template,
  selected,
  cost,
  onPick,
}: {
  template: Template;
  selected: boolean;
  cost: { label: string; severe: boolean } | null;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={selected}
      className={cn(
        "group flex cursor-pointer flex-col gap-2 rounded-panel border bg-card p-2.5 text-left transition",
        selected
          ? "border-brand ring-2 ring-brand/15 shadow-sm"
          : "border-hair shadow-2xs hover:border-brand hover:shadow-xs"
      )}
    >
      {/* A wireframe rather than a fake screenshot: it shows the skeleton the
          layout actually has, which is the thing being chosen. */}
      <div
        style={{ aspectRatio: template.shape === "A4" ? "1 / 1.414" : template.shape.replace(":", " / ") }}
        className="flex w-full flex-col gap-1 overflow-hidden rounded-control border border-hair-2 bg-canvas p-1.5"
      >
        <div className="h-2 w-2/3 shrink-0 rounded-glyph bg-ink/70" />
        <div className="flex min-h-0 flex-1 gap-1">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {Array.from({ length: template.statSlots }).map((_, i) => (
              <div key={i} className="h-2.5 shrink-0 rounded-glyph bg-brand/30" />
            ))}
            <div className="min-h-0 flex-1 rounded-glyph bg-black/[0.06]" />
          </div>
          {template.elements.includes("chart") && (
            <div className="w-1/3 shrink-0 rounded-glyph bg-info-strong/20" />
          )}
          {template.elements.includes("moa-diagram") && (
            <div className="w-1/4 shrink-0 rounded-glyph bg-accent-violet/20" />
          )}
        </div>
        {template.elements.includes("isi") && <div className="h-1.5 shrink-0 rounded-glyph bg-black/10" />}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-body font-bold text-ink group-hover:text-brand">
            {template.name}
          </span>
          {template.approved && (
            <ShieldCheck aria-label="Brand-approved" className="size-3 shrink-0 text-ok" />
          )}
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
          <AlertTriangle className="size-2.5 shrink-0" />
          {cost.label}
        </span>
      ) : (
        <span className="inline-flex w-fit items-center gap-1 rounded-glyph border border-ok-line bg-ok-bg px-1.5 py-0.5 text-micro font-bold text-ok">
          <Check className="size-2.5 shrink-0" />
          Carries this brief
        </span>
      )}
    </button>
  );
}
