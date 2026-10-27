"use client";

import { Archive, Pause, Pencil, Play, ShieldCheck, Undo2 } from "lucide-react";
import { LibraryTile } from "@/components/patterns/library-tile";
import { IconButton } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { voiceLanguage, type Voice } from "@/features/content-library/voices-data";

/* A voice's own waveform, the same every time it's drawn. */
function bars(id: string, count: number) {
  let seed = [...id].reduce((n, c) => (n * 31 + c.charCodeAt(0)) % 9973, 7);
  return Array.from({ length: count }, () => {
    seed = (seed * 48271) % 2147483647;
    return 0.22 + (seed % 1000) / 1300;
  });
}

/**
 * A voice, as a card: the thing you'd do first with it — hear it — leads, as
 * a waveform with a play button; then its name and tags; then whose it is.
 */
export function VoiceTile({
  voice,
  playing,
  onPlay,
  onEdit,
  onArchive,
  onRestore,
  readOnly,
}: {
  voice: Voice;
  playing: boolean;
  onPlay: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onRestore: () => void;
  /** Viewable and playable, not changeable. Stock voices are always read-only. */
  readOnly?: boolean;
}) {
  const team = voice.source === "team";
  const language = voiceLanguage(voice.languageId);

  return (
    <LibraryTile
      className={voice.archived ? "opacity-75" : undefined}
      media={
        /* Illustration: a warm band for the team's own voices, a cool one for SwishX's. */
        <div
          className="relative flex h-24 items-center gap-3 px-4"
          style={{ background: team ? "linear-gradient(135deg,#fff1ea,#ffe2d3)" : "linear-gradient(135deg,#eef2f6,#e2e8f0)" }}
        >
          <button
            type="button"
            onClick={onPlay}
            aria-label={playing ? `Stop ${voice.name}` : `Play ${voice.name}`}
            className={cn("grid size-11 shrink-0 cursor-pointer place-items-center rounded-full text-white shadow-soft transition hover:scale-105", team ? "bg-brand" : "bg-ink")}
          >
            {playing ? <Pause className="size-4 fill-current" /> : <Play className="ml-0.5 size-4 fill-current" />}
          </button>
          <div className="flex h-10 min-w-0 flex-1 items-center gap-[3px]" aria-hidden>
            {bars(voice.id, 40).map((h, i) => (
              <span
                key={i}
                className={cn("flex-1 rounded-full transition-opacity", team ? "bg-brand" : "bg-ink-3", playing ? "animate-pulse" : "")}
                style={{ height: `${Math.min(100, h * 100)}%`, opacity: playing ? 0.9 : 0.45, animationDelay: `${i * 40}ms` }}
              />
            ))}
          </div>
        </div>
      }
      mediaTopRight={
        <span className="rounded-chip bg-card/90 px-2 py-0.5 text-micro font-extrabold text-ink-2">{team ? "Cloned" : "SwishX voice"}</span>
      }
      title={voice.name}
      subtitle={voice.description ?? `${voice.accent} · ${voice.style}`}
      chips={
        <>
          <span className="rounded-chip bg-tint px-2 py-0.5 text-caption font-bold text-brand-deep">{language.label}</span>
          <span className="rounded-chip bg-subtle px-2 py-0.5 text-caption font-bold text-ink-3">{voice.gender}</span>
          <span className="rounded-chip bg-subtle px-2 py-0.5 text-caption font-bold text-ink-3">{voice.style}</span>
        </>
      }
      actions={
        readOnly || !team ? undefined : voice.archived ? (
          <IconButton aria-label={`Restore ${voice.name}`} title="Restore" size={7} onClick={onRestore}>
            <Undo2 className="size-3.5" />
          </IconButton>
        ) : (
          <>
            <IconButton aria-label={`Edit ${voice.name}`} title="Edit" size={7} onClick={onEdit}>
              <Pencil className="size-3.5" />
            </IconButton>
            <IconButton aria-label={`Archive ${voice.name}`} title="Archive" size={7} onClick={onArchive}>
              <Archive className="size-3.5" />
            </IconButton>
          </>
        )
      }
      footerLeft={
        team
          ? voice.archived
            ? "Archived"
            : `By ${voice.createdBy} · ${voice.createdOn}${voice.usedIn ? ` · in ${voice.usedIn} ${voice.usedIn === 1 ? "project" : "projects"}` : ""}`
          : voice.accent
      }
      footerRight={
        team && voice.consent ? (
          <span className="inline-flex items-center gap-1 font-semibold text-ok" title={voice.consent.whose === "own" ? "Their own voice" : voice.consent.file ? `Signed consent form from ${voice.consent.person}` : `${voice.consent.person}'s consent confirmed by ${voice.consent.confirmedBy}`}>
            <ShieldCheck className="size-3" />
            {voice.consent.whose === "own" ? "Own voice" : voice.consent.file ? "Consent on file" : "Consent confirmed"}
          </span>
        ) : undefined
      }
    />
  );
}
