/**
 * What an Ads project is made of: the starting points, the three kinds of
 * pharma ad, where an ad runs and what that produces.
 *
 * The kinds are the FDA's own (21 CFR 202.1): a product claim, a reminder,
 * and disease awareness, which is not advertising at all if it names no drug.
 * The kind decides what every ad must carry, so it is the one regulatory
 * decision the project has to know. The starting points are the campaigns
 * US pharma marketers actually run, each of which implies a kind, an
 * audience and the usual placements, so most people never answer those
 * questions themselves.
 *
 * Placements, not platforms. "Meta" says where the money goes; "Meta Reels &
 * Stories" says the ad is a 9:16 video. The placement decides the format and
 * the size, so it is the only thing asked — what gets made follows from it.
 */

import {
  Clapperboard,
  Image as ImageIcon,
  LayoutGrid,
  PanelsTopLeft,
  type LucideIcon,
} from "lucide-react";
import type { Audience } from "@/types/content";

export type AdKind =
  | "scratch"
  | "brand-launch"
  | "disease-awareness"
  | "reminder"
  | "hcp-campaign"
  | "savings"
  | "new-indication";

export type AdType = "product-claim" | "reminder" | "unbranded";

/** What a placement produces. A banner is the animated HTML5 kind with a
 *  scrolling safety panel, the standard pharma display ad. */
export type AdFormat = "video" | "image" | "carousel" | "banner";

export type AdAccount = "Google Ads" | "Meta Ads" | "Programmatic" | "HCP networks" | "TikTok Ads";

export type AdPlacement =
  | "youtube"
  | "google-display"
  | "meta-feed"
  | "meta-reels-stories"
  | "programmatic-display"
  | "programmatic-video"
  | "ctv"
  | "hcp-networks"
  | "tiktok";

/** Ads are for the people a platform can reach. Trade and market-access
 *  audiences are reached through dossiers and portals, not ad accounts. */
export const AD_AUDIENCES: Audience[] = ["Patient", "HCP"];

/* Labelled in the words MLR reviewers use — branded, reminder, unbranded —
   so "Branding" is never mistaken for the ad formats, which come from the
   placements. The hint says what each kind legally requires. */
export const AD_TYPES: Array<{ id: AdType; label: string; hint: string }> = [
  {
    id: "product-claim",
    label: "Branded",
    hint: "A product claim ad. Names the drug and what it treats, with safety information alongside the claim.",
  },
  {
    id: "reminder",
    label: "Reminder",
    hint: "Brand and generic name only, no claims. Not allowed for a drug with a boxed warning.",
  },
  {
    id: "unbranded",
    label: "Unbranded",
    hint: "Disease awareness. About the condition, \u201ctalk to your doctor\u201d. No drug named or implied.",
  },
];

/** The account each group of placements is bought through, with the tools
 *  behind it where the name alone would not say. */
export const AD_ACCOUNTS: Array<{ id: AdAccount; detail?: string }> = [
  { id: "Google Ads" },
  { id: "Meta Ads", detail: "Facebook and Instagram" },
  { id: "Programmatic", detail: "DV360 and The Trade Desk" },
  { id: "HCP networks", detail: "Doximity, Medscape, Epocrates" },
  { id: "TikTok Ads" },
];

/**
 * Where an ad can run, and what running there means it is.
 *
 * `makes` is what SwishX produces for the placement by default. Where a
 * placement takes both video and stills, both are made: a still that is
 * designed as its own piece — composed for a glance, like a good thumbnail,
 * not a frame lifted from the video. Rows the marketer does not want come
 * out in the production plan, which is easier than ticking formats blind.
 */
export const AD_PLACEMENTS: Array<{
  id: AdPlacement;
  account: AdAccount;
  label: string;
  makes: AdFormat[];
  sizes: string;
  /** Who the placement can reach. */
  audiences: Audience[];
}> = [
  { id: "youtube", account: "Google Ads", label: "YouTube", makes: ["video"], sizes: "16:9 in-stream, 9:16 Shorts · 15 or 30 sec", audiences: ["Patient", "HCP"] },
  { id: "google-display", account: "Google Ads", label: "Display", makes: ["banner"], sizes: "300×250, 728×90, 300×600, 160×600, 320×50", audiences: ["Patient", "HCP"] },
  { id: "meta-feed", account: "Meta Ads", label: "Feed", makes: ["video", "image", "carousel"], sizes: "1:1 and 4:5", audiences: ["Patient", "HCP"] },
  { id: "meta-reels-stories", account: "Meta Ads", label: "Reels & Stories", makes: ["video", "image"], sizes: "9:16 full screen", audiences: ["Patient"] },
  { id: "programmatic-display", account: "Programmatic", label: "Display", makes: ["banner"], sizes: "Standard banner sizes", audiences: ["Patient", "HCP"] },
  { id: "programmatic-video", account: "Programmatic", label: "Online video", makes: ["video"], sizes: "16:9 · 15 or 30 sec", audiences: ["Patient", "HCP"] },
  { id: "ctv", account: "Programmatic", label: "Connected TV", makes: ["video"], sizes: "16:9 TV spot · 15, 30 or 60 sec", audiences: ["Patient"] },
  { id: "hcp-networks", account: "HCP networks", label: "In-feed and banners", makes: ["video", "image"], sizes: "Each network's own specs", audiences: ["HCP"] },
  { id: "tiktok", account: "TikTok Ads", label: "In-feed", makes: ["video"], sizes: "9:16 · 15 to 60 sec", audiences: ["Patient"] },
];

export const AD_FORMATS: Array<{ id: AdFormat; label: string; icon: LucideIcon }> = [
  { id: "video", label: "Video", icon: Clapperboard },
  { id: "image", label: "Image", icon: ImageIcon },
  { id: "carousel", label: "Carousel", icon: LayoutGrid },
  { id: "banner", label: "Banner", icon: PanelsTopLeft },
];

export function placementName(id: AdPlacement): string {
  const p = AD_PLACEMENTS.find((x) => x.id === id);
  return p ? `${p.account} · ${p.label}` : id;
}

/** What the chosen placements add up to, in the order formats are listed. */
export function formatsFor(placements: AdPlacement[]): AdFormat[] {
  const made = new Set(AD_PLACEMENTS.filter((p) => placements.includes(p.id)).flatMap((p) => p.makes));
  return AD_FORMATS.map((f) => f.id).filter((f) => made.has(f));
}

export function formatsLabel(placements: AdPlacement[]): string {
  return formatsFor(placements)
    .map((f) => AD_FORMATS.find((o) => o.id === f)?.label)
    .join(" · ");
}

export interface AdKindPreset {
  id: AdKind;
  title: string;
  /** "Launch Ads", for the suggested project name. */
  noun: string;
  audience: Audience;
  adType: AdType;
  placements: AdPlacement[];
}

export const AD_KIND_PRESETS: Record<AdKind, AdKindPreset> = {
  scratch: {
    id: "scratch",
    title: "Create From Scratch",
    noun: "Ads",
    audience: "Patient",
    adType: "product-claim",
    placements: ["youtube", "meta-feed", "meta-reels-stories", "google-display"],
  },
  "brand-launch": {
    id: "brand-launch",
    title: "Brand Launch",
    noun: "Launch Ads",
    audience: "Patient",
    adType: "product-claim",
    placements: ["youtube", "meta-feed", "meta-reels-stories", "ctv"],
  },
  "disease-awareness": {
    id: "disease-awareness",
    title: "Disease Awareness",
    noun: "Awareness Ads",
    audience: "Patient",
    adType: "unbranded",
    placements: ["meta-feed", "meta-reels-stories", "youtube", "ctv"],
  },
  reminder: {
    id: "reminder",
    title: "Reminder Ads",
    noun: "Reminder Ads",
    audience: "Patient",
    adType: "reminder",
    placements: ["youtube", "google-display", "meta-feed"],
  },
  "hcp-campaign": {
    id: "hcp-campaign",
    title: "HCP Campaign",
    noun: "HCP Ads",
    audience: "HCP",
    adType: "product-claim",
    placements: ["hcp-networks", "programmatic-display"],
  },
  savings: {
    id: "savings",
    title: "Savings & Copay Card",
    noun: "Savings Ads",
    audience: "Patient",
    adType: "product-claim",
    placements: ["meta-feed", "google-display", "youtube"],
  },
  "new-indication": {
    id: "new-indication",
    title: "New Indication or Data",
    noun: "New Indication Ads",
    audience: "HCP",
    adType: "product-claim",
    placements: ["hcp-networks", "programmatic-display", "programmatic-video"],
  },
};

/** Keeps what still fits an audience — TikTok and Connected TV cannot reach
 *  doctors, HCP networks cannot reach patients — or starts from a default. */
export function placementsFor(audience: Audience, preferred: AdPlacement[]): AdPlacement[] {
  const allowed = AD_PLACEMENTS.filter((p) => p.audiences.includes(audience)).map((p) => p.id);
  const kept = preferred.filter((p) => allowed.includes(p));
  if (kept.length > 0) return kept;
  return audience === "HCP" ? ["hcp-networks", "programmatic-display"] : ["youtube", "meta-feed", "meta-reels-stories"];
}

/**
 * Placements read from the media agency's plan.
 *
 * A prototype stand-in: any file "reads" as the plan a launch of this kind
 * would usually carry. The real version parses the agency's spreadsheet.
 */
export function placementsFromMediaPlan(audience: Audience): AdPlacement[] {
  return audience === "HCP"
    ? ["hcp-networks", "programmatic-display", "programmatic-video", "google-display"]
    : ["youtube", "meta-feed", "meta-reels-stories", "ctv", "programmatic-display"];
}

/**
 * What the label says about advertising a brand.
 *
 * Mock facts, standing in for the Product Library's label data: whether the
 * drug carries a boxed warning (which rules out reminder ads), whether a
 * cheaper generic exists (California limits copay coupons then), and the
 * indications approved today, newest first.
 */
export interface BrandAdFacts {
  boxedWarning: boolean;
  genericAvailable: boolean;
  indications: Array<{ label: string; isNew?: boolean }>;
}

const BRAND_AD_FACTS: Record<string, BrandAdFacts> = {
  velmora: {
    boxedWarning: false,
    genericAvailable: false,
    indications: [
      { label: "Cardiovascular risk reduction in plaque psoriasis", isNew: true },
      { label: "Moderate-to-severe plaque psoriasis in adults" },
    ],
  },
  onkavia: {
    boxedWarning: true,
    genericAvailable: false,
    indications: [
      { label: "Polycythemia vera after hydroxyurea", isNew: true },
      { label: "Intermediate or high-risk myelofibrosis" },
    ],
  },
  nirvexa: {
    boxedWarning: true,
    genericAvailable: false,
    indications: [{ label: "Moderate-to-severe rheumatoid arthritis in adults" }],
  },
  cardioxa: {
    boxedWarning: true,
    genericAvailable: false,
    indications: [{ label: "Heart failure with reduced ejection fraction" }],
  },
  pulmovax: {
    boxedWarning: false,
    genericAvailable: true,
    indications: [
      { label: "As-needed relief in asthma, ages 12 and up", isNew: true },
      { label: "As-needed relief in asthma, adults" },
    ],
  },
};

export function brandAdFacts(brandId: string): BrandAdFacts {
  return (
    BRAND_AD_FACTS[brandId] ?? {
      boxedWarning: false,
      genericAvailable: false,
      indications: [{ label: "Approved indication, as worded in the label" }],
    }
  );
}

/**
 * Which starting point's examples fit now. The tile's own, unless the kind of
 * ad has since changed — a reminder tile turned into product claim ads should
 * not keep suggesting six-second name-only bumpers.
 */
export function promptKindFor(kind: AdKind, adType: AdType, audience: Audience): AdKind {
  if (AD_KIND_PRESETS[kind].adType === adType) return kind;
  if (adType === "reminder") return "reminder";
  if (adType === "unbranded") return "disease-awareness";
  return audience === "HCP" ? "hcp-campaign" : "brand-launch";
}

/** Example briefs under the prompt, written for the starting point chosen. */
export function adSamplePrompts(kind: AdKind, brand: string): Array<{ id: string; tag: string; prompt: string }> {
  const byKind: Record<AdKind, Array<{ id: string; tag: string; prompt: string }>> = {
    scratch: [
      { id: "launch", tag: "Patient Launch", prompt: `Launch ${brand} to adults with moderate-to-severe plaque psoriasis. Lead with clear skin at Week 16 and drive people to the savings card.` },
      { id: "hcp", tag: "HCP Awareness", prompt: `Reach dermatologists with the EMBRACE-3 result for ${brand} and send them to the HCP site to request samples.` },
      { id: "awareness", tag: "Disease Awareness", prompt: `An unbranded campaign about living with plaque psoriasis that ends with “talk to your dermatologist”.` },
    ],
    "brand-launch": [
      { id: "clear-skin", tag: "Clear Skin Launch", prompt: `Launch ${brand} to adults with moderate-to-severe plaque psoriasis. Lead with clear skin at Week 16 and drive people to the savings card.` },
      { id: "once-daily", tag: "Once-Daily Story", prompt: `Introduce ${brand} as one tablet, once a day, with the EMBRACE-3 result and a link to find a dermatologist.` },
      { id: "caregiver", tag: "Caregivers", prompt: `Launch ads for caregivers of adults with plaque psoriasis, explaining what ${brand} is and how to ask about it.` },
    ],
    "disease-awareness": [
      { id: "living-with", tag: "Living With It", prompt: `An unbranded campaign about the everyday burden of plaque psoriasis that ends with “talk to your dermatologist”.` },
      { id: "symptom-check", tag: "Symptom Check", prompt: `Short videos helping people recognise when psoriasis is moderate to severe, linking to an unbranded symptom checker.` },
      { id: "myths", tag: "Myth vs Fact", prompt: `A carousel busting three common myths about plaque psoriasis, with no product named or implied.` },
    ],
    reminder: [
      { id: "bumper", tag: "6s Bumpers", prompt: `Six-second YouTube bumpers that remind people who saw the launch ad of the ${brand} name.` },
      { id: "feed", tag: "Feed Reminder", prompt: `Feed ads that keep the ${brand} name in front of people who watched the launch video.` },
      { id: "retarget", tag: "Retargeting", prompt: `Display reminder banners for visitors of the ${brand} site who did not sign up for savings.` },
    ],
    "hcp-campaign": [
      { id: "efficacy", tag: "Efficacy Data", prompt: `Reach dermatologists with the EMBRACE-3 PASI 90 result for ${brand} and send them to the HCP site.` },
      { id: "samples", tag: "Request Samples", prompt: `Ads for dermatologists and NPs that drive ${brand} sample requests, led by once-daily dosing.` },
      { id: "switch", tag: "Switch Patients", prompt: `Show dermatologists which patients may be candidates for ${brand} after an inadequate response to topicals.` },
    ],
    savings: [
      { id: "copay", tag: "$0 Copay", prompt: `Drive eligible commercially insured patients to sign up for the ${brand} savings card, pay as little as $0.` },
      { id: "cost", tag: "Cost Worries", prompt: `Ads for people worried about the cost of ${brand}, explaining the savings card and sending them to the savings page.` },
      { id: "support", tag: "Patient Support", prompt: `Tell patients starting ${brand} about the savings card and nurse support line.` },
    ],
    "new-indication": [
      { id: "approval", tag: "Now Approved", prompt: `Announce the newly approved indication for ${brand} to dermatologists and cardiologists, with the pivotal result.` },
      { id: "data", tag: "New Data", prompt: `Share the new long-term data for ${brand} with prescribers, leading with the primary endpoint.` },
      { id: "who", tag: "Who It's For", prompt: `Help prescribers identify which patients the new ${brand} indication covers.` },
    ],
  };
  return byKind[kind];
}
