import assert from "node:assert/strict";
import { deriveContentPlan, isRequestSpecific } from "../src/features/workspace/content-plan";
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
}

console.log(`Verified ${demoScenarios.length} demo scenarios.`);
