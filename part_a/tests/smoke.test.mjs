// Smoke test: feed the sample XML through the tool's real upload pipeline (processFile)
// and check every tab renders without script errors. No network is used.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SAMPLE_XML, loadTool } from './helpers/engine.mjs';

test('tool processes the sample model and renders all tabs', async () => {
  const { window, errors } = loadTool();
  const doc = window.document;

  const file = new window.File([readFileSync(SAMPLE_XML, 'utf-8')], 'Arhchimateexample.xml', { type: 'text/xml' });
  window.processFile(file);

  const deadline = Date.now() + 10_000;
  while (doc.getElementById('results-section').style.display !== '' && !window.alerts.length && Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 50));
  }

  assert.deepStrictEqual(window.alerts, [], 'tool raised an alert while processing');
  assert.deepStrictEqual(errors, [], 'script errors while processing');
  assert.equal(doc.getElementById('results-section').style.display, '', 'results section not shown');
  for (const id of ['auto-rules', 'manual-tab']) {
    const el = doc.getElementById(id);
    assert.ok(el && el.innerHTML.trim().length > 0, `#${id} did not render`);
  }
  window.close();
});
