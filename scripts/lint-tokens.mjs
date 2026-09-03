#!/usr/bin/env node
/**
 * Burn-down report for the styling patterns that still carry a deliberate
 * tail. These are NOT eslint errors — each was consciously left rather than
 * snapped to a nearest token — but the counts should only ever go down.
 *
 * When a row reaches 0, promote it to the BANNED list in eslint.config.mjs so
 * it can never come back.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOTS = ["src/features", "src/app"];
const CHECKS = [
  ["raw hex in className",        /#[0-9a-fA-F]{6}\b/g],
  ["rogue arbitrary radius",      /rounded-\[[\d.]+px\]/g],
  ["Tailwind palette colour",     /\b(?:text|bg|border|ring|divide|placeholder:text)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g],
  ["arbitrary shadow",            /shadow-\[/g],
];

const files = [];
const walk = (d) => {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    statSync(p).isDirectory() ? walk(p) : p.endsWith(".tsx") && files.push(p);
  }
};
ROOTS.forEach(walk);

// className only — inline style gradients and fixtures legitimately use hex
const CLASSNAME = /className=(?:"([^"]*)"|\{([^}]*(?:\{[^}]*\}[^}]*)*)\})/g;

let total = 0;
const rows = CHECKS.map(([label, re]) => {
  let n = 0;
  const worst = {};
  for (const f of files) {
    const src = readFileSync(f, "utf8");
    for (const m of src.matchAll(CLASSNAME)) {
      const cls = m[1] ?? m[2] ?? "";
      const hits = cls.match(re)?.length ?? 0;
      if (hits) { n += hits; worst[f] = (worst[f] ?? 0) + hits; }
    }
  }
  total += n;
  const top = Object.entries(worst).sort((a, b) => b[1] - a[1])[0];
  return [label, n, top ? `${top[0].split("/").pop()} ×${top[1]}` : "—"];
});

const pad = (s, w) => String(s).padEnd(w);
console.log("\n  design-token burn-down — these should only go down\n");
console.log(`  ${pad("pattern", 26)}${pad("uses", 7)}worst offender`);
console.log(`  ${"-".repeat(62)}`);
for (const [l, n, w] of rows) {
  console.log(`  ${pad(l, 26)}${pad(n, 7)}${n === 0 ? "CLEAR — promote to eslint BANNED" : w}`);
}
console.log(`\n  total ${total} across ${files.length} feature files\n`);
