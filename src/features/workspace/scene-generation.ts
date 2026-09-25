import type { Scene } from "@/types/content";
import { ELEMENT_LABELS } from "@/features/workspace/asset-comments";

/**
 * What a scene is still making, and when each piece lands.
 *
 * The canvas editor can say "3 of 5 layers placed" because every layer knows
 * its own readyAt. The video editor only knew a per-scene phase — 0, 1, 2 —
 * which cannot produce a count, a rolling label or a countdown. Those three
 * are the whole difference between the two editors' progress reporting, so
 * the video gets the same footing: a scene's generating assets, derived from
 * the timings it already declares, each with a moment it arrives.
 *
 * Derived rather than stored. The timings are the source of truth for what is
 * in a scene, and a second list would drift from them the first time a scene
 * gained an element.
 */
export interface SceneAsset {
  elementId: string;
  label: string;
  /** Milliseconds from the start of generation when this asset lands. */
  readyAt: number;
}

/**
 * Elements that are not generated.
 *
 * The brand mark is approved artwork that already exists; the background
 * plate is drawn by the composition. Counting them would report progress on
 * work nobody is doing.
 */
const NOT_GENERATED = new Set(["logo", "background", "tag", "claim"]);

/** The order the strip narrates them in: what you notice missing, first. */
const NARRATION_ORDER = [
  "bg-video",
  "video-clip",
  "image",
  "avatar",
  "moa",
  "graph",
  "headline",
  "narration",
  "voiceover",
  "sfx",
  "music",
];

function rank(elementId: string): number {
  const at = NARRATION_ORDER.indexOf(elementId);
  return at === -1 ? NARRATION_ORDER.length : at;
}

/**
 * The scene's generating assets, spread across its media window.
 *
 * `from` and `to` are the scene's own slice of the generation schedule, so a
 * scene late in the film reports against the moment its own work happens
 * rather than the film's.
 */
export function sceneAssets(scene: Scene, from: number, to: number): SceneAsset[] {
  const declared = (scene.timings ?? [])
    .map((timing) => timing.elementId)
    .filter((id) => !NOT_GENERATED.has(id));

  /* Background music is a project decision rather than a scene element, so it
     is not in any scene's timings — but it is being made while you wait, and
     a strip that does not mention it is describing half the work. It lands
     with the first scene, because there is one track for the film. */
  const ids = scene.number === 1 ? [...declared, "music"] : declared;
  const unique = [...new Set(ids)].sort((a, b) => rank(a) - rank(b));

  const step = unique.length > 1 ? (to - from) / (unique.length - 1) : 0;
  return unique.map((elementId, index) => ({
    elementId,
    label: elementId === "music" ? "Background music" : ELEMENT_LABELS[elementId] ?? elementId,
    readyAt: Math.round(from + index * step),
  }));
}

/** Everything a shot needs rendered. One entry per shot, or one for the scene. */
export function shotIdsOf(scene: Scene): string[] {
  if (scene.backgroundKind !== "video") return [];
  const shots = scene.shots ?? [];
  return shots.length > 0 ? shots.map((shot) => shot.id) : [`${scene.id}-whole`];
}
