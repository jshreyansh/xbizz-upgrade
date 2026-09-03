# SwishX product experience guardrails

These instructions apply to every product-design and frontend change in this workspace.

All interface work must also satisfy the principles, typography thresholds, viewport rules, and release checklist in `DESIGN.md`.

## Primary user and familiar ecosystem

- Design the default experience for pharma/life-sciences marketers and content leads.
- Assume strong familiarity with PowerPoint, Word, Microsoft Teams, SharePoint-style libraries, and Veeva/PromoMats review concepts.
- Do not assume familiarity with Adobe, Premiere, After Effects, Figma, agency creative-process language, prompt engineering, or production mechanics.
- Designers and agencies are important validators and power users, but they do not define the default interface.

## Product form factor

- The product should feel like familiar Office-style content work with SwishX intelligence embedded inside it.
- Use familiar objects: content, brief, source, scene, page, slide, version, comment, review, and export.
- Keep AI contextual. The user should work on the content object, not enter a separate AI operating mode.
- SwishX should infer production decisions and expose only decisions the marketer can meaningfully judge.
- Prefer one strong recommendation with editable assumptions. Alternatives are optional, not a mandatory choice ritual.

## Progressive depth

- Keep common editing simple: select, replace, rewrite, reorder, duplicate, comment, compare, and ask SwishX.
- Hide timelines, tracks, keyframes, detailed prompting, camera controls, and other production mechanics by default.
- Advanced controls may exist later as optional expert depth or external-tool handoff, never as the primary experience.

## Anti-patterns

- Do not turn agency pitch rituals, moodboards, or abstract creative-route vocabulary into required product steps.
- Do not imitate Adobe complexity merely because designers use Adobe.
- Do not create a ChatGPT-style blank front door.
- Do not use internal labels such as transform, adapt, ideate, or generate as the main navigation.
- Do not add a decision unless it materially changes the output and cannot be safely inferred.

## Design system: start here, not from scratch

**Open `/admin/design-system` first.** It renders every token, type step,
component variant, radius, elevation and layout width from the live code, so
it is always accurate. `npm run lint:tokens` shows what still needs migrating.

The point of this section is the 80/20 split. Roughly 80% of any new screen
should be assembled from the primitives below. The remaining 20% will be
genuinely new, and that is fine and expected — the goal is not to force
everything into components, it is to stop re-inventing the 80% that already
exists.

### Build from these first

| Primitive | Owns | Do not hand-roll |
|---|---|---|
| `<Text>` / `<Label>` | every font size, tone, weight, leading, tracking, clamp | `text-[13px]`, `text-slate-800` |
| `<Surface>` | fill, border, radius, elevation, padding | `bg-white` + `border` + `rounded-*` + `shadow-*` combos |
| `<Button>` | variant (primary/secondary/soft/ghost/danger), size, shape | a styled `<button>` |
| `<IconButton>` | the circular chrome icon control | `grid size-8 place-items-center rounded-full …` |
| `<Field>` | input and textarea, plus label/hint/error wiring | a styled `<input>` or `<textarea>` |

Type scale steps: `micro caption label body body-lg subhead title display
display-lg hero hero-lg`. Radii: `chip control panel card`. Elevation:
`shadow-hair soft float modal`. Easing: `ease-swish spring entrance exit`.

### Never introduce these

Each is an existing parallel system we are removing, not a style choice:

- an arbitrary font size — `text-[11.5px]`. Use a scale step.
- `bg-white` — use `<Surface>` or `bg-card`, so the surface stays changeable
  from one place.
- a raw hex — unless it is illustration (a `linear-gradient()` for artwork or
  a mock fixture), where hexes are correct and expected.
- `border-black/10` or `border-slate-200` — use `border-hair` / `border-hair-2`.
- a Tailwind palette colour (`text-emerald-700`, `bg-amber-50`) — use the
  semantic tokens: `ok` `warn` `danger` `live` `accent-blue` `accent-violet`
  `accent-amber`.
- an arbitrary shadow — use an elevation token.

### The 20%: how to do a legitimate one-off

One-offs are allowed. Make them visible rather than hidden:

- a size the scale cannot express: `<Text px={42}>`, which is greppable
- a local visual tweak: pass `className` to any primitive; it merges last and
  wins, so you never need to fork a component to adjust it
- something genuinely novel to one screen: build it in that feature folder,
  composed from the primitives

### Enforced by lint

The first four bans above are ESLint errors in `src/features/**` and
`src/app/**`, because each is at zero violations and can now only be a
regression. The rest are tracked as a burn-down by `npm run lint:tokens`;
when a row reaches zero, promote it into `BANNED` in `eslint.config.mjs`.

### Promotion rule

**The third time you write the same thing, it stops being a one-off.** Move it
into `src/components/patterns/` and replace the copies. Two copies is a
coincidence; three is a pattern, and patterns left in feature code are how
this codebase ended up with 818 hand-typed font sizes and four parallel colour
systems.

## Decision discipline

- Recheck every major screen against the primary-user mental model before implementation.
- When the research or user intent is unclear, ask instead of confidently inventing a new interaction model.
- Preserve these constraints through future iterations unless the user explicitly changes them.
