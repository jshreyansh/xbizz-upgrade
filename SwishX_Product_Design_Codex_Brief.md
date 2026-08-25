# SwishX — Product Design & UX Strategy Brief
## Codex handoff: research → first principles → product architecture → next build

**Purpose:** This document is the consolidated brief for continuing the SwishX product-design work in Codex/React. It captures the reasoning developed across the original product critique, the provided prototype, the deep research, the existing SwishX screenshots, and the later first-principles discussion.

**Important:** This is a **product/UX strategy brief**, not a final UI specification. The goal is to give the builder enough context to make intelligent product decisions without having to reconstruct the entire conversation.

---

# 1. What SwishX is

SwishX is a **professional marketing content-asset creation platform for US life-sciences and pharma organizations**.

Its core job is to help pharma/life-sciences teams and specialist agencies create **high-quality marketing content assets** faster, with less production friction, while preserving professional creative control and pharma-specific source/brand context.

The product is primarily about **creation of visual marketing assets**:

- Video, including single videos, multi-video sets, series, playlists, cutdowns and variants.
- Image/visual content, including single images, image sets, carousels, infographics, visual PDFs, banners, social creatives and other designed visual assets.
- The existing product also contains broader content-type concepts such as Magic Aid, Magic Mail, Magic Canvas and Magic Doc; however, the current strategic scope is **not** to expand into campaign management, CRM, media, distribution or generalized content operations. These other modules are useful context for understanding the existing platform, but the immediate product-design work should concentrate on the **content-creation core**.

SwishX is **not** intended to be:

- a campaign-management platform
- a CRM
- a media-buying/distribution platform
- a marketing automation platform
- a general project-management system
- a replacement for the entire Veeva/MLR ecosystem
- a generic AI chatbot

Those systems and workflows matter only insofar as they create context or constraints for the asset-creation problem.

---

# 2. The original product problem

The original product had a large, form-heavy video-generation flow. The user had to traverse several stages and many sub-steps, including things such as:

- product / brand dossier
- audience
- objective/topic
- structure
- voice/language
- narrator/character
- background music
- script structure
- duration
- scene-by-scene narration
- visual prompt
- negative prompt
- on-screen text
- sound effects
- generation
- review

The source discussion identified the core problem very early:

> The current product is organized around the mechanics of generating a video. The user is actually thinking about the marketing job the video needs to accomplish.

The issue was therefore not simply “too many screens.” The deeper issue was that the product made the user understand the **production model** before the user could get value from the product.

The original flow effectively required:

**Content Studio → format/use case → source → brief → script → scenes → generate**

The design question became: how can the system keep the creative depth while removing the burden of manually configuring that depth?

Source: original user/product analysis and recorded-flow discussion. fileciteturn4file1L276-L336

---

# 3. The first major conceptual insight: user intent is higher-level than production configuration

A pharma marketer generally does not think:

> “I need a 60-second Product → Proof video with a particular script structure, narrator and voice configuration.”

They think things like:

> “We are launching this product and need an HCP video explaining why it matters.”

> “I need a KOL video introducing the new indication.”

> “I need a patient-facing disease-awareness video.”

> “Turn this approved scientific material into something the sales team can use.”

This established the first-principles rule:

## The format is downstream of the communication need.

However, later discussion refined this further: we **should not turn this principle into an unfamiliar abstract workflow vocabulary** such as “Create a set / Transform / Adapt.” Those may be useful internally as capability categories, but they are poor user-facing labels for this ICP.

That correction is important.

The product should not make users learn SwishX's internal ontology.

---

# 4. The ICP: four stakeholder groups, not one “user”

The priority hierarchy was clarified during the conversation.

## Priority 1 — Life-sciences/pharma executives: business / growth / commercial leadership

Role:

- economic buyer
- executive sponsor
- strategic decision-maker

What they care about:

- scale of content production
- cost
- speed
- quality
- business impact / ROI
- dependence on agencies
- governance / risk
- ability to increase content velocity

They are **not** the primary people who should operate the detailed creation interface.

The important product implication is that executive interest validates the business value of SwishX, but executive preferences should not dictate the daily creation UX.

The deep research described executives as wanting increased content output and ROI with predictable quality, rather than operating creation tools themselves. Confidence in this finding was assessed as high. fileciteturn4file0L12-L17

---

## Priority 2 — Life-sciences/pharma marketing teams and leads

Role:

- primary user
- adoption champion
- person who knows the content need
- person who initiates or coordinates the request

Typical mental model:

- brief
- audience
- product
- brand
- objective
- message
- source materials
- existing assets
- stakeholder feedback

Typical challenge:

They often know **what should be communicated**, but they may not have all the creative-production expertise to produce a professional asset themselves.

They may rely on:

- internal design teams
- specialist agencies
- freelancers / contractors
- combinations of internal and external resources

The deep research treated marketing as the primary user and gave this finding high confidence. It noted strong familiarity with Microsoft Office, PowerPoint, Word, Veeva, Teams/Slack and related enterprise tools. fileciteturn4file0L14-L19

---

## Priority 3 — Life-sciences/pharma design teams and leads

Role:

- creative authority
- design quality validator
- reviewer / refiner
- brand protector
- sometimes direct creator

Their mental model is visual and production-oriented:

- composition
- visual hierarchy
- references
- brand consistency
- typography
- layout
- motion
- pacing
- scenes
- creative quality

They are comfortable with sophisticated tools when the sophistication gives them meaningful control.

They are likely to be familiar with tools such as:

- Adobe Creative Cloud
- Figma
- PowerPoint
- specialized creative tools

The deep research described Design/Creative teams as quality gatekeepers who expect professional-level control and iterative refinement. fileciteturn4file0L16-L19

**Important design principle:** Do not simplify the product by stripping away creative depth. Instead, keep the surface understandable and make deeper control discoverable/progressive.

---

## Priority 4 — Specialist life-sciences/pharma agencies

Role:

- high-frequency creator
- power user
- expert benchmark for output quality
- often an external production partner for pharma clients

Agencies may produce many assets across many brands, giving them potentially far higher creation frequency than an individual in-house marketer.

Their mental model includes:

- brief
- strategy
- creative route
- production
- variants
- client feedback
- revisions
- delivery

They need:

- throughput
- creative control
- batch/variant capability
- high-quality output
- sophisticated controls
- fast iteration

The research described specialist agencies as producing broad asset spectra, including animations, patient films, eDetails, decks, infographics and more. Confidence was medium because much of this evidence came from agency capability descriptions rather than direct behavioral studies. fileciteturn4file0L16-L19

Earlier discussion also established a useful distinction:

**Agency:** less hand-holding, more throughput and control.

**In-house pharma marketing/design:** more guided assistance, safe defaults, recommendations and source-aware generation.

This is a hypothesis to preserve and test, not a rigid product split yet. fileciteturn6file0L11-L25

---

# 5. The most important buyer/user/validator relationship

A useful system model is:

```text
Executive
   ↓
Business/content need
   ↓
Marketing
   ↓
SwishX
   ↓
Design / agency review + refinement
   ↓
Professional asset
```

More precisely:

- **Executive:** economic buyer / sponsor
- **Marketing:** primary user / adoption champion
- **Design:** quality authority / validator / refiner
- **Agency:** high-frequency expert user / benchmark / external producer

The same content object may move between these people.

Therefore SwishX is not optimizing for one persona; it is optimizing for **one content-creation system that supports different depths of participation in the same asset**.

---

# 6. Evidence about the existing tool ecosystem

One of the most important findings from the research was that this ICP is not software-naive.

They are often highly literate in a particular enterprise software ecosystem.

The important tools and the mental models they represent are:

## PowerPoint

Represents:

- briefs
- storytelling
- presentations
- communication
- review
- structured pages/slides
- visual narrative

It is a particularly important mental-model reference for marketing teams.

The research identified PowerPoint as a “lingua franca” for briefs and storytelling and repeatedly found it in life-sciences job descriptions and workflows. fileciteturn4file0L19-L21

## Word / Docs

Represents:

- source content
- detailed instructions
- manuscripts
- scientific content
- formal briefs

## Adobe Creative Cloud

Represents:

- professional craft
- precise editing
- composition
- motion
- image manipulation
- high creative control

## Figma

Represents:

- collaborative design
- visual systems
- shared workspace
- comments
- versioning
- direct manipulation

## Canva

Represents:

- ease of use
- templates
- approachable creation
- quick branded visuals
- empowering non-designers

## Veeva Vault / PromoMats

Represents:

- pharma-native content governance
- review
- claims
- evidence
- versioning
- compliance context

A key principle from the research:

> Users can tolerate complexity when the purpose of the complexity is obvious and business-critical.

MLR/compliance fields can be tolerated because people understand why they exist. Arbitrary production configuration is much less tolerable.

## Teams / SharePoint / Slack

Represent:

- collaboration
- file exchange
- feedback
- work coordination

These are not creation models to copy literally, but they are part of the ecosystem around the asset.

## Current generative-AI tools

Examples considered:

- ChatGPT
- Claude
- Adobe Firefly
- Runway
- HeyGen
- Synthesia
- Canva AI

The research suggested a tension:

**High interest in AI + lower comfort operating AI directly.**

The relevant principle is therefore not “teach pharma users prompting.” It is:

> **Give them the leverage of AI without requiring them to become AI operators.**

Source: research synthesis and product discussion. fileciteturn4file0L19-L21

---

# 7. Why familiar form factor matters

This was one of the most important corrections made during the later discussion.

We experimented with abstract workflow concepts such as:

- Create
- Create a set
- Transform
- Adapt
- Refine

That was rejected as user-facing product structure because these are **internal capability descriptions**, not concepts users are likely to seek in a navigation system.

A pharma marketer will not naturally think:

> “I want to Transform.”

They are more likely to think:

> “I have this PowerPoint and want a video.”

or:

> “I need a carousel.”

or:

> “Make an infographic from this scientific material.”

or:

> “I need a short video.”

Therefore:

## User-facing information architecture should use familiar nouns and objects.

Examples of familiar product models:

- document
- presentation
- page
- slide
- canvas
- scene
- timeline
- asset
- version
- template
- project

The abstract operations can remain **capabilities underneath** the UI.

---

# 8. Existing SwishX platform screenshots: what they tell us

The current platform screenshots show five major product families:

- **Magic Video**
- **Magic Aid**
- **Magic Mail**
- **Magic Canvas**
- **Magic Doc**

Each contains specific output types.

Examples from the screenshots:

### Magic Video

- Short Video
- Digital Twin Master Video
- Announcement Video
- Broadcast / DTC Video Ad
- MOA / Explainer Animation
- Webinar & Event Video
- Patient Story Video

### Magic Aid

- Interactive Visual Aid
- e-Detail / Remote Deck
- Leave-Behind
- Reprint Carrier
- Dosing & Titration Guide
- FAQ / Objection Handler

### Magic Mail

- Approved Email
- Multi-touch Campaign
- e-Newsletter

### Magic Canvas

- Infographic
- Detail Aid
- Banner / Display Ad
- Journal / Print Ad
- Social Post / Campaign
- Savings / Co-pay Card
- Congress Poster / Booth
- Point-of-Care Asset
- Web Destination

### Magic Doc

- Product Monograph
- HCP / Sales Brochure
- Patient Brochure / Leaflet
- AMCP / Formulary Dossier
- MSL / Medical Deck
- KOL / Speaker Deck
- White Paper / Publication Summary

The screenshots also use filters such as:

- Objective: Awareness / Consideration / Trial-Adoption / Adherence-Loyalty
- Audience: HCP / Patient / Payer

This shows the original product was organized around a combination of **content output type + marketing funnel objective + audience**.

That taxonomy is valuable, but it mixes several different dimensions.

The deeper critique is:

- Video = medium
- Canvas = medium/creation environment
- Aid = business artifact
- Mail = delivery/output class
- Doc = document family
- Objective = strategic intent
- Audience = audience

Therefore this is not a single clean hierarchy.

It is a **content catalogue / output taxonomy** with several dimensions embedded in it.

That catalogue should not simply be deleted. Instead, it should be separated from the **creation interaction model**.

---

# 9. The key distinction: content taxonomy vs creation flow

This is probably the most important conceptual synthesis of the whole project.

## The existing five-format taxonomy answers:

> **What kinds of content can SwishX make?**

## The creation flow needs to answer:

> **How can I get this content made?**

These should not be identical.

The platform can maintain a broad supported asset taxonomy while giving the user a very small number of familiar ways to start and work.

---

# 10. The funnel taxonomy is also useful — but not as the primary navigation

The existing system uses marketing funnel stages:

- Exposure / Awareness
- Attention / Consideration
- Convincing / Trial / Adoption
- Retention / Adherence / Loyalty

This is useful because it reflects how marketing work is often reasoned about.

But the user does not necessarily enter the product thinking:

> “I need a consideration-stage asset.”

They are more likely to think:

> “I need an HCP explainer.”

or:

> “I need a launch video.”

Therefore:

## Funnel stage = context / metadata / filtering / strategy.

It should not necessarily become the first creation decision.

---

# 11. The core first-principles model

The product should be built around a simple distinction:

## Human responsibility

The human knows:

- why the asset exists
- who it is for
- what matters
- what is strategically important
- whether the result is good
- what needs to change

## AI responsibility

The system can determine or assist with:

- structure
- script
- scene decomposition
- visual treatment
- tone defaults
- narration defaults
- timing defaults
- prompt architecture
- shot construction
- asset variants
- format adaptations

The product principle is:

> **The AI owns production complexity; the human owns judgment.**

This is the strongest product philosophy from the research.

Source: original research synthesis. fileciteturn5file0L452-L500

---

# 12. The dependency-tree principle

The current configuration has many questions, but the questions are not independent.

They form a dependency graph.

For example:

```text
Brand dossier
   ↓
Product / claims / terminology / assets / brand direction
   ↓
removes manual questions

Audience
   ↓
changes tone / language / structure / visual treatment

Objective
   ↓
changes narrative structure / CTA / pacing

Use case
   ↓
changes whether narrator / KOL / animation / patient story is relevant

Channel / format
   ↓
changes aspect ratio / duration / pacing
```

Therefore:

> **An earlier answer should be allowed to eliminate, default, or transform later questions.**

This is a core product algorithm, not just a UI pattern.

The original research eventually reduced the conceptual hierarchy to:

```text
1. WHAT ARE WE MAKING?
        ↓
2. WHAT SHOULD IT SAY?
        ↓
3. HOW SHOULD IT FEEL?
        ↓
4. MAKE IT
        ↓
5. MAKE IT RIGHT
```

But importantly, these five stages should mostly be **the system's internal mental model**, not a visible five-step wizard.

Source: dependency-tree discussion. fileciteturn6file0L268-L321 and fileciteturn6file0L611-L650

---

# 13. Progressive disclosure: fewer initial decisions, not fewer capabilities

A critical correction from the earlier prototype work:

Do not interpret simplicity as “remove creative controls.”

The better principle is:

> **Don't demand advanced decisions before the user has something worth judging.**

The research hypothesis is:

**Configure everything → Generate** is inferior to:

**Describe intent → AI proposes a plan → Generate → Judge → Refine → Go deeper when needed.**

Designers and agencies can still get:

- scene control
- visual prompt control
- timing
- camera/motion
- reference imagery
- voice
- narration
- composition
- advanced editing

But these are revealed when the user has a concrete object in front of them.

Source: original research synthesis. fileciteturn5file0L452-L500

---

# 14. Do not make SwishX a giant ChatGPT-style blank chat box

The prior reasoning was explicit that pure conversational AI would create a new problem:

The user now needs to know **what to ask**.

Better:

### Structured UI for decisions the user should not invent

Examples:

- audience
- objective
- output type
- source
- high-level creative route

### AI for solving the production problem

### Conversation for refinement

Therefore:

> **UI = constrain the problem**

> **AI = solve the problem**

> **Conversation = refine the solution**

Source: original design reasoning. fileciteturn4file1L562-L630

---

# 15. The source/dossier should be a context layer, not just an upload field

One of the strongest pharma-specific ideas is that a **brand dossier / source of truth** should not merely be another file attachment.

The system should be able to derive:

- product
- indication
- approved terminology
- claims
- brand language
- visual identity
- assets
- source references

If the context already tells SwishX something, SwishX should not ask the user again.

Example:

> “Create a launch video for dermatologists.”

If the dossier already establishes the product, indication, brand, claims and audience context, the system may already know most of the production setup.

The remaining user decision could simply be:

> **Which creative direction?**

For example:

- Science-led
- Patient-problem-led
- Product-benefit-led

Source: research synthesis. fileciteturn6file0L85-L166

---

# 16. The source/intent/direction/generation/studio/review model

The prior research arrived at a useful conceptual flow:

```text
SOURCES
Dossier / Assets / References
        ↓
INTENT
“What are we trying to make?”
        ↓
DIRECTION
AI proposes 2–3 creative routes
        ↓
GENERATE
Storyboard / script / visuals
        ↓
STUDIO
Storyboard + asset + AI + controls
        ↕
EDIT / REGENERATE
        ↕
REVIEW
        ↓
APPROVE / EXPORT
```

This should be treated as **architecture**, not necessarily literal navigation.

Source: original research synthesis. fileciteturn6file0L170-L224

---

# 17. Generation must not be a destination

This is perhaps the single strongest product architecture principle.

Old model:

**Inputs → Generate → Result**

New model:

**Intent → AI builds → Result becomes the workspace**

Once generation occurs, the user should not have to navigate backwards through upstream configuration screens to modify the result.

The storyboard, video/image, script, asset references, AI conversation and controls should all become views of **the same content object**.

For example:

> “Scene 3 should be more scientific.”

should cause:

**Scene 3 → regenerate → asset updates**

not:

**leave asset → go back to scene configuration → edit prompt → regenerate → return to asset**.

Likewise:

> “Make the whole video 45 seconds.”

should allow the system to update storyboard, script, scene durations and pacing together.

Source: architecture discussion. fileciteturn6file0L228-L266

---

# 18. The workspace form factor should borrow from familiar professional tools

This is the major lesson from the later discussion.

The interface should not look like a new abstract AI category.

It should feel like a **modern professional creative application that happens to have a highly intelligent AI collaborator inside it**.

## Inspiration from PowerPoint

Use familiar concepts such as:

- slides/pages
- thumbnails
- duplicate
- reorder
- layouts
- content blocks
- present/export

This is especially useful for:

- carousels
- slide/deck content
- page-based visual documents
- visual PDFs

## Inspiration from Word

Use familiar concepts such as:

- source document
- file-based creation
- structured content
- editing
- document preview

## Inspiration from Figma

Use:

- canvas
- direct manipulation
- shared objects
- iteration
- comments/review
- reusable systems

## Inspiration from Adobe

Use:

- professional control
- visual precision
- advanced editing
- layers/timing/composition where appropriate

## Inspiration from Canva

Use:

- recognizable starting points
- templates
- approachable creation
- fast time-to-first-useful-result

## Inspiration from Veeva

Borrow:

- context-aware source grounding
- claims/evidence awareness
- versioning mindset
- governed professional confidence

Do **not** copy the complexity of any one product blindly.

The goal is:

> **Familiar mental model + SwishX intelligence.**

---

# 19. User-facing taxonomy vs internal capabilities

This is a critical distinction for Codex.

## Do NOT use these as primary navigation labels:

- Create a set
- Transform
- Adapt
- Refine
- Generate
- Ideate

These are useful internal capability/workflow labels for product architecture, analytics and engineering.

They are not necessarily natural user-facing nouns.

## Prefer user-facing concepts such as:

- New content
- Video
- Visual
- Carousel
- Infographic
- Presentation
- Document
- Start from existing content
- Duplicate / Create version
- Edit
- Export

The user should feel that they are **making a thing**, not executing an AI operation.

---

# 20. The current five product families should not simply disappear

The existing platform's taxonomy has value because it reflects real content types.

The better move is to treat the current five families as a **supported asset catalogue**, while changing how users enter and work within those assets.

Possible internal model:

```text
SWISHX
  ↓
Content Studio
  ↓
New / Open existing
  ↓
Choose familiar asset type
  ↓
Video / Visual / Presentation / Document / etc.
  ↓
Start from blank / template / source file / existing asset
  ↓
Studio
```

The exact labels and count are still open for iteration.

---

# 21. Proposed conceptual architecture for the product

The current thinking is closer to:

```text
                       SWISHX
                          │
                 CONTENT STUDIO
                          │
                     + NEW / OPEN
                          │
          ┌───────────────┼────────────────┐
          │               │                │
        VIDEO           VISUAL         DOCUMENT
          │               │                │
       formats         formats          formats
          │               │                │
          └───────────────┼────────────────┘
                          ↓
                     SWISHX STUDIO
                          │
             ┌────────────┼─────────────┐
             ↓            ↓             ↓
           Object       Canvas        AI
           editing     /timeline    assistant
             │            │             │
             └────────────┼─────────────┘
                          ↓
                    Variants / reuse
                          ↓
                       Export
```

This is deliberately conceptual.

The next prototype should validate the **interaction model**, not freeze the navigation taxonomy.

---

# 22. The core content-creation loop

The most important loop SwishX must make exceptional is:

> **I have a marketing need → I provide enough context → SwishX understands it → I get a strong first result → I can judge it → I can change it naturally → I can get it to professional quality → I can export/reuse it.**

The product's success should therefore be judged by:

- time to first useful output
- time to professionally usable output
- number of unnecessary configuration decisions
- number of regeneration cycles
- ease of refinement
- quality judged by design/creative experts
- ability to maintain brand/source context
- ability to create useful variants without restarting

The research suggested useful pilot metrics such as speedup, quality rating, time-to-brief and review-cycle count. fileciteturn4file0L178-L184

---

# 23. Workflow priority: the evidence-backed candidate P0s

The deep research produced a provisional workflow ranking.

The highest-scoring buckets were:

| Workflow | Weighted score | Status |
|---|---:|---|
| Multi-Asset / Variants | 4.8 | P0 |
| Asset Creation (brief → asset) | 4.6 | P0 |
| Ideation / Creative Direction | 4.4 | P0 |
| Content Adaptation / Repurposing | 4.4 | P0 |
| Review & Compliance | 4.1 | P0 in research; likely supporting depth rather than front-door entry |
| Editing & Refinement | 4.0 | P1 in research; still essential inside the studio |

The weighting used in that report was designed to reflect stakeholder influence, with Marketing and Agency heavily weighted. The scores are analyst synthesis rather than directly measured usage statistics and therefore should be treated as directional. fileciteturn4file0L46-L59

---

# 24. Asset-type evidence and caution

The research generated a provisional asset opportunity ranking, including:

- short social images
- image carousels
- infographic / visual PDF documents
- presentation decks
- long-form/single video
- video series / variants

The report ranked several as P0.

However, the report explicitly notes that there is **not enough hard usage data to treat the numeric asset scores as absolute market truth**. They are a synthesis of frequency, pain, value, AI fit, differentiation and strategic pull. fileciteturn4file0L78-L93

This distinction matters for design:

**Do not overfit the UI to the exact numerical rankings.**

The deeper strategic conclusion is more important:

> Images, visual multi-asset outputs, infographics, videos and video variants all matter, but they should be unified by a common creation/editing model rather than each becoming a separate AI wizard.

---

# 25. One source of uncertainty: “video vs image” is not the final product taxonomy

The research suggested that users may organize their work more naturally around:

- audience
- communication job
- source material
- creative archetype
- existing asset
- desired output

rather than purely:

- video
- image

However, the later interface discussion established that we should **not respond by inventing abstract workflow labels** either.

The correct synthesis is:

### User enters through a familiar content object.

Then:

### SwishX uses the richer semantic model behind the scenes.

Example:

User chooses:

> **New Video**

Then says:

> “Make a 60-second HCP launch video from this deck.”

The system internally understands:

- audience = HCP
- objective = launch
- source = deck
- likely structure = launch narrative
- likely tone = professional
- likely visual treatment = brand/scientific
- etc.

The user does not need to see the ontology.

---

# 26. Creation should feel like a familiar professional app

### For video

The workspace should likely have:

- scene/shot list on the left
- main video preview/canvas in the center
- contextual AI/inspector on the right
- timeline/assets along the bottom where useful

The important principle is **not** the exact three-column layout.

The important principle is:

> The video is the workspace.

The story structure and creative controls stay attached to it.

### For page/visual assets

A familiar canvas/page model is appropriate.

For a carousel, for example:

- pages/thumbnails
- central canvas
- properties/AI assistance

This is strongly analogous to PowerPoint/Figma/Canva.

### For document-like outputs

Use a page-oriented model closer to Word/PowerPoint/PDF authoring.

---

# 27. AI should be embedded, not treated as a separate destination

The user should not have to decide:

> “Now I will use AI mode.”

AI should be available everywhere relevant.

Examples:

- “Generate three title alternatives.”
- “Make this scene simpler.”
- “Use a more scientific visual.”
- “Create the next three carousel pages in this visual system.”
- “Turn this page into a short video.”
- “Create a patient version.”
- “Keep the same brand treatment but make it more human.”

The AI should operate on the actual content object.

---

# 28. What the studio must NOT do

Do not make the user:

- leave the asset to find scene configuration
- return to an upstream prompt screen to change a result
- re-enter context that SwishX already knows
- manually configure every downstream production primitive
- become a prompt engineer to get basic quality
- understand SwishX internal terminology to navigate the product

The old problematic pattern was:

**Generate → leave video → change scene stage → modify prompt → generate → return**

That should be eliminated. fileciteturn5file0L830-L848

---

# 29. What should remain advanced / progressive

For designers and agencies, deeper controls should eventually include:

- scene-level control
- visual prompting
- negative prompting if useful
- timing
- camera/motion
- typography
- layout
- narration
- voice
- reference imagery
- direct manipulation
- versions
- comparison

But these should not dominate the entry experience.

---

# 30. “Creation vs review vs everything else” — the product-depth principle

We discussed that not every platform module deserves equal design attention.

There is a difference between:

### High-frequency core creation flows

These deserve the best interaction design and most product depth.

### Supporting workflow flows

These need to be solid but should not consume the bulk of the interface.

### Infrastructure

Examples:

- brand library
- dossier library
- settings
- account configuration
- claims library administration
- campaign management
- broader activation modules

These are important for the platform but are **not the core problem to solve in the current phase**.

The user was explicit:

> If the actual creation experience cannot reach professional quality in less time, less money and with more creative control, the surrounding modules do not matter yet.

This is the working prioritization rule.

---

# 31. What SwishX should be exceptionally good at first

The research and reasoning converge around a compact core:

## P0 core capability family 1 — Brief/source → professional first asset

Examples:

- brief → short video
- source deck → explainer video
- scientific source → infographic
- source material → carousel
- brand brief → visual asset

The user provides a small amount of context and SwishX does the production decomposition.

## P0 core capability family 2 — Multiple creative directions

SwishX should be able to say:

> “Here are three strong routes.”

Rather than forcing the user to engineer a prompt.

The user selects or modifies the direction.

## P0 core capability family 3 — Coherent multi-asset creation

One creative need can produce a family of related assets.

This is not a “campaign manager” feature.

It is a **creative consistency / production scalability** feature.

Examples:

- hero video + cutdowns
- image family
- carousel + infographic
- video + social visual set

## P0 core capability family 4 — Existing asset → new usable creative

Examples:

- PPT → video
- deck → carousel
- document → infographic
- existing video → short cut
- approved visual → new format

This is a major potential differentiator.

## P0 core capability family 5 — Fast coherent variants

Examples:

- different audiences
- different sizes/aspect ratios
- alternate versions
- creative variations
- short/long versions

## P0 core capability family 6 — Continuous refinement studio

The user should be able to get from first draft to professional result without leaving the content workspace.

---

# 32. Important: these capabilities should not necessarily become six top-level tabs

This is a key handoff instruction.

Internally the platform may model:

- create
- ideate
- transform
- adapt
- review
- refine
- reuse

But the user-facing experience should remain familiar.

A likely user journey is much closer to:

```text
Content Studio
    ↓
New / Open existing
    ↓
Choose the thing you are making
    ↓
Give SwishX the brief/source/context
    ↓
AI proposes the direction
    ↓
First result
    ↓
Work on the result
    ↓
Make variants / reuse / adapt
    ↓
Export
```

This is deliberately expressed in familiar terms.

---

# 33. The “first screen” principle

The initial creation surface should be extremely small.

A prior video-specific version proposed roughly:

### What do you want to make?

[Describe your video…]

### Brand / Source

[Upload dossier] [Choose from library]

### Audience

[HCP]

### Format

[16:9]

Optional duration if necessary.

Everything else should be inferred unless it materially changes the output.

This is particularly important because if the system receives:

> “I want a 60-second HCP launch video for Product X.”

it can likely infer:

- audience
- objective
- professional tone
- likely structure
- visual direction
- narrator style
- music defaults
- approximate scene count
- CTA style

The user should not have to fill those fields manually.

Source: dependency-driven flow analysis. fileciteturn5file0L675-L777

---

# 34. Creative Plan as the trust checkpoint

Before expensive generation, SwishX can present a concise “what I understood” layer:

**Goal**

Launch Product X to dermatologists.

**Audience**

US dermatologists.

**Core message**

…

**Creative direction**

Premium scientific explainer.

**Structure**

1. Clinical problem
2. Unmet need
3. Mechanism
4. Evidence
5. Product
6. CTA

**Length**

60 sec.

Then:

**Looks good → Generate**

or:

**Change direction**

This is the missing trust layer between “I told you what I need” and “you just spent generation credits.”

---

# 35. Why this is different from a wizard

The system may internally have stages, but the user should not feel like they are filling a form.

The experience should feel like:

1. Tell the system enough.
2. See what it understood.
3. Choose/adjust the creative direction.
4. Get the work.
5. Work on the work.

That is a **creative collaboration loop**, not a configuration wizard.

---

# 36. Agency mode vs in-house mode: working hypothesis

A single core product can support both, but the depth can change.

## In-house marketing/design

Default toward:

- guided suggestions
- safe defaults
- source-aware generation
- explainability
- quick creative routes
- easy editing
- clear structure
- professional but approachable controls

## Specialist agency

Default toward:

- speed
- batch creation
- powerful controls
- reusable systems
- variants
- efficient review
- fast access to deeper settings

The agency does not necessarily need a fundamentally different product. It needs **lower friction to expertise**.

---

# 37. What we learned from current AI creative products

The research considered Runway and HeyGen as useful interaction references, but **not as models to copy directly**.

The useful lessons were:

### From Runway

- one narrative can become a shot sequence
- automatic vs custom control
- AI can handle decomposition
- prompt-driven editing can reduce traditional production overhead

### From HeyGen

- quick creation can be very small
- deep editing can happen inside a single studio
- users do not need to understand professional video software to make changes
- the generated video becomes the work surface

The principle to borrow is:

> **AI first → direct control when needed.**

Not:

> **form first → production → expert editor.**

Source: original discussion. fileciteturn6file0L57-L81 and fileciteturn5file0L919-L959

---

# 38. The highest-level product promise

The product should not position itself mentally as:

> “an AI video generator”

or:

> “an AI image generator.”

A stronger product idea is:

> **A professional creative production system for pharma/life-sciences marketing, where the AI understands the content job and handles the production complexity.**

For the marketer:

> “I know what I need. SwishX helps me make it.”

For the designer:

> “Give me a strong starting point, and let me craft it.”

For the agency:

> “Make me dramatically faster without taking away my craft.”

For the executive:

> “Increase high-quality content output without proportionally increasing cost and dependency.”

---

# 39. What we should NOT do in the next build

Do not:

- build another content catalogue dashboard without solving the core creation loop
- introduce abstract workflow labels such as “Create a Set / Transform / Adapt” as primary navigation
- build a giant ChatGPT-style interface
- expose the full production configuration up front
- create separate disconnected workflows for every asset type
- build every one of the current Magic Video/Aid/Mail/Canvas/Doc modules deeply at once
- make campaigns, audience management, CRM, distribution or MLR administration the current center of the product
- optimize for every edge-case creative format before the core loop works
- make a shallow “simple” editor that removes professional depth
- force the user to navigate backwards to make changes after generation

---

# 40. What the next product prototype should actually prove

The next build should be an actual **working creative application skeleton**, not another conceptual flow diagram.

It should demonstrate:

## A. Familiar entry

User sees recognizable creation concepts:

- New video
- New visual
- New carousel / page-based visual
- Open existing content
- Start from a source file

## B. Small initial context step

The user can provide:

- brief / prompt in natural language
- source material
- existing asset
- audience/context when needed
- format/aspect when necessary

## C. AI interpretation

SwishX produces:

- summary of understanding
- recommended creative direction
- possible routes
- suggested structure

## D. First output

The user reaches the actual asset quickly.

## E. Studio

The asset is now the workspace.

For video:

- scenes
- preview
- timeline
- context/AI
- contextual controls

For visual/page assets:

- pages/thumbnails
- canvas
- properties
- AI assistance

## F. Direct refinement

The user can:

- click the object
- modify directly
- ask AI to modify it
- regenerate one part
- compare versions

## G. Expansion

From the asset itself:

- duplicate
- make another version
- create another format
- make related assets

## H. Export

The final step should feel like the familiar output action from professional creative software.

---

# 41. Recommended technical direction for Codex

Build this as a **proper React product prototype**, not as a giant static HTML mock.

The prototype should use reusable components and a coherent data model so that content types share common behavior without being visually identical.

Suggested conceptual entities:

```text
Workspace
Project
Asset
AssetType
Source
BrandContext
CreativePlan
Version
Scene/Page
Variant
ReviewState
```

Suggested shared state relationships:

```text
Project
  ├── context
  │    ├── sources
  │    ├── brand
  │    └── brief
  │
  ├── creativePlan
  │
  ├── assets[]
  │    ├── versions[]
  │    ├── pages/scenes[]
  │    └── variants[]
  │
  └── reviewState
```

The key is that the **generated output is not a disposable result**.

It is an object with persistent structure that can be edited, versioned, expanded and reused.

---

# 42. Visual/interaction quality bar

The UI should feel:

- calm
- confident
- professional
- modern
- craft-focused
- familiar
- premium without being showy
- intelligent without being gimmicky

Avoid:

- excessive AI gradients
- loud “magic” theatrics
- futuristic dashboard clichés
- giant chatbot windows
- excessive badges
- over-animated onboarding
- huge numbers of cards with microcopy everywhere

A good test:

> **Could a seasoned pharma marketer open this and understand what to do without being taught a new application model?**

A second test:

> **Could a strong designer enter the workspace and immediately feel that the product respects creative craft?**

A third:

> **Could an agency expert discover deeper control without being blocked by novice-oriented guidance?**

---

# 43. Design principles to carry into every screen

## Principle 1 — Familiar before innovative

Use concepts users already know.

## Principle 2 — AI should reduce decisions, not reduce capability

## Principle 3 — Ask only when the answer materially changes the output

## Principle 4 — Source context should eliminate questions

## Principle 5 — Show a useful result early

## Principle 6 — The result should become the workspace

## Principle 7 — Keep editing and generation in the same object

## Principle 8 — Progressive disclosure for professional depth

## Principle 9 — Human judgment is the differentiator

## Principle 10 — Make it easy to make one thing into another thing without forcing users to understand the underlying operation

## Principle 11 — Optimize the highest-value creation loop before building peripheral platform modules

## Principle 12 — The product should feel like a professional creative tool, not an AI demo

---

# 44. What the research ultimately changed

The research process moved our thinking through several stages.

### Stage 1 — “The flow has too many steps.”

This was the initial observation.

### Stage 2 — “The user thinks about the marketing job, not the production mechanics.”

This established the intent-first principle.

### Stage 3 — “The hierarchy should move into the AI.”

This established progressive disclosure and dependency-driven questioning.

### Stage 4 — “The ICP has four distinct stakeholder roles.”

This gave us the executive / marketing / design / agency model.

### Stage 5 — “Their software habits matter.”

PowerPoint, Word, Figma, Adobe, Canva, Veeva and collaboration tools became important mental-model references.

### Stage 6 — “Don't make a new AI ontology.”

We rejected abstract labels such as Create / Transform / Adapt as primary navigation.

### Stage 7 — “Separate content taxonomy from creation interaction.”

The current five product families (Video / Aid / Mail / Canvas / Doc) can remain useful as supported output classes, but they should not dictate the entire UX.

### Stage 8 — “Build the core professional creation loop first.”

This is the current state.

---

# 45. Current working product thesis

The strongest consolidated thesis is:

> **SwishX should feel like the next generation of the professional creative tools pharma teams already know — PowerPoint, Word, Figma, Adobe and Canva — with an unusually intelligent AI creative partner embedded inside the workflow.**

The user should not learn SwishX's internal AI machinery.

SwishX should learn the user's content job.

The system should:

**understand → propose → create → show → refine → expand → export.**

And all of that should happen around a **persistent content object**.

That is the product architecture worth prototyping now.

---

# 46. Immediate build goal

The next Codex build should focus narrowly on the **main creation experience**.

Start with one excellent path:

> **Create a professional marketing asset from a brief/source → get a first result → edit/refine it in one continuous workspace → export.**

Then make the same architecture work for:

- video
- image/visual
- carousel/page-based content

Do not try to fully implement every existing Magic module yet.

The prototype should prove that the central SwishX promise works.

---

# 47. Reference materials available for this handoff

## A. Original product/problem analysis

`Pasted markdown(1).md`

This contains the original conversation, recorded-flow observations, product critique, research hypotheses, dependency-tree reasoning and iterative discussion.

Key evidence in the source:

- Original problem definition and ICP context: fileciteturn4file1L213-L259
- Current production-style configuration and why it is problematic: fileciteturn4file1L276-L336
- Intent/source/direction thinking: fileciteturn4file1L340-L407
- Mixed-initiative model: fileciteturn4file1L562-L630
- Pharma-specific semantic/context model: fileciteturn5file0L48-L94
- Current product five-stage internal hierarchy: fileciteturn4file1L411-L511
- Dependency-tree reduction and the “ask only when materially changing output” rule: fileciteturn5file0L735-L777
- Source/dossier context and question elimination: fileciteturn6file0L85-L166
- Continuous workspace architecture: fileciteturn6file0L228-L266
- Detailed dependency model: fileciteturn6file0L268-L321
- Five conceptual buckets and the distinction between internal hierarchy and visible UI: fileciteturn6file0L325-L650

## B. Deep Research report

`Executive Summary`

This is the research synthesis covering:

- ICPs
- workflow priorities
- asset-type priorities
- tool/platform ecosystem
- P0 workflows
- AI adoption
- strategic opportunity

Key evidence:

- ICP findings: fileciteturn4file0L10-L21
- Workflow priority matrix: fileciteturn4file0L46-L59
- Asset opportunity matrix: fileciteturn4file0L78-L93
- Platform/tool matrix: fileciteturn4file0L95-L112
- Top P0 workflows: fileciteturn4file0L114-L125
- Research limitations / validation requirements: fileciteturn4file0L178-L186

## C. Existing prototype

`ozier_video_journey_prototype_v4.html`

Note: the prototype was originally branded “Ozier” during early exploration; the product is now **SwishX**. Do not retain Ozier branding or terminology.

The prototype is useful primarily as evidence of the current thinking around:

- guided intake
- audience/objective selection
- creative direction
- storyboard
- generation
- studio
- review

But it should **not** dictate the new architecture.

## D. Existing SwishX screenshots

The screenshots show the current platform's:

- Magic Video
- Magic Aid
- Magic Mail
- Magic Canvas
- Magic Doc

with content cards, objective filters and audience filters.

Treat these as evidence of the existing product/content taxonomy, not as proof that the current information architecture is the final answer.

---

# 48. Final instruction to Codex

Do not merely translate this brief into another static dashboard.

Use it to **exercise product judgment**.

When two principles conflict, prefer the one that protects the core SwishX promise:

> **A pharma/life-sciences professional should be able to make a genuinely good marketing asset faster and with more creative confidence than they could using the fragmented set of tools and people they use today.**

The best implementation is not the one with the most features.

It is the one where the user quickly thinks:

> **“I understand this.”**

then:

> **“It already understood what I needed.”**

then:

> **“I can make it better without fighting the tool.”**

and finally:

> **“This is good enough to actually use.”**

That is the standard for the next prototype.
