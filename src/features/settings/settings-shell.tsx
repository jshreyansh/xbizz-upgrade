"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Eye } from "lucide-react";
import { TabNav, type TabNavItem } from "@/components/patterns/tab-nav";
import { Text } from "@/components/ui/text";
import { Chip } from "@/components/ui/chip";
import { useSettingsStore } from "@/features/settings/settings-store";
import { cn } from "@/lib/cn";

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
}

export const SETTINGS_SECTIONS: SettingsSection[] = [
  { id: "workspace",      label: "Workspace profile",   blurb: "The organisation everyone in this account shares.", adminOnly: true },
  { id: "brand-kit",      label: "Workspace brand kit", blurb: "The logos, typefaces and colours every generated asset is built from.", adminOnly: true },
  { id: "profile",        label: "User profile",        blurb: "Your own details, sign-in, and what reaches you." },
  { id: "team",           label: "Team",                blurb: "Who is in this workspace, what they are, and what they can do.", adminOnly: true },
  { id: "compliance",     label: "Compliance & MLR",    blurb: "The stages work passes through between draft and approved." },
  { id: "integrations",   label: "Integrations",        blurb: "Connected systems for review and distribution.", adminOnly: true },
  { id: "appearance",     label: "Appearance",          blurb: "Theme and language, for your account." },
  { id: "billing",        label: "Billing & usage",     blurb: "Plan, payment method, and what has been spent." },
  { id: "pronunciations", label: "Pronunciations",      blurb: "How names are spoken in generated narration.", adminOnly: true },
];

/**
 * Switches which person you are viewing as, so the role-based differences are
 * demonstrable rather than theoretical. Admin-ness is derived from the chosen
 * person's permissions, not toggled separately — which means the switcher can
 * never show a state the permission model could not actually produce.
 */
function ViewAsSwitcher() {
  const members = useSettingsStore((s) => s.members);
  const currentUserId = useSettingsStore((s) => s.currentUserId);
  const setCurrentUser = useSettingsStore((s) => s.setCurrentUser);
  const isAdmin = useSettingsStore((s) => s.isAdmin);

  const options = members.filter((m) => m.status === "active");

  return (
    <label className="flex shrink-0 items-center gap-2">
      <span className="flex items-center gap-1.5">
        <Eye className="size-3.5 text-ink-3" />
        <Text size="label" tone="muted" weight="semibold">Viewing as</Text>
      </span>
      <span className="relative">
        <select
          value={currentUserId}
          onChange={(e) => setCurrentUser(e.target.value)}
          aria-label="View settings as"
          className={cn(
            "cursor-pointer appearance-none rounded-control border bg-card py-1.5 pl-3 pr-8 text-body font-semibold text-ink",
            "border-hair-2 transition-colors hover:border-brand focus:border-brand focus:outline-none",
          )}
        >
          {options.map((m) => (
            <option key={m.id} value={m.id}>{m.name} — {m.role}</option>
          ))}
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-3" />
      </span>
      <Chip tone={isAdmin ? "brand" : "default"} size="xs">{isAdmin ? "Admin" : "Member"}</Chip>
    </label>
  );
}

export function SettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = useSettingsStore((s) => s.isAdmin);

  const visible = SETTINGS_SECTIONS.filter((s) => !s.adminOnly || isAdmin);
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
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <Text as="h1" size="display" weight="bold" className="block leading-tight">Settings</Text>
          {/* The blurb carries the orienting job the label cannot: a scrolling
              tab row can push the active tab out of view. */}
          <Text size="body" tone="muted" className="mt-0.5 block">{active?.blurb}</Text>
        </div>
        <ViewAsSwitcher />
      </div>

      <TabNav items={items} activeId={activeId} ariaLabel="Settings sections" className="mb-6" />
      {children}
    </div>
  );
}
