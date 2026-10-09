"use client";

import { create } from "zustand";

/**
 * Congress poster guidelines, as structured rules.
 *
 * A congress decides most of a poster before anyone opens the editor: what
 * has to be delivered and at what size, how big the type must be, whether a
 * brand name or a sponsor may appear, what must be disclosed, what has to be
 * printed on it. So a poster starts by choosing the congress and its
 * presentation type, and the rest follows.
 *
 * Every rule is a field with a source, never free text, so later steps can
 * use it: the generator writes generic names, the check flags a missing
 * acceptance code. Sources say where a value came from — the guidelines (and
 * which page), the person who added it, or the common convention standing in
 * for something the guidelines did not say. A rule can also be "not stated":
 * the guidelines are silent and nothing is assumed.
 *
 * The list belongs to the workspace, not the project: a congress one person
 * adds is there for the next person. In the prototype that is a store that
 * outlives a project reset; nothing is persisted.
 */

/* ───────────────────────────────── Sources ───────────────────────────────── */

export type RuleSource =
  /** Read from the guidelines, on this page if known. */
  | { kind: "doc"; page?: number }
  /** Set by a person in this workspace. */
  | { kind: "you" }
  /** The guidelines did not say; the common convention stands in — check it. */
  | { kind: "default" }
  /** The guidelines did not say, and nothing is assumed. */
  | { kind: "unstated" };

export interface Field<T> {
  /** null when not stated. */
  value: T | null;
  source: RuleSource;
}

const doc = <T,>(value: T, page?: number): Field<T> => ({ value, source: { kind: "doc", page } });
const unstated = <T,>(): Field<T> => ({ value: null, source: { kind: "unstated" } });
const assumed = <T,>(value: T): Field<T> => ({ value, source: { kind: "default" } });

/* ───────────────────────────────── Rule shapes ───────────────────────────────── */

export type Unit = "mm" | "cm" | "in";

export interface PosterSize {
  width: number;
  height: number;
  unit: Unit;
  /** "max" when the guidelines say "no larger than". */
  limit: "exact" | "max";
}

/** The poster file itself. A recorded commentary is separate: see recording. */
export type FileType = "PDF" | "PPTX" | "PPT" | "PNG" | "JPEG";

export interface Deliverables {
  print: { required: boolean } | null;
  digital: {
    required: boolean;
    fileTypes: FileType[];
    aspect: "16:9" | "4:3" | "same as print" | null;
    maxMB: number | null;
    minDpi: number | null;
    /** 1 for a single page; more when slides are allowed. */
    maxPages: number | null;
    /**
     * A recorded talk-over some congresses take with the ePoster. Not part of
     * the poster and not made in SwishX: kept so the deliverables can say so.
     */
    recording: { required: boolean; minutes: number } | null;
  } | null;
}

export interface PtRange {
  min: number | null;
  max: number | null;
}

export interface FontSizes {
  title: PtRange;
  headings: PtRange;
  body: PtRange;
  legends: PtRange;
  readableFrom: { value: number; unit: "m" | "ft" } | null;
}

export interface FontFamilies {
  families: string[];
  standardOnly: boolean;
}

export type DrugNames = "generic" | "generic-brand-brackets" | "brand-allowed";
export type CompanyName = "not-allowed" | "allowed" | "required";
export type Logos = "none" | "nonprofit" | "sponsor-allowed";
export type Allowance = "allowed" | "not-allowed";

export interface Disclosure {
  who: "linked" | "presenter" | "all";
  evenIfNone: boolean;
  funding: boolean;
  medicalWriting: boolean;
  aiUse: boolean;
}

export interface QrRules {
  allowed: "no" | "yes" | "encouraged";
  links: "poster-copy" | "educational" | "commercial-ok";
  max: number | null;
  disclaimerRequired: boolean;
  disclaimer: string;
}

export interface RequiredItem {
  id: string;
  label: string;
  placement: string;
  /** Who supplies the value: the congress assigns it, or it is yours. */
  issuedBy: "congress" | "you";
}

export interface ContentRules {
  poster: string[];
  tip: string[];
  noResultsInTip: boolean;
}

export interface EmbargoRules {
  atSessionStart: boolean;
  encoreAllowed: boolean | null;
  notes: string;
}

export interface PresentationType {
  id: "poster" | "tip" | "eposter" | "encore";
  label: string;
  /** ePoster-only: nothing is printed. */
  digitalOnly?: boolean;
  note?: string;
}

export interface CongressRules {
  sizes: Field<PosterSize[]>;
  deliverables: Field<Deliverables>;
  fontSizes: Field<FontSizes>;
  fontFamilies: Field<FontFamilies>;
  drugNames: Field<DrugNames>;
  companyName: Field<CompanyName>;
  sponsorWording: Field<string>;
  logos: Field<Logos>;
  brandLook: Field<Allowance>;
  congressLogo: Field<Allowance>;
  otherBranding: Field<string>;
  disclosure: Field<Disclosure>;
  qr: Field<QrRules>;
  requiredItems: Field<RequiredItem[]>;
  content: Field<ContentRules>;
  embargo: Field<EmbargoRules>;
}

export type RuleKey = keyof CongressRules;

export interface Congress {
  id: string;
  acronym: string;
  name: string;
  year: string;
  city?: string;
  therapyAreas: string[];
  /**
   * Only verified guidelines can be used on a poster. Anything added in a
   * workspace — or not yet fully checked — waits for SwishX to verify it
   * against the source, a person in the loop, usually 6–7 hours.
   */
  status: "verified" | "pending";
  /** Who added it: SwishX's catalogue, or someone in this workspace. */
  origin: "swishx" | "team";
  /** When it was sent for verification. */
  submittedAt?: number;
  /** A correction to a verified congress, waiting for verification. The verified rules stay in use. */
  pendingRevision?: { submittedAt: number; rules: CongressRules };
  sourceUrl?: string;
  verifiedOn?: string;
  presentationTypes: PresentationType[];
  rules: CongressRules;
}

/* ───────────────────────────────── Labels ───────────────────────────────── */

export const RULE_LABELS: Record<RuleKey, string> = {
  sizes: "Size",
  deliverables: "What you deliver",
  fontSizes: "Font sizes",
  fontFamilies: "Font families",
  drugNames: "Drug names",
  companyName: "Company name",
  sponsorWording: "Sponsor wording",
  logos: "Logos",
  brandLook: "Brand look",
  congressLogo: "Congress logo",
  otherBranding: "Other instructions",
  disclosure: "Disclosures",
  qr: "QR codes",
  requiredItems: "Required on the poster",
  content: "Content",
  embargo: "Embargo and reuse",
};

export const RULE_GROUPS: Array<{ id: string; label: string; keys: RuleKey[] }> = [
  { id: "delivery", label: "Size and delivery", keys: ["sizes", "deliverables"] },
  { id: "type", label: "Type", keys: ["fontSizes", "fontFamilies"] },
  {
    id: "branding",
    label: "Branding",
    keys: ["drugNames", "companyName", "sponsorWording", "logos", "brandLook", "congressLogo", "otherBranding"],
  },
  { id: "disclosure", label: "Disclosures", keys: ["disclosure"] },
  { id: "qr", label: "QR codes", keys: ["qr"] },
  { id: "required", label: "Required on the poster", keys: ["requiredItems"] },
  { id: "content", label: "Content", keys: ["content"] },
  { id: "embargo", label: "Embargo and reuse", keys: ["embargo"] },
];

export const DRUG_NAME_LABELS: Record<DrugNames, string> = {
  generic: "Generic names only",
  "generic-brand-brackets": "Generic, brand in brackets on first use",
  "brand-allowed": "Brand names allowed",
};
export const COMPANY_NAME_LABELS: Record<CompanyName, string> = {
  "not-allowed": "Not allowed",
  allowed: "Allowed",
  required: "Required as a sponsor acknowledgement",
};
export const LOGO_LABELS: Record<Logos, string> = {
  none: "No logos",
  nonprofit: "Non-profit, academic and hospital logos only",
  "sponsor-allowed": "Sponsor logo allowed",
};
export const ALLOWANCE_LABELS: Record<Allowance, string> = { allowed: "Allowed", "not-allowed": "Not allowed" };
export const DISCLOSURE_WHO_LABELS: Record<Disclosure["who"], string> = {
  linked: "Not on the poster (shown by the congress)",
  presenter: "Presenter only",
  all: "All authors",
};
export const QR_ALLOWED_LABELS: Record<QrRules["allowed"], string> = {
  no: "Not allowed",
  yes: "Allowed",
  encouraged: "Encouraged",
};
export const QR_LINK_LABELS: Record<QrRules["links"], string> = {
  "poster-copy": "A copy of the poster only",
  educational: "Educational content",
  "commercial-ok": "Commercial sites allowed (no advertising)",
};
export const FONT_FAMILY_OPTIONS = [
  "Arial",
  "Calibri",
  "Helvetica",
  "Times New Roman",
  "Verdana",
  "Symbol",
  "Any sans-serif",
  "Any",
];
export const FILE_TYPE_OPTIONS: FileType[] = ["PDF", "PPTX", "PPT", "PNG", "JPEG"];
export const SIZE_PRESETS: Array<{ label: string; size: PosterSize }> = [
  { label: "A0 portrait", size: { width: 841, height: 1189, unit: "mm", limit: "exact" } },
  { label: "A0 landscape", size: { width: 1189, height: 841, unit: "mm", limit: "exact" } },
  { label: "A1 portrait", size: { width: 594, height: 841, unit: "mm", limit: "exact" } },
  { label: "36 × 48 in portrait", size: { width: 36, height: 48, unit: "in", limit: "exact" } },
  { label: "48 × 36 in landscape", size: { width: 48, height: 36, unit: "in", limit: "exact" } },
  { label: "56 × 42 in landscape", size: { width: 56, height: 42, unit: "in", limit: "exact" } },
];

/* ───────────────────────────────── Formatting ───────────────────────────────── */

export function orientationOf(size: PosterSize): "Portrait" | "Landscape" | "Square" {
  return size.width > size.height ? "Landscape" : size.width < size.height ? "Portrait" : "Square";
}

export function formatSize(size: PosterSize) {
  return `${size.limit === "max" ? "Up to " : ""}${size.width} × ${size.height} ${size.unit} · ${orientationOf(size).toLowerCase()}`;
}

export function formatRange(range: PtRange) {
  if (range.min == null && range.max == null) return null;
  if (range.min != null && range.max != null) return `${range.min}–${range.max} pt`;
  return range.min != null ? `${range.min} pt or more` : `up to ${range.max} pt`;
}

export function congressLabel(congress: Pick<Congress, "name" | "year">) {
  return congress.year ? `${congress.name} · ${congress.year}` : congress.name;
}

/* ───────────────────────────────── Defaults ───────────────────────────────── */

const STANDARD_SECTIONS = ["Title and authors", "Background", "Methods", "Results", "Conclusions"];
const TIP_SECTIONS = ["Title and authors", "Background", "Trial design"];

/** The common convention, for anything a congress's guidelines do not say. */
export function conventionalRules(): CongressRules {
  return {
    sizes: assumed([{ width: 1189, height: 841, unit: "mm", limit: "exact" }]),
    deliverables: assumed({
      print: { required: true },
      digital: { required: false, fileTypes: ["PDF"], aspect: "same as print", maxMB: 10, minDpi: 300, maxPages: 1, recording: null },
    }),
    fontSizes: assumed({
      title: { min: 72, max: 100 },
      headings: { min: 36, max: 60 },
      body: { min: 24, max: null },
      legends: { min: 14, max: 28 },
      readableFrom: { value: 1, unit: "m" },
    }),
    fontFamilies: assumed({ families: ["Any sans-serif"], standardOnly: false }),
    drugNames: assumed("generic"),
    companyName: assumed("not-allowed"),
    sponsorWording: assumed("Study sponsored by {company}"),
    logos: assumed("nonprofit"),
    brandLook: assumed("not-allowed"),
    congressLogo: assumed("not-allowed"),
    otherBranding: unstated(),
    disclosure: assumed({ who: "all", evenIfNone: true, funding: true, medicalWriting: false, aiUse: false }),
    qr: assumed({
      allowed: "yes",
      links: "educational",
      max: 1,
      disclaimerRequired: true,
      disclaimer:
        "Copies of this poster obtained through Quick Response (QR) Code are for personal use only and may not be reproduced without permission of the authors.",
    }),
    requiredItems: assumed([{ id: "email", label: "Contact email", placement: "Bottom", issuedBy: "you" }]),
    content: assumed({ poster: STANDARD_SECTIONS, tip: TIP_SECTIONS, noResultsInTip: true }),
    embargo: assumed({ atSessionStart: true, encoreAllowed: null, notes: "" }),
  };
}

/** Rules where the guidelines are silent and nothing is assumed. */
function silentRules(): CongressRules {
  return {
    sizes: unstated(),
    deliverables: unstated(),
    fontSizes: unstated(),
    fontFamilies: unstated(),
    drugNames: unstated(),
    companyName: unstated(),
    sponsorWording: unstated(),
    logos: unstated(),
    brandLook: unstated(),
    congressLogo: unstated(),
    otherBranding: unstated(),
    disclosure: unstated(),
    qr: unstated(),
    requiredItems: unstated(),
    content: unstated(),
    embargo: unstated(),
  };
}

const range = (min: number | null, max: number | null = null): PtRange => ({ min, max });
const noFonts = (): FontSizes => ({ title: range(null), headings: range(null), body: range(null), legends: range(null), readableFrom: null });

export const POSTER: PresentationType = { id: "poster", label: "Printed poster" };
const TIP: PresentationType = {
  id: "tip",
  label: "Trials in Progress",
  note: "No results data and no brand names. Background and Trial design only.",
};
export const EPOSTER_ONLY: PresentationType = { id: "eposter", label: "Digital poster only", digitalOnly: true };
const ENCORE: PresentationType = { id: "encore", label: "Encore" };

function congress(
  base: Omit<Congress, "rules">,
  rules: Partial<CongressRules>
): Congress {
  return { ...base, rules: { ...silentRules(), ...rules } };
}

/* ───────────────────────────────── The catalogue ───────────────────────────────── */

const CHECKED = "9 Oct 2026";

const SEEDED: Congress[] = [
  congress(
    {
      id: "esmo-2026",
      acronym: "ESMO",
      name: "ESMO Congress",
      year: "2026",
      city: "Madrid",
      therapyAreas: ["Oncology"],
      status: "verified",
      origin: "swishx",
      verifiedOn: CHECKED,
      sourceUrl: "https://dam.esmo.org/image/upload/v1783425264/ESMO-Congress-2026-Poster-Presenters-Instructions_j108ee.pdf",
      presentationTypes: [POSTER, TIP, EPOSTER_ONLY],
    },
    {
      sizes: doc([{ width: 190, height: 110, unit: "cm", limit: "exact" }], 1),
      deliverables: doc({
        print: { required: true },
        digital: { required: true, fileTypes: ["PDF"], aspect: "16:9", maxMB: 500, minDpi: null, maxPages: 1, recording: null },
      }, 1),
      fontSizes: doc({ ...noFonts(), readableFrom: { value: 1, unit: "m" } }, 1),
      drugNames: doc("generic-brand-brackets"),
      companyName: doc("required", 1),
      sponsorWording: doc("Study sponsored by {company}", 1),
      brandLook: doc("not-allowed", 1),
      congressLogo: doc("not-allowed"),
      disclosure: doc({ who: "presenter", evenIfNone: true, funding: true, medicalWriting: true, aiUse: true }, 1),
      qr: doc({
        allowed: "yes",
        links: "commercial-ok",
        max: null,
        disclaimerRequired: true,
        disclaimer:
          "Copies of this poster obtained through QR, AR and/or text key codes are for personal use only and may not be reproduced without written permission of the authors",
      }, 1),
      requiredItems: doc([
        { id: "fpn", label: "Final Publication Number (FPN)", placement: "Clearly visible", issuedBy: "congress" },
        { id: "email", label: "Contact email", placement: "Bottom (optional)", issuedBy: "you" },
      ], 1),
      content: doc({ poster: STANDARD_SECTIONS, tip: TIP_SECTIONS, noResultsInTip: true }),
      embargo: doc({ atSessionStart: true, encoreAllowed: false, notes: "Updated data on a previously presented study is allowed if declared." }),
    }
  ),
  congress(
    {
      id: "sabcs-2026",
      acronym: "SABCS",
      name: "San Antonio Breast Cancer Symposium",
      year: "2026",
      city: "San Antonio",
      therapyAreas: ["Oncology", "Breast cancer"],
      status: "verified",
      origin: "swishx",
      verifiedOn: CHECKED,
      sourceUrl: "https://sabcs.org/poster-presentation-guidelines/",
      presentationTypes: [POSTER],
    },
    {
      sizes: doc([{ width: 72, height: 36, unit: "in", limit: "exact" }]),
      deliverables: doc({
        print: { required: false },
        digital: { required: true, fileTypes: ["PDF"], aspect: "16:9", maxMB: null, minDpi: null, maxPages: 1, recording: { required: false, minutes: 3 } },
      }),
      fontSizes: doc({ ...noFonts(), body: range(22) }),
      logos: doc("nonprofit"),
      brandLook: doc("not-allowed"),
      qr: doc({
        allowed: "yes",
        links: "poster-copy",
        max: null,
        disclaimerRequired: true,
        disclaimer:
          "Copies of this poster obtained through Quick Response (QR Code) are for personal use only and may not be reproduced without permission from SABCS® and the author.",
      }),
      requiredItems: doc([
        { id: "presentation-id", label: "Presentation ID", placement: "Top panel", issuedBy: "congress" },
        { id: "email", label: "Contact email (a co-author)", placement: "Anywhere", issuedBy: "you" },
      ]),
    }
  ),
  congress(
    {
      id: "wclc-2026",
      acronym: "WCLC",
      name: "IASLC World Conference on Lung Cancer",
      year: "2026",
      therapyAreas: ["Oncology", "Lung cancer"],
      status: "verified",
      origin: "swishx",
      verifiedOn: CHECKED,
      sourceUrl: "https://wclc.iaslc.org/presenter-resources/",
      presentationTypes: [POSTER, EPOSTER_ONLY],
    },
    {
      sizes: doc([{ width: 1189, height: 841, unit: "mm", limit: "exact" }]),
      deliverables: doc({
        print: { required: true },
        digital: { required: true, fileTypes: ["PDF", "PPTX"], aspect: "16:9", maxMB: null, minDpi: null, maxPages: 5, recording: { required: false, minutes: 5 } },
      }),
      fontSizes: doc({ title: range(72), headings: range(36, 48), body: range(24, 32), legends: range(null), readableFrom: null }),
      drugNames: doc("generic"),
      companyName: doc("not-allowed"),
      logos: doc("nonprofit"),
      brandLook: doc("not-allowed"),
      disclosure: doc({ who: "presenter", evenIfNone: false, funding: false, medicalWriting: false, aiUse: true }),
      qr: doc({ allowed: "yes", links: "educational", max: null, disclaimerRequired: false, disclaimer: "" }),
      requiredItems: doc([
        { id: "poster-number", label: "Poster number (not the abstract number)", placement: "Anywhere", issuedBy: "congress" },
        { id: "email", label: "Corresponding author email", placement: "Anywhere", issuedBy: "you" },
      ]),
    }
  ),
  congress(
    {
      id: "esc-2026",
      acronym: "ESC",
      name: "ESC Congress",
      year: "2026",
      city: "Munich",
      therapyAreas: ["Cardiology"],
      status: "verified",
      origin: "swishx",
      verifiedOn: CHECKED,
      sourceUrl: "https://www.escardio.org/events/congresses/esc-congress/scientific-programme/faculty-presenters/abstract-presentation-guidelines/",
      presentationTypes: [EPOSTER_ONLY],
    },
    {
      deliverables: doc({
        print: null,
        digital: { required: true, fileTypes: ["PDF"], aspect: "16:9", maxMB: null, minDpi: 200, maxPages: 1, recording: { required: true, minutes: 3 } },
      }),
      fontSizes: doc({ title: range(14), headings: range(14), body: range(14), legends: range(14), readableFrom: null }),
      fontFamilies: doc({ families: ["Times New Roman", "Helvetica", "Arial", "Calibri", "Verdana", "Symbol"], standardOnly: true }),
      congressLogo: doc("not-allowed"),
      disclosure: doc({ who: "linked", evenIfNone: false, funding: false, medicalWriting: false, aiUse: false }),
      qr: doc({ allowed: "no", links: "poster-copy", max: 0, disclaimerRequired: false, disclaimer: "" }),
      content: doc({ poster: ["Title, authors and address", "Purpose", "Methods", "Results", "Conclusions"], tip: [], noResultsInTip: false }),
    }
  ),
  congress(
    {
      id: "easd-2026",
      acronym: "EASD",
      name: "EASD Annual Meeting",
      year: "2026",
      city: "Milan",
      therapyAreas: ["Diabetes", "Endocrinology"],
      status: "verified",
      origin: "swishx",
      verifiedOn: CHECKED,
      sourceUrl: "https://www.easd.org/uploads/MEvents_Speaker_Instructions_ShortOral.pdf",
      presentationTypes: [EPOSTER_ONLY],
    },
    {
      sizes: doc([{ width: 1189, height: 841, unit: "mm", limit: "exact" }]),
      deliverables: doc({
        print: null,
        digital: { required: true, fileTypes: ["PDF"], aspect: null, maxMB: null, minDpi: 200, maxPages: 1, recording: null },
      }),
      qr: doc({ allowed: "yes", links: "poster-copy", max: null, disclaimerRequired: false, disclaimer: "" }),
      embargo: doc({ atSessionStart: true, encoreAllowed: null, notes: "" }),
    }
  ),
  congress(
    {
      id: "ueg-2026",
      acronym: "UEG Week",
      name: "UEG Week",
      year: "2026",
      city: "Barcelona",
      therapyAreas: ["Gastroenterology"],
      status: "verified",
      origin: "swishx",
      verifiedOn: CHECKED,
      sourceUrl: "https://ueg.eu/week/programme/information-for-presenters",
      presentationTypes: [EPOSTER_ONLY],
    },
    {
      sizes: doc([{ width: 26.66, height: 15, unit: "in", limit: "exact" }]),
      deliverables: doc({
        print: null,
        digital: { required: true, fileTypes: ["PDF", "PPTX"], aspect: "16:9", maxMB: 10, minDpi: null, maxPages: 1, recording: { required: false, minutes: 3 } },
      }),
      fontSizes: doc({ ...noFonts(), headings: range(11), body: range(6) }),
      fontFamilies: doc({ families: ["Arial", "Helvetica", "Calibri", "Verdana", "Symbol", "Times New Roman"], standardOnly: true }),
      disclosure: doc({ who: "all", evenIfNone: true, funding: false, medicalWriting: false, aiUse: false }),
      qr: doc({ allowed: "yes", links: "educational", max: 1, disclaimerRequired: false, disclaimer: "" }),
      otherBranding: doc("Use the UEG e-poster template."),
    }
  ),
  congress(
    {
      id: "aan-2026",
      acronym: "AAN",
      name: "AAN Annual Meeting",
      year: "2026",
      therapyAreas: ["Neurology"],
      status: "verified",
      origin: "swishx",
      verifiedOn: CHECKED,
      sourceUrl: "https://www.aan.com/siteassets/home-page/conferences-and-community/annual-meeting/abstracts-and-awards/26-am-presenter-resource-guide.pdf",
      presentationTypes: [EPOSTER_ONLY],
    },
    {
      deliverables: doc({
        print: null,
        digital: { required: true, fileTypes: ["PDF"], aspect: "16:9", maxMB: null, minDpi: null, maxPages: null, recording: null },
      }),
      drugNames: doc("generic"),
      logos: doc("nonprofit"),
      disclosure: doc({ who: "presenter", evenIfNone: false, funding: false, medicalWriting: false, aiUse: false }),
      qr: doc({ allowed: "yes", links: "educational", max: null, disclaimerRequired: false, disclaimer: "" }),
      embargo: doc({ atSessionStart: true, encoreAllowed: null, notes: "Posters must not be shared ahead of their presentation time." }),
    }
  ),
  congress(
    {
      id: "amcp-2026",
      acronym: "AMCP",
      name: "AMCP Annual Meeting",
      year: "2026",
      city: "Nashville",
      therapyAreas: ["Managed care", "HEOR"],
      status: "verified",
      origin: "swishx",
      verifiedOn: CHECKED,
      sourceUrl: "https://amcpannual.org/sites/default/files/2026-01/Poster%20Guidelines%20AMCP%202026.pdf",
      presentationTypes: [POSTER, ENCORE],
    },
    {
      sizes: doc([{ width: 90, height: 42, unit: "in", limit: "max" }]),
      deliverables: doc({
        print: { required: true },
        digital: { required: false, fileTypes: ["PDF"], aspect: "16:9", maxMB: null, minDpi: null, maxPages: 1, recording: { required: false, minutes: 3 } },
      }),
      fontSizes: doc({ ...noFonts(), body: range(6) }),
      fontFamilies: doc({ families: ["Any sans-serif"], standardOnly: false }),
      qr: doc({ allowed: "encouraged", links: "poster-copy", max: null, disclaimerRequired: false, disclaimer: "" }),
      requiredItems: doc([
        { id: "header", label: "Title, authors and institution", placement: "Top, centred, large", issuedBy: "you" },
      ]),
      embargo: doc({ atSessionStart: false, encoreAllowed: true, notes: "Embargoed until the poster abstract supplement is posted, two weeks before the meeting." }),
    }
  ),
  congress(
    {
      id: "acr-2026",
      acronym: "ACR",
      name: "ACR Convergence",
      year: "2026",
      city: "Orlando",
      therapyAreas: ["Rheumatology", "Immunology"],
      status: "verified",
      origin: "swishx",
      verifiedOn: CHECKED,
      sourceUrl: "https://assets.contentstack.io/v3/assets/bltee37abb6b278ab2c/blta7383a2a13a6a085/annual-meeting-call-for-abstracts-submission-guidelines.pdf",
      presentationTypes: [POSTER, ENCORE],
    },
    {
      sizes: doc([{ width: 90, height: 42, unit: "in", limit: "max" }]),
      deliverables: doc({
        print: { required: true },
        digital: { required: false, fileTypes: ["PDF"], aspect: "same as print", maxMB: null, minDpi: null, maxPages: 1, recording: null },
      }),
      fontSizes: doc({ ...noFonts(), body: range(8), readableFrom: { value: 3, unit: "ft" } }),
      fontFamilies: doc({ families: ["Any sans-serif"], standardOnly: false }),
      drugNames: doc("generic"),
      companyName: doc("allowed"),
      sponsorWording: doc("Supported by {company}"),
      logos: doc("nonprofit"),
      otherBranding: doc("No links to company or institution websites."),
      disclosure: doc({ who: "all", evenIfNone: false, funding: true, medicalWriting: false, aiUse: false }),
      qr: doc({ allowed: "yes", links: "poster-copy", max: null, disclaimerRequired: false, disclaimer: "" }),
      requiredItems: doc([
        { id: "abstract-copy", label: "Copy of the accepted abstract", placement: "On or next to the poster", issuedBy: "you" },
      ]),
      embargo: doc({ atSessionStart: true, encoreAllowed: true, notes: "Content beyond the abstract is embargoed until 10:00 AM ET, Sat Nov 7." }),
    }
  ),
  congress(
    {
      id: "ats-2026",
      acronym: "ATS",
      name: "ATS International Conference",
      year: "2026",
      city: "Orlando",
      therapyAreas: ["Respiratory"],
      status: "verified",
      origin: "swishx",
      verifiedOn: CHECKED,
      sourceUrl: "https://craftprd1.blob.core.windows.net/documents/conference/speakers/poster-guidelines-2026.pdf",
      presentationTypes: [POSTER],
    },
    {
      sizes: doc([
        { width: 48, height: 36, unit: "in", limit: "exact" },
        { width: 60, height: 36, unit: "in", limit: "exact" },
        { width: 72, height: 36, unit: "in", limit: "exact" },
      ]),
      deliverables: doc({
        print: { required: true },
        digital: { required: true, fileTypes: ["PDF"], aspect: null, maxMB: null, minDpi: null, maxPages: 1, recording: { required: false, minutes: 5 } },
      }),
      drugNames: doc("generic"),
      logos: doc("nonprofit"),
      otherBranding: doc("One font throughout; avoid abbreviations and jargon."),
      qr: doc({ allowed: "yes", links: "poster-copy", max: null, disclaimerRequired: false, disclaimer: "" }),
    }
  ),
  congress(
    {
      id: "eadv-2026",
      acronym: "EADV",
      name: "EADV Congress",
      year: "2026",
      city: "Vienna",
      therapyAreas: ["Dermatology"],
      status: "verified",
      origin: "swishx",
      verifiedOn: CHECKED,
      sourceUrl: "https://eadv.org/congress/scientific-programme/eposters/",
      presentationTypes: [EPOSTER_ONLY],
    },
    {
      sizes: doc([{ width: 841, height: 1189, unit: "mm", limit: "exact" }]),
      deliverables: doc({
        print: null,
        digital: { required: true, fileTypes: ["PDF"], aspect: null, maxMB: null, minDpi: 200, maxPages: 1, recording: null },
      }),
      qr: doc({ allowed: "yes", links: "educational", max: null, disclaimerRequired: false, disclaimer: "" }),
      requiredItems: doc([{ id: "p-code", label: "ePoster P-code", placement: "One corner", issuedBy: "congress" }]),
      embargo: doc({ atSessionStart: true, encoreAllowed: null, notes: "Embargo lifts 07:00 CEST, 30 Sep. If published before, present it as an encore." }),
    }
  ),
  congress(
    {
      id: "ispor-2026",
      acronym: "ISPOR",
      name: "ISPOR",
      year: "2026",
      city: "Philadelphia",
      therapyAreas: ["HEOR"],
      status: "verified",
      origin: "swishx",
      verifiedOn: CHECKED,
      sourceUrl: "https://www.ispor.org",
      presentationTypes: [POSTER],
    },
    {
      sizes: doc([
        { width: 56, height: 36, unit: "in", limit: "exact" },
        { width: 56, height: 42, unit: "in", limit: "exact" },
      ], 3),
      deliverables: doc({
        print: { required: true },
        digital: { required: true, fileTypes: ["PDF"], aspect: "same as print", maxMB: 10, minDpi: 300, maxPages: 1, recording: null },
      }, 3),
      fontFamilies: doc({ families: ["Calibri", "Arial", "Times New Roman"], standardOnly: false }, 3),
      drugNames: doc("generic", 3),
      brandLook: doc("not-allowed", 3),
      requiredItems: doc([{ id: "acceptance-code", label: "Acceptance code", placement: "Top-right corner", issuedBy: "congress" }], 3),
    }
  ),
  congress(
    {
      id: "ispor-eu-2026",
      acronym: "ISPOR Europe",
      name: "ISPOR Europe",
      year: "2026",
      city: "Vienna",
      therapyAreas: ["HEOR"],
      status: "verified",
      origin: "swishx",
      verifiedOn: CHECKED,
      sourceUrl: "https://www.ispor.org/docs/default-source/ispor-europe-2026/poster-guide_europe26_v1-(1).pdf",
      presentationTypes: [POSTER],
    },
    {
      sizes: doc([{ width: 841, height: 1189, unit: "mm", limit: "exact" }]),
      deliverables: doc({
        print: { required: true },
        digital: { required: true, fileTypes: ["PDF"], aspect: "same as print", maxMB: 10, minDpi: 300, maxPages: 1, recording: null },
      }),
      fontFamilies: doc({ families: ["Calibri", "Arial", "Times New Roman"], standardOnly: false }),
      drugNames: doc("generic"),
      brandLook: doc("not-allowed"),
      requiredItems: doc([{ id: "acceptance-code", label: "Acceptance code", placement: "Top-right corner", issuedBy: "congress" }]),
      embargo: doc({ atSessionStart: true, encoreAllowed: null, notes: "Embargo ends 8 Nov." }),
    }
  ),
  congress(
    {
      id: "ispor-ap-2026",
      acronym: "ISPOR AP",
      name: "ISPOR Asia Pacific Summit",
      year: "2026",
      city: "Bangkok",
      therapyAreas: ["HEOR"],
      status: "verified",
      origin: "swishx",
      verifiedOn: CHECKED,
      sourceUrl: "https://www.ispor.org",
      presentationTypes: [POSTER],
    },
    {
      sizes: doc([{ width: 841, height: 1189, unit: "mm", limit: "exact" }], 2),
      deliverables: doc({
        print: { required: true },
        digital: { required: true, fileTypes: ["PDF"], aspect: "same as print", maxMB: 10, minDpi: 300, maxPages: 1, recording: null },
      }, 2),
      fontFamilies: doc({ families: ["Calibri", "Arial", "Times New Roman"], standardOnly: false }, 2),
      drugNames: doc("generic", 2),
      brandLook: doc("not-allowed", 2),
      requiredItems: doc([{ id: "acceptance-code", label: "Acceptance code", placement: "Top-right corner", issuedBy: "congress" }], 2),
    }
  ),
  /*
   * Pending: the right documents, but blocked, stale or incomplete. ASCO is
   * the exception, marked verified so the demo has a US oncology congress.
   */
  congress(
    {
      id: "asco-2026",
      acronym: "ASCO",
      name: "ASCO Annual Meeting",
      year: "2026",
      city: "Chicago",
      therapyAreas: ["Oncology"],
      status: "verified",
      origin: "swishx",
      verifiedOn: CHECKED,
      sourceUrl: "https://www.asco.org/annual-meeting/abstracts-presentations/poster-presenter-guidelines",
      presentationTypes: [POSTER, TIP],
    },
    {
      sizes: doc([{ width: 72, height: 42, unit: "in", limit: "max" }]),
      deliverables: doc({
        print: { required: true },
        digital: { required: true, fileTypes: ["PDF", "PPTX", "PPT", "JPEG", "PNG"], aspect: null, maxMB: null, minDpi: null, maxPages: 1, recording: { required: false, minutes: 5 } },
      }),
      drugNames: doc("generic"),
      companyName: doc("not-allowed"),
      logos: doc("nonprofit"),
      disclosure: doc({ who: "linked", evenIfNone: false, funding: false, medicalWriting: false, aiUse: false }),
      qr: doc({
        allowed: "yes",
        links: "educational",
        max: null,
        disclaimerRequired: true,
        disclaimer:
          "Copies of this poster obtained through Quick Response (QR) Code are for personal use only and may not be reproduced without permission from ASCO® or the author of this poster.",
      }),
      requiredItems: doc([
        { id: "abstract-number", label: "Abstract number", placement: "With the title", issuedBy: "congress" },
        { id: "email", label: "One contact email", placement: "Anywhere", issuedBy: "you" },
      ]),
      content: doc({ poster: STANDARD_SECTIONS, tip: TIP_SECTIONS, noResultsInTip: true }),
    }
  ),
  congress(
    {
      id: "ash-2026",
      acronym: "ASH",
      name: "ASH Annual Meeting",
      year: "2026",
      city: "New Orleans",
      therapyAreas: ["Hematology"],
      status: "pending",
      origin: "swishx",
      verifiedOn: CHECKED,
      sourceUrl: "https://www.hematology.org/meetings/annual-meeting/meeting-and-presenter-resources/presenter-resources",
      presentationTypes: [POSTER],
    },
    {
      sizes: doc([{ width: 72, height: 48, unit: "in", limit: "max" }]),
      fontSizes: doc({ ...noFonts(), title: range(108) }),
      brandLook: doc("not-allowed"),
      disclosure: doc({ who: "linked", evenIfNone: false, funding: false, medicalWriting: false, aiUse: false }),
    }
  ),
  congress(
    {
      id: "aacr-2026",
      acronym: "AACR",
      name: "AACR Annual Meeting",
      year: "2026",
      city: "San Diego",
      therapyAreas: ["Oncology"],
      status: "pending",
      origin: "swishx",
      verifiedOn: CHECKED,
      sourceUrl: "https://www.aacr.org/wp-content/uploads/2026/01/AACR_Instructions_CreatingEPosters.pdf",
      presentationTypes: [POSTER],
    },
    {
      sizes: doc([{ width: 69, height: 45, unit: "in", limit: "max" }]),
      deliverables: doc({
        print: { required: true },
        digital: { required: true, fileTypes: ["PDF"], aspect: "16:9", maxMB: 50, minDpi: null, maxPages: 1, recording: { required: false, minutes: 5 } },
      }),
      fontSizes: doc({ ...noFonts(), body: range(22), readableFrom: { value: 6, unit: "ft" } }),
      requiredItems: doc([{ id: "abstract-number", label: "Permanent abstract number", placement: "Top panel", issuedBy: "congress" }]),
    }
  ),
  congress(
    {
      id: "aad-2026",
      acronym: "AAD",
      name: "AAD Annual Meeting",
      year: "2026",
      therapyAreas: ["Dermatology"],
      status: "pending",
      origin: "swishx",
      verifiedOn: CHECKED,
      sourceUrl: "https://www.aad.org/member/meetings-education/am27/faculty/abstracts",
      presentationTypes: [EPOSTER_ONLY],
    },
    {
      deliverables: doc({
        print: null,
        digital: { required: true, fileTypes: ["PDF"], aspect: null, maxMB: null, minDpi: null, maxPages: 1, recording: null },
      }, 1),
      drugNames: doc("generic", 1),
      companyName: doc("required", 1),
      sponsorWording: doc("A portion of the cost of this poster was underwritten by {company}.", 1),
      embargo: doc({ atSessionStart: false, encoreAllowed: false, notes: "Published or previously presented material is not accepted." }, 1),
    }
  ),
  congress(
    {
      id: "aha-2026",
      acronym: "AHA",
      name: "AHA Scientific Sessions",
      year: "2026",
      therapyAreas: ["Cardiology"],
      status: "pending",
      origin: "swishx",
      verifiedOn: CHECKED,
      sourceUrl: "https://professional.heart.org/en/meetings/scientific-sessions/programming/for-presenters-and-moderators",
      presentationTypes: [POSTER, EPOSTER_ONLY],
    },
    {
      sizes: doc([{ width: 77, height: 48, unit: "in", limit: "max" }]),
      deliverables: doc({
        print: { required: true },
        digital: { required: true, fileTypes: ["PDF", "PPT"], aspect: "16:9", maxMB: null, minDpi: null, maxPages: 8, recording: { required: false, minutes: 5 } },
      }),
      drugNames: doc("generic"),
      disclosure: doc({ who: "all", evenIfNone: false, funding: false, medicalWriting: false, aiUse: false }),
      qr: doc({ allowed: "yes", links: "poster-copy", max: 1, disclaimerRequired: false, disclaimer: "" }),
      otherBranding: doc("AHA places its own QR card on the left of the board; do not cover it."),
    }
  ),
  congress(
    {
      id: "ada-2025",
      acronym: "ADA",
      name: "ADA Scientific Sessions",
      year: "2025",
      city: "Chicago",
      therapyAreas: ["Diabetes", "Endocrinology"],
      status: "pending",
      origin: "swishx",
      verifiedOn: CHECKED,
      sourceUrl: "https://professional.diabetes.org/sites/dpro/files/2025-04/Poster-Presentation-Guidelines-2025.pdf",
      presentationTypes: [POSTER],
    },
    {
      sizes: doc([{ width: 90, height: 42, unit: "in", limit: "max" }]),
      deliverables: doc({
        print: { required: true },
        digital: { required: true, fileTypes: ["PDF", "PPT"], aspect: "16:9", maxMB: null, minDpi: null, maxPages: 8, recording: { required: false, minutes: 5 } },
      }),
      fontSizes: doc({ ...noFonts(), headings: range(72), body: range(18) }),
      drugNames: doc("generic"),
      qr: doc({ allowed: "yes", links: "educational", max: null, disclaimerRequired: false, disclaimer: "" }),
      requiredItems: doc([{ id: "email", label: "Name and email address", placement: "Anywhere", issuedBy: "you" }]),
      embargo: doc({ atSessionStart: true, encoreAllowed: null, notes: "Photography is not permitted in the Poster Hall." }),
    }
  ),
];

/** The two shown before anyone types; the rest are found by search. */
export const SUGGESTED_CONGRESS_IDS = ["esmo-2026", "eadv-2026"];
/** How many more the full catalogue holds — the "+80" tile. */
export const MORE_CONGRESSES = 80;

interface CongressStore {
  congresses: Congress[];
  /** Add a congress, or replace one with edited rules. */
  saveCongress: (congress: Congress) => void;
}

export const useCongressStore = create<CongressStore>((set) => ({
  congresses: SEEDED,
  saveCongress: (next) =>
    set((state) => ({
      congresses: state.congresses.some((c) => c.id === next.id)
        ? state.congresses.map((c) => (c.id === next.id ? next : c))
        : [next, ...state.congresses],
    })),
}));

/* ───────────────────────────────── Queries ───────────────────────────────── */

/** By acronym, name, year, city or therapy area: "lung" finds WCLC. */
/** How long verification takes, in words people plan around. */
export const VERIFICATION_TIME = "6–7 hours";

export function isUsable(congress: Congress) {
  return congress.status === "verified";
}

/** "Sent just now · ready in about 6–7 hours". */
export function verificationEta(submittedAt?: number) {
  if (!submittedAt) return `Being verified by SwishX · usually ${VERIFICATION_TIME}`;
  const hours = Math.max(0, Math.floor((Date.now() - submittedAt) / 3_600_000));
  const left = 7 - hours;
  const sent = hours === 0 ? "Sent just now" : `Sent ${hours} h ago`;
  return `${sent} · ${left <= 1 ? "ready within the hour" : `ready in about ${left - 1}–${left} hours`}`;
}

const shortSize = (s: PosterSize) => `${s.width} × ${s.height} ${s.unit}`;

/**
 * What an option means, said where it is chosen: the size or file in
 * brackets after its name, and one line on how the congress shows it.
 */
export function typeDetail(congress: Congress, type: PresentationType) {
  const sizes = congress.rules.sizes.value ?? [];
  const digital = congress.rules.deliverables.value?.digital ?? null;
  const printSizes = sizes.map(shortSize).join(" or ");
  if (type.digitalOnly) {
    const file = digital?.fileTypes[0] ?? "PDF";
    const shape = sizes[0] && orientationOf(sizes[0]) === "Portrait" ? `${shortSize(sizes[0])} portrait` : digital?.aspect && digital.aspect !== "same as print" ? digital.aspect : "";
    return {
      bracket: [shape, file].filter(Boolean).join(" "),
      line: "Shown on screens and online. Nothing is printed.",
    };
  }
  const bracket = printSizes || "size not stated";
  if (type.id === "tip") return { bracket, line: "For a trial still running. Printed like a poster, with no results." };
  if (type.id === "encore") return { bracket, line: "A poster already presented elsewhere, shown again." };
  return {
    bracket,
    line: `Printed at that size and hung on a board; you present it in person.${digital?.required ? " A PDF copy goes online too." : ""}`,
  };
}

export function searchCongresses(list: Congress[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return list.filter((c) =>
    [c.acronym, c.name, c.year, c.city ?? "", ...c.therapyAreas].join(" ").toLowerCase().includes(q)
  );
}

export function findDuplicate(list: Congress[], name: string) {
  const n = name.trim().toLowerCase().replace(/\s+/g, " ");
  if (n.length < 3) return undefined;
  return list.find((c) => {
    const label = `${c.name} ${c.year}`.toLowerCase();
    const short = `${c.acronym} ${c.year}`.toLowerCase();
    return label === n || short === n || c.name.toLowerCase() === n;
  });
}

/** Rules standing in for something the guidelines did not say. */
export function rulesToCheck(rules: CongressRules) {
  return (Object.keys(rules) as RuleKey[]).filter((k) => rules[k].source.kind === "default");
}

/** The deliverables a presentation type actually needs. */
export function deliverablesFor(congress: Congress, typeId: PresentationType["id"] | null) {
  const d = congress.rules.deliverables.value;
  if (!d) return null;
  const type = congress.presentationTypes.find((t) => t.id === typeId);
  return type?.digitalOnly ? { print: null, digital: d.digital } : d;
}

/** Whether a size choice is needed: printed posters with more than one allowed size. */
export function sizeChoices(congress: Congress, typeId: PresentationType["id"] | null) {
  const sizes = congress.rules.sizes.value ?? [];
  const delivery = deliverablesFor(congress, typeId);
  if (!delivery?.print) return [];
  return sizes;
}

/** The three rules that matter most, as short chips. */
export function keyRules(congress: Congress): string[] {
  const r = congress.rules;
  const chips: string[] = [];
  if (r.drugNames.value === "generic") chips.push("Generic names only");
  if (r.drugNames.value === "generic-brand-brackets") chips.push("Brand only in brackets");
  if (r.companyName.value === "not-allowed") chips.push("No company name");
  if (r.companyName.value === "required") chips.push("Sponsor must be named");
  if (r.logos.value === "none" || r.logos.value === "nonprofit") chips.push("No company logos");
  if (r.brandLook.value === "not-allowed") chips.push("No brand look");
  if (r.qr.value?.allowed === "no") chips.push("No QR codes");
  if (r.qr.value?.disclaimerRequired) chips.push("QR disclaimer");
  if (r.disclosure.value && r.disclosure.value.who !== "linked") chips.push("COI on poster");
  const code = r.requiredItems.value?.find((i) => i.issuedBy === "congress");
  if (code) chips.push(code.label.replace(/\s*\(.*\)$/, ""));
  return chips.slice(0, 3);
}

/** The editor's page for a chosen size or digital format. */
/** The note for a congress's recorded talk-over, if it takes one. */
export function recordingNote(congress: Congress) {
  const r = congress.rules.deliverables.value?.digital?.recording;
  if (!r) return null;
  return `${congress.acronym} also ${r.required ? "requires a" : "accepts an optional"} ${r.minutes}-minute recorded commentary. You record it yourself; it isn't made in SwishX.`;
}

export function pageShapeFor(congress: Congress, typeId: PresentationType["id"] | null, sizeIndex: number | null): "A4" | "16:9" {
  const delivery = deliverablesFor(congress, typeId);
  const sizes = congress.rules.sizes.value ?? [];
  const size = delivery?.print ? sizes[sizeIndex ?? 0] : sizes[0];
  if (size) return orientationOf(size) === "Portrait" ? "A4" : "16:9";
  return "16:9";
}

/* ───────────────────────────────── Reading guidelines ───────────────────────────────── */

/**
 * Turn what was given into structured rules: a guidelines file, and/or what
 * the person typed. The prototype has no PDF reader, so a file stands for a
 * set of rules read from it, while typed text is matched for the things
 * people know offhand — size, orientation, type sizes, fonts, branding, QR.
 * Anything not found keeps the convention, marked to check.
 */
export function readCongressGuidelines(input: { name: string; fileName?: string; notes: string }): Congress {
  const rules = conventionalRules();
  const notes = input.notes.trim();
  const lower = notes.toLowerCase();
  const you = <T,>(value: T): Field<T> => ({ value, source: { kind: "you" } });

  if (input.fileName) {
    /* Simulated: the parts a guidelines document reliably states. */
    rules.sizes = { ...rules.sizes, source: { kind: "doc", page: 2 } };
    rules.deliverables = { ...rules.deliverables, source: { kind: "doc", page: 2 } };
    rules.drugNames = { ...rules.drugNames, source: { kind: "doc", page: 3 } };
    rules.qr = { ...rules.qr, source: { kind: "doc", page: 4 } };
  }

  /* Size and orientation. */
  const portrait = /portrait|vertical/.test(lower);
  const landscape = /landscape|horizontal/.test(lower);
  const a = lower.match(/\ba([01])\b/);
  const dims = notes.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*(mm|cm|in|inch|inches|")?/i);
  let size: PosterSize | null = null;
  if (dims) {
    const unit = (dims[3] ?? "in").toLowerCase();
    size = {
      width: Number(dims[1]),
      height: Number(dims[2]),
      unit: unit.startsWith("in") || unit === '"' ? "in" : (unit as Unit),
      limit: /up to|max|no larger/.test(lower) ? "max" : "exact",
    };
  } else if (a) {
    size = a[1] === "0" ? { width: 841, height: 1189, unit: "mm", limit: "exact" } : { width: 594, height: 841, unit: "mm", limit: "exact" };
  } else if (portrait || landscape) {
    size = { width: 841, height: 1189, unit: "mm", limit: "exact" };
  }
  if (size) {
    if ((portrait && size.width > size.height) || (landscape && size.width < size.height)) {
      size = { ...size, width: size.height, height: size.width };
    }
    rules.sizes = you([size]);
  }

  /* ePoster. */
  if (/e-?poster|16:9|screen/.test(lower)) {
    const onlyDigital = /e-?poster only|no print/.test(lower);
    rules.deliverables = you({
      print: onlyDigital ? null : { required: true },
      digital: { required: true, fileTypes: ["PDF"], aspect: "16:9", maxMB: null, minDpi: null, maxPages: 1, recording: null },
    });
  }

  /* Font sizes: "title 72 pt", "body 24 pt", or a bare "24 pt" for body. */
  const pt = (word: string) => notes.match(new RegExp(`${word}[^0-9]{0,15}(\\d{1,3})\\s*pt`, "i"))?.[1];
  const title = pt("title");
  const heading = pt("head");
  const body = pt("body") ?? pt("text") ?? (!title && !heading ? notes.match(/(\d{1,3})\s*pt/i)?.[1] : undefined);
  if (title || heading || body) {
    const base = rules.fontSizes.value!;
    rules.fontSizes = you({
      ...base,
      title: title ? range(Number(title)) : base.title,
      headings: heading ? range(Number(heading)) : base.headings,
      body: body ? range(Number(body)) : base.body,
    });
  }

  /* Font families named in the text. */
  const families = FONT_FAMILY_OPTIONS.filter((f) => !f.startsWith("Any") && lower.includes(f.toLowerCase()));
  if (families.length) rules.fontFamilies = you({ families, standardOnly: false });

  /* Branding. */
  if (/generic/.test(lower) || /no (product|brand|trade)/.test(lower)) rules.drugNames = you("generic");
  if (/no (company|commercial|sponsor) (name|names)/.test(lower)) rules.companyName = you("not-allowed");
  if (/sponsor(ed)? by|acknowledge the sponsor|name the sponsor/.test(lower)) rules.companyName = you("required");
  if (/no (company |commercial |pharma |industry )?logos?/.test(lower)) rules.logos = you("nonprofit");

  /* QR codes. */
  if (/no qr/.test(lower)) rules.qr = you({ ...rules.qr.value!, allowed: "no", disclaimerRequired: false });

  const yearMatch = input.name.match(/\b(20\d{2})\b/);
  const name = input.name.replace(/\s*·?\s*\b20\d{2}\b\s*/, " ").trim() || input.name.trim();
  const acronym = name.split(/\s+/)[0] ?? name;
  return {
    id: `custom-${Date.now()}`,
    acronym,
    name,
    year: yearMatch?.[1] ?? "",
    therapyAreas: [],
    status: "pending",
    origin: "team",
    submittedAt: Date.now(),
    presentationTypes: rules.deliverables.value?.print === null ? [EPOSTER_ONLY] : [POSTER],
    rules,
  };
}
