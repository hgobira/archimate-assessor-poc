// Phase 7: other exporters' files (Archi Open Exchange fixtures) parse, check and score without errors.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadTool } from './helpers/engine.mjs';

const { window: w, errors } = loadTool();
after(() => w.close());
const load = (f) => w.parseXML(readFileSync(new URL(`./fixtures/${f}`, import.meta.url), 'utf-8'));
const ids = (m) => Array.from(w.runAllChecks(m), (i) => i.ruleId);

test('Archi model with no views: parsed, every view requirement reported, not scored as complete', () => {
  const m = load('exchange-sample1.xml');
  assert.equal(Object.keys(m.elements).length, 2);
  assert.equal(m.views.length, 0);
  const issues = Array.from(w.runAllChecks(m));
  for (const id of ['COMP-001', 'COMP-002', 'COMP-003', 'COMP-004', 'COMP-005']) assert.ok(issues.some((i) => i.ruleId === id), id);
  assert.equal(issues.find((i) => i.ruleId === 'COMP-001').count, 6, 'one occurrence per missing view');
  const s = w.calculateScore(issues);
  assert.equal(s.byCategory.scenario, 0);
  assert.ok(s.total < 80, 'an empty model is never Outstanding');
});

test('Archi view with attachments: vertical connectors are not diagonal or crossing; relationships valid', () => {
  const m = load('exchange-bendpoint.xml');
  assert.equal(m.views.length, 1);
  assert.equal(m.views[0].connections.length, 2);
  const found = ids(m);
  for (const id of ['cnn-001', 'cnn-002', 'ARC-REL-002', 'VW-001']) assert.ok(!found.includes(id), id);
  assert.ok(found.includes('vws-001'), 'a view named "View" does not state its type');
});

test('no script errors across the fixtures', () => {
  assert.deepEqual(errors, []);
});
