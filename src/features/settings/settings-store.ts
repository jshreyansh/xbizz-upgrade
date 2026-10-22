"use client";

import { create } from "zustand";
import { useProductLibraryStore } from "@/features/product-library/product-library-store";
import {
  ROLE_PERMISSIONS, DEFAULT_ROLES, rolePermissions, setLevel, fromSpec, type RoleDef, type AreaId, type LevelId,
  type ApprovalChain, type BrandKit, type IntegrationLog, type IntegrationStatus,
  type Invoice, type JoinRequest, type Language, type Member, type NotificationPref,
  type PendingInvite, type PermissionId, type Pronunciation, type Role, type Seniority,
  type ColorRole, type TeamsChannel, type ThemeChoice, type TopUpEntry, type Typeface, type UsageEntry, type TopUpRequest,
} from "@/features/settings/settings-types";

/**
 * Mock-only settings state, seeded with data that reads like a workspace in
 * use rather than an empty shell. Every mutation below is real — it just lands
 * in memory instead of a server, which is the same contract the studio flows
 * already run on.
 */

const uid = () => Math.random().toString(36).slice(2, 9);

/* A role an admin made: billing only, for whoever buys the credits. */
const FINANCE = fromSpec({ content: "view", billing: "manage" });

const MEMBERS: Member[] = [
  { id: "m0", name: "Siva Gnanam",    email: "sivaprakasam.gnanam@swishx.com", role: "Workspace admin", seniority: "Director", permissions: ROLE_PERMISSIONS["Workspace admin"],               status: "active", lastActive: "Online now" },
  { id: "m1", name: "Maya Kapoor",    email: "maya.kapoor@velmora.com",  role: "Marketing",           seniority: "Lead",      permissions: ROLE_PERMISSIONS["Marketing"],                      status: "active", lastActive: "2 minutes ago" },
  { id: "m2", name: "Rohan Mehta",    email: "rohan.mehta@velmora.com",  role: "Design",              seniority: "Manager",   permissions: ROLE_PERMISSIONS["Design"],              status: "active", lastActive: "1 hour ago" },
  { id: "m3", name: "Dr. Anita Rao",  email: "anita.rao@velmora.com",    role: "Medical reviewer",    seniority: "Director",  permissions: ROLE_PERMISSIONS["Medical reviewer"],    status: "active", lastActive: "Yesterday" },
  { id: "m4", name: "Sam Whitfield",  email: "sam.w@velmora.com",        role: "Legal reviewer",      seniority: "Director",  permissions: ROLE_PERMISSIONS["Legal reviewer"],      status: "active", lastActive: "3 days ago" },
  { id: "m5", name: "Priya Nair",     email: "priya.nair@velmora.com",   role: "Regulatory reviewer", seniority: "VP",        permissions: ROLE_PERMISSIONS["Regulatory reviewer"], status: "active", lastActive: "Yesterday" },
  { id: "m6", name: "Daniel Osei",    email: "daniel.osei@velmora.com",  role: "Field Force",         seniority: "Associate", permissions: ROLE_PERMISSIONS["Field Force"],         status: "active", lastActive: "4 hours ago" },
  { id: "m7", name: "Lena Fischer",   email: "lena.fischer@velmora.com", role: "Field Force",         seniority: "Associate", permissions: ROLE_PERMISSIONS["Field Force"],         status: "active", lastActive: "Today" },
  { id: "m8", name: "Marco Duarte",   email: "marco.d@velmora.com",      role: "Field Force",         seniority: "Manager",   permissions: ROLE_PERMISSIONS["Field Force"],         status: "deactivated", lastActive: "6 weeks ago", deactivationReason: "Left the territory team" },
  // A deliberately customised member: Create removed from Marketing, so
  // the "differs from role default" marker has something real to show.
  { id: "m9", name: "Aisha Khan",      email: "aisha.khan@velmora.com",  role: "Marketing",           seniority: "Associate", permissions: fromSpec({ content: "comment", library: "manage", brand: "manage", pronunciations: "manage", integrations: "view", analytics: "view", billing: "view" }),   status: "active", lastActive: "Today" },
  // On a role an admin made (Finance), not one the workspace came with.
  { id: "m10", name: "Ben Sorensen",  email: "ben.s@velmora.com",        role: "Finance",             seniority: "VP",        permissions: FINANCE,                             status: "active", lastActive: "1 week ago" },
];

const CHAINS: ApprovalChain[] = [
  {
    memberId: "m0",
    stages: [
      { id: "s0", name: "Medical review", role: "Medical reviewer", narrowTo: { kind: "seniority", floor: "Director" } },
    ],
  },
  {
    memberId: "m1",
    stages: [
      { id: "s1", name: "Medical review",    role: "Medical reviewer",    narrowTo: { kind: "person", memberId: "m3" } },
      { id: "s2", name: "Legal review",      role: "Legal reviewer",      narrowTo: { kind: "anyone" } },
      { id: "s3", name: "Regulatory sign-off", role: "Regulatory reviewer", narrowTo: { kind: "seniority", floor: "Director" } },
    ],
  },
  {
    memberId: "m2",
    stages: [
      { id: "s4", name: "Medical review", role: "Medical reviewer", narrowTo: { kind: "anyone" } },
      { id: "s5", name: "Legal review",   role: "Legal reviewer",   narrowTo: { kind: "anyone" } },
    ],
  },
  { memberId: "m9", stages: [] },
  {
    memberId: "__default",
    stages: [
      { id: "sd1", name: "Medical review", role: "Medical reviewer", narrowTo: { kind: "anyone" } },
      { id: "sd2", name: "Legal review",   role: "Legal reviewer",   narrowTo: { kind: "anyone" } },
    ],
  },
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
  { id: "v4", at: "Yesterday, 11:47", direction: "pull", object: "Approved claims", records: 0, status: "failed", detail: "Auth token expired, reconnect required" },
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
  { id: "p2", term: "tirzelamide", phonetic: "tur-ZEL-uh-mide",   notes: "Molecule name, never abbreviated",  addedBy: "Dr. Anita Rao", addedAt: "12 Aug 2026" },
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
    lines: [{ description: "Enterprise plan, monthly", amount: "$2,000.00" }, { description: "Credit top-up, 50,000", amount: "$2,000.00" }] },
  { id: "i2", number: "INV-2026-0844", at: "1 Aug 2026", period: "Aug 2026", amount: "$4,000.00", status: "paid",
    lines: [{ description: "Enterprise plan, monthly", amount: "$2,000.00" }, { description: "Credit top-up, 50,000", amount: "$2,000.00" }] },
  { id: "i3", number: "INV-2026-0771", at: "1 Jul 2026", period: "Jul 2026", amount: "$2,800.00", status: "paid",
    lines: [{ description: "Enterprise plan, monthly", amount: "$2,000.00" }, { description: "Credit top-up, 10,000", amount: "$800.00" }] },
  { id: "i4", number: "INV-2026-1001", at: "1 Oct 2026", period: "Oct 2026", amount: "$2,000.00", status: "due",
    lines: [{ description: "Enterprise plan, monthly", amount: "$2,000.00" }] },
];

/* ── Organisation and workspaces ────────────────────────────────────────────
   An organisation (the company: legal entity, allowed email domains, its
   admins) holds workspaces (a brand or market). Each workspace has its own
   team, roles, approval chains, libraries and credits; a person can be in
   several with a different role in each, added to each separately. The
   workspace you are in lives in the top-level fields below, so every settings
   screen keeps working unchanged; the others wait in `stash`. A person keeps
   one id across workspaces. */

export const SEED_WORKSPACE_ID = "ws_velmora_7f3a91";

/** The fields that belong to one workspace. */
const SLICE_KEYS = [
  "workspaceName", "region", "therapyAreas", "markets", "workspaceId", "brandKit",
  "members", "invites", "joinRequests", "roles", "chains", "expiryWarnDays", "autoArchive",
  "planName", "renewsOn", "creditBalance", "usage", "topUps", "invoices", "pronunciations", "topUpRequests",
] as const;
export type WorkspaceSlice = Pick<SettingsState, (typeof SLICE_KEYS)[number]>;

const pickSlice = (s: SettingsState): WorkspaceSlice =>
  Object.fromEntries(SLICE_KEYS.map((k) => [k, s[k]])) as WorkspaceSlice;

const EMPTY_KIT: BrandKit = {
  logos: {},
  typefaces: [{ id: "tf-inter", name: "Inter", source: "google" }],
  colors: { primary: "#1f2937", accent: "#475569", callout: "#f1f5f9", text: "#0a0d14" },
};

export interface WorkspaceSummary {
  id: string;
  name: string;
  memberCount: number;
  creditBalance: number;
  archived: boolean;
  current: boolean;
  /** The person's member row there, if they are in it. */
  me?: Member;
}

export interface NewWorkspaceInput {
  name: string;
  region: string;
  markets: string[];
  therapyAreas: string[];
  copyRoles: boolean;
  copyBrandKit: boolean;
  invites: { email: string; role: Role }[];
}

/* A second workspace, so switching has somewhere to go. Maya runs it; Siva,
   the organisation admin, isn't in it, which is what "Open as admin" is for. */
const EU_ROLES = DEFAULT_ROLES.map((r) => ({ ...r, permissions: [...r.permissions] }));
const EU_WORKSPACE: WorkspaceSlice = {
  workspaceName: "Velmora EU",
  region: "European Union",
  markets: ["European Union · EMA", "UK"],
  therapyAreas: ["Dermatology"],
  workspaceId: "ws_velmora_eu_2c81",
  brandKit: {
    logos: { "lockup-light": { fileName: "velmora-eu-lockup.svg", size: "19 KB" } },
    typefaces: [{ id: "tf-eu1", name: "Inter", source: "google" }],
    colors: { primary: "#fd4816", accent: "#b82f0c", callout: "#fff1ec", text: "#0a0d14" },
  },
  members: [
    { ...MEMBERS[1], role: "Workspace admin", seniority: "Lead", permissions: ROLE_PERMISSIONS["Workspace admin"], lastActive: "Today" },
    { ...MEMBERS[7], role: "Marketing", permissions: ROLE_PERMISSIONS["Marketing"], lastActive: "Yesterday" },
    { id: "m11", name: "Dr. Jonas Weber", email: "jonas.weber@velmora.com", role: "Medical reviewer", seniority: "Director", permissions: ROLE_PERMISSIONS["Medical reviewer"], status: "active", lastActive: "2 days ago" },
  ],
  invites: [],
  joinRequests: [],
  roles: EU_ROLES,
  chains: [{ memberId: "m7", stages: [{ id: "eu1", name: "Medical review", role: "Medical reviewer", narrowTo: { kind: "anyone" } }] }],
  expiryWarnDays: 30,
  autoArchive: true,
  planName: "Enterprise",
  renewsOn: "1 Oct 2026",
  creditBalance: 12000,
  usage: [],
  topUps: [{ id: "k-eu1", at: "3 Oct 2026", amount: "$960.00", credits: 12000, purchasedBy: "Maya Kapoor", reference: "TXN-90118", status: "paid" }],
  invoices: [],
  pronunciations: [],
  topUpRequests: [],
};

interface SettingsState {
  /** Derived from the current persona's permissions — never set on its own. */
  isAdmin: boolean;
  currentUserId: string;
  /** Who actually signed in. "Viewing as" changes currentUserId only, so the app can say it's a preview. */
  signedInId: string;
  /** Switch persona. Drives which tabs render and whether chains are editable. */
  setCurrentUser: (memberId: string) => void;

  // 0 — organisation
  orgName: string;
  allowedDomains: string[];
  /** Person ids. Organisation admins create, rename and archive workspaces and can open any of them. */
  orgAdminIds: string[];
  archivedWorkspaceIds: string[];
  /** Every workspace but the current one. */
  stash: Record<string, WorkspaceSlice>;
  setOrgName: (v: string) => void;
  addAllowedDomain: (d: string) => void;
  removeAllowedDomain: (d: string) => void;
  toggleOrgAdmin: (personId: string) => void;
  switchWorkspace: (id: string) => void;
  /** Organisation admins only: add yourself as Workspace admin of a workspace (or step up in one you're in), then open it. */
  joinWorkspaceAsAdmin: (id: string) => void;
  createWorkspace: (input: NewWorkspaceInput) => string;
  renameWorkspace: (id: string, name: string) => void;
  setWorkspaceArchived: (id: string, archived: boolean) => void;
  /** Takes someone out of this workspace only; their other workspaces are untouched. */
  removeMember: (id: string) => void;

  // 1 — workspace profile
  markets: string[];
  workspaceName: string;
  legalEntity: string;
  region: string;
  therapyAreas: string[];
  workspaceId: string;
  setWorkspaceField: (k: "workspaceName" | "legalEntity" | "region", v: string) => void;
  toggleTherapyArea: (a: string) => void;
  toggleMarket: (m: string) => void;

  // 2 — brand kit
  brandKit: BrandKit;
  setBrandKit: (kit: BrandKit) => void;
  setLogo: (slot: keyof BrandKit["logos"], file: { fileName: string; size: string } | null) => void;
  setTypefaces: (t: Typeface[]) => void;
  addTypeface: (name: string) => void;
  removeTypeface: (id: string) => void;
  setBrandColor: (role: ColorRole, hex: string) => void;

  // 3 — user profile
  firstName: string; lastName: string; email: string; phone: string;
  setProfileField: (k: "firstName" | "lastName" | "email" | "phone", v: string) => void;
  notifications: NotificationPref[];
  toggleNotification: (key: string, channel: "email" | "inApp" | "teams") => void;

  // 4 — team
  members: Member[];
  invites: PendingInvite[];
  joinRequests: JoinRequest[];
  roles: RoleDef[];
  addRole: (name: string, permissions: PermissionId[]) => void;
  /** Rename and/or re-permission. Members still on the old defaults move to the new ones. */
  updateRole: (name: string, next: { name: string; permissions: PermissionId[] }) => void;
  /** Only once nobody uses it; Role configuration blocks it before that. */
  removeRole: (name: string) => void;
  setMemberRole: (id: string, role: Role) => void;
  setMemberSeniority: (id: string, s: Seniority) => void;
  /** One area's level for this member only; the rules bring along what it needs. */
  setMemberLevel: (id: string, area: AreaId, level: LevelId) => void;
  resetMemberPermissions: (id: string) => void;
  setMemberStatus: (id: string, status: Member["status"], reason?: string) => void;
  sendInvites: (emails: string[], role: Role, seniority: Seniority, permissions: PermissionId[]) => void;
  revokeInvite: (id: string) => void;
  /** Sends the invite email again; the row then says when. */
  resendInvite: (id: string) => void;
  /** The invitee's side: asks the admins for a fresh link. */
  requestInviteResend: (inviteId: string) => void;
  resolveJoinRequest: (id: string, accept: boolean, role?: Role, seniority?: Seniority) => void;
  /** The invitee's side: they verified the invited address and gave their name. */
  acceptInvite: (inviteId: string, name: string) => boolean;
  /** A colleague whose company is already on SwishX, not invited, asks a workspace's admins. */
  requestToJoin: (workspaceId: string, name: string, email: string, note?: string) => void;
  /** Sign in as someone who already has access: into the given workspace, or any of theirs. */
  signInAs: (personId: string, workspaceId?: string) => void;

  // 5 — compliance & MLR
  chains: ApprovalChain[];
  expiryWarnDays: number;
  autoArchive: boolean;
  setChainStages: (memberId: string, stages: ApprovalChain["stages"]) => void;
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
  /** People who spend credits asking whoever holds Billing: Manage to top up. */
  topUpRequests: TopUpRequest[];
  requestTopUp: () => void;
  dismissTopUpRequest: (id: string) => void;
  /** Billing: Manage buys credits; open requests are answered by it. */
  topUp: (credits: number, amount: string) => void;

  // 9 — pronunciations
  pronunciations: Pronunciation[];
  addPronunciation: (p: Omit<Pronunciation, "id" | "addedBy" | "addedAt">) => void;
  updatePronunciation: (id: string, p: Partial<Pronunciation>) => void;
  removePronunciation: (id: string) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  orgName: "Velmora Therapeutics",
  allowedDomains: ["velmora.com", "swishx.com"],
  orgAdminIds: ["m0"],
  archivedWorkspaceIds: [],
  stash: { [EU_WORKSPACE.workspaceId]: EU_WORKSPACE },
  setOrgName: (orgName) => set({ orgName }),
  addAllowedDomain: (d) => set((s) => {
    const domain = d.trim().toLowerCase().replace(/^@/, "");
    return !domain || s.allowedDomains.includes(domain) ? s : { allowedDomains: [...s.allowedDomains, domain] };
  }),
  removeAllowedDomain: (d) => set((s) => ({ allowedDomains: s.allowedDomains.filter((x) => x !== d) })),
  toggleOrgAdmin: (personId) => set((s) => {
    if (s.orgAdminIds.includes(personId)) {
      /* Someone has to be able to create workspaces and own billing. */
      return s.orgAdminIds.length <= 1 ? s : { orgAdminIds: s.orgAdminIds.filter((x) => x !== personId) };
    }
    return { orgAdminIds: [...s.orgAdminIds, personId] };
  }),
  switchWorkspace: (id) => {
    const s = get();
    if (id === s.workspaceId || !s.stash[id]) return;
    const target = s.stash[id];
    const me = target.members.find((m) => m.id === s.currentUserId && m.status === "active");
    if (!me) return;
    const stash = { ...s.stash, [s.workspaceId]: pickSlice(s) };
    delete stash[id];
    useProductLibraryStore.getState().switchWorkspace(s.workspaceId, id);
    set({ ...target, stash, isAdmin: me.permissions.includes("admin") });
  },
  joinWorkspaceAsAdmin: (id) => {
    const s = get();
    /* In the workspace you're in: step up from your role there to Workspace admin. */
    if (id === s.workspaceId) {
      if (!s.orgAdminIds.includes(s.currentUserId)) return;
      set({
        members: s.members.map((m) => (m.id === s.currentUserId ? { ...m, role: "Workspace admin", permissions: rolePermissions(s.roles, "Workspace admin") } : m)),
        isAdmin: true,
      });
      return;
    }
    const target = s.stash[id];
    if (!target || !s.orgAdminIds.includes(s.currentUserId)) return;
    const person = s.members.find((m) => m.id === s.currentUserId);
    if (!person) return;
    const existing = target.members.find((m) => m.id === person.id);
    const members = existing
      ? target.members.map((m) => (m.id === person.id ? { ...m, status: "active" as const, role: "Workspace admin", permissions: rolePermissions(target.roles, "Workspace admin") } : m))
      : [...target.members, { ...person, role: "Workspace admin", permissions: rolePermissions(target.roles, "Workspace admin"), status: "active" as const, lastActive: "Just now" }];
    set({ stash: { ...s.stash, [id]: { ...target, members } } });
    get().switchWorkspace(id);
  },
  createWorkspace: (input) => {
    const s = get();
    const id = `ws_${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 18)}_${uid().slice(0, 4)}`;
    const roles = input.copyRoles ? s.roles.map((r) => ({ ...r, permissions: [...r.permissions] })) : DEFAULT_ROLES;
    const person = s.members.find((m) => m.id === s.currentUserId)!;
    const people = orgPeople(s);
    const members: Member[] = [{ ...person, role: "Workspace admin", permissions: rolePermissions(roles, "Workspace admin"), status: "active", lastActive: "Online now" }];
    const invites: PendingInvite[] = [];
    for (const inv of input.invites) {
      const known = people.find((p) => p.email.toLowerCase() === inv.email.toLowerCase());
      /* Already in the organisation: added straight away, no sign-up. */
      if (known) {
        if (!members.some((m) => m.id === known.id)) members.push({ ...known, role: inv.role, permissions: rolePermissions(roles, inv.role), status: "active", lastActive: "Just now", deactivationReason: undefined });
      } else {
        invites.push({ id: uid(), email: inv.email, role: inv.role, seniority: "Associate", permissions: rolePermissions(roles, inv.role), invitedAt: "Just now" });
      }
    }
    const slice: WorkspaceSlice = {
      workspaceName: input.name.trim(),
      region: input.region,
      markets: input.markets,
      therapyAreas: input.therapyAreas,
      workspaceId: id,
      brandKit: input.copyBrandKit ? s.brandKit : EMPTY_KIT,
      members, invites, joinRequests: [], roles, chains: [],
      expiryWarnDays: 30, autoArchive: true,
      planName: s.planName, renewsOn: s.renewsOn,
      /* Credits are per workspace: a new one starts empty and is topped up in its own Billing. */
      creditBalance: 0, usage: [], topUps: [], invoices: [], pronunciations: [], topUpRequests: [],
    };
    set({ stash: { ...s.stash, [id]: slice } });
    useProductLibraryStore.getState().ensureWorkspace(id);
    get().switchWorkspace(id);
    return id;
  },
  renameWorkspace: (id, name) => set((s) => {
    const n = name.trim();
    if (!n) return s;
    if (id === s.workspaceId) return { workspaceName: n };
    return s.stash[id] ? { stash: { ...s.stash, [id]: { ...s.stash[id], workspaceName: n } } } : s;
  }),
  setWorkspaceArchived: (id, archived) => set((s) => {
    if (id === s.workspaceId && archived) return s; // switch away first
    return { archivedWorkspaceIds: archived ? [...s.archivedWorkspaceIds, id] : s.archivedWorkspaceIds.filter((x) => x !== id) };
  }),
  removeMember: (id) => set((s) => ({
    members: s.members.filter((m) => m.id !== id),
    chains: s.chains.filter((c) => c.memberId !== id),
  })),

  isAdmin: true,
  currentUserId: "m0",
  signedInId: "m0",
  setCurrentUser: (memberId) => set((s) => {
    const m = s.members.find((x) => x.id === memberId);
    if (!m) return s;
    return {
      currentUserId: memberId,
      isAdmin: m.permissions.includes("admin"),
      // The profile tab shows the persona you are viewing as.
      firstName: m.name.split(" ").slice(0, -1).join(" ") || m.name,
      lastName: m.name.split(" ").slice(-1)[0] ?? "",
      email: m.email,
    };
  }),

  markets: ["United States · FDA", "UK"],
  workspaceName: "Velmora Commercial",
  legalEntity: "Velmora Therapeutics Inc.",
  region: "United States",
  therapyAreas: ["Dermatology", "Cardiology"],
  workspaceId: SEED_WORKSPACE_ID,
  setWorkspaceField: (k, v) => set({ [k]: v } as Partial<SettingsState>),
  toggleMarket: (m) => set((s) => ({
    markets: s.markets.includes(m) ? s.markets.filter((x) => x !== m) : [...s.markets, m],
  })),
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
    colors: {
      primary: "#fd4816",
      accent: "#b82f0c",
      callout: "#fff1ec",
      text: "#0a0d14",
    },
  },
  setBrandKit: (brandKit) => set({ brandKit }),
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
  setBrandColor: (role, hex) => set((s) => ({
    brandKit: { ...s.brandKit, colors: { ...s.brandKit.colors, [role]: hex } },
  })),

  firstName: "Siva",
  lastName: "Gnanam",
  email: "sivaprakasam.gnanam@swishx.com",
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
    { id: "iv1", email: "nadia.hassan@velmora.com", role: "Marketing",   seniority: "Manager",   permissions: [...ROLE_PERMISSIONS["Marketing"]],   invitedAt: "2 days ago" },
    // Invited without View & comment — a deliberate narrowing at invite time.
    // Couldn't find the email and asked for the link again; still valid.
    { id: "iv2", email: "tom.becker@velmora.com",   role: "Field Force", seniority: "Associate", permissions: fromSpec({ library: "view", brand: "view" }), invitedAt: "5 days ago", resendRequestedAt: "this morning" },
    { id: "iv3", email: "grace.liu@velmora.com",    role: "Design",      seniority: "Associate", permissions: [...ROLE_PERMISSIONS["Design"]],      invitedAt: "16 days ago", expired: true },
  ],
  joinRequests: [
    { id: "jr1", name: "Elena Sokolova", email: "elena.s@velmora.com", requestedAt: "Yesterday" },
  ],
  roles: [...DEFAULT_ROLES, { name: "Finance", permissions: FINANCE, system: false }],
  addRole: (name, permissions) => set((s) => ({
    roles: [...s.roles, { name, permissions: [...permissions], system: false }],
  })),
  updateRole: (name, next) => set((s) => {
    const old = s.roles.find((r) => r.name === name);
    if (!old) return s;
    const same = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((x) => b.includes(x));
    return {
      roles: s.roles.map((r) => (r.name === name ? { ...r, name: next.name, permissions: [...next.permissions] } : r)),
      /* Members on the role's old defaults follow it; anyone customised keeps their own set. */
      members: s.members.map((m) =>
        m.role !== name ? m : { ...m, role: next.name, permissions: same(m.permissions, old.permissions) ? [...next.permissions] : m.permissions }
      ),
      invites: s.invites.map((i) => (i.role === name ? { ...i, role: next.name } : i)),
      chains: s.chains.map((c) => ({ ...c, stages: c.stages.map((st) => (st.role === name ? { ...st, role: next.name } : st)) })),
    };
  }),
  removeRole: (name) => set((s) => ({ roles: s.roles.filter((r) => r.name !== name || r.locked) })),
  setMemberRole: (id, role) => set((s) => ({
    // Changing role re-seeds permissions — the role is the starting point.
    members: s.members.map((m) => (m.id === id ? { ...m, role, permissions: rolePermissions(s.roles, role) } : m)),
  })),
  setMemberSeniority: (id, seniority) => set((s) => ({
    members: s.members.map((m) => (m.id === id ? { ...m, seniority } : m)),
  })),
  setMemberLevel: (id, area, level) => set((s) => ({
    members: s.members.map((m) => (m.id === id ? { ...m, permissions: setLevel(m.permissions, area, level) } : m)),
  })),
  resetMemberPermissions: (id) => set((s) => ({
    members: s.members.map((m) => (m.id === id ? { ...m, permissions: rolePermissions(s.roles, m.role) } : m)),
  })),
  setMemberStatus: (id, status, reason) => set((s) => ({
    members: s.members.map((m) => (m.id === id ? { ...m, status, deactivationReason: status === "deactivated" ? reason : undefined } : m)),
  })),
  sendInvites: (emails, role, seniority, permissions) => set((s) => {
    /* Someone already in another of the organisation's workspaces is added
       straight away with this workspace's role; nobody signs up twice. */
    const people = orgPeople(s);
    const known = emails.map((e) => people.find((p) => p.email.toLowerCase() === e.toLowerCase())).filter((p): p is Member => !!p && !s.members.some((m) => m.id === p.id));
    const fresh = emails.filter((e) => !people.some((p) => p.email.toLowerCase() === e.toLowerCase()));
    return {
      members: [...s.members, ...known.map((p) => ({ ...p, role, seniority, permissions: [...permissions], status: "active" as const, lastActive: "Added just now", deactivationReason: undefined }))],
      invites: [...s.invites, ...fresh.map((email) => ({
        id: uid(), email, role, seniority, permissions: [...permissions], invitedAt: "Just now",
      }))],
    };
  }),
  revokeInvite: (id) => set((s) => ({ invites: s.invites.filter((i) => i.id !== id) })),
  resendInvite: (id) => set((s) => ({
    invites: s.invites.map((i) => (i.id === id ? { ...i, invitedAt: "resent just now", expired: false, resendRequestedAt: undefined } : i)),
  })),
  requestInviteResend: (inviteId) => set((s) => {
    const mark = (list: PendingInvite[]) => list.map((i) => (i.id === inviteId ? { ...i, resendRequestedAt: "just now" } : i));
    const where = findInvite(s, inviteId);
    if (!where) return s;
    if (where.workspaceId === s.workspaceId) return { invites: mark(s.invites) };
    const slice = s.stash[where.workspaceId];
    return { stash: { ...s.stash, [where.workspaceId]: { ...slice, invites: mark(slice.invites) } } };
  }),
  acceptInvite: (inviteId, name) => {
    const s = get();
    const where = findInvite(s, inviteId);
    if (!where || where.invite.expired) return false;
    const { invite, workspaceId } = where;
    const member: Member = {
      id: `m${uid()}`, name: name.trim(), email: invite.email, role: invite.role, seniority: invite.seniority,
      permissions: [...invite.permissions], status: "active", lastActive: "Online now",
    };
    if (workspaceId === s.workspaceId) {
      set({ invites: s.invites.filter((i) => i.id !== inviteId), members: [...s.members, member] });
    } else {
      const slice = s.stash[workspaceId];
      set({ stash: { ...s.stash, [workspaceId]: { ...slice, invites: slice.invites.filter((i) => i.id !== inviteId), members: [...slice.members, member] } } });
    }
    get().signInAs(member.id, workspaceId);
    return true;
  },
  requestToJoin: (workspaceId, name, email, note) => {
    const req: JoinRequest = { id: uid(), name: name.trim(), email, requestedAt: "Just now", note: note?.trim() || undefined };
    set((s) => workspaceId === s.workspaceId
      ? { joinRequests: [...s.joinRequests, req] }
      : s.stash[workspaceId] ? { stash: { ...s.stash, [workspaceId]: { ...s.stash[workspaceId], joinRequests: [...s.stash[workspaceId].joinRequests, req] } } } : s);
  },
  signInAs: (personId, preferredWorkspace) => {
    const s = get();
    const mine = listWorkspaces(s, personId).filter((w) => w.me && !w.archived);
    const target = mine.find((w) => w.id === preferredWorkspace) ?? mine.find((w) => w.current) ?? mine[0];
    if (!target) return;
    set({ signedInId: personId });
    if (target.current) { get().setCurrentUser(personId); return; }
    /* Switching needs the person to be a member there, so become them first. */
    set({ currentUserId: personId });
    get().switchWorkspace(target.id);
    get().setCurrentUser(personId);
  },
  resolveJoinRequest: (id, accept, role = "Read only", seniority = "Associate") => set((s) => {
    const req = s.joinRequests.find((r) => r.id === id);
    if (!req) return s;
    return {
      joinRequests: s.joinRequests.filter((r) => r.id !== id),
      members: accept
        ? [...s.members, { id: uid(), name: req.name, email: req.email, role, seniority,
            permissions: rolePermissions(s.roles, role), status: "active" as const, lastActive: "Just now" }]
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
  topUpRequests: [],
  requestTopUp: () => set((s) => (
    s.topUpRequests.some((r) => r.by === s.currentUserId) ? s
      : { topUpRequests: [...s.topUpRequests, { id: uid(), by: s.currentUserId, at: "Just now" }] }
  )),
  dismissTopUpRequest: (id) => set((s) => ({ topUpRequests: s.topUpRequests.filter((r) => r.id !== id) })),
  topUp: (credits, amount) => set((s) => {
    const by = s.members.find((m) => m.id === s.currentUserId)?.name ?? "You";
    return {
      creditBalance: s.creditBalance + credits,
      topUps: [{ id: uid(), at: "Just now", amount, credits, purchasedBy: by, reference: `TXN-${Math.floor(90000 + Math.random() * 9999)}`, status: "paid" as const }, ...s.topUps],
      topUpRequests: [],
    };
  }),

  pronunciations: PRONUNCIATIONS,
  addPronunciation: (p) => set((s) => ({
    pronunciations: [{ ...p, id: uid(), addedBy: s.members.find((m) => m.id === s.currentUserId)?.name ?? "You", addedAt: "Just now" }, ...s.pronunciations],
  })),
  updatePronunciation: (id, patch) => set((s) => ({
    pronunciations: s.pronunciations.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  })),
  removePronunciation: (id) => set((s) => ({ pronunciations: s.pronunciations.filter((p) => p.id !== id) })),
}));

if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  (window as unknown as { __swishxSettings?: typeof useSettingsStore }).__swishxSettings = useSettingsStore;
}

/** Everyone in any of the organisation's workspaces, once each. */
export function orgPeople(s: Pick<SettingsState, "members" | "stash">): Member[] {
  const out = new Map<string, Member>();
  for (const m of s.members) out.set(m.id, m);
  for (const slice of Object.values(s.stash)) for (const m of slice.members) if (!out.has(m.id)) out.set(m.id, m);
  return [...out.values()];
}

/** The organisation's workspaces, the current one first, with this person's place in each. */
export function listWorkspaces(s: SettingsState, personId = s.currentUserId): WorkspaceSummary[] {
  const all: WorkspaceSlice[] = [pickSlice(s), ...Object.values(s.stash)];
  return all.map((w) => ({
    id: w.workspaceId,
    name: w.workspaceName,
    memberCount: w.members.filter((m) => m.status === "active").length,
    creditBalance: w.creditBalance,
    archived: s.archivedWorkspaceIds.includes(w.workspaceId),
    current: w.workspaceId === s.workspaceId,
    me: w.members.find((m) => m.id === personId && m.status === "active"),
  }));
}

/** An invite in any of the organisation's workspaces. */
export function findInvite(s: Pick<SettingsState, "invites" | "stash" | "workspaceId">, inviteId: string) {
  const here = s.invites.find((i) => i.id === inviteId);
  if (here) return { invite: here, workspaceId: s.workspaceId };
  for (const [workspaceId, slice] of Object.entries(s.stash)) {
    const invite = slice.invites.find((i) => i.id === inviteId);
    if (invite) return { invite, workspaceId };
  }
  return undefined;
}

/** Same, by the invited address. */
export function findInviteByEmail(s: Pick<SettingsState, "invites" | "stash" | "workspaceId">, email: string) {
  const e = email.trim().toLowerCase();
  const all = [{ id: s.workspaceId, invites: s.invites }, ...Object.entries(s.stash).map(([id, w]) => ({ id, invites: w.invites }))];
  for (const w of all) {
    const invite = w.invites.find((i) => i.email.toLowerCase() === e);
    if (invite) return { invite, workspaceId: w.id };
  }
  return undefined;
}

/** A workspace's name, wherever it is. */
export function workspaceNameOf(s: Pick<SettingsState, "workspaceId" | "workspaceName" | "stash">, id: string) {
  return id === s.workspaceId ? s.workspaceName : s.stash[id]?.workspaceName ?? "the workspace";
}

/** The chain new creators get until an admin sets one for them. */
export const DEFAULT_CHAIN_ID = "__default";

/** A creator's chain: their own if an admin set one (even empty), otherwise the default. */
export function chainStagesFor(s: Pick<SettingsState, "chains">, memberId: string) {
  return (s.chains.find((c) => c.memberId === memberId) ?? s.chains.find((c) => c.memberId === DEFAULT_CHAIN_ID))?.stages ?? [];
}
