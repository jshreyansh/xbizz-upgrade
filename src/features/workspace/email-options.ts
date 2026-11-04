import type { ReactNode } from "react";
import { AD_PLACEMENTS, adClaims } from "@/features/workspace/ad-options";
import { LIBRARY_ASSETS, type LibraryAsset } from "@/features/content-library/content-library-data";

/**
 * Email: what a marketer builds for others to send.
 *
 * For HCPs, including pharmacy and formulary teams, it is Approved Email —
 * reps, MSLs and head office send it from the CRM (Veeva Vault CRM, IQVIA OCE, Salesforce). For
 * patients and consumers the brand or the patient-support team sends it from
 * the consumer email platform. Either way SwishX makes it and gets it through
 * MLR; nothing here sends, captures consent or tracks opens.
 */

export type EmailAudience = "HCP" | "PT_Committee" | "Patient" | "Consumer";
export type EmailSender = "rep" | "msl" | "hq" | "support";
export type EmailPurpose =
  | "followup" | "newdata" | "launch" | "congress" | "access" | "medq" | "pub" | "mslcongress"
  | "formulary" | "value"
  | "onboarding" | "savings" | "adherence" | "supportfu"
  | "awareness" | "signup";

export interface EmailRepEdit {
  note: boolean;
  blocks: boolean;
  piece: boolean;
  reorder: boolean;
  noteCharLimit?: number;
}

export interface EmailBlockRule {
  /** Mandatory means locked in template: sales rep cannot deselect or omit this block. Default true. */
  mandatory: boolean;
  /** Editable means sales rep can add a personalized note or commentary within this block. Default false (locked MLR text). */
  editable: boolean;
}

export function getBlockRule(
  rules: Record<string, EmailBlockRule> | undefined,
  blockId: string
): EmailBlockRule {
  return rules?.[blockId] ?? { mandatory: true, editable: false };
}

export interface EmailTypographyStyles {
  headerSize: number;
  headerBold: boolean;
  bodySize: number;
  bodyBold: boolean;
  buttonSize: "md" | "lg";
  buttonStyle: "solid" | "outline" | "brand";
  buttonAlign: "center" | "left" | "full";
  isiSize: "micro" | "caption" | "body";
}

export const DEFAULT_EMAIL_STYLES: EmailTypographyStyles = {
  headerSize: 28,
  headerBold: true,
  bodySize: 16,
  bodyBold: false,
  buttonSize: "md",
  buttonStyle: "solid",
  buttonAlign: "center",
  isiSize: "micro",
};

export type EmailChannel = "veeva" | "oce" | "sfdc" | "sfmc" | "health" | "hubspot" | "braze" | "html";

export interface EmailChannelDef {
  id: EmailChannel;
  name: string;
  sub: string;
  category: "crm" | "marketing" | "custom";
  tokens: string;
  complianceTag: string;
  hint: string;
  recommendedFor: (audience: EmailAudience, sender: EmailSender) => boolean;
}

export const EMAIL_CHANNELS: EmailChannelDef[] = [
  {
    id: "veeva",
    name: "Veeva Vault CRM",
    sub: "Vault CRM + PromoMats Approved Email",
    category: "crm",
    tokens: "{{insertEmailFragments}}, {{customText}}, {{$VaultDocID}}",
    complianceTag: "Field Rep & MSL Approved Email",
    hint: "Uses Veeva fragment architecture, MLR locking tokens, and Vault Doc IDs.",
    recommendedFor: (a, s) => a === "HCP" && s !== "hq",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    sub: "Marketing Hub & Sales CRM Email Sequences",
    category: "marketing",
    tokens: "{{contact.firstname}}, {{personal_token}}, {{unsubscribe_link}}",
    complianceTag: "Inbound Marketing & Sales Sequences",
    hint: "Compatible with HubSpot personalization tokens and responsive email templates.",
    recommendedFor: () => false,
  },
  {
    id: "sfmc",
    name: "Salesforce Marketing Cloud",
    sub: "SFMC Journeys & Email Studio",
    category: "marketing",
    tokens: "%%FirstName%%, %%SenderNote%%, %%unsub_center_url%%",
    complianceTag: "Enterprise Marketing Automation",
    hint: "Uses AMPScript variables and enterprise subscriber management.",
    recommendedFor: (a, s) => (a === "Patient" || a === "Consumer") && s === "hq",
  },
  {
    id: "health",
    name: "Salesforce Health Cloud",
    sub: "Care coordination & patient support outreach",
    category: "crm",
    tokens: "{!Contact.FirstName}, {!CarePlan.Id}, {!Case.Subject}",
    complianceTag: "Patient Support & Nurse Programs",
    hint: "Tailored for support nurses and patient onboarding workflows.",
    recommendedFor: (_a, s) => s === "support",
  },
  {
    id: "oce",
    name: "IQVIA OCE",
    sub: "OCE Personal compliant approved email",
    category: "crm",
    tokens: "{{OCE_Personal}}, {{doc_id}}, {{opt_in}}",
    complianceTag: "Life Sciences Field Engagement",
    hint: "Dynamic fragment architecture for OCE commercial field teams.",
    recommendedFor: () => false,
  },
  {
    id: "sfdc",
    name: "Salesforce Life Sciences Cloud",
    sub: "HCP engagement & hybrid commercial teams",
    category: "crm",
    tokens: "{{recipient.Name}}, {{rep.Signature}}",
    complianceTag: "Commercial Life Sciences",
    hint: "Next-generation Salesforce Life Sciences Cloud Approved Email.",
    recommendedFor: () => false,
  },
  {
    id: "braze",
    name: "Braze",
    sub: "Customer engagement platform & lifecycle campaigns",
    category: "marketing",
    tokens: "{{${first_name}}}, {{campaign_id}}",
    complianceTag: "Consumer Lifecycle Engagement",
    hint: "Liquid syntax personalization and mobile cross-channel delivery.",
    recommendedFor: () => false,
  },
  {
    id: "html",
    name: "HTML Package",
    sub: "Universal ZIP with inline CSS, assets & tracking labels",
    category: "custom",
    tokens: "Standards-compliant responsive HTML package",
    complianceTag: "Agency & Custom ESP Handoff",
    hint: "Portable production package tested across Outlook, Gmail, and Apple Mail.",
    recommendedFor: () => false,
  },
];

export function defaultChannelFor(audience: EmailAudience, sender: EmailSender): EmailChannel {
  if (sender === "support") return "health";
  if ((audience === "HCP" || audience === "PT_Committee") && sender !== "hq") return "veeva";
  if (audience === "Patient" || audience === "Consumer" || sender === "hq") return "sfmc";
  return "veeva";
}

export function defaultChannelsFor(audience: EmailAudience, sender: EmailSender): EmailChannel[] {
  return [defaultChannelFor(audience, sender)];
}

/** Today, for approvals that are about to end. */
export const EMAIL_TODAY = "2 Nov 2026";

export const EMAIL_AUDIENCES: EmailAudience[] = ["HCP", "PT_Committee"];
export const AUDIENCE_LABEL: Record<EmailAudience, { title: string; hint: string }> = {
  HCP: { title: "HCPs", hint: "Doctors, nurses and clinical specialists" },
  PT_Committee: { title: "P&T Committee", hint: "Pharmacy & Therapeutics and formulary decision-makers" },
  Patient: { title: "Patients", hint: "People prescribed the drug, and their carers" },
  Consumer: { title: "Consumers", hint: "The public, about the condition" },
};
/** The audience mid-sentence: "for HCPs", "for P&T committees". */
export const audienceNoun = (a: EmailAudience) => {
  if (a === "HCP") return "HCPs";
  if (a === "PT_Committee") return "P&T committees";
  return AUDIENCE_LABEL[a].title.toLowerCase();
};
/** HCP and P&T Committee emails are Approved Email, sent from the CRM. */
export const isProfessional = (a: EmailAudience) => a === "HCP" || a === "PT_Committee";

interface SenderDef {
  label: string;
  long: string;
  subtitle: string;
  hint: string;
  signoff: [string, string];
  address: string;
  /** What a sample note from this sender says, for the previews. */
  sampleNote: string;
}

/**
 * Who sends it. It changes the output: a rep or account manager adds a note
 * and picks blocks, an MSL sends medical material only, a support nurse writes
 * to a patient, and head office or the brand team sends with nothing
 * personalised.
 */
const SENDERS: Record<EmailSender, SenderDef> = {
  rep: {
    label: "Rep",
    long: "Sales rep",
    subtitle: "Field team · Commercial & promotional follow-up",
    hint: "Adds a personal note and picks from approved promotional blocks.",
    signoff: ["Priya Menon", "Specialty Representative"],
    address: "priya.menon@corvane.com",
    sampleNote: "Good to see you at Tuesday's tumour board. Here is the data you asked about.",
  },
  msl: {
    label: "MSL",
    long: "Medical science liaison",
    subtitle: "Medical affairs · Scientific & clinical exchange",
    hint: "Scientific exchange. Non-promotional, no commercial claims.",
    signoff: ["Dr. Arjun Rao", "Medical Science Liaison"],
    address: "arjun.rao@corvane.com",
    sampleNote: "Thank you for the question at Tuesday's meeting. The information is below.",
  },
  hq: {
    label: "Head office",
    long: "Head office",
    subtitle: "Brand team · Broad updates sent as approved",
    hint: "Sent from the brand to opted-in prescribers. Nothing personalised.",
    signoff: ["The brand team", "Corvane Pharma US"],
    address: "updates@corvane-hcp.com",
    sampleNote: "",
  },
  support: {
    label: "Support nurse",
    long: "Patient support nurse",
    subtitle: "Care team · Treatment guidance & patient onboarding",
    hint: "Adds a short note and picks from approved patient support blocks.",
    signoff: ["Alex Rivera, RN", "Patient Support Nurse"],
    address: "support@corvane-care.com",
    sampleNote: "It was good to speak with you this morning. Here is what we went over.",
  },
};

/** A sender as this audience knows it: head office is "the brand team" to a patient. */
export function senderInfo(id: EmailSender, audience: EmailAudience): SenderDef {
  if (id === "hq" && !isProfessional(audience))
    return {
      ...SENDERS.hq,
      label: "Brand team",
      long: "Brand team",
      subtitle: "Brand team · Direct patient communications sent as approved",
      hint: "Sent from the brand to people who signed up. Nothing personalised.",
      address: "hello@corvane-care.com",
    };
  return SENDERS[id];
}

export const sendersFor = (audience: EmailAudience): EmailSender[] =>
  audience === "HCP" || audience === "PT_Committee" ? ["rep", "msl", "hq"] : audience === "Patient" ? ["hq", "support"] : ["hq"];

/** The ones who write their own note and pick blocks; head office sends as it is. */
export const isPersonalSender = (s: EmailSender) => s !== "hq";

interface PurposeDef {
  label: string;
  subtitle: string;
  audience: EmailAudience;
  /** Who can send it; the first is who usually does. */
  senders: EmailSender[];
  cta: string;
  opening: (brand: string, condition: string) => string;
  subjects: (brand: string, condition: string) => string[];
  /** About the condition only: no product named, so no safety information. */
  unbranded?: boolean;
}

export const EMAIL_PURPOSES: Record<EmailPurpose, PurposeDef> = {
  followup: {
    label: "Meeting follow-up", subtitle: "After a rep visit, with the piece they showed", audience: "HCP", senders: ["rep"], cta: "Book a follow-up",
    opening: (b) => `Thank you for your time. As promised, here is the ${b} information we discussed.`,
    subjects: (b) => [`Following up on our ${b} conversation`, `The ${b} data we discussed`, `Your ${b} leave-behind, as promised`],
  },
  newdata: {
    label: "New data", subtitle: "A new result or follow-up analysis", audience: "HCP", senders: ["rep", "hq"], cta: "See the full results",
    opening: (b, c) => `New long-term results for ${b} in ${c} are now available.`,
    subjects: (b, c) => [`New long-term ${b} data in ${c}`, `${b}: what the follow-up showed`, `Updated ${b} results for your patients`],
  },
  launch: {
    label: "Launch", subtitle: "A new product, indication or strength", audience: "HCP", senders: ["hq", "rep"], cta: "See how to start patients",
    opening: (b, c) => `${b} is now available for adults with ${c}.`,
    subjects: (b, c) => [`${b} is now available for ${c}`, `Introducing ${b}`, `Starting patients on ${b}`],
  },
  congress: {
    label: "Congress invite", subtitle: "An invitation to a symposium or booth", audience: "HCP", senders: ["rep", "hq"], cta: "Reserve a seat",
    opening: (b) => `You are invited to the ${b} industry symposium at this year's congress.`,
    subjects: (b) => [`Join us: ${b} symposium`, `Your seat at the ${b} symposium`, `${b} at congress: you're invited`],
  },
  access: {
    label: "Access & support", subtitle: "Copay, pharmacy and starting patients", audience: "HCP", senders: ["rep", "hq"], cta: "Contact patient support",
    opening: (b) => `Starting a patient on ${b}? Here is how the support programme can help.`,
    subjects: (b) => [`${b} support for your patients`, `Helping your patients start ${b}`, `Copay and pharmacy support for ${b}`],
  },
  medq: {
    label: "Answer a medical question", subtitle: "Reply to a doctor's unsolicited question", audience: "HCP", senders: ["msl"], cta: "Ask another question",
    opening: () => "Thank you for your question. The information you asked for is below.",
    subjects: (b) => [`Your question about ${b}`, `Medical information: ${b}`, `Re: your ${b} question`],
  },
  pub: {
    label: "Share a publication", subtitle: "A paper or reprint a doctor asked for", audience: "HCP", senders: ["msl"], cta: "Request a discussion",
    opening: (b) => `As discussed, here is the primary publication for ${b}.`,
    subjects: (b) => [`${b} primary publication`, "The paper we discussed", `${b}: publication you asked for`],
  },
  mslcongress: {
    label: "Congress follow-up", subtitle: "Presentations a doctor asked about", audience: "HCP", senders: ["msl"], cta: "Request a discussion",
    opening: (b) => `Here are the ${b} presentations from congress that you asked about.`,
    subjects: (b) => [`${b} presentations from congress`, `The ${b} poster you asked about`, "The congress data you asked about"],
  },
  formulary: {
    label: "Formulary review", subtitle: "Ahead of a P&T or formulary decision", audience: "HCP", senders: ["rep", "hq"], cta: "Request the formulary kit",
    opening: (b, c) => `Ahead of your formulary review, here is a summary of ${b} for ${c}.`,
    subjects: (b) => [`${b}: summary for your formulary review`, `${b} formulary kit`, `Preparing for P&T: ${b}`],
  },
  value: {
    label: "Value & outcomes", subtitle: "Budget impact and health outcomes", audience: "HCP", senders: ["rep", "hq"], cta: "Open the value dossier",
    opening: (b) => `Here is the budget impact and outcomes evidence for ${b} that you asked about.`,
    subjects: (b) => [`${b}: budget impact and outcomes`, `The ${b} value dossier`, `Health economics for ${b}`],
  },
  onboarding: {
    label: "Starting treatment", subtitle: "Welcome, and what to expect", audience: "Patient", senders: ["hq", "support"], cta: "Join the support programme",
    opening: (b) => `Welcome. Your doctor has prescribed ${b}. Here is what to expect in your first few weeks.`,
    subjects: (b) => [`Welcome to ${b}`, `Starting ${b}: what to expect`, `Your first weeks on ${b}`],
  },
  savings: {
    label: "Savings & copay", subtitle: "Help paying for treatment", audience: "Patient", senders: ["hq", "support"], cta: "Get your savings card",
    opening: (b) => `You may be able to pay less for ${b}. Here is how the savings programme works.`,
    subjects: (b) => [`You could pay less for ${b}`, `Your ${b} savings card`, `Help paying for ${b}`],
  },
  adherence: {
    label: "Staying on treatment", subtitle: "Reminders and tips between visits", audience: "Patient", senders: ["hq", "support"], cta: "Set up reminders",
    opening: (b) => `Taking ${b} as prescribed matters. Here are a few tips for staying on track.`,
    subjects: (b) => [`Staying on track with ${b}`, "A few tips for your treatment", `Reminders for taking ${b}`],
  },
  supportfu: {
    label: "Support follow-up", subtitle: "After a call with a support nurse", audience: "Patient", senders: ["support"], cta: "Book another call",
    opening: () => "Thank you for speaking with me today. As promised, here is the information we discussed.",
    subjects: () => ["Following up on our call", "What we talked about today", "Your notes from today's call"],
  },
  awareness: {
    label: "Disease awareness", subtitle: "About the condition, with no product named", audience: "Consumer", senders: ["hq"], cta: "Find a specialist", unbranded: true,
    opening: (_b, c) => `Living with ${c}? You are not alone, and there are questions worth asking your doctor.`,
    subjects: (_b, c) => [`Questions to ask about ${c}`, `Living with ${c}`, `What to know about ${c}`],
  },
  signup: {
    label: "Welcome", subtitle: "After someone signs up for updates", audience: "Consumer", senders: ["hq"], cta: "Visit the website", unbranded: true,
    opening: (_b, c) => `Thanks for signing up. Here is what we will send you about ${c}.`,
    subjects: (_b, c) => ["Thanks for signing up", `Your guide to ${c}`, "Welcome: here's what's next"],
  },
};

export const purposesFor = (sender: EmailSender, audience: EmailAudience): EmailPurpose[] => {
  const targetAudience = audience === "PT_Committee" ? "HCP" : audience;
  return (Object.keys(EMAIL_PURPOSES) as EmailPurpose[]).filter(
    (id) => EMAIL_PURPOSES[id].audience === targetAudience && EMAIL_PURPOSES[id].senders.includes(sender)
  );
};

/** The prompt screen's examples, by who it is for and who sends it. */
export function emailSamplePrompts(audience: EmailAudience, sender: EmailSender, purpose: EmailPurpose, subject: string, prescribers: string, condition: string) {
  if (audience === "PT_Committee" || purpose === "formulary" || purpose === "value")
    return [
      { id: "formulary", tag: "Formulary review", prompt: `Write an email an account manager can send to the P&T committee regarding the formulary review for ${subject}, linking the formulary kit.` },
      { id: "value", tag: "Value & outcomes", prompt: `Draft an email for the P&T committee highlighting budget impact models and clinical outcomes for ${subject}.` },
      { id: "dossier", tag: "Value dossier", prompt: `Create a concise email offering the AMCP value dossier for ${subject} to the health system formulary evaluation team.` },
    ];
  if (audience === "Patient")
    return [
      { id: "onboarding", tag: "Starting treatment", prompt: `Write a welcome email for people just prescribed ${subject}: what to expect, how to take it, and how the support programme helps.` },
      { id: "savings", tag: "Savings", prompt: `Draft a plain-language email explaining the savings card for ${subject} and how to sign up.` },
      { id: "adherence", tag: "Staying on treatment", prompt: `Create a reminder email with tips for staying on ${subject} between doctor visits.` },
    ];
  if (audience === "Consumer")
    return [
      { id: "awareness", tag: "Disease awareness", prompt: `Write an unbranded email about ${condition}: common signs, questions to ask a doctor, and where to find a specialist.` },
      { id: "signup", tag: "Welcome", prompt: `Draft a welcome email for people who signed up for updates about ${condition}, with no product named.` },
      { id: "specialist", tag: "Find a specialist", prompt: `Create a short email encouraging people living with ${condition} to talk to a specialist.` },
    ];
  if (sender === "msl")
    return [
      { id: "medq", tag: "Medical question", prompt: `Answer an unsolicited question from one of the ${prescribers} about dose modification on ${subject}, citing the Prescribing Information.` },
      { id: "pub", tag: "Publication", prompt: `Write a non-promotional MSL email sharing the primary publication for ${subject} with a doctor who asked for it.` },
      { id: "congress", tag: "Congress", prompt: `Draft an MSL follow-up sharing the long-term poster for ${subject} with investigators who asked about durability.` },
    ];
  if (sender === "hq")
    return [
      { id: "newdata", tag: "New data", prompt: `Create a head-office email to opted-in ${prescribers} announcing the long-term results for ${subject}.` },
      { id: "congress", tag: "Congress", prompt: `Invite opted-in ${prescribers} to the industry symposium on ${subject}, with the key efficacy result.` },
      { id: "access", tag: "Access", prompt: `Write a head-office email explaining copay and specialty pharmacy support for ${subject}.` },
    ];
  const lead =
    purpose === "followup"
      ? { id: "followup", tag: "Follow-up", prompt: `Write a follow-up email reps can send ${prescribers} after a visit about ${subject}, led by the primary endpoint, with the leave-behind attached.` }
      : { id: purpose, tag: EMAIL_PURPOSES[purpose].label, prompt: `Write a ${EMAIL_PURPOSES[purpose].label.toLowerCase()} email reps can send ${prescribers} about ${subject}.` };
  return [
    lead,
    { id: "symptoms", tag: "Secondary endpoint", prompt: `Draft a short email for ${prescribers} built around the key secondary endpoint for ${subject}.` },
    { id: "starting", tag: "Starting patients", prompt: `Create an email for reps to send after a first prescription, covering dosing and how the support programme helps patients start ${subject}.` },
  ];
}

/* ── Blocks: Veeva calls them fragments ── */

export interface EmailBlock {
  id: string;
  title: string;
  claimId: string;
  text: string;
  source: string;
  /** The number the block leads on, when it has one. */
  stat?: string;
  /** When the claim's source approval ends, if soon. */
  expires?: string;
  link?: string;
  /** Where it was drafted from: the dossier, the approved piece, a file the user added, or custom chat. */
  group?: "dossier" | "piece" | "file" | "custom";
  /** Drafted from the user's own file: a new claim, reviewed by MLR. */
  newClaim?: boolean;
}

/**
 * Blocks drafted from what the plan added beyond the dossier: the approved
 * pieces lead with their own figures, and each file gives one block from what its
 * note says it is for.
 */
export function sourceBlocks(piecesOrPiece: EmailPiece[] | EmailPiece | undefined, files: Array<{ name: string; note?: string }>): EmailBlock[] {
  const pieces = Array.isArray(piecesOrPiece) ? piecesOrPiece : piecesOrPiece ? [piecesOrPiece] : [];
  return [
    ...pieces.map((piece) => ({
      id: `piece-${piece.id}`,
      title: piece.cutdownName ? piece.title : (piece.asset.badge ?? piece.title),
      claimId: `AP-${piece.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase()}`,
      text: piece.asset.metric ? `${piece.asset.metric}: ${piece.asset.metricLabel ?? ""}`.trim() : `Key message and clinical evidence from the approved ${piece.title}.`,
      source: `${piece.title} · approved piece`,
      stat: piece.asset.metric?.match(/^[\d.]+%?/)?.[0],
      group: "piece" as const,
    })),
    ...files.map((f) => ({
      id: `file-${f.name}`,
      title: "From your file",
      claimId: "New",
      text: f.note || `Content from ${f.name}.`,
      source: f.name,
      group: "file" as const,
      newClaim: true,
    })),
  ];
}

const statOf = (text: string) => text.match(/\d+(\.\d+)?%/)?.[0];

/* Brands the ad claims don't cover yet. */
const EXTRA_CLAIMS: Record<string, Array<{ id: string; text: string; source: string }>> = {
  cardioxa: [
    { id: "CL-401", text: "21% lower risk of cardiovascular death or heart failure hospitalization vs placebo", source: "DELIVER-HF · Primary endpoint" },
    { id: "CL-405", text: "One capsule, once a day", source: "Prescribing Information §2.1" },
  ],
};

/**
 * The approved blocks the sender picks from. For HCPs and hospitals every
 * number traces to a claim; patients get the same facts in plain language,
 * from the patient leaflet; consumers get the condition and no product.
 */
export function emailBlocks(brandId: string, brandName: string, sender: EmailSender, audience: EmailAudience, condition: string, purpose?: EmailPurpose): EmailBlock[] {
  if (audience === "Consumer")
    return [
      { id: "c-about", title: `About ${condition}`, claimId: "DA-01", text: `${condition[0].toUpperCase()}${condition.slice(1)} affects many adults, and symptoms can build slowly.`, source: "CDC disease information" },
      { id: "c-ask", title: "Questions for your doctor", claimId: "DA-02", text: "Ask about your symptoms, how they affect daily life, and which treatments exist.", source: "Disease awareness copy deck" },
      { id: "c-find", title: "Find a specialist", claimId: "DA-03", text: "A specialist can help you understand your options.", source: "Disease awareness copy deck", link: "Find a specialist near you" },
    ];
  if (audience === "Patient")
    return [
      { id: "p-what", title: `What ${brandName} is`, claimId: "PT-01", text: `${brandName} is a prescription medicine for ${condition}. Your doctor decides if it is right for you.`, source: "Medication Guide · What is it?" },
      { id: "p-take", title: "How to take it", claimId: "PT-02", text: "Take it exactly as your doctor tells you. Your doctor will check your blood counts during treatment.", source: "Medication Guide · How should I take it?" },
      { id: "p-save", title: "Savings card", claimId: "PT-03", text: "Eligible commercially insured patients may pay as little as $0 a month.", source: `${brandName} savings programme terms`, stat: "$0", link: "Get your savings card" },
      { id: "p-nurse", title: "Talk to a nurse", claimId: "PT-04", text: "A support nurse can answer questions about starting treatment, by phone, Monday to Friday.", source: `${brandName} support programme terms` },
    ];
  if (sender === "msl")
    return [
      { id: "reprint", title: "Primary publication", claimId: "MI-201", text: "The full paper, licensed for proactive sharing by Medical.", source: "Journal reprint licence", link: "Read the publication" },
      { id: "poster", title: "Long-term follow-up poster", claimId: "MI-202", text: "The poster as presented at congress.", source: "Congress poster", link: "View the poster" },
      { id: "medinfo", title: "Dose modification", claimId: "MI-203", text: "How to adjust the dose for lab abnormalities, as set out in the Prescribing Information.", source: "Prescribing Information §2.2" },
    ];
  const claims = [...adClaims(brandId), ...(EXTRA_CLAIMS[brandId] ?? [])];
  const base = claims.length ? claims : [{ id: "CL-001", text: `${brandName} met its primary endpoint`, source: "Pivotal study · Primary endpoint" }];
  const trial = base[0].source.split(" · ")[0];
  const primary = { id: `b-${base[0].id}`, title: "Primary endpoint", claimId: base[0].id, text: base[0].text, source: base[0].source, stat: statOf(base[0].text) };
  /* Formulary and value emails go to pharmacy and P&T teams: the formulary kit, not the efficacy story. */
  if (purpose === "formulary" || purpose === "value")
    return [
      primary,
      { id: "h-formulary", title: "Formulary summary", claimId: "FK-01", text: "Dosing, packaging, storage and how it is covered, on one page for your committee.", source: "Formulary kit v3", link: "Download the summary" },
      { id: "h-budget", title: "Budget impact", claimId: "VE-02", text: "A budget impact model for a plan of one million members, adjustable to your population.", source: "Budget impact model v2" },
      { id: "h-dossier", title: "AMCP value dossier", claimId: "VE-03", text: "The AMCP-format dossier, with the clinical and economic evidence.", source: "AMCP Format 4.1 dossier", link: "Request the dossier" },
    ];
  return [
    ...base.map((c, i) => ({
      id: `b-${c.id}`,
      title: i === 0 ? "Primary endpoint" : /§/.test(c.source) ? "Dosing" : "Secondary endpoint",
      claimId: c.id,
      text: c.text,
      source: c.source,
      stat: statOf(c.text),
    })),
    { id: "b-longterm", title: "Durable responses", claimId: "CL-LT", text: "Responses were maintained through 3 years of follow-up.", source: `${trial} · 3-year extension`, stat: "3 yrs", expires: "14 Nov 2026" },
    { id: "b-access", title: `${brandName} support`, claimId: "CL-SP", text: "Copay support and specialty pharmacy coordination for eligible patients.", source: `${brandName} support programme terms`, link: "Enrol a patient" },
  ];
}

/* ── Pieces, pages and links ── */

export interface EmailPiece {
  id: string;
  title: string;
  kind: "Docs" | "Video" | "Ad";
  spec: string;
  /** The Content Library item itself, so a picker can show it as the shelf does. */
  asset: LibraryAsset;
  /** Only an approved or published piece can be linked from an email. */
  linkable: boolean;
  /** "Published 15 Sep 2026", or why it can't be linked yet. */
  approval: string;
  parentAdId?: string;
  adPlacementId?: string;
  cutdownName?: string;
}

const NOT_YET: Partial<Record<LibraryAsset["status"], string>> = {
  Draft: "Still a draft. It can be linked once approved.",
  "In MLR review": "In MLR review. It can be linked once approved.",
  "Changes requested": "MLR asked for changes. It can be linked once approved.",
};

/**
 * This brand's leave-behinds, leaflets, videos, and ad cutdowns in the Content Library,
 * for this audience. If the brand has no library items yet, provides realistic approved assets
 * so the marketer can always build from approved collateral.
 */
export function libraryPieces(brandName: string, audience: EmailAudience = "HCP"): EmailPiece[] {
  if (audience === "Consumer") return [];
  const forPatients = audience === "Patient";
  let matches = LIBRARY_ASSETS.filter(
    (a) => a.brand.toLowerCase() === (brandName || "").toLowerCase() && a.stage !== "archived" && /patient/i.test(a.audience) === forPatients && !/field/i.test(a.audience)
  );

  // If brand has no direct matching assets in mock library, provide brand-adapted approved assets
  if (matches.length === 0) {
    const brandDisplay = brandName || "Onkavia";
    matches = [
      {
        id: `${brandDisplay.toLowerCase()}-moa-film`,
        title: `${brandDisplay} Mechanism of Action Film`,
        kind: "video",
        scenarioId: "hcp-launch",
        brand: brandDisplay,
        audience: forPatients ? "Patients" : "HCP",
        spec: "16:9 · 45 sec",
        status: "Published",
        stage: "published",
        updated: "Oct 12, 2026",
        ownerId: "m1",
        views: 140,
        comments: 2,
        gradient: "linear-gradient(150deg,#0f2d22,#14532d 55%,#1f7a4d)",
        videoSrc: "/reel-moa.mp4",
      },
      {
        id: `${brandDisplay.toLowerCase()}-leave-behind`,
        title: `${brandDisplay} Clinical Efficacy Readout Panel`,
        kind: "infographic",
        scenarioId: "mechanism-infographic",
        brand: brandDisplay,
        audience: forPatients ? "Patients" : "HCP",
        spec: "Landscape · 1 page",
        status: "Published",
        stage: "published",
        updated: "Oct 15, 2026",
        ownerId: "m2",
        views: 95,
        comments: 1,
        gradient: "linear-gradient(150deg,#111827,#1f2937 55%,#334155)",
        badge: "Pivotal Endpoints",
        metric: "52% Response",
        metricLabel: "vs 18% standard of care",
      },
      {
        id: `${brandDisplay.toLowerCase()}-launch-campaign`,
        title: `${brandDisplay} Launch Campaign Assets`,
        kind: "ad",
        scenarioId: "patient-education",
        brand: brandDisplay,
        audience: forPatients ? "Patients" : "HCP",
        spec: "4 ads · 4 formats",
        status: "Published",
        stage: "published",
        updated: "Oct 22, 2026",
        ownerId: "m1",
        views: 210,
        comments: 4,
        gradient: "linear-gradient(150deg,#7c2d12,#c2410c 55%,#f97316)",
        badge: "Launch Ads",
        metric: "4 cuts",
        metricLabel: "YouTube · Meta · Display · LinkedIn",
        ad: {
          kind: "brand-launch",
          type: "product-claim",
          audience: forPatients ? "Patient" : "HCP",
          placements: ["youtube", "meta-feed", "google-display", "linkedin-feed"],
          formats: { "linkedin-feed": ["document"] },
          subject: { kind: "drug", id: brandDisplay.toLowerCase(), name: brandDisplay },
        },
      },
    ];
  }

  const result: EmailPiece[] = [];

  matches.forEach((a) => {
    const linkable = a.status === "Approved" || a.status === "Published";
    const approval = linkable ? `${a.status} ${a.updated}` : (NOT_YET[a.status] ?? a.status);

    if (a.kind === "ad" && a.ad?.placements) {
      a.ad.placements.forEach((pId) => {
        const placement = AD_PLACEMENTS.find((p) => p.id === pId);
        const pLabel = placement?.label || pId;
        const pSizes = placement?.sizes ? placement.sizes.split("·")[0].trim() : "Ad Cutdown";
        result.push({
          id: `${a.id}:${pId}`,
          title: `${a.title} · ${pLabel}`,
          kind: "Ad",
          spec: pSizes,
          asset: a,
          linkable,
          approval,
          parentAdId: a.id,
          adPlacementId: pId,
          cutdownName: `${pLabel} (${pSizes})`,
        });
      });
    } else {
      result.push({
        id: a.id,
        title: a.title,
        kind: a.kind === "video" ? ("Video" as const) : ("Docs" as const),
        spec: a.spec,
        asset: a,
        linkable,
        approval,
      });
    }
  });

  return result.sort((a, b) => Number(b.linkable) - Number(a.linkable) || Number(a.kind === "Video") - Number(b.kind === "Video"));
}

/** The pieces an email can actually link to. */
export function approvedPieces(brandName: string, audience: EmailAudience = "HCP"): EmailPiece[] {
  return libraryPieces(brandName, audience).filter((p) => p.linkable);
}

/** Emails that usually follow a piece the doctor already has. */
const FOLLOWS_A_PIECE: EmailPurpose[] = ["followup", "newdata", "formulary", "supportfu"];

/**
 * The piece SwishX builds from unless told otherwise: a leave-behind before a
 * video, and only for emails that follow one up. The rest start from the dossier.
 */
export function suggestedPiece(brandName: string, audience: EmailAudience, purpose: EmailPurpose): string | null {
  if (!FOLLOWS_A_PIECE.includes(purpose) || EMAIL_PURPOSES[purpose].unbranded) return null;
  return approvedPieces(brandName, audience)[0]?.id ?? null;
}

export interface EmailTemplate {
  id: string;
  title: string;
  detail: string;
  /** How its header is drawn. */
  header: "plain" | "letter" | "banner";
  /** How many blocks the layout is designed around. */
  holds: number;
  /** A SwishX layout in the brand kit, or one of the brand's own approved shells. */
  from: "swishx" | "brand";
  approval: string;
}

/** SwishX's layouts, each built in the brand kit, then the brand's approved email shells. */
export function emailTemplates(brandName: string, audience: EmailAudience, condition: string): EmailTemplate[] {
  const swishx: EmailTemplate[] = [
    { id: "sx-highlight", title: "Data highlight", detail: "A colour header, then the lead number large", header: "plain", holds: 4, from: "swishx", approval: "Brand kit" },
    { id: "sx-letter", title: "Simple letter", detail: "Reads like a personal email, with a signature", header: "letter", holds: 3, from: "swishx", approval: "Brand kit" },
    { id: "sx-news", title: "Newsletter", detail: "A banner, then several short sections", header: "banner", holds: 6, from: "swishx", approval: "Brand kit" },
  ];
  if (audience === "Consumer")
    return [...swishx, { id: "aware-news", title: `Understanding ${condition} newsletter`, detail: "Banner header and a sign-up footer", header: "banner", holds: 4, from: "brand", approval: "Approved Jul 2026" }];
  if (audience === "Patient")
    return [...swishx, { id: "patient-update", title: `${brandName} patient update`, detail: "Banner header, plain-language safety at the foot", header: "banner", holds: 4, from: "brand", approval: "Approved Aug 2026" }];
  return [
    ...swishx,
    { id: "letter", title: `${brandName} rep letter`, detail: "Plain header and a signature", header: "letter", holds: 3, from: "brand", approval: "Approved Jun 2026" },
    { id: "news", title: `${brandName} news`, detail: "Banner header, for new data and congress news", header: "banner", holds: 5, from: "brand", approval: "Approved Sep 2026" },
  ];
}

const slugOf = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");

export interface ApprovedLink {
  label: string;
  url: string;
  code: string;
}

/** The approved web pages for this brand and audience, kept per brand and market in the Product library. */
export function approvedLinks(brandName: string, audience: EmailAudience, condition: string): Record<string, ApprovedLink> {
  const hcp = `https://www.${slugOf(brandName)}-hcp.com`;
  const patient = `https://www.${slugOf(brandName)}.com`;
  const aware = `https://www.understanding${slugOf(condition)}.com`;
  if (audience === "Patient")
    return {
      patientsite: { label: `${brandName} patient website`, url: patient, code: "US-PAT-2604-0007" },
      savings: { label: "Savings card sign-up", url: `${patient}/savings`, code: "US-PAT-2605-0011" },
      support: { label: "Support programme", url: `${patient}/support`, code: "US-PAT-2605-0012" },
    };
  if (audience === "Consumer")
    return {
      awarenesssite: { label: "Disease awareness website", url: aware, code: "US-DA-2603-0004" },
      specialist: { label: "Find a specialist", url: `${aware}/find-a-specialist`, code: "US-DA-2603-0005" },
    };
  return {
    site: { label: `${brandName} HCP website`, url: hcp, code: "US-HCP-2604-0012" },
    access: { label: `${brandName} support enrolment`, url: `${hcp}/support/enrol`, code: "US-HCP-2605-0020" },
    symposium: { label: "Symposium sign-up", url: `${hcp}/symposium`, code: "US-HCP-2610-0051" },
    formulary: { label: "Formulary kit request", url: `${hcp}/formulary`, code: "US-HCP-2606-0018" },
    medinfo: { label: "Medical information request", url: "https://medinfo.corvane.com/request", code: "US-MED-2601-0003" },
  };
}

/** A web address SwishX can link a button to. */
export const isUrl = (url: string) => /^https?:\/\/[^\s/]+\.[^\s]+$/i.test(url.trim());

/* ── What goes in the email besides the blocks ── */

export type EmailMediaKind = "image" | "video" | "doc" | "link";

export interface EmailMedia {
  uid: string;
  kind: EmailMediaKind;
  /** From the platform it is already approved; an upload goes to MLR as its own item. */
  from: "platform" | "upload";
  title: string;
  /** Where it came from, in a few words. */
  src: string;
  gradient: string;
  /** The picture itself, for an image from the drug's or workspace library. */
  visual?: ReactNode;
  /** What a still shows when drawn here: its lead number or a word. */
  label?: string;
  /** An uploaded image, shown as uploaded. */
  previewUrl?: string;
  url?: string;
  alt: string;
  /** Approved claims the file shows. */
  claims: string[];
  /** Numbers in an upload that match no approved claim; each becomes a new claim for MLR. */
  newClaims: string[];
  /** Its document number, or "New". */
  code: string;
  /** Videos: an animated GIF thumbnail instead of a still. */
  gif?: boolean;
  duration?: string;
  /** Links: on the brand's approved list. */
  approved?: boolean;
}

/** Platform items an email can insert, beyond the drug's own images. */
export function platformMedia(brandName: string, audience: EmailAudience = "HCP"): EmailMedia[] {
  const pieces = approvedPieces(brandName, audience);
  return [
    ...pieces.filter((p) => p.kind === "Docs").map((p) => ({
      uid: `lib-img-${p.id}`, kind: "image" as const, from: "platform" as const, title: `${p.title}, page 1`, src: `Docs · ${p.spec}`, gradient: p.asset.gradient,
      label: p.title.split(" ")[0], alt: `${p.title}, first page.`, claims: [], newClaims: [], code: p.asset.updated,
    })),
    ...pieces.filter((p) => p.kind === "Video").map((p) => ({
      uid: `lib-vid-${p.id}`, kind: "video" as const, from: "platform" as const, title: p.title, src: `Video · ${p.spec}`, gradient: p.asset.gradient,
      alt: `Play video: ${p.title}.`, claims: [], newClaims: [], code: p.asset.updated, duration: p.spec.match(/(\d+) sec/)?.[1] ? `0:${p.spec.match(/(\d+) sec/)![1].padStart(2, "0")}` : undefined, gif: false,
    })),
    ...pieces.filter((p) => p.kind === "Docs").map((p) => ({
      uid: `lib-doc-${p.id}`, kind: "doc" as const, from: "platform" as const, title: p.title, src: `Docs · ${p.spec}`, gradient: p.asset.gradient,
      alt: "", claims: [], newClaims: [], code: p.asset.updated,
    })),
  ];
}

/** Sample uploads, so the checks can be tried without a file to hand. */
export const SAMPLE_UPLOADS: Record<"image" | "video" | "doc", Array<{ title: string; gradient: string; label: string; numbers: string[]; altSuggest: string; duration?: string }>> = {
  image: [
    { title: "efficacy-chart.png", gradient: "linear-gradient(135deg,#5b3a9e,#c06c84)", label: "Chart", numbers: ["matched", "68%"], altSuggest: "Bar chart comparing the response rates on treatment and placebo." },
    { title: "clinic-photo.jpg", gradient: "linear-gradient(135deg,#8a9bb0,#c9d3de)", label: "Photo", numbers: [], altSuggest: "A doctor talking with a patient in a clinic." },
  ],
  video: [{ title: "kol-interview.mp4", gradient: "linear-gradient(140deg,#2b2b3a,#6a6a8a)", label: "", numbers: [], altSuggest: "Play video: an expert on treating patients, 2 minutes 40 seconds.", duration: "2:40" }],
  doc: [{ title: "study-summary.pdf", gradient: "linear-gradient(160deg,#444,#888)", label: "PDF", numbers: ["matched"], altSuggest: "" }],
};

/* ── Links ── */

export type LinkStatus = "approved" | "auto" | "review" | "missing";
export interface EmailLink {
  label: string;
  dest: string;
  status: LinkStatus;
  /** The label click reports show it under. */
  tag: string;
  cta?: boolean;
}
export const LINK_STATUS: Record<LinkStatus, { tone: "ok" | "lock" | "warn" | "danger"; label: string }> = {
  approved: { tone: "ok", label: "Approved" },
  auto: { tone: "lock", label: "Added by SwishX" },
  review: { tone: "warn", label: "Needs MLR review" },
  missing: { tone: "danger", label: "Missing" },
};

export const linkTag = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

export type CtaPriority = "primary" | "secondary" | "tertiary";

export interface EmailCtaItem {
  id: string;
  label: string;
  url: string;
  priority: CtaPriority;
  /** If attached to a specific block ID; null or undefined means email-level / SwishX placement */
  blockId?: string | null;
  /** Attached to one or multiple specific block IDs */
  blockIds?: string[];
}

export interface EmailBacklinkItem {
  id: string;
  title: string;
  context: string;
  url: string;
  /** If attached to a specific block ID; null or undefined means general reference */
  blockId?: string | null;
  /** Attached to one or multiple specific block IDs */
  blockIds?: string[];
}

/** Check if a CTA is attached to a given block ID */
export function isCtaAttachedToBlock(cta: EmailCtaItem, blockId: string): boolean {
  return cta.blockId === blockId;
}

/** Check if a Backlink is attached to a given block ID */
export function isBacklinkAttachedToBlock(backlink: EmailBacklinkItem, blockId: string): boolean {
  return backlink.blockId === blockId;
}

/** Check if a CTA has no specific block attachments (so it belongs in the email footer) */
export function isCtaUnassigned(cta: EmailCtaItem): boolean {
  return !cta.blockId;
}

/** Check if a Backlink has no specific block attachments (so it belongs in general references) */
export function isBacklinkUnassigned(backlink: EmailBacklinkItem): boolean {
  return !backlink.blockId;
}

/**
 * The button, as a link. SwishX has no list of the brand's approved pages, so
 * the URL is the one the marketer gives, and it goes to MLR with the email.
 */
export function ctaLink(text: string, url: string, priority: CtaPriority = "primary"): EmailLink {
  const base = { label: `${priority === "primary" ? "Primary Button" : "Secondary Button"}: ${text}`, tag: linkTag(text), cta: true };
  return isUrl(url) ? { ...base, dest: url.trim(), status: "review" } : { ...base, dest: url.trim() ? "Not a web address yet" : "No URL yet", status: "missing" };
}

/** Every link in the email: buttons, backlinks, what was inserted, documents, and what SwishX always adds. */
export function emailLinks(
  cta: EmailLink,
  media: EmailMedia[],
  pieces: EmailPiece[],
  audience: EmailAudience,
  unbranded: boolean,
  extraCtas: EmailCtaItem[] = [],
  backlinks: EmailBacklinkItem[] = []
): EmailLink[] {
  const list: EmailLink[] = [cta];
  for (let i = 0; i < extraCtas.length; i++) {
    const c = extraCtas[i];
    const link = ctaLink(c.label, c.url, c.priority);
    list.push({ ...link, tag: extraCtas.length > 1 ? `${link.tag}_${i + 1}` : link.tag });
  }
  for (let i = 0; i < backlinks.length; i++) {
    const bl = backlinks[i];
    list.push({
      label: `Backlink: ${bl.title}`,
      dest: isUrl(bl.url) ? bl.url.trim() : bl.url.trim() ? "Not a web address yet" : "No URL yet",
      status: isUrl(bl.url) ? "review" : "missing",
      tag: `${linkTag(bl.title)}${backlinks.length > 1 ? `_${i + 1}` : ""}`,
    });
  }
  const professional = isProfessional(audience);
  for (const m of media) {
    if (m.kind === "video") list.push({ label: `Video: ${m.title}`, dest: m.from === "platform" ? `Hosted player · ${m.code}` : "Hosted player · new upload", status: m.from === "platform" ? "approved" : "review", tag: linkTag(m.title) });
    if (m.kind === "doc") list.push({ label: `Document: ${m.title}`, dest: m.code !== "New" ? (professional ? `{{$VaultDocID}} · ${m.code}` : `Hosted PDF · ${m.code}`) : "New document, hosted once approved", status: m.code !== "New" ? "approved" : "review", tag: linkTag(m.title) });
    if (m.kind === "link") list.push({ label: `Link: ${m.title}`, dest: m.url ?? "", status: m.approved ? "approved" : "review", tag: linkTag(m.title) });
  }
  for (const piece of pieces) list.push({ label: `Document: ${piece.title}`, dest: professional ? `{{PieceLink}} · ${piece.approval}` : `Hosted ${piece.kind === "Video" ? "video" : "PDF"} · ${piece.approval}`, status: "approved", tag: linkTag(piece.title) });
  if (!unbranded)
    list.push(
      professional
        ? { label: "Prescribing Information", dest: "{{PILink}}", status: "auto", tag: "prescribing_information" }
        : { label: "Medication Guide", dest: "Hosted Medication Guide", status: "auto", tag: "medication_guide" },
      { label: "Safety information", dest: professional ? "{{ISILink}}" : "Hosted Important Safety Information", status: "auto", tag: "isi" },
    );
  list.push(
    { label: "Unsubscribe", dest: professional ? "{{unsubscribe_product_link}}" : "The email platform's unsubscribe page", status: "auto", tag: "unsubscribe" },
    { label: "Privacy policy", dest: "https://www.corvane.com/privacy", status: "auto", tag: "privacy" },
  );
  return list;
}

/** The sender in the plural, for "What reps can change". */
export const SENDER_PLURAL: Record<EmailSender, string> = { rep: "reps", msl: "MSLs", hq: "head office", support: "support nurses" };
/** "a rep", "an MSL", for "Try it as …". */
export const SENDER_AS: Record<EmailSender, string> = { rep: "a rep", msl: "an MSL", hq: "head office", support: "a support nurse" };
