"use client";

import { useState } from "react";
import { CreditCard, Download, Plus, Sparkle, X } from "lucide-react";
import { Text } from "@/components/ui/text";
import { Chip } from "@/components/ui/chip";
import { Stack } from "@/components/ui/stack";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Sheet } from "@/components/patterns/sheet";
import { DataTable, type DataColumn } from "@/components/patterns/data-table";
import { TabNav } from "@/components/patterns/tab-nav";
import { useSettingsStore } from "@/features/settings/settings-store";
import { SettingsCard, SettingRow } from "@/features/settings/settings-parts";
import type { Invoice, TopUpEntry, UsageEntry } from "@/features/settings/settings-types";

const INVOICE_TONE = { paid: "ok", due: "warn", overdue: "danger", refunded: "default" } as const;
const TOPUP_TONE = { paid: "ok", pending: "warn", failed: "danger" } as const;

export function SectionBilling() {
  const s = useSettingsStore();
  const [history, setHistory] = useState<"usage" | "topups" | "invoices">("usage");
  const [addMethod, setAddMethod] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  const usageCols: DataColumn<UsageEntry>[] = [
    { key: "at", header: "Date", cell: (u) => <Text size="caption" tone="muted">{u.at}</Text> },
    { key: "desc", header: "Description", cell: (u) => <Text size="body">{u.description}</Text> },
    { key: "who", header: "Person", cell: (u) => <Text size="body" weight="semibold">{u.person}</Text> },
    {
      key: "asset", header: "Asset", secondary: true,
      // The line-level asset link is the point of this table — it needs an
      // asset id recorded at spend time, which the studio has to write.
      cell: (u) => u.assetId ? (
        <a href="#" className="flex min-w-0 flex-col">
          <span className="truncate text-body font-semibold text-brand">{u.assetTitle}</span>
          <span className="text-caption text-ink-3">{u.assetId}</span>
        </a>
      ) : <Text size="caption" tone="subtle">—</Text>,
    },
    { key: "cr", header: "Credits", numeric: true, cell: (u) => (
        <Text size="body" weight="bold" className="text-danger">{u.credits.toLocaleString()}</Text>
      ) },
    { key: "bal", header: "Balance", numeric: true, secondary: true, cell: (u) => u.balanceAfter.toLocaleString() },
  ];

  const topUpCols: DataColumn<TopUpEntry>[] = [
    { key: "at", header: "Date", cell: (t) => <Text size="caption" tone="muted">{t.at}</Text> },
    { key: "amt", header: "Amount", cell: (t) => <Text size="body" weight="semibold">{t.amount}</Text> },
    { key: "cr", header: "Credits", numeric: true, cell: (t) => (
        <Text size="body" weight="bold" className="text-ok">+{t.credits.toLocaleString()}</Text>
      ) },
    { key: "who", header: "Purchased by", cell: (t) => <Text size="body">{t.purchasedBy}</Text> },
    { key: "ref", header: "Reference", secondary: true, cell: (t) => (
        <span className="font-mono text-caption text-ink-3">{t.reference}</span>
      ) },
    { key: "st", header: "Status", cell: (t) => <Chip tone={TOPUP_TONE[t.status]} size="xs">{t.status}</Chip> },
  ];

  const invoiceCols: DataColumn<Invoice>[] = [
    { key: "no", header: "Number", cell: (i) => (
        <span className="font-mono text-body font-semibold text-ink">{i.number}</span>
      ) },
    { key: "at", header: "Date", cell: (i) => <Text size="caption" tone="muted">{i.at}</Text> },
    { key: "per", header: "Period", secondary: true, cell: (i) => <Text size="body">{i.period}</Text> },
    { key: "amt", header: "Amount", numeric: true, cell: (i) => <Text size="body" weight="semibold">{i.amount}</Text> },
    { key: "st", header: "Status", cell: (i) => <Chip tone={INVOICE_TONE[i.status]} size="xs">{i.status}</Chip> },
    {
      key: "dl", header: "", cell: () => (
        <span className="flex items-center gap-1 text-brand">
          <Download className="size-3.5" />
          <span className="text-label font-bold">PDF</span>
        </span>
      ),
    },
  ];

  const billingDetailsMissing = !s.taxId.trim() || !s.billingAddress.trim();

  return (
    <Stack gap={4}>
      {/* The balance is what people come here for, so it earns the banner. */}
      <div className="overflow-hidden rounded-card border border-white/12 bg-ink shadow-on-dark">
        <div className="flex flex-wrap items-end justify-between gap-4 px-5 py-4">
          <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
            <div>
              <Text size="caption" className="block uppercase tracking-wider text-white/50">Plan</Text>
              <div className="mt-0.5 flex items-center gap-2">
                <Text size="title" weight="bold" className="text-white">{s.planName}</Text>
                <Chip tone="dark" size="xs">Renews {s.renewsOn}</Chip>
              </div>
            </div>
            <div>
              <Text size="caption" className="block uppercase tracking-wider text-white/50">Credit balance</Text>
              <Text size="title" weight="bold" className="mt-0.5 block tabular-nums text-white">
                {s.creditBalance.toLocaleString()}
              </Text>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary">Change plan</Button>
            <Button size="sm">Top up</Button>
          </div>
        </div>
      </div>

      {/* Below the balance, never above — an offer outranking your own balance
          reads as a sales page. */}
      {!s.promoDismissed && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-panel border border-brand/20 bg-tint px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <Sparkle className="size-4 shrink-0 text-brand" />
            <div className="min-w-0">
              <Text size="body" weight="bold" className="block">15% more credits on top-ups over 100,000</Text>
              <Text size="label" tone="muted" className="block">Ends 31 Oct 2026</Text>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button size="sm" variant="secondary">View offer</Button>
            <button
              type="button" aria-label="Dismiss offer" onClick={s.dismissPromo}
              className="grid size-7 place-items-center rounded-glyph text-ink-3 transition-colors hover:bg-card hover:text-ink cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      <SettingsCard
        title="Billing method"
        description="Used for renewals and top-ups."
        actions={
          <Button size="sm" variant="secondary" onClick={() => setAddMethod(true)}>
            <Plus className="size-3.5" /> {s.paymentMethod ? "Replace" : "Add method"}
          </Button>
        }
      >
        <div>
          <SettingRow label="Payment method">
            {s.paymentMethod ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-2 rounded-control border border-hair bg-canvas px-3 py-1.5">
                  <CreditCard className="size-3.5 text-ink-3" />
                  <Text size="body" weight="semibold">{s.paymentMethod.brand} ···· {s.paymentMethod.last4}</Text>
                </span>
                <Text size="label" tone="subtle">Expires {s.paymentMethod.expiry}</Text>
              </div>
            ) : (
              <Text size="body" tone="muted">None on file.</Text>
            )}
          </SettingRow>
          <SettingRow label="Tax ID" hint="Appears on invoices" htmlFor="b-tax">
            <Field id="b-tax" value={s.taxId}
              onChange={(e) => s.setBillingField("taxId", e.target.value)} className="max-w-sm text-body" />
          </SettingRow>
          <SettingRow label="Billing address" htmlFor="b-addr">
            <Field id="b-addr" value={s.billingAddress}
              onChange={(e) => s.setBillingField("billingAddress", e.target.value)} className="text-body" />
          </SettingRow>
        </div>
      </SettingsCard>

      <SettingsCard
        title="History"
        description="What was spent, what was bought, and what was invoiced."
      >
        <Stack gap={3}>
          <TabNav
            ariaLabel="History"
            activeId={history}
            onSelect={(id) => setHistory(id as typeof history)}
            items={[
              { id: "usage", label: "Usage", badge: s.usage.length },
              { id: "topups", label: "Top-ups", badge: s.topUps.length },
              { id: "invoices", label: "Invoices", badge: s.invoices.length },
            ]}
          />

          {history === "usage" && (
            <DataTable columns={usageCols} rows={s.usage} rowKey={(u) => u.id} empty="No credits spent yet." />
          )}
          {history === "topups" && (
            <DataTable columns={topUpCols} rows={s.topUps} rowKey={(t) => t.id} empty="No top-ups yet." />
          )}
          {history === "invoices" && (
            <Stack gap={2}>
              {billingDetailsMissing && (
                <div className="rounded-control border border-warn-line bg-warn-bg px-3 py-2.5">
                  <Text size="body" weight="semibold" className="block text-warn">Billing details incomplete</Text>
                  <Text size="label" tone="muted" className="block">
                    Add a tax ID and address above — an invoice without them is not usable.
                  </Text>
                </div>
              )}
              <DataTable
                columns={invoiceCols} rows={s.invoices} rowKey={(i) => i.id}
                onRowClick={setInvoice} empty="No invoices yet."
              />
              <Text size="caption" tone="subtle">
                Click a row for the line items &mdash; the common question is &ldquo;what was this
                charge&rdquo;, and that should not need a download.
              </Text>
            </Stack>
          )}
        </Stack>
      </SettingsCard>

      <Modal
        open={addMethod}
        onClose={() => setAddMethod(false)}
        title="Add a payment method"
        description="In production this is the provider's own hosted field — card numbers never reach our inputs."
        footer={
          <>
            <Button size="sm" variant="ghost" onClick={() => setAddMethod(false)}>Cancel</Button>
            <Button size="sm" onClick={() => {
              s.setPaymentMethod({ brand: "Visa", last4: "4242", expiry: "12 / 2029" });
              setAddMethod(false);
            }}>
              Add method
            </Button>
          </>
        }
      >
        <Stack gap={3}>
          <Field label="Name on card" placeholder="Maya Kapoor" className="text-body" />
          <Field label="Card number" placeholder="4242 4242 4242 4242" className="text-body" />
          <div className="flex gap-3">
            <Field label="Expiry" placeholder="MM / YY" className="text-body" />
            <Field label="CVC" placeholder="123" className="text-body" />
          </div>
        </Stack>
      </Modal>

      <Sheet
        open={Boolean(invoice)} onClose={() => setInvoice(null)} side="right" size={480}
        title={invoice?.number ?? ""} description={invoice ? `${invoice.period} · ${invoice.at}` : undefined}
        footer={<Button size="sm" variant="secondary"><Download className="size-3.5" /> Download PDF</Button>}
      >
        {invoice && (
          <Stack gap={3}>
            <div className="flex items-center gap-2">
              <Chip tone={INVOICE_TONE[invoice.status]} size="sm">{invoice.status}</Chip>
              <Text size="body" tone="muted">Total {invoice.amount}</Text>
            </div>
            <div className="rounded-panel border border-hair">
              {invoice.lines.map((l, i) => (
                <div key={i} className="flex items-center justify-between gap-3 border-b border-hair px-3 py-2.5 last:border-b-0">
                  <Text size="body">{l.description}</Text>
                  <Text size="body" weight="semibold" className="tabular-nums">{l.amount}</Text>
                </div>
              ))}
            </div>
            <div>
              <Text size="caption" tone="subtle" className="block">Billed to</Text>
              <Text size="body" className="block">{s.legalEntity}</Text>
              <Text size="label" tone="muted" className="block">{s.billingAddress}</Text>
              <Text size="label" tone="muted" className="block">{s.taxId}</Text>
            </div>
          </Stack>
        )}
      </Sheet>
    </Stack>
  );
}
