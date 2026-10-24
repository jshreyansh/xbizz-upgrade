"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Scene } from "@/types/content";
import type { AdType } from "@/features/workspace/ad-options";
import { ChapterScrubber } from "@/features/workspace/chapter-scrubber";
import { AdVideoFrame, Scaled, VIDEO_SIZE, type FrameEditing, type LogoCorner, type VideoShape } from "@/features/workspace/ad-frames";

/**
 * Every ad in the campaign, the way Preview and Publish shows it: All ads as
 * tiles, and any one of them opened large, in the same window, with a way back.
 *
 * The studio builds the tiles and the opened views, because it holds the
 * words, the edits and the templates; this only lays them out. The opened
 * view is the ad as it will run: the video plays scene after scene, the
 * carousel and the document page through, the image ad shows every size.
 */

export interface GalleryItem {
  key: string;
  label: string;
  sub: string;
  /** The tile's picture, already scaled. */
  thumb: ReactNode;
  /** The ad opened large. */
  full: ReactNode;
}

export interface GalleryGroup {
  title: string;
  items: GalleryItem[];
}

export function AdsPreviewGallery({ groups, dark = false }: { groups: GalleryGroup[]; dark?: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  const all = groups.flatMap((g) => g.items);
  const current = all.find((i) => i.key === open);

  if (current) {
    const at = all.indexOf(current);
    return (
      <div className="flex h-full min-h-0 flex-col">
        <div className={cn("flex h-11 shrink-0 items-center gap-2 border-b px-3", dark ? "border-white/10 text-white" : "border-hair bg-card")}>
          <button
            type="button"
            onClick={() => setOpen(null)}
            className={cn(
              "focus-ring inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-glyph px-2 py-1 text-caption font-bold transition",
              dark ? "text-white/80 hover:bg-white/10" : "text-ink-2 hover:bg-subtle"
            )}
          >
            <ArrowLeft className="size-3.5" />
            All ads
          </button>
          <span className="min-w-0 truncate text-label font-bold">{current.label}</span>
          <span className="truncate text-caption text-ink-4">{current.sub}</span>
          <span className="ml-auto shrink-0 text-caption tabular-nums text-ink-4">
            {at + 1} of {all.length}
          </span>
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-5">{current.full}</div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 space-y-5 overflow-y-auto p-5">
      {groups.map((group) => (
        <section key={group.title} className="space-y-2">
          <h3 className="text-micro font-bold uppercase tracking-[0.12em] text-ink-3">{group.title}</h3>
          <div className="flex flex-wrap items-end gap-3">
            {group.items.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setOpen(item.key)}
                className="group flex cursor-pointer flex-col items-start gap-1.5 text-left"
              >
                <span className="block overflow-hidden rounded-control border border-hair bg-card shadow-2xs transition group-hover:border-brand group-hover:shadow-soft">
                  {item.thumb}
                </span>
                <span className="text-caption font-bold text-ink">{item.label}</span>
                <span className="-mt-1.5 text-micro text-ink-3">{item.sub}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/** Pages or cards, one at a time with arrows, as people swipe them. */
export function GalleryPager({ pages, label, width }: { pages: ReactNode[]; label: (i: number) => string; width: number }) {
  const [at, setAt] = useState(0);
  const step = (n: number) => setAt((i) => (i + n + pages.length) % pages.length);
  const arrow = (dir: -1 | 1) => (
    <button
      type="button"
      aria-label={dir < 0 ? "Previous" : "Next"}
      onClick={() => step(dir)}
      className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full border border-hair-2 bg-card text-ink-2 shadow-2xs transition hover:border-brand hover:text-brand"
    >
      {dir < 0 ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
    </button>
  );
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-4">
        {arrow(-1)}
        <div className="overflow-hidden rounded-chip shadow-float" style={{ width }}>
          {pages[at]}
        </div>
        {arrow(1)}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex gap-1.5">
          {pages.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={label(i)}
              onClick={() => setAt(i)}
              className={cn("size-2 cursor-pointer rounded-full", i === at ? "bg-brand" : "bg-hair-3")}
            />
          ))}
        </div>
        <span className="text-caption font-bold text-ink-3">{label(at)}</span>
      </div>
    </div>
  );
}

/** The video story played through, scene after scene, with its chapters. */
export function GalleryFilm({
  story,
  shapes,
  brandName,
  adType,
  logoCorner,
  edit,
  width,
}: {
  story: Scene[];
  shapes: VideoShape[];
  brandName: string;
  adType: AdType;
  logoCorner: Partial<Record<VideoShape, LogoCorner>>;
  edit: (shape: VideoShape) => FrameEditing;
  width: number;
}) {
  const [shape, setShape] = useState<VideoShape>(shapes[0] ?? "16:9");
  const chapters = story.reduce<Array<{ id: string; number: number; title: string; start: number; duration: number }>>(
    (list, sc) => [...list, { id: sc.id, number: sc.number, title: sc.title, start: list.reduce((t, c) => t + c.duration, 0), duration: sc.duration }],
    []
  );
  const length = chapters.reduce((t, c) => t + c.duration, 0);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const running = playing && time < length;
  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      setTime((t) => Math.min(+(t + (now - last) / 1000).toFixed(2), length));
      last = now;
    }, 100);
    return () => window.clearInterval(timer);
  }, [running, length]);
  const chapter = [...chapters].reverse().find((c) => time >= c.start) ?? chapters[0];
  const scene = story.find((sc) => sc.id === chapter?.id) ?? story[0];
  if (!scene) return null;
  const { w, h } = VIDEO_SIZE[shape];
  /* Tall and square frames at the same height as a wide one would be. */
  const shown = shape === "16:9" ? width : Math.round((width * 9) / 16 * (w / h));

  return (
    <div className="flex flex-col items-center gap-3">
      {shapes.length > 1 && (
        <div className="flex gap-1 rounded-full border border-hair-2 bg-card p-0.5">
          {shapes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setShape(s)}
              className={cn("cursor-pointer rounded-full px-2.5 py-0.5 text-caption font-bold transition", s === shape ? "bg-ink text-white" : "text-ink-3 hover:text-ink")}
            >
              {s}
            </button>
          ))}
        </div>
      )}
      <div className="relative overflow-hidden rounded-card bg-black shadow-float" style={{ width: shown }}>
        <Scaled w={w} h={h} width={shown}>
          <AdVideoFrame
            scene={scene}
            shape={shape}
            time={Math.max(0, time - (chapter?.start ?? 0))}
            playing={running}
            brandName={brandName}
            adType={adType}
            logoCorner={logoCorner[shape]}
            prefix={`preview:${scene.id}`}
            edit={edit(shape)}
          />
        </Scaled>
      </div>
      <div className="w-full max-w-[560px] space-y-2 rounded-control bg-ink p-3 text-white">
        <ChapterScrubber chapters={chapters} currentTime={time} totalDuration={length} onSeek={setTime} />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (time >= length) setTime(0);
              setPlaying(!running);
            }}
            aria-label={running ? "Pause" : "Play"}
            className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full bg-brand text-white transition hover:bg-brand-deep"
          >
            {running ? <Pause className="size-3.5 fill-current" /> : <Play className="ml-0.5 size-3.5 fill-current" />}
          </button>
          <span className="font-mono text-label font-bold tabular-nums text-white/90">
            0:{Math.floor(time).toString().padStart(2, "0")} / 0:{length}s
          </span>
          <span className="truncate text-caption font-semibold text-white/70">
            {chapter?.number}. {chapter?.title}
          </span>
        </div>
      </div>
    </div>
  );
}
