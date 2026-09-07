"use client";

import { KeyRound } from "lucide-react";
import { Field } from "@/components/ui/field";
import { Text } from "@/components/ui/text";
import { Chip } from "@/components/ui/chip";
import { Stack } from "@/components/ui/stack";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/features/settings/settings-store";
import {
  SettingsCard, SettingRow, ReadOnlyValue, Toggle, SaveBar, useDirty,
} from "@/features/settings/settings-parts";

export function SectionProfile() {
  const s = useSettingsStore();
  const { dirty, touch, clear } = useDirty();
  const me = s.members.find((m) => m.id === s.currentUserId);
  const teamsConnected = s.integrationStatus.teams === "connected";

  return (
    <Stack gap={4}>
      <SettingsCard title="Your details" description="How you appear to the rest of the workspace.">
        <div>
          <SettingRow label="First name" htmlFor="p-first">
            <Field id="p-first" value={s.firstName}
              onChange={(e) => { s.setProfileField("firstName", e.target.value); touch(); }}
              className="max-w-xs text-body" />
          </SettingRow>
          <SettingRow label="Last name" htmlFor="p-last">
            <Field id="p-last" value={s.lastName}
              onChange={(e) => { s.setProfileField("lastName", e.target.value); touch(); }}
              className="max-w-xs text-body" />
          </SettingRow>
          <SettingRow label="Email" hint="Changing this needs re-verification" htmlFor="p-email">
            <Field id="p-email" type="email" value={s.email}
              onChange={(e) => { s.setProfileField("email", e.target.value); touch(); }}
              className="max-w-sm text-body" />
          </SettingRow>
          <SettingRow
            label="Phone"
            hint={`Format follows ${s.region}`}
            htmlFor="p-phone"
          >
            <Field id="p-phone" value={s.phone}
              onChange={(e) => { s.setProfileField("phone", e.target.value); touch(); }}
              className="max-w-xs text-body" />
          </SettingRow>

          {/* Admin-set, so read-only here — with a line saying who to ask. */}
          <SettingRow label="Role">
            <ReadOnlyValue value={me?.role ?? "—"} note="Set by an admin in Team" />
          </SettingRow>
          <SettingRow label="Seniority">
            <ReadOnlyValue value={me?.seniority ?? "—"} note="Set by an admin in Team" />
          </SettingRow>

          <SettingRow label="Sign-in" hint="Password and sessions">
            <Button size="sm" variant="secondary">
              <KeyRound className="size-3.5" /> Change password
            </Button>
          </SettingRow>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Notifications"
        description="Which events reach you, and where."
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-body">
            <thead>
              <tr>
                <th scope="col" className="border-b border-hair px-0 pb-2 text-left text-caption font-bold uppercase tracking-wider text-ink-3">
                  Event
                </th>
                {(["Email", "In-app", "Teams"] as const).map((h) => (
                  <th key={h} scope="col" className="w-24 border-b border-hair px-2 pb-2 text-center text-caption font-bold uppercase tracking-wider text-ink-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.notifications.map((n) => (
                <tr key={n.key} className="border-b border-hair last:border-b-0">
                  <td className="py-3 pr-4">
                    <Text size="body" weight="semibold">{n.label}</Text>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex justify-center">
                      <Toggle checked={n.email} label={`${n.label} by email`}
                        onChange={() => { s.toggleNotification(n.key, "email"); touch(); }} />
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex justify-center">
                      {n.inAppSupported ? (
                        <Toggle checked={n.inApp} label={`${n.label} in app`}
                          onChange={() => { s.toggleNotification(n.key, "inApp"); touch(); }} />
                      ) : (
                        <Text size="caption" tone="subtle">—</Text>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex justify-center">
                      {teamsConnected ? (
                        <Toggle checked={n.teams} label={`${n.label} in Teams`}
                          onChange={() => { s.toggleNotification(n.key, "teams"); touch(); }} />
                      ) : (
                        <Text size="caption" tone="subtle">—</Text>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!teamsConnected && (
          <div className="mt-3 flex items-center gap-2">
            <Chip tone="default" size="xs">Teams not connected</Chip>
            <Text size="label" tone="subtle">Connect Teams in Integrations to use that column.</Text>
          </div>
        )}
      </SettingsCard>

      <SaveBar dirty={dirty} onSave={clear} onDiscard={clear} />
    </Stack>
  );
}
