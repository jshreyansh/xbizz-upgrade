"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/features/workspace/app-shell";
import { NoAccess, useCan } from "@/features/settings/view-as";

/* A Brand Dossier is product source material: making one needs Manage Product & Claims Library. */
export default function NewDossierLayout({ children }: { children: ReactNode }) {
  const { can } = useCan();
  if (!can("products")) {
    return (
      <AppShell pageTitle="Brand Dossiers">
        <NoAccess area="Creating a Brand Dossier" needs="products" instead="Existing dossiers stay open to read." />
      </AppShell>
    );
  }
  return <>{children}</>;
}
