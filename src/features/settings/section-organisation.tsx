"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Plus, RotateCcw, X } from "lucide-react";
import { Field } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { SelectMenu, type SelectOption } from "@/components/ui/select-menu";
import { Text } from "@/components/ui/text";
import { Chip } from "@/components/ui/chip";
import { Stack } from "@/components/ui/stack";
import { Button } from "@/components/ui/button";
import { listWorkspaces, orgPeople, useSettingsStore } from "@/features/settings/settings-store";
import { SettingsCard, SettingRow } from "@/features/settings/settings-parts";
import { CreateWorkspaceModal } from "@/features/settings/workspace-modals";

/**
 * The company above its workspaces. Organisation admins only: they create,
 * rename and archive workspaces, decide which email domains can sign up, and
 * can open any workspace as its Admin. They still can't see anyone's private
 * drafts; that follows the sharing rules like everyone else.
 */
export function SectionOrganisation() {
  const router = useRouter();
  const s = useSettingsStore();
  const workspaces = listWorkspaces(s);
  const people = orgPeople(s).filter((p) => p.status === "active");
  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);
  const [domain, setDomain] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);
  const admins = people.filter((p) => s.orgAdminIds.includes(p.id));
  const candidates = people.filter((p) => !s.orgAdminIds.includes(p.id));

  const open = (id: string, member: boolean) => {
    if (member) s.switchWorkspace(id); else s.joinWorkspaceAsAdmin(id);
    router.push("/settings/workspace");
  };
  const workspacesOf = (personId: string) =>
    listWorkspaces(s, personId).filter((w) => w.me).map((w) => `${w.name} · ${w.me!.role}`);

  return (
    <Stack gap={4}>
      <SettingsCard title="Organisation" description="The company every workspace belongs to. Shown on invoices for all of them.">
        <div>
          <SettingRow label="Organisation name" htmlFor="org-name">
            <Field id="org-name" value={s.orgName} onChange={(e) => s.setOrgName(e.target.value)} className="text-body" />
          </SettingRow>
          <SettingRow label="Legal entity" hint="Used on invoices" htmlFor="org-entity">
            <Field id="org-entity" value={s.legalEntity} onChange={(e) => s.setWorkspaceField("legalEntity", e.target.value)} className="text-body" />
          </SettingRow>
          <SettingRow label="Allowed email domains" hint="Who can sign up or ask to join">
            <div className="grid gap-2">
              <div className="flex flex-wrap gap-1.5">
                {s.allowedDomains.map((d) => (
                  <span key={d} className="inline-flex items-center gap-1 rounded-chip bg-subtle py-0.5 pl-2 pr-1 text-label font-bold text-ink">
                    @{d}
                    <button
                      type="button"
                      aria-label={`Remove ${d}`}
                      disabled={s.allowedDomains.length <= 1}
                      onClick={() => s.removeAllowedDomain(d)}
                      className="grid size-4 cursor-pointer place-items-center rounded-full text-ink-3 hover:bg-hair hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
              <form
                className="flex max-w-sm gap-2"
                onSubmit={(e) => { e.preventDefault(); s.addAllowedDomain(domain); setDomain(""); }}
              >
                <Field value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="velmora.eu" aria-label="Add a domain" className="text-body" />
                <Button type="submit" variant="secondary" size="sm" disabled={!domain.includes(".")}>Add</Button>
              </form>
              <Text size="caption" tone="subtle">Personal addresses like gmail.com or outlook.com can never sign in.</Text>
            </div>
          </SettingRow>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Workspaces"
        description="Each has its own team, roles, libraries and credits. People are added to each one separately."
        actions={<Button size="sm" onClick={() => setCreating(true)}><Plus className="size-3.5" /> New workspace</Button>}
      >
        <div className="divide-y divide-hair">
          {workspaces.map((w) => (
            <div key={w.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                {renaming?.id === w.id ? (
                  <form
                    className="flex max-w-sm gap-2"
                    onSubmit={(e) => { e.preventDefault(); s.renameWorkspace(w.id, renaming.name); setRenaming(null); }}
                  >
                    <Field value={renaming.name} onChange={(e) => setRenaming({ id: w.id, name: e.target.value })} aria-label="Workspace name" autoFocus className="text-body" />
                    <Button type="submit" size="sm" disabled={!renaming.name.trim()}>Save</Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setRenaming(null)}>Cancel</Button>
                  </form>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <Text size="body" weight="bold" className={w.archived ? "text-ink-4" : undefined}>{w.name}</Text>
                    {w.current && <Chip tone="brand" size="xs">Current</Chip>}
                    {w.archived && <Chip tone="default" size="xs">Archived</Chip>}
                  </div>
                )}
                <Text size="caption" tone="subtle" className="mt-0.5 block">
                  {w.memberCount} {w.memberCount === 1 ? "member" : "members"} · {w.creditBalance.toLocaleString()} credits · {w.me ? `You: ${w.me.role}` : "You're not a member"}
                </Text>
              </div>
              {renaming?.id !== w.id && (
                <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                  {!w.current && !w.archived && (
                    <Button size="sm" variant="secondary" onClick={() => open(w.id, !!w.me)}>
                      {w.me ? "Open" : "Open as workspace admin"}
                    </Button>
                  )}
                  {/* An organisation admin who's a regular member somewhere can step up there. */}
                  {w.me && !w.me.permissions.includes("admin") && !w.archived && (
                    <Button size="sm" variant="ghost" onClick={() => s.joinWorkspaceAsAdmin(w.id)}>
                      Make myself workspace admin
                    </Button>
                  )}
                  {!w.archived && <Button size="sm" variant="ghost" onClick={() => setRenaming({ id: w.id, name: w.name })}>Rename</Button>}
                  {w.archived ? (
                    <Button size="sm" variant="ghost" onClick={() => s.setWorkspaceArchived(w.id, false)}><RotateCcw className="size-3.5" /> Restore</Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={w.current}
                      title={w.current ? "Switch to another workspace to archive this one" : "Hide it from everyone's switcher; nothing is deleted"}
                      onClick={() => s.setWorkspaceArchived(w.id, true)}
                    >
                      <Archive className="size-3.5" /> Archive
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard
        title="Organisation admins"
        description="Company-wide: create, rename and archive workspaces, manage allowed domains, and open any workspace as its workspace admin. Being Workspace admin of one workspace is set in that workspace's Team instead."
        actions={<Button size="sm" variant="secondary" onClick={() => setAddingAdmin(true)} disabled={candidates.length === 0}><Plus className="size-3.5" /> Add admin</Button>}
      >
        <div className="divide-y divide-hair">
          {admins.map((p) => {
            const last = s.orgAdminIds.length <= 1;
            return (
              <div key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-1.5 py-2.5 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <Text size="body" weight="semibold" className="block">{p.name}</Text>
                  <Text size="caption" tone="subtle" className="mt-0.5 block truncate">{p.email} · {workspacesOf(p.id).join(" · ")}</Text>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={last}
                  title={last ? "There has to be at least one organisation admin" : undefined}
                  onClick={() => s.toggleOrgAdmin(p.id)}
                >
                  Remove
                </Button>
              </div>
            );
          })}
        </div>
      </SettingsCard>

      {creating && <CreateWorkspaceModal open onClose={() => setCreating(false)} />}
      {addingAdmin && (
        <AddOrgAdminModal
          candidates={candidates.map((p) => ({ value: p.id, label: p.name, hint: workspacesOf(p.id).join(" · ") || p.email }))}
          orgName={s.orgName}
          onAdd={(id) => { s.toggleOrgAdmin(id); setAddingAdmin(false); }}
          onClose={() => setAddingAdmin(false)}
        />
      )}
    </Stack>
  );
}

/** Pick someone already in the organisation, see what it grants, confirm. */
function AddOrgAdminModal({
  candidates, orgName, onAdd, onClose,
}: {
  candidates: SelectOption[];
  orgName: string;
  onAdd: (personId: string) => void;
  onClose: () => void;
}) {
  const [personId, setPersonId] = useState("");
  const person = candidates.find((c) => c.value === personId);
  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title="Add an organisation admin"
      description={`Someone already in ${orgName}. Their role in each workspace stays as it is.`}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={!person} onClick={() => onAdd(personId)}>
            {person ? `Make ${person.label.split(" ")[0]} an organisation admin` : "Make organisation admin"}
          </Button>
        </div>
      }
    >
      <Stack gap={3}>
        <SelectMenu size="md" ariaLabel="Person" placeholder="Choose a person…" value={personId} onChange={setPersonId} options={candidates} />
        <div className="rounded-control border border-hair bg-subtle px-3 py-2.5">
          <Text size="label" weight="bold" className="mb-1 block">They&apos;ll be able to</Text>
          <Text size="caption" tone="muted" className="block">
            Create, rename and archive workspaces · manage allowed email domains · open any workspace as its workspace admin · add or remove organisation admins.
          </Text>
          <Text size="caption" tone="subtle" className="mt-1.5 block">They still can&apos;t see anyone&apos;s private drafts.</Text>
        </div>
      </Stack>
    </Modal>
  );
}
