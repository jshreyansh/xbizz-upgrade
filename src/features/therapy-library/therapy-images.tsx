"use client";

import { useRef } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/patterns/empty-state";
import { SectionHeading } from "@/components/patterns/section-heading";
import { useTherapyLibraryStore, type TherapyDossier, type TherapyImage } from "@/features/therapy-library/therapy-library-store";

const EMPTY: TherapyImage[] = [];

/**
 * A therapy area's images, or one disease's. The area's own images flow down
 * to every disease in it; a disease adds images of its own on top.
 */
export function TherapyImages({
  areaId, areaName, dossier, dossiers, canManage,
}: {
  areaId: string;
  areaName: string;
  /** Set on a disease page: its own images first, then the area's. */
  dossier?: TherapyDossier;
  /** On the area page, to name the disease an image belongs to. */
  dossiers?: TherapyDossier[];
  canManage: boolean;
}) {
  const all = useTherapyLibraryStore((s) => s.images[areaId]) ?? EMPTY;
  const addImages = useTherapyLibraryStore((s) => s.addImages);
  const removeImage = useTherapyLibraryStore((s) => s.removeImage);
  const fileRef = useRef<HTMLInputElement>(null);

  const images = dossier
    ? [...all.filter((i) => i.dossierId === dossier.id), ...all.filter((i) => !i.dossierId)]
    : all;
  const tagFor = (img: TherapyImage) =>
    dossier
      ? img.dossierId ? undefined : `From ${areaName}`
      : img.dossierId ? dossiers?.find((d) => d.id === img.dossierId)?.disease : undefined;

  return (
    <div className="space-y-4">
      <SectionHeading
        title="Images"
        description={dossier
          ? `${dossier.disease}'s own imagery, plus everything in ${areaName}, which every disease in it can use.`
          : `Imagery for ${areaName} awareness content. Images without a disease are shared with every disease in ${areaName}.`}
        actions={canManage && <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()}><Upload className="size-4" />Upload Images</Button>}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) addImages(areaId, files.map((f, i) => ({ id: `ti-${Date.now()}-${i}`, name: f.name, url: URL.createObjectURL(f), dossierId: dossier?.id })));
          e.target.value = "";
        }}
      />
      {images.length === 0 ? (
        <EmptyState tone="card" title="No images yet" hint="Campaign photography, illustrations and patient imagery with consent." />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
          {images.map((img) => {
            const tag = tagFor(img);
            /* On a disease page, the area's images are removed from the area, not here. */
            const removable = canManage && (!dossier || img.dossierId === dossier.id);
            return (
              <figure key={img.id} className="group relative overflow-hidden rounded-panel border border-hair bg-card">
                {img.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img.url} alt="" className="aspect-[4/3] w-full object-cover" />
                ) : (
                  <span aria-hidden className="block aspect-[4/3] w-full" style={{ background: img.gradient }} />
                )}
                {tag && (
                  <span className="absolute left-1.5 top-1.5 rounded-chip bg-card/90 px-2 py-0.5 text-caption font-bold text-ink-2 shadow-hair">{tag}</span>
                )}
                <figcaption className="px-2.5 py-2">
                  <span className="block truncate text-label font-bold text-ink">{img.name}</span>
                  {img.note && <span className="block truncate text-caption text-ink-4">{img.note}</span>}
                </figcaption>
                {removable && (
                  <button
                    type="button"
                    aria-label={`Remove ${img.name}`}
                    onClick={() => removeImage(areaId, img.id)}
                    className="absolute right-1.5 top-1.5 grid size-6 cursor-pointer place-items-center rounded-full bg-card text-ink-3 opacity-0 shadow-soft transition-opacity hover:text-ink group-hover:opacity-100"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </figure>
            );
          })}
        </div>
      )}
    </div>
  );
}
