# SwishX interface principles

This document is the design contract for SwishX for Business. It applies to product architecture, interface design, prototypes, and production implementation.

## 1. Design for the person doing the work

The default user is a pharma or life-sciences marketer/content lead. Their familiar working environment is PowerPoint, Word, Teams, SharePoint-style libraries, and Veeva/PromoMats review—not Adobe production software or agency pitch rituals.

- Use familiar content objects: brief, source, scene, page, version, comment, review, and export.
- Let SwishX infer production mechanics and expose only decisions the user can judge confidently.
- Keep advanced production controls optional and out of the default path.
- When the intended mental model is unclear, pause and ask rather than inventing one.

## 2. One screen, one decision

Every step must have one primary question and one primary action.

- The primary action must be visible without hunting. On multi-section screens it remains in a persistent action bar.
- At 1440 × 900, the critical decision and its action must be usable without page scrolling.
- At shorter desktop heights, content may scroll but the primary action must remain visible.
- Secondary detail uses progressive disclosure: summaries first, expandable detail second.
- Do not repeat information unless the repetition helps the current decision.

## 3. Human-readable typography

Typography is a usability system, not decoration. These are minimum rendered desktop sizes:

| Role | Size | Typical use |
| --- | ---: | --- |
| Page title | 32–40px | The question or job of the screen |
| Section title | 20–24px | Major decision areas |
| Card title | 16–18px | Named objects and choices |
| Body | 15–16px | Explanations and content |
| Control text | 14–16px | Buttons, fields, tabs, selectors |
| Supporting text | 13–14px | Metadata and short helper text |
| Absolute minimum | 12px | Badges or tertiary metadata only |

- No functional or explanatory text may render below 12px.
- Default body line height is 1.45–1.6.
- Keep prose to roughly 45–75 characters per line.
- Weight, colour, and spacing may support hierarchy, but never compensate for unreadably small type.

## 4. Layout and density

- Use an 8px spacing rhythm, with 4px only for tight internal relationships.
- Group by task, not by data model.
- Prefer a compact summary over a tall stack of metadata.
- Keep critical controls within the natural top-to-bottom reading path.
- Interactive targets are at least 40px high on desktop and 44px on touch layouts.
- Avoid large empty regions that push the next decision below the fold.

## 5. SwishX intelligence should be inspectable

- Show what SwishX understood before it creates content.
- Give one strong recommendation and explain it in plain language.
- Let the user correct assumptions without restarting.
- Alternatives are optional; they must never become a mandatory creative-pitch ritual.
- Keep source coverage and review risk visible as concise status, with details available on demand.

## 6. Safe, reversible work

- Preserve the user’s brief, source, and decisions across steps.
- Explain the scope of an AI-assisted change before applying it.
- Preview consequential changes and make undo/version history available.
- Separate “save,” “send for review,” and “export” when they have different consequences.

## 7. Accessibility and feedback

- Meet WCAG AA contrast for text and essential controls.
- Provide visible keyboard focus and semantic labels.
- Never rely on colour alone for state.
- Respect reduced-motion preferences.
- Every interaction must acknowledge success, progress, error, or disabled state clearly.

## 8. Apple-informed shape and control grammar

Use Apple’s principles of hierarchy, concentricity, progressive disclosure, and control familiarity—not a cosmetic imitation of Apple products.

- Rectangular surfaces use one continuous-corner system: 14px controls, 18px nested panels, and 24px major cards. Nested curvature must be concentric with its parent and visibly inset; never place a hard rectangle edge-to-edge inside a curved card.
- True circles are reserved for avatars, radio indicators, icon-only controls, play controls, and status dots.
- Standalone text actions and horizontal action groups use capsules. Vertically stacked option rows use continuous rounded rectangles.
- Pop-up menus are for flat, mutually exclusive choices. They show a useful default, use radio semantics, close after selection, and render outside clipping containers.
- Show the current or recommended value first. Reveal alternatives only after the user chooses **Change**; reveal one decision at a time.
- Content surfaces use solid standard materials. Transient controls may use subtle translucency, but decorative glass must not compete with content.
- Maintain at least 40px desktop control height, visible focus, legible labels, and enough separation to prevent accidental activation.
- Use symbols to clarify meaning, never as generic AI decoration.

Relevant source guidance: [Apple design principles](https://developer.apple.com/design/human-interface-guidelines/design-principles), [layout](https://developer.apple.com/design/human-interface-guidelines/layout), [buttons](https://developer.apple.com/design/human-interface-guidelines/buttons), [pop-up buttons](https://developer.apple.com/design/human-interface-guidelines/pop-up-buttons), and [materials](https://developer.apple.com/design/human-interface-guidelines/materials).

## 9. Release checklist for every major screen

Before a screen is considered complete, verify:

1. Can a first-time user state what this screen is asking within five seconds?
2. Is there exactly one obvious primary action?
3. Is that action visible at 1440 × 900 and persistent on shorter desktop heights?
4. Is every functional text element at least 12px, with normal reading text at least 15px?
5. Can secondary detail be deferred or collapsed?
6. Does the screen use the marketer’s language rather than production jargon?
7. Are source status, review risk, and the effect of continuing clear?
8. Does keyboard focus follow the visual reading order?

## 10. Two-step creation decision engine

All content types use one intake path:

```text
request + source material + audience/use
  → interpret authority and confidence
  → ask only for high-impact uncertainty
  → confirm one recommended plan
  → create an editable storyboard/page sequence
```

The first screen must establish four semantic inputs: output type, product/source context, communication job, and audience/intended use. A value may be inferred, but a vague request must be clarified inline before the user advances. The second screen must never become a recovery form for weak intake.

Every derived value carries one visible provenance state: **from brief**, **from approved source**, **recommended**, or **needs your decision**. Prefilled values appear as summaries rather than open fields. One section is expanded at a time, and all summary actions must be functional.

### Dynamic relationship map

| Input signal | Derived or revealed decisions | Storyboard consequence |
| --- | --- | --- |
| Output type | Asset-specific treatment, format and unit model | Video scenes, carousel pages, infographic sections, or a visual composition |
| Approved dossier/claims | Product, market, current claims, safety and authority | Messages remain linked to evidence; conflicts use the current market source or require resolution |
| Brand kit/product library | Logo, packshot, typography and brand rules | Apply automatically; ask only for missing material |
| Existing asset | Reuse versus adapt intent, inherited structure and visuals | Preserve lineage and identify what changes |
| Communication job | Objective, topics, required message and CTA | Determines story priority and scene/page sequence |
| Audience | Vocabulary, evidence depth, fair balance and tone | HCP, patient, payer and field outputs use different language and proof density |
| Intended use/channel | Dimensions, length, captions and pacing | Meeting, social, congress and web outputs receive appropriate delivery defaults |
| Market | Authoritative source set, language candidates and local requirements | Flags incompatible sources and localization needs |
| Presenter-led video | Presenter, voice and setting become required | Presenter scenes replace or combine with generated visuals |
| Narrated video | Voice and language become confirmable; character stays hidden | Voiceover drives scene timing |
| Visual-only video | Voice and character disappear; on-screen copy and music become more important | Storyboard prioritizes readable copy and visual pacing |
| User-supplied script | Structure and length follow the script unless explicitly changed | Script is segmented into editable scenes rather than rewritten by default |
| Weak or missing approved source | Evidence readiness becomes a visible limitation | Permit a concept storyboard, never imply MLR readiness |

Decision policy:

- **High impact + low confidence:** ask before storyboard creation.
- **High impact + high confidence:** prefill, explain provenance, and allow correction.
- **Conditional:** reveal only after a parent choice makes it relevant.
- **Best judged in context:** defer to the storyboard.
- **Production machinery:** automate and keep out of the default marketer experience.

The second screen should normally contain no more than three unresolved decisions. More than three indicates inadequate intake or missing organizational context and should trigger focused clarification rather than a longer plan form.
