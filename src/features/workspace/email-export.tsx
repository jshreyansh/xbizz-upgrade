"use client";

import { useState } from "react";
import { CheckCircle2, Download } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { EmailCanvas } from "@/features/workspace/email-canvas";
import type { EmailProject } from "@/features/workspace/email-project";
import { getBlockRule, LINK_STATUS, type EmailChannel } from "@/features/workspace/email-options";
import { ChannelLogo } from "@/components/ui/channel-logo";

const TONE: Record<"ok" | "lock" | "warn" | "danger", string> = {
  ok: "bg-ok-bg text-ok",
  lock: "bg-subtle text-ink-3",
  warn: "bg-warn-bg text-warn",
  danger: "bg-danger-bg text-danger",
};
const Tag = ({ tone, children }: { tone: keyof typeof TONE; children: React.ReactNode }) => (
  <span className={cn("whitespace-nowrap rounded-chip px-1.5 py-0.5 text-micro font-extrabold", TONE[tone])}>{children}</span>
);

const TH = "whitespace-nowrap border-b border-hair px-3 py-2 text-left text-micro font-extrabold uppercase tracking-wide text-ink-4";
const TD = "border-b border-hair px-3 py-2 align-top text-body";

/**
 * The MLR package, split the way Veeva reviews it: the template and each
 * block as their own documents, each with its own expiry. Pieces and images
 * already approved in SwishX are referenced, not reviewed again; uploads and
 * pasted links go in as new items.
 */
export function emailPackage(p: EmailProject) {
  const code = (n: number) => `US-${p.brandName.slice(0, 3).toUpperCase()}-2611-00${42 + n}`;
  return [
    { item: `${p.purpose.label} template`, type: "Email template", detail: `On ${p.template.title} · Subject: ${p.email.subjects.map((i) => `"${p.subjects[i]}"`).join(", ")}`, claims: 0, code: code(0), already: false, expires: undefined as string | undefined },
    ...p.included.map((b, i) => ({ item: b.title, type: "Fragment", detail: b.newClaim ? `New claim to approve, from your file ${b.source}` : b.source, claims: 1, code: code(i + 1), already: false, expires: b.expires })),
    ...p.email.media.map((m) => {
      const known = m.from === "platform" || m.code !== "New";
      const noun = { image: "Image", video: "Video", doc: "Document", link: "Link" }[m.kind];
      return known
        ? { item: m.title, type: m.kind === "link" ? "Approved link" : `${noun} from SwishX`, detail: m.kind === "link" ? (m.url ?? "") : "Already approved. Not reviewed again.", claims: m.claims.length, code: m.code, already: true, expires: undefined }
        : { item: m.title, type: m.kind === "link" ? "Linked destination" : `Uploaded ${noun.toLowerCase()}`, detail: m.kind === "link" ? (m.url ?? "") : m.newClaims.length ? `New claim to approve: ${m.newClaims.join(", ")}` : "New file", claims: m.claims.length + m.newClaims.length, code: "New", already: false, expires: undefined };
    }),
    ...p.attachedPieces.map((pc) => ({ item: pc.title, type: "Linked document", detail: `${pc.approval} in the Content Library. Not reviewed again.`, claims: 0, code: "Library", already: true, expires: undefined })),
    ...(p.cta.status === "review" ? [{ item: `"${p.ctaText}" button`, type: "Linked destination", detail: p.cta.dest, claims: 0, code: "New", already: false, expires: undefined }] : []),
    ...p.secondaryCtas.map((sc, idx) => ({
      item: `"${sc.label}" secondary button`,
      type: "Linked destination",
      detail: sc.url,
      claims: 0,
      code: code(20 + idx),
      already: false,
      expires: undefined,
    })),
    ...p.backlinks.map((bl, idx) => ({
      item: `"${bl.title}" backlink`,
      type: "Citation reference",
      detail: `${bl.context ? `${bl.context} · ` : ""}${bl.url}`,
      claims: 0,
      code: code(30 + idx),
      already: false,
      expires: undefined,
    })),
  ];
}

export function LinksTable({ p }: { p: EmailProject }) {
  return (
    <div className="overflow-x-auto rounded-control border border-hair bg-card">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={TH}>Link</th>
            <th className={TH}>Goes to</th>
            <th className={TH}>Status</th>
            <th className={TH}>Tracked as</th>
          </tr>
        </thead>
        <tbody>
          {p.links.map((l, idx) => (
            <tr key={`${l.tag || l.label}-${idx}`}>
              <td className={cn(TD, "font-bold text-ink")}>{l.label}</td>
              <td className={cn(TD, "break-all text-ink-3")}>{l.dest}</td>
              <td className={TD}>
                <Tag tone={LINK_STATUS[l.status].tone}>{LINK_STATUS[l.status].label}</Tag>
              </td>
              <td className={cn(TD, "font-mono text-label text-ink-3")}>LinkName={l.tag}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** What Preview and Publish shows: the email as the doctor gets it, then the package MLR receives. */
export function EmailPublishPreview({ p, approved }: { p: EmailProject; approved?: boolean }) {
  const rows = emailPackage(p);
  return (
    <div className="absolute inset-0 overflow-y-auto">
      {/* One column: the preview pane is narrow, and the package reads as what comes after the email. */}
      <div className="grid gap-5 p-5">
        <div className="flex justify-center">
          <EmailCanvas project={p} view="inbox" />
        </div>
        <div className="min-w-0 space-y-3">
          <div>
            <h3 className="text-body-lg font-extrabold text-ink">MLR package</h3>
            <p className="text-label text-ink-3">Each part reviewed and expiring on its own, the way Veeva does it. {rows.filter((r) => !r.already).length} items to review.</p>
          </div>
          <div className="overflow-x-auto rounded-control border border-hair bg-card">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={TH}>Item</th>
                  <th className={TH}>Type</th>
                  <th className={TH}>Claims</th>
                  <th className={TH}>Document</th>
                  <th className={TH}>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={`${r.code || r.item}-${r.type}-${idx}`}>
                    <td className={TD}>
                      <b className="block text-ink">{r.item}</b>
                      <span className="text-label text-ink-3">{r.detail}</span>
                    </td>
                    <td className={cn(TD, "whitespace-nowrap text-ink-2")}>{r.type}</td>
                    <td className={cn(TD, "tabular-nums")}>{r.claims}</td>
                    <td className={cn(TD, "whitespace-nowrap font-mono text-label text-ink-3")}>{r.code}</td>
                    <td className={TD}>
                      {r.already ? (
                        <Tag tone="ok">Approved</Tag>
                      ) : approved ? (
                        <Tag tone={r.expires ? "warn" : "ok"}>Approved to {r.expires ?? "2 Nov 2027"}</Tag>
                      ) : (
                        <Tag tone="lock">Draft</Tag>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="text-body-lg font-extrabold text-ink">Links</h3>
            <p className="text-label text-ink-3">Each one tracked, with the label that shows in click reports.</p>
          </div>
          <LinksTable p={p} />
        </div>
      </div>
    </div>
  );
}

/* HCP email goes to the CRM reps already use; patient and consumer email to the brand's email platform. */
const CRM_DESTINATIONS = [
  { id: "veeva", name: "Veeva Vault", sub: "PromoMats + Vault CRM Approved Email" },
  { id: "hubspot", name: "HubSpot", sub: "Marketing Hub & Sales CRM Email" },
  { id: "oce", name: "IQVIA OCE", sub: "OCE Personal approved email" },
  { id: "sfdc", name: "Salesforce", sub: "Life Sciences Cloud" },
  { id: "html", name: "HTML package", sub: "Zip for your agency or email platform" },
];
const CONSUMER_DESTINATIONS = [
  { id: "sfmc", name: "Salesforce Marketing Cloud", sub: "Consumer email, with the brand's opt-ins" },
  { id: "hubspot", name: "HubSpot", sub: "Marketing Hub & Sales Sequences" },
  { id: "health", name: "Salesforce Health Cloud", sub: "Where patient support nurses send from" },
  { id: "braze", name: "Braze", sub: "Consumer lifecycle email" },
  { id: "html", name: "HTML package", sub: "Zip for your agency or email platform" },
];

/**
 * Handing the approved email to the CRM reps already use. Our parts map to
 * the CRM's own fields, so the rep's choices and the doctor's name arrive
 * where the CRM expects them.
 */
export function EmailExportModal({ p, onExported, onClose }: { p: EmailProject; onExported: (destination: string) => void; onClose: () => void }) {
  const destinations = p.professional ? CRM_DESTINATIONS : CONSUMER_DESTINATIONS.filter((d) => d.id !== "health" || p.audience === "Patient");
  const [dest, setDest] = useState(p.email.channel && destinations.some((d) => d.id === p.email.channel) ? p.email.channel : destinations[0].id);
  const chosen = destinations.find((d) => d.id === dest) ?? destinations[0];
  const images = p.email.media.filter((m) => m.kind === "image" || m.kind === "video").length + 1;
  const mandatoryCount = p.included.filter((b) => getBlockRule(p.email.blockRules, b.id).mandatory).length;
  const optionalCount = p.included.length - mandatoryCount;
  const hasEditableNote = p.included.some((b) => getBlockRule(p.email.blockRules, b.id).editable);

  const hubspotTokens: Array<[string, string]> = [
    [p.professional ? "Doctor's name" : "Recipient name", "{{contact.firstname}} {{contact.lastname}}"],
    ...(p.showNote ? ([["Personal note, 255 characters", "{{contact.sales_rep_note}}"]] as Array<[string, string]>) : []),
    ["Content blocks", `HubSpot Modular Sections (${p.included.length} approved modules)`],
    ["Prescribing & Safety Info", "Hosted link tokens"],
    ["Unsubscribe", "{{unsubscribe_link}}"],
    ["Web links", "Auto-tagged with HubSpot tracking parameters"],
  ];

  const consumerTokens: Array<[string, string]> = [
    ["First name", "%%FirstName%%"],
    ...(p.showNote ? ([["Personal note, 255 characters", "%%SenderNote%%"]] as Array<[string, string]>) : []),
    ...(p.zoneType("blocks") === "choose" ? ([["Sender picks which blocks", "Content blocks, one per block"]] as Array<[string, string]>) : []),
    ...(p.unbranded ? [] : ([["Medication Guide · safety information", "Hosted pages, linked"]] as Array<[string, string]>)),
    ["Unsubscribe and preferences", "%%unsub_center_url%%"],
    ["Web links", "Tracked by the platform, labelled as below"],
  ];
  const tokens: Array<[string, string]> = dest === "hubspot" ? hubspotTokens : !p.professional ? consumerTokens : [
    ["Doctor's name", "{{accTitle}} {{accLname}}"],
    ...(p.showNote ? ([["Personal note, 255 characters", "{{customText(255)}}"]] as Array<[string, string]>) : []),
    [p.zoneType("blocks") === "choose" ? "Rep picks which blocks" : "Fixed blocks", p.zoneType("blocks") === "choose" ? `{{insertEmailFragments(1,${p.included.length})}}` : "inline in the template"],
    [
      "Block rules (Mandatory vs Optional)",
      `${mandatoryCount} mandatory ({{!vva_mandatory}}), ${optionalCount} optional ({{!vva_optional}})`
    ],
    ...(p.email.repEdit?.reorder ? ([["Block reordering by rep", "allowFragmentReorder: true ({{allow_reorder}})"]] as Array<[string, string]>) : []),
    ...(hasEditableNote ? ([["Block commentary note placeholder", "{{customBlockNote(255)}}"]] as Array<[string, string]>) : []),
    ...(p.attachedPieces.length ? ([[p.zoneType("piece") === "choose" ? "Documents, rep ticks which" : "Documents", "{{PieceLink}}, one per document"]] as Array<[string, string]>) : []),
    ["Prescribing Information · safety information", "{{PILink}} · {{ISILink}}"],
    ...(p.email.media.some((m) => m.kind === "doc") ? ([["Other linked documents", "{{$VaultDocID}}"]] as Array<[string, string]>) : []),
    ["Sender's name and contact", "{{userName}} {{userEmailAddress}}"],
    ["Unsubscribe", "{{unsubscribe_product_link}}"],
    ["Web links", "{{AppDocId}} on each link, for click tracking"],
  ];
  return (
    <Modal
      open
      onClose={onClose}
      title={p.professional ? "Export to your CRM" : "Export to your email platform"}
      description={
        p.professional
          ? "Senders see it in Approved Email after their next sync. When an approval ends, the CRM withdraws that block from every sender."
          : "It arrives as an approved template with its blocks. Opt-ins and unsubscribes stay with the platform."
      }
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onExported(chosen.name)} className="gap-1.5 px-5 font-bold">
            <Download className="size-3.5" />
            Export to {chosen.name}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-2">
          {destinations.map((d) => {
            const isPlanChannel = (p.email.channels || [p.email.channel]).includes(d.id as EmailChannel);
            return (
              <button
                key={d.id}
                type="button"
                aria-pressed={dest === d.id}
                onClick={() => setDest(d.id)}
                className={cn(
                  "flex items-start gap-3 rounded-control border p-3 text-left transition cursor-pointer",
                  dest === d.id ? "border-brand bg-tint ring-2 ring-brand/15" : "border-hair-2 bg-card hover:border-hair-3"
                )}
              >
                <ChannelLogo id={d.id as EmailChannel} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <b className="block text-body text-ink truncate">{d.name}</b>
                    {isPlanChannel && (
                      <span className="rounded-chip bg-tint px-1.5 py-0.5 text-micro font-bold text-brand-deep shrink-0">
                        Planned
                      </span>
                    )}
                  </div>
                  <span className="text-label text-ink-3 block truncate">{d.sub}</span>
                </div>
              </button>
            );
          })}
        </div>
        <div className="overflow-x-auto rounded-control border border-hair bg-card">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={TH}>In the email</th>
                <th className={TH}>Becomes in {dest === "veeva" ? "Veeva" : chosen.name}</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map(([what, token], idx) => (
                <tr key={`${what}-${idx}`}>
                  <td className={TD}>{what}</td>
                  <td className={cn(TD, "font-mono text-label text-ink-2")}>{token}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-label text-ink-3">{p.professional ? "Field names shown for Veeva; SwishX maps them to your CRM on export." : "Field names shown for Marketing Cloud; SwishX maps them to your platform on export."}</p>
        <div className="flex items-start gap-2.5 rounded-control border border-hair bg-canvas p-3">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-ok" />
          <p className="text-body text-ink-2">
            <b className="text-ink">In the package:</b> template.html · {p.included.length} fragment files · assets/ with {images} hosted images · links.csv with tracking labels · metadata with
            product, country, document numbers and expiry dates.
          </p>
        </div>
      </div>
    </Modal>
  );
}
