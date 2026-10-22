"use client";

import { AREAS, floorOf, levelOf, type AreaId, type LevelId, type PermissionId } from "@/features/settings/settings-types";
import { useState, type ReactNode } from "react";
import { ActionBar } from "@/components/patterns/action-bar";
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
  checked, onChange, label, trailing, disabled, lockedNote,
}: {
  checked: boolean; onChange: () => void; label: string; trailing?: string; disabled?: boolean;
  /** On because something else brings it, e.g. "Included with Create": shown ticked and fixed, not faded. */
  lockedNote?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-disabled={lockedNote ? true : undefined}
      disabled={disabled}
      onClick={lockedNote ? undefined : onChange}
      title={lockedNote}
      className={cn(
        "flex w-full items-start gap-3 rounded-control border px-3 py-2.5 text-left transition-colors",
        lockedNote ? "cursor-default" : "cursor-pointer",
        checked ? "border-brand bg-tint ring-2 ring-brand/15" : "border-hair-2 bg-card hover:border-hair-3 hover:bg-canvas",
        lockedNote && "ring-0",
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
        {lockedNote && <Text size="caption" weight="semibold" className="mt-0.5 block text-brand-deep">{lockedNote}</Text>}
      </span>
    </button>
  );
}

/** A small segmented control for two or three mutually exclusive options. */
export function Segmented<T extends string>({
  value, onChange, options, ariaLabel, disabled = [], titles,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string }[];
  ariaLabel: string;
  /** Options that can't be chosen right now (shown, not hidden, so the scale reads whole). */
  disabled?: T[];
  /** A tooltip per option, e.g. why it's disabled. */
  titles?: Partial<Record<T, string>>;
}) {
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
            disabled={disabled.includes(o.id)}
            title={titles?.[o.id]}
            onClick={() => onChange(o.id)}
            className={cn(
              "rounded-glyph px-3 py-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40",
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
  /* The same floating bar as every canvas, so its CTA nests the same way. */
  return (
    <ActionBar
      gutter={false}
      className="mt-6"
      title="Unsaved changes"
      action={
        <>
          <button
            type="button"
            onClick={onDiscard}
            className="px-3 py-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <span className="text-label font-bold">Discard</span>
          </button>
          <Button size="sm" onClick={onSave}>Save changes</Button>
        </>
      }
    />
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

/**
 * Access as one row per area of the app, each with a level: the shape of every
 * permission editor (Invite, Role configuration, a member's drawer). Levels the
 * rest of the set rules out are shown but disabled, with the reason, so the
 * scale always reads whole.
 */
export function AccessGrid({
  perms, onLevel, lockAdmin,
}: {
  perms: readonly PermissionId[];
  onLevel: (area: AreaId, level: LevelId) => void;
  /** Keeps Workspace admin on (the Workspace admin role always has it). */
  lockAdmin?: string;
}) {
  const admin = perms.includes("admin");
  return (
    <div className="divide-y divide-hair rounded-panel border border-hair bg-card">
      {/* With Workspace admin on, every row is Manage: say it once, not on every row. */}
      {admin && (
        <div className="rounded-t-panel bg-tint px-3.5 py-2">
          <Text size="caption" tone="brand-deep" weight="semibold">
            {lockAdmin
              ? "This role always has full access: every area is at its highest level."
              : "Workspace admin is on, so every area is at its highest level. Turn it off below to set them one by one."}
          </Text>
        </div>
      )}
      {AREAS.map((area) => {
        const current = levelOf(perms, area.id);
        const floor = floorOf(perms, area.id);
        const floorIdx = area.levels.findIndex((l) => l.id === floor.level.id);
        const locked = area.id === "admin" && lockAdmin;
        const disabled = locked
          ? area.levels.map((l) => l.id).filter((id) => id !== current.id)
          : area.levels.slice(0, Math.max(0, floorIdx)).map((l) => l.id);
        const note = locked
          ? lockAdmin
          : admin && area.id !== "admin"
            ? undefined
            : floor.because && floorIdx > 0 ? `At least ${floor.level.label} with ${floor.because}` : undefined;
        return (
          <div key={area.id} className="grid gap-x-4 gap-y-2 px-3.5 py-2.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="min-w-0">
              <Text size="body" weight="semibold" className="block">{area.label}</Text>
              <Text size="caption" tone="subtle" className="block">
                {current.hint && current.id !== "none" && current.id !== "off" ? current.hint : area.trailing}
              </Text>
            </div>
            <div className="flex flex-col items-start gap-1 sm:items-end">
              <Segmented
                ariaLabel={area.label}
                value={current.id}
                onChange={(v) => onLevel(area.id, v)}
                options={area.levels.map((l) => ({ id: l.id, label: l.label }))}
                disabled={disabled}
                titles={Object.fromEntries(disabled.map((id) => [id, note ?? (admin ? "Set by Workspace admin" : "")]))}
              />
              {note && <Text size="micro" tone="subtle">{note}</Text>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
