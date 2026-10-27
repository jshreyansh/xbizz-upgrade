"use client";

import { useState } from "react";
import { Mic } from "lucide-react";
import { PageHeading } from "@/components/patterns/page-heading";
import { CreateTile } from "@/components/patterns/create-tile";
import { FilterBar, FilterTabs } from "@/components/patterns/filter-bar";
import { useCan } from "@/features/settings/view-as";
import { VOICE_LANGUAGES, voiceLanguage, type Voice, type VoiceGender } from "@/features/content-library/voices-data";
import { playVoicePreview, stopVoicePreview, useVoicesStore } from "@/features/content-library/voices-store";
import { VoiceTile } from "@/features/content-library/voice-tile";
import { VoiceCloneModal } from "@/features/content-library/voice-clone-modal";
import { VoiceEditModal } from "@/features/content-library/voice-edit-modal";

/* The team's own, SwishX's, and the team's put away. Stock voices are never archived. */
type Shelf = "team" | "swishx" | "archived";

/**
 * Every voice a project can narrate with.
 *
 * Laid out like Characters, because it is the same kind of shelf: the team's
 * own cloned voices, active or archived, made and changed by people who
 * create; and beside them SwishX's stock voices, to hear and use. Filtered by
 * the two things a narrator is chosen on first — language and gender.
 */
export function VoicesScreen() {
  const voices = useVoicesStore((s) => s.voices);
  const add = useVoicesStore((s) => s.add);
  const update = useVoicesStore((s) => s.update);
  const setArchived = useVoicesStore((s) => s.setArchived);

  const [shelf, setShelf] = useState<Shelf>("team");
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("all");
  const [gender, setGender] = useState<VoiceGender | "all">("all");

  /* Voices are made for videos, so cloning and changing them needs Create. */
  const canCreate = useCan().can("create");
  const [cloning, setCloning] = useState(false);
  const [editing, setEditing] = useState<Voice | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const say = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  };

  const play = (voice: Voice) => {
    if (playing === voice.id) {
      stopVoicePreview();
      setPlaying(null);
      return;
    }
    setPlaying(voice.id);
    playVoicePreview(voice, () => setPlaying((p) => (p === voice.id ? null : p)));
  };

  const team = voices.filter((v) => v.source === "team");
  const counts = {
    team: team.filter((v) => !v.archived).length,
    swishx: voices.filter((v) => v.source === "swishx").length,
    archived: team.filter((v) => v.archived).length,
  };
  const q = query.trim().toLowerCase();
  const visible = voices
    .filter((v) => (shelf === "swishx" ? v.source === "swishx" : v.source === "team" && (shelf === "archived") === Boolean(v.archived)))
    .filter((v) => language === "all" || v.languageId === language)
    .filter((v) => gender === "all" || v.gender === gender)
    .filter((v) => !q || [v.name, v.description ?? "", v.accent, v.style, voiceLanguage(v.languageId).label].some((t) => t.toLowerCase().includes(q)))
    /* What this workspace made comes first; the seeded examples fall to the back. */
    .sort((a, b) => Number(Boolean(a.example)) - Number(Boolean(b.example)));
  const filtered = language !== "all" || gender !== "all" || !!q;

  return (
    <div className="page-enter space-y-6">
      <PageHeading
        title="Voices"
        description="The voices your videos can be narrated in: your team's own, cloned with consent, and SwishX's stock voices. Each one tagged with its language and voice."
      />

      <div className="space-y-4">
        <FilterTabs
          ariaLabel="Which voices"
          activeId={shelf}
          onSelect={(id) => setShelf(id as Shelf)}
          items={[
            { id: "team", label: "Team voices", count: counts.team },
            { id: "swishx", label: "SwishX voices", count: counts.swishx },
            { id: "archived", label: "Archived", count: counts.archived },
          ]}
        />
        <FilterBar
          query={query}
          onQuery={setQuery}
          placeholder="Search voices by name, accent or style…"
          filters={[
            {
              id: "language",
              label: "Language",
              value: language,
              defaultValue: "all",
              onChange: setLanguage,
              options: [{ id: "all", label: "Any language" }, ...VOICE_LANGUAGES.map((l) => ({ id: l.id, label: l.label }))],
            },
            {
              id: "gender",
              label: "Voice",
              value: gender,
              defaultValue: "all",
              onChange: (v) => setGender(v as VoiceGender | "all"),
              options: [
                { id: "all", label: "Any voice" },
                { id: "Female", label: "Female" },
                { id: "Male", label: "Male" },
                { id: "Neutral", label: "Neutral" },
              ],
            },
          ]}
        />
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3.5">
        {shelf === "team" && canCreate && (
          <CreateTile
            icon={<Mic className="size-5" />}
            title="Clone a new voice"
            subtitle="Record 10 to 30 seconds with a teleprompter, or upload a clip. Tagged with its language, with consent kept on file."
            onSelect={() => setCloning(true)}
          />
        )}

        {visible.map((voice) => (
          <VoiceTile
            key={voice.id}
            voice={voice}
            playing={playing === voice.id}
            onPlay={() => play(voice)}
            onEdit={() => setEditing(voice)}
            onArchive={() => {
              setArchived(voice.id, true);
              say(`${voice.name} archived. Projects already using it keep it.`);
            }}
            onRestore={() => {
              setArchived(voice.id, false);
              say(`${voice.name} restored`);
            }}
            readOnly={!canCreate}
          />
        ))}

        {visible.length === 0 && (filtered || shelf !== "team") && (
          <div className="col-span-full rounded-panel border border-dashed border-hair-2 py-16 text-center">
            <p className="text-body-lg font-bold text-ink-2">{filtered ? "No voices match" : "Nothing archived"}</p>
            <p className="mt-1 text-body text-ink-4">
              {filtered ? "Try another language, voice or search." : "Voices you archive are kept here rather than deleted. Projects already using one keep it."}
            </p>
          </div>
        )}
      </div>

      {cloning && (
        <VoiceCloneModal
          onCancel={() => setCloning(false)}
          onSave={(voice) => {
            add(voice);
            setCloning(false);
            setShelf("team");
            say(`${voice.name} is ready to use`);
          }}
        />
      )}

      {editing && (
        <VoiceEditModal
          voice={editing}
          onCancel={() => setEditing(null)}
          onSave={(patch) => {
            update(editing.id, patch);
            setEditing(null);
            say("Voice updated");
          }}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[9999] -translate-x-1/2 rounded-control bg-ink px-4 py-2 text-body font-bold text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
