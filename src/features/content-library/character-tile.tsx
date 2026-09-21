"use client";

import { Archive, Camera, Pencil, Sparkles, Undo2 } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  VIEW_LABEL,
  characterTypeLabel,
  type Character,
  type CharacterView,
} from "@/features/content-library/characters-data";

/** One view in the strip across the top of a tile. */
function ViewThumb({ view, onOpen }: { view: CharacterView; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group/view relative aspect-[3/4] min-w-0 overflow-hidden bg-subtle"
      aria-label={`Open ${VIEW_LABEL[view.id]}`}
    >
      {view.missing ? (
        <span className="grid h-full w-full place-items-center bg-subtle text-micro font-bold text-ink-4">
          —
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={view.url}
          alt=""
          style={view.transform ? { transform: view.transform } : undefined}
          className="h-full w-full object-cover object-top transition-transform duration-300 group-hover/view:scale-[1.04]"
        />
      )}
      <span className="absolute bottom-1.5 left-1.5 rounded-glyph bg-white/85 px-1.5 py-0.5 text-micro font-bold text-ink-2 backdrop-blur-sm">
        {VIEW_LABEL[view.id]}
      </span>
    </button>
  );
}

/**
 * A character, as a card.
 *
 * The views lead, because a character IS its views — a name and a type over a
 * single headshot would say less than the four frames that prove the identity
 * holds from every angle. Everything else is one line under them.
 */
export function CharacterTile({
  character,
  onOpenGallery,
  onEdit,
  onRefine,
  onArchive,
  onRestore,
}: {
  character: Character;
  onOpenGallery: () => void;
  onEdit: () => void;
  onRefine: () => void;
  onArchive: () => void;
  onRestore: () => void;
}) {
  const missing = character.views.filter((v) => v.missing).length;
  const ready = missing === 0;

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-panel border bg-card shadow-hair transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft",
        character.archived ? "border-hair-2 opacity-75" : "border-hair"
      )}
    >
      <div className="grid grid-cols-4 gap-px bg-hair-2">
        {character.views.map((view) => (
          <ViewThumb key={view.id} view={view} onOpen={onOpenGallery} />
        ))}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="truncate text-body-lg font-extrabold text-ink">{character.name}</span>
            <span
              className={cn(
                "shrink-0 rounded-chip px-2 py-0.5 text-micro font-bold",
                ready ? "bg-ok-bg text-ok" : "bg-warn-bg text-warn"
              )}
            >
              {ready ? "Ready" : `${4 - missing} of 4 views`}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            {character.archived ? (
              <button
                type="button"
                onClick={onRestore}
                aria-label={`Restore ${character.name}`}
                title="Restore"
                className="grid size-7 cursor-pointer place-items-center rounded-full text-ink-3 transition hover:bg-black/5 hover:text-ink"
              >
                <Undo2 className="size-3.5" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onEdit}
                  aria-label={`Edit ${character.name}`}
                  title="Edit details"
                  className="grid size-7 cursor-pointer place-items-center rounded-full text-ink-3 transition hover:bg-black/5 hover:text-ink"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onArchive}
                  aria-label={`Archive ${character.name}`}
                  title="Archive"
                  className="grid size-7 cursor-pointer place-items-center rounded-full text-ink-3 transition hover:bg-black/5 hover:text-danger"
                >
                  <Archive className="size-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        <span className="w-fit rounded-chip bg-tint px-2 py-0.5 text-caption font-bold text-brand-deep">
          {characterTypeLabel(character)}
        </span>

        <p className="text-body leading-snug text-ink-3">{character.description}</p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1.5">
          {character.archived ? (
            <span className="text-caption text-ink-4">Archived</span>
          ) : (
            <button
              type="button"
              onClick={onRefine}
              className="inline-flex cursor-pointer items-center gap-1.5 text-label font-bold text-brand transition hover:text-brand-deep"
            >
              <Sparkles className="size-3.5" />
              Refine character
            </button>
          )}
          <button
            type="button"
            onClick={onOpenGallery}
            className="inline-flex cursor-pointer items-center gap-1.5 text-caption text-ink-4 transition hover:text-ink-2"
          >
            <Camera className="size-3" />
            {character.sources.length} source{character.sources.length === 1 ? "" : "s"}
          </button>
        </div>
      </div>
    </div>
  );
}
