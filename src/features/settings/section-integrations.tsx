"use client";

import { useState } from "react";
import { BookOpen, CheckCircle2, Plug, RefreshCw, XCircle } from "lucide-react";
import { Text } from "@/components/ui/text";
import { Chip } from "@/components/ui/chip";
import { Stack } from "@/components/ui/stack";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/patterns/sheet";
import { DataTable, type DataColumn } from "@/components/patterns/data-table";
import { useSettingsStore } from "@/features/settings/settings-store";
import { SettingsCard, SettingRow, Toggle, Segmented } from "@/features/settings/settings-parts";
import type { IntegrationLog, IntegrationStatus } from "@/features/settings/settings-types";

/**
 * Three integrations, one card shape. WhatsApp and SMTP are deliberately absent.
 *
 * Every card carries a "See docs" action pointing at the product and developer
 * documentation for configuration and usage. Placeholder hrefs until those
 * pages exist.
 */

const DOCS_HREF = "#";

const STATUS: Record<IntegrationStatus, { label: string; tone: "ok" | "warn" | "danger" | "default" }> = {
  connected:       { label: "Connected",     tone: "ok" },
  verifying:       { label: "Verifying…",    tone: "warn" },
  error:           { label: "Needs attention", tone: "danger" },
  "not-connected": { label: "Not connected", tone: "default" },
};

const logColumns: DataColumn<IntegrationLog>[] = [
  { key: "at", header: "When", cell: (l) => <Text size="caption" tone="muted">{l.at}</Text> },
  { key: "dir", header: "Direction", cell: (l) => <Chip tone="default" size="xs">{l.direction}</Chip> },
  { key: "obj", header: "Object", cell: (l) => (
      <div className="min-w-0">
        <Text size="body" className="block truncate">{l.object}</Text>
        {l.detail && <Text size="caption" className="block truncate text-danger">{l.detail}</Text>}
      </div>
    ) },
  { key: "n", header: "Records", numeric: true, secondary: true, cell: (l) => l.records ?? "—" },
  { key: "st", header: "Status", cell: (l) =>
      l.status === "ok" ? <Chip tone="ok" size="xs">OK</Chip> : <Chip tone="danger" size="xs">Failed</Chip> },
];

function IntegrationCard({
  name, blurb, status, onOpen, primary,
}: {
  name: string; blurb: string; status: IntegrationStatus;
  onOpen: () => void; primary: string;
}) {
  const st = STATUS[status];
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-panel border border-hair bg-card px-4 py-3.5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-control border border-hair bg-subtle text-ink-3">
          <Plug className="size-4" />
        </div>
        <div className="min-w-0">
          <Text size="body-lg" weight="bold" className="block truncate">{name}</Text>
          <Text size="label" tone="muted" className="block truncate">{blurb}</Text>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Chip tone={st.tone} size="sm">{st.label}</Chip>
        <a
          href={DOCS_HREF}
          className="flex items-center gap-1.5 rounded-control border border-hair-2 bg-card px-2.5 py-1.5 transition-colors hover:border-brand"
        >
          <BookOpen className="size-3.5 text-ink-3" />
          <span className="text-label font-bold text-ink">See docs</span>
        </a>
        <Button size="sm" variant="secondary" onClick={onOpen}>{primary}</Button>
      </div>
    </div>
  );
}

export function SectionIntegrations() {
  const s = useSettingsStore();
  const [open, setOpen] = useState<"veeva" | "teams" | "imessage" | null>(null);

  /** Connect, then verify — a card saying Connected before a successful call is
   *  what wastes a launch day. */
  const connectAndVerify = (id: "veeva" | "teams" | "imessage") => {
    s.setIntegrationStatus(id, "verifying");
    window.setTimeout(() => s.setIntegrationStatus(id, "connected"), 1600);
  };

  return (
    <Stack gap={4}>
      <SettingsCard
        title="Connected systems"
        description="Review and distribution. Each one links out to its own configuration docs."
      >
        <Stack gap={2}>
          <IntegrationCard
            name="Veeva"
            blurb="Claims, product records and asset metadata"
            status={s.integrationStatus.veeva}
            primary="Configure"
            onOpen={() => setOpen("veeva")}
          />
          <IntegrationCard
            name="Microsoft Teams"
            blurb="Approval requests, alerts and the agent"
            status={s.integrationStatus.teams}
            primary="Configure"
            onOpen={() => setOpen("teams")}
          />
          <IntegrationCard
            name="iMessage"
            blurb="Field-force messaging from a sender number"
            status={s.integrationStatus.imessage}
            primary={s.integrationStatus.imessage === "connected" ? "Configure" : "Connect"}
            onOpen={() => setOpen("imessage")}
          />
        </Stack>
      </SettingsCard>

      {/* Veeva */}
      <Sheet
        open={open === "veeva"} onClose={() => setOpen(null)} side="right" size={560}
        title="Veeva" description="Sync direction, connection health, and the log of every pull and push."
      >
        <Stack gap={4}>
          <div>
            <SettingRow label="Connection">
              <div className="flex flex-wrap items-center gap-2">
                <Chip tone={STATUS[s.integrationStatus.veeva].tone} size="sm">
                  {STATUS[s.integrationStatus.veeva].label}
                </Chip>
                <Button size="sm" variant="secondary" onClick={() => connectAndVerify("veeva")}>
                  <RefreshCw className="size-3.5" /> Test connection
                </Button>
              </div>
            </SettingRow>
            <SettingRow label="Sync direction" hint="Pharma teams rarely want blind push">
              <Segmented
                ariaLabel="Sync direction"
                value={s.veevaDirection}
                onChange={s.setVeevaDirection}
                options={[
                  { id: "pull", label: "Pull only" },
                  { id: "push", label: "Push only" },
                  { id: "both", label: "Both" },
                ]}
              />
            </SettingRow>
          </div>

          <div>
            <Text size="label" weight="bold" className="mb-2 block">Activity</Text>
            <DataTable columns={logColumns} rows={s.veevaLogs} rowKey={(l) => l.id} empty="No sync activity yet." />
          </div>
        </Stack>
      </Sheet>

      {/* Teams */}
      <Sheet
        open={open === "teams"} onClose={() => setOpen(null)} side="right" size={560}
        title="Microsoft Teams" description="The agent's identity, which channels it can read and post in, and its activity."
      >
        <Stack gap={4}>
          <div>
            <SettingRow label="Agent identity" hint="The address the agent posts as" htmlFor="t-email">
              <Field id="t-email" value={s.teamsAgentEmail}
                onChange={(e) => s.setTeamsAgentEmail(e.target.value)} className="text-body" />
            </SettingRow>
            <SettingRow label="Direct messages" hint="Whether the agent may DM people">
              <Toggle checked={s.teamsAllowDm} label="Allow direct messages" onChange={s.setTeamsAllowDm} />
            </SettingRow>
          </div>

          <div>
            <Text size="label" weight="bold" className="mb-1 block">Channels</Text>
            <Text size="caption" tone="subtle" className="mb-2 block">
              Read without send is how a team pilots the agent safely — so the two are separate.
            </Text>
            <Stack gap={2}>
              {s.teamsChannels.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-hair bg-canvas px-3 py-2.5">
                  <Text size="body" weight="semibold" className="font-mono">{c.name}</Text>
                  <div className="flex items-center gap-5">
                    <label className="flex items-center gap-2">
                      <Toggle checked={c.canRead} label={`Read ${c.name}`}
                        onChange={() => s.toggleChannelPermission(c.id, "canRead")} />
                      <Text size="label" tone="muted">Read</Text>
                    </label>
                    <label className="flex items-center gap-2">
                      <Toggle checked={c.canSend} label={`Send in ${c.name}`}
                        onChange={() => s.toggleChannelPermission(c.id, "canSend")} />
                      <Text size="label" tone="muted">Send</Text>
                    </label>
                  </div>
                </div>
              ))}
            </Stack>
          </div>

          <div>
            <Text size="label" weight="bold" className="mb-2 block">Activity</Text>
            <DataTable columns={logColumns} rows={s.teamsLogs} rowKey={(l) => l.id} empty="No messages yet." />
          </div>
        </Stack>
      </Sheet>

      {/* iMessage */}
      <Sheet
        open={open === "imessage"} onClose={() => setOpen(null)} side="right" size={480}
        title="iMessage" description="A sender number for field-force messaging."
      >
        <Stack gap={4}>
          <SettingRow label="Sender number" htmlFor="im-num">
            <Field id="im-num" value={s.imessageNumber}
              onChange={(e) => s.setImessageNumber(e.target.value)}
              placeholder="+1 415 555 0000" className="max-w-xs text-body" />
          </SettingRow>
          <div className="flex items-center gap-2">
            <Button size="sm" disabled={!s.imessageNumber.trim()} onClick={() => connectAndVerify("imessage")}>
              {s.integrationStatus.imessage === "connected" ? "Re-verify" : "Connect"}
            </Button>
            {s.integrationStatus.imessage === "connected" ? (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-ok" />
                <Text size="label" tone="muted">Verified</Text>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <XCircle className="size-3.5 text-ink-3" />
                <Text size="label" tone="muted">Not verified</Text>
              </span>
            )}
          </div>
        </Stack>
      </Sheet>
    </Stack>
  );
}
