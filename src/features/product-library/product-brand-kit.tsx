"use client";

import { useState } from "react";
import type { LibraryProduct } from "@/features/product-library/product-library-types";
import { BrandKitEditor } from "@/features/settings/brand-kit-editor";
import { SaveBar } from "@/features/settings/settings-parts";
import { useSettingsStore } from "@/features/settings/settings-store";
import type { BrandKit, LogoSlot } from "@/features/settings/settings-types";

/** A product's four logos: one per theme, the small mark, and the sting. */
const PRODUCT_SLOTS: LogoSlot[] = ["lockup-light", "lockup-dark", "favicon", "animated"];
const PRODUCT_SLOT_COPY: Partial<Record<LogoSlot, { label?: string; hint?: string }>> = {
  "lockup-light": { label: "Light theme logo", hint: "Documents, leave-behinds, light scenes" },
  "lockup-dark": { label: "Dark theme logo", hint: "Video scenes, dark overlays" },
  favicon: { label: "Favicon / logomark", hint: "Corners, watermarks, shared links" },
  animated: { label: "Animated brand logo", hint: "Intro and outro stings in video" },
};

/**
 * Where a product's kit starts: its own lockups, the workspace typefaces, and
 * a palette led by the colours of its own artwork. The logomark and the
 * animated logo start empty, so the page shows from the first look what a kit
 * with a gap looks like.
 */
function seedKit(product: LibraryProduct, workspace: BrandKit): BrandKit {
  const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const hexes = product.gradient.match(/#[0-9a-f]{6}/gi) ?? [];
  return {
    logos: {
      "lockup-light": { fileName: `${slug}-lockup-light.svg`, size: "22 KB" },
      "lockup-dark": { fileName: `${slug}-lockup-dark.svg`, size: "22 KB" },
    },
    typefaces: workspace.typefaces.map((t) => ({ ...t })),
    colors: {
      ...workspace.colors,
      primary: hexes[0] ?? workspace.colors.primary,
      accent: hexes[1] ?? workspace.colors.accent,
    },
  };
}

/** The Brand Kit tab on a product's page. */
export function ProductBrandKit({ product }: { product: LibraryProduct }) {
  const workspaceKit = useSettingsStore((s) => s.brandKit);
  const [saved, setSaved] = useState<BrandKit>(() => seedKit(product, workspaceKit));
  const [kit, setKit] = useState<BrandKit>(saved);
  const dirty = kit !== saved;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-title font-extrabold tracking-tight text-ink">Product Brand Kit</h2>
        <p className="text-body text-ink-3">
          The logos, typefaces and colours every {product.name} asset is built from. Anything left empty
          uses the workspace brand kit.
        </p>
      </div>

      <BrandKitEditor
        kit={kit}
        onChange={setKit}
        slots={PRODUCT_SLOTS}
        slotCopy={PRODUCT_SLOT_COPY}
        copy={{
          logos: `${product.name}'s logos, each previewed on the ground it is used against.`,
          palette: `Four roles, named for where each colour lands in ${product.name}'s assets. Contrast is checked against both grounds.`,
        }}
      />

      <SaveBar dirty={dirty} onSave={() => setSaved(kit)} onDiscard={() => setKit(saved)} />
    </div>
  );
}
