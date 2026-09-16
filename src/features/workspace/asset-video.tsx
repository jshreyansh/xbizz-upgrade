"use client";

import { useRef } from "react";

/**
 * A video tile that shows a real frame and plays when you point at it.
 *
 * Six autoplaying clips on one screen is a lot of decoder for a page whose
 * job is to let you pick one. A painted still tells the tiles apart just as
 * well, and the clip runs for the one you are actually looking at.
 */
export function AssetVideo({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  // The hover lives on a wrapper, not on the video: anything painted over the
  // frame is still part of this tile as far as a pointer is concerned.
  return (
    <span
      className={className ?? "absolute inset-0"}
      onMouseEnter={() => void ref.current?.play().catch(() => {})}
      onMouseLeave={() => ref.current?.pause()}
    >
      <video
        ref={ref}
        src={src}
        loop
        muted
        playsInline
        preload="auto"
        // Nudged off zero so a frame is decoded and painted: a video parked at
        // 0 with no poster renders as an empty box in some browsers.
        onLoadedData={(e) => {
          if (e.currentTarget.currentTime === 0) e.currentTarget.currentTime = 0.1;
        }}
        className="pointer-events-none h-full w-full object-cover opacity-85"
      />
    </span>
  );
}
