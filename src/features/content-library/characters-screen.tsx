"use client";

import { useMemo, useState } from "react";
import { Plus, Search, UserRoundPlus } from "lucide-react";
import { cn } from "@/lib/cn";
import { useCharactersStore } from "@/features/content-library/characters-store";
import {
  CHARACTER_TYPES,
  characterTypeLabel,
  type Character,
} from "@/features/content-library/characters-data";
import { CharacterTile } from "@/features/content-library/character-tile";
import { CharacterCreateModal } from "@/features/content-library/character-create-modal";
import { CharacterEditModal } from "@/features/content-library/character-edit-modal";
import { CharacterRefineModal } from "@/features/content-library/character-refine-modal";
import { CharacterGalleryModal } from "@/features/content-library/character-gallery-modal";

type Shelf = "active" | "archived";
type TypeFilter = "all" | (typeof CHARACTER_TYPES)[number];

/**
 * The people this workspace can cast.
 *
 * Laid out like the Product Library and the Content Library, because it is
 * the same kind of screen — a shelf of things you own — and three shelves
 * with three layouts teach one person three ways to find something.
 */
export function CharactersScreen() {
  const characters = useCharactersStore((s) => s.characters);
  const add = useCharactersStore((s) => s.add);
  const update = useCharactersStore((s) => s.update);
  const setArchived = useCharactersStore((s) => s.setArchived);

  const [shelf, setShelf] = useState<Shelf>("active");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Character | null>(null);
  const [refining, setRefining] = useState<Character | null>(null);
  const [gallery, setGallery] = useState<Character | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const say = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  };

  const counts = useMemo(
    () => ({
      active: characters.filter((c) => !c.archived).length,
      archived: characters.filter((c) => c.archived).length,
    }),
    [characters]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return characters
      .filter((c) => (shelf === "archived" ? c.archived : !c.archived))
      .filter((c) => typeFilter === "all" || c.type === typeFilter)
      .filter(
        (c) =>
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          characterTypeLabel(c).toLowerCase().includes(q)
      )
      /* What this workspace made comes first; the seeded examples fall to the
         back, where they read as reference rather than as your own roster. */
      .sort((a, b) => Number(Boolean(a.example)) - Number(Boolean(b.example)));
  }, [characters, shelf, typeFilter, query]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-title font-extrabold tracking-tight text-ink">Characters</h2>
        <p className="mt-1 max-w-[62ch] text-body text-ink-3">
          People your studios can cast — each one held as a set of views that agree with each
          other, so the same face turns up in every asset.
        </p>
      </div>

      {/* Active / Archived, then search and filters — the order every other
          shelf here uses. */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex gap-0.5 rounded-control border border-hair-2 bg-subtle p-0.5">
          {([
            { id: "active" as const, label: "Active", count: counts.active },
            { id: "archived" as const, label: "Archived", count: counts.archived },
          ]).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setShelf(tab.id)}
              aria-pressed={shelf === tab.id}
              className={cn(
                "cursor-pointer rounded-glyph px-3 py-1.5 text-label font-bold transition",
                shelf === tab.id ? "bg-card text-brand-deep shadow-2xs" : "text-ink-3 hover:text-ink"
              )}
            >
              {tab.label}
              <span className="ml-1.5 text-caption tabular-nums text-ink-4">{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="relative flex min-w-[220px] max-w-[380px] flex-1 items-center">
          <Search className="absolute left-3.5 size-4 text-ink-4" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search characters by name, type or look…"
            className="w-full rounded-control border border-hair-2 bg-card py-2.5 pl-10 pr-3 text-body text-ink outline-none transition placeholder:text-ink-4 focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(["all", ...CHARACTER_TYPES] as TypeFilter[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setTypeFilter(option)}
              aria-pressed={typeFilter === option}
              className={cn(
                "cursor-pointer rounded-chip border px-2.5 py-1 text-label font-bold transition",
                typeFilter === option
                  ? "border-brand bg-tint text-brand-deep"
                  : "border-hair-2 bg-card text-ink-3 hover:border-hair-3 hover:text-ink"
              )}
            >
              {option === "all" ? "All" : option}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3.5">
        {shelf === "active" && (
          /* The first tile makes the thing, the way the Create landing and the
             Product Library both open with the action rather than a toolbar
             button somebody has to go looking for. */
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="group flex min-h-[260px] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-panel border border-dashed border-hair-3 bg-canvas p-6 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-brand hover:bg-tint/40"
          >
            <span className="grid size-12 place-items-center rounded-full bg-tint text-brand-deep transition group-hover:bg-brand group-hover:text-white">
              <UserRoundPlus className="size-5" />
            </span>
            <span className="text-body-lg font-extrabold text-ink">Create new</span>
            <span className="max-w-[28ch] text-caption leading-snug text-ink-3">
              From a description, or from footage and photographs of a real person.
            </span>
            <span className="mt-1 inline-flex items-center gap-1 text-label font-bold text-brand">
              <Plus className="size-3.5" /> New character
            </span>
          </button>
        )}

        {visible.map((character) => (
          <CharacterTile
            key={character.id}
            character={character}
            onOpenGallery={() => setGallery(character)}
            onEdit={() => setEditing(character)}
            onRefine={() => setRefining(character)}
            onArchive={() => {
              setArchived(character.id, true);
              say(`${character.name} archived`);
            }}
            onRestore={() => {
              setArchived(character.id, false);
              say(`${character.name} restored`);
            }}
          />
        ))}

        {visible.length === 0 && shelf === "archived" && (
          <div className="col-span-full rounded-panel border border-dashed border-hair-2 py-16 text-center">
            <p className="text-body-lg font-bold text-ink-2">Nothing archived</p>
            <p className="mt-1 text-body text-ink-4">
              Characters you archive are kept here rather than deleted.
            </p>
          </div>
        )}
      </div>

      {creating && (
        <CharacterCreateModal
          onCancel={() => setCreating(false)}
          onCreate={(character) => {
            add(character);
            setCreating(false);
            setShelf("active");
            say(`${character.name} is ready`);
          }}
        />
      )}

      {editing && (
        <CharacterEditModal
          character={editing}
          onCancel={() => setEditing(null)}
          onSave={(patch) => {
            update(editing.id, patch);
            setEditing(null);
            say("Character updated");
          }}
        />
      )}

      {refining && (
        <CharacterRefineModal
          character={refining}
          onCancel={() => setRefining(null)}
          onReplace={(instruction) => {
            update(refining.id, {
              description: instruction,
              /* A re-render fills in whatever the last pack was missing. */
              views: refining.views.map((v) => ({ ...v, missing: false })),
              createdOn: "Just now",
              example: false,
            });
            setRefining(null);
            say(`${refining.name} re-rendered`);
          }}
          onFork={(instruction, newName) => {
            add({
              ...refining,
              id: `char-${Date.now()}`,
              name: newName,
              description: instruction,
              views: refining.views.map((v) => ({ ...v, missing: false })),
              sources: [
                { kind: "prompt", label: `Refined from ${refining.name}: ${instruction}` },
                ...refining.sources,
              ],
              createdOn: "Just now",
              archived: false,
              example: false,
            });
            setRefining(null);
            say(`${newName} added`);
          }}
        />
      )}

      {gallery && (
        <CharacterGalleryModal character={gallery} onClose={() => setGallery(null)} />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[9999] -translate-x-1/2 rounded-control bg-ink px-4 py-2 text-body font-bold text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
