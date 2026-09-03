# SwishX design system — consolidation plan

Companion to `DESIGN.md` (principles) and `AGENTS.md` (product guardrails).
This document is the *mechanical* plan: how styling stops being distributed
across 69 files and becomes a set of components with properties.

Status: Phases 0, 1, 2, 3, 4 and 7 landed. Phase 5 was cancelled after
measuring (see below); Phase 6 screen decomposition is the only substantial
work left, and is deliberately deprioritised — see the note at the end.

---

## 1. Diagnosis — measured, not guessed

The problem is not file size. It is that **every visual decision is re-made at
each call site**, so there is no single place to change anything.

| Signal | Measured | What it means |
|---|---|---|
| Arbitrary px font sizes | **818 uses, 30 distinct values** (8.5px → 26px, in half-pixel steps) | There is no type scale. `text-[11.5px]` vs `text-[12px]` is a coin flip. |
| Uses of a real type scale | **12** | The scale is effectively unused. |
| `bg-white` literal | **272** | |
| `bg-[var(--card)]` / `--surface` | **0** | The surface token is **dead**. You cannot change the card colour from one place. |
| `border-[var(--line)]` | 77 | Two token names for one hairline value; |
| `border-[var(--hair)]` | 1 | the legacy alias won by accident. |
| Arbitrary radii | `[14px]`×32, `[24px]`×17, `[12px]`×15, `[18px]`×11, `[16px]`×9, `[10px]`×8, `[9px]`×6, `[6px]`×5 | 14/18/24/10 **are already tokens**, re-typed as literals. 12/16/9/6 are rogue values. |
| Raw `<button>` | **296** | |
| `<Button>` component | 79 | A good primitive exists and is bypassed **79% of the time**. |
| Raw `<input>` / `<textarea>` | 44 / 19 | No field primitive at all. |
| `role="dialog"` | 13 | No modal shell; 13 hand-built modals. |
| Pill/chip markup | 80 | No chip primitive — and chips are now a core interaction (post-popover redesign). |
| Uppercase tracking labels | 62 | No label primitive. |
| `border-black/N` | **211** | A *third* hairline family, found during the pilot. Of ~289 hairlines in the app only 78 use a token — the token is the minority at 27%. |
| `bg-black/N` | 119 | Ad-hoc scrims and hover fills, no token. |
| Arbitrary `shadow-[…]` | 46 uses, **29 distinct** | Elevation has 4 tokens and 29 ad-hoc shadows competing with them. |
| Default `rounded-*` | 269 | Plus 103 arbitrary px radii. Three radius systems running at once. |
| `components/ui/` | 6 files, 4 of them logos/icons | The library is ~1 real primitive. |
| `features/workspace/` | 27 files, **17,197 lines** (69% of all code) | One directory holds most of the product. |

**The core finding:** the token layer is fine, but the *consumption* layer
ignores it. 272 `bg-white` and 818 arbitrary font sizes mean tokens can't
propagate. Extracting components without fixing this just relocates the mess.

---

## 2. Target architecture

Three layers, strict dependency direction. Nothing ever imports upward.

```
src/components/
  ui/          Layer 1 — primitives. Zero product knowledge.
               Own every visual decision. Props, never className styling.
  patterns/    Layer 2 — composites of primitives. Still product-agnostic.
src/features/
  <domain>/    Layer 3 — product screens. Compose patterns + primitives.
               Should contain almost no raw visual values.
```

**Rule that makes it stick:** a file in `features/` should not need to know a
colour, a font size, a radius or a shadow. If it does, the primitive is missing
a prop. That is the test for whether Layer 1 is complete.

### Layer 1 — primitives to build

Ordered by call sites reclaimed, which is the honest priority order.

| Primitive | Replaces | Sites | Key props |
|---|---|---|---|
| `<Text>` | 818 arbitrary font sizes | **818** | `size` (scale step), `weight`, `tone` (ink ramp), `transform`, `as` |
| `<Surface>` | `bg-white` + border + radius + shadow combos | **272** | `elevation` (hair/soft/float/modal), `radius` (chip/control/panel/card), `padding`, `border` |
| `<Button>` (fix + adopt) | 296 raw `<button>` | **296** | existing `variant`/`size`; add `loading`, `iconLeft/Right`, `fullWidth` |
| `<Chip>` | 80 pill/chip markups | **80** | `selected`, `removable`, `size`, `tone`, `onRemove` |
| `<Field>` | 44 `<input>` + 19 `<textarea>` | **63** | `label`, `hint`, `error`, `multiline`, `size` |
| `<Label>` | 62 uppercase tracking labels | **62** | `tone`, `size` |
| `<Modal>` | 13 hand-built dialogs | **13** | `open`, `onClose`, `size`, `scroll`; owns focus trap + backdrop + squircle |
| `<Stack>` / `<Row>` | ad-hoc flex + gap | — | `gap` (spacing scale), `align`, `justify`, `wrap` |

`<Text>` and `<Surface>` alone cover **1,090 call sites** — more than half the
styling surface in the app. They are the whole game; build them first.

### Layer 2 — patterns to extract

Only patterns that genuinely repeat, confirmed by grep, not by intuition:

- `<SectionHeader>` — title + optional subtitle + right-slot actions
- `<AccordionStep>` — the numbered progressive-reveal step used by the dossier
  modal and the creation flow (already proven; the popover-free chip model from
  `2cbe807`/`b5ba0c3` lives here)
- `<ChipMultiSelect>` — chips + "Other" inline entry. This is the pattern the
  last five commits converged on; it should exist exactly once.
- `<OptionTileGroup>` — the audience/shape/format selector tiles
- `<EmptyState>`, `<StatusBadge>`, `<MetricTile>`

### Layer 3 — screen decomposition

Apply only *after* Layer 1 exists, so extracted components inherit clean
styling instead of freezing ported literals.

| File | Lines | Split into |
|---|---|---|
| `studio-screen.tsx` | 3,178 | `StudioHeader`, `ScenePlayer`, `SceneTimelineStrip`, `SceneInspectorSidebar`, `ClaimsCitationsDrawer`, `ScriptEditorPanel` |
| `directions-screen.tsx` | 2,290 | `VideoRouteCard`, `VisualTonePicker`, `DurationVoicePanel`, `StoryboardPreview` |
| `infographic-studio-screen.tsx` | 1,667 | `InfographicCanvas`, `NodeLayoutEditor`, `ExportPanel` |
| `dossier-wizard.tsx` | 1,612 | step components + `ClaimReviewTable`, `DocumentParsePanel` |
| `infographic-directions-screen.tsx` | 1,484 | `LayoutPresetGrid`, `AspectRatioPicker`, `TypographyHierarchyPicker` |
| `brand-dossier-modal.tsx` | 1,016 | `brand-modal-data.ts` + 4 step components |
| `create-screen.tsx` | 1,061 | `GoalSelector`, `AssetUploader`, `IntakeSummary` |

---

## 3. The one decision that needs your call

**Collapsing 30 font sizes into a scale is a visual change.** `text-[11.5px]`
becoming `12px` shifts roughly 250 elements by half a pixel each.

I recommend splitting this into two steps so it is never risky:

**Step A — mechanical, zero visual change.** Define all 30 existing values as
scale tokens (including the half-pixel ones, in a `legacy` tier) and codemod
every `text-[Npx]` to `<Text size="...">`. Byte-identical rendering; fully
verifiable. This unblocks everything.

**Step B — deliberate, reviewed visual change.** Collapse the legacy tier into
~8 real steps, with before/after screenshots per screen for your review.

Proposed final scale (usage counts from the current codebase):

| Step | px | Absorbs | Sites |
|---|---|---|---|
| `micro` | 9 | 8.5, 9, 9.5 | 82 |
| `caption` | 10 | 10, 10.5 | 179 |
| `label` | 11 | 11, 11.5 | 224 |
| `body-sm` | 12 | 12, 12.5 | 174 |
| `body` | 13 | 13, 13.5 | 83 |
| `body-lg` | 15 | 14, 14.5, 15, 15.5 | 33 |
| `title` | 17 | 16, 17 | 13 |
| `display` | 21 | 20, 22 | 12 |
| `display-lg` | 26 | 26+ | 3 |

Nine steps between 9px and 26px is still dense, but it matches a genuinely
information-dense pharma tool and is a 70% reduction from 30.

---

## 4. Phased execution

Every phase gates on: `npm run build`, `npx tsc --noEmit`,
`bun scripts/verify-demo-scenarios.ts`, and a visual check of touched screens.
Each phase is independently shippable and revertible.

### Phase 0 — finish the foundation *(partially landed in `0aa0e0d`)*
- [x] `@theme` wiring, real utilities, 5 undefined tokens fixed, easings deduped
- [x] `@theme` wiring, real utilities, 5 undefined tokens fixed, easings deduped
- [x] **Type scale** — ten steps, nearest-snap, size-only
- [x] **Stale greens** resolved: focus ring and demo orbit now follow the brand;
      `--color-live` and `--color-canvas-grid` tokenised but keep their values
- [x] `--shadow-sm` / `--shadow-lg` cascade override documented in-file
- [ ] Retire duplicate token names: `--line` → `--hair`, one name for the card
      surface, drop `--squircle-*` for `--radius-*`. Deferred to Phase 2 — the
      aliases cannot be removed until their 77 call sites are migrated.

**Two planned items turned out to be non-problems, and were dropped:**
- *A spacing scale.* `gap-*` already sits on Tailwind's scale
  (`gap-2` ×143, `gap-1.5` ×117, `gap-3` ×61) with only **4** arbitrary px
  gaps in the entire app. Spacing is already consistent.
- *Line-height in the type scale.* Tailwind v4 can pair a leading with each
  size step, but the app already uses named `leading-*` consistently across
  **73** sites. Bundling it into the scale would have silently restyled all
  of them, so the scale is size-only.

### Phase 1 — build `<Text>` and `<Surface>` *(landed in `e71670d`)*
- [x] `<Text>` (ten scale steps, tone, weight, leading, tracking, clamp,
      tabular) and `<Label>` for the 62-site uppercase eyebrow
- [x] `<Surface>` (tone, elevation, radius, padding, border, squircle)
- [x] Pilot on `create-screen.tsx`: 55 font sizes, 121 token vars, 5 radii and
      14 opaque `bg-white` migrated. The file now has **zero** arbitrary font
      sizes and **zero** `[var(--x)]` strings.

Left deliberately unmigrated in the pilot, because each needs a decision
rather than a rule:
- **3 rogue radii** (12px, 22px, 26px) — equidistant between tokens, so
  snapping either way is a guess
- **33 raw hexes across 27 distinct values** — mostly green-tinted near-whites
  from the same pre-orange family. These are a palette decision, not a codemod.
- **3 `bg-white/N` alpha overlays** — these lighten a tinted ground rather
  than paint a card surface, so they should not follow the card token

Verified in the running app: focus ring resolves to `#fd4816` at 34%, scale
tokens resolve, no stale green in any stylesheet, and the before/after on the
pilot screen shows sub-pixel type shifts with no layout reflow.

### Phase 2 — codemod the mechanical migration
818 font sizes and 272 surfaces cannot be hand-edited reliably. Write a
`jscodeshift`/`ts-morph` codemod for the deterministic cases only:
- `text-[Npx]` → `<Text size>` / `text-<step>`
- `bg-white` + border + radius → `<Surface>` props
- arbitrary radii `[14px]`/`[18px]`/`[24px]`/`[10px]` → token utilities
- rogue radii `[12px]`/`[16px]`/`[9px]`/`[6px]` → nearest token, **listed for review**
- `ease-[cubic-bezier(...)]` → `ease-entrance` / `ease-exit` (6 sites)
- `border-black/N` → `border-hair` / `border-hair-2` (211 sites), and retire
  the `--line` alias once its 77 sites are migrated
- the 29 distinct arbitrary shadows → the four elevation tokens, with any
  that do not map **listed for review** rather than snapped

The pilot showed the deterministic ratio is high: 195 of the 198 patterns in
`create-screen.tsx` migrated by rule, and the 3 that did not were genuine
decisions. Expect roughly that split across the rest.

Anything ambiguous is reported, not auto-changed. Run per-directory, commit
per-directory, so any regression is bisectable to one folder.

### Phase 3 — the remaining primitives
`<Button>` adoption (296 raw → component; also remove its internal `#842e2d`
hex and arbitrary sizes), `<Chip>`, `<Field>`, `<Label>`, `<Modal>`, `<Stack>`.
`<Modal>` is high value: 13 hand-built dialogs, and the popover-clipping class
of bug from the recent commits is a modal-scroll problem that a single shell
would solve permanently.

### Phase 4 — patterns layer — MOSTLY CANCELLED after measuring

Only one of the six planned patterns turned out to exist. `<ChipMultiSelect>`
was real and shipped (`dd11a6f`): written twice at two sizes, and the
interaction the popover removal converged on.

The other five were measured and rejected, with the counts:

| Planned | Measured | Verdict |
|---|---|---|
| `EmptyState` | 0 uses | does not exist |
| `StatusBadge` | 45 hits, but they are pill badges, icon wells, hover states and callout panels lumped together | redundant — `<Chip tone="ok">` already emits `border-ok-line bg-ok-bg text-ok` |
| `SectionHeader` | 20 hits, all differing in margin, leading and max-width | redundant — that is `<Text size="body" tone="subtle">` |
| `OptionTileGroup` | 97 hits, but the selected states are all different (`bg-brand text-white`, `bg-tint text-brand-deep font-bold`, `text-brand`, `currentColor`) | no shared shape |
| `AccordionStep` | 36 uses across **27 distinct shapes**, the commonest appearing 3 times | 27 one-offs, not a pattern |

The lesson is worth keeping: the earlier estimates for this phase came from
reading the screens, not counting them. Once counted, most of Layer 2 was
already covered by Layer 1, and the remaining work is **adoption of the
existing primitives, not new components**. Manufacturing the five would have
produced exactly the wrong abstractions this plan warns about elsewhere.

Rule going forward: no component ships without a count showing one shape
repeating at least ~8 times across at least 2 files.

### Phase 5 — screen decomposition
Largest first, but each screen only after its primitives exist. Pilot on
`brand-dossier-modal.tsx` (data extraction is a pure move with no visual risk).

### Phase 6 — lock it in
This is what stops the drift returning:
- ESLint rule: no `text-[…px]`, no `bg-white`, no `#hex`, no `[var(--…)]`
  inside `src/features/**` — with a short allowlist for genuine one-offs
- Optional: a `/tokens` route rendering every primitive × every prop, so you
  can eyeball the whole system on one page and experiment with props live

Phase 6 is the part that delivers what you actually asked for: change a
component's props in one place, see it everywhere.

---

## 5. Do NOT do these

Confirmed with the prior agent session, 2026-09-03:

1. **Do not extract a shared direction/route card.** `directions-screen` and
   `infographic-directions-screen` are intentionally divergent domains (video
   timeline/voiceover vs. static layout grids/aspect ratios), joined only by a
   branch at `directions-screen.tsx:194`. Coupling them is a wrong abstraction.
   The one genuinely shared piece is already extracted as `ResearchSourcesContent`.
2. **Do not refactor `home-screen.tsx`** (1,195 lines). It is legacy; the
   replacement is `home-screen-next.tsx` (337 lines). Finish wiring that instead.
3. **Do not change `--shadow-sm` / `--shadow-lg`.** They deliberately override
   Tailwind's own scale; ~35 call sites depend on it.
4. **Do not port more markup from `swishx-Content_updated 1.html`** without
   normalising to tokens. That prototype is the origin of the 777 hexes and
   1,155 inline styles.
5. **Do not do broad cross-codebase refactors in one commit.** Per-directory,
   per-phase, each with gates green.

---

## 6. Known pre-existing issue

`bun scripts/verify-demo-scenarios.ts` **fails on clean `main`**:

```
AssertionError: market-conflict: source conflict — false !== true
```

`deriveContentPlan()` returns a falsy `sourceConflict` for the `market-conflict`
scenario. Unrelated to styling, but it is the only automated demo gate and it is
red. Fix before demoing, and note the gate is not currently trustworthy as a
regression signal until it is green.

---

## 7. Sequencing summary

```
Phase 0  tokens          — low risk,  high unblock    ← finish here
Phase 1  Text + Surface  — low risk,  1,090 sites
Phase 2  codemod         — med risk,  mechanical bulk
Phase 3  primitives      — low risk,  296 + 63 + 80 + 13 sites
Phase 4  patterns        — med risk,  kills repeat re-solving
Phase 5  screens         — med risk,  file size finally drops
Phase 6  lint + gallery  — low risk,  prevents regression
```

Total surface: ~2,300 mechanical call-site migrations and ~25 new components.
Phases 0–2 deliver most of the consistency win; 3–5 deliver maintainability;
6 delivers the experimentation loop.


---

## 8. Where this ended up

Landed: the token foundation and type scale; `Text`, `Label`, `Surface`,
`Button`, `IconButton`, `Field`, `Chip`, `Modal`, `Stack`/`Row`, `Container`;
the layout layer; `ChipMultiSelect`; elevation tokens; the bulk codemod across
all 69 files; the ESLint guard; and `/admin/design-system`.

Eliminated entirely: arbitrary font sizes (818 -> 0), `[var(--x)]` strings
(1,311 -> 0), opaque `bg-white` (481 -> 0), `border-black/N` (283 -> 0), and
96% of the raw Tailwind palette classes.

**Phase 6 (screen decomposition) is deliberately left.** The two fixture
extractions were pure moves and shipped. Splitting the remaining JSX means
threading heavy shared state through new component boundaries — not a pure
move, and the same class of change that produced this session's three
regressions. It buys readability, not consistency, and consistency was the
goal. Worth doing, but as its own focused piece of work with the snapshot
harness in place, not as a tail-end task.

**What the session taught, worth keeping:**

1. Count before building. Five of six planned patterns did not survive being
   counted, and the Chip variants I guessed were wrong in two ways.
2. Never name a token after a framework keyword. `--container-full` silently
   hijacked `w-full` across 163 call sites.
3. Register custom scale names with tailwind-merge, or it misclassifies them
   and silently deletes the class you wanted.
4. Assert positively. Two verification passes in this session "passed" against
   a collapsed browser pane and a 500 page.
