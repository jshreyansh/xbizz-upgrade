"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Pause, Play, Repeat, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Scene } from "@/types/content";

/**
 * The voice-over, end to end, before anything is rendered.
 *
 * The storyboard is read scene by scene; the film is heard in one go. This
 * plays the whole narration as one track — a waveform to scrub, the usual
 * transport — with the transcript beside it following word by word, so the
 * marketer hears how the script runs across scenes, not just how each line
 * reads. Clicking a word or a scene in the transcript moves the playhead
 * there. Each scene speaks inside its own voice-over window, so the gaps in
 * the waveform are the real pauses between scenes.
 */

interface Word {
  text: string;
  start: number;
  end: number;
  scene: number;
}

interface SceneSpan {
  id: string;
  number: number;
  title: string;
  start: number;
  end: number;
  words: number[];
}

const BARS = 96;

/** Where every word falls on the one timeline, by the scenes' own lengths. */
function buildTimeline(scenes: Scene[]) {
  const words: Word[] = [];
  const spans: SceneSpan[] = [];
  let at = 0;
  scenes.forEach((scene, sceneIndex) => {
    const length = scene.duration || 8;
    const vo = scene.timings?.find((t) => t.elementId === "voiceover");
    const from = at + (vo?.inAt ?? 0.4);
    const to = at + Math.min(length, vo?.outAt ?? length - 0.4);
    const tokens = (scene.narration ?? "").split(/\s+/).filter(Boolean);
    /* Longer words take longer to say, and punctuation is a breath. */
    const weight = (w: string) => w.length + 3 + (/[,;:]$/.test(w) ? 4 : /[.!?]$/.test(w) ? 6 : 0);
    const total = tokens.reduce((sum, w) => sum + weight(w), 0) || 1;
    let t = from;
    const indices: number[] = [];
    for (const token of tokens) {
      const d = ((to - from) * weight(token)) / total;
      indices.push(words.length);
      words.push({ text: token, start: t, end: t + d * 0.86, scene: sceneIndex });
      t += d;
    }
    spans.push({ id: scene.id, number: scene.number, title: scene.title, start: at, end: at + length, words: indices });
    at += length;
  });
  return { words, spans, total: at };
}

/**
 * A steady-looking waveform: loud where a word is spoken, near-flat between,
 * and silent for a beat where one scene hands over to the next — so the
 * scenes read as separate stretches of the one track.
 */
function buildBars(words: Word[], spans: SceneSpan[], total: number) {
  const noise = (i: number) => {
    const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  const bar = total / BARS;
  return Array.from({ length: BARS }, (_, i) => {
    const t = ((i + 0.5) / BARS) * total;
    if (spans.slice(1).some((s) => Math.abs(t - s.start) < bar * 1.1)) return 0;
    const speaking = words.some((w) => t >= w.start - 0.05 && t <= w.end + 0.05);
    return speaking ? 0.3 + noise(i) * 0.7 : 0.06 + noise(i) * 0.08;
  });
}

const clock = (s: number) => {
  const whole = Math.max(0, Math.floor(s));
  return `${String(Math.floor(whole / 60)).padStart(2, "0")}:${String(whole % 60).padStart(2, "0")}`;
};

export function NarrationPlayer({ scenes, voice }: { scenes: Scene[]; voice: string }) {
  const { words, spans, total } = useMemo(() => buildTimeline(scenes), [scenes]);
  const bars = useMemo(() => buildBars(words, spans, total), [words, spans, total]);

  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const loopRef = useRef(loop);
  const timeRef = useRef(time);

  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);
  useEffect(() => {
    timeRef.current = time;
  }, [time]);

  /* The clock. It runs only while playing, and stops at the end unless looping. */
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const nextT = timeRef.current + (now - last) / 1000;
      last = now;
      if (nextT >= total && !loopRef.current) {
        timeRef.current = total;
        setTime(total);
        setPlaying(false);
        return;
      }
      timeRef.current = nextT >= total ? 0 : nextT;
      setTime(timeRef.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, total]);

  const at = Math.min(time, total);
  const current = words.findIndex((w) => at >= w.start && at < w.end + 0.12);
  const lastSpoken = words.reduce((idx, w, i) => (w.start <= at ? i : idx), -1);
  const sceneIndex = Math.max(0, spans.findIndex((s) => at >= s.start && at < s.end));
  const activeScene = at >= total ? spans.length - 1 : sceneIndex;

  /* Keep the word being said in view — inside the transcript, never the page. */
  useEffect(() => {
    const box = transcriptRef.current;
    const word = box?.querySelector<HTMLElement>(`[data-word="${lastSpoken}"]`);
    if (!box || !word) return;
    const top = word.offsetTop - box.clientHeight / 3;
    if (Math.abs(box.scrollTop - top) > box.clientHeight / 4) box.scrollTo({ top, behavior: "smooth" });
  }, [lastSpoken]);

  const seek = (t: number) => setTime(Math.max(0, Math.min(total, t)));

  const togglePlay = () => {
    if (!playing && at >= total) setTime(0);
    setPlaying((p) => !p);
  };

  /* Back restarts the scene; pressed again near its start, it goes to the one before. */
  const previous = () => {
    const span = spans[activeScene];
    if (!span) return;
    seek(at - span.start > 1.5 || activeScene === 0 ? span.start : spans[activeScene - 1].start);
  };
  const next = () => {
    const span = spans[activeScene + 1];
    if (span) seek(span.start);
  };

  const scrubFrom = (e: ReactPointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    seek(((e.clientX - rect.left) / rect.width) * total);
  };

  if (words.length === 0) return null;

  const progress = total > 0 ? at / total : 0;
  const [voiceName, voiceStyle] = voice.split("·").map((s) => s.trim());

  return (
    <section aria-label="Full narration" className="@container pb-5">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pb-2.5">
        <h3 className="text-subhead font-[850] tracking-tight text-ink">Full narration</h3>
        <span className="text-label text-ink-3">
          {voiceName}
          {voiceStyle ? ` · ${voiceStyle}` : ""} · {spans.length} scenes · {clock(total)}
        </span>
      </div>

      <div className="grid gap-3 @2xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* The player. */}
        <div className="flex flex-col justify-center gap-3 rounded-panel border border-tint-line bg-tint px-4 py-3.5">
          <div className="flex items-center gap-3">
            <span className="w-8 text-caption font-bold tabular-nums text-ink-2">{clock(at)}</span>
            <div
              role="slider"
              tabIndex={0}
              aria-label="Narration position"
              aria-valuemin={0}
              aria-valuemax={Math.round(total)}
              aria-valuenow={Math.round(at)}
              aria-valuetext={`${clock(at)} of ${clock(total)}`}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                scrubFrom(e);
              }}
              onPointerMove={(e) => {
                if (e.currentTarget.hasPointerCapture(e.pointerId)) scrubFrom(e);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") seek(at + 1);
                else if (e.key === "ArrowLeft") seek(at - 1);
                else if (e.key === " ") togglePlay();
                else return;
                e.preventDefault();
              }}
              className="focus-ring group relative flex h-12 min-w-0 flex-1 cursor-pointer touch-none select-none items-center gap-px rounded-control"
            >
              <span aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-ink/30" />
              {bars.map((h, i) => (
                <span
                  key={i}
                  className={cn("min-w-0 flex-1 rounded-full", (i + 0.5) / BARS <= progress ? "bg-ink" : "bg-ink/20")}
                  style={{ height: `${Math.round(h * 100)}%` }}
                />
              ))}
              {/* Each scene, numbered where it starts, in the gap before it; a click goes there. */}
              {spans.map((s, si) => (
                <button
                  key={s.id}
                  type="button"
                  tabIndex={-1}
                  title={`Scene ${s.number} · ${s.title}`}
                  aria-label={`Go to scene ${s.number}`}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => seek(s.start)}
                  className={cn(
                    "absolute top-1/2 z-[1] grid size-3.5 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full font-extrabold leading-none tabular-nums text-white ring-2 ring-tint transition-[transform,background-color] hover:scale-125",
                    si === activeScene ? "bg-brand" : "bg-ink-2"
                  )}
                  style={{ left: `${(s.start / total) * 100}%`, fontSize: 8 }}
                >
                  {s.number}
                </button>
              ))}
              <span
                aria-hidden
                className="pointer-events-none absolute top-1/2 z-[2] size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-ink shadow-sm transition-transform group-active:scale-125"
                style={{ left: `${progress * 100}%` }}
              />
            </div>
            <span className="w-8 text-right text-caption font-bold tabular-nums text-ink-3">{clock(total)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-pressed={loop}
              aria-label="Loop"
              title={loop ? "Looping" : "Loop"}
              onClick={() => setLoop((l) => !l)}
              className={cn(
                "focus-ring grid size-8 cursor-pointer place-items-center rounded-full transition-colors",
                loop ? "bg-ink text-white" : "text-ink-2 hover:bg-ink/5"
              )}
            >
              <Repeat className="size-4" />
            </button>
            <span className="min-w-0 flex-1 truncate text-caption font-semibold text-ink-3">
              Scene {spans[activeScene]?.number} · {spans[activeScene]?.title}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Previous scene"
                title="Previous scene"
                onClick={previous}
                className="focus-ring grid size-8 cursor-pointer place-items-center rounded-full text-ink transition-colors hover:bg-ink/5"
              >
                <SkipBack className="size-4 fill-current" />
              </button>
              <button
                type="button"
                aria-label={playing ? "Pause" : "Play narration"}
                onClick={togglePlay}
                className="focus-ring grid size-10 cursor-pointer place-items-center rounded-full bg-ink text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
              >
                {playing ? <Pause className="size-4 fill-current" /> : <Play className="ml-0.5 size-4 fill-current" />}
              </button>
              <button
                type="button"
                aria-label="Next scene"
                title="Next scene"
                onClick={next}
                disabled={activeScene >= spans.length - 1}
                className="focus-ring grid size-8 cursor-pointer place-items-center rounded-full text-ink transition-colors hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <SkipForward className="size-4 fill-current" />
              </button>
            </div>

            <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
              <button
                type="button"
                aria-label={muted ? "Unmute" : "Mute"}
                onClick={() => setMuted((m) => !m)}
                className="focus-ring grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-ink-2 transition-colors hover:bg-ink/5"
              >
                {muted || volume === 0 ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                  setMuted(false);
                }}
                aria-label="Volume"
                className="h-1 w-16 min-w-0 cursor-pointer accent-ink"
              />
            </div>
          </div>
        </div>

        {/* The transcript, following along. */}
        {/* Beside the player it takes the player's height and scrolls; stacked, a fixed one. */}
        <div className="relative h-36 overflow-hidden rounded-panel border border-hair bg-card @2xl:h-auto">
          <div ref={transcriptRef} className="absolute inset-0 space-y-2.5 overflow-y-auto px-4 py-3">
            {spans.map((span, si) => (
              <div key={span.id}>
                <button
                  type="button"
                  onClick={() => seek(span.start)}
                  className={cn(
                    "mb-0.5 flex cursor-pointer items-center gap-1.5 text-caption font-extrabold uppercase tracking-[.08em] transition-colors hover:text-brand-deep",
                    si === activeScene ? "text-brand-deep" : "text-ink-4"
                  )}
                >
                  Scene {span.number}
                  <span className="font-semibold normal-case tracking-normal tabular-nums">{clock(span.start)}</span>
                </button>
                <p className="text-body-lg leading-relaxed">
                  {span.words.map((wi) => {
                    const w = words[wi];
                    return (
                      <span key={wi}>
                        <span
                          data-word={wi}
                          onClick={() => seek(w.start)}
                          className={cn(
                            "cursor-pointer rounded-[3px] transition-colors duration-150 hover:text-brand-deep",
                            wi === current
                              ? "bg-tint-strong text-brand-deep"
                              : w.start <= at
                              ? "text-ink"
                              : "text-ink-4"
                          )}
                        >
                          {w.text}
                        </span>{" "}
                      </span>
                    );
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
