"use client";

import { Copy, CreditCard } from "lucide-react";
import Link from "next/link";
import { Field } from "@/components/ui/field";
import { Text } from "@/components/ui/text";
import { Chip } from "@/components/ui/chip";
import { Stack } from "@/components/ui/stack";
import { ChipMultiSelect } from "@/components/patterns/chip-multi-select";
import { useSettingsStore } from "@/features/settings/settings-store";
import { SettingsCard, SettingRow, SaveBar, useDirty } from "@/features/settings/settings-parts";

const THERAPY_AREAS = [
  "Dermatology", "Cardiology", "Oncology", "Immunology",
  "Nephrology", "Endocrinology", "Neurology", "Respiratory",
];

const REGIONS = ["United States", "European Union", "United Kingdom", "India", "Japan", "Global"];

export function SectionWorkspace() {
  const s = useSettingsStore();
  const { dirty, touch, clear } = useDirty();

  return (
    <Stack gap={4}>
      {/* Plan sits first and read-only: orientation, not a second billing surface. */}
      <SettingsCard
        title="Active plan"
        description="Read-only here — every billing action lives in Billing & usage."
        actions={
          <Link
            href="/settings/billing"
            className="flex items-center gap-1.5 rounded-control border border-hair-2 bg-card px-3 py-1.5 transition-colors hover:border-brand"
          >
            <CreditCard className="size-3.5 text-brand" />
            <span className="text-label font-bold text-ink">Manage billing</span>
          </Link>
        }
      >
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <div>
            <Text size="caption" tone="subtle" className="block uppercase tracking-wider">Plan</Text>
            <div className="mt-0.5 flex items-center gap-2">
              <Text size="subhead" weight="bold">{s.planName}</Text>
              <Chip tone="ok" size="sm">Active</Chip>
            </div>
          </div>
          <div>
            <Text size="caption" tone="subtle" className="block uppercase tracking-wider">Credit balance</Text>
            <Text size="subhead" weight="bold" className="mt-0.5 block tabular-nums">
              {s.creditBalance.toLocaleString()}
            </Text>
          </div>
          <div>
            <Text size="caption" tone="subtle" className="block uppercase tracking-wider">Renews</Text>
            <Text size="subhead" weight="bold" className="mt-0.5 block">{s.renewsOn}</Text>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Workspace"
        description="These details appear on generated content and on your invoices."
      >
        <div>
          <SettingRow label="Workspace name" htmlFor="ws-name">
            <Field
              id="ws-name"
              value={s.workspaceName}
              onChange={(e) => { s.setWorkspaceField("workspaceName", e.target.value); touch(); }}
              className="text-body"
            />
          </SettingRow>

          <SettingRow label="Legal entity" hint="Used on invoices" htmlFor="ws-entity">
            <Field
              id="ws-entity"
              value={s.legalEntity}
              onChange={(e) => { s.setWorkspaceField("legalEntity", e.target.value); touch(); }}
              className="text-body"
            />
          </SettingRow>

          <SettingRow label="Region" hint="Sets the currency used in Billing" htmlFor="ws-region">
            <select
              id="ws-region"
              value={s.region}
              onChange={(e) => { s.setWorkspaceField("region", e.target.value); touch(); }}
              className="w-full max-w-xs rounded-control border border-hair-2 bg-card px-3 py-2 text-body text-ink transition-colors focus:border-brand focus:outline-none cursor-pointer"
            >
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </SettingRow>

          <SettingRow label="Workspace ID" hint="Quote this to support">
            <div className="flex items-center gap-2">
              <code className="rounded-glyph border border-hair bg-subtle px-2 py-1 text-label text-ink-2">
                {s.workspaceId}
              </code>
              <button
                type="button"
                aria-label="Copy workspace ID"
                onClick={() => navigator.clipboard?.writeText(s.workspaceId)}
                className="grid size-7 place-items-center rounded-glyph text-ink-3 transition-colors hover:bg-subtle hover:text-ink cursor-pointer"
              >
                <Copy className="size-3.5" />
              </button>
            </div>
          </SettingRow>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Therapy areas"
        description="Constrains what the studio can ground content against."
      >
        <ChipMultiSelect
          size="md"
          options={THERAPY_AREAS.map((a) => ({ id: a, label: a }))}
          selected={s.therapyAreas}
          onToggle={(id) => { s.toggleTherapyArea(id); touch(); }}
        />
      </SettingsCard>

      <SaveBar dirty={dirty} onSave={clear} onDiscard={clear} />
    </Stack>
  );
}
