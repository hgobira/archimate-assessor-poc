// Regression: the tool's output on the sample model must match the committed baseline.
// A failure means behaviour changed. If intended, run `npm run baseline:update --prefix part_a`
// and explain the diff in the commit; if not, fix the regression.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { PART_A, SAMPLE_XML, loadTool, assess } from './helpers/engine.mjs';

const baseline = JSON.parse(readFileSync(path.join(PART_A, 'tests', 'baseline', 'sample.json'), 'utf-8'));
const xml = readFileSync(SAMPLE_XML, 'utf-8');
const tool = loadTool();
after(() => tool.window.close());
const actual = assess(tool.window, xml);

test('tool loads without script errors', () => {
  assert.deepStrictEqual(tool.errors, []);
});

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
  assert.deepStrictEqual(assess(tool.window, xml), actual);
});
