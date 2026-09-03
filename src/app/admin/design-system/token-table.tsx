"use client";

import { useEffect, useState } from "react";
import { Text } from "@/components/ui/text";

/**
 * Reads token values out of the live stylesheet at runtime rather than
 * hardcoding them, so this page cannot drift from globals.css. If a token is
 * renamed or removed it shows here as "not defined" instead of quietly lying.
 */
export function useTokenValues(names: string[]) {
  const key = names.join("|");
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    // Read after paint rather than synchronously in the effect: the values
    // come from resolved CSS custom properties, so the stylesheet has to be
    // applied first, and a synchronous setState here would also cascade an
    // extra render pass.
    const raf = requestAnimationFrame(() => {
      const cs = getComputedStyle(document.documentElement);
      const next: Record<string, string> = {};
      for (const n of key.split("|")) next[n] = cs.getPropertyValue(n).trim();
      setValues(next);
    });
    return () => cancelAnimationFrame(raf);
  }, [key]);

  return values;
}

export function SwatchRow({
  names, label, utility,
}: {
  names: string[];
  label: (n: string) => string;
  /** e.g. n => `bg-${short}` — shown so you know what to type. */
  utility: (n: string) => string;
}) {
  const values = useTokenValues(names);
  return (
    <div className="grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(216px,1fr))]">
      {names.map((n) => {
        const v = values[n];
        return (
          <div
            key={n}
            className="flex items-center gap-2.5 rounded-control squircle border border-hair bg-card p-2"
          >
            <span
              className="size-9 shrink-0 rounded-chip squircle"
              style={{
                background: `var(${n})`,
                outline: "1px solid rgba(10,13,20,.12)",
                outlineOffset: -1,
              }}
            />
            <div className="min-w-0 flex-1">
              <Text size="label" weight="semibold" truncate>{label(n)}</Text>
              <Text size="micro" tone="subtle" className="block font-mono" truncate>
                {utility(n)}
              </Text>
              <Text
                size="micro"
                tone={v ? "faint" : "danger"}
                className="block font-mono"
                tabular
                truncate
              >
                {v || "not defined"}
              </Text>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ScaleRow({ names }: { names: string[] }) {
  const values = useTokenValues(names);
  return (
    <div className="flex flex-col gap-3">
      {names.map((n) => {
        const step = n.replace("--text-", "");
        return (
          <div key={n} className="flex items-baseline gap-4 border-b border-hair pb-3 last:border-0">
            <Text size="micro" tone="subtle" className="w-24 shrink-0 font-mono">text-{step}</Text>
            <Text size="micro" tone="subtle" className="w-12 shrink-0 font-mono" tabular>
              {values[n] || "—"}
            </Text>
            <span style={{ fontSize: `var(${n})` }} className="font-semibold text-ink">
              Grounded in verified label claims
            </span>
          </div>
        );
      })}
    </div>
  );
}
