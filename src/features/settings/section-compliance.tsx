"use client";

import { useCan } from "@/features/settings/view-as";
import { SelectMenu } from "@/components/ui/select-menu";
import { useState } from "react";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { Text } from "@/components/ui/text";
import { Chip } from "@/components/ui/chip";
import { Stack } from "@/components/ui/stack";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/patterns/sheet";
import { SortableList } from "@/components/patterns/sortable-list";
import { DataTable, type DataColumn } from "@/components/patterns/data-table";
import { DEFAULT_CHAIN_ID, chainStagesFor, useSettingsStore } from "@/features/settings/settings-store";
import { stageReviewers } from "@/features/review/review-store";
import { SettingsCard, SettingRow, Toggle } from "@/features/settings/settings-parts";
import {
  SENIORITY,
  type ApprovalStage, type Member, type Role, type Seniority,
} from "@/features/settings/settings-types";

/**
 * One chain per person, not global chains with scopes.
 *
 * The list is filtered to members who can create content, because a chain routes
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
  const canManageChains = useCan().can("chainsManage");
  const [editing, setEditing] = useState<string | null>(null);

  const creators = s.members.filter(
    (m) => m.permissions.includes("create") && m.status !== "deactivated",
  );
  const chainFor = (id: string) => s.chains.find((c) => c.memberId === id)?.stages ?? [];
  /* Someone with no chain of their own uses the default. */
  const usesDefault = (id: string) => !s.chains.some((c) => c.memberId === id);
  const defaultStages = chainFor(DEFAULT_CHAIN_ID);
  const DEFAULT_MEMBER: Member = { id: DEFAULT_CHAIN_ID, name: "New creators", email: "", role: "", seniority: "Associate", permissions: [], status: "active", lastActive: "" };
  const editMember = s.members.find((m) => m.id === editing) ?? (editing === DEFAULT_CHAIN_ID ? DEFAULT_MEMBER : null);

  // Without Approval chains: Manage, it's your own chain if you create, and the chains you review in if you approve.
  if (!canManageChains) {
    const mine = chainStagesFor(s, s.currentUserId);
    const me = s.members.find((m) => m.id === s.currentUserId);
    return (
      <Stack gap={4}>
        {me?.permissions.includes("create") && (
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
            <Text size="caption" tone="subtle" className="mt-3 block">
              You are {me.role} · {me.seniority}. Ask an admin to change this chain.
            </Text>
          </SettingsCard>
        )}
        {me?.permissions.includes("approve") && <ChainsYouReview meId={me.id} />}
      </Stack>
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
        if (usesDefault(m.id)) return <Text size="caption" tone="subtle">Default ({defaultStages.length} {defaultStages.length === 1 ? "stage" : "stages"})</Text>;
        if (stages.length === 0) return <Text size="caption" tone="subtle">None: publishes straight away</Text>;
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
    { key: "count", header: "Stages", numeric: true, secondary: true, cell: (m) => chainStagesFor(s, m.id).length },
    {
      key: "status", header: "Status",
      cell: (m) => usesDefault(m.id)
        ? <Chip tone="default" size="xs">Default</Chip>
        : chainFor(m.id).length > 0
          ? <Chip tone="ok" size="xs">Own chain</Chip>
          : <Chip tone="warn" size="xs">No review</Chip>,
    },
  ];

  return (
    <Stack gap={4}>
      <SettingsCard
        title="Default chain for new creators"
        description="Anyone who can create and has no chain of their own goes through this, including people who join later."
        actions={<Button size="sm" variant="secondary" onClick={() => setEditing(DEFAULT_CHAIN_ID)}>Edit</Button>}
      >
        {defaultStages.length === 0 ? (
          <Text size="body" tone="muted">No default. New creators publish straight from draft.</Text>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone="default" size="sm">Draft</Chip>
            {defaultStages.map((st) => (
              <span key={st.id} className="flex items-center gap-2">
                <ArrowRight className="size-3.5 text-ink-3" />
                <Chip tone="brand" size="sm">{st.name}</Chip>
              </span>
            ))}
            <ArrowRight className="size-3.5 text-ink-3" />
            <Chip tone="ok" size="sm">Approved</Chip>
          </div>
        )}
      </SettingsCard>

      <SettingsCard
        title="Approval chains"
        description="One chain per person, for everyone who creates work. Reviewers do not appear. They are the approvers."
      >
        <DataTable
          columns={columns}
          rows={creators}
          rowKey={(m) => m.id}
          onRowClick={(m) => setEditing(m.id)}
          empty="Nobody can create content yet."
        />
        <Text size="caption" tone="subtle" className="mt-3 block">
          {creators.length} of {s.members.length} members can create content. Click a row to edit that chain.
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
        onClose={() => setEditing(null)}
        side="right"
        size={560}
        title={editMember ? (editMember.id === DEFAULT_CHAIN_ID ? "Default chain for new creators" : `${editMember.name}'s chain`) : ""}
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
                    { id: uid(), name: "New stage", role: "Medical reviewer", narrowTo: { kind: "anyone" } },
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
                      <div className="flex w-48 flex-col gap-1">
                        <Text size="caption" tone="muted" weight="semibold">Role considered</Text>
                        <SelectMenu
                          size="sm"
                          ariaLabel="Role considered"
                          value={st.role}
                          menuMinWidth={220}
                          onChange={(v) => s.setChainStages(editMember.id,
                            chainFor(editMember.id).map((x) => (x.id === st.id ? { ...x, role: v as Role, narrowTo: { kind: "anyone" } } : x)))}
                          options={s.roles.map((r) => r.name)}
                        />
                      </div>

                      <div className="flex w-48 flex-col gap-1">
                        <Text size="caption" tone="muted" weight="semibold">Narrow to</Text>
                        <SelectMenu
                          size="sm"
                          ariaLabel="Narrow to"
                          value={st.narrowTo.kind}
                          menuMinWidth={220}
                          onChange={(v) => {
                            const kind = v as "anyone" | "person" | "seniority";
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
                          options={[
                            { value: "anyone", label: "Anyone in the role" },
                            { value: "person", label: "A named person" },
                            { value: "seniority", label: "A seniority floor" },
                          ]}
                        />
                      </div>

                      {st.narrowTo.kind === "person" && (
                        <div className="flex w-48 flex-col gap-1">
                          <Text size="caption" tone="muted" weight="semibold">Person</Text>
                          <SelectMenu
                            size="sm"
                            ariaLabel="Person"
                            value={st.narrowTo.memberId}
                            placeholder="No one in this role"
                            onChange={(v) => s.setChainStages(editMember.id,
                              chainFor(editMember.id).map((x) => (x.id === st.id ? { ...x, narrowTo: { kind: "person", memberId: v } } : x)))}
                            options={s.members.filter((m) => m.role === st.role && m.status === "active").map((m) => ({ value: m.id, label: m.name, hint: m.seniority }))}
                          />
                        </div>
                      )}

                      {st.narrowTo.kind === "seniority" && (
                        <div className="flex w-40 flex-col gap-1">
                          <Text size="caption" tone="muted" weight="semibold">Floor, and above</Text>
                          <SelectMenu
                            size="sm"
                            ariaLabel="Seniority floor"
                            value={st.narrowTo.floor}
                            onChange={(v) => s.setChainStages(editMember.id,
                              chainFor(editMember.id).map((x) => (x.id === st.id ? { ...x, narrowTo: { kind: "seniority", floor: v as Seniority } } : x)))}
                            options={SENIORITY}
                          />
                        </div>
                      )}
                    </div>

                    <Text size="caption" tone="subtle">
                      Approved by {narrowLabel(st, s.members)}. If rejected, it goes back to the creator, and after their changes the whole chain reviews it again from step 1.
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

          </Stack>
        )}
      </Sheet>
    </Stack>
  );
}

/**
 * A reviewer's side of the chains: whose work comes to them, at which step,
 * and why it is them (named, by seniority, or anyone in their role). The same
 * rule MLR Review uses to put an item in their queue.
 */
function ChainsYouReview({ meId }: { meId: string }) {
  const s = useSettingsStore();
  const creators = s.members.filter((m) => m.status === "active" && m.permissions.includes("create"));
  const rows = creators
    .map((creator) => {
      const stages = chainStagesFor(s, creator.id);
      const usesDefault = !s.chains.some((c) => c.memberId === creator.id);
      const mineAt = stages.map((st, i) => (stageReviewers(st, s.members).some((m) => m.id === meId) ? i : -1)).filter((i) => i >= 0);
      return { creator, stages, usesDefault, mineAt };
    })
    .filter((r) => r.mineAt.length > 0);

  return (
    <SettingsCard
      title="Chains you review in"
      description="Whose work comes to you in MLR Review, and at which step. Set by an admin."
    >
      {rows.length === 0 ? (
        <Text size="body" tone="muted">
          You aren&apos;t on anyone&apos;s approval chain yet, so nothing comes to you for review. An admin adds reviewers in Compliance &amp; MLR.
        </Text>
      ) : (
        <div className="divide-y divide-hair">
          {rows.map(({ creator, stages, usesDefault, mineAt }) => (
            <div key={creator.id} className="py-3 first:pt-0 last:pb-0">
              <div className="mb-2 flex flex-wrap items-baseline gap-x-2">
                <Text size="body" weight="semibold">{creator.name}</Text>
                <Text size="caption" tone="subtle">{creator.role}{usesDefault ? " · default chain" : ""}</Text>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Chip tone="default" size="xs">Draft</Chip>
                {stages.map((st, i) => (
                  <span key={st.id} className="flex items-center gap-1.5">
                    <ArrowRight className="size-3 text-ink-3" />
                    <Chip tone={mineAt.includes(i) ? "brand" : "default"} size="xs">
                      {mineAt.includes(i) ? `${st.name} · you` : st.name}
                    </Chip>
                  </span>
                ))}
                <ArrowRight className="size-3 text-ink-3" />
                <Chip tone="ok" size="xs">Approved</Chip>
              </div>
              <Text size="caption" tone="subtle" className="mt-1.5 block">
                {mineAt.map((i) => {
                  const st = stages[i];
                  const why = st.narrowTo.kind === "person" ? "you by name" : `${st.role}, ${narrowLabel(st, s.members)}`;
                  return `Step ${i + 1} of ${stages.length}: ${why}`;
                }).join(" · ")}
                . If you send it back, the changed version goes through the whole chain again.
              </Text>
            </div>
          ))}
        </div>
      )}
    </SettingsCard>
  );
}
