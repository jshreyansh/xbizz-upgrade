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

## Decision discipline

- Recheck every major screen against the primary-user mental model before implementation.
- When the research or user intent is unclear, ask instead of confidently inventing a new interaction model.
- Preserve these constraints through future iterations unless the user explicitly changes them.
