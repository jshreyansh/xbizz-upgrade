"use client";

import type { ReactNode } from "react";
import { PageGate } from "@/features/settings/page-gate";
import { LIBRARY_ACCESS } from "@/features/settings/view-as";

/* Brand Dossiers are part of the Product Library, so the same people see them. */
export default function DossiersLayout({ children }: { children: ReactNode }) {
  return (
    <PageGate anyOf={LIBRARY_ACCESS} pageTitle="Brand Dossiers" area="Brand Dossiers" needs="products" instead="They're for people who create, review or manage content.">
      {children}
    </PageGate>
  );
}
