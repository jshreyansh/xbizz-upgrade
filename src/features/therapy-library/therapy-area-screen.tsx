"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Image as ImageIcon, Palette, Plus } from "lucide-react";
import { useCan } from "@/features/settings/view-as";
import { Button } from "@/components/ui/button";
import { DetailHeader, type DetailTab } from "@/components/patterns/detail-header";
import { BackLink } from "@/components/patterns/back-link";
import { EmptyState } from "@/components/patterns/empty-state";
import { SectionHeading } from "@/components/patterns/section-heading";
import { Stat } from "@/components/patterns/stat";
import { diseaseArea } from "@/features/workspace/ad-options";
import { useTherapyLibraryStore, type TherapyImage } from "@/features/therapy-library/therapy-library-store";
import { TherapyAreaMark } from "@/features/therapy-library/therapy-area-mark";
import { NewTherapyDossierModal } from "@/features/therapy-library/new-therapy-dossier-modal";
import { TherapyImages } from "@/features/therapy-library/therapy-images";
import { TherapyDossierRow } from "@/features/therapy-library/therapy-dossier-row";
import { TherapyBrandKit } from "@/features/therapy-library/therapy-brand-kit";

type Tab = "dossiers" | "images" | "brand-kit";

const EMPTY: TherapyImage[] = [];

/** One therapy area: its disease dossiers, its images and its brand kit. */
export function TherapyAreaScreen({ areaId, initialTab }: { areaId: string; initialTab?: string }) {
  const router = useRouter();
  const { can } = useCan();
  const canManage = can("products");
  const canSeeKit = can("brand");
  const area = diseaseArea(areaId);
  const all = useTherapyLibraryStore((s) => s.dossiers);
  const dossiers = all.filter((d) => d.areaId === areaId);
  const images = useTherapyLibraryStore((s) => s.images[areaId]) ?? EMPTY;
  const [tab, setTab] = useState<Tab>(initialTab === "images" || initialTab === "brand-kit" ? initialTab : "dossiers");
  const [adding, setAdding] = useState(false);
  const openDisease = (id: string) => router.push(`/therapy-library/${areaId}?disease=${id}`);

  if (!area) {
    return (
      <div className="page-enter flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-title font-bold text-ink">Therapy area not found</p>
        <BackLink href="/therapy-library">Back to Therapy Library</BackLink>
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
      <BackLink href="/therapy-library">Therapy Library</BackLink>

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
          <SectionHeading
            title="Dossiers"
            description="One per disease. Read-only: a change comes in as a new version and the old one is kept."
            actions={canManage && <Button size="sm" onClick={() => setAdding(true)}><Plus className="size-4" />Add Dossier</Button>}
          />
          {dossiers.length === 0 ? (
            <EmptyState tone="card" title={`No dossiers in ${area.name} yet`} hint="Upload your own, or have SwishX make one from cited sources." />
          ) : (
            <div className="flex flex-col gap-2.5">
              {dossiers.map((d) => <TherapyDossierRow key={d.id} dossier={d} onOpen={() => openDisease(d.id)} />)}
            </div>
          )}
        </div>
      )}

      {tab === "images" && <TherapyImages areaId={area.id} areaName={area.name} dossiers={dossiers} canManage={canManage} />}

      {tab === "brand-kit" && canSeeKit && (
        <TherapyBrandKit areaId={area.id} areaName={area.name} dossiers={dossiers.filter((d) => d.status === "ready")} readOnly={!can("brandManage")} />
      )}

      <NewTherapyDossierModal open={adding} onClose={() => setAdding(false)} onAdded={() => setAdding(false)} areaId={area.id} />
    </div>
  );
}
