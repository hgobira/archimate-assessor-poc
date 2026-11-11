// Phase 2: rule catalogue integrity, ArchiMate 3.2 relationship matrix, ARC-REL-002 detection.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadTool, SAMPLE_XML } from './helpers/engine.mjs';

const { window } = loadTool();
after(() => window.close());
const RULES = window.eval('RULES');

test('catalogue: unique ids and valid fields', () => {
  const ids = RULES.map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length, 'duplicate rule id');
  for (const r of RULES) {
    assert.match(r.severity, /^(MUST|SHOULD|INFO)$/, r.id);
    assert.match(r.automation, /^(automated|partial|manual)$/, r.id);
    assert.ok(r.description && r.category && r.source && r.rubric, `${r.id} missing field`);
  }
});

test('catalogue: retired ids are gone', () => {
  for (const id of ['ARC-CL-001', 'ARC-CL-002', 'ARC-CL-003', 'ARC-CL-004', 'ARC-STR-001', 'ARC-REL-001']) {
    assert.ok(!RULES.some((r) => r.id === id), `${id} should be retired`);
  }
});

test('catalogue: every rule id used by a check exists in the catalogue', () => {
  const html = readFileSync(new URL('../archimate-assessor.html', import.meta.url), 'utf-8');
  const checks = html.slice(html.indexOf('function runAllChecks('), html.indexOf('function getNodeElement('));
  const used = [...checks.matchAll(/ruleId: '([^']+)'/g)].map((m) => m[1]);
  assert.ok(used.length > 10);
  for (const id of used) assert.ok(RULES.some((r) => r.id === id), `${id} emitted but not in catalogue`);
});

test('matrix: ArchiMate 3.2 facts behind the retired cross-layer rules', () => {
  const ok = (s, t, rel) => window.isRelationshipAllowed(s, t, rel);
  assert.equal(ok('BusinessService', 'Capability', 'Realization'), true, 'core element realizes capability');
  assert.equal(ok('Capability', 'BusinessService', 'Realization'), false, 'capability does not realize business service');
  assert.equal(ok('TechnologyService', 'BusinessProcess', 'Serving'), true, 'technology may serve business (old ARC-CL-003 was wrong)');
  assert.equal(ok('ApplicationComponent', 'ApplicationService', 'Realization'), true);
  assert.equal(ok('ApplicationService', 'ApplicationComponent', 'Realization'), false);
  assert.equal(ok('AndJunction', 'BusinessProcess', 'Triggering') !== null, true, 'exchange junction alias resolves');
  assert.equal(ok('Unknown', 'BusinessProcess', 'Serving'), null, 'unknown types are not judged');
});

test('matrix: every relationship in the sample model is valid', () => {
  const model = window.parseXML(readFileSync(SAMPLE_XML, 'utf-8'));
  const bad = window.runAllChecks(model).filter((i) => i.ruleId === 'ARC-REL-002');
  assert.deepEqual(bad.length, 0);
});

const FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<model xmlns="http://www.opengroup.org/xsd/archimate/3.0/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" identifier="m1">
  <name>Fixture</name>
  <elements>
    <element identifier="e1" xsi:type="ApplicationService"><name>Svc</name></element>
    <element identifier="e2" xsi:type="ApplicationComponent"><name>Comp</name></element>
    <element identifier="e3" xsi:type="Capability"><name>Cap</name></element>
    <element identifier="e4" xsi:type="BusinessService"><name>BSvc</name></element>
    <element identifier="e5" xsi:type="TechnologyService"><name>TSvc</name></element>
    <element identifier="e6" xsi:type="BusinessProcess"><name>Proc</name></element>
  </elements>
  <relationships>
    <relationship identifier="r1" source="e1" target="e2" xsi:type="Realization"/>
    <relationship identifier="r2" source="e3" target="e4" xsi:type="Realization"/>
    <relationship identifier="r3" source="e4" target="e3" xsi:type="Realization"/>
    <relationship identifier="r4" source="e5" target="e6" xsi:type="Serving"/>
    <relationship identifier="r5" source="e2" target="e1" xsi:type="Realization"/>
  </relationships>
  <views><diagrams>
    <view identifier="v1" xsi:type="Diagram"><name>Logical Component View</name>
      <node identifier="n1" elementRef="e1" xsi:type="Element" x="0" y="0" w="120" h="60"/>
      <node identifier="n2" elementRef="e2" xsi:type="Element" x="0" y="120" w="120" h="60"/>
      <connection identifier="c1" relationshipRef="r1" xsi:type="Relationship" source="n1" target="n2"/>
    </view>
  </diagrams></views>
</model>`;

test('ARC-REL-002 flags exactly the invalid relationships, per view or model level', () => {
  const issues = window.runAllChecks(window.parseXML(FIXTURE)).filter((i) => i.ruleId === 'ARC-REL-002');
  const where = Array.from(issues, (i) => `${i.viewName}: ${i.detail.split(' is not')[0]}`).sort();
  assert.deepEqual(where, [
    'Logical Component View: "Svc" (ApplicationService) → Realization → "Comp" (ApplicationComponent)',
    'Model Level: "Cap" (Capability) → Realization → "BSvc" (BusinessService)',
  ]);
  for (const i of issues) {
    assert.equal(i.severity, 'MUST');
    assert.equal(i.description, window.eval('RULE_BY_ID')['ARC-REL-002'].description, 'description comes from catalogue');
  }
});

test('rule checklist never shows a manual rule as PASS', () => {
  const ruleStatus = window.eval('ruleStatus');
  for (const r of RULES.filter((x) => x.automation === 'manual')) assert.equal(ruleStatus(r, []), 'MANUAL', r.id);
});
