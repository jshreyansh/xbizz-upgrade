"use client";

import { useMemo, useState } from "react";
import { RotateCcw, Send, UserPlus } from "lucide-react";
import { Text } from "@/components/ui/text";
import { Chip } from "@/components/ui/chip";
import { Stack } from "@/components/ui/stack";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/patterns/sheet";
import { DataTable, type DataColumn } from "@/components/patterns/data-table";
import { useSettingsStore } from "@/features/settings/settings-store";
import { SettingsCard, CheckRow } from "@/features/settings/settings-parts";
import {
  PERMISSIONS, ROLES, ROLE_PERMISSIONS, SENIORITY,
  type Member, type PermissionId, type Role, type Seniority,
} from "@/features/settings/settings-types";
import { cn } from "@/lib/cn";

const STATUS_TONE = { active: "ok", invited: "warn", deactivated: "default" } as const;

/** Same set regardless of order — used for the "differs from role" marker. */
function sameSet(a: readonly string[], b: readonly string[]) {
  return a.length === b.length && a.every((x) => b.includes(x));
}

export function SectionTeam() {
  const s = useSettingsStore();
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [openMemberId, setOpenMemberId] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [inviteEmails, setInviteEmails] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("Marketing");
  const [inviteSeniority, setInviteSeniority] = useState<Seniority>("Associate");
  // Seeded from the role, then editable — same contract as an existing member,
  // so what you grant at invite time is what they arrive with.
  const [invitePerms, setInvitePerms] = useState<PermissionId[]>([...ROLE_PERMISSIONS["Marketing"]]);
  const [deactivating, setDeactivating] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const rows = useMemo(
    () => (roleFilter === "all" ? s.members : s.members.filter((m) => m.role === roleFilter)),
    [s.members, roleFilter],
  );
  const openMember = s.members.find((m) => m.id === openMemberId) ?? null;

  const columns: DataColumn<Member>[] = [
    {
      key: "name", header: "Name",
      cell: (m) => (
        <div className="min-w-0">
          <Text size="body" weight="semibold" className="block truncate text-ink">{m.name}</Text>
          <Text size="caption" tone="subtle" className="block truncate">{m.email}</Text>
        </div>
      ),
    },
    { key: "role", header: "Role", cell: (m) => <Chip tone="brand" size="xs">{m.role}</Chip> },
    { key: "seniority", header: "Seniority", secondary: true, cell: (m) => <Chip tone="default" size="xs">{m.seniority}</Chip> },
    {
      key: "perms", header: "Permissions", secondary: true,
      cell: (m) => {
        const custom = !sameSet(m.permissions, ROLE_PERMISSIONS[m.role]);
        return (
          <div className="flex items-center gap-1.5">
            <Text size="body" className="tabular-nums">{m.permissions.length} of {PERMISSIONS.length}</Text>
            {/* A member who differs from their role is worth spotting at a glance. */}
            {custom && <span aria-label="Customised" title="Differs from the role default" className="size-1.5 rounded-full bg-brand" />}
          </div>
        );
      },
    },
    {
      key: "status", header: "Status",
      cell: (m) => <Chip tone={STATUS_TONE[m.status]} size="xs">{m.status === "deactivated" ? "Deactivated" : m.status === "invited" ? "Invited" : "Active"}</Chip>,
    },
    { key: "last", header: "Last active", secondary: true, cell: (m) => <Text size="caption" tone="muted">{m.lastActive}</Text> },
  ];

  const sendInvites = () => {
    const emails = inviteEmails.split(/[\s,;]+/).map((e) => e.trim()).filter(Boolean);
    if (emails.length === 0) return;
    s.sendInvites(emails, inviteRole, inviteSeniority, invitePerms);
    setInviteEmails("");
    setComposerOpen(false);
  };

  return (
    <Stack gap={4}>
      {s.joinRequests.length > 0 && (
        <SettingsCard title="Join requests" description="People asking for access to this workspace.">
          <Stack gap={2}>
            {s.joinRequests.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-warn-line bg-warn-bg px-3 py-2.5">
                <div className="min-w-0">
                  <Text size="body" weight="semibold" className="block">{r.name}</Text>
                  <Text size="caption" tone="muted" className="block">{r.email} · asked {r.requestedAt}</Text>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => s.resolveJoinRequest(r.id, false)}>Decline</Button>
                  <Button size="sm" onClick={() => s.resolveJoinRequest(r.id, true, "Read only", "Associate")}>Approve</Button>
                </div>
              </div>
            ))}
          </Stack>
        </SettingsCard>
      )}

      <SettingsCard
        title="Members"
        description="Field-force reps are members with the Field Force role — filter to see just them."
        actions={
          <Button size="sm" onClick={() => setComposerOpen((v) => !v)}>
            <UserPlus className="size-3.5" /> Invite
          </Button>
        }
      >
        <Stack gap={3}>
          {composerOpen && (
            <div className="rounded-panel border border-brand/20 bg-tint p-3">
              <Stack gap={2}>
                <Field
                  label="Email addresses"
                  hint="Several at once — separate with commas or spaces"
                  value={inviteEmails}
                  onChange={(e) => setInviteEmails(e.target.value)}
                  placeholder="name@velmora.com, other@velmora.com"
                  className="text-body"
                />
                <div className="flex flex-wrap items-end gap-3">
                  <label className="flex flex-col gap-1">
                    <Text size="label" tone="muted" weight="semibold">Role</Text>
                    <select value={inviteRole} onChange={(e) => {
                        const r = e.target.value as Role;
                        setInviteRole(r);
                        setInvitePerms([...ROLE_PERMISSIONS[r]]);
                      }}
                      className="rounded-control border border-hair-2 bg-card px-3 py-2 text-body text-ink cursor-pointer focus:border-brand focus:outline-none">
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1">
                    <Text size="label" tone="muted" weight="semibold">Seniority</Text>
                    <select value={inviteSeniority} onChange={(e) => setInviteSeniority(e.target.value as Seniority)}
                      className="rounded-control border border-hair-2 bg-card px-3 py-2 text-body text-ink cursor-pointer focus:border-brand focus:outline-none">
                      {SENIORITY.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </label>
                </div>

                <div>
                  <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                    <Text size="label" tone="muted" weight="semibold">
                      Permissions — {invitePerms.length} of {PERMISSIONS.length}
                    </Text>
                    {!sameSet(invitePerms, ROLE_PERMISSIONS[inviteRole]) && (
                      <button
                        type="button"
                        onClick={() => setInvitePerms([...ROLE_PERMISSIONS[inviteRole]])}
                        className="flex items-center gap-1 text-brand transition-colors hover:underline cursor-pointer"
                      >
                        <RotateCcw className="size-3" />
                        <span className="text-label font-bold">Reset to {inviteRole} default</span>
                      </button>
                    )}
                  </div>
                  <Text size="caption" tone="subtle" className="mb-2 block">
                    Seeded from {inviteRole}. Change them here and the invitee arrives with exactly this set.
                  </Text>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {PERMISSIONS.map((p) => (
                      <CheckRow
                        key={p.id}
                        checked={invitePerms.includes(p.id)}
                        onChange={() => setInvitePerms((cur) =>
                          cur.includes(p.id) ? cur.filter((x) => x !== p.id) : [...cur, p.id])}
                        label={p.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={sendInvites} disabled={!inviteEmails.trim()}>
                    <Send className="size-3.5" /> Send invites
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setComposerOpen(false)}>Cancel</Button>
                </div>
              </Stack>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-1.5">
            <Text size="label" tone="muted" weight="semibold" className="mr-1">Filter</Text>
            <button type="button" onClick={() => setRoleFilter("all")}
              className={cn("rounded-chip border px-2.5 py-1 transition-colors cursor-pointer",
                roleFilter === "all" ? "border-brand bg-tint text-brand-deep" : "border-hair-2 bg-card text-ink-3 hover:border-hair-3")}>
              <span className="text-label font-bold">All</span>
            </button>
            {ROLES.map((r) => (
              <button key={r} type="button" onClick={() => setRoleFilter(r)}
                className={cn("rounded-chip border px-2.5 py-1 transition-colors cursor-pointer",
                  roleFilter === r ? "border-brand bg-tint text-brand-deep" : "border-hair-2 bg-card text-ink-3 hover:border-hair-3")}>
                <span className="text-label font-bold">{r}</span>
              </button>
            ))}
          </div>

          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(m) => m.id}
            onRowClick={(m) => setOpenMemberId(m.id)}
            empty={`No members with the ${roleFilter} role.`}
          />
        </Stack>
      </SettingsCard>

      {s.invites.length > 0 && (
        <SettingsCard title="Pending invites" description="Sent, not yet accepted.">
          <Stack gap={2}>
            {s.invites.map((i) => (
              <div key={i.id} className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-hair bg-canvas px-3 py-2.5">
                <div className="min-w-0">
                  <Text size="body" weight="semibold" className="block truncate">{i.email}</Text>
                  <Text size="caption" tone="muted" className="block">{i.role} · {i.seniority} · invited {i.invitedAt}</Text>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button size="sm" variant="ghost">Resend</Button>
                  <Button size="sm" variant="secondary" onClick={() => s.revokeInvite(i.id)}>Revoke</Button>
                </div>
              </div>
            ))}
          </Stack>
        </SettingsCard>
      )}

      {/* Member drawer — role, seniority, permissions, deactivation. */}
      <Sheet
        open={Boolean(openMember)}
        onClose={() => { setOpenMemberId(null); setDeactivating(null); }}
        side="right"
        size={480}
        title={openMember?.name ?? ""}
        description={openMember?.email}
        footer={
          openMember && openMember.status !== "deactivated" ? (
            <Button size="sm" variant="danger" onClick={() => setDeactivating(openMember.id)}>Deactivate</Button>
          ) : openMember ? (
            <Button size="sm" variant="secondary" onClick={() => s.setMemberStatus(openMember.id, "active")}>Reactivate</Button>
          ) : undefined
        }
      >
        {openMember && (
          <Stack gap={4}>
            {openMember.status === "deactivated" && openMember.deactivationReason && (
              <div className="rounded-control border border-hair bg-subtle px-3 py-2">
                <Text size="label" tone="muted">Deactivated — {openMember.deactivationReason}</Text>
              </div>
            )}

            <div>
              <Text size="label" tone="muted" weight="semibold" className="mb-1.5 block">Role</Text>
              <select
                value={openMember.role}
                onChange={(e) => s.setMemberRole(openMember.id, e.target.value as Role)}
                className="w-full rounded-control border border-hair-2 bg-card px-3 py-2 text-body text-ink cursor-pointer focus:border-brand focus:outline-none"
              >
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <Text size="caption" tone="subtle" className="mt-1 block">
                Changing the role re-seeds the permissions below.
              </Text>
            </div>

            <div>
              <Text size="label" tone="muted" weight="semibold" className="mb-1.5 block">Seniority</Text>
              <select
                value={openMember.seniority}
                onChange={(e) => s.setMemberSeniority(openMember.id, e.target.value as Seniority)}
                className="w-full rounded-control border border-hair-2 bg-card px-3 py-2 text-body text-ink cursor-pointer focus:border-brand focus:outline-none"
              >
                {SENIORITY.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <Text size="caption" tone="subtle" className="mt-1 block">
                Carries no permissions itself — it is used for approval routing.
              </Text>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <Text size="label" tone="muted" weight="semibold">Permissions</Text>
                {!sameSet(openMember.permissions, ROLE_PERMISSIONS[openMember.role]) && (
                  <button
                    type="button"
                    onClick={() => s.resetMemberPermissions(openMember.id)}
                    className="flex items-center gap-1 text-brand transition-colors hover:underline cursor-pointer"
                  >
                    <RotateCcw className="size-3" />
                    <span className="text-label font-bold">Reset to role default</span>
                  </button>
                )}
              </div>
              <Text size="caption" tone="subtle" className="mb-2 block">
                Seeded from {openMember.role}. Unselecting one affects only {openMember.name.split(" ")[0]} — it never changes the role for anyone else.
              </Text>
              <Stack gap={2}>
                {PERMISSIONS.map((p) => (
                  <CheckRow
                    key={p.id}
                    checked={openMember.permissions.includes(p.id)}
                    onChange={() => s.toggleMemberPermission(openMember.id, p.id)}
                    label={p.label}
                    trailing={p.trailing}
                  />
                ))}
              </Stack>
            </div>

            {deactivating === openMember.id && (
              <div className="rounded-panel border border-danger bg-danger-bg p-3">
                <Text size="body" weight="bold" className="mb-1.5 block text-danger">Deactivate {openMember.name}?</Text>
                <Text size="label" tone="muted" className="mb-2 block">
                  They keep their history and can be reactivated. Nothing is deleted.
                </Text>
                <Field
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason, e.g. left the territory team"
                  className="mb-2 text-body"
                />
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="danger" disabled={!reason.trim()}
                    onClick={() => { s.setMemberStatus(openMember.id, "deactivated", reason.trim()); setReason(""); setDeactivating(null); }}>
                    Deactivate
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeactivating(null)}>Cancel</Button>
                </div>
              </div>
            )}
          </Stack>
        )}
      </Sheet>
    </Stack>
  );
}
