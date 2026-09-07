"use client";

import { useState } from "react";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { Text } from "@/components/ui/text";
import { Chip } from "@/components/ui/chip";
import { Stack } from "@/components/ui/stack";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { SortableList } from "@/components/patterns/sortable-list";
import { useSettingsStore } from "@/features/settings/settings-store";
import { SettingsCard, SaveBar, useDirty } from "@/features/settings/settings-parts";
import type { LogoSlot } from "@/features/settings/settings-types";
import { cn } from "@/lib/cn";

/**
 * Six logo slots, split by lockup × ground. That split is the point: a dark
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

export function SectionBrandKit() {
  const s = useSettingsStore();
  const { dirty, touch, clear } = useDirty();
  const [newFace, setNewFace] = useState("");

  const add = () => {
    const name = newFace.trim();
    if (!name || s.brandKit.typefaces.length >= MAX_TYPEFACES) return;
    s.addTypeface(name);
    setNewFace("");
    touch();
  };

  return (
    <Stack gap={4}>
      <SettingsCard
        title="Logos"
        description="Each slot previews on the ground it is used against, so a light logo in a dark slot is obvious."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SLOTS.map((slot) => {
            const file = s.brandKit.logos[slot.id];
            return (
              <div key={slot.id} className="flex flex-col gap-2 rounded-panel border border-hair bg-canvas p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Text size="body" weight="bold" className="block">{slot.label}</Text>
                    <Text size="caption" tone="subtle" className="block">{slot.hint}</Text>
                  </div>
                  <Chip tone={slot.ground === "dark" ? "dark" : "default"} size="xs">
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
                      onClick={() => { s.setLogo(slot.id, null); touch(); }}
                      className="grid size-6 shrink-0 place-items-center rounded-glyph text-ink-3 transition-colors hover:bg-subtle hover:text-danger cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => { s.setLogo(slot.id, { fileName: `${slot.id}.svg`, size: "14 KB" }); touch(); }}
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
        description="One list. Position assigns the role — first is primary, second secondary, third tertiary. Drag to change it."
      >
        <Stack gap={3}>
          {s.brandKit.typefaces.length > 0 ? (
            <SortableList
              items={s.brandKit.typefaces}
              itemKey={(t) => t.id}
              onReorder={(t) => { s.setTypefaces(t); touch(); }}
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
                  onClick={() => { s.removeTypeface(t.id); touch(); }}
                  className="grid size-7 place-items-center rounded-glyph text-ink-3 transition-colors hover:bg-subtle hover:text-danger cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            />
          ) : (
            <Text size="body" tone="muted">No typefaces yet. Add one below.</Text>
          )}

          {s.brandKit.typefaces.length < MAX_TYPEFACES ? (
            <div className="flex flex-wrap items-center gap-2">
              <Field
                value={newFace}
                onChange={(e) => setNewFace(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
                placeholder="Typeface name, e.g. Sofia Pro"
                className="max-w-xs text-body"
              />
              <Button size="sm" variant="secondary" onClick={add} disabled={!newFace.trim()}>
                <Plus className="size-3.5" /> Add
              </Button>
              <Text size="label" tone="subtle">
                {MAX_TYPEFACES - s.brandKit.typefaces.length} slot
                {MAX_TYPEFACES - s.brandKit.typefaces.length === 1 ? "" : "s"} left
              </Text>
            </div>
          ) : (
            <Text size="label" tone="subtle">
              All three roles filled. Remove one to add another.
            </Text>
          )}
        </Stack>
      </SettingsCard>

      <SettingsCard
        title="Colours"
        description="Checked against both grounds — a brand colour that fails on dark is a compliance problem in a video, not a taste problem."
      >
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <Text size="label" tone="muted" weight="semibold" className="mb-1.5 block">Brand colour</Text>
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="size-9 shrink-0 rounded-control border border-hair"
                style={{ background: s.brandKit.brandColor }}
              />
              <Field
                value={s.brandKit.brandColor}
                onChange={(e) => { s.setBrandColor(e.target.value); touch(); }}
                className="w-28 text-body font-mono"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Chip tone="ok" size="sm">Passes on light</Chip>
            <Chip tone="warn" size="sm">Check on dark</Chip>
          </div>
        </div>
      </SettingsCard>

      <SaveBar dirty={dirty} onSave={clear} onDiscard={clear} />
    </Stack>
  );
}
