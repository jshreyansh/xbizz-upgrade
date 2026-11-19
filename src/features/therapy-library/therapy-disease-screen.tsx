"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Image as ImageIcon, Lock, Palette, Sparkles, Upload } from "lucide-react";
import { useCan } from "@/features/settings/view-as";
import { Button } from "@/components/ui/button";
import { DetailHeader, type DetailTab } from "@/components/patterns/detail-header";
import { BackLink } from "@/components/patterns/back-link";
import { SectionHeading } from "@/components/patterns/section-heading";
import { Stat } from "@/components/patterns/stat";
import { diseaseArea } from "@/features/workspace/ad-options";
import { useTherapyLibraryStore, type TherapyImage } from "@/features/therapy-library/therapy-library-store";
import { TherapyAreaMark } from "@/features/therapy-library/therapy-area-mark";
import { TherapyDossierBody, originWords, useNewVersion } from "@/features/therapy-library/therapy-dossier-reader";
import { TherapyImages } from "@/features/therapy-library/therapy-images";
import { DiseaseBrandKit } from "@/features/therapy-library/therapy-brand-kit";

type Tab = "dossier" | "images" | "brand-kit";
const EMPTY: TherapyImage[] = [];

/**
 * One disease, laid out like its therapy area: its dossier, its images and
 * its brand kit. What the area holds flows down; the disease adds its own.
 */
export function TherapyDiseaseScreen({ areaId, dossierId }: { areaId: string; dossierId: string }) {
  const router = useRouter();
  const { can } = useCan();
  const canManage = can("products");
  const area = diseaseArea(areaId);
  const dossier = useTherapyLibraryStore((s) => s.dossiers.find((d) => d.id === dossierId));
  const areaImages = useTherapyLibraryStore((s) => s.images[areaId]) ?? EMPTY;
  const [tab, setTab] = useState<Tab>("dossier");
  const { remake, upload, input } = useNewVersion(dossierId);
  const toArea = (t?: string) => router.push(`/therapy-library/${areaId}${t ? `?tab=${t}` : ""}`);

  if (!area || !dossier) {
    return (
      <div className="page-enter flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-title font-bold text-ink">Disease not found</p>
        <BackLink href="/therapy-library">Back to Therapy Library</BackLink>
      </div>
    );
  }

  const making = dossier.status === "making";
  const imageCount = areaImages.filter((i) => !i.dossierId || i.dossierId === dossier.id).length;
  const TABS: DetailTab<Tab>[] = [
    { key: "dossier", label: "Dossier", icon: FileText },
    { key: "images", label: "Images", icon: ImageIcon, count: imageCount },
    ...(can("brand") ? [{ key: "brand-kit" as const, label: "Brand Kit", icon: Palette }] : []),
  ];

  return (
    <div className="page-enter max-w-[980px] space-y-6">
      <BackLink href="/therapy-library" trail={[{ label: area.name, onClick: () => toArea() }]}>Therapy Library</BackLink>

      <DetailHeader tabs={TABS} active={tab} onSelect={setTab}>
        <div className="flex flex-wrap items-center gap-4">
          <TherapyAreaMark areaId={area.id} className="size-12 rounded-control" iconClassName="size-6" />
          <div className="min-w-0 flex-1">
            <h1 className="text-title font-extrabold tracking-tight text-ink">{dossier.disease}</h1>
            <span className="text-body text-ink-3">
              In <button onClick={() => toArea()} className="cursor-pointer font-bold text-brand hover:underline">{area.name}</button>
              {making ? " · Being prepared…" : ` · v${dossier.version} · ${originWords(dossier)} · Updated ${dossier.updated}`}
            </span>
          </div>
          <div className="flex items-center gap-5">
            <Stat value={`v${dossier.version}`} label="Version" />
            <Stat value={dossier.sources} label="Sources" />
            <Stat value={imageCount} label="Images" />
          </div>
        </div>
      </DetailHeader>

      {tab === "dossier" && (
        <div className="space-y-4">
          <SectionHeading
            title="Dossier"
            description={
              <span className="flex items-center gap-1.5">
                <Lock className="size-3.5 shrink-0" />
                Read-only. A new version keeps this one in the history.
              </span>
            }
            actions={canManage && (
              <>
                {input}
                <Button variant="secondary" size="sm" disabled={making} onClick={upload}><Upload className="size-4" />Upload New Version</Button>
                <Button variant="soft" size="sm" disabled={making} onClick={remake}><Sparkles className="size-4" />Make Again with SwishX</Button>
              </>
            )}
          />
          <TherapyDossierBody dossier={dossier} />
        </div>
      )}

      {tab === "images" && <TherapyImages areaId={area.id} areaName={area.name} dossier={dossier} canManage={canManage} />}

      {tab === "brand-kit" && can("brand") && (
        <DiseaseBrandKit areaId={area.id} areaName={area.name} dossier={dossier} readOnly={!can("brandManage")} onOpenArea={() => toArea("brand-kit")} />
      )}
    </div>
  );
}
