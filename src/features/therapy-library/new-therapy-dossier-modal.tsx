"use client";

import { useRef, useState } from "react";
import { Check, Edit3, FileText, Lock, Sparkles, Upload } from "lucide-react";
import { cn } from "@/lib/cn";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { PickChip, PickEmpty, PickList, PickRow, PickSearch } from "@/components/patterns/pick-list";
import { CDC_DISEASES, DISEASE_THERAPY_AREAS, diseaseArea } from "@/features/workspace/ad-options";
import { THERAPY_SECTIONS, useTherapyLibraryStore, type TherapyOrigin } from "@/features/therapy-library/therapy-library-store";
import { TherapyAreaMark } from "@/features/therapy-library/therapy-area-mark";

/**
 * Select a therapy area, then a disease in it, then upload a dossier or have
 * SwishX make one. A disease already in the library gets a new version; the
 * old one is kept.
 */
export function NewTherapyDossierModal({
  open, onClose, onAdded, areaId: fixedArea,
}: {
  open: boolean;
  onClose: () => void;
  onAdded: (areaId: string) => void;
  /** Opened from an area's own page: the area is already chosen. */
  areaId?: string;
}) {
  const dossiers = useTherapyLibraryStore((s) => s.dossiers);
  const addDossier = useTherapyLibraryStore((s) => s.addDossier);
  const [areaId, setAreaId] = useState(fixedArea ?? "");
  const [query, setQuery] = useState("");
  const [disease, setDisease] = useState<{ id: string; label: string }>();
  const [origin, setOrigin] = useState<TherapyOrigin>("swishx");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const area = diseaseArea(areaId);
  const q = query.trim().toLowerCase();
  const inArea = area ? CDC_DISEASES.filter((d) => area.groups.includes(d.group)) : [];
  const matches = inArea.filter((d) => !q || d.label.toLowerCase().includes(q));
  const existing = disease && dossiers.find((d) => d.diseaseId === disease.id);
  const ready = !!area && !!disease && (origin === "swishx" || !!fileName);

  const reset = () => {
    setAreaId(fixedArea ?? "");
    setQuery("");
    setDisease(undefined);
    setOrigin("swishx");
    setFileName("");
  };
  const close = () => { reset(); onClose(); };
  const submit = () => {
    if (!area || !disease) return;
    addDossier({ areaId: area.id, diseaseId: disease.id, disease: disease.label, origin, fileName: origin === "upload" ? fileName : undefined });
    onAdded(area.id);
    reset();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={existing ? `New Version of ${existing.disease}` : "New Therapy Dossier"}
      description="Disease-level grounding for unbranded and awareness content."
      size="md"
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-caption text-ink-4">
            <Lock className="size-3.5 shrink-0" />
            Read-only once added. Changes come as a new version.
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={close}>Cancel</Button>
            <Button disabled={!ready} onClick={submit}>
              {origin === "swishx" ? <Sparkles className="size-4" /> : <Upload className="size-4" />}
              {origin === "swishx" ? "Make Dossier" : "Add Dossier"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid gap-5">
        {/* 1. Therapy area */}
        <section className="grid gap-2">
          <span className="text-label font-extrabold text-ink">Therapy Area</span>
          {fixedArea && area ? (
            <span className="flex items-center gap-2.5">
              <TherapyAreaMark areaId={area.id} className="size-8 rounded-chip" iconClassName="size-4" />
              <b className="text-body-lg text-ink">{area.name}</b>
            </span>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {DISEASE_THERAPY_AREAS.map((a) => {
                const on = a.id === areaId;
                return (
                  <button
                    key={a.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => { setAreaId(a.id); setDisease(undefined); setQuery(""); }}
                    className={cn(
                      "focus-ring inline-flex cursor-pointer items-center gap-1.5 rounded-chip border py-1 pl-1 pr-2.5 text-label font-semibold transition-colors",
                      on ? "border-brand bg-tint text-brand-deep" : "border-hair-2 bg-card text-ink-2 hover:border-hair-3"
                    )}
                  >
                    <TherapyAreaMark areaId={a.id} className="size-5 rounded-full" iconClassName="size-3" />
                    {a.name}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* 2. Disease */}
        {area && (
          <section className="grid gap-2">
            <span className="text-label font-extrabold text-ink">Disease or Condition</span>
            {disease ? (
              <div className="flex items-center gap-3 rounded-panel border border-tint-line bg-tint p-3">
                <TherapyAreaMark areaId={area.id} className="size-9 rounded-chip" iconClassName="size-4" />
                <div className="min-w-0 flex-1">
                  <b className="block text-body text-ink">{disease.label}</b>
                  <span className="block text-label text-ink-3">
                    {existing ? `In the library as v${existing.version}. This adds v${existing.version + 1}, and v${existing.version} is kept.` : area.name}
                  </span>
                </div>
                <button type="button" onClick={() => setDisease(undefined)} className="flex cursor-pointer items-center gap-1 text-label font-bold text-brand hover:underline">
                  <Edit3 className="size-3" />
                  Change
                </button>
              </div>
            ) : (
              <>
                <PickSearch value={query} onChange={setQuery} placeholder={`Search ${area.name.toLowerCase()} conditions…`} autoFocus />
                <PickList>
                  {matches.map((d) => {
                    const had = dossiers.find((x) => x.diseaseId === d.id);
                    return (
                      <PickRow
                        key={d.id}
                        onSelect={() => setDisease({ id: d.id, label: d.label })}
                        thumb={<TherapyAreaMark areaId={area.id} className="size-8 rounded-chip" iconClassName="size-4" />}
                        title={d.label}
                        detail={d.group}
                        chip={had ? <PickChip tone="brand">In Library · v{had.version}</PickChip> : undefined}
                      />
                    );
                  })}
                  {matches.length === 0 && (
                    <PickEmpty title={<>Nothing matching &quot;{query}&quot;</>}>
                      <button
                        type="button"
                        onClick={() => setDisease({ id: `disease-custom-${q.replace(/[^a-z0-9]+/g, "-")}`, label: query.trim() })}
                        className="cursor-pointer font-bold text-brand hover:underline"
                      >
                        Use &quot;{query.trim()}&quot;
                      </button>
                    </PickEmpty>
                  )}
                </PickList>
              </>
            )}
          </section>
        )}

        {/* 3. Upload or make */}
        {disease && (
          <section className="grid gap-2">
            <span className="text-label font-extrabold text-ink">How to Add It</span>
            <div className="grid gap-2 sm:grid-cols-2">
              {([
                { id: "swishx", icon: Sparkles, title: "Make with SwishX", body: "Written from 125+ US medical sources, including CDC, PubMed and ClinicalTrials.gov. Every line is cited." },
                { id: "upload", icon: Upload, title: "Upload Your Own", body: "A PDF or Word dossier you already have. SwishX reads it into the same sections." },
              ] as const).map((o) => {
                const on = origin === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => { setOrigin(o.id); if (o.id === "upload" && !fileName) fileRef.current?.click(); }}
                    className={cn(
                      "focus-ring relative flex cursor-pointer flex-col gap-1 rounded-panel border p-3 text-left transition-colors",
                      on ? "border-brand bg-tint" : "border-hair-2 bg-card hover:border-hair-3"
                    )}
                  >
                    <span className="flex items-center gap-2 text-body font-bold text-ink">
                      <o.icon className="size-4 text-brand" />
                      {o.title}
                    </span>
                    <span className="text-label leading-snug text-ink-3">{o.body}</span>
                    {on && (
                      <span className="absolute right-2.5 top-2.5 grid size-4 place-items-center rounded-full bg-brand text-white">
                        <Check className="size-2.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFileName(f.name); setOrigin("upload"); } e.target.value = ""; }}
            />
            {origin === "upload" && (
              <div className="flex items-center gap-2 rounded-control border border-hair bg-canvas px-3 py-2 text-label">
                <FileText className="size-4 shrink-0 text-ink-4" />
                <span className="min-w-0 flex-1 truncate text-ink-2">{fileName || "No file chosen yet"}</span>
                <button type="button" onClick={() => fileRef.current?.click()} className="cursor-pointer font-bold text-brand hover:underline">
                  {fileName ? "Replace" : "Choose File"}
                </button>
              </div>
            )}
            {origin === "swishx" && (
              <p className="text-caption text-ink-4">Covers {THERAPY_SECTIONS.join(", ")}.</p>
            )}
          </section>
        )}
      </div>
    </Modal>
  );
}
