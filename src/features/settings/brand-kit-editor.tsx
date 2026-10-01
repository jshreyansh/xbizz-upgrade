"use client";

import { Trash2, Upload, X } from "lucide-react";
import { Text } from "@/components/ui/text";
import { Chip } from "@/components/ui/chip";
import { Stack } from "@/components/ui/stack";
import { Field } from "@/components/ui/field";
import { SortableList } from "@/components/patterns/sortable-list";
import { FontPicker } from "@/features/settings/font-picker";
import { SettingsCard } from "@/features/settings/settings-parts";
import { COLOR_ROLES, type BrandKit, type ColorRole, type LogoSlot } from "@/features/settings/settings-types";
import { cn } from "@/lib/cn";

/**
 * The logos, typefaces and colours an asset is built from.
 *
 * One editor for both places a kit lives: the workspace's own kit in
 * Settings, and a product's kit on its page in the Product Library. They ask
 * the same three questions, so they look and behave the same; only who holds
 * the value differs.
 */

/**
 * Logo slots, split by lockup × ground. That split is the point: a dark
 * video scene and a light leave-behind both need to be correct without anyone
 * re-uploading, and a white logo dropped into the light slot is only visible
 * if the preview sits on the ground the slot is FOR.
 */
const SLOTS: { id: LogoSlot; label: string; hint: string; ground: "light" | "dark"; accepts: string }[] = [
  { id: "lockup-light", label: "Full lockup",  hint: "Documents, leave-behinds, light scenes", ground: "light", accepts: "SVG, PNG" },
  { id: "lockup-dark",  label: "Full lockup",  hint: "Video scenes, dark overlays",            ground: "dark",  accepts: "SVG, PNG" },
  { id: "mark-light",   label: "Mark only",    hint: "Corners, watermarks, tight spaces",      ground: "light", accepts: "SVG, PNG" },
  { id: "mark-dark",    label: "Mark only",    hint: "Video corner bug",                       ground: "dark",  accepts: "SVG, PNG" },
  { id: "animated",     label: "Animated logo", hint: "Intro and outro stings",                ground: "dark",  accepts: "MP4, WebM, Lottie" },
  { id: "favicon",      label: "Favicon",      hint: "Shared links, published pages",          ground: "light", accepts: "SVG, PNG 512²" },
];

const ROLE_LABELS = ["Primary", "Secondary", "Tertiary"];
const ROLE_USES = [
  "Headlines, titles, stat-hero numbers",
  "Body copy, narration captions",
  "Labels, footnotes, ISI and fair balance",
];
/** The role list is three long, so three is the cap — a fourth has no role. */
const MAX_TYPEFACES = ROLE_LABELS.length;

export function BrandKitEditor({
  kit,
  onChange,
  slots = SLOTS.map((slot) => slot.id),
  slotCopy = {},
  copy = {},
  maxTypefaces = MAX_TYPEFACES,
  colorRoles = COLOR_ROLES.map((role) => ({ id: role.id as ColorRole, label: role.label, trailing: role.trailing })),
}: {
  kit: BrandKit;
  onChange: (next: BrandKit) => void;
  /** Which logo slots this kit has. A product has no favicon of its own. */
  slots?: LogoSlot[];
  /**
   * A slot's name and use, where this kit calls it something else — and
   * whether it is the one the kit cannot do without, or one it can.
   */
  slotCopy?: Partial<Record<LogoSlot, { label?: string; hint?: string; priority?: "primary" | "optional" }>>;
  /** Card descriptions, where the default wording does not fit. */
  copy?: Partial<Record<"logos" | "typography" | "palette", string>>;
  /** How many typeface roles this kit has, from the top: primary, secondary, tertiary. */
  maxTypefaces?: number;
  /** The palette roles this kit has, named as this kit names them. */
  colorRoles?: { id: ColorRole; label: string; trailing: string }[];
}) {
  /* In the order asked for, so a kit can lead with what matters to it. */
  const shown = slots.flatMap((id) => {
    const slot = SLOTS.find((x) => x.id === id);
    return slot ? [{ ...slot, priority: undefined, ...slotCopy[id] }] : [];
  });
  const hasPrimary = shown.some((slot) => slot.priority === "primary");
  const shownRoles = new Set(colorRoles.map((role) => role.id));
  const setLogo = (slot: LogoSlot, file: { fileName: string; size: string } | null) => {
    const logos = { ...kit.logos };
    if (file) logos[slot] = file;
    else delete logos[slot];
    onChange({ ...kit, logos });
  };
  const setColor = (role: ColorRole, hex: string) => onChange({ ...kit, colors: { ...kit.colors, [role]: hex } });

  return (
    <Stack gap={4}>
      <SettingsCard
        title="Logos"
        description={copy.logos ?? "Each slot previews on the ground it is used against, so a light logo in a dark slot is obvious."}
      >
        {/* Three across only when the slots fill the rows; four sit two by
            two. A primary slot takes a whole row, with the optional ones
            under it, so the one that matters reads first. */}
        <div className={cn("grid gap-3 sm:grid-cols-2", !hasPrimary && shown.length % 3 === 0 && "lg:grid-cols-3")}>
          {shown.map((slot) => {
            const file = kit.logos[slot.id];
            return (
              <div
                key={slot.id}
                className={cn(
                  "flex flex-col gap-2 rounded-panel border border-hair bg-canvas p-3",
                  slot.priority === "primary" && "sm:col-span-2"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <Text size="body" weight="bold">{slot.label}</Text>
                      {slot.priority && (
                        <Chip tone={slot.priority === "primary" ? "brand" : "default"} size="xs">
                          {slot.priority === "primary" ? "Primary" : "Optional"}
                        </Chip>
                      )}
                    </span>
                    <Text size="caption" tone="subtle" className="block">{slot.hint}</Text>
                  </div>
                  {/* The "dark" chip tone is for chips ON a dark surface; this
                      one sits on the light card, so it is filled ink instead —
                      a white-on-white chip that said "On dark" was invisible. */}
                  <Chip
                    tone="default"
                    size="xs"
                    className={slot.ground === "dark" ? "border-ink bg-ink text-white" : undefined}
                  >
                    {slot.ground === "dark" ? "On dark" : "On light"}
                  </Chip>
                </div>

                {/* The preview sits on the slot's own ground. */}
                <div
                  className={cn(
                    "grid h-20 place-items-center rounded-control border",
                    slot.ground === "dark" ? "border-white/10 bg-ink" : "border-hair bg-card",
                    !file && "shimmer",
                  )}
                >
                  {file ? (
                    <Text size="label" weight="semibold" className={slot.ground === "dark" ? "text-white" : "text-ink"}>
                      {slot.label}
                    </Text>
                  ) : (
                    <Text size="caption" tone="subtle">No file</Text>
                  )}
                </div>

                {file ? (
                  <div className="flex items-center justify-between gap-2">
                    <Text size="caption" tone="muted" className="truncate">{file.fileName} · {file.size}</Text>
                    <button
                      type="button"
                      aria-label={`Remove ${slot.label}`}
                      onClick={() => setLogo(slot.id, null)}
                      className="grid size-6 shrink-0 place-items-center rounded-glyph text-ink-3 transition-colors hover:bg-subtle hover:text-danger cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setLogo(slot.id, { fileName: `${slot.id}.svg`, size: "14 KB" })}
                    className="flex items-center justify-center gap-1.5 rounded-control border border-dashed border-hair-2 py-1.5 text-ink-3 transition-colors hover:border-brand hover:text-brand cursor-pointer"
                  >
                    <Upload className="size-3.5" />
                    <span className="text-label font-bold">Upload · {slot.accepts}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </SettingsCard>

      <SettingsCard
        title="Typography"
        description={copy.typography ?? "One list. Position assigns the role, first is primary, second secondary, third tertiary. Drag to change it."}
      >
        <Stack gap={3}>
          {kit.typefaces.length > 0 ? (
            <SortableList
              items={kit.typefaces}
              itemKey={(t) => t.id}
              onReorder={(typefaces) => onChange({ ...kit, typefaces })}
              renderItem={(t, i) => (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Chip tone={i === 0 ? "brand" : "default"} size="xs">{ROLE_LABELS[i] ?? `#${i + 1}`}</Chip>
                  {/* Set in itself, at the size its role actually uses. */}
                  <span
                    style={{ fontFamily: `"${t.name}", var(--font-figtree), sans-serif` }}
                    className={cn("font-bold text-ink", i === 0 ? "text-subhead" : i === 1 ? "text-body-lg" : "text-label")}
                  >
                    {t.name}
                  </span>
                  <Text size="caption" tone="subtle">{ROLE_USES[i] ?? ""}</Text>
                  {t.source === "uploaded" && <Chip tone="default" size="xs">Uploaded</Chip>}
                </div>
              )}
              renderActions={(t) => (
                <button
                  type="button"
                  aria-label={`Remove ${t.name}`}
                  onClick={() => onChange({ ...kit, typefaces: kit.typefaces.filter((x) => x.id !== t.id) })}
                  className="grid size-7 place-items-center rounded-glyph text-ink-3 transition-colors hover:bg-subtle hover:text-danger cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            />
          ) : (
            <Text size="body" tone="muted">No typefaces yet. Add one below.</Text>
          )}

          {kit.typefaces.length < maxTypefaces ? (
            <div className="flex flex-wrap items-center gap-3">
              <FontPicker
                exclude={kit.typefaces.map((t) => t.name)}
                onPick={(name) =>
                  onChange({
                    ...kit,
                    typefaces: [...kit.typefaces, { id: `tf-${Date.now()}`, name, source: "uploaded" }],
                  })
                }
                placeholder={`Add the ${ROLE_LABELS[kit.typefaces.length]?.toLowerCase() ?? "next"} typeface`}
              />
              <Text size="label" tone="subtle">
                {maxTypefaces - kit.typefaces.length} slot
                {maxTypefaces - kit.typefaces.length === 1 ? "" : "s"} left
              </Text>
            </div>
          ) : (
            <Text size="label" tone="subtle">
              {maxTypefaces === 2 ? "Both" : "All three"} roles filled. Remove one to add another.
            </Text>
          )}
        </Stack>
      </SettingsCard>

      <SettingsCard
        title="Palette"
        description={copy.palette ?? "Four roles, named for where each colour lands. Contrast is checked against both grounds."}
      >
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {colorRoles.map((role) => {
            const value = kit.colors[role.id];
            return (
              <div key={role.id}>
                <Text size="caption" tone="subtle" className="mb-1.5 block uppercase tracking-wider">
                  {role.label}
                </Text>
                <div className="flex items-center gap-2">
                  <label
                    className="relative size-9 shrink-0 cursor-pointer overflow-hidden rounded-control border border-hair"
                    style={{ background: value }}
                  >
                    <span className="sr-only">Pick {role.label}</span>
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => setColor(role.id, e.target.value)}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                  </label>
                  <Field
                    value={value}
                    onChange={(e) => setColor(role.id, e.target.value)}
                    placeholder="#RRGGBB"
                    className="text-body font-mono"
                  />
                </div>
                <Text size="caption" tone="subtle" className="mt-1 block">{role.trailing}</Text>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-hair pt-4">
          <Text size="label" tone="muted" weight="semibold">Contrast</Text>
          <Chip tone="ok" size="sm">Primary passes on light</Chip>
          <Chip tone="warn" size="sm">Primary needs checking on dark</Chip>
          {shownRoles.has("callout") && <Chip tone="ok" size="sm">Text passes on callout</Chip>}
        </div>
      </SettingsCard>
    </Stack>
  );
}
