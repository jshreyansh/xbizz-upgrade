"use client";

import { useState } from "react";
import { Check, Edit3, FileText, Lock, Paperclip, Sparkles, Upload, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { DropZone } from "@/components/patterns/drop-zone";
import { PickChip, PickEmpty, PickList, PickRow, PickSearch } from "@/components/patterns/pick-list";
import { CDC_DISEASES, DISEASE_THERAPY_AREAS, diseaseArea } from "@/features/workspace/ad-options";
import { THERAPY_SECTIONS, useTherapyLibraryStore, type TherapyOrigin } from "@/features/therapy-library/therapy-library-store";
import { TherapyAreaMark } from "@/features/therapy-library/therapy-area-mark";

/** Starting points for the brief. Picking one fills the box; the user can still write their own. */
const BRIEF_STARTS = [
  { label: "Patient awareness", text: "A patient awareness campaign: what the condition is, the early signs, and when to see a doctor." },
  { label: "HCP education", text: "HCP education on diagnosis and the current treatment landscape, with the unmet need." },
  { label: "Screening and early detection", text: "Screening and early detection, for a public health audience." },
];

/**
 * New Therapy, in one pop-up.
 *
 * First the therapy: one search across every area and disease, with the areas
 * as quick filters. Then one of two ways in. Either you already have a
 * finished dossier and just add it, or you tell SwishX what it is for and hand
 * over whatever material you have, and SwishX builds it from that plus its
 * own cited sources. Either way it opens on the disease's page, building, and
 * is ready to read and use there when done.
 */
export function NewTherapyDossierModal({
  open, onClose, onAdded, areaId: fixedArea,
}: {
  open: boolean;
  onClose: () => void;
  onAdded: (areaId: string, dossierId: string) => void;
  /** Opened from an area's own page: the list starts filtered to it. */
  areaId?: string;
}) {
  const dossiers = useTherapyLibraryStore((s) => s.dossiers);
  const addDossier = useTherapyLibraryStore((s) => s.addDossier);
  const [areaFilter, setAreaFilter] = useState(fixedArea ?? "");
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<{ id: string; label: string; areaId: string }>();
  const [origin, setOrigin] = useState<TherapyOrigin>("swishx");
  const [brief, setBrief] = useState("");
  const [materials, setMaterials] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");

  const q = query.trim().toLowerCase();
  const inLibrary = (id: string) => dossiers.find((x) => x.diseaseId === id);
  const matches = CDC_DISEASES
    .map((d) => ({ ...d, area: DISEASE_THERAPY_AREAS.find((a) => a.groups.includes(d.group)) }))
    .filter((d): d is typeof d & { area: NonNullable<typeof d.area> } => !!d.area && (!areaFilter || d.area.id === areaFilter))
    .filter((d) => !q || d.label.toLowerCase().includes(q) || d.area.name.toLowerCase().includes(q))
    /* What's already in the library first: a new version is the commonest ask. */
    .sort((a, b) => Number(!!inLibrary(b.id)) - Number(!!inLibrary(a.id)));
  const area = diseaseArea(picked?.areaId ?? "");
  const existing = picked && inLibrary(picked.id);
  const ready = !!picked && (origin === "swishx" ? brief.trim().length > 0 : !!fileName);

  const reset = () => {
    setAreaFilter(fixedArea ?? "");
    setQuery("");
    setPicked(undefined);
    setOrigin("swishx");
    setBrief("");
    setMaterials([]);
    setFileName("");
  };
  const close = () => { reset(); onClose(); };
  const submit = () => {
    if (!picked) return;
    const id = addDossier({
      areaId: picked.areaId, diseaseId: picked.id, disease: picked.label, origin,
      fileName: origin === "upload" ? fileName : undefined,
      brief: origin === "swishx" ? brief : undefined,
      materials: origin === "swishx" ? materials : undefined,
    });
    onAdded(picked.areaId, id);
    reset();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={existing ? `New Version of ${existing.disease}` : "New Therapy"}
      description="Disease-level grounding for unbranded and awareness content."
      size="lg"
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-caption text-ink-4">
            <Lock className="size-3.5 shrink-0" />
            Read-only once ready. Changes come as a new version.
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={close}>Cancel</Button>
            <Button disabled={!ready} onClick={submit}>
              {origin === "swishx" ? <Sparkles className="size-4" /> : <Upload className="size-4" />}
              {origin === "swishx" ? "Build with SwishX" : "Add Dossier"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid gap-6">
        {/* 1. Which therapy */}
        <section className="grid gap-2.5">
          <span className="text-label font-extrabold text-ink">Therapy Area or Disease</span>
          {picked && area ? (
            <div className="flex items-center gap-3 rounded-panel border border-tint-line bg-tint p-3">
              <TherapyAreaMark areaId={area.id} className="size-9 rounded-chip" iconClassName="size-4" />
              <div className="min-w-0 flex-1">
                <b className="block text-body text-ink">{picked.label}</b>
                <span className="block text-label text-ink-3">
                  {existing ? `In ${area.name}, in the library as v${existing.version}. This adds v${existing.version + 1}; v${existing.version} is kept.` : `In ${area.name}`}
                </span>
              </div>
              <button type="button" onClick={() => setPicked(undefined)} className="flex cursor-pointer items-center gap-1 text-label font-bold text-brand hover:underline">
                <Edit3 className="size-3" />
                Change
              </button>
            </div>
          ) : (
            <>
              <PickSearch value={query} onChange={setQuery} placeholder="Search a disease or therapy area…" autoFocus />
              <div className="flex flex-wrap gap-1.5">
                {[{ id: "", name: "All Areas" }, ...DISEASE_THERAPY_AREAS].map((a) => {
                  const on = a.id === areaFilter;
                  return (
                    <button
                      key={a.id || "all"}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setAreaFilter(a.id)}
                      className={cn(
                        "focus-ring inline-flex cursor-pointer items-center gap-1.5 rounded-chip border py-1 text-label font-semibold transition-colors",
                        a.id ? "pl-1 pr-2.5" : "px-2.5",
                        on ? "border-brand bg-tint text-brand-deep" : "border-hair-2 bg-card text-ink-2 hover:border-hair-3"
                      )}
                    >
                      {a.id && <TherapyAreaMark areaId={a.id} className="size-5 rounded-full" iconClassName="size-3" />}
                      {a.name}
                    </button>
                  );
                })}
              </div>
              <PickList>
                {matches.map((d) => {
                  const had = inLibrary(d.id);
                  return (
                    <PickRow
                      key={d.id}
                      onSelect={() => setPicked({ id: d.id, label: d.label, areaId: d.area.id })}
                      thumb={<TherapyAreaMark areaId={d.area.id} className="size-8 rounded-chip" iconClassName="size-4" />}
                      title={d.label}
                      detail={d.area.name}
                      chip={had ? <PickChip tone="brand">In Library · v{had.version}</PickChip> : undefined}
                    />
                  );
                })}
                {matches.length === 0 && (
                  <PickEmpty title={<>Nothing matching &quot;{query}&quot;</>}>
                    {areaFilter ? (
                      <button
                        type="button"
                        onClick={() => setPicked({ id: `disease-custom-${q.replace(/[^a-z0-9]+/g, "-")}`, label: query.trim(), areaId: areaFilter })}
                        className="cursor-pointer font-bold text-brand hover:underline"
                      >
                        Add &quot;{query.trim()}&quot; to {diseaseArea(areaFilter)?.name}
                      </button>
                    ) : (
                      "Pick its therapy area above to add it as a new disease."
                    )}
                  </PickEmpty>
                )}
              </PickList>
            </>
          )}
        </section>

        {/* 2. How it comes in */}
        {picked && (
          <section className="grid gap-2.5">
            <span className="text-label font-extrabold text-ink">How do you want to add it?</span>
            <div className="grid gap-2 sm:grid-cols-2">
              {([
                { id: "swishx", icon: Sparkles, title: "SwishX Builds It", body: "Tell us what it's for and add any material you have. SwishX writes it from that and 125+ cited medical sources." },
                { id: "upload", icon: Upload, title: "Add a Finished Dossier", body: "You already have one. Upload it and SwishX reads it into the same sections." },
              ] as const).map((o) => {
                const on = origin === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setOrigin(o.id)}
                    className={cn(
                      "focus-ring relative flex cursor-pointer flex-col gap-1 rounded-panel border p-3 text-left transition-colors",
                      on ? "border-brand bg-tint" : "border-hair-2 bg-card hover:border-hair-3"
                    )}
                  >
                    <span className="flex items-center gap-2 text-body font-bold text-ink">
                      <o.icon className="size-4 text-brand" />
                      {o.title}
                    </span>
                    <span className="pr-5 text-label leading-snug text-ink-3">{o.body}</span>
                    {on && (
                      <span className="absolute right-2.5 top-2.5 grid size-4 place-items-center rounded-full bg-brand text-white">
                        <Check className="size-2.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {origin === "swishx" ? (
              <div className="grid gap-4 pt-1">
                <div className="grid gap-1.5">
                  <Field
                    label="What should it focus on?"
                    multiline
                    rows={3}
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                    placeholder={`The audience, the goal, and anything to cover or avoid for ${picked.label}.`}
                  />
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-caption text-ink-4">Start from:</span>
                    {BRIEF_STARTS.map((b) => (
                      <button
                        key={b.label}
                        type="button"
                        onClick={() => setBrief(b.text)}
                        className="focus-ring cursor-pointer rounded-chip border border-hair-2 bg-card px-2.5 py-1 text-caption font-semibold text-ink-3 transition-colors hover:border-brand hover:text-brand-deep"
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <span className="text-label font-bold text-ink-2">
                    Materials You Have <span className="font-normal text-ink-4">(optional)</span>
                  </span>
                  <DropZone
                    size="sm"
                    multiple
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                    title="Drop files or choose them"
                    hint="Guidelines, papers, market research, past campaigns. PDF, Word, PowerPoint or Excel."
                    onFiles={(files) => setMaterials((m) => [...m, ...files.map((f) => f.name).filter((n) => !m.includes(n))])}
                  />
                  {materials.length > 0 && (
                    <ul className="grid gap-1">
                      {materials.map((m) => (
                        <li key={m} className="flex items-center gap-2 rounded-control border border-hair bg-canvas px-3 py-1.5 text-label">
                          <Paperclip className="size-3.5 shrink-0 text-ink-4" />
                          <span className="min-w-0 flex-1 truncate text-ink-2">{m}</span>
                          <button type="button" aria-label={`Remove ${m}`} onClick={() => setMaterials((all) => all.filter((x) => x !== m))} className="cursor-pointer text-ink-4 hover:text-ink">
                            <X className="size-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <p className="text-caption text-ink-4">Covers {THERAPY_SECTIONS.join(", ")}. Every line is cited.</p>
              </div>
            ) : (
              <div className="pt-1">
                {fileName ? (
                  <div className="flex items-center gap-2 rounded-control border border-hair bg-canvas px-3 py-2 text-label">
                    <FileText className="size-4 shrink-0 text-ink-4" />
                    <span className="min-w-0 flex-1 truncate text-ink-2">{fileName}</span>
                    <button type="button" onClick={() => setFileName("")} className="cursor-pointer font-bold text-brand hover:underline">Replace</button>
                  </div>
                ) : (
                  <DropZone
                    size="sm"
                    accept=".pdf,.doc,.docx"
                    title="Drop the dossier or choose it"
                    hint="One PDF or Word file."
                    onFiles={(files) => files[0] && setFileName(files[0].name)}
                  />
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </Modal>
  );
}
