"use client";

import { useState } from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Segmented, SegmentedButton } from "@/components/patterns/segmented";
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

/**
 * The therapy area's brand kit, for unbranded and awareness campaigns that
 * have a look of their own. A disease uses the area's kit unless it is given
 * its own. Anything left empty falls back to the workspace kit.
 */
export function TherapyBrandKit({ areaId, areaName, dossiers, readOnly }: { areaId: string; areaName: string; dossiers: TherapyDossier[]; readOnly: boolean }) {
  const workspaceKit = useSettingsStore((s) => s.brandKit);
  const kits = useTherapyLibraryStore((s) => s.kits);
  const setKit = useTherapyLibraryStore((s) => s.setKit);
  const [scope, setScope] = useState(areaId);
  const dossier = dossiers.find((d) => d.id === scope);
  const areaKit = kits[areaId] ?? seedKit(areaId, workspaceKit);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-title font-extrabold tracking-tight text-ink">Brand Kit</h2>
          <p className="text-body text-ink-3">
            The look of {areaName} awareness content. Each disease uses it unless it has its own; anything empty uses the workspace kit.
            {readOnly && " View only: changing it comes with Brand kit: Manage."}
          </p>
        </div>
        {dossiers.length > 0 && (
          <Segmented aria-label="Whose kit">
            <SegmentedButton active={scope === areaId} onClick={() => setScope(areaId)}>{areaName}</SegmentedButton>
            {dossiers.map((d) => (
              <SegmentedButton key={d.id} active={scope === d.id} onClick={() => setScope(d.id)}>{d.disease}</SegmentedButton>
            ))}
          </Segmented>
        )}
      </div>

      {!dossier ? (
        <KitEditor key={areaId} kitKey={areaId} start={areaKit} name={areaName} readOnly={readOnly} />
      ) : kits[dossier.id] ? (
        <>
          {!readOnly && (
            <div className="flex items-center justify-between gap-3 rounded-panel border border-hair bg-canvas px-3.5 py-2.5 text-label text-ink-3">
              <span>{dossier.disease} has its own kit.</span>
              <Button variant="ghost" size="sm" onClick={() => setKit(dossier.id, undefined)}>Use the {areaName} Kit Again</Button>
            </div>
          )}
          <KitEditor key={dossier.id} kitKey={dossier.id} start={kits[dossier.id]} name={dossier.disease} readOnly={readOnly} />
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-panel border border-dashed border-hair-2 bg-card px-4 py-10 text-center">
          <Palette className="size-6 text-ink-4" />
          <div>
            <p className="text-body font-bold text-ink-2">{dossier.disease} uses the {areaName} kit</p>
            <p className="mt-0.5 text-label text-ink-4">Give it its own when its campaign has a different look.</p>
          </div>
          {!readOnly && (
            <Button variant="soft" size="sm" onClick={() => setKit(dossier.id, { ...areaKit, logos: { ...areaKit.logos } })}>
              Give {dossier.disease} Its Own Kit
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
