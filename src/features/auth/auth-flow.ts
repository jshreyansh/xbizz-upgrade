"use client";

import { create } from "zustand";
import { findInvite, findInviteByEmail, orgPeople, useSettingsStore } from "@/features/settings/settings-store";
import { emailDomain, isPersonalEmail } from "@/features/settings/settings-types";

/**
 * Where a work email leads after the code is verified.
 *
 * - **member**: already has access, so straight into the app.
 * - **invite**: has a pending invite, so accept it, give a name, and arrive with that role.
 * - **join**: the company is already on SwishX but nobody invited them, so ask a workspace's admins.
 * - **pending**: has asked already, so back to the waiting screen.
 * - **new**: a company new to SwishX, so set up the organisation and its first workspace.
 * - **removed** / **expired**: can't get in, with why and what to do.
 *
 * Personal addresses never get as far as a code.
 */
export type AuthPath = "member" | "invite" | "join" | "pending" | "new" | "removed" | "expired" | "wrong-email";

export interface AuthRoute {
  path: AuthPath;
  personId?: string;
  inviteId?: string;
  reason?: string;
}

export function routeEmail(email: string, inviteId?: string): AuthRoute {
  const s = useSettingsStore.getState();
  const e = email.trim().toLowerCase();

  /* Opened from an invite link: it decides, and it must match the address. */
  if (inviteId) {
    const found = findInvite(s, inviteId);
    if (!found) return { path: "removed", reason: "This invite is no longer valid. It may have been revoked." };
    if (found.invite.email.toLowerCase() !== e) return { path: "wrong-email", inviteId };
    if (found.invite.expired) return { path: "expired", inviteId };
    return { path: "invite", inviteId };
  }

  const person = orgPeople(s).find((p) => p.email.toLowerCase() === e);
  if (person) {
    const active = [s.members, ...Object.values(s.stash).map((w) => w.members)]
      .some((list) => list.some((m) => m.id === person.id && m.status === "active"));
    if (active) return { path: "member", personId: person.id };
    return { path: "removed", reason: person.deactivationReason ? `Your access was removed: ${person.deactivationReason.toLowerCase()}.` : "Your access was removed." };
  }

  const invited = findInviteByEmail(s, e);
  if (invited) return invited.invite.expired ? { path: "expired", inviteId: invited.invite.id } : { path: "invite", inviteId: invited.invite.id };

  const requests = [s.joinRequests, ...Object.values(s.stash).map((w) => w.joinRequests)].flat();
  if (requests.some((r) => r.email.toLowerCase() === e)) return { path: "pending" };

  if (s.allowedDomains.includes(emailDomain(e))) return { path: "join" };
  return { path: "new" };
}

export function emailProblem(email: string): string | undefined {
  const e = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) return "Enter your work email, like you@company.com.";
  if (isPersonalEmail(e)) return `SwishX is for company accounts, so ${emailDomain(e)} addresses can't sign in. Use your work email.`;
  return undefined;
}

interface AuthFlowState {
  email: string;
  route: AuthRoute;
  /** From an invite link, kept while they verify. */
  inviteId?: string;
  setEmail: (email: string) => void;
  setRoute: (route: AuthRoute) => void;
  setInviteId: (id?: string) => void;
}

export const useAuthFlow = create<AuthFlowState>((set) => ({
  /* A new company, so the default walk-through is first sign-up. */
  email: "lee.chen@meridian-tx.com",
  route: { path: "new" },
  setEmail: (email) => set({ email }),
  setRoute: (route) => set({ route }),
  setInviteId: (inviteId) => set({ inviteId }),
}));

/** Addresses that walk each path, for trying the flows in the prototype. */
export const TRY_EMAILS = [
  { label: "New company", email: "lee.chen@meridian-tx.com" },
  { label: "Invited", email: "nadia.hassan@velmora.com" },
  { label: "Expired invite", email: "grace.liu@velmora.com" },
  { label: "Colleague, not invited", email: "omar.farouk@velmora.com" },
  { label: "Returning", email: "maya.kapoor@velmora.com" },
  { label: "Access removed", email: "marco.d@velmora.com" },
  { label: "Personal email", email: "lee.chen@gmail.com" },
];
