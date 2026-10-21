"use client";

import { SelectMenu } from "@/components/ui/select-menu";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";
import { Check, RotateCcw, Shield, UserPlus } from "lucide-react";
import { Text } from "@/components/ui/text";
import { Chip } from "@/components/ui/chip";
import { Stack } from "@/components/ui/stack";
import { Field } from "@/components/ui/field";
import { InviteModal, RoleConfigModal } from "@/features/settings/team-modals";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/patterns/sheet";
import { DataTable, type DataColumn } from "@/components/patterns/data-table";
import { useSettingsStore } from "@/features/settings/settings-store";
import { SettingsCard, CheckRow } from "@/features/settings/settings-parts";
import {
  PERMISSIONS, SENIORITY, includedNote, rolePermissions,
  type JoinRequest, type Member, type Role, type Seniority,
} from "@/features/settings/settings-types";
import { cn } from "@/lib/cn";

const STATUS_TONE = { active: "ok", invited: "warn", deactivated: "default" } as const;

/** Same set regardless of order — used for the "differs from role" marker. */
function sameSet(a: readonly string[], b: readonly string[]) {
  return a.length === b.length && a.every((x) => b.includes(x));
}

export function SectionTeam() {
  const s = useSettingsStore();
  const router = useRouter();
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [openMemberId, setOpenMemberId] = useState<string | null>(null);
  /* Adding people and defining roles are separate jobs, so separate modals. */
  const [inviteOpen, setInviteOpen] = useState(false);
  const [rolesOpen, setRolesOpen] = useState(false);
  const [deactivating, setDeactivating] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
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
        const custom = !sameSet(m.permissions, rolePermissions(s.roles, m.role));
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

  return (
    <Stack gap={4}>
      {s.joinRequests.length > 0 && (
        <SettingsCard title="Join requests" description="People asking for access to this workspace.">
          <Stack gap={2}>
            {s.joinRequests.map((r) => <JoinRequestRow key={r.id} request={r} />)}
          </Stack>
        </SettingsCard>
      )}

      <SettingsCard
        title="Members"
        description="Field-force reps are members with the Field Force role, filter to see just them."
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setRolesOpen(true)}>
              <Shield className="size-3.5" /> Role configuration
            </Button>
            <Button size="sm" onClick={() => setInviteOpen(true)}>
              <UserPlus className="size-3.5" /> Invite
            </Button>
          </div>
        }
      >
        <Stack gap={3}>
          <div className="flex flex-wrap items-center gap-1.5">
            <Text size="label" tone="muted" weight="semibold" className="mr-1">Filter</Text>
            <button type="button" onClick={() => setRoleFilter("all")}
              className={cn("rounded-chip border px-2.5 py-1 transition-colors cursor-pointer",
                roleFilter === "all" ? "border-brand bg-tint text-brand-deep" : "border-hair-2 bg-card text-ink-3 hover:border-hair-3")}>
              <span className="text-label font-bold">All</span>
            </button>
            {s.roles.map(({ name: r }) => (
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
                  <div className="flex items-center gap-2">
                    <Text size="body" weight="semibold" className="block truncate">{i.email}</Text>
                    {i.expired && <Chip tone="warn" size="xs">Expired</Chip>}
                  </div>
                  <Text size="caption" tone="muted" className="block">
                    {i.role} · {i.seniority} · {i.invitedAt.startsWith("resent") ? i.invitedAt : `invited ${i.invitedAt}`}
                    {i.expired && " · the link no longer works, resend to issue a new one"}
                  </Text>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {/* Prototype: what the invitee sees when they open the email's link. */}
                  <Button size="sm" variant="ghost" onClick={() => { useWorkspaceStore.getState().setAuthView("invite"); router.push(`/auth?invite=${i.id}`); }}>
                    Open invite link
                  </Button>
                  <ResendButton onResend={() => s.resendInvite(i.id)} />
                  <Button size="sm" variant="secondary" onClick={() => s.revokeInvite(i.id)}>Revoke</Button>
                </div>
              </div>
            ))}
          </Stack>
        </SettingsCard>
      )}

      {/* Mounted per opening, so each invite starts fresh. */}
      {inviteOpen && (
        <InviteModal
          open
          onClose={() => setInviteOpen(false)}
          onManageRoles={() => { setInviteOpen(false); setRolesOpen(true); }}
        />
      )}
      {rolesOpen && (
        <RoleConfigModal open onClose={() => setRolesOpen(false)} onShowMembers={(r) => setRoleFilter(r)} />
      )}

      {/* Member drawer — role, seniority, permissions, deactivation. */}
      <Sheet
        open={Boolean(openMember)}
        onClose={() => { setOpenMemberId(null); setDeactivating(null); setRemoving(false); }}
        side="right"
        size={480}
        title={openMember?.name ?? ""}
        description={openMember?.email}
        footer={
          openMember ? (
            <div className="flex flex-wrap items-center gap-2">
              {openMember.status !== "deactivated" ? (
                <Button size="sm" variant="danger" onClick={() => { setRemoving(false); setDeactivating(openMember.id); }}>Deactivate</Button>
              ) : (
                <Button size="sm" variant="secondary" onClick={() => s.setMemberStatus(openMember.id, "active")}>Reactivate</Button>
              )}
              {openMember.id !== s.currentUserId && (
                <Button size="sm" variant="ghost" onClick={() => { setDeactivating(null); setRemoving(true); }}>
                  Remove from {s.workspaceName}
                </Button>
              )}
            </div>
          ) : undefined
        }
      >
        {openMember && (
          <Stack gap={4}>
            {openMember.status === "deactivated" && openMember.deactivationReason && (
              <div className="rounded-control border border-hair bg-subtle px-3 py-2">
                <Text size="label" tone="muted">Deactivated, {openMember.deactivationReason}</Text>
              </div>
            )}

            <div>
              <Text size="label" tone="muted" weight="semibold" className="mb-1.5 block">Role</Text>
              <SelectMenu size="md" ariaLabel="Role" value={openMember.role} onChange={(v) => s.setMemberRole(openMember.id, v as Role)} options={s.roles.map((r) => ({ value: r.name, label: r.name, hint: `${r.permissions.length} of ${PERMISSIONS.length} permissions` }))} />
              <Text size="caption" tone="subtle" className="mt-1 block">
                Changing the role re-seeds the permissions below.
              </Text>
            </div>

            <div>
              <Text size="label" tone="muted" weight="semibold" className="mb-1.5 block">Seniority</Text>
              <SelectMenu size="md" ariaLabel="Seniority" value={openMember.seniority} onChange={(v) => s.setMemberSeniority(openMember.id, v as Seniority)} options={SENIORITY} />
              <Text size="caption" tone="subtle" className="mt-1 block">
                Carries no permissions itself. It is used for approval routing.
              </Text>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <Text size="label" tone="muted" weight="semibold">Permissions</Text>
                {!sameSet(openMember.permissions, rolePermissions(s.roles, openMember.role)) && (
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
                Seeded from {openMember.role}. Unselecting one affects only {openMember.name.split(" ")[0]}. It never changes the role for anyone else.
              </Text>
              <Stack gap={2}>
                {PERMISSIONS.map((p) => (
                  <CheckRow
                    key={p.id}
                    checked={openMember.permissions.includes(p.id)}
                    onChange={() => s.toggleMemberPermission(openMember.id, p.id)}
                    label={p.label}
                    trailing={p.trailing}
                    lockedNote={includedNote(openMember.permissions, p.id)}
                  />
                ))}
              </Stack>
            </div>

            {removing && (
              <div className="rounded-panel border border-hair-2 bg-subtle p-3">
                <Text size="body" weight="bold" className="mb-1.5 block">Remove {openMember.name} from {s.workspaceName}?</Text>
                <Text size="label" tone="muted" className="mb-2 block">
                  They lose access to this workspace only, and their approval chain here is cleared. Other workspaces they&apos;re in are untouched, and what they made stays.
                </Text>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="danger" onClick={() => { s.removeMember(openMember.id); setRemoving(false); setOpenMemberId(null); }}>
                    Remove
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setRemoving(false)}>Cancel</Button>
                </div>
              </div>
            )}

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

/**
 * A join request, approved with a role the admin picks. It used to approve
 * everyone as "Read only", which could even be a role that no longer
 * existed once an admin had removed it.
 */
function JoinRequestRow({ request }: { request: JoinRequest }) {
  const s = useSettingsStore();
  /* Start from the least access: the role with the fewest permissions. */
  const leastAccess = [...s.roles].sort((a, b) => a.permissions.length - b.permissions.length)[0]?.name ?? "";
  const [choosing, setChoosing] = useState(false);
  const [role, setRole] = useState<Role>(leastAccess);
  const [seniority, setSeniority] = useState<Seniority>("Associate");
  const activeRole = s.roles.some((r) => r.name === role) ? role : leastAccess;

  return (
    <div className="rounded-control border border-warn-line bg-warn-bg px-3 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <Text size="body" weight="semibold" className="block">{request.name}</Text>
          <Text size="caption" tone="muted" className="block">{request.email} · asked {request.requestedAt}</Text>
          {request.note && <Text size="caption" tone="subtle" className="mt-0.5 block italic">“{request.note}”</Text>}
        </div>
        {!choosing && (
          <div className="flex shrink-0 items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => s.resolveJoinRequest(request.id, false)}>Decline</Button>
            <Button size="sm" onClick={() => setChoosing(true)}>Approve</Button>
          </div>
        )}
      </div>
      {/* Approving asks what they join as. */}
      {choosing && (
        <div className="mt-2.5 flex flex-wrap items-end gap-2 border-t border-warn-line pt-2.5">
          <div className="flex w-52 flex-col gap-1">
            <Text size="caption" tone="muted" weight="semibold">Role</Text>
            <SelectMenu size="sm" ariaLabel="Role" value={activeRole} onChange={setRole} options={s.roles.map((r) => ({ value: r.name, label: r.name, hint: `${r.permissions.length} of ${PERMISSIONS.length} permissions` }))} menuMinWidth={240} />
          </div>
          <div className="flex w-36 flex-col gap-1">
            <Text size="caption" tone="muted" weight="semibold">Seniority</Text>
            <SelectMenu size="sm" ariaLabel="Seniority" value={seniority} onChange={(v) => setSeniority(v as Seniority)} options={SENIORITY} />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setChoosing(false)}>Cancel</Button>
            <Button size="sm" onClick={() => s.resolveJoinRequest(request.id, true, activeRole, seniority)}>
              Approve as {activeRole}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Resend, with a moment of "Sent" so the click is seen to have done something. */
function ResendButton({ onResend }: { onResend: () => void }) {
  const [sent, setSent] = useState(false);
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={sent}
      onClick={() => {
        onResend();
        setSent(true);
        window.setTimeout(() => setSent(false), 2500);
      }}
      className="gap-1.5"
    >
      {sent ? <><Check className="size-3.5 text-ok" /> Sent</> : "Resend"}
    </Button>
  );
}
