"use client";

import { useMemo, useState } from "react";
import { Search, UserRoundPlus } from "lucide-react";
import { CreateTile } from "@/components/patterns/create-tile";
import { useCharactersStore } from "@/features/content-library/characters-store";
import {
  characterTypeLabel,
  type Character,
} from "@/features/content-library/characters-data";
import { Segmented, SegmentedButton } from "@/components/patterns/segmented";
import { CharacterTile } from "@/features/content-library/character-tile";
import { CharacterCreateModal } from "@/features/content-library/character-create-modal";
import { CharacterEditModal } from "@/features/content-library/character-edit-modal";
import { CharacterRefineModal } from "@/features/content-library/character-refine-modal";
import { CharacterGalleryModal } from "@/features/content-library/character-gallery-modal";

type Shelf = "active" | "archived";

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
  }, [characters, shelf, query]);

  return (
    <div className="page-enter space-y-6">
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-1px", margin: "0 0 8px" }}>
          Characters
        </h1>
        <p style={{ margin: 0, fontSize: 14.5, color: "var(--ink-3)", lineHeight: 1.6, maxWidth: "62ch" }}>
          People your studios can cast — each one held as a set of views that agree with each
          other, so the same face turns up in every asset.
        </p>
      </div>

      {/* Active / Archived, then search and filters — the order every other
          shelf here uses. */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Same width and height as every other library's search — a shelf
            that sizes its own controls reads as a different product. */}
        <div style={{ position: "relative", flex: 1, minWidth: 220, maxWidth: 420 }}>
          <Search size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--ink-4)" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search characters by name, type or look…"
            style={{ width: "100%", padding: "10px 13px 10px 36px", borderRadius: "var(--r)", border: "1px solid var(--hair-2)", fontSize: 13.5, color: "var(--ink)", background: "#fff" }}
          />
        </div>

        <Segmented>
          {([
            { id: "active" as const, label: "Active", count: counts.active },
            { id: "archived" as const, label: "Archived", count: counts.archived },
          ]).map((tab) => (
            <SegmentedButton key={tab.id} active={shelf === tab.id} onClick={() => setShelf(tab.id)}>
              {tab.label}
              <span className="text-caption tabular-nums text-ink-4">{tab.count}</span>
            </SegmentedButton>
          ))}
        </Segmented>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3.5">
        {shelf === "active" && (
          /* The first tile makes the thing, the way the Create landing and the
             Product Library both open with the action rather than a toolbar
             button somebody has to go looking for. */
          <CreateTile
            icon={<UserRoundPlus className="size-5" />}
            title="Create new Character"
            subtitle="From a description, or from footage and photographs of a real person."
            onSelect={() => setCreating(true)}
          />
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
              updatedOn: "Just now",
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
              updatedOn: "Just now",
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
