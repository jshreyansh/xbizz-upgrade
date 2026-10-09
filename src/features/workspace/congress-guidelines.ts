"use client";

import { create } from "zustand";

/**
 * Congress poster guidelines.
 *
 * A congress decides most of a poster before anyone opens the editor: its
 * size and orientation, how big the type must be, whether a brand name may
 * appear at all, what must be disclosed. So a poster starts by choosing the
 * congress, and its format and page count follow from that choice.
 *
 * The list belongs to the workspace, not the project: a congress one person
 * adds is there for the next person to pick. In the prototype that is a store
 * that outlives a project reset; nothing is persisted.
 */

export type RuleSource =
  /** Read from the uploaded guidelines, on this page. */
  | { kind: "doc"; page: number }
  /** Typed in by the person who added the congress. */
  | { kind: "you" }
  /** Not stated anywhere we read, so the common convention stands in. */
  | { kind: "default" };

export type RuleId = "size" | "orientation" | "type" | "branding" | "disclosures" | "layout";

export interface CongressRule {
  id: RuleId;
  label: string;
  value: string;
  source: RuleSource;
}

export interface PosterFormat {
  id: "print" | "eposter";
  label: string;
  detail: string;
  /** The page the editor builds: portrait posters on the A-series shape. */
  shape: "A4" | "16:9";
}

export interface Congress {
  id: string;
  name: string;
  year: string;
  /** What a congress accepts. Two only when it takes both. */
  formats: PosterFormat[];
  rules: CongressRule[];
}

export const RULE_LABELS: Record<RuleId, string> = {
  size: "Size",
  orientation: "Orientation",
  type: "Type sizes",
  branding: "Branding",
  disclosures: "Disclosures",
  layout: "Layout",
};

/** The common convention, for anything a congress's guidelines do not say. */
const DEFAULT_RULES: Record<RuleId, string> = {
  size: "A0 · 841 × 1189 mm",
  orientation: "Landscape",
  type: "Title 72–100 pt · headings 36–60 pt · body 24 pt or more · legends 14–28 pt · sans-serif, sentence case",
  branding: "No brand names or company logos; academic and hospital logos only, small and at the bottom",
  disclosures: "Author conflicts of interest on the poster; QR codes to educational content only, with a personal-use disclaimer",
  layout: "Title and authors → Background → Methods → Results → Conclusion · about 40% figures, 20% text, 40% space · light background",
};

const print = (detail: string, shape: PosterFormat["shape"]): PosterFormat => ({
  id: "print",
  label: "Printed poster",
  detail,
  shape,
});
const EPOSTER: PosterFormat = { id: "eposter", label: "ePoster", detail: "16:9 · single-page PDF", shape: "16:9" };

const rule = (id: RuleId, value: string, source: RuleSource): CongressRule => ({
  id,
  label: RULE_LABELS[id],
  value,
  source,
});

/** Sample congresses. Specs are illustrative until confirmed against each congress's own guidelines. */
const SEEDED: Congress[] = [
  {
    id: "asco-2026",
    name: "ASCO Annual Meeting",
    year: "2026",
    formats: [print("Landscape · 48 × 36 in", "16:9")],
    rules: [
      rule("size", "48 × 36 in", { kind: "doc", page: 2 }),
      rule("orientation", "Landscape", { kind: "doc", page: 2 }),
      rule("type", DEFAULT_RULES.type, { kind: "default" }),
      rule("branding", "No commercial logos, company names or brand drug names", { kind: "doc", page: 3 }),
      rule("disclosures", DEFAULT_RULES.disclosures, { kind: "doc", page: 4 }),
      rule("layout", DEFAULT_RULES.layout, { kind: "default" }),
    ],
  },
  {
    id: "esmo-bc-2025",
    name: "ESMO Breast Cancer",
    year: "2025",
    formats: [print("Portrait · A0 841 × 1189 mm", "A4")],
    rules: [
      rule("size", "A0 · 841 × 1189 mm", { kind: "doc", page: 1 }),
      rule("orientation", "Portrait", { kind: "doc", page: 1 }),
      rule("type", DEFAULT_RULES.type, { kind: "default" }),
      rule("branding", "No brand names or company logos", { kind: "doc", page: 2 }),
      rule("disclosures", "Author conflicts of interest on the poster", { kind: "doc", page: 2 }),
      rule("layout", DEFAULT_RULES.layout, { kind: "default" }),
    ],
  },
  {
    id: "esmo-2024",
    name: "ESMO Congress",
    year: "2024",
    formats: [print("Landscape · A0 1189 × 841 mm", "16:9"), EPOSTER],
    rules: [
      rule("size", "A0 printed, or 16:9 ePoster", { kind: "doc", page: 2 }),
      rule("orientation", "Landscape", { kind: "doc", page: 2 }),
      rule("type", DEFAULT_RULES.type, { kind: "default" }),
      rule("branding", "No brand names or company logos", { kind: "doc", page: 3 }),
      rule("disclosures", DEFAULT_RULES.disclosures, { kind: "default" }),
      rule("layout", DEFAULT_RULES.layout, { kind: "default" }),
    ],
  },
  {
    id: "ispor-2026",
    name: "ISPOR",
    year: "2026",
    formats: [print("Landscape · 42 × 36 in", "16:9")],
    rules: [
      rule("size", "42 × 36 in", { kind: "doc", page: 1 }),
      rule("orientation", "Landscape", { kind: "doc", page: 1 }),
      rule("type", DEFAULT_RULES.type, { kind: "default" }),
      rule("branding", DEFAULT_RULES.branding, { kind: "default" }),
      rule("disclosures", "Author conflicts of interest, linked online or printed", { kind: "doc", page: 3 }),
      rule("layout", DEFAULT_RULES.layout, { kind: "default" }),
    ],
  },
];

/** The two shown before anyone types; the rest are found by search. */
export const SUGGESTED_CONGRESS_IDS = ["asco-2026", "esmo-bc-2025"];
/** How many more the full catalogue holds — the "+80" tile. */
export const MORE_CONGRESSES = 80;

interface CongressStore {
  congresses: Congress[];
  /** Add a congress, or replace one with edited rules. */
  saveCongress: (congress: Congress) => void;
}

export const useCongressStore = create<CongressStore>((set) => ({
  congresses: SEEDED,
  saveCongress: (congress) =>
    set((state) => ({
      congresses: state.congresses.some((c) => c.id === congress.id)
        ? state.congresses.map((c) => (c.id === congress.id ? congress : c))
        : [congress, ...state.congresses],
    })),
}));

export function congressLabel(congress: Pick<Congress, "name" | "year">) {
  return congress.year ? `${congress.name} · ${congress.year}` : congress.name;
}

export function searchCongresses(list: Congress[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return list.filter((c) => `${c.name} ${c.year}`.toLowerCase().includes(q));
}

export function ruleOf(congress: Congress, id: RuleId) {
  return congress.rules.find((r) => r.id === id)?.value ?? DEFAULT_RULES[id];
}

/**
 * Read a congress's rules from what was given: a guidelines file, and/or
 * what the person typed. The prototype has no parser, so a file stands for a
 * full set of rules read from it, and typed text is matched for the things
 * people know offhand — orientation, size, ePoster, type size, branding.
 * Anything not found falls back to the convention and says so.
 */
export function readCongressGuidelines(input: { name: string; fileName?: string; notes: string }): Congress {
  const notes = input.notes.trim();
  const lower = notes.toLowerCase();
  const fromFile = (page: number): RuleSource => ({ kind: "doc", page });
  const said = (re: RegExp) => re.test(lower);

  const orientation = said(/portrait/) ? "Portrait" : said(/landscape/) ? "Landscape" : null;
  const sizeMatch = notes.match(/\b(a0|a1)\b|\b(\d{2,3})\s*[x×]\s*(\d{2,3})\s*(in|inch|inches|cm|mm)?\b/i);
  const size = sizeMatch
    ? sizeMatch[1]
      ? sizeMatch[1].toUpperCase() === "A0"
        ? "A0 · 841 × 1189 mm"
        : "A1 · 594 × 841 mm"
      : `${sizeMatch[2]} × ${sizeMatch[3]} ${sizeMatch[4] ? sizeMatch[4].replace(/inch(es)?/, "in") : "in"}`
    : null;
  const ptMatch = notes.match(/(\d{2})\s*pt/i);
  const noBrand = said(/no (product|brand|company|commercial)|without (brand|logo)|no logos?/);
  const eposter = said(/e-?poster|16:9|screen/);

  const pick = (id: RuleId, typed: string | null, page: number): CongressRule =>
    typed
      ? rule(id, typed, { kind: "you" })
      : input.fileName
        ? rule(id, DEFAULT_RULES[id], fromFile(page))
        : rule(id, DEFAULT_RULES[id], { kind: "default" });

  const rules: CongressRule[] = [
    pick("size", size, 2),
    pick("orientation", orientation, 2),
    pick("type", ptMatch ? `Body text ${ptMatch[1]} pt or more · ${DEFAULT_RULES.type.split(" · ").slice(0, 2).join(" · ")}` : null, 3),
    pick("branding", noBrand ? "No brand names or company logos" : null, 4),
    /* Disclosures and layout are rarely known offhand; a file may state them. */
    input.fileName ? rule("disclosures", DEFAULT_RULES.disclosures, fromFile(5)) : rule("disclosures", DEFAULT_RULES.disclosures, { kind: "default" }),
    rule("layout", DEFAULT_RULES.layout, { kind: "default" }),
  ];

  const finalOrientation = orientation ?? "Landscape";
  const printDetail = `${finalOrientation} · ${size ?? DEFAULT_RULES.size}`;
  const formats: PosterFormat[] = [print(printDetail, finalOrientation === "Portrait" ? "A4" : "16:9")];
  if (eposter) formats.push(EPOSTER);

  const yearMatch = input.name.match(/\b(20\d{2})\b/);
  const name = input.name.replace(/\s*·?\s*\b20\d{2}\b\s*/, " ").trim() || input.name.trim();
  return {
    id: `custom-${Date.now()}`,
    name,
    year: yearMatch?.[1] ?? "",
    formats,
    rules,
  };
}
