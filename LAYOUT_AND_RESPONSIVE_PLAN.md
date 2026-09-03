# Layout architecture and responsive plan

Companion to `DESIGN_SYSTEM_PLAN.md`. That one covered tokens and primitives.
This covers the structural layer — shells, panels, sidebars, headers, action
bars — and how the app becomes usable below desktop width.

---

## 1. Measured starting point

| Signal | Measured | Meaning |
|---|---|---|
| Responsive utilities | **125 total** — `sm:` 97, `lg:` 21, `md:` 7, `xl:` 0, `2xl:` 0 | Across 24,917 lines. The app is effectively desktop-only. |
| Fixed pixel widths | **69 uses, 34 distinct values** | These are the actual blockers; a `w-[390px]` panel cannot shrink. |
| `<aside>` panels | 3 shapes, **1 use each** | Not a repeated pattern. |
| Scroll panes | 4 uses, 3 shapes | Each 2- or 3-pane screen re-invents its scroll boundary. |
| Dark floating action bar | 2 uses, near-identical | The primary CTA affordance of the whole flow. |
| Routes on `AppShell` | 8 | The deep screens (studio, directions) bypass it with bespoke shells. |

**The important nuance:** by the counting rule in `DESIGN_SYSTEM_PLAN.md`
(one shape, ~8+ uses, 2+ files) almost none of these qualify as extractable
patterns. The shells genuinely are bespoke — studio is three-pane, directions
two-pane, mode-select a grid, intake a centred column.

So the case for layout components here is **not** deduplication. It is that
responsive behaviour needs one definition per archetype rather than 69
independent pixel widths. That is a different and valid reason, and it should
be stated rather than dressed up as reuse.

---

## 2. The four layout archetypes

Everything in the app is one of these:

| Archetype | Structure | Used by |
|---|---|---|
| **Shell** | left sidebar + topbar + scrolling main | 8 routes via `AppShell` — home, mode-select, creatives, dossiers, analytics |
| **Focus** | centred single column, no chrome | the brief/intake screen |
| **Split** | main canvas + right chat panel | directions, plan, blueprint |
| **Workbench** | left rail + canvas + right inspector | studio canvas editor, infographic studio |

---

## 3. Components to build, and why each earns it

### `<Panel>` — the highest-value one
Pinned header, **single** scrolling body, pinned footer.

`Modal` already implements exactly this internally. The right inspector panels
want the same contract, and so does a mobile sheet. Extracting it means the
scroll boundary is defined once.

That matters specifically: the popover-clipping bugs that took several passes
to fix came from absolutely-positioned menus inside a scrolling panel body.
One `Panel` makes that class of bug structurally impossible rather than
repeatedly fixed.

`Modal` then becomes `Panel` in an overlay; `Sheet` becomes `Panel` on an
edge; the inspector becomes `Panel` in a column.

### `<AppLayout>`
Formalises `AppShell` and owns the sidebar's collapse behaviour, so every one
of the 8 routes gets the same rule instead of none.

### `<SplitLayout>` and `<WorkbenchLayout>`
Own the pane sizing and the collapse order. Two components replacing 69
independent pixel widths with two responsive rules.

### `<ActionBar>`
The dark floating pill. Two near-identical uses today, but it is the primary
CTA affordance for the entire create → plan → script → publish flow, and on a
narrow screen it needs to become a full-width sticky footer. That transition
should exist once.

### `<Sheet>`
The narrow-screen counterpart of `Modal` and the right panel. Cannot be
retrofitted later without touching every panel, so it belongs in the same
piece of work.

---

## 4. Responsive strategy — three tiers, honestly scoped

The product ships **iPad detail aids** (`3:4 tablet`, `iPad 16:9`,
"multi-panel interactive iPad detailing"), so field use on a tablet is real.
Authoring a video canvas on a phone is not. Treating those the same would
waste most of the effort.

### Tier 1 — ≥1024px · tablet landscape and small laptops · **do this**
The two- and three-pane screens work at 1024 instead of assuming ~1500.
- rail and inspector get `min-w`/`max-w` instead of fixed widths
- canvas takes the remaining space
- sidebar collapses to icons
- **Highest value per unit of effort, and the least visual risk.**

### Tier 2 — 768–1023px · tablet portrait · **do this next**
- right inspector becomes a `Sheet` over the canvas
- left rail becomes a horizontal filmstrip above the canvas
- `ActionBar` becomes a full-width sticky footer
- sidebar becomes a drawer

### Tier 3 — <768px · phone · **read and review only**
Deliberately not authoring. You cannot meaningfully edit a scene canvas at
375px, and pretending otherwise is where responsive projects die.

Phone-worthy screens: the shared review view and MLR comments, dossier
browsing, analytics. Those are genuinely mobile moments — a medical reviewer
leaving a timestamped comment from a phone is a real use case.

Everything else shows a short "open on a larger screen to edit" state. That is
a product decision, not a failure.

---

## 5. Sequencing

| Step | Work | Risk | Notes |
|---|---|---|---|
| 8a | Extract `<Panel>`; refactor `Modal` onto it | low | Pure move; `Modal`'s internals already are this |
| 8b | `<AppLayout>`, `<SplitLayout>`, `<WorkbenchLayout>` at current widths only | low | Structure first, no responsive change yet — verifiable as a pure move |
| 8c | Adopt the three layouts in the 6 screens | medium | One screen per commit, snapshot-verified |
| 8d | `<ActionBar>` + `<Sheet>` | low | Additive |
| 8e | Tier 1 responsive (≥1024) | **medium — visible by definition** | Needs sign-off per archetype |
| 8f | Tier 2 responsive (768–1023) | medium | |
| 8g | Tier 3 phone review-only | low | New narrow states, does not touch desktop |

**8b is deliberately separated from 8e.** Introducing the layout components and
changing the responsive behaviour in one step would make any regression
impossible to bisect — which is exactly how this session's three regressions
happened.

---

## 6. The honest caveat

Steps 8e–8g **change the UI by definition.** Everything before now has been
consolidation with appearance preserved; responsive work is not that. Each
tier needs explicit sign-off, and each archetype should be reviewed at its
breakpoints before the next one starts.

The 69 fixed pixel widths are the concrete blocker. They are not drift the way
the 818 font sizes were — most were chosen deliberately for a desktop canvas.
They need replacing with min/max constraints, which is a design decision per
panel, not a codemod.
