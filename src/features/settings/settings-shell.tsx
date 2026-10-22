"use client";

import { PageHeading } from "@/components/patterns/page-heading";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TabNav, type TabNavItem } from "@/components/patterns/tab-nav";
import { useSettingsStore } from "@/features/settings/settings-store";
import { useCan } from "@/features/settings/view-as";
import type { PermissionId } from "@/features/settings/settings-types";

/**
 * The settings surface, inside the app shell rather than beside it — it is a
 * section of the product, not a separate destination, so it keeps the sidebar
 * and topbar like every other screen.
 *
 * Tabs are filtered rather than disabled. A disabled tab tells a non-admin
 * that something exists which they cannot have, which only generates a support
 * question; an absent tab tells them nothing, which is correct.
 */
export interface SettingsSection {
  id: string;
  label: string;
  blurb: string;
  adminOnly?: boolean;
  /** Organisation admins, whatever their role in this workspace. */
  orgAdminOnly?: boolean;
  /** Shown to anyone holding one of these (Admin holds them all). */
  anyOf?: PermissionId[];
}

export const SETTINGS_SECTIONS: SettingsSection[] = [
  { id: "organisation",   label: "Organisation",        blurb: "The company above its workspaces: domains, admins, and every workspace.", orgAdminOnly: true },
  { id: "workspace",      label: "Workspace profile",   blurb: "This workspace: its name, markets and therapy areas.", adminOnly: true },
  { id: "brand-kit",      label: "Workspace brand kit", blurb: "The logos, typefaces and colours every asset in this workspace is built from.", anyOf: ["brand"] },
  { id: "profile",        label: "User profile",        blurb: "Your own details, sign-in, and what reaches you." },
  { id: "team",           label: "Team",                blurb: "Who is in this workspace, what they are, and what they can do." },
  { id: "compliance",     label: "Compliance & MLR",    blurb: "The stages work passes through between draft and approved.", anyOf: ["chains"] },
  { id: "integrations",   label: "Integrations",        blurb: "Connected systems for review and distribution.", anyOf: ["integrations"] },
  { id: "appearance",     label: "Appearance",          blurb: "Theme and language, for your account." },
  { id: "billing",        label: "Billing & usage",     blurb: "Plan, credits, and what has been spent.", anyOf: ["billingView"] },
  { id: "pronunciations", label: "Pronunciations",      blurb: "How names are spoken in generated narration.", anyOf: ["pron"] },
];

export function SettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = useSettingsStore((s) => s.isAdmin);
  const isOrgAdmin = useSettingsStore((s) => s.orgAdminIds.includes(s.currentUserId));

  const { canAny } = useCan();
  const visible = SETTINGS_SECTIONS.filter((s) =>
    s.orgAdminOnly ? isOrgAdmin : (!s.adminOnly || isAdmin) && (!s.anyOf || canAny(s.anyOf))
  );
  const onVisibleRoute = visible.some((s) => pathname === `/settings/${s.id}`);
  const activeId = visible.find((s) => pathname === `/settings/${s.id}`)?.id ?? visible[0]?.id ?? "";
  const active = visible.find((s) => s.id === activeId);

  /**
   * Hiding the tab is not enough — the ROUTE has to go too. Dropping admin
   * while sitting on /settings/workspace previously left the workspace fields
   * on screen with no tab selected and the wrong blurb above them: the tab row
   * said one thing and the page showed another.
   */
  useEffect(() => {
    if (!onVisibleRoute && activeId) router.replace(`/settings/${activeId}`);
  }, [onVisibleRoute, activeId, router]);

  // Render nothing rather than the forbidden section for the frame before the
  // replace lands.
  if (!onVisibleRoute) return null;

  const items: TabNavItem[] = visible.map((s) => ({
    id: s.id,
    label: s.label,
    href: `/settings/${s.id}`,
  }));

  return (
    <div className="mx-auto w-full max-w-(--container-page)">
      {/* The blurb carries the orienting job the label cannot: a scrolling
          tab row can push the active tab out of view. */}
      <div className="mb-6">
        <PageHeading title="Settings" description={active?.blurb} />
      </div>

      <TabNav items={items} activeId={activeId} ariaLabel="Settings sections" className="mb-6" />
      {children}
    </div>
  );
}
