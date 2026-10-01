"use client";

import { useEffect, useRef } from "react";
import { Film, ImageIcon, Layers, MessageSquarePlus, Video } from "lucide-react";
import { LogoMark } from "@/components/ui/logo-mark";
import { cn } from "@/lib/cn";
import type { Scene, Shot } from "@/types/content";

/**
 * One frame of a clip, parked.
 *
 * A shot is a stretch of footage, and the only honest small picture of it is
 * a frame from that stretch. Parked rather than played: five cards playing in
 * a panel is five decoders showing motion nobody asked to watch.
 */
function FrameThumb({
  src,
  at,
  duration,
  label,
  image,
}: {
  src?: string;
  /** Scene time to park on. */
  at: number;
  /** Scene length, so scene seconds map onto clip seconds. */
  duration: number;
  label: string;
  /** A still instead of a clip. */
  image?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const seek = () => {
      const clip = node.duration || 0;
      if (!Number.isFinite(clip) || clip <= 0) return;
      const scaled = duration > 0 ? (at / duration) * clip : at;
      node.currentTime = Math.min(Math.max(0.1, scaled), Math.max(0.1, clip - 0.05));
    };
    if (node.readyState >= 1) seek();
    else node.addEventListener("loadedmetadata", seek, { once: true });
  }, [src, at, duration]);

  return (
    <span className="min-w-0 flex-1">
      <span className="relative block aspect-video w-full overflow-hidden rounded-glyph border border-hair bg-[#16231f]">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={label} className="size-full object-cover" />
        ) : src ? (
          <video ref={ref} src={src} muted playsInline preload="metadata" className="size-full object-cover" />
        ) : null}
      </span>
      <span className="mt-0.5 block truncate text-micro font-bold uppercase tracking-wide text-ink-4">
        {label}
      </span>
    </span>
  );
}

/**
 * Which media layers are attached to a shot.
 *
 * DERIVED from the scene's element timings, never stored on the shot. A
 * hand-maintained list would drift from the timings the canvas actually
 * animates, and then the card would confidently describe a shot nobody is
 * watching. A layer belongs to a shot when its own window overlaps the shot's.
 */
function mediaInShot(scene: Scene, shot: Shot) {
  const kindOf = (elementId: string) =>
    elementId === "video-clip" ? "video" : elementId === "image" ? "image" : null;

  return (scene.timings ?? [])
    .filter((timing) => kindOf(timing.elementId))
    .filter((timing) => timing.inAt < shot.endAt && timing.outAt > shot.startAt)
    .map((timing) => ({
      kind: kindOf(timing.elementId) as "image" | "video",
      elementId: timing.elementId,
      label: scene.mediaLabel || "Scene media",
      inAt: timing.inAt,
      outAt: timing.outAt,
    }));
}

/**
 * The shots of the selected scene, inside the Edit tab.
 *
 * Shots are not a step of their own — they are the structure of one scene, so
 * they live where that scene is edited and as grouping in its timeline, and
 * nowhere else.
 */
export function ShotCards({
  scene,
  currentTime,
  highlightedShotId,
  onScrub,
  onAddToChat,
  onReplaceMedia,
  shotState,
}: {
  scene: Scene;
  currentTime: number;
  /** The shot the scrubber last landed on — brought into view and marked. */
  highlightedShotId?: string | null;
  onScrub: (seconds: number) => void;
  /** Hand this shot to the agent to change. */
  onAddToChat: (shot: Shot) => void;
  onReplaceMedia: (shot: Shot, elementId: string, kind: "image" | "video") => void;
  /** Where one shot's footage has got to. Shots render on their own. */
  shotState?: (shotId: string) => "keyframes" | "generating" | "ready";
}) {
  const shots = scene.shots ?? [];

  /* Arriving from the scrubber, the shot you clicked may be below the fold of
     a long panel — so it is scrolled to rather than merely coloured. */
  const highlightRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (highlightedShotId) {
      highlightRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [highlightedShotId]);

  if (shots.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-label font-bold text-ink-2">
          <Film className="size-3.5 text-brand" />
          <span>Shots</span>
        </label>
        <span className="text-caption font-normal text-ink-4 tabular-nums">
          {shots.length} in this scene
        </span>
      </div>

      {shots.map((shot) => {
        const media = mediaInShot(scene, shot);
        const active = currentTime >= shot.startAt && currentTime < shot.endAt;

        const state = shotState?.(shot.id) ?? "ready";
        const rendered = state === "ready";
        const rendering = state === "generating";
        const hasFootage = scene.backgroundKind === "video" && Boolean(scene.bgVideoSrc);

        /* Shots render on their own once the video is generated; there is
           nothing to press. The card says where this one has got to. */
        const status = rendered ? null : (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-glyph bg-tint px-2 py-0.5 text-micro font-bold text-brand-deep">
            {rendering && <LogoMark size={9} className="animate-spin" />}
            {rendering ? "Rendering" : "Queued"}
          </span>
        );

        return (
          <div
            key={shot.id}
            ref={shot.id === highlightedShotId ? highlightRef : undefined}
            className={cn(
              "rounded-panel border p-3 transition-colors",
              shot.id === highlightedShotId
                ? "border-brand bg-tint ring-2 ring-brand/20"
                : active
                ? "border-brand/30 bg-tint"
                : "border-hair bg-canvas"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <button
                type="button"
                onClick={() => onScrub(shot.startAt)}
                className="flex items-baseline gap-2 text-left cursor-pointer group"
                title="Jump the playhead to this shot"
              >
                <span className="text-body-lg font-[850] text-ink group-hover:text-brand">
                  Shot {shot.index}
                </span>
                <span className="text-caption tabular-nums text-ink-4">
                  {shot.startAt.toFixed(1)}s – {shot.endAt.toFixed(1)}s
                </span>
              </button>

              {/* Editing a shot goes through the agent rather than a form:
                  what changes across a shot is motion and staging, which is
                  described, not typed into fields. */}
              <button
                type="button"
                onClick={() => onAddToChat(shot)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-control bg-brand px-2.5 py-1 text-caption font-bold text-white transition-colors hover:bg-brand-deep cursor-pointer"
              >
                <MessageSquarePlus className="size-3" />
                <span>Add in chat to edit</span>
              </button>
            </div>

            {shot.narrationFragment ? (
              <p className="mt-2 text-body-lg font-bold leading-snug text-ink">
                &ldquo;{shot.narrationFragment}&rdquo;
              </p>
            ) : (
              <p className="mt-2 text-body italic text-ink-4">No narration in this shot</p>
            )}

            <div className="mt-2">
              <span className="text-caption font-bold text-ink-3">Visual Story</span>
              <p className="mt-0.5 text-body italic leading-relaxed text-ink-2">{shot.visualStory}</p>
            </div>

            <div className="mt-2.5 rounded-control border border-hair bg-card p-2.5">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-caption font-bold text-ink-2">
                  <Layers className="size-3 text-brand" />
                  <span>Attached Scene Media</span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  <span className="rounded-glyph bg-tint px-2 py-0.5 text-micro font-bold text-brand-deep">
                    {media.length} Media {media.length === 1 ? "Layer" : "Layers"}
                  </span>
                  {!hasFootage && status}
                </span>
              </div>

              {/* The shot's own frame, off the scene's footage — the picture
                  approved on the storyboard, until its render replaces it. */}
              {hasFootage && (
                <div className="mb-2">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-micro font-bold uppercase tracking-wide text-ink-4">Footage</span>
                    {status}
                  </div>
                  <FrameThumb
                    src={scene.bgVideoSrc}
                    at={(shot.startAt + shot.endAt) / 2}
                    duration={scene.duration || 10}
                    label={rendered ? "Rendered" : rendering ? "Rendering…" : "Storyboard frame"}
                  />
                </div>
              )}

              {media.length === 0 ? (
                <p className="text-caption italic text-ink-4">
                  No media in this shot. The frame is copy over the footage.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {media.map((layer) => {
                    const Icon = layer.kind === "video" ? Video : ImageIcon;
                    const clipSrc = scene.mediaVideoSrc;
                    const stillSrc = scene.mediaImageSrc;
                    /* A clip still rendering shows its storyboard frame and
                       says so. A still is a still: it is there, so it is shown. */
                    const pending = layer.kind === "video" && !rendered;
                    return (
                      <li
                        key={`${shot.id}-${layer.elementId}`}
                        className="rounded-glyph border border-hair bg-canvas p-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="grid size-7 shrink-0 place-items-center rounded-glyph bg-tint">
                              <Icon className="size-3.5 text-brand" />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-caption font-bold text-ink">{layer.label}</span>
                              <span className="block text-micro text-ink-3 tabular-nums">
                                {layer.kind === "video" ? "Video clip" : "Image"} ·{" "}
                                {layer.inAt.toFixed(1)}s – {layer.outAt.toFixed(1)}s
                              </span>
                            </span>
                          </span>
                          {pending ? (
                            /* It renders with the shot; it says where it has
                               got to instead of offering a button. */
                            status
                          ) : (
                            /* A change to the clip is described, so it goes
                               to the chat like every other edit here. */
                            <button
                              type="button"
                              onClick={() => onReplaceMedia(shot, layer.elementId, layer.kind)}
                              className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-glyph px-1.5 py-1 text-micro font-bold text-brand transition-colors hover:bg-tint"
                            >
                              <MessageSquarePlus className="size-2.5" />
                              Add to chat
                            </button>
                          )}
                        </div>

                        {/* What it looks like, rather than what it is called. */}
                        <div className="mt-1.5 flex gap-1.5">
                          {layer.kind === "image" ? (
                            <FrameThumb at={0} duration={1} label="Still" image={stillSrc} />
                          ) : pending ? (
                            <FrameThumb
                              src={clipSrc}
                              at={(layer.inAt + layer.outAt) / 2}
                              duration={scene.duration || 10}
                              label={rendering ? "Rendering…" : "Storyboard frame"}
                            />
                          ) : (
                            <FrameThumb
                              src={clipSrc}
                              at={layer.inAt}
                              duration={scene.duration || 10}
                              label="Rendered clip"
                            />
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
