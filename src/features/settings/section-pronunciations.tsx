"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Text } from "@/components/ui/text";
import { Stack } from "@/components/ui/stack";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { DataTable, type DataColumn } from "@/components/patterns/data-table";
import { useSettingsStore } from "@/features/settings/settings-store";
import { SettingsCard } from "@/features/settings/settings-parts";
import type { Pronunciation } from "@/features/settings/settings-types";

/**
 * The pronunciation dictionary the narration pipeline reads. Ported from
 * marketingiq, where it exists but is unlinked from the tab row — reachable
 * only by typing the URL.
 *
 * The tester is what makes this worth having: a dictionary you cannot try is a
 * dictionary nobody trusts.
 */
export function SectionPronunciations() {
  const s = useSettingsStore();
  const [term, setTerm] = useState("");
  const [phonetic, setPhonetic] = useState("");
  const [notes, setNotes] = useState("");
  const [sample, setSample] = useState(
    "In the EMBRACE-3 trial, Velmora (tirzelamide) reduced eGFR decline versus standard of care.",
  );

  const add = () => {
    if (!term.trim() || !phonetic.trim()) return;
    s.addPronunciation({ term: term.trim(), phonetic: phonetic.trim(), notes: notes.trim() });
    setTerm(""); setPhonetic(""); setNotes("");
  };

  /** Longest term first, so "EMBRACE-3" is not half-matched by "EMBRACE". */
  const after = useMemo(() => {
    const sorted = [...s.pronunciations].sort((a, b) => b.term.length - a.term.length);
    return sorted.reduce(
      (text, p) => text.replaceAll(p.term, p.phonetic),
      sample,
    );
  }, [s.pronunciations, sample]);

  const columns: DataColumn<Pronunciation>[] = [
    { key: "term", header: "Term", cell: (p) => <Text size="body" weight="semibold" className="text-ink">{p.term}</Text> },
    { key: "ph", header: "Phonetic", cell: (p) => <span className="font-mono text-body text-brand-deep">{p.phonetic}</span> },
    { key: "notes", header: "Notes", secondary: true, cell: (p) => <Text size="body" tone="muted">{p.notes || "—"}</Text> },
    { key: "added", header: "Added", secondary: true, cell: (p) => (
        <div>
          <Text size="caption" tone="muted" className="block">{p.addedAt}</Text>
          <Text size="caption" tone="subtle" className="block">{p.addedBy}</Text>
        </div>
      ) },
    {
      key: "rm", header: "", cell: (p) => (
        <button
          type="button" aria-label={`Remove ${p.term}`}
          onClick={() => s.removePronunciation(p.id)}
          className="grid size-7 place-items-center rounded-glyph text-ink-3 transition-colors hover:bg-subtle hover:text-danger cursor-pointer"
        >
          <Trash2 className="size-3.5" />
        </button>
      ),
    },
  ];

  return (
    <Stack gap={4}>
      <SettingsCard
        title="Dictionary"
        description="Applies to the whole workspace — one person's spelling should not change everyone's narration, which is why this is admin-only."
      >
        <Stack gap={3}>
          <div className="flex flex-wrap items-end gap-2 rounded-panel border border-hair bg-canvas p-3">
            <Field label="Term" value={term} onChange={(e) => setTerm(e.target.value)}
              placeholder="e.g. Velmora" className="max-w-44 text-body" />
            <Field label="Phonetic" value={phonetic} onChange={(e) => setPhonetic(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
              placeholder="e.g. vel-MOR-uh" className="max-w-44 text-body" />
            <Field label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Context for whoever edits this next" className="min-w-48 flex-1 text-body" />
            <Button size="sm" onClick={add} disabled={!term.trim() || !phonetic.trim()}>
              <Plus className="size-3.5" /> Add
            </Button>
          </div>

          <DataTable columns={columns} rows={s.pronunciations} rowKey={(p) => p.id}
            empty="No entries yet. Narration will use default pronunciation." />
        </Stack>
      </SettingsCard>

      <SettingsCard title="Try it" description="Paste narration to see what the pipeline will say.">
        <Stack gap={3}>
          <div>
            <Text size="label" tone="muted" weight="semibold" className="mb-1.5 block">Before</Text>
            <textarea
              value={sample}
              onChange={(e) => setSample(e.target.value)}
              rows={3}
              className="w-full resize-y rounded-control border border-hair-2 bg-card px-3 py-2 text-body text-ink transition-colors focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <Text size="label" tone="muted" weight="semibold" className="mb-1.5 block">After</Text>
            <div className="rounded-control border border-ok-line bg-ok-bg/50 px-3 py-2">
              <Text size="body" className="text-ink">{after}</Text>
            </div>
          </div>
          <Text size="caption" tone="subtle">
            Longer terms are substituted first, so EMBRACE-3 is not half-matched by EMBRACE.
          </Text>
        </Stack>
      </SettingsCard>
    </Stack>
  );
}
