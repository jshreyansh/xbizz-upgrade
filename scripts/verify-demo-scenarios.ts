import assert from "node:assert/strict";
import { copyOverflow, deriveContentPlan, isRequestSpecific } from "../src/features/workspace/content-plan";
import { demoScenarios } from "../src/features/workspace/demo-scenarios";

for (const scenario of demoScenarios) {
  const plan = deriveContentPlan(scenario.inputs);
  const expected = scenario.assertions;

  if (expected.shouldClarify !== undefined) assert.equal(!isRequestSpecific(scenario.inputs.brief), expected.shouldClarify, `${scenario.id}: clarification`);
  if (expected.presentationMode !== undefined) assert.equal(plan.presentationMode, expected.presentationMode, `${scenario.id}: presentation mode`);
  if (expected.treatmentId !== undefined) assert.equal(plan.treatmentId, expected.treatmentId, `${scenario.id}: treatment`);
  if (expected.format !== undefined) assert.equal(plan.format, expected.format, `${scenario.id}: format`);
  if (expected.length !== undefined) assert.equal(plan.length, expected.length, `${scenario.id}: length`);
  if (expected.voiceIncludes !== undefined) assert.ok(plan.voice.toLowerCase().includes(expected.voiceIncludes.toLowerCase()), `${scenario.id}: voice`);
  if (expected.hasApprovedEvidence !== undefined) assert.equal(plan.hasApprovedEvidence, expected.hasApprovedEvidence, `${scenario.id}: approved evidence`);
  if (expected.hasBrandKit !== undefined) assert.equal(plan.hasBrandKit, expected.hasBrandKit, `${scenario.id}: brand kit`);
  if (expected.followsSuppliedScript !== undefined) assert.equal(plan.followsSuppliedScript, expected.followsSuppliedScript, `${scenario.id}: supplied script`);
  if (expected.sourceConflict !== undefined) assert.equal(Boolean(plan.sourceConflict), expected.sourceConflict, `${scenario.id}: source conflict`);
  if (expected.blocked !== undefined) {
    // Why the plan screen must refuse: nothing supplied at all, or files that
    // were supplied and then failed verification. Derived the same way the
    // screen derives it, so the assertion cannot drift from the behaviour.
    const docs = scenario.inputs.uploadedDocs ?? [];
    const verified = scenario.inputs.sourcesVerify ?? true;
    // Fit is a block of its own, and not about sources at all: the evidence
    // can be perfect and still not go on the page you asked for.
    const overflow = expected.archetypeId
      ? copyOverflow(scenario.inputs.brief, expected.archetypeId, expected.pages ?? 1)
      : null;
    const reason = plan.hasApprovedEvidence
      ? overflow
        ? "copy-overflow"
        : null
      : docs.length === 0
      ? "no-context"
      : verified
      ? null
      : "unusable-sources";
    assert.equal(reason, expected.blocked, `${scenario.id}: blocked reason`);
  }
}

console.log(`Verified ${demoScenarios.length} demo scenarios.`);
