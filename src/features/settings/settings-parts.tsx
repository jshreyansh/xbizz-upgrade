"use client";

import { useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import { Surface } from "@/components/ui/surface";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/**
 * The furniture every settings section repeats: a titled card, a label/control
 * row, a toggle, and the dirty-state save bar. Written once so nine sections
 * cannot drift from each other the way the two plan accordions did.
 */

export function SettingsCard({
  title, description, actions, children, className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Surface radius="card" padding="none" className={cn("overflow-hidden", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-hair px-5 py-4">
        <div className="min-w-0">
          <Text size="body-lg" weight="bold" className="block">{title}</Text>
          {description && <Text size="label" tone="muted" className="mt-0.5 block">{description}</Text>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      <div className="px-5 py-4">{children}</div>
    </Surface>
  );
}

/** A label on the left, its control on the right. Stacks below sm. */
export function SettingRow({
  label, hint, children, htmlFor,
}: { label: string; hint?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="flex flex-col gap-2 border-b border-hair py-3.5 first:pt-0 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:gap-6">
      <div className="min-w-0 sm:w-56 sm:shrink-0">
        <Text as="label" htmlFor={htmlFor} size="body" weight="semibold" className="block">{label}</Text>
        {hint && <Text size="label" tone="subtle" className="mt-0.5 block">{hint}</Text>}
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/** Read-only value, for fields an admin owns elsewhere. */
export function ReadOnlyValue({ value, note }: { value: string; note?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Text size="body" className="text-ink">{value}</Text>
      {note && <Text size="label" tone="subtle">{note}</Text>}
    </div>
  );
}

export function Toggle({
  checked, onChange, label, disabled,
}: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full transition-colors cursor-pointer",
        checked ? "bg-brand" : "bg-black/[0.14]",
        disabled && "pointer-events-none opacity-30",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-4 rounded-full bg-card shadow-2xs transition-[left] duration-200",
          checked ? "left-[18px]" : "left-0.5",
        )}
      />
    </button>
  );
}

/** A checkbox that reads as a chip — used for the permission list. */
export function CheckRow({
  checked, onChange, label, trailing, disabled,
}: { checked: boolean; onChange: () => void; label: string; trailing?: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "flex w-full items-start gap-3 rounded-control border px-3 py-2.5 text-left transition-colors cursor-pointer",
        checked ? "border-brand bg-tint ring-2 ring-brand/15" : "border-hair-2 bg-card hover:border-hair-3 hover:bg-canvas",
        disabled && "pointer-events-none opacity-40",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "mt-0.5 grid size-4 shrink-0 place-items-center rounded-glyph border transition-colors",
          checked ? "border-brand bg-brand text-white" : "border-hair-3 bg-card",
        )}
      >
        {checked && <Check className="size-3" strokeWidth={3.5} />}
      </span>
      <span className="min-w-0">
        <Text size="body" weight="semibold" className={cn("block", checked && "text-brand-deep")}>{label}</Text>
        {trailing && <Text size="label" tone="muted" className="mt-0.5 block">{trailing}</Text>}
      </span>
    </button>
  );
}

/** A small segmented control for two or three mutually exclusive options. */
export function Segmented<T extends string>({
  value, onChange, options, ariaLabel,
}: { value: T; onChange: (v: T) => void; options: { id: T; label: string }[]; ariaLabel: string }) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      // Concentric: chip shell, glyph tabs, p-1 gutter — 6 + 4 = 10.
      className="inline-flex items-center gap-1 rounded-chip border border-hair bg-subtle p-1"
    >
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.id)}
            className={cn(
              "rounded-glyph px-3 py-1.5 transition-colors cursor-pointer",
              active ? "bg-card text-ink shadow-2xs" : "text-ink-3 hover:text-ink",
            )}
          >
            <span className="text-label font-bold">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * The save bar. Appears only when something changed, which is why it can sit
 * sticky at the bottom without permanently stealing space.
 */
export function SaveBar({ dirty, onSave, onDiscard }: { dirty: boolean; onSave: () => void; onDiscard: () => void }) {
  if (!dirty) return null;
  return (
    <div className="sticky bottom-4 z-30 mt-6 flex justify-center">
      <div className="flex items-center gap-4 rounded-card border border-white/12 bg-ink px-4 py-2.5 shadow-on-dark">
        <Text size="body" weight="bold" className="text-white">Unsaved changes</Text>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDiscard}
            className="rounded-control px-3 py-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <span className="text-label font-bold">Discard</span>
          </button>
          <Button size="sm" onClick={onSave}>Save changes</Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Tracks whether anything changed since the last save, without needing every
 * section to hand-roll a snapshot. Sections call `touch()` on any edit.
 */
export function useDirty() {
  const [dirty, setDirty] = useState(false);
  return {
    dirty,
    touch: () => setDirty(true),
    clear: () => setDirty(false),
  };
}
