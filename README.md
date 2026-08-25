# SwishX business experience prototype

An interactive, dummy-data product prototype for the next SwishX content-creation experience.

## What this build proves

- A role-aware home surface centered on work, decisions, and source impact.
- Familiar asset entry points instead of AI-operation taxonomy.
- Source-led intake with visible system interpretation.
- One recommended content plan with editable emphasis before creation.
- A persistent video studio where the output becomes the workspace.
- Scene-level editing, contextual SwishX assistance, and evidence states.
- Review preflight with changed-claim handling.
- Related-asset creation that preserves context and lineage.

## Prototype boundary

This is intentionally a frontend-only prototype:

- no authentication;
- no database or Drizzle schema;
- no real file upload;
- no model or generation API;
- no PromoMats, DAM, or backend integration;
- no real export or review submission.

The dummy project, source, content plan, scenes, claims, and review states live in `src/features/workspace/mock-data.ts`. Zustand holds interaction state. TanStack Query is configured for future replaceable data adapters. Tiptap and Drizzle remain available for stack parity but are not yet used in the prototype.

The Remotion Player is used for the in-studio video surface. License acknowledgement is deliberately not hardcoded here; it should follow the team's existing Remotion licensing decision.

## Run locally

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality checks

```bash
bun run typecheck
bun run lint
bun run build
```

## Recommended walkthrough

1. Select **Create new content**.
2. Review the source-led intake and SwishX interpretation.
3. Select **Review content plan**.
4. Compare the three routes and select **Build first draft**.
5. Move between scenes in the studio.
6. Open **SwishX** and **Evidence** in the inspector.
7. Select Scene 4 to see changed-claim handling.
8. Open **Review & export**.
9. Open **Related asset** to see content-family expansion.
