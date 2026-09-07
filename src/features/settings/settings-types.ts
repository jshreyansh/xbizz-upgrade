/** Domain types for the settings surface. Mock-only: there is no API layer. */

export const ROLES = [
  "Admin", "Marketing", "Design", "Field Force",
  "Medical reviewer", "Legal reviewer", "Regulatory reviewer",
  "Read only", "CXO",
] as const;
export type Role = (typeof ROLES)[number];

/** Ordered low to high — a stage's seniority is a FLOOR, so the index matters. */
export const SENIORITY = ["Intern", "Associate", "Manager", "Lead", "Director", "VP"] as const;
export type Seniority = (typeof SENIORITY)[number];

export const PERMISSIONS = [
  { id: "studio",    label: "Studio access",                trailing: "Create and edit video, creative and infographic assets" },
  { id: "admin",     label: "Admin controls",                trailing: "Workspace, brand kit, team, integrations, approval chains" },
  { id: "libraries", label: "Libraries — add, edit, update", trailing: "Claims, Products and Content" },
  { id: "analytics", label: "Analytics",                     trailing: "The Insights section" },
  { id: "comment",   label: "Comment on drafts & published", trailing: "Commenting without edit rights" },
  { id: "billing",   label: "Billing, plans & top-ups",      trailing: "Purchasing. Reading stays open to everyone" },
  { id: "approvals", label: "Approval flows",                trailing: "Act as an approver in a chain" },
] as const;
export type PermissionId = (typeof PERMISSIONS)[number]["id"];

/**
 * What each role starts with. Choosing a role seeds these; a member may then
 * differ, and that difference is theirs alone — it never edits the role for
 * anyone else.
 */
export const ROLE_PERMISSIONS: Record<Role, PermissionId[]> = {
  "Admin":               ["studio", "admin", "libraries", "analytics", "comment", "billing", "approvals"],
  "Marketing":           ["studio", "libraries", "analytics", "comment"],
  "Design":              ["studio", "libraries", "comment"],
  "Field Force":         ["analytics", "comment"],
  "Medical reviewer":    ["comment", "approvals"],
  "Legal reviewer":      ["comment", "approvals"],
  "Regulatory reviewer": ["comment", "approvals"],
  "Read only":           [],
  "CXO":                 ["analytics", "billing", "comment"],
};

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

export interface BrandKit {
  logos: Partial<Record<LogoSlot, { fileName: string; size: string }>>;
  /** Order IS the role: 0 primary, 1 secondary, 2 tertiary. */
  typefaces: Typeface[];
  brandColor: string;
  accents: string[];
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
