"use client";

import { useEffect, useRef } from "react";
import { LogoMark } from "@/components/ui/logo-mark";
import { cn } from "@/lib/cn";
import type { Shot } from "@/types/content";

/**
 * A scene's background before it is rendered: two keyframes per shot.
 *
 * Rendering footage is the slowest and most expensive thing in a scene, and
 * the hardest to undo once it exists. So it is not rendered on arrival. Its
 * keyframes are, and they carry the scene.
 *
 * Per shot, not per scene. A scene is several shots and they are not one
 * picture — the copy lands, the pathway scales in, the frame clears — so two
 * frames for the whole scene would say nothing about four of them. Each shot
 * gets its opening and closing frame, each holding half of that shot, so
 * scrubbing walks the real beats rather than one long dissolve.
 *
 * The frames are the clip's own, taken at the times those beats occupy: two
 * video elements on the same source, parked and re-parked as the playhead
 * crosses shots. Nothing is invented, and the preview cannot disagree with
 * what eventually renders.
 */
export function BackgroundKeyframes({
  src,
  duration,
  currentTime,
  shots,
  className,
}: {
  src: string;
  /** Scene length in seconds. */
  duration: number;
  /** Scene playhead in seconds. */
  currentTime: number;
  /** The scene's beats. Without them the scene is treated as one shot. */
  shots?: Shot[];
  className?: string;
}) {
  const headRef = useRef<HTMLVideoElement>(null);
  const tailRef = useRef<HTMLVideoElement>(null);

  const beats: Shot[] =
    shots && shots.length > 0
      ? shots
      : ([{ id: "whole", index: 1, startAt: 0, endAt: duration || 10, label: "" }] as Shot[]);

  const active =
    beats.find((shot) => currentTime >= shot.startAt && currentTime < shot.endAt) ??
    beats[beats.length - 1];
  const showTail = currentTime >= (active.startAt + active.endAt) / 2;

  /**
   * Park each element on the frame its beat starts and ends at.
   *
   * The scene's seconds are the clip's seconds, so a shot running 2.0s to
   * 4.5s of a ten second scene is that stretch of the clip. Re-parked when
   * the playhead crosses into another shot, which is what makes this a walk
   * through the beats rather than one still.
   */
  useEffect(() => {
    const park = (node: HTMLVideoElement | null, at: number) => {
      if (!node) return;
      const seek = () => {
        const clip = node.duration || 0;
        if (!Number.isFinite(clip) || clip <= 0) return;
        /* Scene time mapped onto the clip, so a clip shorter than the scene
           still shows a frame from the right part of it. */
        const scaled = duration > 0 ? (at / duration) * clip : at;
        node.currentTime = Math.min(Math.max(0.1, scaled), Math.max(0.1, clip - 0.05));
      };
      if (node.readyState >= 1) seek();
      else node.addEventListener("loadedmetadata", seek, { once: true });
    };
    park(headRef.current, active.startAt);
    park(tailRef.current, active.endAt);
  }, [src, duration, active.startAt, active.endAt]);

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <video
        ref={headRef}
        src={src}
        muted
        playsInline
        preload="metadata"
        className={cn(
          "absolute inset-0 size-full object-cover transition-opacity duration-500",
          showTail ? "opacity-0" : "opacity-100"
        )}
      />
      <video
        ref={tailRef}
        src={src}
        muted
        playsInline
        preload="metadata"
        className={cn(
          "absolute inset-0 size-full object-cover transition-opacity duration-500",
          showTail ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Said plainly, so a still is never mistaken for the finished shot. */}
      <span className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-chip border border-white/15 bg-black/65 px-2 py-1 text-caption font-bold text-white backdrop-blur-xs">
        <LogoMark size={11} className="text-brand" />
        {beats.length > 1 ? `Shot ${active.index} · ` : ""}
        {showTail ? "closing frame" : "opening frame"}
      </span>
    </div>
  );
}
