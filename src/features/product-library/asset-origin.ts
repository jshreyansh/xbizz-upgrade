import type { AssetOrigin } from "@/features/product-library/product-library-types";

/** "Arjun Pillai — Marketing". A name on its own is not an answer. */
export function originLabel(origin: AssetOrigin): string {
  return `${origin.name} — ${origin.team}`;
}
