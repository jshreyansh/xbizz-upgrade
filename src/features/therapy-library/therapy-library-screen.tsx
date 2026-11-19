"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Grid3x3, List, Plus, Sparkles, Upload } from "lucide-react";
import { useCan } from "@/features/settings/view-as";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { PageHeading } from "@/components/patterns/page-heading";
import { LibraryTile, TileOpen } from "@/components/patterns/library-tile";
import { PickSearch } from "@/components/patterns/pick-list";
import { Segmented, SegmentedButton } from "@/components/patterns/segmented";
import { DataList } from "@/components/patterns/data-list";
import { DISEASE_THERAPY_AREAS } from "@/features/workspace/ad-options";
import { useTherapyLibraryStore } from "@/features/therapy-library/therapy-library-store";
import { TherapyAreaMark, areaMark } from "@/features/therapy-library/therapy-area-mark";
import { NewTherapyDossierModal } from "@/features/therapy-library/new-therapy-dossier-modal";

type Kind = "all" | "area" | "disease";

/** One row of the library: a therapy area, or a disease in one. */
interface Item {
  key: string;
  kind: "area" | "disease";
  areaId: string;
  name: string;
  /** For an area, its diseases; for a disease, its area. */
  detail: string;
  version?: number;
  making?: boolean;
  dossiers: number;
  sources: number;
  images: number;
  updated?: string;
  href: string;
}

const KIND_LABEL = { area: "Therapy Area", disease: "Disease" } as const;

/**
 * Therapy areas and their disease dossiers, for unbranded and awareness
 * content. The Product Library holds brands; this holds the conditions.
 * Laid out like the Product Library: a filter, then grid or list.
 */
export function TherapyLibraryScreen() {
  const router = useRouter();
  const { can } = useCan();
  const canManage = can("products");
  const dossiers = useTherapyLibraryStore((s) => s.dossiers);
  const images = useTherapyLibraryStore((s) => s.images);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<Kind>("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [adding, setAdding] = useState(false);

  const items = useMemo(() => {
    const areas: Item[] = DISEASE_THERAPY_AREAS
      .map((a) => {
        const own = dossiers.filter((d) => d.areaId === a.id);
        return {
          key: a.id,
          kind: "area" as const,
          areaId: a.id,
          name: a.name,
          detail: own.map((d) => d.disease).join(", ") || "No dossiers yet",
          dossiers: own.length,
          sources: own.reduce((n, d) => n + d.sources, 0),
          images: images[a.id]?.length ?? 0,
          updated: own[0]?.updated,
          href: `/therapy-library/${a.id}`,
        };
      })
      .filter((a) => a.dossiers > 0 || a.images > 0);
    const diseases: Item[] = dossiers
      .map((d) => ({
        key: d.id,
        kind: "disease" as const,
        areaId: d.areaId,
        name: d.disease,
        detail: DISEASE_THERAPY_AREAS.find((a) => a.id === d.areaId)?.name ?? "",
        version: d.version,
        making: d.status === "making",
        dossiers: 1,
        sources: d.sources,
        /* Its own images plus the area's, which every disease in it can use. */
        images: (images[d.areaId] ?? []).filter((i) => !i.dossierId || i.dossierId === d.id).length,
        updated: d.updated,
        href: `/therapy-library/${d.areaId}?disease=${d.id}`,
      }))
      .sort((x, y) => x.name.localeCompare(y.name));
    return { areas, diseases };
  }, [dossiers, images]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = kind === "area" ? items.areas : kind === "disease" ? items.diseases : [...items.areas, ...items.diseases];
    return pool.filter((i) => !q || i.name.toLowerCase().includes(q) || i.detail.toLowerCase().includes(q));
  }, [items, kind, query]);
  const empty = dossiers.length === 0;

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
              <PickSearch value={query} onChange={setQuery} placeholder="Search therapy areas or diseases…" />
            </div>
            <Segmented aria-label="Therapy areas or diseases">
              {([
                ["all", "All", items.areas.length + items.diseases.length],
                ["area", "Therapy Areas", items.areas.length],
                ["disease", "Diseases", items.diseases.length],
              ] as const).map(([k, label, n]) => (
                <SegmentedButton key={k} active={kind === k} onClick={() => setKind(k)}>
                  {label}
                  <span className="tabular-nums text-ink-4">{n}</span>
                </SegmentedButton>
              ))}
            </Segmented>
            <Segmented aria-label="Grid or list">
              {(["grid", "list"] as const).map((v) => (
                <SegmentedButton key={v} active={view === v} onClick={() => setView(v)}>
                  {v === "grid" ? <Grid3x3 size={13} /> : <List size={13} />}
                  {v === "grid" ? "Grid" : "List"}
                </SegmentedButton>
              ))}
            </Segmented>
          </div>

          {view === "grid" ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-[18px]">
              {shown.map((it, i) => (
                <LibraryTile
                  key={it.key}
                  delayMs={80 + i * 45}
                  onClick={() => router.push(it.href)}
                  media={
                    <div className="relative grid h-[140px] w-full place-items-center overflow-hidden" style={{ background: areaMark(it.areaId).wash }}>
                      <TherapyAreaMark areaId={it.areaId} className="size-16 rounded-full bg-card/60" iconClassName="size-8" />
                    </div>
                  }
                  mediaTopLeft={
                    <span className="rounded-chip bg-black/45 px-2 py-0.5 text-micro font-extrabold uppercase tracking-[.04em] text-white/90">
                      {KIND_LABEL[it.kind]}
                    </span>
                  }
                  title={it.name}
                  subtitle={it.kind === "disease" ? `In ${it.detail}` : it.detail}
                  chips={
                    <>
                      <Chip tone={it.making ? "brand" : "ok"} weight="bold">
                        {it.kind === "disease" ? (it.making ? "Being prepared" : `v${it.version} · ${it.sources} sources`) : `${it.dossiers} ${it.dossiers === 1 ? "disease" : "diseases"}`}
                      </Chip>
                      <Chip tone="neutral" weight="bold">{it.images} images</Chip>
                    </>
                  }
                  footerLeft={it.updated ? `Updated ${it.updated}` : undefined}
                  footerRight={<TileOpen />}
                />
              ))}
            </div>
          ) : (
            <DataList
              rows={shown}
              rowKey={(it) => it.key}
              onRowClick={(it) => router.push(it.href)}
              emptyLabel={`Nothing matches “${query}”.`}
              columns={[
                {
                  id: "name",
                  header: "Name",
                  minWidth: 260,
                  cell: (it) => (
                    <div className="flex min-w-0 items-center gap-3">
                      <TherapyAreaMark areaId={it.areaId} className="size-10 shrink-0 rounded-chip" iconClassName="size-5" />
                      <span className="min-w-0">
                        <span className="block truncate text-body font-bold text-ink">{it.name}</span>
                        <span className="block truncate text-caption text-ink-3">{it.kind === "disease" ? `In ${it.detail}` : it.detail}</span>
                      </span>
                    </div>
                  ),
                },
                {
                  id: "type",
                  header: "Type",
                  width: 130,
                  cell: (it) => (
                    <Chip tone="neutral" weight="bold" className="uppercase tracking-[.03em]">{KIND_LABEL[it.kind]}</Chip>
                  ),
                },
                {
                  id: "dossier",
                  header: "Dossier",
                  width: 130,
                  cell: (it) => (
                    <span className="text-body font-bold tabular-nums text-ink-2">
                      {it.kind === "disease" ? (it.making ? "Being prepared" : `v${it.version}`) : `${it.dossiers} ${it.dossiers === 1 ? "disease" : "diseases"}`}
                    </span>
                  ),
                },
                { id: "sources", header: "Sources", width: 90, cell: (it) => <span className="text-body font-bold tabular-nums text-ink-2">{it.sources}</span> },
                { id: "images", header: "Images", width: 90, cell: (it) => <span className="text-body font-bold tabular-nums text-ink-2">{it.images}</span> },
                { id: "updated", header: "Updated", width: 130, cell: (it) => <span className="truncate text-caption text-ink-4">{it.updated ?? "—"}</span> },
                { id: "open", header: "", width: 80, align: "right", hideHeader: true, cell: () => <span className="text-label font-bold text-brand">Open →</span> },
              ]}
            />
          )}
          {view === "grid" && shown.length === 0 && <p className="py-14 text-center text-body text-ink-4">Nothing matches &ldquo;{query}&rdquo;.</p>}
        </>
      )}

      <NewTherapyDossierModal open={adding} onClose={() => setAdding(false)} onAdded={(id) => { setAdding(false); router.push(`/therapy-library/${id}`); }} />
    </div>
  );
}
