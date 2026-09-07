"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ScreenHeader } from "@/components/patterns/screen-header";
import { TabNav, type TabNavItem } from "@/components/patterns/tab-nav";
import { Text } from "@/components/ui/text";
import { useSettingsStore } from "@/features/settings/settings-store";

/**
 * The settings shell: one tab row, one page header, one content column.
 *
 * Tabs are filtered rather than disabled. A disabled tab tells a non-admin that
 * something exists which they cannot have, which only generates a support
 * question; an absent tab tells them nothing, which is correct.
 *
 * `blurb` carries the orienting job the old vertical nav did by always showing
 * the label. A scrolling row cannot, so the header says where you are.
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

export function SettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = useSettingsStore((s) => s.isAdmin);

  const visible = SETTINGS_SECTIONS.filter((s) => !s.adminOnly || isAdmin);
  const activeId = visible.find((s) => pathname === `/settings/${s.id}`)?.id ?? visible[0]?.id ?? "";
  const active = visible.find((s) => s.id === activeId);

  const items: TabNavItem[] = visible.map((s) => ({
    id: s.id,
    label: s.label,
    href: `/settings/${s.id}`,
  }));

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-canvas">
      <ScreenHeader>
        <button
          type="button"
          onClick={() => router.push("/")}
          aria-label="Back to workspace"
          className="grid size-8 place-items-center rounded-chip border border-hair-2 bg-card text-ink-3 transition-colors hover:border-brand hover:text-ink cursor-pointer"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="min-w-0">
          <Text size="body-lg" weight="bold" className="block leading-tight">Settings</Text>
          <Text size="label" tone="muted" className="block truncate">{active?.blurb}</Text>
        </div>
      </ScreenHeader>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-(--container-page) px-4 py-6 sm:px-6 lg:px-8">
          <TabNav items={items} activeId={activeId} ariaLabel="Settings sections" className="mb-6" />
          {children}
        </div>
      </div>
    </div>
  );
}
