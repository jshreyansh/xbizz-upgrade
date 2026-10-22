"use client";

import type { ReactNode } from "react";
import { PageGate } from "@/features/settings/page-gate";
import { LIBRARY_ACCESS } from "@/features/settings/view-as";

export default function ClaimsLibraryLayout({ children }: { children: ReactNode }) {
  return (
    <PageGate anyOf={LIBRARY_ACCESS} pageTitle="Claims Library" area="The Claims Library" needs="library">
      {children}
    </PageGate>
  );
}
