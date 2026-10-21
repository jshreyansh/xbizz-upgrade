"use client";

import type { ReactNode } from "react";
import { PageGate } from "@/features/settings/page-gate";

/* Characters are made for videos, so they belong to people who create. */
export default function CharactersLayout({ children }: { children: ReactNode }) {
  return (
    <PageGate anyOf={["create"]} pageTitle="Characters" area="Characters" needs="create" instead="Published content is in All Content.">
      {children}
    </PageGate>
  );
}
