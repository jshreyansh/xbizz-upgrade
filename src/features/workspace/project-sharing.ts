"use client";

import { create } from "zustand";
import { useSettingsStore } from "@/features/settings/settings-store";
import { useReviewStore } from "@/features/review/review-store";
import { useWorkspaceStore } from "@/features/workspace/workspace-store";

/**
 * Who can see a draft before it is published.
 *
 * Private is the default and means the owner only: admins included, because
 * a draft is someone's unfinished work. Sharing with the workspace lets
 * everyone in it open the draft, each within their own permissions; sharing
 * with specific people lets only them in. Either way it is view and comment
 * for now. Editing together comes later. Published content is visible to the
 * whole workspace, so this only applies to drafts.
 *
 * Keyed like the review funnel: `video:<title>` / `document:<title>` for the
 * project open in the studio, `lib:<id>` for Content Library rows.
 */

export type Visibility =
  | { kind: "private" }
  | { kind: "workspace" }
  | { kind: "people"; ids: string[] };

export interface DraftSharing {
  ownerId: string;
  visibility: Visibility;
}

const SEED: Record<string, DraftSharing> = {
  "lib:velmora-patient-explainer": { ownerId: "m1", visibility: { kind: "workspace" } },
  "lib:nirvexa-field-aid": { ownerId: "m2", visibility: { kind: "people", ids: ["m1", "m3"] } },
  "lib:velmora-dosing-card": { ownerId: "m0", visibility: { kind: "private" } },
  "lib:onkavia-patient-leaflet": { ownerId: "m1", visibility: { kind: "private" } },
};

interface SharingState {
  projects: Record<string, DraftSharing>;
  setVisibility: (key: string, ownerId: string, visibility: Visibility) => void;
  rename: (oldKey: string, newKey: string) => void;
  /** The header title is being edited, from a click on it or the ⋮ menu. */
  renaming: boolean;
  setRenaming: (v: boolean) => void;
}

export const useSharingStore = create<SharingState>((set) => ({
  projects: SEED,
  setVisibility: (key, ownerId, visibility) =>
    set((s) => ({ projects: { ...s.projects, [key]: { ownerId: s.projects[key]?.ownerId ?? ownerId, visibility } } })),
  rename: (oldKey, newKey) =>
    set((s) => {
      const entry = s.projects[oldKey];
      if (!entry || oldKey === newKey) return s;
      const projects = { ...s.projects, [newKey]: entry };
      delete projects[oldKey];
      return { projects };
    }),
  renaming: false,
  setRenaming: (renaming) => set({ renaming }),
}));

/** Whether this person can open the draft. Admin doesn't override Private. */
export function canSeeDraft(entry: DraftSharing | undefined, memberId: string): boolean {
  if (!entry) return true;
  if (entry.ownerId === memberId) return true;
  if (entry.visibility.kind === "workspace") return true;
  return entry.visibility.kind === "people" && entry.visibility.ids.includes(memberId);
}

/** Shared with this person by someone else, by name or with the whole workspace. */
export function sharedWith(entry: DraftSharing | undefined, memberId: string): boolean {
  return !!entry && entry.ownerId !== memberId && entry.visibility.kind !== "private" && canSeeDraft(entry, memberId);
}

export function visibilityLabel(v: Visibility): string {
  if (v.kind === "private") return "Private";
  if (v.kind === "workspace") return "Workspace";
  return `${v.ids.length} ${v.ids.length === 1 ? "person" : "people"}`;
}

/**
 * The project open in the studio: its title, who owns it, who can see it, and
 * rename. A title nobody has typed is the generated one, so the first rename
 * or share pins it; after that the review item and sharing follow the name.
 */
export function useProjectSharing(kind: "video" | "document", fallback: string) {
  const stored = useWorkspaceStore((s) => s.projectName);
  const setProjectName = useWorkspaceStore((s) => s.setProjectName);
  const me = useSettingsStore((s) => s.currentUserId);
  const title = stored.trim() || fallback;
  const key = `${kind}:${title}`;
  const entry = useSharingStore((s) => s.projects[key]);
  const setVisibilityRaw = useSharingStore((s) => s.setVisibility);
  const sharing: DraftSharing = entry ?? { ownerId: me, visibility: { kind: "private" } };

  const rename = (next: string) => {
    const name = next.trim().replace(/\s+/g, " ");
    if (!name || name === title) return;
    const nextKey = `${kind}:${name}`;
    useReviewStore.getState().rename(key, nextKey, name);
    useSharingStore.getState().rename(key, nextKey);
    setProjectName(name);
  };

  const setVisibility = (v: Visibility) => {
    if (!stored.trim()) setProjectName(title);
    setVisibilityRaw(key, me, v);
  };

  /* Renaming and sharing are edits, so they also need Create, edit & publish. */
  const canCreate = !!useSettingsStore((s) => s.members.find((m) => m.id === me)?.permissions.includes("create"));
  return { title, key, sharing, isOwner: sharing.ownerId === me && canCreate, rename, setVisibility };
}
