// Regression: the engine's output on the sample model must match the committed baseline.
// A failure means behaviour changed. If intended, run `npm run baseline:update` and
// explain the diff in the commit; if not, fix the regression.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { PART_A, SAMPLE_XML, loadEngine, assess } from './helpers/engine.mjs';

const baseline = JSON.parse(readFileSync(path.join(PART_A, 'tests', 'baseline', 'sample.json'), 'utf-8'));
const actual = assess(loadEngine(), readFileSync(SAMPLE_XML, 'utf-8'));

test('sample model: parsed model summary matches baseline', () => {
  assert.deepStrictEqual(actual.model, baseline.model);
});

test('sample model: issues match baseline (rule, view, severity, detail)', () => {
  assert.deepStrictEqual(actual.issues, baseline.issues);
});

test('sample model: scores match baseline', () => {
  assert.deepStrictEqual(actual.score, baseline.score);
});

test('engine is deterministic across runs', () => {
  const again = assess(loadEngine(), readFileSync(SAMPLE_XML, 'utf-8'));
  assert.deepStrictEqual(again, actual);
});
