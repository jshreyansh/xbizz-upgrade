"use client";

import { useEffect, useRef, useState } from "react";
import { Check, FileText, History, Loader2, Paperclip, Target } from "lucide-react";
import { THERAPY_SECTIONS, useTherapyLibraryStore, type TherapyDossier, type TherapyVersion } from "@/features/therapy-library/therapy-library-store";

export const originWords = (v: TherapyVersion) => (v.origin === "swishx" ? "Made with SwishX" : `Uploaded${v.fileName ? ` · ${v.fileName}` : ""}`);

/** Starts a new version: uploaded, or made again by SwishX. The current one moves into the history. */
export function useNewVersion(id: string) {
  const dossier = useTherapyLibraryStore((s) => s.dossiers.find((d) => d.id === id));
  const addDossier = useTherapyLibraryStore((s) => s.addDossier);
  const fileRef = useRef<HTMLInputElement>(null);
  const remake = () => dossier && addDossier({ areaId: dossier.areaId, diseaseId: dossier.diseaseId, disease: dossier.disease, origin: "swishx", brief: dossier.brief, materials: dossier.materials });
  const input = (
    <input
      ref={fileRef}
      type="file"
      accept=".pdf,.doc,.docx"
      className="hidden"
      onChange={(e) => {
        const f = e.target.files?.[0];
        if (f && dossier) addDossier({ areaId: dossier.areaId, diseaseId: dossier.diseaseId, disease: dossier.disease, origin: "upload", fileName: f.name });
        e.target.value = "";
      }}
    />
  );
  return { remake, upload: () => fileRef.current?.click(), input };
}

/**
 * A therapy dossier, to read and cite from, never to edit. The sections are
 * placeholders in this prototype: real content comes from the sources or the file.
 */
export function TherapyDossierBody({ dossier }: { dossier: TherapyDossier }) {
  if (dossier.status === "making") return <BuildProgress dossier={dossier} />;
  return (
    <div className="grid gap-5">
      <BriefCard dossier={dossier} />
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-label text-ink-3">
        <span><b className="text-ink">{dossier.sections}</b> sections</span>
        <span><b className="text-ink">{dossier.sources}</b> sources cited</span>
        <span>Added by {dossier.by}</span>
      </div>
      <ol className="grid gap-2">
        {THERAPY_SECTIONS.slice(0, dossier.sections).map((s, i) => (
          <li key={s} className="rounded-panel border border-hair bg-card p-3.5">
            <div className="flex items-baseline gap-2">
              <span className="text-caption font-bold tabular-nums text-ink-4">{i + 1}</span>
              <b className="text-body text-ink">{s}</b>
              <span className="ml-auto rounded-chip bg-subtle px-2 py-0.5 text-micro font-bold text-ink-4">Sample</span>
            </div>
            <p className="mt-1 text-label leading-relaxed text-ink-3">
              {dossier.origin === "swishx"
                ? `${s} for ${dossier.disease}, written from cited sources. Each statement links to its source.`
                : `${s} for ${dossier.disease}, as read from ${dossier.fileName ?? "the uploaded file"}.`}
            </p>
          </li>
        ))}
      </ol>
      {dossier.previous.length > 0 && (
        <section className="grid gap-1.5">
          <span className="flex items-center gap-1.5 text-label font-extrabold text-ink"><History className="size-3.5" />Earlier Versions</span>
          {dossier.previous.map((v) => (
            <div key={v.version} className="flex items-center gap-2 rounded-control border border-hair bg-card px-3 py-2 text-label text-ink-3">
              <FileText className="size-3.5 shrink-0 text-ink-4" />
              <b className="text-ink-2">v{v.version}</b>
              <span className="min-w-0 flex-1 truncate">{originWords(v)}</span>
              <span className="text-caption text-ink-4">{v.updated}</span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

/** What it was asked for and what it was given, so a reader knows what it was built to do. */
function BriefCard({ dossier }: { dossier: TherapyDossier }) {
  if (!dossier.brief && !dossier.materials?.length) return null;
  return (
    <div className="grid gap-2 rounded-panel border border-hair bg-canvas p-3.5">
      {dossier.brief && (
        <p className="flex gap-2 text-label text-ink-2">
          <Target className="mt-0.5 size-3.5 shrink-0 text-brand" />
          <span><b className="text-ink">Built for:</b> {dossier.brief}</span>
        </p>
      )}
      {!!dossier.materials?.length && (
        <div className="flex flex-wrap items-center gap-1.5 text-caption text-ink-3">
          <Paperclip className="size-3.5 shrink-0 text-ink-4" />
          <span>From your materials:</span>
          {dossier.materials.map((m) => (
            <span key={m} className="rounded-chip border border-hair bg-card px-2 py-0.5">{m}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/** Steps a build goes through. Prototype: they advance on a timer, not on real work. */
function buildSteps(d: TherapyDossier) {
  if (d.origin === "upload") {
    return [`Reading ${d.fileName ?? "your file"}`, "Sorting it into the six sections", "Matching every statement to its source", "Getting it ready to use"];
  }
  return [
    ...(d.materials?.length ? [`Reading your ${d.materials.length === 1 ? "material" : `${d.materials.length} materials`}`] : []),
    "Searching CDC, PubMed and ClinicalTrials.gov",
    `Writing the six sections for ${d.disease}`,
    "Checking every citation",
    "Getting it ready to use",
  ];
}

/** The dossier while it is being built: where it is, and that it opens here when done. */
function BuildProgress({ dossier }: { dossier: TherapyDossier }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);
  const steps = buildSteps(dossier);
  const total = dossier.buildMs ?? 6000;
  const done = Math.min(0.97, Math.max(0, (now - (dossier.startedAt ?? now)) / total));
  const current = Math.min(steps.length - 1, Math.floor(done * steps.length));

  return (
    <div className="grid gap-4 rounded-panel border border-tint-line bg-tint p-5">
      <div className="grid gap-1">
        <p className="text-body-lg font-bold text-brand-deep">
          {dossier.origin === "swishx" ? `SwishX is building the ${dossier.disease} dossier` : `Adding your ${dossier.disease} dossier`}
        </p>
        <p className="text-label text-ink-3">It opens here as soon as it is ready. You can leave this page; it keeps going.</p>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-card">
        <div className="h-full rounded-full bg-brand transition-[width] duration-300 ease-swish" style={{ width: `${Math.round(done * 100)}%` }} />
      </div>
      <ol className="grid gap-2">
        {steps.map((s, i) => (
          <li key={s} className={i > current ? "flex items-center gap-2 text-label text-ink-4" : "flex items-center gap-2 text-label text-ink-2"}>
            {i < current ? (
              <span className="grid size-4 place-items-center rounded-full bg-brand text-white"><Check className="size-2.5 stroke-[3]" /></span>
            ) : i === current ? (
              <Loader2 className="size-4 animate-spin text-brand" />
            ) : (
              <span className="size-4 rounded-full border border-hair-2 bg-card" />
            )}
            <span className={i === current ? "font-bold text-ink" : undefined}>{s}</span>
          </li>
        ))}
      </ol>
      <BriefCard dossier={dossier} />
    </div>
  );
}
