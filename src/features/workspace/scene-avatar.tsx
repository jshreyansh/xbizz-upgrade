"use client";

import { UserRound } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ElementTiming, SceneAvatar } from "@/types/content";
import { elementMotion, motionTransition } from "@/features/workspace/element-motion";

/**
 * The presenter cut-out in a scene.
 *
 * A generated layer like the image, the clip and the chart — so it has a
 * timing entry, a placeholder while it renders, and the same in/out motion
 * everything else has. It is per scene on purpose: a presenter in every shot
 * stops being a presenter and becomes furniture.
 *
 * Shared by the editor and the published video, because a layer drawn twice
 * is eventually drawn differently.
 */

const CORNER_CLASS: Record<SceneAvatar["position"], string> = {
  "top-left": "left-[3%] top-[4%]",
  "top-right": "right-[3%] top-[4%]",
  "bottom-left": "bottom-0 left-[3%]",
  "bottom-right": "bottom-0 right-[3%]",
};

export function SceneAvatarLayer({
  avatar,
  timing,
  currentTime,
  /** Frame height in px: the cut-out is a fraction of the frame, not a fixed size. */
  frameHeight,
  ready,
  secondsLeft,
  selected,
  onSelect,
}: {
  avatar: SceneAvatar;
  timing?: ElementTiming;
  currentTime?: number;
  frameHeight: number;
  /** False while the take is still rendering. */
  ready: boolean;
  secondsLeft?: number;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const motion = elementMotion(timing, currentTime);
  const height = Math.round(frameHeight * avatar.scale);

  return (
    <div
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-busy={!ready}
      aria-label={ready ? `Presenter — ${avatar.name}` : `Presenter generating — ${avatar.name}`}
      onClick={(e) => {
        if (!onSelect) return;
        e.stopPropagation();
        onSelect();
      }}
      style={{
        ...motionTransition(motion.durationMs),
        opacity: motion.opacity,
        transform: motion.transform || "none",
        height,
        width: Math.round(height * 0.62),
      }}
      className={cn(
        "absolute z-[30] flex flex-col items-center justify-end overflow-hidden rounded-t-[999px] border",
        CORNER_CLASS[avatar.position],
        ready
          ? "border-white/15 bg-[linear-gradient(180deg,#2b3550_0%,#151c2b_100%)]"
          : "border-white/12 bg-[#0e1a16]",
        onSelect ? "cursor-pointer" : "pointer-events-none",
        !motion.onScreen && "pointer-events-none",
        selected && "border-brand ring-2 ring-brand/30"
      )}
      aria-hidden={!motion.onScreen}
    >
      {ready ? (
        <>
          {/* A suggestion of a person rather than a fake photograph: enough to
              judge placement and scale, without pretending the take exists. */}
          <span
            aria-hidden
            style={{ width: height * 0.3, height: height * 0.3, marginBottom: height * 0.04 }}
            className="rounded-full bg-[radial-gradient(60%_60%_at_40%_35%,rgba(255,214,190,0.95),rgba(214,163,134,0.85))]"
          />
          <span
            aria-hidden
            style={{ width: height * 0.56, height: height * 0.34 }}
            className="rounded-t-[999px] bg-[linear-gradient(180deg,#e8edf6_0%,#c3ccdd_100%)]"
          />
          <span
            style={{ fontSize: Math.max(7, height * 0.055) }}
            className="absolute bottom-1 left-1/2 max-w-[92%] -translate-x-1/2 truncate rounded-glyph bg-black/55 px-1.5 py-0.5 font-bold leading-none text-white/90"
          >
            {avatar.name.split(" · ")[0]}
          </span>
        </>
      ) : (
        <div className="relative flex h-full w-full flex-col items-center justify-center gap-1 px-1 text-center">
          <span aria-hidden className="shimmer pointer-events-none absolute inset-0" />
          <span className="relative grid size-6 place-items-center rounded-chip border border-white/12 bg-white/8">
            <UserRound className="size-3 text-white/80" />
          </span>
          <span className="dot-cycle relative inline-flex items-baseline text-micro font-bold text-white/60">
            Generating
            <span aria-hidden>.</span>
            <span aria-hidden>.</span>
            <span aria-hidden>.</span>
          </span>
          {secondsLeft !== undefined && (
            <span className="relative text-micro font-bold tabular-nums text-white/70">{secondsLeft}s</span>
          )}
        </div>
      )}
    </div>
  );
}
