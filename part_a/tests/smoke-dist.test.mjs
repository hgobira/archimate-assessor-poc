// Smoke test of the BUILT single-file tool: load dist/archimate-assessor.html in jsdom,
// feed it the sample XML through the real upload pipeline, and check every tab renders
// without script errors. Network is not used (external resources are not loaded).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';
import { PART_A, SAMPLE_XML } from './helpers/engine.mjs';

const DIST = path.join(PART_A, 'dist', 'archimate-assessor.html');

test('built tool processes the sample model and renders all tabs', async () => {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (e) => errors.push(e.message));

  const dom = new JSDOM(readFileSync(DIST, 'utf-8'), {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole,
  });
  const { window } = dom;
  const alerts = [];
  window.alert = (msg) => alerts.push(String(msg));

  const file = new window.File([readFileSync(SAMPLE_XML, 'utf-8')], 'Arhchimateexample.xml', { type: 'text/xml' });
  window.processFile(file);

  const doc = window.document;
  const deadline = Date.now() + 10_000;
  while (doc.getElementById('results-section').style.display !== '' && Date.now() < deadline) {
    if (alerts.length) break;
    await new Promise((r) => setTimeout(r, 50));
  }

  assert.deepStrictEqual(alerts, [], 'tool raised an alert while processing');
  assert.deepStrictEqual(errors, [], 'script errors while processing');
  assert.equal(doc.getElementById('results-section').style.display, '', 'results section not shown');

  for (const id of ['auto-rules', 'manual-tab']) {
    const el = doc.getElementById(id);
    assert.ok(el && el.innerHTML.trim().length > 0, `#${id} did not render`);
  }
  window.close();
});
