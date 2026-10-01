"use client";

import { Stack } from "@/components/ui/stack";
import { BrandKitEditor } from "@/features/settings/brand-kit-editor";
import { useSettingsStore } from "@/features/settings/settings-store";
import { SaveBar, useDirty } from "@/features/settings/settings-parts";

/** The workspace's own kit: what every asset falls back to. */
export function SectionBrandKit() {
  const brandKit = useSettingsStore((s) => s.brandKit);
  const setBrandKit = useSettingsStore((s) => s.setBrandKit);
  const { dirty, touch, clear } = useDirty();
  return (
    <Stack gap={4}>
      <BrandKitEditor
        kit={brandKit}
        onChange={(next) => {
          setBrandKit(next);
          touch();
        }}
      />
      <SaveBar dirty={dirty} onSave={clear} onDiscard={clear} />
    </Stack>
  );
}
