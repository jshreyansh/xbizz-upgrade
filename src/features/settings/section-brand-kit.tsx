"use client";

import { Stack } from "@/components/ui/stack";
import { Text } from "@/components/ui/text";
import { BrandKitEditor } from "@/features/settings/brand-kit-editor";
import { useSettingsStore } from "@/features/settings/settings-store";
import { SaveBar, useDirty } from "@/features/settings/settings-parts";
import { useCan } from "@/features/settings/view-as";

/** The workspace's own kit: what every asset falls back to. Brand kit: Manage edits it; View sees it. */
export function SectionBrandKit() {
  const brandKit = useSettingsStore((s) => s.brandKit);
  const setBrandKit = useSettingsStore((s) => s.setBrandKit);
  const canManage = useCan().can("brandManage");
  const { dirty, touch, clear } = useDirty();
  return (
    <Stack gap={4}>
      {!canManage && (
        <Text size="label" tone="muted" className="block">
          View only. Changing the workspace brand kit comes with Brand kit: Manage.
        </Text>
      )}
      <BrandKitEditor
        kit={brandKit}
        readOnly={!canManage}
        onChange={(next) => {
          setBrandKit(next);
          touch();
        }}
      />
      {canManage && <SaveBar dirty={dirty} onSave={clear} onDiscard={clear} />}
    </Stack>
  );
}
