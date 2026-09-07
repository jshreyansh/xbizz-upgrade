"use client";

import { useState } from "react";
import { ArrowRight, Copy, Plus, Trash2 } from "lucide-react";
import { Text } from "@/components/ui/text";
import { Chip } from "@/components/ui/chip";
import { Stack } from "@/components/ui/stack";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/patterns/sheet";
import { SortableList } from "@/components/patterns/sortable-list";
import { DataTable, type DataColumn } from "@/components/patterns/data-table";
import { useSettingsStore } from "@/features/settings/settings-store";
import { SettingsCard, SettingRow, Toggle } from "@/features/settings/settings-parts";
import {
  ROLES, SENIORITY,
  type ApprovalStage, type Member, type Role, type Seniority,
} from "@/features/settings/settings-types";

/**
 * One chain per person, not global chains with scopes.
 *
 * The list is filtered to members with Studio access, because a chain routes
 * work that someone CREATES. A Medical reviewer has no chain — they are the
 * approver, not the routed — so they are absent rather than shown empty.
 *
 * Admins get the list and full CRUD. Everyone else sees only their own chain,
 * read-only: marketingiq let non-admins edit MLR stages, which its own code
 * comments flag as a bug.
 */

const uid = () => Math.random().toString(36).slice(2, 9);

function narrowLabel(stage: ApprovalStage, members: Member[]) {
  switch (stage.narrowTo.kind) {
    case "person": {
      const m = members.find((x) => x.id === (stage.narrowTo as { memberId: string }).memberId);
      return m ? m.name : "a named person";
    }
    case "seniority":
      return `${(stage.narrowTo as { floor: Seniority }).floor} and above`;
    default:
      return "anyone in the role";
  }
}

export function SectionCompliance() {
  const s = useSettingsStore();
  const [editing, setEditing] = useState<string | null>(null);
  const [dupFrom, setDupFrom] = useState<string | null>(null);

  const creators = s.members.filter(
    (m) => m.permissions.includes("studio") && m.status !== "deactivated",
  );
  const chainFor = (id: string) => s.chains.find((c) => c.memberId === id)?.stages ?? [];
  const editMember = s.members.find((m) => m.id === editing) ?? null;

  // A non-admin sees only their own chain.
  if (!s.isAdmin) {
    const mine = chainFor(s.currentUserId);
    const me = s.members.find((m) => m.id === s.currentUserId);
    return (
      <SettingsCard
        title="Your approval chain"
        description="The stages your work passes through. Set by an admin."
      >
        {mine.length === 0 ? (
          <Text size="body" tone="muted">
            No chain configured yet. Your work goes straight from draft to approved.
          </Text>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone="default" size="sm">Draft</Chip>
            {mine.map((st) => (
              <span key={st.id} className="flex items-center gap-2">
                <ArrowRight className="size-3.5 text-ink-3" />
                <Chip tone="brand" size="sm">{st.name}</Chip>
              </span>
            ))}
            <ArrowRight className="size-3.5 text-ink-3" />
            <Chip tone="ok" size="sm">Approved</Chip>
          </div>
        )}
        {me && (
          <Text size="caption" tone="subtle" className="mt-3 block">
            You are {me.role} · {me.seniority}. Ask an admin to change this chain.
          </Text>
        )}
      </SettingsCard>
    );
  }

  const columns: DataColumn<Member>[] = [
    {
      key: "person", header: "Person",
      cell: (m) => (
        <div className="min-w-0">
          <Text size="body" weight="semibold" className="block truncate text-ink">{m.name}</Text>
          <Text size="caption" tone="subtle" className="block">{m.role} · {m.seniority}</Text>
        </div>
      ),
    },
    {
      key: "chain", header: "Chain",
      cell: (m) => {
        const stages = chainFor(m.id);
        if (stages.length === 0) return <Text size="caption" tone="subtle">Not configured</Text>;
        return (
          <div className="flex flex-wrap items-center gap-1">
            {stages.map((st, i) => (
              <span key={st.id} className="flex items-center gap-1">
                {i > 0 && <ArrowRight className="size-3 text-ink-3" />}
                <Chip tone="default" size="xs">{st.name}</Chip>
              </span>
            ))}
          </div>
        );
      },
    },
    { key: "count", header: "Stages", numeric: true, secondary: true, cell: (m) => chainFor(m.id).length },
    {
      key: "status", header: "Status",
      cell: (m) => chainFor(m.id).length > 0
        ? <Chip tone="ok" size="xs">Configured</Chip>
        : <Chip tone="warn" size="xs">Not configured</Chip>,
    },
  ];

  return (
    <Stack gap={4}>
      <SettingsCard
        title="Approval chains"
        description="One chain per person, for everyone who creates work. Reviewers do not appear — they are the approvers."
      >
        <DataTable
          columns={columns}
          rows={creators}
          rowKey={(m) => m.id}
          onRowClick={(m) => setEditing(m.id)}
          empty="Nobody has Studio access yet."
        />
        <Text size="caption" tone="subtle" className="mt-3 block">
          {creators.length} of {s.members.length} members have Studio access. Click a row to edit that chain.
        </Text>
      </SettingsCard>

      <SettingsCard title="Content expiry" description="What happens as approved content ages.">
        <div>
          <SettingRow label="Warn before expiry" hint="Days ahead" htmlFor="c-warn">
            <Field
              id="c-warn"
              type="number"
              value={String(s.expiryWarnDays)}
              onChange={(e) => s.setExpiry(Number(e.target.value) || 0, s.autoArchive)}
              className="max-w-24 text-body"
            />
          </SettingRow>
          <SettingRow label="Auto-archive after expiry" hint="Removes it from the library">
            <Toggle
              checked={s.autoArchive}
              label="Auto-archive after expiry"
              onChange={(v) => s.setExpiry(s.expiryWarnDays, v)}
            />
          </SettingRow>
        </div>
      </SettingsCard>

      {/* Chain editor */}
      <Sheet
        open={Boolean(editMember)}
        onClose={() => { setEditing(null); setDupFrom(null); }}
        side="right"
        size={560}
        title={editMember ? `${editMember.name}'s chain` : ""}
        description="Draft and Approved are the fixed ends. Drag to reorder the middle."
        footer={
          editMember && (
            <div className="flex w-full items-center justify-between gap-2">
              <Button size="sm" variant="ghost" onClick={() => s.clearChain(editMember.id)}>Clear chain</Button>
              <Button
                size="sm"
                onClick={() => {
                  s.setChainStages(editMember.id, [
                    ...chainFor(editMember.id),
                    { id: uid(), name: "New stage", role: "Medical reviewer", narrowTo: { kind: "anyone" }, requireAll: false, onReject: "draft" },
                  ]);
                }}
              >
                <Plus className="size-3.5" /> Add stage
              </Button>
            </div>
          )
        }
      >
        {editMember && (
          <Stack gap={4}>
            <div className="flex flex-wrap items-center gap-2 rounded-control border border-hair bg-subtle px-3 py-2.5">
              <Chip tone="default" size="xs">Draft</Chip>
              {chainFor(editMember.id).map((st) => (
                <span key={st.id} className="flex items-center gap-2">
                  <ArrowRight className="size-3 text-ink-3" />
                  <Chip tone="brand" size="xs">{st.name}</Chip>
                </span>
              ))}
              <ArrowRight className="size-3 text-ink-3" />
              <Chip tone="ok" size="xs">Approved</Chip>
            </div>

            {chainFor(editMember.id).length === 0 ? (
              <Text size="body" tone="muted">
                No stages. Work goes straight from draft to approved. Add a stage below.
              </Text>
            ) : (
              <SortableList
                items={chainFor(editMember.id)}
                itemKey={(st) => st.id}
                onReorder={(stages) => s.setChainStages(editMember.id, stages)}
                renderItem={(st, i) => (
                  <Stack gap={2}>
                    <div className="flex items-center gap-2">
                      <Chip tone="default" size="xs">Step {i + 1}</Chip>
                      <Field
                        value={st.name}
                        onChange={(e) => s.setChainStages(editMember.id,
                          chainFor(editMember.id).map((x) => (x.id === st.id ? { ...x, name: e.target.value } : x)))}
                        className="max-w-52 text-body"
                      />
                    </div>

                    <div className="flex flex-wrap items-end gap-2">
                      <label className="flex flex-col gap-1">
                        <Text size="caption" tone="muted" weight="semibold">Role considered</Text>
                        <select
                          value={st.role}
                          onChange={(e) => s.setChainStages(editMember.id,
                            chainFor(editMember.id).map((x) => (x.id === st.id ? { ...x, role: e.target.value as Role, narrowTo: { kind: "anyone" } } : x)))}
                          className="rounded-control border border-hair-2 bg-card px-2.5 py-1.5 text-label text-ink cursor-pointer focus:border-brand focus:outline-none"
                        >
                          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </label>

                      <label className="flex flex-col gap-1">
                        <Text size="caption" tone="muted" weight="semibold">Narrow to</Text>
                        <select
                          value={st.narrowTo.kind}
                          onChange={(e) => {
                            const kind = e.target.value as "anyone" | "person" | "seniority";
                            const inRole = s.members.filter((m) => m.role === st.role && m.status === "active");
                            const narrowTo: ApprovalStage["narrowTo"] =
                              kind === "person"
                                ? { kind: "person", memberId: inRole[0]?.id ?? "" }
                                : kind === "seniority"
                                ? { kind: "seniority", floor: "Director" }
                                : { kind: "anyone" };
                            s.setChainStages(editMember.id,
                              chainFor(editMember.id).map((x) => (x.id === st.id ? { ...x, narrowTo } : x)));
                          }}
                          className="rounded-control border border-hair-2 bg-card px-2.5 py-1.5 text-label text-ink cursor-pointer focus:border-brand focus:outline-none"
                        >
                          <option value="anyone">Anyone in the role</option>
                          <option value="person">A named person</option>
                          <option value="seniority">A seniority floor</option>
                        </select>
                      </label>

                      {st.narrowTo.kind === "person" && (
                        <label className="flex flex-col gap-1">
                          <Text size="caption" tone="muted" weight="semibold">Person</Text>
                          <select
                            value={st.narrowTo.memberId}
                            onChange={(e) => s.setChainStages(editMember.id,
                              chainFor(editMember.id).map((x) => (x.id === st.id ? { ...x, narrowTo: { kind: "person", memberId: e.target.value } } : x)))}
                            className="rounded-control border border-hair-2 bg-card px-2.5 py-1.5 text-label text-ink cursor-pointer focus:border-brand focus:outline-none"
                          >
                            {s.members.filter((m) => m.role === st.role && m.status === "active").map((m) => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                        </label>
                      )}

                      {st.narrowTo.kind === "seniority" && (
                        <label className="flex flex-col gap-1">
                          <Text size="caption" tone="muted" weight="semibold">Floor — and above</Text>
                          <select
                            value={st.narrowTo.floor}
                            onChange={(e) => s.setChainStages(editMember.id,
                              chainFor(editMember.id).map((x) => (x.id === st.id ? { ...x, narrowTo: { kind: "seniority", floor: e.target.value as Seniority } } : x)))}
                            className="rounded-control border border-hair-2 bg-card px-2.5 py-1.5 text-label text-ink cursor-pointer focus:border-brand focus:outline-none"
                          >
                            {SENIORITY.map((r) => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </label>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                      <label className="flex items-center gap-2">
                        <Toggle
                          checked={st.requireAll}
                          label="Everyone must approve"
                          onChange={(v) => s.setChainStages(editMember.id,
                            chainFor(editMember.id).map((x) => (x.id === st.id ? { ...x, requireAll: v } : x)))}
                        />
                        <Text size="label" tone="muted">{st.requireAll ? "Everyone must approve" : "Any one is enough"}</Text>
                      </label>

                      <label className="flex items-center gap-2">
                        <Text size="label" tone="muted">On reject</Text>
                        <select
                          value={st.onReject}
                          onChange={(e) => s.setChainStages(editMember.id,
                            chainFor(editMember.id).map((x) => (x.id === st.id ? { ...x, onReject: e.target.value as "draft" | "previous" } : x)))}
                          className="rounded-control border border-hair-2 bg-card px-2 py-1 text-label text-ink cursor-pointer focus:border-brand focus:outline-none"
                        >
                          <option value="draft">Back to draft</option>
                          <option value="previous">Back one stage</option>
                        </select>
                      </label>
                    </div>

                    <Text size="caption" tone="subtle">
                      Approved by {narrowLabel(st, s.members)}.
                    </Text>
                  </Stack>
                )}
                renderActions={(st) => (
                  <button
                    type="button"
                    aria-label={`Remove ${st.name}`}
                    onClick={() => s.setChainStages(editMember.id, chainFor(editMember.id).filter((x) => x.id !== st.id))}
                    className="grid size-7 place-items-center rounded-glyph text-ink-3 transition-colors hover:bg-subtle hover:text-danger cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              />
            )}

            {/* Ten people on one team usually want one chain — without this, that
                is ten identical builds by hand. */}
            <div className="rounded-panel border border-hair bg-subtle p-3">
              <Text size="label" weight="bold" className="mb-1.5 block">Copy this chain to someone else</Text>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={dupFrom ?? ""}
                  onChange={(e) => setDupFrom(e.target.value || null)}
                  className="rounded-control border border-hair-2 bg-card px-2.5 py-1.5 text-label text-ink cursor-pointer focus:border-brand focus:outline-none"
                >
                  <option value="">Choose a person…</option>
                  {creators.filter((m) => m.id !== editMember.id).map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={!dupFrom || chainFor(editMember.id).length === 0}
                  onClick={() => { if (dupFrom) { s.duplicateChain(editMember.id, dupFrom); setDupFrom(null); } }}
                >
                  <Copy className="size-3.5" /> Copy
                </Button>
              </div>
            </div>
          </Stack>
        )}
      </Sheet>
    </Stack>
  );
}
