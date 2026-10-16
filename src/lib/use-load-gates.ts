"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * When it is worth fetching something heavy.
 *
 * The home page had eleven <video> requests in flight before it was even
 * interactive — including ones inside a layout hidden on desktop — and every
 * click to another page waited behind them: a 2 KB route file took eleven
 * seconds on the deployed site. Media now waits for two things: the element
 * being near the screen (a hidden element never is), and the page having
 * finished loading what a click needs.
 */

/** True once the element has come within `margin` of the viewport. Never true while it is hidden. */
export function useNearViewport(ref: RefObject<Element | null>, margin = "200px") {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: margin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin, near]);
  return near;
}

/** True once the page has loaded and the browser has a quiet moment. */
export function usePageSettled() {
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    let idle = 0;
    let timer = 0;
    const settle = () => {
      const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
      if (w.requestIdleCallback) idle = w.requestIdleCallback(() => setSettled(true), { timeout: 1500 });
      else timer = window.setTimeout(() => setSettled(true), 300);
    };
    if (document.readyState === "complete") settle();
    else window.addEventListener("load", settle, { once: true });
    return () => {
      window.removeEventListener("load", settle);
      const w = window as Window & { cancelIdleCallback?: (id: number) => void };
      if (idle && w.cancelIdleCallback) w.cancelIdleCallback(idle);
      if (timer) window.clearTimeout(timer);
    };
  }, []);
  return settled;
}

/** A first frame to show without downloading the clip: the browser fetches only enough to paint 0.1s. */
export const firstFrame = (src: string) => `${src}#t=0.1`;
