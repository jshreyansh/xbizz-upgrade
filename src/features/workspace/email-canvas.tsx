"use client";

import { Play } from "lucide-react";
import { cn } from "@/lib/cn";
import { AssetPreview } from "@/features/content-library/asset-preview";
import type { EmailMedia, EmailTemplate } from "@/features/workspace/email-options";
import { ZONE_TYPE_LABEL, type EmailProject, type ZoneType } from "@/features/workspace/email-project";

/** Who the sample email is to, by audience. */
export const RECIPIENT = {
  HCP: { name: "Dr. Daniel Okafor", role: "Hematology-oncology · Lakeview Cancer Institute", greeting: "Dear Dr. Okafor,", initials: "DO" },
  Pharmacy: { name: "Maria Alvarez, PharmD", role: "Director of Pharmacy · Lakeview Health", greeting: "Dear Dr. Alvarez,", initials: "MA" },
  Patient: { name: "Jordan Lee", role: "Patient · enrolled in the support programme", greeting: "Hi Jordan,", initials: "JL" },
  Consumer: { name: "Sam Patel", role: "Signed up on the website", greeting: "Hi Sam,", initials: "SP" },
} as const;

/** Formulary and value emails go to a pharmacy or P&T lead rather than a prescriber. */
export const recipientFor = (p: Pick<EmailProject, "audience" | "email">) =>
  p.email.purpose === "formulary" || p.email.purpose === "value" ? RECIPIENT.Pharmacy : RECIPIENT[p.audience];

/** How the email is being looked at. */
export type EmailView = "zones" | "inbox" | "phone" | "nopics" | "rep";

/* Illustration: the brand's own email header. */
export const HEADER_ART = "linear-gradient(120deg, #3b2370, #5b3a9e 60%, #7d5cc4)";

const ZONE_STYLE: Record<ZoneType, { idle: string; selected: string; tag: string }> = {
  lock: { idle: "outline-transparent hover:outline-hair-3", selected: "outline-2 outline-solid outline-ink-3", tag: "bg-ink-3" },
  auto: { idle: "outline-ok/45", selected: "outline-2 outline-solid outline-ok", tag: "bg-ok" },
  choose: { idle: "outline-accent-blue/50 bg-accent-blue/5", selected: "outline-2 outline-solid outline-accent-blue", tag: "bg-accent-blue" },
  type: { idle: "outline-brand/60 bg-tint/60", selected: "outline-2 outline-solid outline-brand", tag: "bg-brand" },
};

const Token = ({ children, typed }: { children: React.ReactNode; typed?: boolean }) => (
  <span className={cn("inline-flex rounded-chip border border-dashed px-1.5 font-bold", typed ? "border-brand/50 bg-tint text-brand-deep" : "border-ok-line bg-ok-bg text-ok")}>{children}</span>
);

/**
 * One inserted image, video, document or link, as the doctor sees it.
 *
 * A video never plays inside the email — Outlook strips it — so it is a
 * thumbnail with the play button drawn into it, opening the hosted video.
 */
function MediaPart({ m, imagesOff }: { m: EmailMedia; imagesOff: boolean }) {
  if (m.kind === "link")
    return (
      <p className="py-1.5">
        <span className="font-bold text-accent-violet underline">{m.title}</span>
      </p>
    );
  if (m.kind === "doc")
    return (
      <div className="my-2 flex items-center gap-3 rounded-control border border-hair-2 bg-subtle p-2.5">
        <span className="h-10 w-8 shrink-0 rounded-chip" style={{ background: m.gradient }} />
        <span className="min-w-0">
          <b className="block text-body-lg text-ink">{m.title}</b>
          <span className="text-label text-ink-3">{m.src} · opens in the browser</span>
        </span>
      </div>
    );
  if (imagesOff)
    return (
      <div className="my-2 rounded-control border border-dashed border-hair-3 bg-subtle p-3.5 text-body text-ink-3">
        {m.alt ? m.alt : <b className="text-danger">No alt text. The doctor sees an empty box.</b>}
      </div>
    );
  return (
    <figure className="my-2 overflow-hidden rounded-control border border-hair">
      {m.previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={m.previewUrl} alt={m.alt} className="block h-auto w-full" />
      ) : m.visual ? (
        <div className="relative aspect-[16/9] overflow-hidden">{m.visual}</div>
      ) : (
        <div className={cn("relative grid place-items-center p-3 text-center text-subhead font-extrabold text-white", m.kind === "video" ? "aspect-video" : "aspect-[16/7]")} style={{ background: m.gradient }}>
          {m.kind === "video" ? (
            <>
              <span className="grid size-12 place-items-center rounded-full bg-card/90 shadow-float">
                <Play className="ml-0.5 size-5 fill-accent-violet text-accent-violet" />
              </span>
              {m.gif && <span className="absolute left-2 top-2 rounded-chip bg-ink/60 px-1.5 text-micro font-extrabold text-white">GIF</span>}
              {m.duration && <span className="absolute bottom-2 right-2 rounded-chip bg-ink/60 px-1.5 text-micro font-extrabold text-white">{m.duration}</span>}
            </>
          ) : (
            m.label
          )}
        </div>
      )}
      {m.kind === "video" && (
        <figcaption className="bg-subtle px-2.5 py-1.5 text-label font-bold text-ink-2">
          Watch: {m.title}
          {m.duration ? ` (${m.duration})` : ""}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * The email, drawn the way it will be sent.
 *
 * In the "zones" view every part carries what reps can do with it — locked,
 * filled in from the CRM, chosen by the rep, typed by the rep — so the marketer
 * sees the locks on the email itself rather than in a settings page.
 */
export function EmailCanvas({
  project: p,
  view,
  selected,
  onSelect,
  note,
  picked,
  pieceIds,
  expired = [],
  template,
  subject,
}: {
  project: EmailProject;
  view: EmailView;
  selected?: string | null;
  onSelect?: (zone: string) => void;
  /** The rep's note, in the rep preview. */
  note?: string;
  /** The blocks the rep picked, when reps choose. */
  picked?: string[];
  /** The documents the rep ticked, when reps choose. */
  pieceIds?: string[];
  /** Blocks whose approval has ended. */
  expired?: string[];
  /** A template to draw instead of the chosen one: the template step's previews. */
  template?: EmailTemplate | null;
  /** The subject line the rep picked, in the rep preview. */
  subject?: string;
}) {
  const zones = view === "zones";
  const live = !zones;
  const imagesOff = view === "nopics";
  const { email, purpose, sender, isHQ } = p;
  const zone = (id: string, children: React.ReactNode) => {
    const t = p.zoneType(id);
    const style = ZONE_STYLE[t];
    return (
      <div
        key={id}
        data-zone={id}
        onClick={zones && onSelect ? (e) => { e.stopPropagation(); onSelect(id); } : undefined}
        className={cn("relative", zones && "cursor-pointer outline-1 outline-dashed -outline-offset-1 transition-[outline-color]", zones && (selected === id ? style.selected : style.idle))}
      >
        {zones && (t !== "lock" || selected === id) && (
          <span className={cn("absolute right-1.5 top-1 z-10 rounded-chip px-1.5 text-micro font-extrabold uppercase tracking-wide text-white", style.tag)}>{ZONE_TYPE_LABEL[t]}</span>
        )}
        {children}
      </div>
    );
  };

  const chooses = p.zoneType("blocks") === "choose";
  const shownBlocks = live && chooses ? p.included.filter((b) => (picked ?? p.included.slice(0, 2).map((x) => x.id)).includes(b.id)) : p.included;
  const refs = shownBlocks.map((b) => b.source);
  /* Documents go as link cards at the end. When the rep chooses, the ones they ticked. */
  const pieces = live && p.zoneType("piece") === "choose" && pieceIds ? p.attachedPieces.filter((x) => pieceIds.includes(x.id)) : p.attachedPieces;
  const look = template === undefined ? p.template : template;
  const packshot = email.packshots[0];
  const recipient = recipientFor(p);
  const greeting = zones ? (
    p.professional ? <>Dear <Token>Title</Token> <Token>Last name</Token>,</> : <>Hi <Token>First name</Token>,</>
  ) : (
    recipient.greeting
  );
  const noteText = zones ? (
    <span className="italic text-brand-deep">The sender&apos;s own words, up to 255 characters.</span>
  ) : view === "rep" ? (note ?? "") : sender.sampleNote;
  const heading = p.unbranded ? `Understanding ${p.condition}` : p.brandName;
  const strapline = p.professional ? "For US healthcare professionals only" : p.unbranded ? "Information about the condition" : `For people prescribed ${p.brandName}`;

  return (
    <div className={cn("w-full overflow-hidden rounded-control bg-card text-body-lg leading-relaxed text-ink-2 shadow-float", view === "phone" ? "max-w-[360px]" : "max-w-[600px]")}>
      {live && (
        <div className="grid gap-0.5 border-b border-hair bg-subtle px-4 py-2.5 text-label text-ink-3">
          <b className="text-body-lg text-ink">{subject ?? p.subject}</b>
          <span>
            {isHQ ? `${heading} <${sender.address}>` : `${sender.signoff[0]} <${sender.address}>`} · to {recipient.name}
          </span>
        </div>
      )}
      {zone(
        "header",
        look?.header === "letter" ? (
          <div className="border-b-2 border-accent-violet px-6 pb-3 pt-5">
            <div className="text-title font-black leading-tight text-accent-violet">{heading}</div>
            <span className="block text-caption font-semibold text-ink-3">{strapline}</span>
          </div>
        ) : look?.header === "banner" ? (
          <div className="px-6 pb-5 pt-7 text-white" style={{ background: HEADER_ART }}>
            <span className="block text-micro font-extrabold uppercase tracking-wide opacity-75">{strapline}</span>
            <div className="mt-1 text-display font-black leading-tight">{heading}</div>
            <span className="mt-1 block text-body opacity-85">{purpose.label}</span>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 px-6 py-4 text-white" style={{ background: HEADER_ART }}>
            <div className="text-title font-black leading-tight">
              {heading}
              <span className="block text-caption font-semibold opacity-80">{strapline}</span>
            </div>
          </div>
        )
      )}
      <div className={cn("pt-3", view === "phone" ? "px-4" : "px-6")}>
        {zone("greeting", <p className="py-1.5">{greeting}</p>)}
        {p.showNote && (!live || noteText) && zone("note", <p className="py-1.5">{noteText}</p>)}
        {zone(
          "opening",
          <>
            <p className="py-1.5">{purpose.opening(p.brandName, p.condition)}</p>
            {p.professional && email.sender !== "msl" && p.wording && (
              <div className="my-1.5 rounded-r-control border-l-2 border-accent-violet bg-subtle px-3 py-2 text-body text-ink-3">{p.wording}</div>
            )}
          </>
        )}
        {zone(
            "blocks",
            <>
              {zones && chooses && shownBlocks.length > 0 && (
                <p className="pt-1.5 text-label font-bold text-accent-blue">
                  The rep picks 1 to {email.maxBlocks} of these {shownBlocks.length}:
                </p>
              )}
              {zones && shownBlocks.length === 0 && <p className="py-1.5 italic text-ink-4">No blocks in the set. Add some in the plan.</p>}
              {shownBlocks.map((b, i) => (
                <div key={b.id} className={cn("my-2 flex gap-3 rounded-control border border-hair p-3", expired.includes(b.id) && "opacity-45 line-through")}>
                  <div className="grid min-w-0 flex-1 gap-1">
                  <h4 className="text-body-lg font-bold text-accent-violet">{b.title}</h4>
                  {b.stat ? (
                    <div className="flex items-center gap-3">
                      <b className="shrink-0 text-display-lg font-black leading-none text-accent-violet">{b.stat}</b>
                      <span className="text-body-lg text-ink-2">
                        {b.text}
                        <sup className="font-extrabold text-accent-violet">{i + 1}</sup>
                      </span>
                    </div>
                  ) : (
                    <p className="text-body-lg text-ink-2">
                      {b.text}
                      <sup className="font-extrabold text-accent-violet">{i + 1}</sup>
                    </p>
                  )}
                  {b.link && <span className="text-body font-bold text-accent-violet underline">{b.link}</span>}
                  </div>
                  {/* The product shot, beside the lead claim. Images off: its alt text. */}
                  {i === 0 && packshot &&
                    (imagesOff ? (
                      <span className="grid w-24 shrink-0 place-items-center rounded-chip border border-dashed border-hair-3 p-1 text-center text-caption text-ink-4">{packshot.note || packshot.name}</span>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element -- a hosted email image, not a page asset
                      <img src={packshot.url} alt={packshot.note || `${p.brandName} pack`} className="h-24 w-24 shrink-0 rounded-chip object-cover" />
                    ))}
                </div>
              ))}
            </>
          )}
        {email.media.map((m) => zone(`m:${m.uid}`, <MediaPart m={m} imagesOff={imagesOff} />))}
        {pieces.length > 0 &&
          zone(
            "piece",
            <div className="my-2 grid gap-1.5">
              {zones && p.zoneType("piece") === "choose" && <p className="text-label font-bold text-accent-blue">The rep ticks which of these {pieces.length} go with the email:</p>}
              {pieces.map((piece) => (
                <div key={piece.id} className="flex items-center gap-3 rounded-control border border-hair-2 bg-subtle p-2.5">
                  <AssetPreview asset={{ gradient: piece.asset.gradient }} className={cn("shrink-0 rounded-chip", piece.kind === "Video" ? "h-8 w-12" : "h-10 w-8")} />
                  <span className="min-w-0">
                    <b className="block text-body-lg text-ink">{piece.title}</b>
                    <span className="text-label text-ink-3">
                      {piece.kind === "Video" ? "Video" : "Document"} · {piece.spec} · opens in the browser
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}
        {zone(
          "cta",
          <div className="py-2">
            <span className="inline-block rounded-full bg-accent-violet px-5 py-2 text-body-lg font-extrabold text-white">{purpose.cta}</span>
            {zones && (
              <span className={cn("mt-1 block text-caption font-bold", p.cta.status === "missing" ? "text-danger" : "text-accent-blue")}>
                {p.cta.status === "missing" ? "Goes nowhere yet: choose where in the plan" : `Goes to ${p.cta.dest}`}
              </span>
            )}
          </div>
        )}
        {zone(
          "signoff",
          <p className="py-2 text-body-lg">
            Kind regards,
            <br />
            {zones && !isHQ ? (
              <>
                <Token>Sender&apos;s name</Token>
                <br />
                <Token>Title · email · phone</Token>
              </>
            ) : (
              <>
                <b className="text-ink">{isHQ ? `The ${heading} team` : sender.signoff[0]}</b>
                <br />
                {sender.signoff[1]}
                {!isHQ && (
                  <>
                    <br />
                    {sender.address}
                  </>
                )}
              </>
            )}
          </p>
        )}
      </div>
      {/* Unbranded: no product named, so no safety information. */}
      {!p.unbranded &&
        zone(
          "isi",
          <div className={cn("grid gap-1.5 border-t border-hair bg-subtle py-3.5 text-label text-ink-2", view === "phone" ? "px-4" : "px-6")}>
            <h5 className="text-label font-extrabold uppercase tracking-wide text-ink">Important Safety Information</h5>
            {p.professional ? (
              <>
                {p.boxedWarning && <div className="border-[1.5px] border-ink px-2.5 py-2 text-caption font-bold">WARNING: SERIOUS INFECTIONS, MORTALITY, MALIGNANCY, MAJOR ADVERSE CARDIOVASCULAR EVENTS AND THROMBOSIS</div>}
                <p>Serious infections that may lead to hospitalization or death have been reported. Evaluate patients before starting and monitor blood counts during treatment.</p>
                <p>
                  Please see <span className="font-bold text-accent-violet underline">full Prescribing Information</span>
                  {p.boxedWarning ? ", including Boxed Warning." : "."}
                </p>
              </>
            ) : (
              <>
                {p.boxedWarning && <p className="font-bold text-ink">{p.brandName} can cause serious side effects, including serious infections that can lead to death.</p>}
                <p>Tell your doctor right away if you have a fever, cough, chills or feel unwell. Your doctor will check your blood counts during treatment.</p>
                <p>
                  Please read the <span className="font-bold text-accent-violet underline">Medication Guide</span> and talk to your doctor about your treatment.
                </p>
              </>
            )}
          </div>
        )}
      {zone(
        "footer",
        <div className={cn("grid gap-1 bg-subtle py-3 text-caption text-ink-3", view === "phone" ? "px-4" : "px-6")}>
          {refs.length > 0 && <p>References: {refs.map((r, i) => `${i + 1}. ${r}`).join("; ")}.</p>}
          {!p.professional && <p>You are receiving this because you signed up for updates. We never share your information.</p>}
          <p>
            Corvane Pharma US, 200 W Madison St, Chicago, IL 60606. <span className="underline">Unsubscribe</span> · <span className="underline">Privacy</span>
          </p>
          <p>US-{p.brandName.slice(0, 3).toUpperCase()}-2611-0042 · Prepared November 2026</p>
        </div>
      )}
    </div>
  );
}
