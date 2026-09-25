"use client";

import { LogoMark } from "@/components/ui/logo-mark";
import type { SceneAsset } from "@/features/workspace/scene-generation";

/**
 * What this scene is still making, across the top of the canvas.
 *
 * The same strip the creative editor puts over a page, for the same reason:
 * one line that says which phase the work is in, how much of it has landed,
 * and that the frame underneath is safe to work on. It replaced a scatter of
 * per-element chips — a voiceover pill here, a sound-effects pill there —
 * which reported the same work in pieces and left the question "how far along
 * is this scene" to be assembled by eye.
 *
 * Scoped to the scene on screen, not the film. The film's progress is not
 * something you can act on; this scene's is.
 */
export function SceneProgressStrip({
  assets,
  elapsed,
}: {
  assets: SceneAsset[];
  /** Milliseconds since generation began. */
  elapsed: number;
}) {
  const landed = assets.filter((asset) => elapsed >= asset.readyAt);
  const running = assets.find((asset) => elapsed < asset.readyAt);
  const last = assets[assets.length - 1];
  const done = !running;
  const percent = last ? Math.min(100, Math.round((elapsed / last.readyAt) * 100)) : 100;
  const secondsLeft = running ? Math.max(1, Math.ceil((running.readyAt - elapsed) / 1000)) : 0;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-tint-line bg-tint px-3 py-1.5 sm:px-4">
      <span className="inline-flex shrink-0 items-center gap-1.5 text-label font-bold text-brand-deep">
        <LogoMark size={12} className="animate-spin text-brand" />
        {/* The one thing being made right now, named. This is where the
            voice-over and sound-effect chips went. */}
        {done ? "Finishing the scene" : `Rendering ${running.label.toLowerCase()}`}
      </span>

      <span className="text-label tabular-nums text-ink-2">
        {landed.length} of {assets.length} ready
      </span>

      {!done && (
        <span className="text-label tabular-nums text-ink-3">{secondsLeft}s</span>
      )}

      <div className="h-1.5 min-w-[90px] flex-1 overflow-hidden rounded-full bg-card/70">
        <div
          style={{ width: `${percent}%` }}
          className="h-full rounded-full bg-brand transition-[width] duration-200"
        />
      </div>

      <span className="shrink-0 text-label font-semibold text-ink-3">
        Keep editing. The boxes are already final
      </span>
    </div>
  );
}
