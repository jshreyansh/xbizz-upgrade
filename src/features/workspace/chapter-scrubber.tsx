"use client";

import { useState } from "react";

/**
 * The segmented seek bar, one block per chapter.
 *
 * Segments are right for chapters and wrong for shots. A chapter really is a
 * separate block of the film, so a gap between them is true; a shot is a cut
 * inside a continuous take, and the scene scrubber marks those with a line
 * instead. Getting that backwards was what made a scene look like five
 * unrelated clips.
 *
 * Shared by the published review and the editor's full preview, so the two
 * cannot end up seeking differently over the same film.
 */

export interface ScrubberChapter {
  id: string;
  number: number;
  title: string;
  start: number;
  duration: number;
}

export function ChapterScrubber({
  chapters,
  currentTime,
  totalDuration,
  onSeek,
}: {
  chapters: ScrubberChapter[];
  currentTime: number;
  totalDuration: number;
  onSeek: (seconds: number) => void;
}) {
  const [hovered, setHovered] = useState<ScrubberChapter | null>(null);
  const [hoveredAt, setHoveredAt] = useState<number | null>(null);

  return (
    <div className="relative w-full">
      {hovered && (
        <div
          style={{ left: `${((hoveredAt ?? hovered.start) / totalDuration) * 100}%` }}
          className="pointer-events-none absolute -top-10 z-30 -translate-x-1/2 whitespace-nowrap rounded-chip border border-white/20 bg-[#1a2620] px-3 py-1 text-caption font-bold text-white shadow-xl"
        >
          <span>{hoveredAt !== null ? `0:${Math.floor(hoveredAt).toString().padStart(2, "0")}` : ""}</span>
          <span className="mx-1 text-white/40">·</span>
          <span className="text-ok-on-dark">{hovered.title}</span>
        </div>
      )}

      <div className="flex h-4 w-full cursor-pointer items-center gap-1.5 py-1">
        {chapters.map((ch) => {
          const widthPct = (ch.duration / totalDuration) * 100;
          const progress = Math.max(0, Math.min(1, (currentTime - ch.start) / ch.duration));
          const at = (e: React.MouseEvent<HTMLDivElement>) => {
            const rect = e.currentTarget.getBoundingClientRect();
            return +(ch.start + ((e.clientX - rect.left) / rect.width) * ch.duration).toFixed(1);
          };
          return (
            <div
              key={ch.id}
              style={{ width: `${widthPct}%` }}
              onMouseEnter={(e) => { setHovered(ch); setHoveredAt(at(e)); }}
              onMouseMove={(e) => setHoveredAt(at(e))}
              onMouseLeave={() => { setHovered(null); setHoveredAt(null); }}
              onClick={(e) => onSeek(at(e))}
              className="group relative h-2 overflow-hidden rounded-full bg-white/25 transition-all hover:h-2.5"
            >
              <div
                style={{ width: `${progress * 100}%` }}
                className="h-full bg-brand transition-all duration-75"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
