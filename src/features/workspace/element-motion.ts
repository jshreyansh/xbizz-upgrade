import type { CSSProperties } from "react";
import type { ElementTiming } from "@/types/content";

/**
 * Motion for a transition, derived from the words it is written in.
 *
 * The transition is authored as a human string ("Wipe from right 420ms")
 * because that is what the strip and the placeholder display. Keyword matching
 * turns it into motion. If transitions ever become user-editable this wants
 * inverting — a structured field with the label derived from it.
 */
function motionFor(transition: string | undefined): { ms: number; hidden: CSSProperties } {
  const text = (transition ?? "").toLowerCase();
  const ms = Number(text.match(/(\d+)\s*ms/)?.[1] ?? 320);
  if (text.includes("cut")) return { ms: 0, hidden: { opacity: 0 } };
  if (text.includes("wipe from right")) return { ms, hidden: { opacity: 0, transform: "translateX(14%)" } };
  if (text.includes("wipe")) return { ms, hidden: { opacity: 0, transform: "translateX(-14%)" } };
  if (text.includes("scale up")) return { ms, hidden: { opacity: 0, transform: "scale(0.94)" } };
  if (text.includes("push in")) return { ms, hidden: { opacity: 0, transform: "scale(1.06)" } };
  if (text.includes("fade up")) return { ms, hidden: { opacity: 0, transform: "translateY(10px)" } };
  // Cross dissolve, fade, and anything unrecognised.
  return { ms, hidden: { opacity: 0 } };
}

export interface ElementMotion {
  onScreen: boolean;
  opacity: number;
  /** The motion transform ONLY, so a caller can compose it with its own. */
  transform: string;
  durationMs: number;
}

/**
 * Whether an element is in frame at this instant, and the motion carrying it
 * in or out.
 *
 * Shared by the generating placeholder and the real asset ON PURPOSE. They are
 * two renderings of one slot, and when only the placeholder honoured the
 * timing, the placeholder advertised a transition the arriving asset then
 * ignored — image and video simply sat in frame start to end. The placeholder
 * is supposed to show the actual transition, so the asset has to land in
 * exactly the window the placeholder drew.
 *
 * Entering uses transitionIn and leaving uses transitionOut: running an
 * entrance backwards is not an exit.
 */
export function elementMotion(
  timing: ElementTiming | undefined,
  currentTime: number | undefined
): ElementMotion {
  // No playhead or no declared timing means nothing to honour.
  if (currentTime === undefined || !timing) {
    return { onScreen: true, opacity: 1, transform: "", durationMs: 0 };
  }

  const onScreen = currentTime >= timing.inAt && currentTime <= timing.outAt;
  const leaving = currentTime > timing.outAt;
  const motion = motionFor(leaving ? timing.transitionOut ?? timing.transitionIn : timing.transitionIn);

  return {
    onScreen,
    opacity: onScreen ? 1 : Number(motion.hidden.opacity ?? 0),
    transform: onScreen ? "" : String(motion.hidden.transform ?? ""),
    durationMs: motion.ms,
  };
}

/** The transition shorthand every timed slot shares. */
export function motionTransition(durationMs: number): CSSProperties {
  return {
    transitionProperty: "opacity, transform",
    transitionDuration: `${durationMs}ms`,
    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
  };
}
