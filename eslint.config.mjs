import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Design-system guard.
 *
 * Each pattern here is one of the parallel styling systems removed during the
 * token migration. Banning them in feature code is what stops the
 * consolidation decaying back.
 *
 * These are ERRORS because each is at zero violations, so they can only ever
 * be a regression. Patterns that still carry a deliberate tail — the ~100
 * one-off hexes, 49 rogue radii, 15 dark-context palette classes, one blue glow — are
 * NOT here; `npm run lint:tokens` reports those as a burn-down instead, so CI
 * stays honest rather than green-by-exception.
 *
 * Only className is inspected, so an inline `style` gradient or a mock
 * fixture keeps its raw hex. Those are illustration, not chrome.
 *
 * A genuine one-off is still fine — put an eslint-disable-next-line on it.
 * That keeps the exception visible and greppable instead of invisible.
 */
const BANNED = [
  [String.raw`text-\[[\d.]+px\]`,
   "Arbitrary font size. Use a type scale step: text-micro | caption | label | body | body-lg | subhead | title | display | display-lg | hero | hero-lg."],

  [String.raw`\bbg-white(?![\/\w-])`,
   "bg-white bypasses the surface token. Use <Surface> or bg-card, so the surface stays changeable from one place. (bg-white/50 alpha overlays are fine.)"],

  [String.raw`border-black\/`,
   "border-black/N is a third hairline system. Use border-hair | border-hair-2 | border-hair-3."],

  [String.raw`\[var\(--`,
   "Arbitrary [var(--token)] string. The tokens generate real utilities now — use bg-brand, text-ink-3, border-hair, rounded-card and so on."],
];

/** className is reached as a plain value, inside cn(), or via a template. */
const restricted = BANNED.flatMap(([re, message]) => [
  { selector: `JSXAttribute[name.name="className"] Literal[value=/${re}/]`, message },
  { selector: `JSXAttribute[name.name="className"] TemplateElement[value.raw=/${re}/]`, message },
]);

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "dist/**"]),
  {
    files: ["src/features/**/*.tsx", "src/app/**/*.tsx"],
    rules: { "no-restricted-syntax": ["error", ...restricted] },
  },
]);
