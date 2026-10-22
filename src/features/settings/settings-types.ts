/** Domain types for the settings surface. Mock-only: there is no API layer. */

/** The roles a workspace starts with. Workspace admins can rename, re-permission,
    add and remove roles in Role configuration, so this is only the seed. */
export const ROLES = [
  "Workspace admin", "Marketing", "Design", "Field Force",
  "Medical reviewer", "Legal reviewer", "Regulatory reviewer",
  "Read only",
] as const;
/** A role's name. Roles are workspace data, defined by a workspace admin. */
export type Role = string;

/** Ordered low to high — a stage's seniority is a FLOOR, so the index matters. */
export const SENIORITY = ["Intern", "Associate", "Manager", "Lead", "Director", "VP"] as const;
export type Seniority = (typeof SENIORITY)[number];

/**
 * What a member can do, as an access level per area of the app, the way a
 * SharePoint site has Read / Contribute / Full control. Each area is one row
 * with a level; nothing is a loose checkbox with hidden dependencies.
 *
 * Under the hood a level is a small set of tokens (Library: Manage is
 * "library" + "products"), and every gate in the app asks for a token. The
 * tokens never appear in the UI; the areas and levels do.
 *
 * Organisation admin is not here: it is company-wide, set on the person in
 * Settings → Organisation, while this is per workspace.
 */
export const TOKENS = [
  "comment", "create", "approve",
  "library", "products",
  "brand", "brandManage",
  "pron", "pronManage",
  "integrations", "integrationsManage",
  "chains", "chainsManage",
  "teamManage",
  "analytics",
  "billingView", "billing",
  "admin",
] as const;
export type PermissionId = (typeof TOKENS)[number];

export type LevelId = "none" | "view" | "comment" | "create" | "approve" | "manage" | "off" | "on";

export interface AreaLevel {
  id: LevelId;
  label: string;
  /** What this level adds, in a few words. */
  hint: string;
  tokens: PermissionId[];
}

export interface Area {
  id: "content" | "review" | "library" | "brand" | "pronunciations" | "integrations" | "chains" | "team" | "analytics" | "billing" | "admin";
  label: string;
  trailing: string;
  /** Low to high. */
  levels: AreaLevel[];
}
export type AreaId = Area["id"];

const NONE: AreaLevel = { id: "none", label: "None", hint: "Hidden", tokens: [] };

export const AREAS: Area[] = [
  { id: "content", label: "Content", trailing: "Published content is open to everyone; this is what else they can do with it", levels: [
    { id: "view", label: "View", hint: "See published content", tokens: [] },
    { id: "comment", label: "Comment", hint: "Plus comment on it", tokens: ["comment"] },
    { id: "create", label: "Create", hint: "Plus make, edit, submit for review and share", tokens: ["comment", "create"] },
  ] },
  { id: "review", label: "MLR review", trailing: "Be a reviewer on an approval-chain stage: approve or request changes", levels: [
    NONE,
    { id: "approve", label: "Approve", hint: "Review and decide in MLR Review", tokens: ["approve"] },
  ] },
  { id: "library", label: "Product & Claims Library", trailing: "Products, claims, Brand Dossiers and attachments", levels: [
    NONE,
    { id: "view", label: "View", hint: "Browse, read-only", tokens: ["library"] },
    { id: "manage", label: "Manage", hint: "Add, edit and archive", tokens: ["library", "products"] },
  ] },
  { id: "brand", label: "Brand kit", trailing: "The workspace's design standard for every asset, and each product's own kit", levels: [
    NONE,
    { id: "view", label: "View", hint: "Logos, type and colours, read-only", tokens: ["brand"] },
    { id: "manage", label: "Manage", hint: "Change them", tokens: ["brand", "brandManage"] },
  ] },
  { id: "pronunciations", label: "Pronunciations", trailing: "How the AI voice says names and terms it gets wrong", levels: [
    NONE,
    { id: "view", label: "View", hint: "See the list", tokens: ["pron"] },
    { id: "manage", label: "Manage", hint: "Add and fix entries", tokens: ["pron", "pronManage"] },
  ] },
  { id: "integrations", label: "Integrations", trailing: "Veeva, Teams and iMessage", levels: [
    NONE,
    { id: "view", label: "View", hint: "See what's connected and use it", tokens: ["integrations"] },
    { id: "manage", label: "Manage", hint: "Connect, configure, set channel access", tokens: ["integrations", "integrationsManage"] },
  ] },
  { id: "chains", label: "Approval chains", trailing: "Who reviews whose work, in Compliance & MLR", levels: [
    NONE,
    { id: "view", label: "View", hint: "Your own chain, or the chains you review in", tokens: ["chains"] },
    { id: "manage", label: "Manage", hint: "Set up everyone's chains", tokens: ["chains", "chainsManage"] },
  ] },
  { id: "team", label: "Team", trailing: "Everyone can see who's in the workspace", levels: [
    { id: "view", label: "View", hint: "The member directory", tokens: [] },
    { id: "manage", label: "Manage", hint: "Invite, set roles, handle requests, deactivate", tokens: ["teamManage"] },
  ] },
  { id: "analytics", label: "Analytics", trailing: "The Insights section", levels: [
    NONE,
    { id: "view", label: "View", hint: "See performance", tokens: ["analytics"] },
  ] },
  { id: "billing", label: "Billing & credits", trailing: "The workspace's own plan and credit pool", levels: [
    NONE,
    { id: "view", label: "View", hint: "Balance and usage; ask for a top-up", tokens: ["billingView"] },
    { id: "manage", label: "Manage", hint: "Top up, plan, payment, invoices", tokens: ["billingView", "billing"] },
  ] },
  { id: "admin", label: "Workspace admin", trailing: "Manage on everything above, plus the workspace profile", levels: [
    { id: "off", label: "Off", hint: "", tokens: [] },
    { id: "on", label: "On", hint: "Full access in this workspace", tokens: ["admin"] },
  ] },
];

const areaTokens = (area: Area) => [...new Set(area.levels.flatMap((l) => l.tokens))];
const top = (area: Area) => area.levels[area.levels.length - 1];

/**
 * The rules, applied after every change so a stored set always tells the
 * truth: Manage includes View; Create brings at least View on what it builds
 * from; Approve brings Comment and at least View on what it checks against;
 * Workspace admin is Manage everywhere.
 */
export function normalize(perms: readonly PermissionId[]): PermissionId[] {
  const out = new Set(perms);
  if (out.has("admin")) for (const area of AREAS) top(area).tokens.forEach((t) => out.add(t));
  if (out.has("create")) ["comment", "library", "brand", "pron", "chains"].forEach((t) => out.add(t as PermissionId));
  if (out.has("approve")) ["comment", "library", "chains"].forEach((t) => out.add(t as PermissionId));
  const implies: [PermissionId, PermissionId][] = [
    ["products", "library"], ["brandManage", "brand"], ["pronManage", "pron"],
    ["integrationsManage", "integrations"], ["chainsManage", "chains"], ["billing", "billingView"],
  ];
  for (const [hi, lo] of implies) if (out.has(hi)) out.add(lo);
  return TOKENS.filter((t) => out.has(t));
}

export function areaById(id: AreaId): Area {
  return AREAS.find((a) => a.id === id)!;
}

/** The highest level of an area this set reaches. */
export function levelOf(perms: readonly PermissionId[], areaId: AreaId): AreaLevel {
  const area = areaById(areaId);
  return [...area.levels].reverse().find((l) => l.tokens.every((t) => perms.includes(t))) ?? area.levels[0];
}

/** Set one area's level; the rules then bring along whatever it needs. */
export function setLevel(perms: readonly PermissionId[], areaId: AreaId, level: LevelId): PermissionId[] {
  const area = areaById(areaId);
  const drop = new Set(areaTokens(area));
  const kept = perms.filter((t) => !drop.has(t));
  return normalize([...kept, ...(area.levels.find((l) => l.id === level)?.tokens ?? [])]);
}

/** The lowest level an area can go to, given the rest, and what holds it there. */
export function floorOf(perms: readonly PermissionId[], areaId: AreaId): { level: AreaLevel; because?: string } {
  const area = areaById(areaId);
  const others = perms.filter((t) => !areaTokens(area).includes(t));
  const level = levelOf(normalize(others), areaId);
  if (level.id === area.levels[0].id) return { level };
  const because = others.includes("admin") ? "Workspace admin" : others.includes("create") ? "Create" : others.includes("approve") ? "Approve" : undefined;
  return { level, because };
}

/** A role's access written as a table, the way the defaults were agreed. */
export type AccessSpec = Partial<Record<AreaId, LevelId>>;

export function fromSpec(spec: AccessSpec): PermissionId[] {
  let perms: PermissionId[] = [];
  for (const [areaId, level] of Object.entries(spec) as [AreaId, LevelId][]) perms = setLevel(perms, areaId, level);
  return normalize(perms);
}

/** "Content: Create" — the name of the level a token stands for, for explanations. */
export function tokenLabel(token: PermissionId): string {
  for (const area of AREAS) {
    const level = area.levels.find((l) => l.tokens.includes(token) && l.tokens[l.tokens.length - 1] === token);
    if (level) return area.id === "admin" ? "Workspace admin" : `${area.label}: ${level.label}`;
  }
  return token;
}

/** A short line for lists: the areas above their lowest level. */
export function accessHeadline(perms: readonly PermissionId[]): string {
  if (perms.includes("admin")) return "Full access";
  const parts = AREAS.filter((a) => a.id !== "admin").flatMap((a) => {
    const l = levelOf(perms, a.id);
    if (l.id === a.levels[0].id) return [];
    if (a.id === "content") return [l.label];
    if (a.id === "review") return ["Approve"];
    return [`${a.id === "library" ? "Library" : a.label} ${l.label.toLowerCase()}`];
  });
  return parts.length ? parts.join(" · ") : "View published content";
}

/**
 * What each role starts with, as agreed. Choosing a role seeds these; a member
 * may then differ, and that difference is theirs alone.
 */
export const ROLE_ACCESS: Record<(typeof ROLES)[number], AccessSpec> = {
  "Workspace admin":     { admin: "on" },
  "Marketing":           { content: "create", library: "manage", brand: "manage", pronunciations: "manage", integrations: "view", chains: "view", analytics: "view", billing: "view" },
  "Design":              { content: "create", library: "view", brand: "manage", pronunciations: "manage", integrations: "view", chains: "view", billing: "view" },
  "Medical reviewer":    { content: "comment", review: "approve", library: "manage", brand: "view", pronunciations: "manage", integrations: "view", chains: "view" },
  "Legal reviewer":      { content: "comment", review: "approve", library: "manage", brand: "view", pronunciations: "view", integrations: "view", chains: "view" },
  "Regulatory reviewer": { content: "comment", review: "approve", library: "manage", brand: "view", pronunciations: "manage", integrations: "view", chains: "manage" },
  "Field Force":         { content: "comment", library: "view", brand: "view" },
  "Read only":           {},
};

export const ROLE_PERMISSIONS = Object.fromEntries(
  Object.entries(ROLE_ACCESS).map(([role, spec]) => [role, fromSpec(spec)])
) as Record<(typeof ROLES)[number], PermissionId[]>;

/** Token labels, for the few places that name one permission (a page's explanation). */
export const PERMISSIONS = TOKENS.map((id) => ({ id, label: tokenLabel(id) }));

/** A role as an admin defines it: a name and the permissions it seeds. */
export interface RoleDef {
  name: string;
  permissions: PermissionId[];
  /** Came with the workspace. Still editable and removable, except Admin. */
  system: boolean;
  /** Workspace admin can't be removed or lose admin: someone has to manage roles. */
  locked?: boolean;
}

export const DEFAULT_ROLES: RoleDef[] = ROLES.map((name) => ({
  name,
  permissions: [...ROLE_PERMISSIONS[name]],
  system: true,
  locked: name === "Workspace admin",
}));

/** What a role seeds, by name; nothing for a role that no longer exists. */
export function rolePermissions(roles: RoleDef[], name: Role): PermissionId[] {
  return [...(roles.find((r) => r.name === name)?.permissions ?? [])];
}

export type MemberStatus = "active" | "invited" | "deactivated";

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  seniority: Seniority;
  permissions: PermissionId[];
  status: MemberStatus;
  lastActive: string;
  deactivationReason?: string;
}

export interface PendingInvite {
  id: string;
  email: string;
  role: Role;
  seniority: Seniority;
  /** What they arrive with — chosen at invite time, not on first sign-in. */
  permissions: PermissionId[];
  invitedAt: string;
  /** Links last 14 days; Resend issues a fresh one. */
  expired?: boolean;
  /** The invitee asked for a new link (lost the email, or it expired). Cleared by Resend. */
  resendRequestedAt?: string;
  /** Member id of whoever sent it. */
  invitedBy?: string;
}

export interface JoinRequest {
  id: string;
  name: string;
  email: string;
  requestedAt: string;
  /** What they wrote to the admins, if anything. */
  note?: string;
}

/** One stage in a person's chain. Draft and Approved are the implicit ends. */
export interface ApprovalStage {
  id: string;
  name: string;
  role: Role;
  /** Within that role: a named person, a seniority FLOOR, or anyone. */
  narrowTo:
    | { kind: "anyone" }
    | { kind: "person"; memberId: string }
    | { kind: "seniority"; floor: Seniority };
}

/*
 * A rejection always goes back to the creator, and the changed version goes
 * through the whole chain again: every approver approves exactly what ships,
 * because a fix asked for at one step can change what an earlier one approved.
 * There is deliberately no per-step "earlier approvals stand" option.
 */

/** One chain per person. Admins CRUD every chain; a user sees only their own. */
export interface ApprovalChain {
  memberId: string;
  stages: ApprovalStage[];
}

export interface Typeface {
  id: string;
  name: string;
  source: "google" | "uploaded";
}

export type LogoSlot =
  | "lockup-light" | "lockup-dark"
  | "mark-light" | "mark-dark"
  | "animated" | "favicon";

/** The four palette roles. Named for where each one lands, not by hue. */
export const COLOR_ROLES = [
  { id: "primary", label: "Primary",            trailing: "Buttons, links, the brand mark" },
  { id: "accent",  label: "Accent",             trailing: "Highlights and secondary emphasis" },
  { id: "callout", label: "Callout background", trailing: "Tinted panels and evidence blocks" },
  { id: "text",    label: "Text",               trailing: "Body copy on light grounds" },
] as const;
export type ColorRole = (typeof COLOR_ROLES)[number]["id"];

export interface BrandKit {
  logos: Partial<Record<LogoSlot, { fileName: string; size: string }>>;
  /** Order IS the role: 0 primary, 1 secondary, 2 tertiary. */
  typefaces: Typeface[];
  colors: Record<ColorRole, string>;
}

export interface NotificationPref {
  key: string;
  label: string;
  email: boolean;
  inApp: boolean;
  teams: boolean;
  inAppSupported: boolean;
}

export type IntegrationId = "veeva" | "teams" | "imessage";
export type IntegrationStatus = "connected" | "not-connected" | "verifying" | "error";

export interface IntegrationLog {
  id: string;
  at: string;
  direction: "pull" | "push" | "in" | "out";
  object: string;
  records?: number;
  status: "ok" | "failed";
  detail?: string;
}

export interface TeamsChannel {
  id: string;
  name: string;
  canRead: boolean;
  canSend: boolean;
}

export interface Pronunciation {
  id: string;
  term: string;
  phonetic: string;
  notes: string;
  addedBy: string;
  addedAt: string;
}

export interface UsageEntry {
  id: string;
  at: string;
  description: string;
  person: string;
  assetId?: string;
  assetTitle?: string;
  credits: number;
  balanceAfter: number;
}

export interface TopUpRequest {
  id: string;
  /** Member id of whoever asked. */
  by: string;
  at: string;
}

export interface TopUpEntry {
  id: string;
  at: string;
  amount: string;
  credits: number;
  purchasedBy: string;
  reference: string;
  status: "paid" | "pending" | "failed";
}

export interface Invoice {
  id: string;
  number: string;
  at: string;
  period: string;
  amount: string;
  status: "paid" | "due" | "overdue" | "refunded";
  lines: { description: string; amount: string }[];
}

export type ThemeChoice = "light" | "dark" | "system";

export const LANGUAGES = [
  "English (United States)",
  "Spanish",
  "Chinese (Mandarin / Cantonese)",
  "German",
  "French",
] as const;
export type Language = (typeof LANGUAGES)[number];

/** Where a workspace ships content; each sets the rules claims are checked against. */
export const MARKETS = [
  "United States · FDA", "European Union · EMA", "UK", "Japan", "India", "Australia", "Brazil",
] as const;

export const THERAPY_AREAS = [
  "Dermatology", "Cardiology", "Oncology", "Immunology",
  "Nephrology", "Endocrinology", "Neurology", "Respiratory",
] as const;

export const REGIONS = ["United States", "European Union", "United Kingdom", "India", "Japan", "Global"] as const;

/** Free mail providers. SwishX is for company accounts, so these can't sign in. */
const PERSONAL_DOMAINS = [
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.in", "outlook.com", "hotmail.com", "live.com",
  "msn.com", "icloud.com", "me.com", "aol.com", "proton.me", "protonmail.com", "gmx.com", "zoho.com", "rediffmail.com",
];

export function emailDomain(email: string): string {
  return email.trim().toLowerCase().split("@")[1] ?? "";
}

export function isPersonalEmail(email: string): boolean {
  return PERSONAL_DOMAINS.includes(emailDomain(email));
}

/**
 * What a set of permissions opens up across the app, in the words a member
 * would use: the same checks the sidebar, Home, studios and settings make.
 */
export function roleSees(perms: readonly PermissionId[]): { sees: string[]; cant: string[] } {
  const lv = (id: AreaId) => levelOf(perms, id).id;
  const sees = [
    "Home, published content in the Content Library, and the Team directory",
    lv("content") === "create" ? "Video and Docs studios, Characters and the AI co-workers: make, edit, submit for review, share"
      : lv("content") === "comment" ? "Comments on anything they can open" : null,
    lv("review") === "approve" ? "MLR Review: the queue, approve or request changes" : lv("content") === "create" ? "MLR Review: their own submissions" : null,
    lv("library") === "manage" ? "Product & Claims Library and Brand Dossiers: add, edit, archive" : lv("library") === "view" ? "Product & Claims Library and Brand Dossiers: view" : null,
    lv("brand") === "manage" ? "Brand kits (workspace and products): edit" : lv("brand") === "view" ? "Brand kits: view" : null,
    lv("pronunciations") === "manage" ? "Pronunciations: add and fix" : lv("pronunciations") === "view" ? "Pronunciations: view" : null,
    lv("integrations") === "manage" ? "Integrations: connect and configure" : lv("integrations") === "view" ? "Integrations: see and use what's connected" : null,
    lv("chains") === "manage" ? "Approval chains: set up everyone's" : lv("chains") === "view" ? "Approval chains: their own, or the ones they review in" : null,
    lv("team") === "manage" ? "Team: invite, roles, requests" : null,
    lv("analytics") === "view" ? "Analytics" : null,
    lv("billing") === "manage" ? "Billing: top up, plan, payment, invoices" : lv("billing") === "view" ? "Billing: balance and usage, ask for a top-up" : null,
    lv("admin") === "on" ? "The workspace profile, and full control of everything above" : null,
  ].filter((x): x is string => !!x);
  const cant = [
    lv("content") !== "create" && "Studios and editing",
    lv("review") !== "approve" && lv("content") !== "create" && "MLR Review",
    lv("library") === "none" && "Product & Claims Library",
    lv("analytics") === "none" && "Analytics",
    lv("billing") === "none" && "Billing",
  ].filter((x): x is string => !!x);
  return { sees, cant };
}
