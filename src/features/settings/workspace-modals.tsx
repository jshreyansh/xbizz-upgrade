"use client";

import { SelectMenu } from "@/components/ui/select-menu";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Stack } from "@/components/ui/stack";
import { ChipMultiSelect } from "@/components/patterns/chip-multi-select";
import { useSettingsStore } from "@/features/settings/settings-store";
import { EmailChips, isEmail } from "@/features/settings/team-modals";
import { MARKETS, REGIONS, THERAPY_AREAS, DEFAULT_ROLES } from "@/features/settings/settings-types";

/**
 * A new workspace in the same organisation: a brand or market with its own
 * team, roles, libraries and credits. Organisation admins only. You land in
 * it as its Admin, and it starts empty. Mount it per opening so each starts fresh.
 */
export function CreateWorkspaceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const s = useSettingsStore();
  const [name, setName] = useState("");
  const [region, setRegion] = useState<string>("European Union");
  const [markets, setMarkets] = useState<string[]>(["European Union · EMA"]);
  const [therapies, setTherapies] = useState<string[]>(() => [...s.therapyAreas]);
  const [roles, setRoles] = useState<"default" | "copy">("copy");
  const [kit, setKit] = useState<"empty" | "copy">("copy");
  const [emails, setEmails] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [inviteRole, setInviteRole] = useState("Marketing");

  const roleNames = (roles === "copy" ? s.roles : DEFAULT_ROLES).map((r) => r.name);
  const invitees = [...emails, ...(isEmail(draft.trim()) ? [draft.trim()] : [])].filter(isEmail);
  const taken = [s.workspaceName, ...Object.values(s.stash).map((w) => w.workspaceName)]
    .some((n) => n.toLowerCase() === name.trim().toLowerCase());
  const valid = name.trim().length > 1 && !taken && markets.length > 0;

  const toggle = (list: string[], set: (v: string[]) => void, id: string) =>
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const create = () => {
    s.createWorkspace({
      name, region, markets, therapyAreas: therapies,
      copyRoles: roles === "copy", copyBrandKit: kit === "copy",
      invites: invitees.map((email) => ({ email, role: roleNames.includes(inviteRole) ? inviteRole : roleNames[0] })),
    });
    onClose();
    router.push("/settings/workspace");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title="Create a workspace"
      description={`A new brand or market inside ${s.orgName}. It gets its own team, roles, Product and Claims libraries, and credits.`}
      footer={
        <div className="flex items-center justify-between gap-3">
          <Text size="caption" tone="subtle">You&apos;ll be its Admin and switch into it.</Text>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" onClick={create} disabled={!valid}>Create workspace</Button>
          </div>
        </div>
      }
    >
      <Stack gap={5}>
        <Field
          label="Workspace name"
          placeholder="e.g. Velmora EU, Dermora Launch"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={taken ? "There's already a workspace with this name." : undefined}
          autoFocus
        />

        <div className="grid gap-1.5">
          <Text size="label" weight="bold" tone="muted">Region</Text>
          <SelectMenu size="md" ariaLabel="Region" value={region} onChange={setRegion} options={REGIONS} />
          <Text size="caption" tone="subtle">Sets the currency in its Billing.</Text>
        </div>

        <div className="grid gap-2">
          <Text size="label" weight="bold" tone="muted">Markets</Text>
          <ChipMultiSelect
            options={MARKETS.map((m) => ({ id: m, label: m }))}
            selected={markets}
            onToggle={(id) => toggle(markets, setMarkets, id)}
          />
          <Text size="caption" tone="subtle">Claims are checked against each market&apos;s label and promotional rules.</Text>
        </div>

        <div className="grid gap-2">
          <Text size="label" weight="bold" tone="muted">Therapy areas</Text>
          <ChipMultiSelect
            options={THERAPY_AREAS.map((t) => ({ id: t, label: t }))}
            selected={therapies}
            onToggle={(id) => toggle(therapies, setTherapies, id)}
          />
        </div>

        {/* Two starting points, side by side at the same height; either can be changed later. */}
        <div className="grid items-start gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Text size="label" weight="bold" tone="muted">Roles</Text>
            <SelectMenu
              size="md"
              ariaLabel="Starting roles"
              value={roles}
              onChange={(v) => setRoles(v as "copy" | "default")}
              options={[
                { value: "copy", label: `Copy from ${s.workspaceName}`, hint: `${s.roles.length} roles, as they are now` },
                { value: "default", label: "Default set", hint: `${DEFAULT_ROLES.length} roles SwishX starts with` },
              ]}
            />
          </div>
          <div className="grid gap-1.5">
            <Text size="label" weight="bold" tone="muted">Brand kit</Text>
            <SelectMenu
              size="md"
              ariaLabel="Brand kit"
              value={kit}
              onChange={(v) => setKit(v as "copy" | "empty")}
              options={[
                { value: "copy", label: `Copy from ${s.workspaceName}`, hint: "Logos, typefaces and colours" },
                { value: "empty", label: "Start empty", hint: "Set it up in the new workspace" },
              ]}
            />
          </div>
          <Text size="caption" tone="subtle" className="sm:col-span-2">
            Starting points only. After this, each workspace edits its own roles and brand kit.
          </Text>
        </div>

        <div className="grid gap-2">
          <Text size="label" weight="bold" tone="muted">Invite people (optional)</Text>
          <EmailChips emails={emails} draft={draft} onEmails={setEmails} onDraft={setDraft} />
          <div className="grid items-center gap-2 sm:grid-cols-[auto_minmax(0,14rem)_1fr]">
            <Text size="label" tone="muted">Join as</Text>
            <SelectMenu size="md" ariaLabel="Role for invitees" value={roleNames.includes(inviteRole) ? inviteRole : roleNames[0]} onChange={setInviteRole} options={roleNames} />
            <Text size="caption" tone="subtle">People already in {s.orgName} are added straight away; others get an invite.</Text>
          </div>
        </div>
      </Stack>
    </Modal>
  );
}
