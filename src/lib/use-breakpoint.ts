"use client";

import { useEffect, useState } from "react";

/**
 * Breakpoints for layout *presentation* decisions — which shape a region
 * takes, not how it is styled. Styling stays in Tailwind's own sm/md/lg.
 *
 * Named for what the device actually is, because the layout decisions are
 * about that rather than about abstract sizes:
 *
 *   desktop   >= 1280   three columns, right panel open
 *   laptop    1024-1279 three columns, right panel closed by default
 *   tablet     768-1023 panels become overlays, not columns
 *   compact     < 768   review only (mobile tier, later)
 */
export type Layout = "compact" | "tablet" | "laptop" | "desktop";

export const LAYOUT_MIN = { compact: 0, tablet: 768, laptop: 1024, desktop: 1280 } as const;

function resolve(width: number): Layout {
  if (width >= LAYOUT_MIN.desktop) return "desktop";
  if (width >= LAYOUT_MIN.laptop) return "laptop";
  if (width >= LAYOUT_MIN.tablet) return "tablet";
  return "compact";
}

/**
 * Returns null until measured, so a caller can render the desktop shape on
 * the server and swap after mount rather than guessing and flashing.
 */
export function useLayout(): Layout | null {
  const [layout, setLayout] = useState<Layout | null>(null);

  useEffect(() => {
    const read = () => setLayout(resolve(window.innerWidth));
    const raf = requestAnimationFrame(read);
    window.addEventListener("resize", read);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", read);
    };
  }, []);

  return layout;
}

/** True when the viewport is at or above the given layout's minimum. */
export function atLeast(layout: Layout | null, min: Layout) {
  if (!layout) return true; // assume desktop until measured
  return LAYOUT_MIN[layout] >= LAYOUT_MIN[min];
}
