"use client";

import { useState } from "react";
import type { LibraryProduct } from "@/features/product-library/product-library-types";
import { BrandKitEditor } from "@/features/settings/brand-kit-editor";
import { SaveBar } from "@/features/settings/settings-parts";
import { useSettingsStore } from "@/features/settings/settings-store";
import type { BrandKit, LogoSlot } from "@/features/settings/settings-types";

/**
 * A product's own slots. The animated sting and the favicon belong to the
 * company, not to one brand, so they stay on the workspace kit.
 */
const PRODUCT_SLOTS: LogoSlot[] = ["lockup-light", "lockup-dark", "mark-light", "mark-dark"];

/**
 * Where a product's kit starts: its own lockups, the workspace typefaces, and
 * a palette led by the colours of its own artwork. The marks start empty, so
 * the page shows from the first look what a kit with a gap looks like.
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
        copy={{
          logos: `${product.name}'s own lockup and mark, each previewed on the ground it is used against.`,
          palette: `Four roles, named for where each colour lands in ${product.name}'s assets. Contrast is checked against both grounds.`,
        }}
      />

      <SaveBar dirty={dirty} onSave={() => setSaved(kit)} onDiscard={() => setKit(saved)} />
    </div>
  );
}
