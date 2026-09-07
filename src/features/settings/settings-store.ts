"use client";

import { create } from "zustand";
import {
  ROLE_PERMISSIONS,
  type ApprovalChain, type BrandKit, type IntegrationLog, type IntegrationStatus,
  type Invoice, type JoinRequest, type Language, type Member, type NotificationPref,
  type PendingInvite, type PermissionId, type Pronunciation, type Role, type Seniority,
  type TeamsChannel, type ThemeChoice, type TopUpEntry, type Typeface, type UsageEntry,
} from "@/features/settings/settings-types";

/**
 * Mock-only settings state, seeded with data that reads like a workspace in
 * use rather than an empty shell. Every mutation below is real — it just lands
 * in memory instead of a server, which is the same contract the studio flows
 * already run on.
 */

const uid = () => Math.random().toString(36).slice(2, 9);

const MEMBERS: Member[] = [
  { id: "m1", name: "Maya Kapoor",    email: "maya.kapoor@velmora.com",  role: "Marketing",           seniority: "Lead",      permissions: ROLE_PERMISSIONS["Marketing"],           status: "active", lastActive: "2 minutes ago" },
  { id: "m2", name: "Rohan Mehta",    email: "rohan.mehta@velmora.com",  role: "Design",              seniority: "Manager",   permissions: ROLE_PERMISSIONS["Design"],              status: "active", lastActive: "1 hour ago" },
  { id: "m3", name: "Dr. Anita Rao",  email: "anita.rao@velmora.com",    role: "Medical reviewer",    seniority: "Director",  permissions: ROLE_PERMISSIONS["Medical reviewer"],    status: "active", lastActive: "Yesterday" },
  { id: "m4", name: "Sam Whitfield",  email: "sam.w@velmora.com",        role: "Legal reviewer",      seniority: "Director",  permissions: ROLE_PERMISSIONS["Legal reviewer"],      status: "active", lastActive: "3 days ago" },
  { id: "m5", name: "Priya Nair",     email: "priya.nair@velmora.com",   role: "Regulatory reviewer", seniority: "VP",        permissions: ROLE_PERMISSIONS["Regulatory reviewer"], status: "active", lastActive: "Yesterday" },
  { id: "m6", name: "Daniel Osei",    email: "daniel.osei@velmora.com",  role: "Field Force",         seniority: "Associate", permissions: ROLE_PERMISSIONS["Field Force"],         status: "active", lastActive: "4 hours ago" },
  { id: "m7", name: "Lena Fischer",   email: "lena.fischer@velmora.com", role: "Field Force",         seniority: "Associate", permissions: ROLE_PERMISSIONS["Field Force"],         status: "active", lastActive: "Today" },
  { id: "m8", name: "Marco Duarte",   email: "marco.d@velmora.com",      role: "Field Force",         seniority: "Manager",   permissions: ROLE_PERMISSIONS["Field Force"],         status: "deactivated", lastActive: "6 weeks ago", deactivationReason: "Left the territory team" },
  // A deliberately customised member: Studio access removed from Marketing, so
  // the "differs from role default" marker has something real to show.
  { id: "m9", name: "Aisha Khan",      email: "aisha.khan@velmora.com",  role: "Marketing",           seniority: "Associate", permissions: ["libraries", "analytics", "comment"],   status: "active", lastActive: "Today" },
  { id: "m10", name: "Ben Sorensen",  email: "ben.s@velmora.com",        role: "CXO",                 seniority: "VP",        permissions: ROLE_PERMISSIONS["CXO"],                 status: "active", lastActive: "1 week ago" },
];

const CHAINS: ApprovalChain[] = [
  {
    memberId: "m1",
    stages: [
      { id: "s1", name: "Medical review",    role: "Medical reviewer",    narrowTo: { kind: "person", memberId: "m3" }, requireAll: true,  onReject: "draft" },
      { id: "s2", name: "Legal review",      role: "Legal reviewer",      narrowTo: { kind: "anyone" },                 requireAll: false, onReject: "previous" },
      { id: "s3", name: "Regulatory sign-off", role: "Regulatory reviewer", narrowTo: { kind: "seniority", floor: "Director" }, requireAll: true, onReject: "draft" },
    ],
  },
  {
    memberId: "m2",
    stages: [
      { id: "s4", name: "Medical review", role: "Medical reviewer", narrowTo: { kind: "anyone" }, requireAll: false, onReject: "draft" },
      { id: "s5", name: "Legal review",   role: "Legal reviewer",   narrowTo: { kind: "anyone" }, requireAll: false, onReject: "previous" },
    ],
  },
  { memberId: "m9", stages: [] },
];

const NOTIFICATIONS: NotificationPref[] = [
  { key: "approvals",  label: "Approval requests", email: true,  inApp: true,  teams: true,  inAppSupported: true },
  { key: "campaigns",  label: "Campaign updates",  email: true,  inApp: true,  teams: false, inAppSupported: true },
  { key: "engagement", label: "Engagement alerts", email: false, inApp: true,  teams: false, inAppSupported: true },
  { key: "weekly",     label: "Weekly summary",    email: true,  inApp: false, teams: false, inAppSupported: false },
  { key: "compliance", label: "Compliance alerts", email: true,  inApp: true,  teams: true,  inAppSupported: true },
];

const VEEVA_LOGS: IntegrationLog[] = [
  { id: "v1", at: "Today, 09:14", direction: "pull", object: "Approved claims",   records: 214, status: "ok" },
  { id: "v2", at: "Today, 09:14", direction: "pull", object: "Product records",   records: 12,  status: "ok" },
  { id: "v3", at: "Yesterday, 18:02", direction: "push", object: "Asset metadata", records: 3,  status: "ok" },
  { id: "v4", at: "Yesterday, 11:47", direction: "pull", object: "Approved claims", records: 0, status: "failed", detail: "Auth token expired — reconnect required" },
  { id: "v5", at: "2 days ago, 09:10", direction: "pull", object: "Approved claims", records: 211, status: "ok" },
];

const TEAMS_LOGS: IntegrationLog[] = [
  { id: "t1", at: "Today, 10:22", direction: "out", object: "#velmora-launch · approval request", status: "ok" },
  { id: "t2", at: "Today, 08:05", direction: "in",  object: "DM · asset status query",              status: "ok" },
  { id: "t3", at: "Yesterday, 16:41", direction: "out", object: "#mlr-review · compliance alert",   status: "ok" },
  { id: "t4", at: "Yesterday, 16:40", direction: "out", object: "#field-force · weekly summary",    status: "failed", detail: "Agent not a member of the channel" },
];

const CHANNELS: TeamsChannel[] = [
  { id: "c1", name: "#velmora-launch", canRead: true,  canSend: true },
  { id: "c2", name: "#mlr-review",     canRead: true,  canSend: true },
  { id: "c3", name: "#field-force",    canRead: true,  canSend: false },
  { id: "c4", name: "#leadership",     canRead: false, canSend: false },
];

const PRONUNCIATIONS: Pronunciation[] = [
  { id: "p1", term: "Velmora",     phonetic: "vel-MOR-uh",        notes: "Stress the second syllable",         addedBy: "Maya Kapoor",   addedAt: "12 Aug 2026" },
  { id: "p2", term: "tirzelamide", phonetic: "tur-ZEL-uh-mide",   notes: "Molecule name — never abbreviated",  addedBy: "Dr. Anita Rao", addedAt: "12 Aug 2026" },
  { id: "p3", term: "DERMORA",     phonetic: "der-MOR-uh",        notes: "Matches Velmora's cadence",          addedBy: "Maya Kapoor",   addedAt: "20 Aug 2026" },
  { id: "p4", term: "eGFR",        phonetic: "ee-jee-eff-arr",    notes: "Spell it out, never 'egfr'",         addedBy: "Priya Nair",    addedAt: "2 Sep 2026" },
  { id: "p5", term: "EMBRACE-3",   phonetic: "em-BRACE three",    notes: "Trial name; say the numeral",        addedBy: "Dr. Anita Rao", addedAt: "2 Sep 2026" },
];

const USAGE: UsageEntry[] = [
  { id: "u1", at: "Today, 11:02",     description: "HD Motion render · 60s",       person: "Maya Kapoor",   assetId: "AST-4192", assetTitle: "Velmora HCP launch",       credits: -2500, balanceAfter: 47500 },
  { id: "u2", at: "Today, 09:31",     description: "Creative render · A4 ×2",      person: "Rohan Mehta",   assetId: "AST-4188", assetTitle: "Velmora leave-behind",     credits: -900,  balanceAfter: 50000 },
  { id: "u3", at: "Yesterday, 17:20", description: "Cinematic 4K render · 45s",    person: "Maya Kapoor",   assetId: "AST-4171", assetTitle: "MoA explainer",            credits: -5625, balanceAfter: 50900 },
  { id: "u4", at: "Yesterday, 14:08", description: "Script regeneration",          person: "Aisha Khan",    assetId: "AST-4171", assetTitle: "MoA explainer",            credits: -120,  balanceAfter: 56525 },
  { id: "u5", at: "3 Sep, 10:44",     description: "HD Motion render · 30s",       person: "Rohan Mehta",   assetId: "AST-4155", assetTitle: "Dosing explainer",         credits: -1250, balanceAfter: 56645 },
  { id: "u6", at: "2 Sep, 16:12",     description: "Infographic render · 3 pages", person: "Aisha Khan",    assetId: "AST-4140", assetTitle: "EMBRACE-3 summary",        credits: -1350, balanceAfter: 57895 },
];

const TOPUPS: TopUpEntry[] = [
  { id: "k1", at: "1 Sep 2026",  amount: "$4,000.00", credits: 50000, purchasedBy: "Ben Sorensen", reference: "TXN-88214", status: "paid" },
  { id: "k2", at: "1 Aug 2026",  amount: "$4,000.00", credits: 50000, purchasedBy: "Ben Sorensen", reference: "TXN-84190", status: "paid" },
  { id: "k3", at: "14 Jul 2026", amount: "$800.00",   credits: 10000, purchasedBy: "Maya Kapoor",  reference: "TXN-81002", status: "paid" },
];

const INVOICES: Invoice[] = [
  { id: "i1", number: "INV-2026-0912", at: "1 Sep 2026", period: "Sep 2026", amount: "$4,000.00", status: "paid",
    lines: [{ description: "Enterprise plan — monthly", amount: "$2,000.00" }, { description: "Credit top-up — 50,000", amount: "$2,000.00" }] },
  { id: "i2", number: "INV-2026-0844", at: "1 Aug 2026", period: "Aug 2026", amount: "$4,000.00", status: "paid",
    lines: [{ description: "Enterprise plan — monthly", amount: "$2,000.00" }, { description: "Credit top-up — 50,000", amount: "$2,000.00" }] },
  { id: "i3", number: "INV-2026-0771", at: "1 Jul 2026", period: "Jul 2026", amount: "$2,800.00", status: "paid",
    lines: [{ description: "Enterprise plan — monthly", amount: "$2,000.00" }, { description: "Credit top-up — 10,000", amount: "$800.00" }] },
  { id: "i4", number: "INV-2026-1001", at: "1 Oct 2026", period: "Oct 2026", amount: "$2,000.00", status: "due",
    lines: [{ description: "Enterprise plan — monthly", amount: "$2,000.00" }] },
];

interface SettingsState {
  /** Whether the signed-in persona is an admin. Drives which tabs render. */
  isAdmin: boolean;
  currentUserId: string;
  setIsAdmin: (v: boolean) => void;

  // 1 — workspace profile
  workspaceName: string;
  legalEntity: string;
  region: string;
  therapyAreas: string[];
  workspaceId: string;
  setWorkspaceField: (k: "workspaceName" | "legalEntity" | "region", v: string) => void;
  toggleTherapyArea: (a: string) => void;

  // 2 — brand kit
  brandKit: BrandKit;
  setLogo: (slot: keyof BrandKit["logos"], file: { fileName: string; size: string } | null) => void;
  setTypefaces: (t: Typeface[]) => void;
  addTypeface: (name: string) => void;
  removeTypeface: (id: string) => void;
  setBrandColor: (hex: string) => void;

  // 3 — user profile
  firstName: string; lastName: string; email: string; phone: string;
  setProfileField: (k: "firstName" | "lastName" | "email" | "phone", v: string) => void;
  notifications: NotificationPref[];
  toggleNotification: (key: string, channel: "email" | "inApp" | "teams") => void;

  // 4 — team
  members: Member[];
  invites: PendingInvite[];
  joinRequests: JoinRequest[];
  setMemberRole: (id: string, role: Role) => void;
  setMemberSeniority: (id: string, s: Seniority) => void;
  toggleMemberPermission: (id: string, p: PermissionId) => void;
  resetMemberPermissions: (id: string) => void;
  setMemberStatus: (id: string, status: Member["status"], reason?: string) => void;
  sendInvites: (emails: string[], role: Role, seniority: Seniority) => void;
  revokeInvite: (id: string) => void;
  resolveJoinRequest: (id: string, accept: boolean, role?: Role, seniority?: Seniority) => void;

  // 5 — compliance & MLR
  chains: ApprovalChain[];
  expiryWarnDays: number;
  autoArchive: boolean;
  setChainStages: (memberId: string, stages: ApprovalChain["stages"]) => void;
  duplicateChain: (fromMemberId: string, toMemberId: string) => void;
  clearChain: (memberId: string) => void;
  setExpiry: (days: number, autoArchive: boolean) => void;

  // 6 — integrations
  integrationStatus: Record<string, IntegrationStatus>;
  veevaLogs: IntegrationLog[];
  teamsLogs: IntegrationLog[];
  veevaDirection: "pull" | "push" | "both";
  teamsAgentEmail: string;
  teamsChannels: TeamsChannel[];
  teamsAllowDm: boolean;
  imessageNumber: string;
  setIntegrationStatus: (id: string, s: IntegrationStatus) => void;
  setVeevaDirection: (d: "pull" | "push" | "both") => void;
  setTeamsAgentEmail: (v: string) => void;
  toggleChannelPermission: (id: string, which: "canRead" | "canSend") => void;
  setTeamsAllowDm: (v: boolean) => void;
  setImessageNumber: (v: string) => void;

  // 7 — appearance
  theme: ThemeChoice;
  language: Language;
  setTheme: (t: ThemeChoice) => void;
  setLanguage: (l: Language) => void;

  // 8 — billing & usage
  planName: string;
  renewsOn: string;
  creditBalance: number;
  paymentMethod: { brand: string; last4: string; expiry: string } | null;
  taxId: string;
  billingAddress: string;
  usage: UsageEntry[];
  topUps: TopUpEntry[];
  invoices: Invoice[];
  promoDismissed: boolean;
  setPaymentMethod: (m: SettingsState["paymentMethod"]) => void;
  setBillingField: (k: "taxId" | "billingAddress", v: string) => void;
  dismissPromo: () => void;

  // 9 — pronunciations
  pronunciations: Pronunciation[];
  addPronunciation: (p: Omit<Pronunciation, "id" | "addedBy" | "addedAt">) => void;
  updatePronunciation: (id: string, p: Partial<Pronunciation>) => void;
  removePronunciation: (id: string) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  isAdmin: true,
  currentUserId: "m1",
  setIsAdmin: (isAdmin) => set({ isAdmin }),

  workspaceName: "Velmora Commercial",
  legalEntity: "Velmora Therapeutics Inc.",
  region: "United States",
  therapyAreas: ["Dermatology", "Cardiology"],
  workspaceId: "ws_velmora_7f3a91",
  setWorkspaceField: (k, v) => set({ [k]: v } as Partial<SettingsState>),
  toggleTherapyArea: (a) => set((s) => ({
    therapyAreas: s.therapyAreas.includes(a) ? s.therapyAreas.filter((x) => x !== a) : [...s.therapyAreas, a],
  })),

  brandKit: {
    logos: {
      "lockup-light": { fileName: "velmora-lockup-light.svg", size: "18 KB" },
      "lockup-dark":  { fileName: "velmora-lockup-dark.svg",  size: "18 KB" },
      "mark-light":   { fileName: "velmora-mark.svg",         size: "6 KB" },
      "favicon":      { fileName: "velmora-favicon.png",      size: "24 KB" },
    },
    typefaces: [
      { id: "tf1", name: "Sofia Pro",     source: "uploaded" },
      { id: "tf2", name: "Inter",         source: "google" },
      { id: "tf3", name: "IBM Plex Mono", source: "google" },
    ],
    brandColor: "#fd4816",
    accents: ["#12784a", "#b82f0c"],
  },
  setLogo: (slot, file) => set((s) => {
    const logos = { ...s.brandKit.logos };
    if (file) logos[slot] = file; else delete logos[slot];
    return { brandKit: { ...s.brandKit, logos } };
  }),
  setTypefaces: (typefaces) => set((s) => ({ brandKit: { ...s.brandKit, typefaces } })),
  addTypeface: (name) => set((s) => (
    s.brandKit.typefaces.length >= 3 ? s : {
      brandKit: { ...s.brandKit, typefaces: [...s.brandKit.typefaces, { id: uid(), name, source: "uploaded" as const }] },
    }
  )),
  removeTypeface: (id) => set((s) => ({
    brandKit: { ...s.brandKit, typefaces: s.brandKit.typefaces.filter((t) => t.id !== id) },
  })),
  setBrandColor: (brandColor) => set((s) => ({ brandKit: { ...s.brandKit, brandColor } })),

  firstName: "Maya",
  lastName: "Kapoor",
  email: "maya.kapoor@velmora.com",
  phone: "+1 415 555 0184",
  setProfileField: (k, v) => set({ [k]: v } as Partial<SettingsState>),
  notifications: NOTIFICATIONS,
  toggleNotification: (key, channel) => set((s) => ({
    notifications: s.notifications.map((n) => {
      if (n.key !== key) return n;
      if (channel === "inApp" && !n.inAppSupported) return n;
      return { ...n, [channel]: !n[channel] };
    }),
  })),

  members: MEMBERS,
  invites: [
    { id: "iv1", email: "nadia.hassan@velmora.com", role: "Marketing",   seniority: "Manager",   invitedAt: "2 days ago" },
    { id: "iv2", email: "tom.becker@velmora.com",   role: "Field Force", seniority: "Associate", invitedAt: "5 days ago" },
  ],
  joinRequests: [
    { id: "jr1", name: "Elena Sokolova", email: "elena.s@velmora.com", requestedAt: "Yesterday" },
  ],
  setMemberRole: (id, role) => set((s) => ({
    // Changing role re-seeds permissions — the role is the starting point.
    members: s.members.map((m) => (m.id === id ? { ...m, role, permissions: [...ROLE_PERMISSIONS[role]] } : m)),
  })),
  setMemberSeniority: (id, seniority) => set((s) => ({
    members: s.members.map((m) => (m.id === id ? { ...m, seniority } : m)),
  })),
  toggleMemberPermission: (id, p) => set((s) => ({
    members: s.members.map((m) => {
      if (m.id !== id) return m;
      const has = m.permissions.includes(p);
      return { ...m, permissions: has ? m.permissions.filter((x) => x !== p) : [...m.permissions, p] };
    }),
  })),
  resetMemberPermissions: (id) => set((s) => ({
    members: s.members.map((m) => (m.id === id ? { ...m, permissions: [...ROLE_PERMISSIONS[m.role]] } : m)),
  })),
  setMemberStatus: (id, status, reason) => set((s) => ({
    members: s.members.map((m) => (m.id === id ? { ...m, status, deactivationReason: status === "deactivated" ? reason : undefined } : m)),
  })),
  sendInvites: (emails, role, seniority) => set((s) => ({
    invites: [...s.invites, ...emails.map((email) => ({ id: uid(), email, role, seniority, invitedAt: "Just now" }))],
  })),
  revokeInvite: (id) => set((s) => ({ invites: s.invites.filter((i) => i.id !== id) })),
  resolveJoinRequest: (id, accept, role = "Read only", seniority = "Associate") => set((s) => {
    const req = s.joinRequests.find((r) => r.id === id);
    if (!req) return s;
    return {
      joinRequests: s.joinRequests.filter((r) => r.id !== id),
      members: accept
        ? [...s.members, { id: uid(), name: req.name, email: req.email, role, seniority,
            permissions: [...ROLE_PERMISSIONS[role]], status: "active" as const, lastActive: "Just now" }]
        : s.members,
    };
  }),

  chains: CHAINS,
  expiryWarnDays: 30,
  autoArchive: true,
  setChainStages: (memberId, stages) => set((s) => {
    const exists = s.chains.some((c) => c.memberId === memberId);
    return {
      chains: exists
        ? s.chains.map((c) => (c.memberId === memberId ? { ...c, stages } : c))
        : [...s.chains, { memberId, stages }],
    };
  }),
  duplicateChain: (fromMemberId, toMemberId) => {
    const from = get().chains.find((c) => c.memberId === fromMemberId);
    if (!from) return;
    // New stage ids so the two chains stay independent afterwards.
    const stages = from.stages.map((st) => ({ ...st, id: uid() }));
    get().setChainStages(toMemberId, stages);
  },
  clearChain: (memberId) => set((s) => ({
    chains: s.chains.map((c) => (c.memberId === memberId ? { ...c, stages: [] } : c)),
  })),
  setExpiry: (expiryWarnDays, autoArchive) => set({ expiryWarnDays, autoArchive }),

  integrationStatus: { veeva: "connected", teams: "connected", imessage: "not-connected" },
  veevaLogs: VEEVA_LOGS,
  teamsLogs: TEAMS_LOGS,
  veevaDirection: "both",
  teamsAgentEmail: "swishx-agent@velmora.com",
  teamsChannels: CHANNELS,
  teamsAllowDm: true,
  imessageNumber: "",
  setIntegrationStatus: (id, st) => set((s) => ({ integrationStatus: { ...s.integrationStatus, [id]: st } })),
  setVeevaDirection: (veevaDirection) => set({ veevaDirection }),
  setTeamsAgentEmail: (teamsAgentEmail) => set({ teamsAgentEmail }),
  toggleChannelPermission: (id, which) => set((s) => ({
    teamsChannels: s.teamsChannels.map((c) => {
      if (c.id !== id) return c;
      const next = { ...c, [which]: !c[which] };
      // Send without read is not a state the agent can be in.
      if (which === "canRead" && !next.canRead) next.canSend = false;
      if (which === "canSend" && next.canSend) next.canRead = true;
      return next;
    }),
  })),
  setTeamsAllowDm: (teamsAllowDm) => set({ teamsAllowDm }),
  setImessageNumber: (imessageNumber) => set({ imessageNumber }),

  theme: "light",
  language: "English (United States)",
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language }),

  planName: "Enterprise",
  renewsOn: "1 Oct 2026",
  creditBalance: 47500,
  paymentMethod: { brand: "Visa", last4: "6411", expiry: "09 / 2028" },
  taxId: "US-EIN 84-3921047",
  billingAddress: "500 Harrison St, San Francisco, CA 94105",
  usage: USAGE,
  topUps: TOPUPS,
  invoices: INVOICES,
  promoDismissed: false,
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setBillingField: (k, v) => set({ [k]: v } as Partial<SettingsState>),
  dismissPromo: () => set({ promoDismissed: true }),

  pronunciations: PRONUNCIATIONS,
  addPronunciation: (p) => set((s) => ({
    pronunciations: [{ ...p, id: uid(), addedBy: "Maya Kapoor", addedAt: "Just now" }, ...s.pronunciations],
  })),
  updatePronunciation: (id, patch) => set((s) => ({
    pronunciations: s.pronunciations.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  })),
  removePronunciation: (id) => set((s) => ({ pronunciations: s.pronunciations.filter((p) => p.id !== id) })),
}));

if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  (window as unknown as { __swishxSettings?: typeof useSettingsStore }).__swishxSettings = useSettingsStore;
}
