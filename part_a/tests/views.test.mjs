// Phase 3: structural view classification (not names), geometry checks, traceability.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadTool, SAMPLE_XML } from './helpers/engine.mjs';

const { window: w } = loadTool();
after(() => w.close());
const XML = readFileSync(SAMPLE_XML, 'utf-8');
const run = (xml, mutate) => {
  const model = w.parseXML(xml);
  if (mutate) mutate(model);
  const issues = Array.from(w.runAllChecks(model));
  return { model, issues, ids: issues.map((i) => i.ruleId) };
};
const types = (model) => Object.fromEntries(Array.from(model.views, (v) => [v.name, v.classification.type]));

test('sample views are classified by structure as their authors intended', () => {
  assert.deepEqual(types(run(XML).model), {
    'Conceptual View': 'conceptual',
    'Contextual View': 'contextual',
    'Technology View': 'technology',
    'Motivation View': 'motivation',
    'Motivation View (2)': 'motivation',
    'Component View - Data Ingestion': 'logical-component',
    'Cross-layer View - Data Ingestion': 'cross-layer',
  });
});

test('GYM-4127 example: a contextual view named "Overview" is still found', () => {
  const { model, issues, ids } = run(XML.replace('<name xml:lang="en">Contextual View</name>', '<name xml:lang="en">Overview</name>'));
  assert.ok(Array.from(model.views).some((v) => v.name === 'Overview' && v.classification.type === 'contextual'));
  assert.ok(!ids.includes('COMP-002'), 'contextual view must not be reported missing');
  assert.ok(issues.some((i) => i.ruleId === 'vws-001' && i.viewName === 'Overview'), 'SebTreb naming rule still applies');
});

test('generic view names do not cause missing-view findings', () => {
  const { ids } = run(XML, (m) => m.views.forEach((v, i) => { v.name = `View ${i + 1}`; }));
  for (const id of ['COMP-002', 'COMP-003', 'COMP-004', 'COMP-005', 'COMP-009']) assert.ok(!ids.includes(id), id);
});

test('a genuinely missing contextual view is reported', () => {
  const { ids } = run(XML, (m) => { m.views = m.views.filter((v) => v.name !== 'Contextual View'); });
  assert.ok(ids.includes('COMP-002'));
});

test('two cross-layer views on the sample; COMP-009 fires when only one remains', () => {
  const { model, ids } = run(XML);
  assert.equal(Array.from(model.views).filter((v) => v.classification.crossLayer).length, 2);
  assert.ok(!ids.includes('COMP-009'));
  const one = run(XML, (m) => { m.views = m.views.filter((v) => !v.name.startsWith('Component View')); });
  assert.ok(one.ids.includes('COMP-009'));
});

test('VW-002: name/content mismatch is flagged, matching names are not', () => {
  assert.ok(!run(XML).ids.includes('VW-002'), 'sample names match their content');
  const { issues } = run(XML.replace('<name xml:lang="en">Technology View</name>', '<name xml:lang="en">Business Conceptual View</name>'));
  assert.ok(issues.some((i) => i.ruleId === 'VW-002' && i.viewName === 'Business Conceptual View'));
});

test('cnn-001 finds the 5 connectors that can only be drawn diagonally', () => {
  const diag = run(XML).issues.filter((i) => i.ruleId === 'cnn-001');
  assert.equal(diag.length, 5);
  assert.ok(diag.every((i) => i.viewName === 'Motivation View (2)'));
});

test('geometry helpers', () => {
  const B = (x, y, wd, h) => ({ box: { x1: x, y1: y, x2: x + wd, y2: y + h } });
  assert.equal(w.segmentMustBeDiagonal(B(0, 0, 10, 10), B(100, 100, 10, 10)), true, 'no shared range');
  assert.equal(w.segmentMustBeDiagonal(B(0, 0, 10, 10), B(5, 100, 10, 10)), false, 'x ranges overlap → vertical possible');
  assert.equal(w.segmentMustBeDiagonal({ pt: { x: 0, y: 0 } }, { pt: { x: 50, y: 1 } }), false, 'within tolerance');
  const p = (x, y) => ({ x, y });
  assert.equal(w.segmentsCross(p(0, 0), p(10, 10), p(0, 10), p(10, 0)), true);
  assert.equal(w.segmentsCross(p(0, 0), p(10, 0), p(0, 5), p(10, 5)), false);
});

test('model quality and traceability findings on the sample', () => {
  const { issues } = run(XML);
  const by = (id) => issues.find((i) => i.ruleId === id);
  assert.match(by('ARC-REL-003').detail, /31 of 82/);
  assert.match(by('TRC-002').detail, /^2 of 7 goal/);
  assert.ok(!by('TRC-001'), 'every layer link exists in the sample');
});

test('TRC-001 reports a missing layer link', () => {
  const { issues } = run(XML, (m) => {
    for (const [id, r] of Object.entries(m.relationships)) {
      const a = m.elements[r.source], b = m.elements[r.target];
      if (a && b && [a.layer, b.layer].sort().join() === 'Application,Technology') delete m.relationships[id];
    }
  });
  assert.ok(issues.some((i) => i.ruleId === 'TRC-001' && /Application to Technology/.test(i.detail)));
});
