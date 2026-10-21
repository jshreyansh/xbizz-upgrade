"use client";

import { Eye, ShieldCheck } from "lucide-react";
import { SelectMenu } from "@/components/ui/select-menu";
import { Text } from "@/components/ui/text";
import { PERMISSIONS } from "@/features/settings/settings-types";
import { useSettingsStore } from "@/features/settings/settings-store";
import type { PermissionId } from "@/features/settings/settings-types";

/**
 * Who the app is being viewed as, and what that person can do.
 *
 * One person for the whole app, not one per page: switching it in the header
 * changes the sidebar, the settings tabs, the MLR Review queue and anything
 * else that asks `useCan`. It is a prototype control for walking each role,
 * standing in for whoever is signed in.
 */
export function useCan() {
  const members = useSettingsStore((s) => s.members);
  const currentUserId = useSettingsStore((s) => s.currentUserId);
  const me = members.find((m) => m.id === currentUserId);
  const can = (permission: PermissionId) => !!me?.permissions.includes(permission);
  const canAny = (permissions: readonly PermissionId[]) => permissions.some(can);
  return { me, can, canAny };
}

/**
 * Who the Product and Claims libraries (and the Brand Dossiers in them) are
 * for: people who make content from them, review claims against them, or keep
 * them. Everyone else never sees them, rather than seeing them greyed out.
 */
export const LIBRARY_ACCESS: readonly PermissionId[] = ["create", "approve", "products"];

/** The header control. Admin-ness and every gate follow the chosen person's permissions. */
export function ViewAsSwitcher() {
  const members = useSettingsStore((s) => s.members);
  const currentUserId = useSettingsStore((s) => s.currentUserId);
  const setCurrentUser = useSettingsStore((s) => s.setCurrentUser);
  const options = members.filter((m) => m.status === "active");

  return (
    <div
      className="hidden shrink-0 items-center gap-1.5 rounded-full border border-hair-2 bg-card py-0.5 pl-2.5 pr-0.5 lg:flex"
      title="Prototype: view the whole app as this person"
    >
      <Eye className="size-3.5 shrink-0 text-ink-3" />
      <span className="text-label font-semibold text-ink-3">Viewing as</span>
      <SelectMenu
        size="sm"
        ariaLabel="View the app as"
        value={currentUserId}
        onChange={setCurrentUser}
        className="w-52"
        menuMinWidth={260}
        triggerClassName="h-7 rounded-full border-transparent bg-subtle hover:border-transparent hover:bg-tint"
        options={options.map((m) => ({ value: m.id, label: m.name, hint: m.role }))}
      />
    </div>
  );
}

/**
 * While viewing as someone else, a strip says so: everything below is what
 * they see, and one click returns to you.
 */
export function ViewingAsBanner() {
  const s = useSettingsStore();
  if (s.currentUserId === s.signedInId) return null;
  const them = s.members.find((m) => m.id === s.currentUserId);
  const you = s.members.find((m) => m.id === s.signedInId);
  const back = () => {
    if (you) s.setCurrentUser(you.id); else s.signInAs(s.signedInId);
  };
  return (
    <div role="status" className="flex shrink-0 flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-tint-line bg-tint px-4 py-1.5 text-center">
      <Eye className="size-3.5 shrink-0 text-brand-deep" />
      <span className="text-label text-brand-deep">
        Previewing as <b>{them?.name}</b> ({them?.role}). The sidebar, pages and actions are what they see.
      </span>
      <button type="button" onClick={back} className="cursor-pointer text-label font-bold text-brand-deep underline underline-offset-2 hover:text-ink">
        Back to {you?.name.split(" ")[0] ?? "you"}
      </button>
    </div>
  );
}

/**
 * What a page shows to someone whose permissions don't include it: what it
 * needs, who they are, and where to go instead. One place, so every gate
 * explains itself the same way.
 */
export function NoAccess({ area, needs, instead }: { area: string; needs: PermissionId; instead?: string }) {
  const { me } = useCan();
  const label = PERMISSIONS.find((p) => p.id === needs)?.label ?? needs;
  return (
    <div className="mx-auto mt-24 max-w-md px-4 text-center">
      <ShieldCheck className="mx-auto mb-3 size-7 text-ink-4" />
      <Text as="h1" size="title" weight="bold" className="block">{area} isn&apos;t part of your role</Text>
      <Text size="body" tone="muted" className="mt-2 block">
        It needs {label}. {me?.name ?? "This person"} is {me?.role ?? "in a role"} without it.{instead ? ` ${instead}` : ""} An admin can change that in Settings → Team.
      </Text>
    </div>
  );
}
