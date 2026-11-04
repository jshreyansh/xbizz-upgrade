"use client";

import { create } from "zustand";
import type { UploadedDoc } from "@/features/workspace/research-sources-section";
import {
  DEFAULT_EMAIL_STYLES,
  defaultChannelFor,
  defaultChannelsFor,
  isPersonalSender,
  purposesFor,
  sendersFor,
  type EmailAudience,
  type EmailBacklinkItem,
  type EmailBlock,
  type EmailBlockRule,
  type EmailChannel,
  type EmailCtaItem,
  type EmailMedia,
  type EmailPurpose,
  type EmailRepEdit,
  type EmailSender,
  type EmailTypographyStyles,
} from "@/features/workspace/email-options";

export interface EmailPackshot {
  id: string;
  name: string;
  url: string;
  note?: string;
  variation?: string;
}

export interface EmailReference {
  id: string;
  name: string;
  note?: string;
  previewUrl?: string;
  kind: "image" | "video";
}

interface EmailState {
  audience: EmailAudience;
  sender: EmailSender;
  purpose: EmailPurpose;
  /** The approved piece the email is built from, if any. Its claims lead and it is attached. */
  startPiece: string | null;
  /** One of the brand's approved email shells, or null when SwishX designs it. */
  template: string | null;
  /** Product and device shots, placed in the email by SwishX. */
  packshots: EmailPackshot[];
  /** The look the user is after, or their own assets to use, each with a note. Grounds no claims. */
  references: EmailReference[];
  /** Files the user added as sources, each with what it is for. */
  files: UploadedDoc[];
  /** The destination platform where this email is deployed (Veeva, HubSpot, SFMC, etc.) */
  channel: EmailChannel;
  /** Multi-select destination platforms where this email is deployed */
  channels: EmailChannel[];
  /** Active typography and layout styles controllable via editor toolbar */
  styles: EmailTypographyStyles;
  /** Subject lines the marketer wrote, after SwishX's own. */
  extraSubjects: string[];
  /** Content blocks drafted by user via SwishX chat assistant. */
  extraBlocks: EmailBlock[];
  /** Planned images the marketer left out. */
  offImages: string[];
  /** Indexes into the purpose's subject lines. One unless senders pick from options. */
  subjects: number[];
  subjectMode: "one" | "choice";
  /** Blocks left out of the set. Everything else is in it. */
  offBlocks: string[];
  repEdit: EmailRepEdit;
  /** Rules for each block: mandatory vs optional, editable rep note. Defaults to mandatory: true. */
  blockRules: Record<string, EmailBlockRule>;
  /** Approved pieces the sender can attach. */
  attached: string[];
  media: EmailMedia[];
  /** What the button says; empty means the purpose's own wording. */
  ctaText: string;
  /** The page the button opens, as the marketer gives it. */
  ctaUrl: string;
  /** Multiple CTAs with primary / secondary priorities and optional block attachments */
  ctas: EmailCtaItem[];
  /** Custom resource backlinks with context and destination URLs */
  backlinks: EmailBacklinkItem[];
  setAbout: (patch: Partial<Pick<EmailState, "audience" | "sender" | "purpose">>) => void;
  set: (patch: Partial<Omit<EmailState, "set" | "setAbout" | "start">>) => void;
  /** A fresh email, from the start step's answers. */
  start: (about: { audience: EmailAudience; sender: EmailSender; purpose: EmailPurpose; startPiece: string | null; attached: string[]; media: EmailMedia[] }) => void;
}

/** Who can send to this audience, and what they can send, kept consistent with each other. */
function fit(audience: EmailAudience, sender: EmailSender, purpose: EmailPurpose) {
  const s = sendersFor(audience).includes(sender) ? sender : sendersFor(audience)[0];
  const p = purposesFor(s, audience).includes(purpose) ? purpose : purposesFor(s, audience)[0];
  return { audience, sender: s, purpose: p };
}

const editsFor = (sender: EmailSender): EmailRepEdit => ({
  note: isPersonalSender(sender),
  blocks: isPersonalSender(sender),
  piece: isPersonalSender(sender),
  reorder: false,
  noteCharLimit: 255,
});

/**
 * The email being made, as a store rather than screen state — the plan and the
 * editor are two screens working on one email, and what the plan settles has
 * to be what the editor opens on.
 *
 * Not persisted, like the rest of the workspace's mocks.
 */
export const useEmailStore = create<EmailState>((set) => ({
  audience: "HCP",
  sender: "rep",
  purpose: "followup",
  channel: defaultChannelFor("HCP", "rep"),
  channels: defaultChannelsFor("HCP", "rep"),
  styles: DEFAULT_EMAIL_STYLES,
  startPiece: null,
  template: null,
  packshots: [],
  references: [],
  files: [],
  extraSubjects: [],
  extraBlocks: [],
  offImages: [],
  subjects: [0],
  subjectMode: "one",
  offBlocks: [],
  repEdit: editsFor("rep"),
  blockRules: {},
  attached: [],
  media: [],
  ctaText: "",
  ctaUrl: "",
  ctas: [
    {
      id: "cta-primary",
      label: "",
      url: "",
      priority: "primary",
      blockId: null,
    },
    {
      id: "cta-secondary",
      label: "Full Prescribing Information",
      url: "https://www.onkavia-hcp.com/pi",
      priority: "secondary",
      blockId: null,
    },
  ],
  backlinks: [
    {
      id: "bl-1",
      title: "AFFIRM-3 Study Publication",
      context: "Primary Phase III trial methodology and primary endpoint data in NEJM",
      url: "https://www.nejm.org/doi/full/10.1056/NEJMoa260194",
      blockId: null,
    },
  ],
  setAbout: (patch) =>
    set((state) => {
      const next = { ...state, ...patch };
      const fitted = fit(next.audience, next.sender, next.purpose);
      /* A new sender starts with that sender's usual freedoms. */
      const repEdit = fitted.sender !== state.sender ? editsFor(fitted.sender) : state.repEdit;
      const channel = patch.audience || patch.sender ? defaultChannelFor(fitted.audience, fitted.sender) : state.channel;
      const channels = patch.audience || patch.sender ? defaultChannelsFor(fitted.audience, fitted.sender) : (state.channels || [channel]);
      /* A new audience has its own pieces and blocks. */
      const reset = fitted.audience !== state.audience ? { attached: [], offBlocks: [], startPiece: null, template: null } : {};
      return { ...next, ...fitted, ...reset, repEdit, channel, channels, subjects: [0] };
    }),
  set: (patch) =>
    set((state) => {
      let nextCtas = patch.ctas ?? state.ctas;
      let nextCtaText = patch.ctaText ?? state.ctaText;
      let nextCtaUrl = patch.ctaUrl ?? state.ctaUrl;

      // If ctaText or ctaUrl is directly patched, sync primary CTA in ctas array
      if (patch.ctaText !== undefined || patch.ctaUrl !== undefined) {
        nextCtas = nextCtas.map((c) =>
          c.priority === "primary"
            ? { ...c, label: nextCtaText, url: nextCtaUrl }
            : c
        );
      } else if (patch.ctas !== undefined && patch.ctas.length > 0) {
        // If ctas is directly patched, sync primary CTA values to ctaText and ctaUrl
        const prim = patch.ctas.find((c) => c.priority === "primary") || patch.ctas[0];
        if (prim) {
          nextCtaText = prim.label;
          nextCtaUrl = prim.url;
        }
      }

      return {
        ...patch,
        ctas: nextCtas,
        ctaText: nextCtaText,
        ctaUrl: nextCtaUrl,
      };
    }),
  start: (about) => {
    const fitted = fit(about.audience, about.sender, about.purpose);
    set({
      ...about,
      ...fitted,
      subjects: [0],
      subjectMode: "one",
      offBlocks: [],
      repEdit: editsFor(fitted.sender),
      blockRules: {},
      channel: defaultChannelFor(about.audience, about.sender),
      channels: defaultChannelsFor(about.audience, about.sender),
      styles: DEFAULT_EMAIL_STYLES,
      template: null,
      packshots: [],
      references: [],
      files: [],
      extraSubjects: [],
      extraBlocks: [],
      offImages: [],
      ctaText: "",
      ctaUrl: "",
      ctas: [
        {
          id: "cta-primary",
          label: "",
          url: "",
          priority: "primary",
          blockId: null,
        },
        {
          id: "cta-secondary",
          label: "Full Prescribing Information",
          url: "https://www.onkavia-hcp.com/pi",
          priority: "secondary",
          blockId: null,
        },
      ],
      backlinks: [
        {
          id: "bl-1",
          title: "AFFIRM-3 Study Publication",
          context: "Primary Phase III trial methodology and primary endpoint data in NEJM",
          url: "https://www.nejm.org/doi/full/10.1056/NEJMoa260194",
          blockId: null,
        },
      ],
    });
  },
}));
