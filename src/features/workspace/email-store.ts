"use client";

import { create } from "zustand";
import { CTA_DEFAULT, isPersonalSender, purposesFor, sendersFor, type CtaTarget, type EmailAudience, type EmailMedia, type EmailPurpose, type EmailSender } from "@/features/workspace/email-options";

interface EmailState {
  audience: EmailAudience;
  sender: EmailSender;
  purpose: EmailPurpose;
  /** The approved piece the email is built from, if any. Its claims lead and it is attached. */
  startPiece: string | null;
  /** One of the brand's approved email shells, or null when SwishX designs it. */
  template: string | null;
  /** Indexes into the purpose's subject lines. One unless senders pick from options. */
  subjects: number[];
  subjectMode: "one" | "choice";
  /** Blocks left out of the set. Everything else is in it. */
  offBlocks: string[];
  /** How many blocks a sender may pick for one email. */
  maxBlocks: number;
  repEdit: { note: boolean; blocks: boolean; piece: boolean };
  /** Approved pieces the sender can attach. */
  attached: string[];
  media: EmailMedia[];
  cta: Record<EmailPurpose, CtaTarget>;
  customLink: string;
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

const editsFor = (sender: EmailSender) => ({ note: isPersonalSender(sender), blocks: isPersonalSender(sender), piece: isPersonalSender(sender) });

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
  startPiece: null,
  template: null,
  subjects: [0],
  subjectMode: "one",
  offBlocks: [],
  maxBlocks: 3,
  repEdit: editsFor("rep"),
  attached: [],
  media: [],
  cta: { ...CTA_DEFAULT },
  customLink: "",
  setAbout: (patch) =>
    set((state) => {
      const next = { ...state, ...patch };
      const fitted = fit(next.audience, next.sender, next.purpose);
      /* A new sender starts with that sender's usual freedoms. */
      const repEdit = fitted.sender !== state.sender ? editsFor(fitted.sender) : state.repEdit;
      /* A new audience has its own pieces and blocks. */
      const reset = fitted.audience !== state.audience ? { attached: [], offBlocks: [], startPiece: null, template: null } : {};
      return { ...next, ...fitted, ...reset, repEdit, subjects: [0] };
    }),
  set: (patch) => set(patch),
  start: (about) => {
    const fitted = fit(about.audience, about.sender, about.purpose);
    set({
      ...about,
      ...fitted,
      subjects: [0],
      subjectMode: "one",
      offBlocks: [],
      maxBlocks: 3,
      repEdit: editsFor(fitted.sender),
      template: null,
      cta: { ...CTA_DEFAULT },
      customLink: "",
    });
  },
}));
