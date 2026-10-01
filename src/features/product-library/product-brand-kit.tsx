"use client";

import { useState } from "react";
import type { LibraryProduct } from "@/features/product-library/product-library-types";
import { BrandKitEditor } from "@/features/settings/brand-kit-editor";
import { SaveBar } from "@/features/settings/settings-parts";
import { useSettingsStore } from "@/features/settings/settings-store";
import type { BrandKit, LogoSlot } from "@/features/settings/settings-types";

/**
 * A product's logos: the one every asset needs, and two it can do without.
 * Anything empty falls back to the workspace kit.
 */
const PRODUCT_SLOTS: LogoSlot[] = ["lockup-light", "favicon", "animated"];
const PRODUCT_SLOT_COPY: Partial<
  Record<LogoSlot, { label?: string; hint?: string; priority?: "primary" | "optional" }>
> = {
  "lockup-light": { label: "Logo", hint: "Every asset: documents, leave-behinds, video", priority: "primary" },
  favicon: { label: "Favicon / logomark", hint: "Corners, watermarks, shared links", priority: "optional" },
  animated: { label: "Animated brand logo", hint: "Intro and outro stings in video", priority: "optional" },
};

/** Two typefaces and two colours: what one brand needs, without a system's worth of roles. */
const PRODUCT_TYPEFACES = 2;
const PRODUCT_COLOR_ROLES = [
  { id: "primary" as const, label: "Primary", trailing: "Headlines, buttons, the brand mark" },
  { id: "accent" as const, label: "Secondary", trailing: "Highlights and supporting emphasis" },
];

/**
 * Where a product's kit starts: its own logo, the workspace's first two
 * typefaces, and a palette taken from its own artwork. The optional logos
 * start empty, so the page shows from the first look what a gap looks like.
 */
function seedKit(product: LibraryProduct, workspace: BrandKit): BrandKit {
  const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const hexes = product.gradient.match(/#[0-9a-f]{6}/gi) ?? [];
  return {
    logos: {
      "lockup-light": { fileName: `${slug}-logo.svg`, size: "22 KB" },
    },
    typefaces: workspace.typefaces.slice(0, PRODUCT_TYPEFACES).map((t) => ({ ...t })),
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
        maxTypefaces={PRODUCT_TYPEFACES}
        colorRoles={PRODUCT_COLOR_ROLES}
        copy={{
          logos: `${product.name}'s logo, and two optional versions of it. Each previews on the ground it is used against.`,
          typography: "Two roles. First is primary, second secondary. Drag to swap them.",
          palette: `Two colours, named for where each lands in ${product.name}'s assets. Contrast is checked against both grounds.`,
        }}
      />

      <SaveBar dirty={dirty} onSave={() => setSaved(kit)} onDiscard={() => setKit(saved)} />
    </div>
  );
}
