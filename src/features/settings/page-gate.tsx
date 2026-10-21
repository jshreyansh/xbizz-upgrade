"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/features/workspace/app-shell";
import { NoAccess, useCan } from "@/features/settings/view-as";
import type { PermissionId } from "@/features/settings/settings-types";

/**
 * A route's own guard, for an address typed or bookmarked by someone the
 * sidebar already hides it from: the page, or the reason it isn't theirs.
 */
export function PageGate({
  anyOf, pageTitle, area, needs, instead, children,
}: {
  anyOf: readonly PermissionId[];
  pageTitle: string;
  area: string;
  /** The permission named in the explanation. */
  needs: PermissionId;
  instead?: string;
  children: ReactNode;
}) {
  const { canAny } = useCan();
  if (canAny(anyOf)) return <>{children}</>;
  return (
    <AppShell pageTitle={pageTitle}>
      <NoAccess area={area} needs={needs} instead={instead} />
    </AppShell>
  );
}
