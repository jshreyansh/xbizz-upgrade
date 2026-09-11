/**
 * Whether a block's copy fits the box it has.
 *
 * The image flow's version of "is this too long". A video that overruns is a
 * video that overruns; a page whose safety block overruns is a page that clips
 * it, and there is no reading of a clipped Important Safety Information block
 * that is acceptable. So length is a status on every block, visible while the
 * copy is being written rather than discovered at render.
 *
 * Capacities are characters, which is a proxy — but a stable one at a fixed
 * type scale, and a proxy that is checked is worth more than a measurement
 * that happens after the asset is built.
 */

export type CopyBlockKind =
  | "eyebrow"
  | "headline"
  | "subhead"
  | "reference"
  | "stat-label"
  | "metric"
  | "comparator"
  | "body"
  | "section-title"
  | "safety";

/** What each kind's box holds before it starts pushing its neighbours. */
export const COPY_CAPACITY: Record<CopyBlockKind, number> = {
  eyebrow: 34,
  headline: 62,
  subhead: 96,
  reference: 30,
  "stat-label": 44,
  metric: 18,
  comparator: 34,
  body: 220,
  "section-title": 52,
  safety: 340,
};

export type FitState = "fits" | "tight" | "overflows";

export interface CopyFit {
  /** Fraction of the box used, 0–1+ so a caller can draw it. */
  used: number;
  state: FitState;
  /** Characters past the box. Zero unless it overflows. */
  overBy: number;
  capacity: number;
  /** For the chip: "Fits", "Tight", "12 characters over". */
  label: string;
}

/**
 * "Tight" exists because the useful warning is the one that arrives before
 * the copy is broken. A block at 95% survives this render and breaks the
 * moment a word is added, which is worth saying out loud.
 */
export function copyFit(text: string, kind: CopyBlockKind): CopyFit {
  const capacity = COPY_CAPACITY[kind];
  const length = text.trim().length;
  const used = length / capacity;
  const overBy = Math.max(0, length - capacity);

  const state: FitState = overBy > 0 ? "overflows" : used >= 0.9 ? "tight" : "fits";
  const label =
    state === "overflows"
      ? `${overBy} character${overBy === 1 ? "" : "s"} over`
      : state === "tight"
        ? "Tight"
        : "Fits";

  return { used, state, overBy, capacity, label };
}

/** The deck cannot be built while anything overflows — see the note above. */
export function deckFits(blocks: { text: string; kind: CopyBlockKind }[]): boolean {
  return blocks.every((b) => copyFit(b.text, b.kind).state !== "overflows");
}
