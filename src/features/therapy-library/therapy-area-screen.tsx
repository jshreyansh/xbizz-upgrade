"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, FileText, Image as ImageIcon, Palette, Plus, Upload, X } from "lucide-react";
import { useCan } from "@/features/settings/view-as";
import { Button } from "@/components/ui/button";
import { DetailHeader, type DetailTab } from "@/components/patterns/detail-header";
import { diseaseArea } from "@/features/workspace/ad-options";
import { useTherapyLibraryStore, type TherapyImage } from "@/features/therapy-library/therapy-library-store";
import { TherapyAreaMark } from "@/features/therapy-library/therapy-area-mark";
import { NewTherapyDossierModal } from "@/features/therapy-library/new-therapy-dossier-modal";
import { TherapyDossierReader } from "@/features/therapy-library/therapy-dossier-reader";
import { TherapyDossierRow } from "@/features/therapy-library/therapy-dossier-row";
import { TherapyBrandKit } from "@/features/therapy-library/therapy-brand-kit";

type Tab = "dossiers" | "images" | "brand-kit";

const EMPTY: TherapyImage[] = [];

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <b className="block text-title font-extrabold tabular-nums text-ink">{value}</b>
      <span className="text-caption text-ink-4">{label}</span>
    </div>
  );
}

/** One therapy area: its disease dossiers, its images and its brand kit. */
export function TherapyAreaScreen({ areaId }: { areaId: string }) {
  const router = useRouter();
  const { can } = useCan();
  const canManage = can("products");
  const canSeeKit = can("brand");
  const area = diseaseArea(areaId);
  const all = useTherapyLibraryStore((s) => s.dossiers);
  const dossiers = all.filter((d) => d.areaId === areaId);
  const images = useTherapyLibraryStore((s) => s.images[areaId]) ?? EMPTY;
  const addImages = useTherapyLibraryStore((s) => s.addImages);
  const removeImage = useTherapyLibraryStore((s) => s.removeImage);
  const [tab, setTab] = useState<Tab>("dossiers");
  const [adding, setAdding] = useState(false);
  const [reading, setReading] = useState<string>();
  const imageRef = useRef<HTMLInputElement>(null);

  if (!area) {
    return (
      <div className="page-enter flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-title font-bold text-ink">Therapy area not found</p>
        <button onClick={() => router.push("/therapy-library")} className="inline-flex items-center gap-1.5 text-body-lg font-bold text-brand hover:text-brand-deep">
          <ChevronLeft size={15} /> Back to Therapy Library
        </button>
      </div>
    );
  }

  const TABS: DetailTab<Tab>[] = [
    { key: "dossiers", label: "Dossiers", icon: FileText, count: dossiers.length },
    { key: "images", label: "Images", icon: ImageIcon, count: images.length },
    ...(canSeeKit ? [{ key: "brand-kit" as const, label: "Brand Kit", icon: Palette }] : []),
  ];

  return (
    <div className="page-enter max-w-[980px] space-y-6">
      <button onClick={() => router.push("/therapy-library")} className="inline-flex items-center gap-1.5 text-body-lg font-bold text-ink-3 transition-colors hover:text-ink">
        <ChevronLeft size={15} />
        Therapy Library
      </button>

      <DetailHeader tabs={TABS} active={tab} onSelect={setTab}>
        <div className="flex flex-wrap items-center gap-4">
          <TherapyAreaMark areaId={area.id} className="size-12 rounded-control" iconClassName="size-6" />
          <div className="min-w-0 flex-1">
            <h1 className="text-title font-extrabold tracking-tight text-ink">{area.name}</h1>
            <span className="text-body text-ink-3">{area.groups.join(" · ")}</span>
          </div>
          <div className="flex items-center gap-5">
            <Stat value={dossiers.length} label="Dossiers" />
            <Stat value={dossiers.reduce((n, d) => n + d.sources, 0)} label="Sources" />
            <Stat value={images.length} label="Images" />
          </div>
        </div>
      </DetailHeader>

      {tab === "dossiers" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-title font-extrabold tracking-tight text-ink">Dossiers</h2>
              <p className="text-body text-ink-3">One per disease. Read-only: a change comes in as a new version and the old one is kept.</p>
            </div>
            {canManage && <Button size="sm" onClick={() => setAdding(true)}><Plus className="size-4" />Add Dossier</Button>}
          </div>
          {dossiers.length === 0 ? (
            <div className="rounded-panel border border-dashed border-hair-2 bg-card px-4 py-10 text-center">
              <p className="text-body font-bold text-ink-2">No dossiers in {area.name} yet</p>
              <p className="mt-0.5 text-label text-ink-4">Upload your own, or have SwishX make one from cited sources.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {dossiers.map((d) => <TherapyDossierRow key={d.id} dossier={d} onOpen={() => setReading(d.id)} />)}
            </div>
          )}
        </div>
      )}

      {tab === "images" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-title font-extrabold tracking-tight text-ink">Images</h2>
              <p className="text-body text-ink-3">Approved imagery for {area.name} awareness content, used across its dossiers&apos; assets.</p>
            </div>
            {canManage && <Button size="sm" variant="secondary" onClick={() => imageRef.current?.click()}><Upload className="size-4" />Upload Images</Button>}
            <input
              ref={imageRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                if (files.length) addImages(area.id, files.map((f, i) => ({ id: `ti-${Date.now()}-${i}`, name: f.name, url: URL.createObjectURL(f) })));
                e.target.value = "";
              }}
            />
          </div>
          {images.length === 0 ? (
            <div className="rounded-panel border border-dashed border-hair-2 bg-card px-4 py-10 text-center">
              <p className="text-body font-bold text-ink-2">No images yet</p>
              <p className="mt-0.5 text-label text-ink-4">Campaign photography, illustrations and patient imagery with consent.</p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
              {images.map((img) => (
                <figure key={img.id} className="group relative overflow-hidden rounded-panel border border-hair bg-card">
                  {img.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img.url} alt="" className="aspect-[4/3] w-full object-cover" />
                  ) : (
                    <span aria-hidden className="block aspect-[4/3] w-full" style={{ background: img.gradient }} />
                  )}
                  <figcaption className="px-2.5 py-2">
                    <span className="block truncate text-label font-bold text-ink">{img.name}</span>
                    {img.note && <span className="block truncate text-caption text-ink-4">{img.note}</span>}
                  </figcaption>
                  {canManage && (
                    <button
                      type="button"
                      aria-label={`Remove ${img.name}`}
                      onClick={() => removeImage(area.id, img.id)}
                      className="absolute right-1.5 top-1.5 grid size-6 cursor-pointer place-items-center rounded-full bg-card text-ink-3 opacity-0 shadow-soft transition-opacity hover:text-ink group-hover:opacity-100"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </figure>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "brand-kit" && canSeeKit && (
        <TherapyBrandKit areaId={area.id} areaName={area.name} dossiers={dossiers.filter((d) => d.status === "ready")} readOnly={!can("brandManage")} />
      )}

      <NewTherapyDossierModal open={adding} onClose={() => setAdding(false)} onAdded={() => setAdding(false)} areaId={area.id} />
      <TherapyDossierReader id={reading} onClose={() => setReading(undefined)} canManage={canManage} />
    </div>
  );
}
