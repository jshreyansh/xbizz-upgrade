"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import {
  CHARACTER_TYPES,
  type Character,
  type CharacterType,
} from "@/features/content-library/characters-data";

/**
 * The details, editable. Not the views.
 *
 * Renaming a character or correcting its type is a records change and should
 * cost nothing; changing what the person LOOKS like is a re-render, which is
 * what Refine is for. Keeping them apart is what stops a typo fix from
 * spending credits.
 */
export function CharacterEditModal({
  character,
  onCancel,
  onSave,
}: {
  character: Character;
  onCancel: () => void;
  onSave: (patch: Partial<Character>) => void;
}) {
  const [name, setName] = useState(character.name);
  const [type, setType] = useState<CharacterType>(character.type);
  const [typeOther, setTypeOther] = useState(character.typeOther ?? "");
  const [description, setDescription] = useState(character.description);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const ready =
    name.trim().length > 0 && (type !== "Others" || typeOther.trim().length > 0);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] grid place-items-center bg-ink/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Edit ${character.name}`}
    >
      <div className="flex max-h-[88vh] w-full max-w-[520px] flex-col overflow-hidden rounded-card border border-hair bg-card shadow-float">
        <div className="flex items-start justify-between gap-3 border-b border-hair px-5 py-4">
          <div>
            <h2 className="text-subhead font-[850] tracking-tight text-ink">Edit character</h2>
            <p className="mt-0.5 text-label text-ink-3">
              Details only — the views stay as they are.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel"
            className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-ink-3 transition hover:bg-black/5 hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <div className="space-y-1.5">
            <label className="block text-label font-bold text-ink-2">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="w-full rounded-control border border-hair-2 bg-canvas px-3 py-2.5 text-body text-ink outline-none transition focus:border-brand focus:bg-card focus:ring-2 focus:ring-brand/15"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-label font-bold text-ink-2">Character type</label>
            <div className="flex flex-wrap gap-1.5">
              {CHARACTER_TYPES.map((option) => {
                const active = type === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setType(option)}
                    aria-pressed={active}
                    className={cn(
                      "cursor-pointer rounded-chip border px-3 py-1.5 text-label font-bold transition",
                      active
                        ? "border-brand bg-brand text-white"
                        : "border-hair-2 bg-card text-ink-2 hover:border-brand hover:text-brand"
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {type === "Others" && (
              <input
                value={typeOther}
                onChange={(e) => setTypeOther(e.target.value)}
                placeholder="What kind of character is this?"
                className="w-full rounded-control border border-hair-2 bg-canvas px-3 py-2.5 text-body text-ink outline-none transition placeholder:text-ink-4 focus:border-brand focus:bg-card focus:ring-2 focus:ring-brand/15"
              />
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-label font-bold text-ink-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-control border border-hair-2 bg-canvas p-3 text-body text-ink outline-none transition focus:border-brand focus:bg-card focus:ring-2 focus:ring-brand/15"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-hair bg-canvas px-5 py-3">
          <Button size="sm" variant="secondary" onClick={onCancel} className="cursor-pointer text-label font-bold">
            Cancel
          </Button>
          <Button
            size="sm"
            variant="primary"
            disabled={!ready}
            onClick={() =>
              onSave({
                name: name.trim(),
                type,
                typeOther: type === "Others" ? typeOther.trim() : undefined,
                description: description.trim(),
              })
            }
            className="cursor-pointer text-label font-bold disabled:opacity-40"
          >
            Save
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
