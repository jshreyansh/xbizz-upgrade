"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Stack } from "@/components/ui/stack";
import { ChipMultiSelect } from "@/components/patterns/chip-multi-select";
import { useSettingsStore } from "@/features/settings/settings-store";
import { Segmented } from "@/features/settings/settings-parts";
import { EmailChips, isEmail } from "@/features/settings/team-modals";
import { MARKETS, REGIONS, THERAPY_AREAS, DEFAULT_ROLES } from "@/features/settings/settings-types";

const SELECT =
  "w-full rounded-control border border-hair-2 bg-card px-3 py-2 text-body text-ink cursor-pointer focus:border-brand focus:outline-none";

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

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <Text size="label" weight="bold" tone="muted">Region</Text>
            <select value={region} onChange={(e) => setRegion(e.target.value)} className={SELECT}>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <Text size="caption" tone="subtle">Sets the currency in its Billing.</Text>
          </label>
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

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Text size="label" weight="bold" tone="muted">Roles</Text>
            <Segmented
              ariaLabel="Starting roles"
              value={roles}
              onChange={setRoles}
              options={[{ id: "copy", label: `Copy ${s.workspaceName}` }, { id: "default", label: "Default set" }]}
            />
            <Text size="caption" tone="subtle">A starting point. After this, each workspace edits its own.</Text>
          </div>
          <div className="grid gap-1.5">
            <Text size="label" weight="bold" tone="muted">Brand kit</Text>
            <Segmented
              ariaLabel="Brand kit"
              value={kit}
              onChange={setKit}
              options={[{ id: "copy", label: "Copy current" }, { id: "empty", label: "Start empty" }]}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Text size="label" weight="bold" tone="muted">Invite people (optional)</Text>
          <EmailChips emails={emails} draft={draft} onEmails={setEmails} onDraft={setDraft} />
          <div className="flex flex-wrap items-center gap-2">
            <Text size="caption" tone="subtle">as</Text>
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className={`${SELECT} w-auto py-1.5`} aria-label="Role for invitees">
              {roleNames.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <Text size="caption" tone="subtle">People already in {s.orgName} are added straight away; others get an invite.</Text>
          </div>
        </div>
      </Stack>
    </Modal>
  );
}
