"use client";

import { cn } from "@/lib/cn";
import { EmailCanvas } from "@/features/workspace/email-canvas";
import type { EmailProject } from "@/features/workspace/email-project";
import { LINK_STATUS } from "@/features/workspace/email-options";

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
            <h3 className="text-body-lg font-extrabold text-ink">MLR Submission Package</h3>
            <p className="text-label text-ink-3">Modular fragment package structured for Veeva Vault PromoMats and CRM Approved Email review. {rows.filter((r) => !r.already).length} items to review.</p>
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
            <h3 className="text-body-lg font-extrabold text-ink">Tracked Destination Links</h3>
            <p className="text-label text-ink-3">Each one tracked, with the label that shows in click reports.</p>
          </div>
          <LinksTable p={p} />
        </div>
      </div>
    </div>
  );
}
