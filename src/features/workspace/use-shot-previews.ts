"use client";

import { useCallback, useEffect, useState } from "react";

/** Per shot: still being drawn, or on the board. */
export type ShotPreviewStatus = "drawing" | "ready";

/**
 * The storyboard's shot previews, and when each one is ready.
 *
 * They arrive one at a time rather than all at once. A board that paints
 * eighteen frames in one go reads as a repaint; one that fills in shot by
 * shot reads as work being done, and lets the first scenes be read while
 * the last ones are still being drawn.
 *
 * A redraw is the same wait for fewer shots — the ones a chat instruction
 * touched — and marks them so the change can be found on a long board.
 *
 * Timers are scheduled from the effect and settle in their callbacks, never
 * synchronously in the effect body, so the arrival is a subscription to a
 * clock rather than state being set during render.
 */
export function useShotPreviews(shotIds: string[]) {
  const [ready, setReady] = useState<Record<string, true>>({});
  const [drawing, setDrawing] = useState<Record<string, true>>({});
  const [updated, setUpdated] = useState<Record<string, true>>({});
  const [versions, setVersions] = useState<Record<string, number>>({});

  const idsKey = shotIds.join("|");

  useEffect(() => {
    const list = idsKey ? idsKey.split("|") : [];
    const timers = list.map((id, i) =>
      window.setTimeout(() => {
        setReady((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
      }, 350 + i * 150)
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [idsKey]);

  /** Redraw these shots. The rest of the board is left alone. */
  const redraw = useCallback((ids: string[], onDone?: () => void) => {
    if (ids.length === 0) return;
    setDrawing((prev) => {
      const next = { ...prev };
      ids.forEach((id) => { next[id] = true; });
      return next;
    });
    ids.forEach((id, j) => {
      window.setTimeout(() => {
        setDrawing((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        setReady((prev) => ({ ...prev, [id]: true }));
        setUpdated((prev) => ({ ...prev, [id]: true }));
        setVersions((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
      }, 1100 + j * 110);
    });
    if (onDone) window.setTimeout(onDone, 1300 + ids.length * 110);
  }, []);

  const statusOf = (id: string): ShotPreviewStatus => (ready[id] && !drawing[id] ? "ready" : "drawing");
  const readyCount = shotIds.filter((id) => statusOf(id) === "ready").length;
  const drawingCount = shotIds.filter((id) => drawing[id]).length;

  return {
    statusOf,
    isUpdated: (id: string) => !!updated[id],
    versionOf: (id: string) => versions[id] ?? 0,
    readyCount,
    drawingCount,
    total: shotIds.length,
    allReady: shotIds.length > 0 && readyCount === shotIds.length,
    redraw,
  };
}

export type ShotPreviews = ReturnType<typeof useShotPreviews>;
