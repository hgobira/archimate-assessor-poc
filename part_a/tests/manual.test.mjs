// Phase 5: manual scoresheet on the shared model, case-study profile (EA/SA), view-type override.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadTool, SAMPLE_XML } from './helpers/engine.mjs';

const { window: w } = loadTool();
after(() => w.close());
const XML = readFileSync(SAMPLE_XML, 'utf-8');
const run = (settings, mutate) => {
  const m = w.parseXML(XML);
  if (mutate) mutate(m);
  return Array.from(w.runAllChecks(m, settings));
};
const vw3 = (issues) => issues.filter((i) => i.ruleId === 'VW-003').map((i) => i.detail.match(/"([^"]+)"/)[1]);

test('VW-003: expected views per role (sample)', () => {
  assert.deepEqual(vw3(run({})), [], 'no role → not checked');
  assert.deepEqual(vw3(run({ role: 'SA' })), ['Logical Data Model view']);
  assert.deepEqual(vw3(run({ role: 'EA' })), ['Business Information Model view']);
});

test('VW-003: one view cannot satisfy two expectations', () => {
  // EA needs Business Conceptual AND Logical Services; without the component view only one is met
  const issues = run({ role: 'EA' }, (m) => { m.views = m.views.filter((v) => !v.name.startsWith('Component View')); });
  assert.equal(vw3(issues).length, 2);
});

test('assessor override changes the type and keeps the evidence', () => {
  const m = w.parseXML(XML);
  const ctx = m.views.find((v) => v.name === 'Contextual View');
  const ids = Array.from(w.runAllChecks(m, { overrides: { [ctx.id]: 'conceptual' } }), (i) => i.ruleId);
  assert.equal(ctx.classification.type, 'conceptual');
  assert.equal(ctx.classification.confidence, 'assessor');
  assert.match(ctx.classification.reasons[0], /Set by assessor \(structure suggested Contextual\)/);
  assert.ok(ids.includes('COMP-002'), 'no contextual view left once overridden');
});

test('suggested rating, outcome and readiness', () => {
  assert.equal(w.suggestedRating(100), 'Outstanding');
  assert.equal(w.suggestedRating(80), 'Good');
  assert.equal(w.suggestedRating(45), 'Adequate');
  assert.equal(w.suggestedOutcome(60, 1), 'Pass');
  assert.equal(w.suggestedOutcome(59.9, 1), 'Improvement plan required');
  assert.equal(w.suggestedOutcome(59.9, 2), 'Fail');

  const m = w.freshManualState();
  assert.ok(w.manualReadiness(m).length >= 6);
  Object.assign(m, { candidate: 'A', role: 'SA', assessor: 'B', outcome: 'Pass' });
  m.signatures.assessor.name = 'B';
  for (const c of w.eval('SCORING').categories) for (const s of c.subcategories) m.ratings[`${c.id}.${s.id}`] = 'Good';
  assert.deepEqual(Array.from(w.manualReadiness(m)), []);
  assert.equal(w.manualScore(m.ratings), 75);
});

test('UI: 12 rows; role change re-analyses without losing input', async () => {
  const { loadTool: load } = await import('./helpers/engine.mjs');
  const { window: u, errors } = load();
  u.processFile(new u.File([XML], 's.xml'));
  const d = u.document;
  for (let t = 0; t < 200 && d.getElementById('results-section').style.display !== ''; t++) await new Promise((r) => setTimeout(r, 50));
  assert.equal(d.querySelectorAll('#manual-tab select.ms-select').length, 12);
  const set = (sel, v) => { const el = d.querySelector(sel); el.value = v; u.msSet(el); };
  set('[data-path=candidate]', 'Sam');
  set('[data-path="ratings/metamodel.elements"]', 'Outstanding');
  set('[data-path=role]', 'SA');
  assert.equal(d.querySelector('[data-path=candidate]').value, 'Sam');
  assert.equal(d.querySelector('[data-path="ratings/metamodel.elements"]').value, 'Outstanding');
  assert.equal(d.getElementById('ms-manual-total').textContent, '10%');
  assert.ok(u.eval('currentIssues').some((i) => i.ruleId === 'VW-003'));
  assert.deepEqual(errors, []);
  u.close();
});
