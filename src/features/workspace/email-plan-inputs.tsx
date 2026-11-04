"use client";

import { BookOpen, Check, CircleAlert, ExternalLink, FileText, FlaskConical, Globe, HeartHandshake, Link2, MousePointer2, MousePointerClick, Plus, X } from "lucide-react";
import { Field } from "@/components/ui/field";
import { ChannelLogo } from "@/components/ui/channel-logo";
import { cn } from "@/lib/cn";
import { Tag } from "@/features/workspace/email-plan-parts";
import { EMAIL_CHANNELS, isUrl, type EmailBacklinkItem, type EmailChannel, type EmailCtaItem } from "@/features/workspace/email-options";

/* ─────────────────────────── Where it's sent from ─────────────────────────── */

/** What each platform means for the marketer, in their words rather than the platform's. */
const SENT_HOW: Record<EmailChannel, string> = {
  veeva: "Reps send it from Vault CRM. You upload it to PromoMats for MLR review.",
  oce: "Reps send it as an OCE Approved Email.",
  sfdc: "Reps send it from Life Sciences Cloud.",
  sfmc: "Head office sends it in a Marketing Cloud journey.",
  hubspot: "Head office sends it from HubSpot.",
  braze: "Head office sends it as a Braze campaign.",
  html: "An HTML file with its images, for an agency or any other platform.",
};

const GROUPS: Array<{ title: string; ids: EmailChannel[] }> = [
  { title: "Reps send it from your CRM", ids: ["veeva", "sfdc", "oce"] },
  { title: "Head office sends it from a marketing platform", ids: ["sfmc", "hubspot", "braze"] },
  { title: "Someone else sends it", ids: ["html"] },
];

export function ChannelPicker({
  active,
  isRecommended,
  onChange,
}: {
  active: EmailChannel[];
  isRecommended: (id: EmailChannel) => boolean;
  onChange: (next: EmailChannel[]) => void;
}) {
  const byId = (id: EmailChannel) => EMAIL_CHANNELS.find((c) => c.id === id)!;
  const toggle = (id: EmailChannel) => {
    if (active.includes(id)) {
      if (active.length > 1) onChange(active.filter((x) => x !== id));
    } else onChange([...active, id]);
  };

  return (
    <div className="space-y-5">
      {/* What's chosen, said once at the top, so the list below is for changing it. */}
      <div className="flex flex-wrap items-center gap-3 rounded-panel border border-hair bg-canvas p-3">
        <div className="flex">
          {active.map((id) => (
            <ChannelLogo key={id} id={id} mark />
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-body font-bold text-ink">
            Sent from {active.map((id) => byId(id).name).join(" and ")}
          </p>
          <p className="text-label text-ink-3">
            {active.includes("veeva")
              ? "When you share it, you download the package to upload to PromoMats: the email, its images and the metadata."
              : "When you share it, you download the email for each of these."}
          </p>
        </div>
      </div>

      {GROUPS.map((group) => (
        <div key={group.title} className="space-y-2">
          <div className="text-micro font-extrabold uppercase tracking-wider text-ink-4">{group.title}</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {group.ids.map((id) => {
              const ch = byId(id);
              const on = active.includes(id);
              const only = on && active.length === 1;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(id)}
                  title={only ? "At least one place has to send it" : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-panel border p-3 text-left transition",
                    on ? "border-brand bg-tint/50 ring-2 ring-brand/10" : "border-hair-2 bg-card hover:border-hair-3 hover:bg-canvas",
                    only ? "cursor-default" : "cursor-pointer"
                  )}
                >
                  <ChannelLogo id={id} mark />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-body font-bold text-ink">{ch.name}</span>
                      {isRecommended(id) && <Tag tone="brand">Recommended</Tag>}
                    </span>
                    <span className="mt-0.5 block text-label leading-snug text-ink-3">{SENT_HOW[id]}</span>
                  </span>
                  <span
                    className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-full border transition",
                      on ? "border-brand bg-brand text-white" : "border-hair-3 bg-card group-hover:border-ink-4"
                    )}
                  >
                    {on && <Check className="size-3 stroke-[3]" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────────── Buttons and links ──────────────────────────── */

const domainOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

/** What kind of page a link opens, read from its address, so each row says what it is at a glance. */
function linkKind(url: string): { label: string; icon: typeof Globe } {
  const u = url.toLowerCase();
  if (/clinicaltrials\.gov/.test(u)) return { label: "Clinical trial", icon: FlaskConical };
  if (/nejm|lancet|jama|nature\.com|doi\.org|pubmed|ncbi|bmj|wiley|springer|sciencedirect/.test(u)) return { label: "Journal article", icon: BookOpen };
  if (/dailymed|prescrib|\/pi\b|\/pi$|label/.test(u)) return { label: "Prescribing information", icon: FileText };
  if (/support|copay|savings|access|enrol|enroll/.test(u)) return { label: "Support page", icon: HeartHandshake };
  return { label: "Web page", icon: Globe };
}

/** Whether the row's page is set: a link to open it when it is, what's missing when it isn't. */
function LinkStatus({ url, missingText }: { url: string; missingText: string }) {
  if (!isUrl(url)) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-chip bg-danger-bg px-2 py-1 text-caption font-bold text-danger">
        <CircleAlert className="size-3" />
        {missingText}
      </span>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      title="Open the page to check it"
      className="inline-flex max-w-[45%] shrink-0 items-center gap-1 rounded-chip bg-ok-bg px-2 py-1 text-caption font-bold text-ok transition hover:opacity-80"
    >
      <Check className="size-3 shrink-0 stroke-[3]" />
      <span className="truncate">{domainOf(url) || "Link added"}</span>
      <ExternalLink className="size-3 shrink-0" />
    </a>
  );
}

function IconTile({ icon: Icon, tone }: { icon: typeof Globe; tone: "brand" | "plain" }) {
  return (
    <span className={cn("grid size-9 shrink-0 place-items-center rounded-control", tone === "brand" ? "bg-tint text-brand" : "bg-subtle text-ink-3")}>
      <Icon className="size-4.5" />
    </span>
  );
}

function RemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-ink-4 transition hover:bg-black/5 hover:text-ink"
    >
      <X className="size-3.5" />
    </button>
  );
}

function AddRow({ icon: Icon, label, onClick }: { icon: typeof Plus; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-panel border border-dashed border-hair-3 py-3 text-label font-bold text-ink-3 transition hover:border-brand hover:bg-tint/40 hover:text-brand-deep"
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}

function SectionHead({ icon: Icon, title, count, children }: { icon: typeof Globe; title: string; count: number; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-ink-3" />
      <div>
        <h3 className="flex items-center gap-2 text-body-lg font-bold text-ink">
          {title}
          <span className="rounded-chip bg-subtle px-1.5 py-0.5 text-micro font-extrabold tabular-nums text-ink-3">{count}</span>
        </h3>
        <p className="mt-0.5 text-label text-ink-3">{children}</p>
      </div>
    </div>
  );
}

const CARD = "overflow-hidden rounded-panel border border-hair-2 bg-card shadow-2xs";
const CARD_HEAD = "flex items-center gap-3 border-b border-hair bg-canvas px-4 py-3";

export function ButtonsAndLinks({
  ctas,
  backlinks,
  mainPlaceholder,
  onAddCta,
  onUpdateCta,
  onRemoveCta,
  onAddLink,
  onUpdateLink,
  onRemoveLink,
}: {
  ctas: EmailCtaItem[];
  backlinks: EmailBacklinkItem[];
  mainPlaceholder: string;
  onAddCta: () => void;
  onUpdateCta: (id: string, patch: Partial<EmailCtaItem>) => void;
  onRemoveCta: (id: string) => void;
  onAddLink: () => void;
  onUpdateLink: (id: string, patch: Partial<EmailBacklinkItem>) => void;
  onRemoveLink: (id: string) => void;
}) {
  return (
    <div className="space-y-7">
      {/* Buttons */}
      <section className="space-y-3">
        <SectionHead icon={MousePointerClick} title="Buttons" count={ctas.length}>
          What the doctor can click, and the page each one opens. Every page goes to MLR with the email.
        </SectionHead>
        {ctas.map((cta, i) => {
          const main = cta.priority === "primary";
          const bad = Boolean(cta.url) && !isUrl(cta.url);
          return (
            <div key={cta.id} className={CARD}>
              <div className={CARD_HEAD}>
                <IconTile icon={main ? MousePointerClick : MousePointer2} tone={main ? "brand" : "plain"} />
                <div className="min-w-0 flex-1">
                  <b className="block truncate text-body font-bold text-ink">{main ? "Main button" : `Extra button ${i}`}</b>
                  <span className="block truncate text-label text-ink-3">{main ? "The one thing you want the doctor to do" : "Sits under the main button"}</span>
                </div>
                <LinkStatus url={cta.url} missingText="Add the page it opens" />
                {!main && <RemoveButton onClick={() => onRemoveCta(cta.id)} label="Remove button" />}
              </div>
              <div className="grid gap-3 p-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                <Field
                  size="sm"
                  label="Button text"
                  value={cta.label}
                  placeholder={main ? mainPlaceholder : "e.g. See the full study"}
                  maxLength={35}
                  onChange={(e) => onUpdateCta(cta.id, { label: e.target.value })}
                  hint={`${(cta.label || "").length}/35 characters. Say what happens: Book, Watch, Download.`}
                />
                <Field
                  size="sm"
                  label="Page it opens"
                  type="url"
                  value={cta.url}
                  placeholder="https://"
                  iconLeft={<Globe className="size-3.5" />}
                  onChange={(e) => onUpdateCta(cta.id, { url: e.target.value.trim() })}
                  error={bad ? "Enter a full web address starting with https://" : undefined}
                  hint="The full address, starting with https://"
                />
              </div>
            </div>
          );
        })}
        <AddRow icon={Plus} label="Add another button" onClick={onAddCta} />
      </section>

      {/* Links to sources */}
      <section className="space-y-3 border-t border-hair pt-6">
        <SectionHead icon={Link2} title="Links to sources" count={backlinks.length}>
          Studies, trial entries or support pages the email points to. On the Email Plan you choose which block each one sits under.
        </SectionHead>
        {backlinks.map((bl) => {
          const bad = Boolean(bl.url) && !isUrl(bl.url);
          const kind = linkKind(bl.url);
          return (
            <div key={bl.id} className={CARD}>
              <div className={CARD_HEAD}>
                <IconTile icon={kind.icon} tone="plain" />
                <div className="min-w-0 flex-1">
                  <b className="block truncate text-body font-bold text-ink">{bl.title || "New link"}</b>
                  <span className="block truncate text-label text-ink-3">
                    {kind.label}
                    {bl.context ? ` · ${bl.context}` : ""}
                  </span>
                </div>
                <LinkStatus url={bl.url} missingText="Add the web address" />
                <RemoveButton onClick={() => onRemoveLink(bl.id)} label="Remove link" />
              </div>
              <div className="grid gap-3 p-4 sm:grid-cols-2">
                <Field
                  size="sm"
                  label="Link text"
                  value={bl.title}
                  placeholder="e.g. AFFIRM-3 study publication"
                  onChange={(e) => onUpdateLink(bl.id, { title: e.target.value })}
                  hint="The words the doctor clicks"
                />
                <Field
                  size="sm"
                  label="What it is"
                  value={bl.context}
                  placeholder="e.g. Phase III trial methods and primary endpoint, NEJM"
                  onChange={(e) => onUpdateLink(bl.id, { context: e.target.value })}
                  hint="For reviewers. Optional"
                />
                <div className="sm:col-span-2">
                  <Field
                    size="sm"
                    label="Web address"
                    type="url"
                    value={bl.url}
                    placeholder="https://"
                    iconLeft={<Globe className="size-3.5" />}
                    onChange={(e) => onUpdateLink(bl.id, { url: e.target.value.trim() })}
                    error={bad ? "Enter a full web address starting with https://" : undefined}
                  />
                </div>
              </div>
            </div>
          );
        })}
        <AddRow icon={Link2} label="Add a link" onClick={onAddLink} />
      </section>
    </div>
  );
}
