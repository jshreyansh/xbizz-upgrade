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
  const packshot = email.offImages.includes("packshot") ? undefined : email.packshots[0];
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
  const pad = view === "phone" ? "px-4" : "px-7";
  const subjectLine = subject ?? p.subject;
  /* The image SwishX generates for the header, unless left out on the plan or the layout is a plain letter.
     Stand-in photos in public/email are from Unsplash, under the Unsplash License. */
  const hero = look?.header !== "letter" && !email.offImages.includes("header") ? (p.unbranded ? "/email/awareness-together.jpg" : p.professional ? "/email/hcp-clinic.jpg" : "/email/patient-support.jpg") : null;
  const heroAlt = p.unbranded ? "Friends together outdoors at sunset." : p.professional ? "A specialist talking with a patient in clinic." : "A nurse talking with a patient.";
  /* The chart drawn from the lead number: "52% … vs 18% with placebo" becomes two bars. */
  const showChart = !email.offImages.includes("chart");
  const bars = (text: string) => {
    const nums = [...text.matchAll(/(\d+(?:\.\d+)?)%/g)].map((m) => Number(m[1]));
    return nums.length >= 2 ? nums.slice(0, 2) : null;
  };
  const topLinks = p.unbranded ? [] : p.professional ? ["Prescribing Information", "Important Safety Information"] : ["Medication Guide", "Important Safety Information"];
  const personal = !isHQ;

  return (
    <div className={cn("w-full overflow-hidden rounded-control bg-card text-body-lg leading-relaxed text-ink-2 shadow-float", view === "phone" ? "max-w-[360px]" : "max-w-[600px]")}>
      {live && (
        <div className="grid gap-0.5 border-b border-hair bg-subtle px-4 py-2.5 text-label text-ink-3">
          <b className="text-body-lg text-ink">{subjectLine}</b>
          <span>
            {isHQ ? `${heading} <${sender.address}>` : `${sender.signoff[0]} <${sender.address}>`} · to {recipient.name}
          </span>
          {/* The preheader: what the inbox shows after the subject. */}
          <span className="truncate text-ink-4">{purpose.opening(p.brandName, p.condition)}</span>
        </div>
      )}

      {/* Above the header: who it is for, and the browser link every email carries. */}
      <div className={cn("flex items-center justify-between gap-2 bg-canvas py-1.5 text-caption text-ink-4", pad)}>
        <span>{strapline}</span>
        <span className="underline">View in browser</span>
      </div>

      {zone(
        "header",
        <div>
          {/* The logo bar: the mark, and the safety links pharma puts at the top. */}
          <div className={cn("flex flex-wrap items-center justify-between gap-2 border-b border-hair py-3", pad)}>
            <span className="inline-flex items-center gap-2">
              {!p.unbranded && <span aria-hidden className="size-5 rounded-[5px]" style={{ background: HEADER_ART }} />}
              <span className={cn("font-black tracking-tight text-ink", p.unbranded ? "text-body-lg" : "text-title")}>
                {heading}
                {!p.unbranded && <sup className="text-caption font-bold">®</sup>}
              </span>
            </span>
            {topLinks.length > 0 && (
              <span className="flex flex-wrap gap-x-3 text-caption font-bold text-accent-violet">
                {topLinks.map((l) => (
                  <span key={l} className="underline">
                    {l}
                  </span>
                ))}
              </span>
            )}
          </div>

          {look?.header === "banner" && (
            <div className={cn("py-5 text-white", pad)} style={{ background: HEADER_ART }}>
              <span className="block text-micro font-extrabold uppercase tracking-wide opacity-80">{purpose.label}</span>
              <div className="mt-1 text-display font-black leading-tight">{subjectLine}</div>
            </div>
          )}

          {hero &&
            (imagesOff ? (
              <div className={cn("my-3 grid aspect-[2/1] place-items-center border border-dashed border-hair-3 bg-subtle p-4 text-center text-body text-ink-3", "mx-7")}>{heroAlt}</div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- a hosted email image
              <img src={hero} alt={heroAlt} className="block aspect-[2/1] w-full object-cover" />
            ))}

          {look?.header !== "banner" && (
            <div className={cn("pt-5", pad)}>
              <h1 className="text-display font-black leading-tight tracking-tight text-ink">{subjectLine}</h1>
            </div>
          )}
        </div>
      )}

      <div className={cn("pt-3", pad)}>
        {zone("greeting", <p className="py-1.5">{greeting}</p>)}
        {p.showNote && (!live || noteText) && zone("note", <p className="py-1.5">{noteText}</p>)}
        {zone(
          "opening",
          <>
            <p className="py-1.5">{purpose.opening(p.brandName, p.condition)}</p>
            {/* The indication, near the top, as US promotional email states it. */}
            {p.professional && email.sender !== "msl" && p.wording && (
              <p className="my-2 border-l-[3px] border-accent-violet bg-subtle px-3 py-2 text-body text-ink-2">
                <b className="text-ink">INDICATION: </b>
                {p.wording}
              </p>
            )}
          </>
        )}
        {zone(
          "blocks",
          <>
            {zones && chooses && shownBlocks.length > 0 && <p className="pt-1.5 text-label font-bold text-accent-blue">The rep picks which of these {shownBlocks.length} to send:</p>}
            {zones && shownBlocks.length === 0 && <p className="py-1.5 italic text-ink-4">No blocks in the set. Add some in the plan.</p>}
            {shownBlocks.map((b, i) => {
              const pair = i === 0 && showChart && b.stat ? bars(b.text) : null;
              return (
                <section key={b.id} className={cn("border-t border-hair py-4", expired.includes(b.id) && "opacity-45 line-through")}>
                  <h2 className="text-micro font-extrabold uppercase tracking-wider text-accent-violet">{b.title}</h2>
                  <div className="mt-1.5 flex gap-4">
                    <div className="min-w-0 flex-1">
                      {b.stat ? (
                        <>
                          <b className="block text-display-lg font-black leading-none text-accent-violet">{b.stat}</b>
                          <p className="mt-1.5 text-body-lg text-ink-2">
                            {b.text}
                            <sup className="font-extrabold text-accent-violet">{i + 1}</sup>
                          </p>
                        </>
                      ) : (
                        <p className="text-body-lg text-ink-2">
                          {b.text}
                          <sup className="font-extrabold text-accent-violet">{i + 1}</sup>
                        </p>
                      )}
                      {/* The chart SwishX draws from the claim's own numbers. */}
                      {pair && (
                        <div className="mt-3 grid gap-1.5" role="img" aria-label={`${pair[0]}% with ${p.brandName} versus ${pair[1]}% with placebo`}>
                          {[
                            [p.brandName, pair[0]],
                            ["Placebo", pair[1]],
                          ].map(([label, value], k) => (
                            <div key={String(label)} className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-2 text-caption font-bold text-ink-3">
                              <span className="truncate">{label}</span>
                              <span className="flex items-center gap-1.5">
                                <span className={cn("h-3 rounded-r-[3px]", k === 0 ? "bg-accent-violet" : "bg-hair-3")} style={{ width: `${Math.max(6, Number(value))}%` }} />
                                <span className="tabular-nums text-ink-2">{value}%</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {b.link && <span className="mt-1.5 inline-block text-body font-bold text-accent-violet underline">{b.link} ›</span>}
                    </div>
                    {/* The product shot, beside the lead claim. Images off: its alt text. */}
                    {i === 0 &&
                      packshot &&
                      (imagesOff ? (
                        <span className="grid w-24 shrink-0 place-items-center rounded-chip border border-dashed border-hair-3 p-1 text-center text-caption text-ink-4">{packshot.note || packshot.name}</span>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element -- a hosted email image
                        <img src={packshot.url} alt={packshot.note || `${p.brandName} pack`} className="h-28 w-28 shrink-0 rounded-chip object-cover" />
                      ))}
                  </div>
                </section>
              );
            })}
          </>
        )}
        {email.media.map((m) => zone(`m:${m.uid}`, <MediaPart m={m} imagesOff={imagesOff} />))}
        {pieces.length > 0 &&
          zone(
            "piece",
            <div className="my-2 grid gap-1.5 border-t border-hair pt-4">
              {zones && p.zoneType("piece") === "choose" && <p className="text-label font-bold text-accent-blue">The rep ticks which of these {pieces.length} go with the email:</p>}
              {pieces.map((piece) => (
                <div key={piece.id} className="flex items-center gap-3 rounded-control border border-hair-2 bg-subtle p-2.5">
                  <AssetPreview asset={{ gradient: piece.asset.gradient }} className={cn("shrink-0 rounded-chip", piece.kind === "Video" ? "h-10 w-14" : "h-12 w-9")} />
                  <span className="min-w-0 flex-1">
                    <b className="block text-body-lg text-ink">{piece.title}</b>
                    <span className="text-label text-ink-3">
                      {piece.kind === "Video" ? "Watch the video" : "Download the PDF"} · {piece.spec}
                    </span>
                  </span>
                  <span className="text-body font-bold text-accent-violet">›</span>
                </div>
              ))}
            </div>
          )}
        {zone(
          "cta",
          <div className="py-4 text-center">
            <span className="inline-block rounded-[4px] bg-accent-violet px-7 py-3 text-body-lg font-extrabold text-white">{p.ctaText}</span>
            {zones && (
              <span className={cn("mt-1.5 block text-caption font-bold", p.cta.status === "missing" ? "text-danger" : "text-accent-blue")}>
                {p.cta.status === "missing" ? "Goes nowhere yet: add its URL in the plan" : `Goes to ${p.cta.dest}`}
              </span>
            )}
          </div>
        )}
        {zone(
          "signoff",
          <div className="flex items-center gap-3 border-t border-hair py-4 text-body-lg">
            {personal && live && !imagesOff && (
              // eslint-disable-next-line @next/next/no-img-element -- the sender's CRM photo
              <img src="/email/rep-portrait.jpg" alt="" className="size-12 shrink-0 rounded-full object-cover" />
            )}
            <p>
              {zones && personal ? (
                <>
                  <Token>Sender&apos;s name</Token>
                  <br />
                  <Token>Title · email · phone</Token>
                </>
              ) : (
                <>
                  <b className="text-ink">{isHQ ? `The ${heading} team` : sender.signoff[0]}</b>
                  <br />
                  <span className="text-body text-ink-3">
                    {sender.signoff[1]}
                    {personal && ` · ${sender.address}`}
                  </span>
                </>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Unbranded: no product named, so no safety information. */}
      {!p.unbranded &&
        zone(
          "isi",
          <div className={cn("grid gap-2 border-t-[3px] border-accent-violet bg-subtle py-5 text-label text-ink-2", pad)}>
            {p.professional && p.wording && (
              <>
                <h5 className="text-label font-extrabold uppercase tracking-wide text-ink">Indication</h5>
                <p>{p.wording}</p>
              </>
            )}
            <h5 className="text-label font-extrabold uppercase tracking-wide text-ink">Important Safety Information</h5>
            {p.professional ? (
              <>
                {p.boxedWarning && (
                  <div className="border-[1.5px] border-ink px-3 py-2 text-caption">
                    <b className="block font-extrabold text-ink">WARNING: SERIOUS INFECTIONS, MORTALITY, MALIGNANCY, MAJOR ADVERSE CARDIOVASCULAR EVENTS AND THROMBOSIS</b>
                    Serious infections leading to hospitalization or death have occurred. Evaluate and test for latent infection before treatment.
                  </div>
                )}
                <p>
                  <b className="text-ink">Infections:</b> Serious infections that may lead to hospitalization or death have been reported. Monitor patients closely during and after treatment.
                </p>
                <p>
                  <b className="text-ink">Laboratory monitoring:</b> Check blood counts before starting and during treatment.
                </p>
                <p>
                  Please see <span className="font-bold text-accent-violet underline">full Prescribing Information</span>
                  {p.boxedWarning ? ", including Boxed Warning" : ""}, and <span className="font-bold text-accent-violet underline">Medication Guide</span>.
                </p>
              </>
            ) : (
              <>
                {p.boxedWarning && <p className="font-bold text-ink">{p.brandName} can cause serious side effects, including serious infections that can lead to death.</p>}
                <p>Tell your doctor right away if you have a fever, cough, chills or feel unwell. Your doctor will check your blood counts during treatment.</p>
                <p>
                  Please read the <span className="font-bold text-accent-violet underline">Medication Guide</span> and talk to your doctor about your treatment. You are encouraged to report side effects to the FDA at 1-800-FDA-1088.
                </p>
              </>
            )}
          </div>
        )}

      {zone(
        "footer",
        <div className={cn("grid gap-1.5 bg-ink py-5 text-caption text-card/70", pad)}>
          {refs.length > 0 && (
            <p>
              <b className="text-card/90">References:</b> {refs.map((r, i) => `${i + 1}. ${r}`).join(". ")}.
            </p>
          )}
          {!p.professional && <p>You are receiving this email because you signed up for updates. We never sell your information.</p>}
          {!p.unbranded && <p>{p.brandName} is a registered trademark of Corvane Pharma US.</p>}
          <p>© 2026 Corvane Pharma US, 200 W Madison St, Chicago, IL 60606. All rights reserved.</p>
          <p>
            <span className="underline">Unsubscribe</span> · <span className="underline">Privacy Policy</span> · <span className="underline">Contact us</span>
          </p>
          <p className="tabular-nums">US-{p.brandName.slice(0, 3).toUpperCase()}-2611-0042 · 11/26</p>
        </div>
      )}
    </div>
  );
}
