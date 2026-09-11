import { ARCHETYPE_CAPACITY, requiredBlocks } from "@/features/workspace/content-plan";

/**
 * The template library.
 *
 * A thousand-odd layouts is not a picking problem, it is a filtering one.
 * Nobody browses a thousand thumbnails, and a grid that asks them to is worse
 * than useless — it hides the five that would have worked. So the library is
 * generated with the attributes a filter needs, and the plan screen's five
 * archetypes remain the shortlist in front of it.
 *
 * Generated rather than hand-written because the attributes are what matter:
 * a real catalogue is families crossed with page shapes, stat densities and
 * the elements a layout carries, and inventing 1,200 names by hand would
 * produce the same grid with worse data behind it.
 */

export type TemplateFamily = "stat-hero" | "trial-summary" | "bench-data" | "moa-scroll" | "burden-disease";

export const FAMILY_LABELS: Record<TemplateFamily, string> = {
  "stat-hero": "Stat Hero",
  "trial-summary": "Trial Summary",
  "bench-data": "Bench Data",
  "moa-scroll": "Anatomy & MoA Scroll",
  "burden-disease": "Burden of Disease",
};

export type TemplateShape = "16:9" | "9:16" | "1:1" | "3:4" | "A4";

export type TemplateElement = "chart" | "packshot" | "table" | "isi" | "moa-diagram" | "photo";

export const ELEMENT_LABELS: Record<TemplateElement, string> = {
  chart: "Chart",
  packshot: "Pack shot",
  table: "Table",
  isi: "ISI block",
  "moa-diagram": "MoA diagram",
  photo: "Photography",
};

export interface Template {
  id: string;
  name: string;
  family: TemplateFamily;
  shape: TemplateShape;
  /** How many oversized figures the layout has room for. */
  statSlots: number;
  elements: TemplateElement[];
  /** Cleared by the brand team. Restricting to these is the point, in pharma. */
  approved: boolean;
  /** How many decks in this workspace used it — the other useful sort. */
  uses: number;
}

/* A small, fixed vocabulary of layout names per family, combined with the
   variant number. Readable, and it means two templates never share a name. */
const VARIANT_NAMES: Record<TemplateFamily, string[]> = {
  "stat-hero": ["Headline Figure", "Split Stat", "Banner Stat", "Quiet Stat", "Stacked Stat", "Corner Stat"],
  "trial-summary": ["Study Card", "Cohort Grid", "Time Course", "Endpoint Ladder", "Arm Compare", "Design Panel"],
  "bench-data": ["Dial Callouts", "Bar Compare", "Threshold Line", "Window Plot", "Metric Strip", "Range Pair"],
  "moa-scroll": ["Cascade Column", "Pathway Band", "Receptor Focus", "Tissue Cutaway", "Step Scroll", "Cell Detail"],
  "burden-disease": ["Prevalence Curve", "Unmet Need", "Population Bar", "Journey Strip", "Cohort Map", "Flare Timeline"],
};

/**
 * Not every family carries every shape or density, and that is the whole
 * reason the catalogue is smaller than the cross product. A cascade scroll is
 * not an A4 poster; a bench comparison needs at least two figures to compare.
 * Encoding that is what makes the filters discriminate — a cross product of
 * everything would say four thousand templates and mean nothing.
 */
const FAMILY_SUPPORT: Record<
  TemplateFamily,
  { shapes: TemplateShape[]; density: number[]; sets: TemplateElement[][] }
> = {
  "stat-hero": {
    shapes: ["16:9", "1:1", "3:4", "A4"],
    density: [1, 2, 3, 4],
    sets: [["chart"], ["chart", "isi"], ["chart", "packshot"], ["chart", "packshot", "isi"]],
  },
  "trial-summary": {
    shapes: ["16:9", "3:4", "A4"],
    density: [1, 2, 3],
    sets: [["chart", "table"], ["chart", "table", "isi"], ["chart", "isi"], ["table", "isi"]],
  },
  "bench-data": {
    shapes: ["16:9", "1:1", "A4"],
    density: [2, 3, 4],
    sets: [["chart", "table"], ["chart", "table", "isi"], ["table"], ["chart", "isi"]],
  },
  "moa-scroll": {
    shapes: ["9:16", "3:4", "16:9"],
    density: [1, 2],
    sets: [["moa-diagram"], ["moa-diagram", "chart"], ["moa-diagram", "photo"], ["moa-diagram", "chart", "isi"]],
  },
  "burden-disease": {
    shapes: ["16:9", "9:16", "1:1", "3:4"],
    density: [1, 2, 3],
    sets: [["chart"], ["chart", "photo"], ["chart", "table"], ["chart", "photo", "isi"]],
  },
};

/**
 * The catalogue. Deterministic, so a template's id means the same layout on
 * every render and a link to one does not rot.
 */
export const TEMPLATE_LIBRARY: Template[] = (() => {
  const out: Template[] = [];
  const families = Object.keys(FAMILY_LABELS) as TemplateFamily[];

  for (const family of families) {
    const names = VARIANT_NAMES[family];
    const support = FAMILY_SUPPORT[family];
    for (let variant = 0; variant < names.length; variant++) {
      for (const shape of support.shapes) {
        for (const density of support.density) {
          for (let setIndex = 0; setIndex < support.sets.length; setIndex++) {
            const seed = variant * 97 + density * 31 + setIndex * 13 + shape.length;
            out.push({
              id: `${family}-${variant}-${shape.replace(":", "x")}-${density}-${setIndex}`,
              name: `${names[variant]} ${density > 1 ? `${density}-up` : "Solo"}`,
              family,
              shape,
              statSlots: density,
              elements: support.sets[setIndex],
              // Roughly two in three cleared, which is what a brand library
              // actually looks like partway through a cycle.
              approved: seed % 3 !== 0,
              uses: (seed * 7) % 40,
            });
          }
        }
      }
    }
  }
  return out;
})();

export interface TemplateFilters {
  /** Only templates that can carry this brief's copy. */
  matchesBrief: boolean;
  family: TemplateFamily | "all";
  shape: TemplateShape | "all";
  /** 0 means any. */
  statSlots: number;
  contains: TemplateElement[];
  approvedOnly: boolean;
  search: string;
}

export const DEFAULT_TEMPLATE_FILTERS: TemplateFilters = {
  matchesBrief: true,
  family: "all",
  shape: "all",
  statSlots: 0,
  contains: [],
  approvedOnly: true,
  search: "",
};

/**
 * What a template costs this brief, or null when it carries it cleanly.
 *
 * Named rather than hidden: a layout that trims two bullets is often the right
 * choice, and filtering it out silently loses it over one bullet. The cost
 * goes on the card so the decision stays with the person making it.
 */
export function templateCost(
  template: Template,
  brief: string,
  pages: number
): { label: string; severe: boolean } | null {
  const needs = requiredBlocks(brief);
  const capacity = ARCHETYPE_CAPACITY[template.family];
  if (!capacity) return null;

  if (needs.longform > 0 && !template.elements.includes("isi")) {
    return { label: "No block for full safety text", severe: true };
  }
  const bodyRoom = capacity.bodyBlocks * pages;
  if (needs.body > bodyRoom) {
    return { label: `Trims ${needs.body - bodyRoom} subject${needs.body - bodyRoom === 1 ? "" : "s"}`, severe: true };
  }
  if (needs.body > template.statSlots && template.statSlots < 2) {
    return { label: "One figure only — the rest become body copy", severe: false };
  }
  return null;
}

/** Fit first, then what the team actually reaches for. */
export function rankTemplates(
  templates: Template[],
  brief: string,
  pages: number
): Template[] {
  return [...templates].sort((a, b) => {
    const ca = templateCost(a, brief, pages);
    const cb = templateCost(b, brief, pages);
    const sa = ca ? (ca.severe ? 2 : 1) : 0;
    const sb = cb ? (cb.severe ? 2 : 1) : 0;
    if (sa !== sb) return sa - sb;
    if (a.approved !== b.approved) return a.approved ? -1 : 1;
    return b.uses - a.uses;
  });
}

export function filterTemplates(
  filters: TemplateFilters,
  brief: string,
  pages: number,
  /** The project's page shape. A layout for another shape does not match. */
  shape?: TemplateShape
): Template[] {
  const query = filters.search.trim().toLowerCase();

  const kept = TEMPLATE_LIBRARY.filter((template) => {
    if (filters.approvedOnly && !template.approved) return false;
    if (filters.family !== "all" && template.family !== filters.family) return false;
    if (filters.shape !== "all" && template.shape !== filters.shape) return false;
    if (filters.statSlots > 0 && template.statSlots !== filters.statSlots) return false;
    if (filters.contains.some((element) => !template.elements.includes(element))) return false;
    if (query && !`${template.name} ${FAMILY_LABELS[template.family]}`.toLowerCase().includes(query)) return false;
    // "Matches this brief" hides only what cannot carry the copy at all; a
    // template that merely costs something stays, with the cost on its face.
    if (filters.matchesBrief) {
      if (shape && template.shape !== shape) return false;
      const cost = templateCost(template, brief, pages);
      if (cost?.severe) return false;
    }
    return true;
  });

  return rankTemplates(kept, brief, pages);
}

/** How many of the whole catalogue could carry this brief at all. */
export function matchingCount(brief: string, pages: number, shape?: TemplateShape): number {
  return TEMPLATE_LIBRARY.filter(
    (t) => (!shape || t.shape === shape) && !templateCost(t, brief, pages)?.severe
  ).length;
}
