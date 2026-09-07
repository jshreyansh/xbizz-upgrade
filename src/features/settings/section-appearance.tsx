"use client";

import { Text } from "@/components/ui/text";
import { Chip } from "@/components/ui/chip";
import { Stack } from "@/components/ui/stack";
import { useSettingsStore } from "@/features/settings/settings-store";
import { SettingsCard, SettingRow, Segmented } from "@/features/settings/settings-parts";
import { LANGUAGES, type Language, type ThemeChoice } from "@/features/settings/settings-types";
import { cn } from "@/lib/cn";

export function SectionAppearance() {
  const s = useSettingsStore();

  return (
    <Stack gap={4}>
      <SettingsCard
        title="Theme"
        description="Light, dark, or follow the system."
        actions={<Chip tone="warn" size="sm">Mock — does not re-theme yet</Chip>}
      >
        <div>
          <SettingRow label="Theme" hint="Remembers your choice">
            <Segmented<ThemeChoice>
              ariaLabel="Theme"
              value={s.theme}
              onChange={s.setTheme}
              options={[
                { id: "light", label: "Light" },
                { id: "dark", label: "Dark" },
                { id: "system", label: "System" },
              ]}
            />
          </SettingRow>
        </div>
        {/* Said plainly, because a theme switch that does nothing reads as
            broken unless it is labelled as coming. */}
        <Text size="caption" tone="subtle" className="mt-3 block">
          The control remembers what you pick, but the app does not re-theme yet. The token layer
          already supports all three states, so wiring it later is a change here rather than
          everywhere.
        </Text>
      </SettingsCard>

      <SettingsCard title="Language" description="Used for generated narration and interface copy.">
        <div className="grid gap-2 sm:grid-cols-2">
          {LANGUAGES.map((l) => {
            const active = l === s.language;
            return (
              <button
                key={l}
                type="button"
                onClick={() => s.setLanguage(l as Language)}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-control border px-3 py-2.5 text-left transition-colors cursor-pointer",
                  active
                    ? "border-brand bg-tint ring-2 ring-brand/15"
                    : "border-hair-2 bg-card hover:border-hair-3 hover:bg-canvas",
                )}
              >
                <Text size="body" weight="semibold" className={cn(active && "text-brand-deep")}>{l}</Text>
                {l === LANGUAGES[0] && <Chip tone="default" size="xs">Default</Chip>}
              </button>
            );
          })}
        </div>
      </SettingsCard>
    </Stack>
  );
}
