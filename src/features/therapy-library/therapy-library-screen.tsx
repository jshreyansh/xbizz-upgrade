"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Sparkles, Upload } from "lucide-react";
import { useCan } from "@/features/settings/view-as";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/patterns/page-heading";
import { LibraryTile, TileOpen } from "@/components/patterns/library-tile";
import { PickSearch } from "@/components/patterns/pick-list";
import { DISEASE_THERAPY_AREAS } from "@/features/workspace/ad-options";
import { useTherapyLibraryStore } from "@/features/therapy-library/therapy-library-store";
import { TherapyAreaMark, areaMark } from "@/features/therapy-library/therapy-area-mark";
import { NewTherapyDossierModal } from "@/features/therapy-library/new-therapy-dossier-modal";
import { TherapyDossierReader } from "@/features/therapy-library/therapy-dossier-reader";
import { TherapyDossierRow } from "@/features/therapy-library/therapy-dossier-row";
import { Segmented, SegmentedButton } from "@/components/patterns/segmented";

/**
 * Therapy areas with their disease dossiers, for unbranded and awareness
 * content. The Product Library holds brands; this holds the conditions.
 */
export function TherapyLibraryScreen() {
  const router = useRouter();
  const { can } = useCan();
  const canManage = can("products");
  const dossiers = useTherapyLibraryStore((s) => s.dossiers);
  const images = useTherapyLibraryStore((s) => s.images);
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  /* Browse by therapy area, or straight to the diseases across every area. */
  const [by, setBy] = useState<"areas" | "diseases">("areas");
  const [reading, setReading] = useState<string>();

  /* Only areas with something in them; the pop-up offers every area. */
  const areas = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DISEASE_THERAPY_AREAS
      .map((a) => ({ ...a, dossiers: dossiers.filter((d) => d.areaId === a.id) }))
      .filter((a) => a.dossiers.length > 0 || (images[a.id]?.length ?? 0) > 0)
      .filter((a) => !q || a.name.toLowerCase().includes(q) || a.dossiers.some((d) => d.disease.toLowerCase().includes(q)));
  }, [dossiers, images, query]);
  const empty = dossiers.length === 0;
  const diseases = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dossiers
      .map((d) => ({ d, areaName: DISEASE_THERAPY_AREAS.find((a) => a.id === d.areaId)?.name ?? "" }))
      .filter(({ d, areaName }) => !q || d.disease.toLowerCase().includes(q) || areaName.toLowerCase().includes(q))
      .sort((x, y) => x.d.disease.localeCompare(y.d.disease));
  }, [dossiers, query]);
  const areaCount = DISEASE_THERAPY_AREAS.filter((a) => dossiers.some((d) => d.areaId === a.id) || (images[a.id]?.length ?? 0) > 0).length;

  return (
    <div className="page-enter space-y-6">
      <PageHeading
        title="Therapy Library"
        description="Disease dossiers by therapy area, with their images and brand kits, for unbranded and awareness content."
        actions={canManage && !empty ? <Button onClick={() => setAdding(true)}><Plus className="size-4" />New Therapy Dossier</Button> : undefined}
      />

      {empty ? (
        <div className="flex flex-col items-center gap-4 rounded-card border border-dashed border-hair-2 bg-card px-6 py-14 text-center">
          <div className="flex -space-x-2">
            {["oncology", "cardiology", "neurology", "respiratory"].map((id) => (
              <TherapyAreaMark key={id} areaId={id} className="size-11 rounded-full border-2 border-card" />
            ))}
          </div>
          <div>
            <p className="text-subhead font-bold text-ink">Start with a therapy area</p>
            <p className="mx-auto mt-1 max-w-[52ch] text-body text-ink-3">
              Pick the area and the disease, then upload a dossier you already have or have SwishX make one from cited sources. It stays read-only here, ready to ground unbranded content.
            </p>
          </div>
          {canManage && (
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={() => setAdding(true)}><Sparkles className="size-4" />Make with SwishX</Button>
              <Button variant="secondary" onClick={() => setAdding(true)}><Upload className="size-4" />Upload Your Own</Button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="min-w-[240px] max-w-[420px] flex-1">
              <PickSearch value={query} onChange={setQuery} placeholder={by === "areas" ? "Search therapy areas or diseases…" : "Search diseases…"} />
            </div>
            <Segmented aria-label="Browse by">
              <SegmentedButton active={by === "areas"} onClick={() => setBy("areas")}>
                Therapy Areas <span className="tabular-nums text-ink-4">{areaCount}</span>
              </SegmentedButton>
              <SegmentedButton active={by === "diseases"} onClick={() => setBy("diseases")}>
                Diseases <span className="tabular-nums text-ink-4">{dossiers.length}</span>
              </SegmentedButton>
            </Segmented>
          </div>
          {by === "diseases" ? (
            <div className="flex flex-col gap-2.5">
              {diseases.map(({ d, areaName }) => (
                <TherapyDossierRow key={d.id} dossier={d} areaName={areaName} onOpen={() => setReading(d.id)} />
              ))}
              {diseases.length === 0 && <p className="py-14 text-center text-body text-ink-4">No disease matches &ldquo;{query}&rdquo;.</p>}
            </div>
          ) : (
          <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-[18px]">
            {areas.map((a, i) => (
              <LibraryTile
                key={a.id}
                delayMs={80 + i * 45}
                onClick={() => router.push(`/therapy-library/${a.id}`)}
                media={
                  <div className="relative grid h-[140px] w-full place-items-center overflow-hidden" style={{ background: areaMark(a.id).wash }}>
                    <TherapyAreaMark areaId={a.id} className="size-16 rounded-full bg-card/60" iconClassName="size-8" />
                  </div>
                }
                title={a.name}
                subtitle={a.dossiers.map((d) => d.disease).join(", ") || "No dossiers yet"}
                chips={
                  <>
                    <span className="rounded-chip border border-ok-line bg-ok-bg px-2 py-0.5 text-caption font-bold text-ok">
                      {a.dossiers.length} {a.dossiers.length === 1 ? "dossier" : "dossiers"}
                    </span>
                    <span className="rounded-chip border border-hair bg-subtle px-2 py-0.5 text-caption font-bold text-ink-3">
                      {images[a.id]?.length ?? 0} images
                    </span>
                  </>
                }
                footerLeft={a.dossiers[0] ? `Updated ${a.dossiers[0].updated}` : undefined}
                footerRight={<TileOpen />}
              />
            ))}
          </div>
          {areas.length === 0 && <p className="py-14 text-center text-body text-ink-4">Nothing matches &ldquo;{query}&rdquo;.</p>}
          </>
          )}
        </>
      )}

      <TherapyDossierReader id={reading} onClose={() => setReading(undefined)} canManage={canManage} />
      <NewTherapyDossierModal open={adding} onClose={() => setAdding(false)} onAdded={(id) => { setAdding(false); router.push(`/therapy-library/${id}`); }} />
    </div>
  );
}
