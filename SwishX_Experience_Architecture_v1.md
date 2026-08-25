# SwishX Experience Architecture v1

**Date:** 24 August 2026  
**Status:** Strategic UX blueprint for validation and prototyping  
**Scope:** US-first life-sciences and pharma marketing-content creation, with an architecture that can later support global/local market adaptation. Campaign orchestration, media buying, CRM, and final regulatory submission remain outside the product core.

---

## 1. Executive decision

SwishX should not be designed as an AI asset generator, a catalogue of “Magic” tools, or a lighter version of Adobe.

It should be designed as an **evidence-native creative workspace for life-sciences content**:

> **Brief once → create a strong asset → refine it in place → prove every claim → expand it into a coherent content family → hand it off cleanly.**

The core object is not a prompt or a generated file. It is a persistent, structured content object with:

- a communication goal;
- a brand and product context;
- source evidence and claim relationships;
- a creative plan;
- editable scenes, pages, and elements;
- versions and variants;
- review history;
- lineage into related assets.

The product must make three users feel three different things without fragmenting into three products:

- **Marketer:** “It understood the job and gave me something strong.”
- **Creative or agency expert:** “I can control and elevate this without fighting it.”
- **Reviewer:** “I can see exactly what changed, why it is supportable, and what needs attention.”

The north-star product outcome is **approved, professionally usable content**, not generated content volume.

---

## 2. What the evidence changes

The supplied brief establishes the correct foundation: intent before production mechanics, progressive disclosure, familiar content objects, a persistent studio, and source-aware creation. Current external evidence adds five important corrections.

### 2.1 More content is not automatically more value

Veeva reports that field teams use content in fewer than half of customer interactions and that nearly 80% of approved content is rarely or never shared. Relevant content improves engagement, but volume without adoption becomes waste. This means asset count is a dangerous product metric. [Veeva Pulse Field Trends Q1 2025](https://www.veeva.com/eu/resources/veeva-pulse-field-trends-report-1q25/)

**Product implication:** SwishX should preserve the intended use, audience, field need, and related feedback on the content object. It should help teams create fewer dead assets, not merely generate faster.

### 2.2 Compliance-aware generation is becoming table stakes

Adobe generates on-brand content variants and supports approved disclaimers and citations; Veeva has added AI-assisted content review; ZAIDYN and Compose Health position directly around approved sources, claims, derivatives, and MLR readiness. [Adobe GenStudio](https://business.adobe.com/products/genstudio-for-performance-marketing.html), [Veeva AI for PromoMats](https://www.veeva.com/wp-content/uploads/2025/12/Veeva-AI-for-PromoMats-Features-Brief.pdf), [ZAIDYN Content Generation](https://zaidyn.zs.com/products/zaidyn-content/content-generation), [Compose Health](https://www.composehealth.com/)

**Product implication:** “AI for pharma” or “claims-aware generation” alone is not a durable moat. SwishX must win through the union of evidence, professional craft, continuous editing, and cross-format lineage.

### 2.3 The content supply chain is a real operating model

Large pharma organizations are creating dedicated content-production, content-operations, metadata, and omnichannel supply-chain roles. A current Amgen production leadership role describes thousands of projects annually across web, CRM, Veeva, print, localization, modular content, and omnichannel channels. [Amgen — Director, Global Content Production](https://careers.amgen.com/en/job/washington-d-c/director-global-content-production/87/96574384320)

**Product implication:** Content operations is not an edge persona. It is a critical champion, admin, taxonomy owner, and power user between executive buyers and day-to-day creators.

### 2.4 Creative craft remains a distinct expert job

Current pharma design roles span sales aids, presentations, infographics, emails, websites, social assets, print, and conference material; they explicitly require Adobe expertise, often with Figma and PowerPoint, and require collaboration through MLR revisions. [Amgen — Graphic Designer, Pharmaceutical Marketing](https://careers.amgen.com/en/job/hyderabad/graphic-designer-pharmaceutical-marketing/87/93487294160)

**Product implication:** A shallow template editor will fail. SwishX should accelerate repetitive production while protecting direct manipulation, layout judgment, typography, motion, and export precision.

### 2.5 AI interest is ahead of scaled operating maturity

In McKinsey’s survey of more than 100 pharma and medtech leaders, all respondents had experimented with generative AI, 32% had begun scaling, and only 5% reported consistent, differentiating financial value. Adobe’s healthcare research reported strong pharma intent to use AI for content optimization and adaptation while also showing substantial marketing/CX skills gaps. [McKinsey — Scaling gen AI in life sciences](https://www.mckinsey.com/industries/life-sciences/our-insights/scaling-gen-ai-in-the-life-sciences-industry), [Adobe — 2025 AI and Digital Trends in Healthcare](https://business.adobe.com/content/dam/dx/us/en/resources/reports/healthcare-digital-trends/2025-ai-and-digital-trends.pdf)

**Product implication:** Do not make adoption depend on prompt literacy. Embed AI into familiar tasks, provide safe defaults, show its interpretation, and make every consequential action inspectable and reversible.

### 2.6 What the two deep-research reports actually investigated

The two underlying reports were not general market overviews. They explored five specific product-design questions:

| Research question | Method used in the reports | Useful conclusion | Limitation |
|---|---|---|---|
| Who buys, uses, validates, and power-uses the product? | Four-role ICP comparison: executive, marketing, design, agency | Buyer and operator are different people; marketing initiates, creatives validate, agencies need throughput | Content operations, MLR, admins, and downstream field users were largely outside the four-role scoring frame |
| Which jobs matter most? | Workflow buckets scored by stakeholder importance; one report weights Executive 15%, Marketing 30%, Design 25%, Agency 30% | Source/brief-to-asset, transformation, multi-asset creation, and variants repeatedly rise to the top | The numbers are analyst-assigned priorities, not observed task frequency or willingness-to-pay data |
| Which asset types are most attractive? | Weighted score using frequency, pain, value, AI fit, differentiation, and strategic pull | Video and infographics are high-value/hard; simple images are frequent but more commoditized | The two reports rank static images and carousels differently, and both acknowledge missing hard usage data |
| Which existing mental models matter? | Job descriptions, vendor material, agency descriptions, and product/review commentary | PowerPoint/Word dominate briefs and sources; Adobe/Figma define craft; Veeva defines governance; Canva defines approachable creation | Tool “importance” scores are directional; some numerical adoption claims do not have traceable source detail inside the files |
| Where can SwishX differentiate? | Fit of AI to pain, scale, reuse, localization, and workflow complexity | Source-grounded multimodal creation and derivative production are the clearest wedge | The original “pharma-specific AI” differentiation is weaker in 2026 because several competitors now make similar claims |

The reports also explicitly call for interviews, format-usage surveys, workflow observation, and prototype telemetry. Their matrices are prioritization hypotheses, not a substitute for those activities.

### 2.7 Reconciliation of the reports' contradictions

| Question | `deep-research-report (2).md` | `deep-research-report (3).md` | Architecture decision |
|---|---|---|---|
| Creative ideation | P0 | P1 | Do not make ideation a separate destination. Embed 2–3 creative routes inside every P0 source-to-asset flow. |
| Review/compliance | P0 | P1 | Provenance and preflight are P0 architecture. A full native approval system is P1; formal governance can remain in PromoMats. |
| Refinement/editing | P1 but described as a core continuous workspace | P1 and often an Adobe/Figma handoff | Minimum viable local refinement is P0 because a first draft is not the outcome. Advanced production controls and round-trip editing are P1/P2. |
| Static images/carousels | P0 | P1 | Support through the shared page-based studio, but do not use these conflicting scores to choose the first wedge. Validate actual volume and pain. |
| Long and specialist video | Long video P0 | Long video P0, but advanced scientific animation P2 and patient/KOL content P2 | Prototype the controllable middle: short explainer/storyboard video from approved sources. Do not promise filmed testimony or bespoke 3D/MOA replacement. |
| Campaign structure | Multi-asset generation is P0 | Proposes “My Campaigns” and a campaign-builder mode | Preserve multi-asset value but call the user-facing container a project/content family. SwishX does not become campaign-management software. |
| Deep creative control | Required by designers and agencies | Advanced control P2; export to specialist tools | Offer progressive controls for common professional edits and reliable layered handoff. Do not recreate After Effects, Premiere, or Photoshop. |

Across both reports, the least ambiguous strategic order is:

1. **Create from an existing approved/scientific source.**
2. **Convert that source or asset into a strong new format.**
3. **Produce coherent related assets, variants, and local versions.**
4. **Make the result locally refinable and review-ready.**
5. **Integrate with specialist creation and governance systems for the long tail.**

---

## 3. Evidence discipline

This blueprint uses three evidence labels:

- **Supported:** directly backed by the supplied brief and/or current external evidence.
- **Strong inference:** a product conclusion drawn from several supported facts.
- **Hypothesis:** plausible but must be tested with real users or behavioral data.

Workflow frequencies below are **cadence hypotheses**, not measured usage statistics. The original deep-research materials and direct interviews should be used to recalibrate them.

---

## 4. The stakeholder system

### 4.1 Decision makers, users, and power users

| Stakeholder | Commercial role | Product role | Typical cadence | Primary success criterion | Familiar tools and models |
|---|---|---|---|---|---|
| CMO, VP Commercial, VP Marketing, Growth leader | Economic buyer and sponsor | Occasional viewer | Monthly or quarterly | More useful content, faster; lower external cost; controlled risk | Dashboards, PowerPoint, Excel, business cases |
| Head of Omnichannel, Content Excellence, Marketing Operations, Global Content Production | Champion, process owner, often budget influencer | Admin and power user | Daily or weekly | Throughput, reuse, governance, service levels, adoption | Workfront, Veeva, DAM/CMS, AEM, Salesforce, analytics |
| Brand or Product Marketing Lead | Primary initiator and accountable owner | Primary user | Weekly; daily around launch | Communicate the right message to the right audience and meet the date | PowerPoint, Word, Teams, Veeva, agency briefs |
| Content Strategist or Marketing Manager | Brief owner and coordinator | High-frequency user | Daily or weekly | Strong direction, consistent messages, efficient stakeholder alignment | Docs, decks, project tools, DAM, Veeva |
| In-house Designer or Creative Lead | Craft and quality authority | Creator and expert refiner | Daily | Professional quality, brand consistency, production correctness | Adobe CC, Figma, PowerPoint, asset libraries |
| Specialist agency strategist, copywriter, designer, producer | External expert and throughput engine | Power user | Daily, often across brands | Fast iteration, creative range, batch output, clean handoff | Adobe CC, Figma, PowerPoint, project/review tools |
| Medical, Legal, Regulatory reviewer | Risk and evidence authority | Reviewer, commenter, approver | Several times per week or in review bursts | Truthful, balanced, supportable, traceable content | Veeva PromoMats, annotated PDFs, Word, email |
| Content librarian, metadata, brand or claims administrator | Governance operator | Admin and data steward | Weekly or monthly, plus launches | Correct source versions, metadata, discoverability, expiry | DAM, CMS, Veeva, taxonomies, spreadsheets |
| Field sales, MSL, market-access, patient-support team | Downstream content consumer and feedback source | Viewer; possible requester | Daily use, occasional feedback | Find the right asset quickly and trust it is current | CRM, Veeva CLM, approved email, mobile/tablet |

### 4.2 The primary design target

The primary design target is not a single persona. It is a collaboration unit:

```text
Business sponsor
      ↓
Content/operations champion
      ↓
Marketer defines the communication job
      ↓
Creator or agency elevates the work
      ↓
MLR validates the evidence and presentation
      ↓
Field/customer-facing team uses the asset
      ↓
Usage and feedback improve the next asset
```

SwishX should optimize the shared object moving through this system rather than making each role transfer flattened files between disconnected tools.

### 4.3 Role-specific experience depths

Do not create separate “marketer mode” and “designer mode” products. Use role-aware defaults on one object:

- **Guided depth:** recommendations, safe defaults, summary controls, plain language.
- **Professional depth:** direct manipulation, batch operations, timing, layout, type, motion, asset replacement, detailed export.
- **Review depth:** claims, evidence, change comparison, comments, decisions, no accidental editing.
- **Operations depth:** templates, metadata, policy, lineage, permissions, reporting, bulk management.

Users can cross depths when their job requires it.

---

## 5. Workflow frequency and importance

### 5.1 Frequency scale

- **Continuous:** repeated many times within one creation session.
- **Daily:** common for production, agency, and operations roles.
- **Weekly:** common for brand and marketing teams.
- **Per asset:** happens for almost every deliverable, regardless of calendar frequency.
- **Event-driven:** spikes around launch, label change, congress, new indication, or safety update.
- **Monthly/quarterly:** governance and performance work.

### 5.2 Prioritized workflow matrix

| Workflow | Primary roles | Cadence hypothesis | Importance | Experience priority | Why it matters |
|---|---|---:|---:|---:|---|
| Find and select the correct approved source | Marketer, creator, ops | Daily/weekly; per asset | Critical | P0 | A wrong or expired source corrupts everything downstream |
| Turn a brief/source into a first professional direction | Marketer, strategist, agency | Weekly; per asset | Critical | P0 | This is the time-to-value moment |
| Explore a net-new concept without a substantive source | Marketer, agency | Event-driven | Medium/high | P1 | Useful for early concepting, but less grounded and less common than source-led work in the reports |
| Compare and choose creative routes | Marketer, creative lead | Per asset | High | P0 | Moves human judgment to the right level |
| Refine a page, scene, claim, visual, or message | Creator, marketer, agency | Continuous | Critical | P0 | Most real work happens after first generation |
| Adapt approved content into a new format or audience | Creator, agency, content ops | Daily/weekly; launch spikes | Critical | P0 | High-volume, repeatable value with lower risk than blank-page generation |
| Create coherent variants and related assets | Agency, creator, marketer | Weekly/event-driven | High | P0 | Scales a strong idea without fragmenting it |
| Localize content for another market or language | Agency, local marketer, MLR, ops | Event-driven; high-volume at global scale | Critical globally | P0 architecture; later US-first release | The reports rank localization highly, but local rules and review make it more than one-click translation |
| Run evidence, brand, and production preflight | Creator, marketer, MLR | Per asset | Critical | P0 | Prevents avoidable review churn and preserves trust |
| Review, comment, compare, and resolve changes | MLR, marketer, creative lead | Several times weekly; per asset | Critical | P0 handoff/preflight; P1 native approval | Review is not the front door, but every promoted asset encounters it |
| Export and hand off to PromoMats/DAM/production | Creator, ops | Per asset | Critical | P0 | Value is not realized until the object leaves SwishX correctly |
| Maintain brand, claim, reference, and template context | Ops, claims admin, brand lead | Monthly/event-driven | High | P1 infrastructure | The quality of generation depends on this layer |
| See workload, status, and bottlenecks | Ops, marketing lead | Daily/weekly | High | P1 | Supports enterprise reliability and adoption |
| Measure field use and content effectiveness | Ops, executives, brand lead | Monthly/quarterly | High | P1/P2 integration | Prevents high-volume production of low-use content |
| Build executive ROI and governance reports | Sponsor, ops | Monthly/quarterly | Medium | P2 | Important for renewal and scale, not daily creation |

### 5.3 What P0 means

P0 is not “put everything on the first screen.” It means the architecture must support the full loop:

```text
Correct source
   → clear brief
   → credible creative direction
   → strong first asset
   → continuous local refinement
   → evidence-aware preflight
   → review-ready handoff
   → coherent derivative
```

If any link is missing, users fall back to PowerPoint, Adobe, agencies, email, and Veeva handoffs.

---

## 6. Product boundary

### SwishX owns

- intake of briefs, existing assets, and approved sources;
- interpretation of the communication job;
- creative routes and structured first drafts;
- professional multimodal creation and refinement;
- claim/source provenance during creation;
- versions, variants, and related-asset lineage;
- preflight and review preparation;
- collaboration on the creative object;
- export packages and integrations.

### SwishX integrates with

- Veeva PromoMats/MedComms for formal promotional review and controlled lifecycle;
- DAM/CMS systems for approved sources and released assets;
- Adobe/Figma workflows for specialist craft and round-trip production where needed;
- PowerPoint/Word/PDF as ubiquitous source and output formats;
- Workfront or enterprise work-management systems for upstream requests and status;
- CRM/field systems for usage signals and downstream delivery context.

### SwishX does not need to own now

- CRM or customer databases;
- campaign orchestration or media buying;
- final health-authority submission tooling;
- a general-purpose project-management suite;
- all DAM functionality;
- every professional production edge case on day one.

This boundary is strategic. FDA guidance makes source annotations, support for claims, and precise treatment of video/storyboards operationally important, but that does not require SwishX to recreate the entire regulatory system. [FDA OPDP FAQ](https://www.fda.gov/about-fda/center-drug-evaluation-and-research-cder/opdp-frequently-asked-questions-faqs)

---

## 7. The product model users should understand

The user-facing model should consist of familiar nouns:

- **Content** — the complete body of work.
- **Project** — one communication job or brief.
- **Asset** — a video, carousel, visual aid, infographic, presentation, document, email, or other deliverable.
- **Page/Scene** — the structural unit inside an asset.
- **Version** — a historical state of the same asset.
- **Related asset** — another deliverable derived from the same project and evidence.
- **Source** — a reference, approved asset, label, deck, study, brand guide, image, or video used as input.
- **Claim** — a controlled statement linked to support and usage rules.
- **Review** — a decision process attached to a version.

“Generate,” “transform,” “adapt,” and “repurpose” remain system capabilities and action verbs. They should not become the navigation architecture.

---

## 8. Information architecture

### 8.1 Primary navigation

```text
Home
Content
Brands & Sources
Reviews            [shown prominently only to roles that use it]

Account / workspace switcher
Admin & settings   [permission-based]
```

### Home

A role-aware work surface, not a generic analytics dashboard:

- continue recent work;
- assigned reviews and changes;
- upcoming deadlines;
- content waiting on the user;
- one primary **New content** action;
- source or claim updates affecting active work.

### Content

The durable library of projects and assets. Filters should use dimensions people already know:

- brand/product;
- audience;
- asset type;
- status;
- owner;
- market;
- date;
- approved/expired source impact.

Do not create separate top-level destinations for Video, Canvas, Mail, Aid, and Doc. Those are asset-type filters and creation choices inside one content system.

### Brands & Sources

The context layer:

- brands, products, indications, and markets;
- audience definitions;
- brand language and visual systems;
- claims and source anchors;
- references, labels, studies, and approved assets;
- reusable components and templates;
- expiry and version status.

### Reviews

A focused inbox for:

- requested reviews;
- changes requested;
- decisions due;
- unresolved evidence issues;
- comparison of submitted versions;
- completed decisions.

This can later integrate deeply with Veeva; it should not pretend to replace formal PromoMats governance in the first release.

### 8.2 Creation catalogue

Use a shallow, searchable catalogue of familiar artifacts. Recommended first-level groups:

- **Video** — short video, explainer/MOA, announcement, patient story, event/webinar, digital twin.
- **Visual & social** — single visual, carousel, infographic, banner/display, social set, print/journal ad.
- **Presentation & field** — presentation, interactive visual aid, e-detail, leave-behind, dosing guide, FAQ/objection handler.
- **Document** — brochure, monograph, medical deck, publication summary, dossier.
- **Email** — approved email, newsletter, email sequence.

The current Magic families can map into these groups without remaining separate mini-products.

“Start from existing content” is a prominent starting method across all asset types, not a separate content family.

---

## 9. The underlying object architecture

```text
Organization
└── Workspace / client boundary
    ├── Brand context
    │   ├── Product / indication / market
    │   ├── Brand and visual rules
    │   ├── Approved claims
    │   ├── Sources and source versions
    │   └── Reusable components / templates
    │
    └── Project  (one communication job)
        ├── Brief and intended use
        ├── Audience and channel context
        ├── Creative plan
        ├── Asset family
        │   ├── Asset
        │   │   ├── Version
        │   │   │   ├── Page / scene
        │   │   │   └── Element / shot / block
        │   │   └── Export renditions
        │   └── Related asset / variant
        ├── Review threads and decisions
        └── Usage / performance signals
```

Parallel to the content tree is the evidence graph:

```text
Claim occurrence in an element
   → controlled claim record
   → exact supporting source fragment
   → source version
   → usage rules / market / audience / expiry
```

This graph is more defensible and useful than attaching a PDF to a prompt. It lets SwishX answer:

- Where is this claim used?
- Which assets are affected by a source update?
- Did a local edit change the meaning of approved language?
- Which derivative inherited this evidence?
- What needs re-review after this change?

---

## 10. The golden creation flow

### Step 1 — Start with the thing being made

The user chooses a familiar asset such as **Video**, **Carousel**, or **Infographic**. They may choose more than one deliverable, but SwishX should recommend beginning with a primary asset and expanding after the creative direction is established.

### Step 2 — Bring context forward

Ask for:

- brand/product or source collection;
- brief in natural language;
- source file or existing approved asset;
- audience, market, channel, and format only when unresolved or consequential.

The system should display what it already knows and ask only for missing information that changes the result.

### Step 3 — Interpret visibly

Show a compact interpretation:

- intended communication job;
- audience and use context;
- required messages and evidence;
- creative constraints;
- likely deliverable specification;
- unresolved or risky assumptions.

Every inferred item is editable. Confidence and source should be visible where valuable, not as machine-learning jargon.

### Step 4 — Offer 2–3 genuinely different creative routes

A route is not a style thumbnail. It combines:

- narrative angle;
- message hierarchy;
- visual system;
- tone and pacing;
- structural outline;
- why it fits the audience and objective;
- evidence or production risks.

The user selects, combines, or adjusts a route.

### Step 5 — Confirm the creative plan

Before costly production, show what will be built, including asset length/size, structure, required sources, and proposed variants. This is a trust checkpoint, not another form.

### Step 6 — The result becomes the studio

Generation transitions into the persistent workspace. No upstream screen becomes the only place to change a decision.

### Step 7 — Refine at the correct scope

Every AI or manual action has an explicit scope:

- selection;
- element;
- page/scene;
- entire asset;
- related asset family.

The user previews consequential changes, sees what will propagate, applies them, and can undo them.

### Step 8 — Preflight, review, and hand off

Preflight checks evidence, brand, accessibility, technical production, and missing content. The user resolves issues, creates a review version, and sends or exports it with the correct source package.

### Step 9 — Expand from success

From the finished asset, **Create related asset** preserves the project’s brief, evidence, route, visual system, and decisions while adapting the structure to the new format.

---

## 11. The studio interaction contract

The exact layout can vary by asset, but the contract should remain stable.

| Area | Purpose | Video | Page-based asset |
|---|---|---|---|
| Structure rail | Navigate and organize | Scenes/shots | Pages/slides |
| Main stage | Judge and directly manipulate | Preview/canvas | Canvas/page |
| Context inspector | Edit selected object | Narration, visual, motion, timing | Text, media, layout, style |
| SwishX assistance | Suggest or execute scoped change | Scene/asset help | Element/page/asset help |
| Evidence layer | Inspect claims and sources | Time/scene-linked evidence | Element/page-linked evidence |
| Time/sequence area | Detailed sequence control | Timeline, audio, captions | Usually absent; optional animation |
| Collaboration layer | Feedback and decisions | Time-coded comments | Element/page comments |
| Top bar | Object-level actions | Status, version, share, review, export | Same |

### 11.1 AI is not a separate destination

SwishX assistance should appear as:

- contextual suggestions near the selected object;
- a compact command surface for natural-language refinement;
- explicit actions such as “shorten,” “show alternatives,” “replace visual,” or “create patient version”;
- system-initiated warnings when an edit affects evidence, balance, brand, or related assets.

Avoid a permanently dominant chat panel. Conversation is one control surface among direct manipulation, properties, structure, and evidence.

### 11.2 Safe mixed-initiative behavior

For every material AI change:

1. State the scope.
2. Show the proposed result or a concise change summary.
3. Identify affected claims, pages/scenes, and related assets.
4. Preserve the prior version.
5. Allow undo.
6. Never silently broaden an action from one element to the whole family.

### 11.3 Progressive professional depth

The default inspector shows the decisions most users recognize. Advanced sections reveal:

- typography and layout systems;
- layers and grouping;
- timing and pacing;
- camera and motion;
- narration, voice, and audio mix;
- production prompts and references;
- output color, bleed, resolution, captions, and accessibility;
- batch/variant operations.

Expert controls should be discoverable in place, not hidden in a separate “pro product.”

---

## 12. Trust and compliance as an experience layer

Compliance should not dominate the first screen, but provenance must be present throughout creation.

### Evidence states

- **Approved:** exact approved claim used within its rules.
- **Supported:** source support exists, but wording may be new or require review.
- **Changed:** previously approved wording was materially edited.
- **Unsupported:** no adequate source support is linked.
- **Expired/impacted:** the underlying source or rule changed.
- **Not applicable:** creative or non-claim content.

Color alone must never communicate these states.

### Reviewer experience

The reviewer should see:

- the submitted asset, not the editing complexity;
- new and changed claims first;
- exact wording and visual changes since the last reviewed version;
- source anchors in one action;
- context around each occurrence;
- comments tied to the object and version;
- whether an issue affects one asset or inherited derivatives;
- a clean decision trail.

FDA guidance makes source identification and, for video, timestamps/storyboard frames especially relevant. SwishX should be able to generate an annotated review package rather than asking teams to reconstruct it manually. [FDA OPDP FAQ](https://www.fda.gov/about-fda/center-drug-evaluation-and-research-cder/opdp-frequently-asked-questions-faqs)

---

## 13. The moat

### 13.1 What is not a moat

- access to a foundation model;
- a chat interface;
- prompt templates;
- generic brand kits;
- “pharma-safe AI” as a claim without workflow depth;
- generating many variants;
- a static asset-type catalogue.

### 13.2 The compounding moat

#### 1. Evidence graph

Exact, versioned relationships between product claims, supporting fragments, usage rules, and every content occurrence.

#### 2. Content-lineage graph

Knowledge of how a brief, creative route, asset, local edit, version, and derivative relate. This makes change impact, reuse, and review far more reliable.

#### 3. Brand and creative-system memory

Not just colors and logos: recurring layout systems, visual language, pacing, preferred motifs, rejected patterns, accessible type behavior, and production standards.

#### 4. Human judgment data

Selections, edits, reviewer comments, approval outcomes, field usage, and performance teach SwishX what each organization considers good and usable. This requires explicit governance and must never turn reviewer behavior into an opaque score.

#### 5. Pharma-native multimodal craft

A shared model across video, page-based visual, presentation, document, and derivative assets, with professional controls appropriate to each medium.

#### 6. Interoperability and trustworthy handoff

Deep movement of sources, metadata, evidence, versions, and outputs to and from systems such as PromoMats, DAM, Adobe, PowerPoint, and work management.

Together these create a flywheel:

```text
Better context
  → stronger first draft
  → fewer and more meaningful edits
  → cleaner review
  → more approved and used content
  → richer organizational judgment and lineage
  → better context
```

---

## 14. Form-factor decision

SwishX should be honest about where each job works best.

- **Desktop/laptop web app:** full creation and professional studio. Design at 1440 px, validate at 1280 px, and support dense production work without excessive card padding.
- **Tablet:** strong review, presentation, comments, light copy and ordering changes; optional simplified creation.
- **Mobile:** review inbox, comments, approvals/status, asset viewing, and urgent source-impact alerts. Do not force a fake professional editor onto a phone.

The scalable experience is not the same UI compressed onto every screen. It is the correct participation depth for the device.

---

## 15. Experience laws

1. **Lead with the content object, not the AI operation.**
2. **Ask only when the answer changes the result.**
3. **Use existing context before asking again.**
4. **Show interpretation before expensive production.**
5. **Get to something judgeable quickly.**
6. **The result becomes the workspace.**
7. **A local edit stays local unless propagation is explicit.**
8. **Every consequential AI action is previewable, attributable, reversible, and versioned.**
9. **Evidence stays attached to content through edits and derivatives.**
10. **Simple defaults never remove professional depth.**
11. **Review is a view of the same object, not a pile of disconnected files.**
12. **Reuse preserves lineage; duplication does not erase history.**
13. **Color signals status and risk, not decorative AI theatre.**
14. **One screen should have one obvious primary action.**
15. **A generated asset that nobody uses is a failure.**

---

## 16. Visual and interaction direction

### Character

Calm, precise, premium, evidence-aware, and craft-respecting. The product should feel closer to a mature creative tool than a SaaS admin dashboard.

### Density

- generous around decisions and review;
- efficient inside the studio and libraries;
- fewer giant cards;
- stable panel geometry;
- progressive detail rather than endless pages.

### Color

- neutral application chrome;
- brand/content color belongs to the asset, not the shell;
- reserved semantic colors for risk, approval, evidence, selection, and collaboration;
- no “AI gradient” as the identity system.

### Motion

Use motion to explain:

- generation progress;
- object insertion or reordering;
- scope of a propagated change;
- version comparison;
- status transition.

Avoid celebratory animation that trivializes regulated professional work.

### Language

Use “Create video,” “Add source,” “Show changes,” “Submit for review,” and “Create related asset.” Avoid “Unleash magic,” “Transform,” or “Run agent” in primary UI copy.

---

## 17. Measurement system

### North-star metric

**Median time from accepted brief to professionally usable, review-ready asset.**

Track separately by asset type and complexity so teams cannot game the metric with trivial outputs.

### Outcome metrics

- first-draft acceptance rate;
- time to first judgeable output;
- time to review-ready;
- time from review submission to approval;
- number and type of review cycles;
- percentage of asset content with valid evidence provenance;
- percentage of approved components safely reused;
- time to create a related asset or variant;
- creative-quality rating by expert reviewers;
- percentage of released content actually used within 30/90 days;
- content-family consistency rating;
- cost per approved and used asset.

### Friction metrics

- questions asked before first result;
- context re-entered by the user;
- full regenerations caused by inability to edit locally;
- app exits to make a required change;
- unsupported or expired claims at preflight;
- accidental propagation or undo events;
- export package defects;
- time spent locating the correct source.

### Guardrails

- critical compliance issue escape rate;
- false-positive evidence warning rate;
- loss of provenance after manual edits;
- accessibility failure rate;
- user confidence in why a result was produced;
- reviewer trust and willingness to use the package.

Do not use number of generations, prompts, or assets as primary success metrics.

---

## 18. Recommended prototype

Build one coherent, mocked-but-working golden path:

> **Approved product deck/PDF + short brief → 60-second HCP explainer video → local scene refinement with evidence → review-ready package → related six-page carousel.**

Why this path:

- starts from a familiar, common source;
- exercises scientific interpretation and evidence;
- tests the hardest studio structure—scenes, pacing, narration, visuals, and timeline;
- proves that generation is not a destination;
- demonstrates local edits, versions, preflight, and review;
- proves cross-format lineage through the related carousel;
- exposes whether the architecture can scale beyond the historical video wizard.

### Prototype surfaces

1. Role-aware Home.
2. New content chooser using familiar artifact nouns.
3. Compact brief/source intake.
4. Interpretation and missing-information review.
5. Three creative routes.
6. Creative-plan checkpoint.
7. Video studio with scenes, canvas, inspector, contextual SwishX assistance, evidence, and timeline.
8. Scoped scene edit with preview, change summary, and undo.
9. Evidence/brand/production preflight.
10. Review view with version comparison and source anchors.
11. Create-related-asset flow producing a carousel in the shared visual system.
12. Export/handoff package.

The prototype does not need real generative media. It does need real object behavior, selection, editing, versioning, scope, provenance states, and believable transitions.

---

## 19. Validation plan

### Participants

- 5 pharma brand/product marketers;
- 3 content operations/omnichannel leaders;
- 3 in-house pharmaceutical designers;
- 3 specialist-agency creators or producers;
- 3 MLR reviewers;
- 2 downstream field users.

Some participants may cover multiple roles, but do not replace reviewers with marketers speaking on their behalf.

### Core tasks

1. Start an HCP asset from a deck and brief.
2. Explain what SwishX inferred and correct one assumption.
3. Select a creative route and explain the tradeoff.
4. Change one scene without disturbing the rest of the asset.
5. Find the support for one claim.
6. Identify what changed since the prior version.
7. Resolve a preflight issue.
8. Create a patient-facing derivative and predict what should require new review.
9. Hand off or export the result.

### Success thresholds for the prototype

- 80% can start without instruction;
- 80% correctly predict the scope of a local AI edit;
- 90% can locate claim support in one action;
- 80% understand version versus related asset;
- reviewers can identify changed claims faster than in their current artifact-based process;
- creatives rate control as sufficient for continued refinement, even if not yet production-complete;
- marketers report that the first route is worth refining rather than restarting.

### Research questions that must remain open

- Which role owns purchase, rollout, and renewal in each company size?
- How often are teams producing net-new creative versus derivatives?
- Which asset families dominate by brand lifecycle stage?
- How much formal review should remain native versus be delegated to PromoMats?
- Which source types and metadata are reliably available at project start?
- What exact controls do creatives need before they trust video output?
- What constitutes “professionally usable” for marketers, designers, agencies, and reviewers?
- Which field-use signals can SwishX realistically receive?

---

## 20. Build order

### Foundation

- shared object model;
- selection and scoped action model;
- source/evidence graph;
- version and lineage behavior;
- role and permission model;
- reusable application shell and studio primitives.

### First vertical slice

- source intake;
- creative interpretation/routes;
- video studio;
- local edit and regeneration simulation;
- preflight;
- review comparison;
- export package.

### Expansion

- page-based studio using shared primitives;
- related carousel from the video project;
- reusable templates and brand systems;
- PromoMats/DAM integration contracts;
- operations views and bulk workflows;
- usage feedback and performance signals.

Do not build a broad dashboard, every Magic module, or administration depth before the first vertical slice proves that users can reach and refine a professional result.

---

## 21. Final product standard

The target experience is not “easy for an AI tool.” It is the best form factor for this work:

- familiar enough that a marketer knows how to begin;
- intelligent enough that the marketer does not configure production mechanics;
- deep enough that a designer can make the result excellent;
- transparent enough that a reviewer can trust the evidence and changes;
- structured enough that operations can scale it;
- interoperable enough to fit the enterprise rather than demand its replacement;
- coherent enough that one good asset becomes a useful family, not a pile of disconnected variants.

The simplest statement of the standard is:

> **SwishX should turn an approved body of knowledge and a communication need into content that people trust, improve, approve, and actually use.**
