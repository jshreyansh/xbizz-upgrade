"use client";

import { create } from "zustand";
import { useMemo } from "react";
import { SEED_WORKSPACE_ID, useSettingsStore } from "@/features/settings/settings-store";
import {
  SENIORITY,
  type ApprovalStage,
  type Member,
} from "@/features/settings/settings-types";

/**
 * The review funnel: what happens between "Submit for review" and published.
 *
 * Compliance & MLR settings define a chain per creator. Submitting takes a
 * snapshot of that chain onto the item, so editing the chain later changes
 * the next submission, never one already in flight. The item then waits on
 * one stage at a time: whoever that stage names approves it on, or requests
 * changes, which sends it back to the creator. When they resubmit, the
 * changed version goes through the whole chain again from step 1, so every
 * approval is of the version that ships. The last approval publishes it.
 *
 * SwishX's automated MLR check runs before submission; its result travels
 * with the item so reviewers see what it found.
 *
 * Mock-only, like the settings store: in memory, no server.
 */

export type ReviewStatus = "in_review" | "changes" | "approved";

export interface ReviewEvent {
  id: string;
  kind: "submitted" | "approved" | "changes" | "resubmitted" | "comment";
  /** Member id. */
  by: string;
  /** "2 days ago", "Just now". */
  at: string;
  /** The stage it happened at, when it was a decision. */
  stageIndex?: number;
  note?: string;
}

export interface ReviewItem {
  id: string;
  /** "video:Velmora Patient Explainer": how a studio finds its own item. */
  key: string;
  /** The workspace it was submitted in; the samples belong to the first one. */
  workspaceId?: string;
  title: string;
  kind: "video" | "document";
  brand: string;
  spec: string;
  /** "Version 2". */
  version: string;
  ownerId: string;
  preview: { gradient: string; videoSrc?: string; badge?: string; metric?: string; metricLabel?: string };
  /** The creator's chain at the moment of submission. */
  stages: ApprovalStage[];
  stageIndex: number;
  status: ReviewStatus;
  /** The step that last asked for changes, shown on the chain until it's resubmitted. */
  rejectedAt?: number;
  /** What SwishX's automated check found before submission. */
  check: { flags: number; summary: string };
  events: ReviewEvent[];
  /** The Content Library card this item belongs to, for the samples. */
  libraryId?: string;
}

let seq = 100;
const uid = () => `rv${++seq}`;

/* ── Who can act ─────────────────────────────────────────────────────────── */

/** The people a stage names: one person, a role from a seniority up, or anyone in the role. */
export function stageReviewers(stage: ApprovalStage, members: Member[]): Member[] {
  const active = members.filter((m) => m.status === "active" && m.permissions.includes("approve"));
  switch (stage.narrowTo.kind) {
    case "person": {
      const id = stage.narrowTo.memberId;
      return active.filter((m) => m.id === id);
    }
    case "seniority": {
      const floor = SENIORITY.indexOf(stage.narrowTo.floor);
      return active.filter((m) => m.role === stage.role && SENIORITY.indexOf(m.seniority) >= floor);
    }
    default:
      return active.filter((m) => m.role === stage.role);
  }
}

/** Whether this person can decide the stage the item is waiting on. */
export function canDecide(item: ReviewItem, memberId: string, members: Member[]): boolean {
  if (item.status !== "in_review") return false;
  const stage = item.stages[item.stageIndex];
  return !!stage && stageReviewers(stage, members).some((m) => m.id === memberId);
}

/** "Step 2 of 3 · Legal review". */
export function stepLabel(item: ReviewItem): string {
  if (item.status === "approved") return "Approved";
  const stage = item.stages[item.stageIndex];
  return `Step ${item.stageIndex + 1} of ${item.stages.length} · ${stage?.name ?? "Review"}`;
}

/* ── Samples ─────────────────────────────────────────────────────────────── */

const MAYA_CHAIN: ApprovalStage[] = [
  { id: "s1", name: "Medical review", role: "Medical reviewer", narrowTo: { kind: "person", memberId: "m3" } },
  { id: "s2", name: "Legal review", role: "Legal reviewer", narrowTo: { kind: "anyone" } },
  { id: "s3", name: "Regulatory sign-off", role: "Regulatory reviewer", narrowTo: { kind: "seniority", floor: "Director" } },
];
const ROHAN_CHAIN: ApprovalStage[] = [
  { id: "s4", name: "Medical review", role: "Medical reviewer", narrowTo: { kind: "anyone" } },
  { id: "s5", name: "Legal review", role: "Legal reviewer", narrowTo: { kind: "anyone" } },
];

/* A brand lead's sign-off, so Siva (Admin) has items waiting on them in the demo. */
const BRAND_SIGNOFF: ApprovalStage = {
  id: "s6", name: "Brand lead sign-off", role: "Workspace admin", narrowTo: { kind: "person", memberId: "m0" },
};

const SAMPLES: ReviewItem[] = [
  {
    id: "rv1",
    key: "video:Velmora Patient Explainer",
    title: "Velmora Patient Explainer",
    kind: "video",
    brand: "Velmora",
    spec: "16:9 · 45 sec",
    version: "Version 1",
    ownerId: "m1",
    preview: { gradient: "linear-gradient(150deg,#3b1d5e,#5b21b6 55%,#7c3aed)", videoSrc: "/27019-361107952_medium.mp4" },
    stages: MAYA_CHAIN,
    stageIndex: 1,
    status: "in_review",
    check: { flags: 0, summary: "Every claim resolves to an approved source; fair balance present." },
    libraryId: "velmora-patient-explainer",
    events: [
      { id: "e1", kind: "submitted", by: "m1", at: "2 days ago" },
      { id: "e2", kind: "approved", by: "m3", at: "Yesterday", stageIndex: 0, note: "Efficacy claims match label §14. Good to go." },
    ],
  },
  {
    id: "rv2",
    key: "document:Nirvexa Field Detail Aid",
    title: "Nirvexa Field Detail Aid",
    kind: "document",
    brand: "Nirvexa",
    spec: "16:9 · 3 pages",
    version: "Version 1",
    ownerId: "m2",
    preview: { gradient: "linear-gradient(150deg,#12303a,#155e75 55%,#0891b2)", badge: "Interactive Detail Aid", metric: "N=613 Patients", metricLabel: "Multi-centre randomised trial" },
    stages: ROHAN_CHAIN,
    stageIndex: 0,
    status: "in_review",
    check: { flags: 1, summary: "One flag: the safety page font is smaller than the efficacy page." },
    libraryId: "nirvexa-field-aid",
    events: [{ id: "e3", kind: "submitted", by: "m2", at: "5 hours ago" }],
  },
  {
    id: "rv3",
    key: "document:Cardioxa Patient Explainer Sheet",
    title: "Cardioxa Patient Explainer Sheet",
    kind: "document",
    brand: "Cardioxa",
    spec: "A4 · 2 pages",
    version: "Version 1",
    ownerId: "m1",
    preview: { gradient: "linear-gradient(150deg,#3f1d0e,#9a3412 55%,#ea580c)", badge: "Patient Education", metric: "1 in 3 adults", metricLabel: "live with high blood pressure" },
    stages: MAYA_CHAIN,
    stageIndex: 1,
    status: "changes",
    rejectedAt: 1,
    check: { flags: 0, summary: "Every claim resolves to an approved source." },
    events: [
      { id: "e4", kind: "submitted", by: "m1", at: "3 days ago" },
      { id: "e5", kind: "approved", by: "m3", at: "2 days ago", stageIndex: 0 },
      { id: "e6", kind: "changes", by: "m4", at: "Yesterday", stageIndex: 1, note: "\"Works fast\" on page 1 is a superiority-style claim with no reference. Reword or cite." },
    ],
  },
  {
    id: "rv4",
    key: "video:Onkavia KOL Digital Twin Briefing",
    title: "Onkavia KOL Digital Twin Briefing",
    kind: "video",
    brand: "Onkavia",
    spec: "9:16 · 40 sec",
    version: "Version 1",
    ownerId: "m2",
    preview: { gradient: "linear-gradient(150deg,#0c2740,#0e4f6e 55%,#1d7fa8)", videoSrc: "/avatar-showcase.mp4" },
    stages: ROHAN_CHAIN,
    stageIndex: 1,
    status: "approved",
    check: { flags: 0, summary: "No flags." },
    libraryId: "onkavia-kol-briefing",
    events: [
      { id: "e7", kind: "submitted", by: "m2", at: "Last week" },
      { id: "e8", kind: "approved", by: "m3", at: "Last week", stageIndex: 0 },
      { id: "e9", kind: "approved", by: "m4", at: "4 days ago", stageIndex: 1, note: "Approved. Published." },
    ],
  },
  {
    id: "rv5",
    key: "document:Velmora Dosing Card",
    title: "Velmora Dosing Card",
    kind: "document",
    brand: "Velmora",
    spec: "A5 · 1 page",
    version: "Version 2",
    ownerId: "m1",
    preview: { gradient: "linear-gradient(150deg,#0f2d22,#14532d 55%,#1f7a4d)", badge: "Dosing & Administration", metric: "200 mg once daily", metricLabel: "No titration required" },
    stages: [MAYA_CHAIN[0], BRAND_SIGNOFF],
    stageIndex: 1,
    status: "in_review",
    check: { flags: 0, summary: "Dosing matches the label; ISI present." },
    events: [
      { id: "e10", kind: "submitted", by: "m1", at: "Yesterday" },
      { id: "e11", kind: "approved", by: "m3", at: "3 hours ago", stageIndex: 0, note: "Dose and renal adjustment match §2." },
    ],
  },
  {
    id: "rv6",
    key: "video:Onkavia Congress Teaser",
    title: "Onkavia Congress Teaser",
    kind: "video",
    brand: "Onkavia",
    spec: "16:9 · 30 sec",
    version: "Version 1",
    ownerId: "m2",
    preview: { gradient: "linear-gradient(150deg,#0c2740,#0e4f6e 55%,#1d7fa8)", videoSrc: "/21617-319452308_medium.mp4" },
    stages: [BRAND_SIGNOFF, ROHAN_CHAIN[0]],
    stageIndex: 0,
    status: "in_review",
    check: { flags: 0, summary: "No claims beyond the approved booth messaging." },
    events: [{ id: "e12", kind: "submitted", by: "m2", at: "2 hours ago" }],
  },
  {
    id: "rv7",
    key: "video:Nirvexa Rep Training Clip",
    title: "Nirvexa Rep Training Clip",
    kind: "video",
    brand: "Nirvexa",
    spec: "16:9 · 60 sec",
    version: "Version 1",
    ownerId: "m1",
    preview: { gradient: "linear-gradient(150deg,#12303a,#155e75 55%,#0891b2)", videoSrc: "/46621-448480587_medium.mp4" },
    stages: MAYA_CHAIN,
    stageIndex: 0,
    status: "in_review",
    check: { flags: 2, summary: "Two flags: an efficacy figure without its timepoint, and an unreferenced quality-of-life claim." },
    events: [{ id: "e13", kind: "submitted", by: "m1", at: "40 minutes ago" }],
  },
  {
    id: "rv8",
    key: "document:Cardioxa Leave-Behind",
    title: "Cardioxa Leave-Behind",
    kind: "document",
    brand: "Cardioxa",
    spec: "A4 print · 2 pages",
    version: "Version 3",
    ownerId: "m2",
    preview: { gradient: "linear-gradient(150deg,#3f1d0e,#9a3412 55%,#ea580c)", badge: "HCP Leave-Behind", metric: "−12 mmHg", metricLabel: "systolic reduction at week 12" },
    stages: ROHAN_CHAIN,
    stageIndex: 1,
    status: "in_review",
    check: { flags: 0, summary: "Every claim resolves to an approved source." },
    events: [
      { id: "e14", kind: "submitted", by: "m2", at: "2 days ago" },
      { id: "e15", kind: "approved", by: "m3", at: "Yesterday", stageIndex: 0 },
    ],
  },
  {
    id: "rv9",
    key: "document:Velmora Efficacy Infographic",
    title: "Velmora Efficacy Infographic",
    kind: "document",
    brand: "Velmora",
    spec: "3:4 tablet · 1 page",
    version: "Version 1",
    ownerId: "m1",
    preview: { gradient: "linear-gradient(150deg,#111827,#1f2937 55%,#334155)", badge: "Clinical Readout", metric: "52% PASI 90", metricLabel: "vs 18% placebo at week 16" },
    stages: MAYA_CHAIN,
    stageIndex: 2,
    status: "in_review",
    check: { flags: 0, summary: "Every claim resolves to an approved source; fair balance present." },
    events: [
      { id: "e16", kind: "submitted", by: "m1", at: "4 days ago" },
      { id: "e17", kind: "approved", by: "m3", at: "3 days ago", stageIndex: 0 },
      { id: "e18", kind: "approved", by: "m4", at: "Yesterday", stageIndex: 1, note: "Fine from Legal." },
    ],
  },
  {
    id: "rv10",
    key: "video:Onkavia MoA Animation",
    title: "Onkavia MoA Animation",
    kind: "video",
    brand: "Onkavia",
    spec: "16:9 · 45 sec",
    version: "Version 2",
    ownerId: "m2",
    preview: { gradient: "linear-gradient(150deg,#3b1d5e,#5b21b6 55%,#7c3aed)", videoSrc: "/reel-moa.mp4" },
    stages: ROHAN_CHAIN,
    stageIndex: 0,
    status: "in_review",
    check: { flags: 0, summary: "Mechanism wording matches the label." },
    events: [
      { id: "e19", kind: "submitted", by: "m2", at: "Last week" },
      { id: "e20", kind: "changes", by: "m3", at: "5 days ago", stageIndex: 0, note: "Show the receptor binding step before the cascade." },
      { id: "e21", kind: "resubmitted", by: "m2", at: "1 hour ago" },
    ],
  },
];

/* ── Store ───────────────────────────────────────────────────────────────── */

interface ReviewState {
  items: ReviewItem[];
  /** Submit, or resubmit after changes: a resubmission starts the whole chain again. */
  submit: (input: Omit<ReviewItem, "id" | "stageIndex" | "status" | "events" | "rejectedAt" | "workspaceId">) => ReviewItem;
  approve: (id: string, by: string, note?: string) => void;
  requestChanges: (id: string, by: string, note: string) => void;
  comment: (id: string, by: string, note: string) => void;
  /** The project was renamed: its item follows the new title. */
  rename: (oldKey: string, newKey: string, title: string) => void;
  /** Back to the sample queue, to play the decisions again. */
  reset: () => void;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  items: SAMPLES,
  reset: () => set({ items: SAMPLES }),

  submit: (input) => {
    const workspaceId = useSettingsStore.getState().workspaceId;
    const existing = get().items.find((i) => i.key === input.key && inWorkspace(i, workspaceId) && i.status === "changes");
    if (existing) {
      const next: ReviewItem = {
        ...existing,
        ...input,
        stages: existing.stages,
        stageIndex: 0,
        status: input.stages.length ? "in_review" : "approved",
        rejectedAt: undefined,
        events: [...existing.events, { id: uid(), kind: "resubmitted", by: input.ownerId, at: "Just now" }],
      };
      set((s) => ({ items: s.items.map((i) => (i.id === existing.id ? next : i)) }));
      return next;
    }
    const item: ReviewItem = {
      ...input,
      workspaceId,
      id: uid(),
      stageIndex: 0,
      /* No chain means nothing to wait on: published straight away. */
      status: input.stages.length ? "in_review" : "approved",
      events: [{ id: uid(), kind: "submitted", by: input.ownerId, at: "Just now" }],
    };
    set((s) => ({ items: [item, ...s.items.filter((i) => i.key !== input.key || !inWorkspace(i, workspaceId))] }));
    return item;
  },

  approve: (id, by, note) =>
    set((s) => ({
      items: s.items.map((i) => {
        if (i.id !== id || i.status !== "in_review") return i;
        const last = i.stageIndex >= i.stages.length - 1;
        return {
          ...i,
          stageIndex: last ? i.stageIndex : i.stageIndex + 1,
          status: last ? "approved" : "in_review",
          events: [...i.events, { id: uid(), kind: "approved", by, at: "Just now", stageIndex: i.stageIndex, note: note?.trim() || undefined }],
        };
      }),
    })),

  requestChanges: (id, by, note) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.id !== id || i.status !== "in_review"
          ? i
          : {
              ...i,
              status: "changes",
              rejectedAt: i.stageIndex,
              events: [...i.events, { id: uid(), kind: "changes", by, at: "Just now", stageIndex: i.stageIndex, note }],
            }
      ),
    })),

  rename: (oldKey, newKey, title) =>
    set((s) => ({ items: s.items.map((i) => (i.key === oldKey ? { ...i, key: newKey, title } : i)) })),

  comment: (id, by, note) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.id === id ? { ...i, events: [...i.events, { id: uid(), kind: "comment", by, at: "Just now", note }] } : i
      ),
    })),
}));

export function inWorkspace(item: ReviewItem, workspaceId: string) {
  return (item.workspaceId ?? SEED_WORKSPACE_ID) === workspaceId;
}

/** The items of the workspace you are in. Reviews never cross workspaces. */
export function useWorkspaceReviewItems() {
  const items = useReviewStore((s) => s.items);
  const workspaceId = useSettingsStore((s) => s.workspaceId);
  return useMemo(() => items.filter((i) => inWorkspace(i, workspaceId)), [items, workspaceId]);
}
