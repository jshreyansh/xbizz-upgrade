"use client";

import { useEffect, useRef } from "react";
import { LogoMark } from "@/components/ui/logo-mark";
import { cn } from "@/lib/cn";
import type { Shot } from "@/types/content";

/**
 * A shot's background while its footage renders.
 *
 * The shot was approved as a still on the storyboard, so that is what holds
 * its place here: the clip's own frame at the middle of the shot, and a
 * label saying the motion is on its way. There is nothing to press. Shots
 * render on their own once the video is generated, and each one swaps in
 * as it lands.
 *
 * The frame is the clip's, taken at the time the shot occupies, so the
 * placeholder cannot disagree with the footage that replaces it.
 */
export function ShotRenderingFrame({
  src,
  duration,
  currentTime,
  shots,
  rendering,
  className,
}: {
  src: string;
  /** Scene length in seconds. */
  duration: number;
  /** Scene playhead in seconds. */
  currentTime: number;
  /** The scene's beats. Without them the scene is treated as one shot. */
  shots?: Shot[];
  /** Rendering now, rather than still queued behind other shots. */
  rendering: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  const beats: Shot[] =
    shots && shots.length > 0
      ? shots
      : ([{ id: "whole", index: 1, startAt: 0, endAt: duration || 10, label: "" }] as Shot[]);

  const active =
    beats.find((shot) => currentTime >= shot.startAt && currentTime < shot.endAt) ??
    beats[beats.length - 1];
  const middle = (active.startAt + active.endAt) / 2;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const seek = () => {
      const clip = node.duration || 0;
      if (!Number.isFinite(clip) || clip <= 0) return;
      /* Scene time mapped onto the clip, so a clip shorter than the scene
         still shows a frame from the right part of it. */
      const scaled = duration > 0 ? (middle / duration) * clip : middle;
      node.currentTime = Math.min(Math.max(0.1, scaled), Math.max(0.1, clip - 0.05));
    };
    if (node.readyState >= 1) seek();
    else node.addEventListener("loadedmetadata", seek, { once: true });
  }, [src, duration, middle]);

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <video
        ref={ref}
        src={src}
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 size-full object-cover"
      />

      {/* Said plainly, so a still is never mistaken for the finished shot. */}
      <span className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-chip border border-white/15 bg-black/65 px-2 py-1 text-caption font-bold text-white backdrop-blur-xs">
        <LogoMark size={11} className={cn("text-brand", rendering && "animate-spin")} />
        {beats.length > 1 ? `Shot ${active.index} · ` : ""}
        {rendering ? "rendering" : "queued to render"}
      </span>
    </div>
  );
}
