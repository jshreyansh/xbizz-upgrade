/** Domain types for the settings surface. Mock-only: there is no API layer. */

/** The roles a workspace starts with. Admins can rename, re-permission,
    add and remove roles in Role configuration, so this is only the seed. */
export const ROLES = [
  "Admin", "Marketing", "Design", "Field Force",
  "Medical reviewer", "Legal reviewer", "Regulatory reviewer",
  "Read only", "CXO",
] as const;
/** A role's name. Roles are workspace data, defined by an admin. */
export type Role = string;

/** Ordered low to high — a stage's seniority is a FLOOR, so the index matters. */
export const SENIORITY = ["Intern", "Associate", "Manager", "Lead", "Director", "VP"] as const;
export type Seniority = (typeof SENIORITY)[number];

/**
 * What a member can do, for a pharma content team.
 *
 * Built around what people do with content rather than which screens exist:
 * creators make, edit and publish (and so can share and comment); everyone
 * else views and comments; reviewers also sign off. The two libraries are
 * separate because the Claims Library is the approved source of truth, and
 * changing it changes what every asset may say. MLR review itself is
 * SwishX's automated check, so it is not a permission. Members with none
 * still see published content.
 */
export const PERMISSIONS = [
  { id: "create",    label: "Create, edit & publish content", trailing: "Studio and the Content Library: make, edit and publish, then share, download or send on" },
  { id: "comment",   label: "View & comment",                 trailing: "Open anything in the Content Library and comment, without editing" },
  { id: "approve",   label: "Approve",                        trailing: "Sign off or reject as a reviewer in an approval chain" },
  { id: "products",  label: "Manage Product Library",         trailing: "Products, dossiers, packshots and brand assets" },
  { id: "claims",    label: "Manage Claims Library",          trailing: "Add, edit and retire approved claims and their references" },
  { id: "analytics", label: "Analytics",                      trailing: "The Insights section" },
  { id: "billing",   label: "Billing & credits",              trailing: "Plans, top-ups and purchases. Reading stays open to everyone" },
  { id: "admin",     label: "Admin",                          trailing: "Team, roles, brand kit, integrations and approval-chain setup" },
] as const;
export type PermissionId = (typeof PERMISSIONS)[number]["id"];

/** Permissions that come with another: you can't create or approve what you can't open. */
export const INCLUDED_BY: Partial<Record<PermissionId, PermissionId[]>> = {
  comment: ["create", "approve"],
};

/** Which held permission brings this one along, if any. */
export function includedBy(perms: readonly PermissionId[], id: PermissionId): PermissionId | undefined {
  return INCLUDED_BY[id]?.find((p) => perms.includes(p));
}

const SHORT: Partial<Record<PermissionId, string>> = { create: "Create", approve: "Approve" };

/** "Included with Create", when another held permission brings this one along. */
export function includedNote(perms: readonly PermissionId[], id: PermissionId): string | undefined {
  const by = includedBy(perms, id);
  return by ? `Included with ${SHORT[by] ?? by}` : undefined;
}

/** A set with everything it implies added, so the stored set always tells the truth. */
export function withIncluded(perms: readonly PermissionId[]): PermissionId[] {
  const out = new Set(perms);
  for (const [id, parents] of Object.entries(INCLUDED_BY) as [PermissionId, PermissionId[]][]) {
    if (parents.some((p) => out.has(p))) out.add(id);
  }
  return PERMISSIONS.map((p) => p.id).filter((id) => out.has(id));
}

/** Toggle one permission, keeping included ones in step. */
export function togglePermission(perms: readonly PermissionId[], id: PermissionId): PermissionId[] {
  if (includedBy(perms, id)) return [...perms]; // locked on by another
  return withIncluded(perms.includes(id) ? perms.filter((x) => x !== id) : [...perms, id]);
}

/**
 * What each role starts with. Choosing a role seeds these; a member may then
 * differ, and that difference is theirs alone — it never edits the role for
 * anyone else.
 */
export const ROLE_PERMISSIONS: Record<(typeof ROLES)[number], PermissionId[]> = {
  "Admin":               ["create", "comment", "approve", "products", "claims", "analytics", "billing", "admin"],
  "Marketing":           ["create", "comment", "products", "analytics"],
  "Design":              ["create", "comment"],
  "Field Force":         ["comment", "analytics"],
  "Medical reviewer":    ["comment", "approve", "claims"],
  "Legal reviewer":      ["comment", "approve"],
  "Regulatory reviewer": ["comment", "approve", "claims"],
  "Read only":           [],
  "CXO":                 ["comment", "analytics", "billing"],
};

/** A role as an admin defines it: a name and the permissions it seeds. */
export interface RoleDef {
  name: string;
  permissions: PermissionId[];
  /** Came with the workspace. Still editable and removable, except Admin. */
  system: boolean;
  /** Admin can't be removed or lose admin controls: someone has to manage roles. */
  locked?: boolean;
}

export const DEFAULT_ROLES: RoleDef[] = ROLES.map((name) => ({
  name,
  permissions: [...ROLE_PERMISSIONS[name]],
  system: true,
  locked: name === "Admin",
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
}

export interface JoinRequest {
  id: string;
  name: string;
  email: string;
  requestedAt: string;
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
  /** All named approvers must sign off, or any one is enough. */
  requireAll: boolean;
  onReject: "draft" | "previous";
}

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
