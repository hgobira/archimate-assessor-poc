// Phase 4: one deterministic, transparent scoring model for automated and manual scores.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadTool, SAMPLE_XML } from './helpers/engine.mjs';

const { window: w } = loadTool();
after(() => w.close());
const SCORING = w.eval('SCORING');
const RULES = Array.from(w.eval('RULES'));
const score = w.calculateScore(w.runAllChecks(w.parseXML(readFileSync(SAMPLE_XML, 'utf-8'))));

test('config: category weights total 100 and subcategories sum to their category', () => {
  assert.equal(SCORING.categories.reduce((s, c) => s + c.weight, 0), 100);
  for (const c of SCORING.categories) {
    assert.equal(c.subcategories.reduce((s, x) => s + x.weight, 0), c.weight, c.id);
  }
});

test('config: every rule maps to an existing subcategory', () => {
  const subs = new Set(SCORING.categories.flatMap((c) => c.subcategories.map((s) => `${c.id}.${s.id}`)));
  for (const r of RULES) assert.ok(subs.has(r.rubric), `${r.id} → ${r.rubric}`);
});

test('one grade() for every score (Replit bands, D3)', () => {
  assert.equal(w.grade(80), 'Outstanding');
  assert.equal(w.grade(79.99), 'Average');
  assert.equal(w.grade(60), 'Average');
  assert.equal(w.grade(59.99), 'Poor');
  assert.equal(w.grade(0), 'Poor');
  assert.equal(w.gradeFromScore(85), w.grade(85), 'legacy name delegates');
});

test('Replit scoring (D1-D3 accepted): weights, 0-5 scale, combined mean', () => {
  assert.deepEqual(Array.from(SCORING.categories, (c) => c.weight), [25, 20, 20, 20, 15]);
  assert.deepEqual(Array.from(SCORING.ratingScale, (r) => r.pct), [0, 20, 40, 60, 80, 100]);
  // Replit worked example: rating 4 (Good) on a weight-10 subcategory = 8.0 points
  assert.equal(w.manualScore({ 'metamodel.elements': 'Good' }), 8);
  const all = (label) => Object.fromEntries(SCORING.categories.flatMap((c) => c.subcategories.map((s) => [`${c.id}.${s.id}`, label])));
  assert.equal(w.manualScore(all('Good')), 80);
  assert.equal(w.manualScore(all('Below Average')), 40);
  assert.equal(w.combinedScore(88, 72.5), 80.25);
});

test('penalties: per-rule occurrence cap and subcategory floor at 0', () => {
  const sub = score.breakdown.find((c) => c.id === 'clarity').subs.find((s) => s.id === 'clarity.sebtreb');
  const diag = sub.hits.find((h) => h.ruleId === 'cnn-001');
  assert.equal(diag.occurrences, 5);
  assert.equal(diag.counted, SCORING.perRuleMaxOccurrences);
  assert.equal(diag.penaltyPct, 75);
  assert.ok(sub.capped && sub.rawPenaltyPct > 100);
  assert.equal(sub.appliedPenaltyPct, 100);
  assert.equal(sub.score, 0);
});

test('subcategories with no automated rule are manual-only and excluded', () => {
  const manualOnly = Array.from(score.breakdown.flatMap((c) => c.subs).filter((s) => !s.assessable), (s) => s.id).sort();
  assert.deepEqual(manualOnly, ['crosslayer.horizontal', 'metamodel.layers', 'scenario.accuracy']);
  assert.equal(score.possible, 78);
  assert.equal(score.coverage, 78);
});

test('breakdown adds up to the total shown', () => {
  const subsEarned = score.breakdown.flatMap((c) => c.subs).filter((s) => s.assessable).reduce((t, s) => t + s.score, 0);
  assert.equal(Math.round(subsEarned * 10) / 10, score.earned);
  assert.equal(score.total, Math.round(score.earned / score.possible * 1000) / 10);
  assert.equal(score.total, 84.6);
});

test('a clean model scores 100 on everything assessable', () => {
  const clean = w.calculateScore([]);
  assert.equal(clean.total, 100);
  assert.ok(Object.values(clean.byCategory).every((v) => v === 100));
});
