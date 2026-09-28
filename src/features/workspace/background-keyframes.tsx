"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { LogoMark } from "@/components/ui/logo-mark";
import type { Shot } from "@/types/content";

/**
 * A shot's footage while it generates.
 *
 * The shot was approved on the storyboard as a still, so that still holds
 * its place here: the clip's own frame at the middle of the shot, dimmed,
 * with a sweep across it and "Generating…" on top. There is nothing to
 * press. Generating the video renders every shot on its own, and each one
 * swaps in for its still the moment it lands.
 *
 * The frame is the clip's, taken at the time the shot occupies, so what
 * holds the place cannot disagree with the footage that replaces it.
 */
export function ShotGeneratingFrame({
  src,
  duration,
  currentTime,
  shots,
  label = "center",
  className,
}: {
  src: string;
  /** Scene length in seconds. */
  duration: number;
  /** Scene playhead in seconds. */
  currentTime: number;
  /** The scene's beats. Without them the scene is treated as one shot. */
  shots?: Shot[];
  /**
   * Where "Generating…" sits. Centred inside a clip's own box; in a corner
   * when this is the whole frame, so it does not land under the headline.
   */
  label?: "center" | "corner";
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
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <video
        ref={ref}
        src={src}
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 size-full object-cover"
      />
      {/* Dimmed, so the still reads as waiting rather than as the result. */}
      <div className="absolute inset-0 bg-[#06100d]/45" />
      {/* The sweep is what says "working": a still that does not move reads
          as done, or as stuck. */}
      <div className="shimmer-strong absolute inset-0" />
      <div
        className={cn(
          "absolute",
          label === "center" ? "inset-0 grid place-items-center" : "right-4 top-4"
        )}
      >
        {/* In the brand's colour: this is SwishX at work, and a grey chip on
            dark footage read as a caption rather than as a status. */}
        <span
          role="status"
          className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-label font-extrabold text-white shadow-brand-lift"
        >
          <LogoMark size={12} className="animate-spin text-white" />
          Generating
          <span className="inline-flex items-end gap-0.5 pb-0.5" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-1 rounded-full bg-white/90"
                style={{ animation: `typing-bounce 1.1s ease-in-out ${i * 0.16}s infinite` }}
              />
            ))}
          </span>
        </span>
      </div>
    </div>
  );
}
