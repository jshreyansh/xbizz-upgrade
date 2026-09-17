import { CheckCircle2, Clock, Circle, type LucideIcon } from "lucide-react";
import type { DossierEntryStatus } from "@/features/product-library/product-library-types";

/** Shared between the product's Dossier tab and the Dossier detail page —
 *  one status vocabulary for "how far along is this dossier". */
export const DOSSIER_STATUS_STYLE: Record<DossierEntryStatus, { icon: LucideIcon; tone: string; bg: string; label: string }> = {
  verified: { icon: CheckCircle2, tone: "text-ok", bg: "bg-ok-bg", label: "Verified" },
  "in review": { icon: Clock, tone: "text-warn", bg: "bg-warn-bg", label: "In review" },
  "not started": { icon: Circle, tone: "text-ink-4", bg: "bg-subtle", label: "Not started" },
};
