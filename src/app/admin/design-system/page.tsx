"use client";

import { useState } from "react";
import { ArrowRight, Check, CheckCircle2, Plus, Search, Sparkles, X } from "lucide-react";
import { Button, IconButton } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Container } from "@/components/ui/container";
import { Field } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { Row, Stack } from "@/components/ui/stack";
import { Surface } from "@/components/ui/surface";
import { Label, Text } from "@/components/ui/text";
import { ScreenHeader } from "@/components/patterns/screen-header";
import { ChipMultiSelect } from "@/components/patterns/chip-multi-select";
import { SidePanel, SIDE_PANEL_DEFAULT_WIDTH } from "@/components/patterns/side-panel";
import { ActionBar } from "@/components/patterns/action-bar";
import { Sheet } from "@/components/patterns/sheet";
import { ScaleRow, SwatchRow } from "./token-table";

/**
 * The living reference for the SwishX design system.
 *
 * Everything here is rendered from the real tokens and the real components —
 * colour values are read out of the live stylesheet at runtime — so the page
 * cannot describe a system different from the one that ships.
 *
 * Add a token or a variant and it appears here. Remove one and it shows as
 * "not defined" rather than silently disappearing.
 */

const BRAND = ["--color-brand", "--color-brand-2", "--color-brand-deep", "--color-brand-ink", "--color-brand-light"];
const SURFACES = ["--color-canvas", "--color-card", "--color-subtle", "--color-canvas-grid"];
const INK = ["--color-ink", "--color-ink-2", "--color-ink-3", "--color-ink-4"];
const HAIRLINES = ["--color-hair", "--color-hair-2", "--color-hair-3"];
const TINTS = ["--color-tint", "--color-tint-2", "--color-tint-strong", "--color-tint-line"];
const STATUS = ["--color-ok", "--color-ok-bg", "--color-ok-line", "--color-warn", "--color-warn-bg",
  "--color-warn-line", "--color-danger", "--color-danger-bg", "--color-danger-deep", "--color-live"];
const INFO = ["--color-info", "--color-info-strong", "--color-info-bg", "--color-info-line"];
const ON_DARK = ["--color-ok-on-dark", "--color-warn-on-dark", "--color-info-on-dark"];
const ACCENTS = ["--color-accent-blue", "--color-accent-violet", "--color-accent-amber", "--color-lime", "--color-lime-bg", "--color-lime-line", "--color-lime-ink"];

const TYPE = ["--text-micro", "--text-caption", "--text-label", "--text-body", "--text-body-lg",
  "--text-subhead", "--text-title", "--text-display", "--text-display-lg", "--text-hero", "--text-hero-lg"];

const RADII = ["--radius-chip", "--radius-control", "--radius-panel", "--radius-card"];
const SHADOWS = ["--shadow-hair", "--shadow-soft", "--shadow-float", "--shadow-modal",
  "--shadow-brand-soft", "--shadow-brand-lift", "--shadow-panel-left", "--shadow-on-dark"];
const EASINGS = ["--ease-swish", "--ease-spring", "--ease-entrance", "--ease-exit"];
const WIDTHS = ["--container-narrow", "--container-measure", "--container-wide", "--container-page"];

const short = (n: string) => n.replace(/^--(color|text|radius|shadow|ease|container)-/, "");

function Section({ id, n, title, note, children }: {
  id: string; n: string; title: string; note?: string; children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8 border-t border-hair-2 pt-8">
      <Row gap={3} align="baseline" className="mb-1">
        <Text size="micro" tone="brand" weight="semibold" className="font-mono">{n}</Text>
        <Text as="h2" size="title" weight="bold">{title}</Text>
      </Row>
      {note && <Text as="p" size="body" tone="subtle" className="mb-5 max-w-(--container-measure)">{note}</Text>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Spec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label size="micro">{label}</Label>
      <Row gap={2} align="center" wrap>{children}</Row>
    </div>
  );
}

export default function DesignSystemPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [chips, setChips] = useState<string[]>(["derm"]);
  const [otherOpen, setOtherOpen] = useState(false);
  const [demoPanelWidth, setDemoPanelWidth] = useState(SIDE_PANEL_DEFAULT_WIDTH);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [custom, setCustom] = useState("");

  return (
    <div className="min-h-screen bg-canvas">
      <ScreenHeader spread>
        <Row gap={2} align="baseline">
          <Text size="body-lg" weight="bold">SwishX design system</Text>
          <Text size="micro" tone="subtle">read from the live tokens</Text>
        </Row>
        <Text size="micro" tone="subtle" className="font-mono">/admin/design-system</Text>
      </ScreenHeader>

      <Container width="wide" className="py-8">
        <Stack gap={0} className="gap-10">
          <div>
            <Text as="h1" size="display" weight="extrabold" className="tracking-tight">
              Every token and component, in one place
            </Text>
            <Text as="p" size="body-lg" tone="subtle" className="mt-2 max-w-(--container-measure)">
              Build roughly 80% of any new screen from what is on this page. The
              remaining 20% will be genuinely new, and that is expected — the point
              is to stop re-inventing the 80% that already exists. Colour values
              below are read out of the running stylesheet, so this page cannot
              drift from the code.
            </Text>
          </div>

          <Section id="colour" n="01" title="Colour"
            note="Semantic, not decorative. ok/warn/danger/live are green, amber, red and green because those meanings are green, amber, red and green — the on-dark variants exist because the video canvas is dark, where the standard status colours are unreadable.">
            <Stack gap={6}>
              <div><Label size="micro" className="mb-2 block">Brand</Label><SwatchRow names={BRAND} label={short} utility={(n) => `bg-${short(n)}`} /></div>
              <div><Label size="micro" className="mb-2 block">Surfaces</Label><SwatchRow names={SURFACES} label={short} utility={(n) => `bg-${short(n)}`} /></div>
              <div><Label size="micro" className="mb-2 block">Ink ramp</Label><SwatchRow names={INK} label={short} utility={(n) => `text-${short(n)}`} /></div>
              <div><Label size="micro" className="mb-2 block">Hairlines</Label><SwatchRow names={HAIRLINES} label={short} utility={(n) => `border-${short(n)}`} /></div>
              <div><Label size="micro" className="mb-2 block">Brand tints</Label><SwatchRow names={TINTS} label={short} utility={(n) => `bg-${short(n)}`} /></div>
              <div><Label size="micro" className="mb-2 block">Status</Label><SwatchRow names={STATUS} label={short} utility={(n) => `text-${short(n)}`} /></div>
              <div><Label size="micro" className="mb-2 block">Info</Label><SwatchRow names={INFO} label={short} utility={(n) => `bg-${short(n)}`} /></div>
              <div><Label size="micro" className="mb-2 block">On dark</Label><SwatchRow names={ON_DARK} label={short} utility={(n) => `text-${short(n)}`} /></div>
              <div><Label size="micro" className="mb-2 block">Accents</Label><SwatchRow names={ACCENTS} label={short} utility={(n) => `text-${short(n)}`} /></div>
            </Stack>
          </Section>

          <Section id="type" n="02" title="Type scale"
            note="Eleven steps replacing 818 hand-typed sizes across 30 distinct values. Figtree throughout. Size only — line height stays an explicit leading-* choice, because the app already used those consistently.">
            <ScaleRow names={TYPE} />
            <Stack gap={2} className="mt-6">
              <Label size="micro">Tone × weight</Label>
              <Row gap={4} wrap>
                {(["default", "muted", "subtle", "faint", "brand", "brand-deep", "ok", "warn", "danger"] as const).map((t) => (
                  <Text key={t} size="body" tone={t} weight="semibold">{t}</Text>
                ))}
              </Row>
              <Row gap={4} wrap className="mt-1">
                {(["normal", "medium", "semibold", "bold", "extrabold", "black"] as const).map((w) => (
                  <Text key={w} size="body" weight={w}>{w}</Text>
                ))}
              </Row>
            </Stack>
          </Section>

          <Section id="shape" n="03" title="Shape, elevation, motion"
            note="Radii are named for what they wrap rather than by t-shirt size, so the name says where it belongs. Elevation has four neutral steps plus four purposeful ones.">
            <Stack gap={6}>
              <div>
                <Label size="micro" className="mb-2 block">Radii</Label>
                <Row gap={3} wrap>
                  {RADII.map((n) => (
                    <Stack key={n} gap={1} align="center">
                      <div className="size-16 bg-tint border border-tint-line squircle" style={{ borderRadius: `var(${n})` }} />
                      <Text size="micro" tone="subtle" className="font-mono">rounded-{short(n)}</Text>
                    </Stack>
                  ))}
                </Row>
              </div>
              <div>
                <Label size="micro" className="mb-2 block">Elevation</Label>
                <Row gap={4} wrap>
                  {SHADOWS.map((n) => (
                    <Stack key={n} gap={1} align="center">
                      <div className="size-16 bg-card rounded-panel squircle" style={{ boxShadow: `var(${n})` }} />
                      <Text size="micro" tone="subtle" className="font-mono">shadow-{short(n)}</Text>
                    </Stack>
                  ))}
                </Row>
              </div>
              <div>
                <Label size="micro" className="mb-2 block">Easing</Label>
                <SwatchRow names={EASINGS} label={short} utility={(n) => `ease-${short(n)}`} />
              </div>
            </Stack>
          </Section>

          <Section id="primitives" n="04" title="Primitives"
            note="Layer 1. These own every visual decision and expose it as a prop. A file in features/ should never need to know a colour, a font size, a radius or a shadow — if it does, a primitive is missing a prop.">
            <Stack gap={6}>
              <Spec label="Button — variant">
                {(["primary", "secondary", "soft", "ghost", "danger"] as const).map((v) => (
                  <Button key={v} variant={v}>{v}</Button>
                ))}
              </Spec>
              <Spec label="Button — size">
                {(["sm", "md", "lg"] as const).map((s) => <Button key={s} size={s}>{s}</Button>)}
                <Button size="icon" aria-label="Add"><Plus className="size-4" /></Button>
              </Spec>
              <Spec label="Button — shape (pill is the default, so existing calls are unaffected)">
                {(["pill", "control", "chip"] as const).map((s) => (
                  <Button key={s} shape={s} variant="secondary">{s}</Button>
                ))}
              </Spec>
              <Spec label="Button — state">
                <Button>enabled</Button>
                <Button disabled>disabled</Button>
                <Button fullWidth className="max-w-(--container-narrow)">fullWidth</Button>
              </Spec>

              <Spec label="IconButton — the circular chrome control (17 hand-rolled copies before this)">
                {([6, 7, 8, 9] as const).map((s) => (
                  <IconButton key={s} size={s} aria-label={`size ${s}`}><Sparkles className="size-3.5" /></IconButton>
                ))}
                {(["default", "brand", "danger"] as const).map((t) => (
                  <IconButton key={t} tone={t} aria-label={t}><X className="size-3.5" /></IconButton>
                ))}
              </Spec>

              <Spec label="Chip — tone (derived from all 84 real call sites)">
                {(["default", "brand", "ok", "warn", "danger"] as const).map((t) => (
                  <Chip key={t} tone={t}>{t}</Chip>
                ))}
              </Spec>
              <Spec label="Chip — selected">
                {(["default", "brand", "ok", "warn", "danger"] as const).map((t) => (
                  <Chip key={t} tone={t} selected onClick={() => {}}>{t}</Chip>
                ))}
              </Spec>
              <Spec label="Chip — size, and removable">
                {(["xs", "sm", "md", "lg"] as const).map((s) => <Chip key={s} size={s}>{s}</Chip>)}
                <Chip tone="brand" removable onRemove={() => {}}>removable</Chip>
                <Chip iconLeft={<Check className="size-3" />} tone="ok">with icon</Chip>
              </Spec>
              <Spec label="Chip — on dark grounds">
                <div className="flex gap-2 rounded-panel bg-ink p-3">
                  <Chip tone="dark">dark</Chip>
                  <Chip tone="dark" selected onClick={() => {}}>selected</Chip>
                  <Chip tone="overlay">overlay</Chip>
                </div>
              </Spec>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Field — bordered" placeholder="Search brand or molecule…" iconLeft={<Search className="size-3.5" />} hint="Label, hint and error are props, so the aria wiring cannot be forgotten." />
                <Field label="Field — error" defaultValue="Velmora" error="This brand already has a dossier." />
                <Field label="Field — bare" variant="bare" placeholder="Inline, no border…" />
                <Field label="Field — multiline" multiline rows={3} placeholder="Describe the brief…" />
              </div>

              <div>
                <Label size="micro" className="mb-2 block">Surface — tone × elevation × radius</Label>
                <Row gap={3} wrap>
                  {(["card", "canvas", "subtle", "tint", "ok", "warn", "danger"] as const).map((t) => (
                    <Surface key={t} tone={t} radius="panel" padding="md" elevation="soft">
                      <Text size="micro" weight="semibold">{t}</Text>
                    </Surface>
                  ))}
                </Row>
              </div>

              <Spec label="Modal — one shell for 13 hand-built dialogs; owns escape, focus trap, scroll lock and the scroll boundary">
                <Button variant="secondary" onClick={() => setModalOpen(true)}>Open modal</Button>
              </Spec>
            </Stack>
          </Section>

          <Section id="patterns" n="05" title="Patterns"
            note="Layer 2 — composites of primitives that still know nothing about the product. Only one of six planned patterns survived being counted: the others were either non-existent, already covered by a primitive, or not actually one shape.">
            <Stack gap={3}>
              <Label size="micro">ChipMultiSelect — the interaction the popover removal converged on</Label>
              <ChipMultiSelect
                size="md"
                options={[
                  { id: "derm", label: "Dermatology" },
                  { id: "onc", label: "Oncology" },
                  { id: "cardio", label: "Cardiology" },
                  { id: "neuro", label: "Neurology" },
                ]}
                selected={chips}
                onToggle={(id) => setChips((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id])}
                otherLabel="Other (Specify)"
                otherOpen={otherOpen}
                onToggleOther={() => setOtherOpen(!otherOpen)}
                customValue={custom}
                onCustomChange={setCustom}
                onCustomSubmit={() => { setCustom(""); setOtherOpen(false); }}
                customPlaceholder="Type a custom therapy area…"
                addLabel="Add Area"
              />
            </Stack>

            <Stack gap={2} className="mt-6">
              <Label size="micro">SidePanel — the right inspector, drag-resizable from its left edge</Label>
              <Text size="caption" tone="muted">
                Four screens had this aside byte-identical. Drag the edge, double-click it to reset
                to 410px, or focus it and use ←/→ (shift for 64px steps). The width persists per
                browser and is capped so the canvas beside it keeps at least 360px.
              </Text>
              <div className="flex h-40 overflow-hidden rounded-panel border border-hair">
                <div className="grid flex-1 place-items-center bg-canvas">
                  <Text size="caption" tone="muted">canvas</Text>
                </div>
                {/* maxWidth is capped for the demo box: the canvas floor is measured
                    against the viewport, which is right for the real screens (the
                    panel row IS viewport-wide) but too generous inside a card. */}
                <SidePanel width={demoPanelWidth} onWidthChange={setDemoPanelWidth} maxWidth={520}>
                  <div className="grid flex-1 place-items-center">
                    <Text size="caption" tone="muted">{demoPanelWidth}px</Text>
                  </div>
                </SidePanel>
              </div>
            </Stack>

            <Stack gap={2} className="mt-6">
              <Label size="micro">ActionBar — the pill that closes a canvas</Label>
              <Text size="caption" tone="muted">
                Status on the left, the stage&apos;s primary CTA on the right. Three canvases had
                this with three sets of hand-tuned pixels; they now share one. It is
                <code className="px-1">sticky mt-auto</code>, not fixed — it belongs to the
                scrolling canvas, so it never floats over the inspector, and only the pill takes
                pointer events so the canvas stays scrollable across its full width.
              </Text>
              <div className="flex h-32 flex-col overflow-hidden rounded-panel border border-hair bg-canvas px-4">
                <ActionBar
                  icon={<CheckCircle2 className="size-4.5 shrink-0 text-ok-on-dark" />}
                  title="Ready to generate script"
                  description="Grounded against 214 approved claims"
                  action={
                    <Button size="sm" shape="pill" className="shrink-0">
                      Confirm <ArrowRight className="ml-1.5 size-3.5" />
                    </Button>
                  }
                />
              </div>
            </Stack>

            <Stack gap={2} className="mt-6">
              <Label size="micro">Sheet — a panel with nowhere to dock</Label>
              <Text size="caption" tone="muted">
                <code className="px-1">Panel</code> in a fixed position: scrim, edge, escape to
                close, and no second scroll container. This is what the inspector becomes at
                tablet portrait. No production call site yet — it exists for the tablet tier.
              </Text>
              <div>
                <Button size="sm" variant="secondary" onClick={() => setSheetOpen(true)}>
                  Open a right sheet
                </Button>
              </div>
              <Sheet
                open={sheetOpen}
                onClose={() => setSheetOpen(false)}
                title="Inspector"
                description="Header pinned, body scrolls, footer pinned."
                footer={<Button size="sm" onClick={() => setSheetOpen(false)}>Done</Button>}
              >
                <Stack gap={2}>
                  {Array.from({ length: 14 }, (_, i) => (
                    <div key={i} className="rounded-control border border-hair bg-subtle px-3 py-2">
                      <Text size="caption" tone="muted">Row {i + 1} — the body is the only scroller</Text>
                    </div>
                  ))}
                </Stack>
              </Sheet>
            </Stack>
          </Section>

          <Section id="layout" n="06" title="Layout"
            note="ScreenHeader replaced five byte-identical copies. The content widths are for new work — existing max-w values were deliberately left alone, because unlike font sizes those are mostly intentional per context rather than drift.">
            <Stack gap={4}>
              <SwatchRow names={WIDTHS} label={short} utility={(n) => `max-w-(${n})`} />
              <div className="flex flex-col gap-2">
                {WIDTHS.map((n) => (
                  <div key={n} className="flex items-center gap-3">
                    <Text size="micro" tone="subtle" className="w-20 shrink-0 font-mono">{short(n)}</Text>
                    <div className="h-3 rounded-chip bg-tint border border-tint-line" style={{ width: `min(100%, var(${n}))` }} />
                  </div>
                ))}
              </div>

              <div className="mt-2 flex flex-col gap-2">
                <Label size="micro">Screen archetypes</Label>
                <Text size="caption" tone="muted">
                  Every workspace screen is one of two shapes. Both come from
                  <code className="px-1">WorkbenchLayout</code>, which owns the root column and the
                  row; each region owns its own element, width and scrolling. Regions are declared
                  as slots — header, rail, main, panel, overlay — so the tablet and phone tiers can
                  change how a region is presented without any screen knowing.
                </Text>
                {[
                  ["SplitLayout", "header + main + panel", "plan · creative plan"],
                  ["WorkbenchLayout", "header + rail + main + panel", "script/editor · creative studio"],
                ].map(([name, shape, used]) => (
                  <div key={name} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 rounded-control border border-hair bg-subtle px-3 py-2">
                    <Text size="caption" weight="bold">{name}</Text>
                    <Text size="caption" tone="muted" className="font-mono">{shape}</Text>
                    <Text size="micro" tone="subtle" className="ml-auto">{used}</Text>
                  </div>
                ))}
              </div>

              <div className="mt-2 flex flex-col gap-2">
                <Label size="micro">Responsive tiers</Label>
                <Text size="caption" tone="muted">
                  These drive presentation, not styling — styling stays in Tailwind&apos;s own
                  sm/md/lg. Below 1024 the inspector closes once on the way down; re-opening it is
                  a deliberate act and sticks. A panel width dragged wide on a large display is
                  re-clamped down when the viewport shrinks, never re-widened.
                </Text>
                {[
                  ["desktop", "\u2265 1280", "three columns, inspector open"],
                  ["laptop", "1024 \u2013 1279", "three columns, inspector open, width capped by the canvas floor"],
                  ["tablet", "768 \u2013 1023", "inspector auto-closes; becomes a Sheet in the tablet tier"],
                  ["compact", "< 768", "review only \u2014 the phone tier, not built yet"],
                ].map(([name, range, behaviour]) => (
                  <div key={name} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 rounded-control border border-hair bg-subtle px-3 py-2">
                    <Text size="caption" weight="bold" className="w-16 shrink-0">{name}</Text>
                    <Text size="caption" tone="muted" className="w-24 shrink-0 font-mono">{range}</Text>
                    <Text size="micro" tone="subtle">{behaviour}</Text>
                  </div>
                ))}
              </div>
            </Stack>
          </Section>

          <Section id="rules" n="07" title="The rules that keep it consistent"
            note="Enforced, not aspirational. The first four are ESLint errors in feature code because each is at zero violations; the rest are tracked by npm run lint:tokens.">
            <Stack gap={2}>
              {[
                ["never", "an arbitrary font size — text-[11.5px]", "use a scale step"],
                ["never", "bg-white", "use <Surface> or bg-card"],
                ["never", "border-black/10 or border-slate-200", "use border-hair / hair-2 / hair-3"],
                ["never", "an arbitrary [var(--token)] string", "the tokens generate real utilities"],
                ["never", "a Tailwind palette colour — text-emerald-700", "use ok / warn / danger / info / live"],
                ["never", "a raw hex in className", "unless it is illustration: a gradient or a mock fixture"],
                ["allowed", "a genuine one-off", "<Text px={42} />, or a className override — it merges last and wins"],
                ["rule", "the third copy stops being a one-off", "move it to patterns/ — two is a coincidence, three is a pattern"],
                ["rule", "no component ships without a count", "one shape repeating ~8+ times across 2+ files"],
              ].map(([kind, what, why], i) => (
                <Row key={i} gap={3} align="start" className="border-b border-hair py-2 last:border-0">
                  <Chip size="xs" tone={kind === "never" ? "danger" : kind === "allowed" ? "ok" : "default"} className="mt-0.5 w-16 justify-center">
                    {kind}
                  </Chip>
                  <div className="min-w-0 flex-1">
                    <Text size="body" weight="semibold">{what}</Text>
                    <Text as="p" size="micro" tone="subtle">{why}</Text>
                  </div>
                </Row>
              ))}
            </Stack>
          </Section>
        </Stack>
      </Container>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Modal shell"
        description="Escape, click-outside, scroll lock, initial focus and a Tab focus trap are all built in."
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setModalOpen(false)}>Confirm</Button>
          </>
        }
      >
        <Stack gap={3}>
          <Text size="body" tone="muted">
            The body is the only scroll container, and the header and footer stay pinned.
            That is deliberate: the popover-clipping bugs that took several passes to fix
            came from absolutely-positioned menus inside a scrolling dialog body.
          </Text>
          {Array.from({ length: 8 }).map((_, i) => (
            <Surface key={i} tone="subtle" radius="control" padding="sm" border={false}>
              <Text size="micro" tone="subtle">Scrollable row {i + 1}</Text>
            </Surface>
          ))}
        </Stack>
      </Modal>
    </div>
  );
}
