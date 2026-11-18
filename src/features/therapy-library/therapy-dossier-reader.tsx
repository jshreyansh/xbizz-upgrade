"use client";

import { useRef } from "react";
import { FileText, History, Lock, Sparkles, Upload } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { diseaseArea } from "@/features/workspace/ad-options";
import { THERAPY_SECTIONS, useTherapyLibraryStore, type TherapyVersion } from "@/features/therapy-library/therapy-library-store";

export const originWords = (v: TherapyVersion) => (v.origin === "swishx" ? "Made with SwishX" : `Uploaded${v.fileName ? ` · ${v.fileName}` : ""}`);

/** Starts a new version: uploaded, or made again by SwishX. The current one moves into the history. */
export function useNewVersion(id: string) {
  const dossier = useTherapyLibraryStore((s) => s.dossiers.find((d) => d.id === id));
  const addDossier = useTherapyLibraryStore((s) => s.addDossier);
  const fileRef = useRef<HTMLInputElement>(null);
  const remake = () => dossier && addDossier({ areaId: dossier.areaId, diseaseId: dossier.diseaseId, disease: dossier.disease, origin: "swishx" });
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
export function TherapyDossierReader({ id, onClose, canManage }: { id?: string; onClose: () => void; canManage: boolean }) {
  const dossier = useTherapyLibraryStore((s) => s.dossiers.find((d) => d.id === id));
  const { remake, upload, input } = useNewVersion(id ?? "");
  if (!dossier) return null;
  const area = diseaseArea(dossier.areaId);
  const making = dossier.status === "making";

  return (
    <Modal
      open={!!id}
      onClose={onClose}
      title={`${dossier.disease} Dossier`}
      description={`${area?.name ?? ""} · v${dossier.version} · ${originWords(dossier)} · ${dossier.updated}`}
      size="lg"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-caption text-ink-4">
            <Lock className="size-3.5 shrink-0" />
            Read-only. A new version keeps this one in the history.
          </span>
          {canManage && (
            <div className="flex gap-2">
              {input}
              <Button variant="secondary" size="sm" disabled={making} onClick={upload}><Upload className="size-3.5" />Upload New Version</Button>
              <Button variant="soft" size="sm" disabled={making} onClick={remake}><Sparkles className="size-3.5" />Make Again with SwishX</Button>
            </div>
          )}
        </div>
      }
    >
      <div className="grid gap-5">
        {making ? (
          <div className="rounded-panel border border-tint-line bg-tint px-4 py-6 text-center">
            <p className="text-body font-bold text-brand-deep">
              {dossier.origin === "swishx" ? "SwishX is writing this dossier from cited sources…" : `Reading ${dossier.fileName ?? "your file"}…`}
            </p>
            <p className="mt-1 text-label text-ink-3">It opens here as soon as it is ready.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-label text-ink-3">
              <span><b className="text-ink">{dossier.sections}</b> sections</span>
              <span><b className="text-ink">{dossier.sources}</b> sources cited</span>
              <span>Added by {dossier.by}</span>
            </div>
            <ol className="grid gap-2">
              {THERAPY_SECTIONS.slice(0, dossier.sections).map((s, i) => (
                <li key={s} className="rounded-panel border border-hair bg-card p-3">
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
          </>
        )}

        {dossier.previous.length > 0 && (
          <section className="grid gap-1.5">
            <span className="flex items-center gap-1.5 text-label font-extrabold text-ink"><History className="size-3.5" />Earlier Versions</span>
            {dossier.previous.map((v) => (
              <div key={v.version} className="flex items-center gap-2 rounded-control border border-hair px-3 py-2 text-label text-ink-3">
                <FileText className="size-3.5 shrink-0 text-ink-4" />
                <b className="text-ink-2">v{v.version}</b>
                <span className="min-w-0 flex-1 truncate">{originWords(v)}</span>
                <span className="text-caption text-ink-4">{v.updated}</span>
              </div>
            ))}
          </section>
        )}
      </div>
    </Modal>
  );
}
