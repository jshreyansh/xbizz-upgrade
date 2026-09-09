"use client";

import { Film, ImageIcon, Layers, MessageSquarePlus, Video } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Scene, Shot } from "@/types/content";

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
  onScrub,
  onAddToChat,
  onReplaceMedia,
}: {
  scene: Scene;
  currentTime: number;
  onScrub: (seconds: number) => void;
  /** Hand this shot to the agent to change. */
  onAddToChat: (shot: Shot) => void;
  onReplaceMedia: (shot: Shot, elementId: string, kind: "image" | "video") => void;
}) {
  const shots = scene.shots ?? [];
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

        return (
          <div
            key={shot.id}
            className={cn(
              "rounded-panel border p-3 transition-colors",
              active ? "border-brand/30 bg-tint" : "border-hair bg-canvas"
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
                <span className="shrink-0 rounded-glyph bg-tint px-2 py-0.5 text-micro font-bold text-brand-deep">
                  {media.length} Media {media.length === 1 ? "Layer" : "Layers"}
                </span>
              </div>

              {media.length === 0 ? (
                <p className="text-caption italic text-ink-4">
                  No media in this shot — the frame is copy only.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {media.map((layer) => {
                    const Icon = layer.kind === "video" ? Video : ImageIcon;
                    return (
                      <li
                        key={`${shot.id}-${layer.elementId}`}
                        className="flex items-center justify-between gap-2 rounded-glyph border border-hair bg-canvas p-1.5"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="grid size-7 shrink-0 place-items-center rounded-glyph bg-tint">
                            <Icon className="size-3.5 text-brand" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-caption font-bold text-ink">{layer.label}</span>
                            <span className="block text-micro text-ink-3 tabular-nums">
                              {layer.kind === "video" ? "Video Clip" : "Image Asset"} ·{" "}
                              {layer.inAt.toFixed(1)}s – {layer.outAt.toFixed(1)}s
                              {layer.kind === "video" && " (60fps)"}
                            </span>
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => onReplaceMedia(shot, layer.elementId, layer.kind)}
                          className="shrink-0 rounded-glyph border border-hair-2 bg-card px-2 py-1 text-micro font-bold text-ink-2 transition-colors hover:border-brand hover:text-brand cursor-pointer"
                        >
                          {layer.kind === "video" ? "Swap" : "Replace"}
                        </button>
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
