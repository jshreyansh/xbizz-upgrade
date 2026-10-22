"use client";

import { SelectMenu } from "@/components/ui/select-menu";
import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { AlertTriangle, Check, Lock, Plus, RotateCcw, Send, Trash2, Users, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { Chip } from "@/components/ui/chip";
import { Stack } from "@/components/ui/stack";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/features/settings/settings-store";
import { AccessGrid } from "@/features/settings/settings-parts";
import {
  SENIORITY, accessHeadline, roleSees, rolePermissions, setLevel, type AreaId, type LevelId,
  type PermissionId, type Role, type Seniority,
} from "@/features/settings/settings-types";
import { cn } from "@/lib/cn";

/**
 * The two jobs behind "add someone to the team", kept apart.
 *
 * Role configuration is the admin defining what a role is: its name and the
 * permissions it carries. Invite is adding people under one of those roles.
 * They were one expanding panel, where the roles were a fixed list and the
 * only way to get a "Creative team" was to re-tick Design's boxes for every
 * invitee. Now the admin defines it once, and every invite starts from it —
 * still adjustable for the one person being invited.
 */

function sameSet(a: readonly string[], b: readonly string[]) {
  return a.length === b.length && a.every((x) => b.includes(x));
}

/* ─────────────────────────────── Invite ─────────────────────────────── */

export function InviteModal({
  open,
  onClose,
  onManageRoles,
}: {
  open: boolean;
  onClose: () => void;
  onManageRoles: () => void;
}) {
  const s = useSettingsStore();
  const firstRole = s.roles.find((r) => r.name === "Marketing")?.name ?? s.roles[0]?.name ?? "";
  /* Each address becomes a chip once a comma, space or Enter follows it. */
  const [emails, setEmails] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [role, setRole] = useState<Role>(firstRole);
  const [seniority, setSeniority] = useState<Seniority>("Associate");
  /* Seeded from the role, then editable for this invitee only. */
  const [perms, setPerms] = useState<PermissionId[]>(rolePermissions(s.roles, firstRole));
  /* A role removed or renamed since the modal last opened falls back to the first. */
  const activeRole = s.roles.some((r) => r.name === role) ? role : firstRole;
  const roleDefault = rolePermissions(s.roles, activeRole);
  /* What gets invited: the valid chips, plus a valid address still being typed. */
  const list = [...emails, ...(isEmail(draft.trim()) ? [draft.trim()] : [])].filter(isEmail);
  const invalid = emails.filter((e) => !isEmail(e)).length;

  const pickRole = (next: Role) => {
    setRole(next);
    setPerms(rolePermissions(s.roles, next));
  };
  const send = () => {
    if (!list.length) return;
    s.sendInvites(list, activeRole, seniority, perms);
    setEmails([]);
    setDraft("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title="Invite teammates"
      description="They join with the role you pick, and the permissions below."
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={send} disabled={!list.length}>
            <Send className="size-3.5" />
            {list.length > 1 ? `Send ${list.length} invites` : "Send invite"}
          </Button>
        </div>
      }
    >
      <Stack gap={4}>
        <EmailChips emails={emails} draft={draft} onEmails={setEmails} onDraft={setDraft} />
        {invalid > 0 && (
          <Text size="caption" className="-mt-2 block text-warn">
            {invalid === 1 ? "One address doesn’t look right" : `${invalid} addresses don’t look right`}. Fix or remove {invalid === 1 ? "it" : "them"}; only valid addresses are invited.
          </Text>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Text size="label" tone="muted" weight="semibold">Role</Text>
            <SelectMenu size="md" ariaLabel="Role" value={activeRole} onChange={pickRole} options={s.roles.map((r) => ({ value: r.name, label: r.name, hint: accessHeadline(r.permissions) }))} />
          </div>
          <div className="flex flex-col gap-1">
            <Text size="label" tone="muted" weight="semibold">Seniority</Text>
            <SelectMenu size="md" ariaLabel="Seniority" value={seniority} onChange={(v) => setSeniority(v as Seniority)} options={SENIORITY} />
          </div>
        </div>
        {/* The roles come from Role configuration; this is where to change them. */}
        <Text size="caption" tone="subtle" className="-mt-2 block">
          Roles and what they include are set in{" "}
          <button type="button" onClick={onManageRoles} className="cursor-pointer font-semibold text-brand hover:underline">
            Role configuration
          </button>
          .
        </Text>

        <div>
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
            <Text size="label" tone="muted" weight="semibold">Access</Text>
            {!sameSet(perms, roleDefault) && (
              <button
                type="button"
                onClick={() => setPerms(roleDefault)}
                className="flex cursor-pointer items-center gap-1 text-brand hover:underline"
              >
                <RotateCcw className="size-3" />
                <span className="text-label font-bold">Reset to {activeRole}</span>
              </button>
            )}
          </div>
          <Text size="caption" tone="subtle" className="mb-2 block">
            Seeded from {activeRole}. Changing a level here affects only these invitees, never the role.
          </Text>
          <AccessGrid perms={perms} onLevel={(area, level) => setPerms((cur) => setLevel(cur, area, level))} />
        </div>
      </Stack>
    </Modal>
  );
}

/* ─────────────────────────────── Email chips ─────────────────────────────── */

export const isEmail = (v: string) => /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]{2,}$/.test(v);

/**
 * The addresses as chips, the way a mail client's To field holds them. A
 * comma, space, semicolon, Enter or Tab after an address turns it into a
 * chip; pasting a list splits it; Backspace in an empty field takes the last
 * chip back to edit. A chip that isn't an address is marked rather than
 * dropped, so a typo can be seen and fixed.
 */
export function EmailChips({
  emails,
  draft,
  onEmails,
  onDraft,
}: {
  emails: string[];
  draft: string;
  onEmails: (next: string[]) => void;
  onDraft: (next: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const add = (raw: string) => {
    const parts = raw.split(/[\s,;]+/).map((p) => p.trim()).filter(Boolean);
    if (!parts.length) return;
    const known = new Set(emails.map((e) => e.toLowerCase()));
    onEmails([...emails, ...parts.filter((p) => !known.has(p.toLowerCase()) && (known.add(p.toLowerCase()), true))]);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ([",", ";", " ", "Enter", "Tab"].includes(e.key) && draft.trim()) {
      if (e.key !== "Tab") e.preventDefault();
      add(draft);
      onDraft("");
    } else if (e.key === "Backspace" && !draft && emails.length) {
      e.preventDefault();
      onDraft(emails[emails.length - 1]);
      onEmails(emails.slice(0, -1));
    }
  };
  /* However the text arrived (typed, pasted, autocompleted), everything
     before the last separator becomes chips; the rest stays to keep typing. */
  const onChange = (value: string) => {
    if (!/[\s,;]/.test(value)) return onDraft(value);
    const parts = value.split(/[\s,;]+/);
    const rest = parts.pop() ?? "";
    add(parts.join(" "));
    onDraft(rest);
  };
  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (!/[\s,;]/.test(text)) return;
    e.preventDefault();
    add(draft + text);
    onDraft("");
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="invite-emails" className="text-label font-semibold text-ink-2">Email addresses</label>
      <div
        onClick={() => inputRef.current?.focus()}
        className="flex min-h-[2.75rem] w-full cursor-text flex-wrap items-center gap-1.5 rounded-control border border-hair-2 bg-card px-2 py-1.5 transition-colors focus-within:border-brand focus-within:ring-1 focus-within:ring-brand/20"
      >
        {emails.map((email) => {
          const ok = isEmail(email);
          return (
            <span
              key={email}
              title={ok ? email : `${email} isn’t an email address`}
              className={cn(
                "inline-flex max-w-[15rem] items-center gap-1.5 rounded-full border py-0.5 pl-0.5 pr-1",
                ok ? "border-hair-2 bg-subtle text-ink" : "border-warn-line bg-warn-bg text-warn"
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full text-micro font-extrabold uppercase",
                  ok ? "bg-tint text-brand-deep" : "bg-warn text-white"
                )}
              >
                {ok ? email[0] : "!"}
              </span>
              <span className="truncate text-label font-semibold">{email}</span>
              <button
                type="button"
                aria-label={`Remove ${email}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onEmails(emails.filter((x) => x !== email));
                }}
                className="grid size-4 shrink-0 cursor-pointer place-items-center rounded-full text-ink-4 transition-colors hover:bg-black/10 hover:text-ink"
              >
                <X className="size-3" />
              </button>
            </span>
          );
        })}
        <input
          ref={inputRef}
          id="invite-emails"
          autoFocus
          value={draft}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onBlur={() => {
            if (draft.trim()) {
              add(draft);
              onDraft("");
            }
          }}
          placeholder={emails.length ? "" : "name@velmora.com, other@velmora.com"}
          aria-describedby="invite-emails-hint"
          className="min-w-[10rem] flex-1 bg-transparent px-1.5 py-1 text-body-lg font-medium text-ink outline-none placeholder:text-ink-4"
        />
      </div>
      <span id="invite-emails-hint" className="text-micro text-ink-3">
        Several at once: press comma, space or Enter after each address, or paste a list.
      </span>
    </div>
  );
}

/* ─────────────────────────── Role configuration ─────────────────────────── */

const NEW = "__new__";

export function RoleConfigModal({
  open,
  onClose,
  onShowMembers,
}: {
  open: boolean;
  onClose: () => void;
  /** Filter the members list to a role, so they can be moved before it is removed. */
  onShowMembers: (role: Role) => void;
}) {
  const s = useSettingsStore();
  const [selected, setSelected] = useState<string>(s.roles[0]?.name ?? NEW);
  const [draftName, setDraftName] = useState(s.roles[0]?.name ?? "");
  const [draftPerms, setDraftPerms] = useState<PermissionId[]>(s.roles[0]?.permissions ?? []);
  const [blocked, setBlocked] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isNew = selected === NEW;
  const role = s.roles.find((r) => r.name === selected);
  const members = s.members.filter((m) => m.role === selected && m.status !== "deactivated");
  const deactivated = s.members.filter((m) => m.role === selected && m.status === "deactivated");
  const invites = s.invites.filter((i) => i.role === selected);
  const stages = s.chains.flatMap((c) => c.stages).filter((st) => st.role === selected);
  const inUse = members.length + deactivated.length + invites.length + stages.length > 0;

  const nameTaken = s.roles.some((r) => r.name.toLowerCase() === draftName.trim().toLowerCase() && r.name !== selected);
  const dirty = isNew || (role && (draftName.trim() !== role.name || !sameSet(draftPerms, role.permissions)));
  const valid = draftName.trim().length > 0 && !nameTaken;

  const open_ = (name: string) => {
    const r = s.roles.find((x) => x.name === name);
    setSelected(name);
    setDraftName(r?.name ?? "");
    setDraftPerms(r ? [...r.permissions] : []);
    setBlocked(false);
    setConfirmDelete(false);
  };
  const startNew = () => {
    setSelected(NEW);
    setDraftName("");
    setDraftPerms([]);
    setBlocked(false);
    setConfirmDelete(false);
  };
  const save = () => {
    if (!valid) return;
    const name = draftName.trim();
    if (isNew) s.addRole(name, draftPerms);
    else s.updateRole(selected, { name, permissions: draftPerms });
    setSelected(name);
  };
  const tryDelete = () => {
    if (inUse) {
      setBlocked(true);
      return;
    }
    setConfirmDelete(true);
  };
  const doDelete = () => {
    s.removeRole(selected);
    const next = s.roles.find((r) => r.name !== selected);
    if (next) open_(next.name);
    else startNew();
  };
  const setPerm = (area: AreaId, level: LevelId) => {
    /* Workspace admin keeps admin, or nobody could manage roles again. */
    if (role?.locked && area === "admin") return;
    setDraftPerms((cur) => setLevel(cur, area, level));
  };

  const countFor = (name: string) => s.members.filter((m) => m.role === name && m.status !== "deactivated").length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title="Role configuration"
      description="Define what each role can do. Invites start from these; a teammate can still be adjusted one by one."
      footer={
        <div className="flex w-full items-center justify-end">
          <Button size="sm" variant="secondary" onClick={onClose}>Done</Button>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-[260px_minmax(0,1fr)]">
        {/* The roles, with the way to add one first rather than after the whole list. */}
        <div className="flex flex-col gap-1.5">
          <Button size="sm" variant="secondary" onClick={startNew} className={cn("mb-1 justify-start gap-1.5", isNew && "border-brand text-brand-deep")}>
            <Plus className="size-3.5" />
            New role
          </Button>
          {s.roles.map((r) => (
            <button
              key={r.name}
              type="button"
              onClick={() => open_(r.name)}
              className={cn(
                "flex w-full cursor-pointer items-center gap-2.5 rounded-control border px-3 py-2.5 text-left transition-colors",
                selected === r.name ? "border-brand bg-tint ring-2 ring-brand/15" : "border-hair-2 bg-card hover:border-hair-3 hover:bg-canvas"
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <Text size="body" weight="semibold" className="truncate text-ink">{r.name}</Text>
                  {r.locked && <Lock className="size-3 shrink-0 text-ink-4" aria-label="Can't be removed" />}
                </span>
                <Text size="caption" tone="muted" className="block">
                  {countFor(r.name)} {countFor(r.name) === 1 ? "member" : "members"} · {accessHeadline(r.permissions)}
                </Text>
              </span>
              <Chip size="xs" tone={r.system ? "default" : "brand"}>{r.system ? "System" : "Custom"}</Chip>
            </button>
          ))}
        </div>

        {/* The one being edited. */}
        <div className="flex min-w-0 flex-col gap-4 rounded-panel border border-hair bg-canvas p-4">
          {/* Save and delete sit at the top, and stay there while the access grid scrolls. */}
          <div className="sticky top-0 z-10 -mx-4 -mt-4 flex items-center gap-2 rounded-t-panel border-b border-hair bg-canvas px-4 py-3">
            <Text size="body" weight="bold" className="min-w-0 truncate">{isNew ? "New role" : role?.name}</Text>
            <div className="ml-auto flex items-center gap-2">
            {!isNew && !role?.locked && (
              <Button size="sm" variant="ghost" onClick={tryDelete} className="gap-1.5 text-danger hover:text-danger">
                <Trash2 className="size-3.5" />
                Delete role
              </Button>
            )}
            {!isNew && role?.locked && (
              <Text size="caption" tone="subtle" className="flex items-center gap-1">
                <Lock className="size-3" /> Workspace admin can&rsquo;t be deleted.
              </Text>
            )}
              {dirty && !isNew && (
                <Button size="sm" variant="ghost" onClick={() => open_(selected)}>Discard</Button>
              )}
              <Button size="sm" onClick={save} disabled={!dirty || !valid}>
                {isNew ? "Create role" : "Save changes"}
              </Button>
            </div>
          </div>

          {/* Can't remove a role people still have. */}
          {blocked && (
            <div className="rounded-control border border-warn-line bg-warn-bg p-3">
              <p className="flex items-center gap-1.5 text-body font-bold text-ink">
                <AlertTriangle className="size-4 shrink-0 text-warn" />
                {`${role?.name ?? "This role"} can’t be deleted yet`}
              </p>
              <Text size="label" tone="muted" className="mt-1 block">
                Still using it:{" "}
                {[
                  members.length && `${members.length} ${members.length === 1 ? "member" : "members"} (${members.map((m) => m.name).join(", ")})`,
                  deactivated.length && `${deactivated.length} deactivated ${deactivated.length === 1 ? "member" : "members"}`,
                  invites.length && `${invites.length} pending ${invites.length === 1 ? "invite" : "invites"}`,
                  stages.length && `${stages.length} approval-chain ${stages.length === 1 ? "stage" : "stages"}`,
                ].filter(Boolean).join(", ")}
                . Move them to another role first, then delete it.
              </Text>
              {(members.length > 0 || deactivated.length > 0) && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-2"
                  onClick={() => {
                    onShowMembers(selected);
                    onClose();
                  }}
                >
                  Show these members
                </Button>
              )}
            </div>
          )}

          {confirmDelete && (
            <div className="rounded-control border border-danger bg-danger-bg p-3">
              <Text size="body" weight="bold" className="block text-danger">Delete {role?.name}?</Text>
              <Text size="label" tone="muted" className="mt-1 block">Nobody uses it, so nothing else changes. It won&rsquo;t be offered in invites any more.</Text>
              <div className="mt-2 flex items-center gap-2">
                <Button size="sm" variant="danger" onClick={doDelete}>Delete role</Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>Cancel</Button>
              </div>
            </div>
          )}

          <Field
            label="Role name"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder="e.g. Creative team"
            error={nameTaken ? "A role with this name already exists." : undefined}
            autoFocus={isNew}
          />

          <div>
            <Text size="label" tone="muted" weight="semibold" className="mb-1.5 block">Access</Text>
            <AccessGrid perms={draftPerms} onLevel={setPerm} lockAdmin={role?.locked ? "The Workspace admin role always keeps this" : undefined} />
          </div>

          {/* The permissions in the app's own words: what someone in this role will find. */}
          <div className="rounded-control border border-hair bg-card p-3">
            <Text size="label" weight="bold" className="mb-1.5 block">What this role sees</Text>
            <ul className="grid gap-1">
              {roleSees(draftPerms).sees.map((line) => (
                <li key={line} className="flex items-start gap-1.5">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-ok" strokeWidth={3} />
                  <Text size="caption" tone="muted">{line}</Text>
                </li>
              ))}
            </ul>
            {roleSees(draftPerms).cant.length > 0 && (
              <Text size="caption" tone="subtle" className="mt-2 block">Hidden: {roleSees(draftPerms).cant.join(" · ")}</Text>
            )}
          </div>

          {!isNew && members.length > 0 && (
            <Text size="caption" tone="muted" className="flex items-start gap-1.5">
              <Users className="mt-0.5 size-3.5 shrink-0" />
              {members.length} {members.length === 1 ? "member has" : "members have"} this role. Saving updates everyone still on its defaults; anyone with a custom set keeps theirs.
            </Text>
          )}


        </div>
      </div>
    </Modal>
  );
}
