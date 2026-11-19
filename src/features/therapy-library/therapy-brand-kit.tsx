"use client";

import { useState } from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/patterns/empty-state";
import { SectionHeading } from "@/components/patterns/section-heading";
import { BrandKitEditor } from "@/features/settings/brand-kit-editor";
import { SaveBar } from "@/features/settings/settings-parts";
import { useSettingsStore } from "@/features/settings/settings-store";
import type { BrandKit } from "@/features/settings/settings-types";
import {
  PRODUCT_COLOR_ROLES, PRODUCT_SLOTS, PRODUCT_SLOT_COPY, PRODUCT_TYPEFACES,
} from "@/features/product-library/product-brand-kit";
import { areaMark } from "@/features/therapy-library/therapy-area-mark";
import { useTherapyLibraryStore, type TherapyDossier } from "@/features/therapy-library/therapy-library-store";

/** An area's kit starts from the workspace's first two typefaces and its own colours, with no logo yet. */
function seedKit(areaId: string, workspace: BrandKit): BrandKit {
  const hexes = areaMark(areaId).wash.match(/#[0-9a-f]{6}/gi) ?? [];
  return {
    logos: {},
    typefaces: workspace.typefaces.slice(0, PRODUCT_TYPEFACES).map((t) => ({ ...t })),
    colors: { ...workspace.colors, primary: hexes[1] ?? workspace.colors.primary, accent: hexes[0] ?? workspace.colors.accent },
  };
}

/** One kit, editable, saved into the library. */
function KitEditor({ kitKey, start, name, readOnly }: { kitKey: string; start: BrandKit; name: string; readOnly: boolean }) {
  const saved = useTherapyLibraryStore((s) => s.kits[kitKey]) ?? start;
  const setKit = useTherapyLibraryStore((s) => s.setKit);
  const [kit, setDraft] = useState<BrandKit>(saved);
  return (
    <>
      <BrandKitEditor
        kit={kit}
        onChange={setDraft}
        slots={PRODUCT_SLOTS}
        slotCopy={PRODUCT_SLOT_COPY}
        maxTypefaces={PRODUCT_TYPEFACES}
        colorRoles={PRODUCT_COLOR_ROLES}
        readOnly={readOnly}
        copy={{
          logos: `The ${name} campaign logo, and two optional versions of it.`,
          typography: "Two roles. First is primary, second secondary.",
          palette: `Two colours, named for where each lands in ${name} assets.`,
        }}
      />
      {!readOnly && <SaveBar dirty={kit !== saved} onSave={() => setKit(kitKey, kit)} onDiscard={() => setDraft(saved)} />}
    </>
  );
}

/** The therapy area's brand kit. Its diseases use it unless one is given its own. */
export function TherapyBrandKit({ areaId, areaName, dossiers, readOnly }: { areaId: string; areaName: string; dossiers: TherapyDossier[]; readOnly: boolean }) {
  const workspaceKit = useSettingsStore((s) => s.brandKit);
  const kits = useTherapyLibraryStore((s) => s.kits);
  const own = dossiers.filter((d) => kits[d.id]).map((d) => d.disease);
  return (
    <div className="space-y-4">
      <SectionHeading
        title="Brand Kit"
        description={
          <>
            The look of {areaName} awareness content. Every disease in it uses this kit unless it has its own; anything empty uses the workspace kit.
            {own.length > 0 && ` ${own.join(", ")} ${own.length === 1 ? "has" : "have"} its own, set on the disease's page.`}
            {readOnly && " View only: changing it comes with Brand Kit: Manage."}
          </>
        }
      />
      <KitEditor key={areaId} kitKey={areaId} start={kits[areaId] ?? seedKit(areaId, workspaceKit)} name={areaName} readOnly={readOnly} />
    </div>
  );
}

/** A disease's brand kit: the area's, until it is given one of its own. */
export function DiseaseBrandKit({ areaId, areaName, dossier, readOnly, onOpenArea }: { areaId: string; areaName: string; dossier: TherapyDossier; readOnly: boolean; onOpenArea: () => void }) {
  const workspaceKit = useSettingsStore((s) => s.brandKit);
  const kits = useTherapyLibraryStore((s) => s.kits);
  const setKit = useTherapyLibraryStore((s) => s.setKit);
  const areaKit = kits[areaId] ?? seedKit(areaId, workspaceKit);
  const ownKit = kits[dossier.id];

  return (
    <div className="space-y-4">
      <SectionHeading
        title="Brand Kit"
        description={
          <>
            {ownKit ? `${dossier.disease} has a look of its own.` : `${dossier.disease} uses the ${areaName} kit.`} Anything empty uses the workspace kit.
            {readOnly && " View only: changing it comes with Brand Kit: Manage."}
          </>
        }
      />
      {ownKit ? (
        <>
          {!readOnly && (
            <div className="flex items-center justify-between gap-3 rounded-panel border border-hair bg-canvas px-3.5 py-2.5 text-label text-ink-3">
              <span>{dossier.disease} has its own kit.</span>
              <Button variant="ghost" size="sm" onClick={() => setKit(dossier.id, undefined)}>Use the {areaName} Kit Again</Button>
            </div>
          )}
          <KitEditor key={dossier.id} kitKey={dossier.id} start={ownKit} name={dossier.disease} readOnly={readOnly} />
        </>
      ) : (
        <EmptyState
          tone="card"
          icon={<Palette className="size-5" />}
          title={`${dossier.disease} uses the ${areaName} kit`}
          hint="Give it its own when its campaign has a different look."
          action={
            <>
              <Button variant="secondary" size="sm" onClick={onOpenArea}>See the {areaName} Kit</Button>
              {!readOnly && (
                <Button variant="soft" size="sm" onClick={() => setKit(dossier.id, { ...areaKit, logos: { ...areaKit.logos } })}>
                  Give {dossier.disease} Its Own Kit
                </Button>
              )}
            </>
          }
        />
      )}
    </div>
  );
}
