"use client";

import { Mic2 } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Scene } from "@/types/content";

/**
 * Which word the voiceover is on, from the playhead.
 *
 * Shared by the strip burned into the frame and the panel under the player, so
 * the two can never highlight different words — they are one reading of one
 * track, shown at two sizes.
 */
function wordStateAt(scene: Scene, currentTime: number) {
  const words = (scene.narration || "").trim().split(/\s+/).filter(Boolean);
  const duration = scene.duration || 10;
  // Speech starts a beat after the cut and finishes before it.
  const progress = Math.max(0, Math.min(1, (currentTime - 0.2) / Math.max(0.1, duration - 0.8)));
  const currentIndex = Math.min(words.length - 1, Math.floor(progress * words.length));
  return { words, currentIndex };
}

/**
 * The subtitle as it is actually burned in: one short line at the foot of the
 * frame.
 *
 * Real subtitles are a strip, not a panel — a block holding the whole
 * paragraph mid-frame is a script being displayed, not a video being
 * subtitled. So the frame carries a window of a few words around the one
 * being spoken, and the full track lives under the player where there is room
 * for it.
 */
export function SubtitleStrip({
  scene,
  currentTime,
  style,
  className,
}: {
  scene: Scene;
  currentTime: number;
  style?: React.CSSProperties;
  className?: string;
}) {
  const { words, currentIndex } = wordStateAt(scene, currentTime);
  if (words.length === 0) return null;

  // A caption's worth: the phrase around the current word, not the paragraph.
  const start = Math.max(0, Math.min(currentIndex - 4, words.length - 9));
  const window = words.slice(start, start + 9);

  return (
    <div style={style} className={cn("pointer-events-auto max-w-[78%]", className)}>
      <p className="rounded-control bg-black/55 px-2.5 py-1 text-center text-body font-medium leading-snug text-white backdrop-blur-sm">
        {window.map((word, index) => {
          const absolute = start + index;
          return (
            <span
              key={`${word}-${absolute}`}
              className={cn(
                "mr-1 inline-block transition-colors duration-150",
                absolute === currentIndex ? "font-bold text-brand-light" : "text-white/85"
              )}
            >
              {word}
            </span>
          );
        })}
      </p>
    </div>
  );
}

/**
 * The full voiceover track, under the player.
 *
 * It sits below the frame because it describes what is playing rather than
 * being part of the picture — the same reason a transcript sits beside a
 * video and not on top of it.
 */
export function SubtitleSyncPanel({
  scene,
  currentTime,
  playing,
  onSelect,
  selected = false,
}: {
  scene: Scene;
  currentTime: number;
  playing: boolean;
  onSelect?: () => void;
  selected?: boolean;
}) {
  const { words, currentIndex } = wordStateAt(scene, currentTime);

  return (
    <div
      onClick={onSelect}
      className={cn(
        "w-full rounded-panel border bg-card p-3 transition-colors",
        onSelect && "cursor-pointer",
        selected ? "border-brand ring-2 ring-brand/15" : "border-hair hover:border-hair-3"
      )}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-glyph border border-brand/20 bg-tint px-1.5 py-0.5 text-micro font-extrabold uppercase tracking-wider text-brand-deep">
          <Mic2 className="size-2.5" /> Subtitle · Voiceover Sync
        </span>
        {playing ? (
          <span className="flex items-center gap-1 font-mono text-micro text-ok">
            <span className="size-1.5 animate-pulse rounded-full bg-ok" />
            Live track
          </span>
        ) : (
          <span className="font-mono text-micro text-ink-4">
            {currentIndex + 1} / {words.length} words
          </span>
        )}
      </div>

      <p className="text-body-lg leading-relaxed text-ink">
        {words.map((word, index) => (
          <span
            key={`${word}-${index}`}
            className={cn(
              "mr-1 inline-block rounded-glyph px-0.5 transition-all duration-150",
              index === currentIndex
                ? "-translate-y-0.5 bg-tint font-bold text-brand-deep ring-2 ring-brand/15"
                : index < currentIndex
                ? "font-medium text-ink"
                : "text-ink-4"
            )}
          >
            {word}
          </span>
        ))}
      </p>
    </div>
  );
}
