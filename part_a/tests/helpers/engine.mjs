// Loads the single-file tool (part_a/archimate-assessor.html) in jsdom so its functions
// (parseXML, runAllChecks, calculateScore, processFile, …) can be tested headlessly.
// Nothing is built or extracted: the tests run the exact file assessors open.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';

export const PART_A = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const REPO = path.resolve(PART_A, '..');
export const TOOL_HTML = path.join(PART_A, 'archimate-assessor.html');
export const SAMPLE_XML = path.join(REPO, 'resources', 'Arhchimateexample.xml');

// Returns the tool's window; `errors` collects any script errors raised while loading/running.
export function loadTool() {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', (e) => errors.push(e.message));
  const { window } = new JSDOM(readFileSync(TOOL_HTML, 'utf-8'), {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole,
  });
  window.alerts = [];
  window.alert = (msg) => window.alerts.push(String(msg));
  return { window, errors };
}

// Plain-JSON round trip: strips jsdom-realm prototypes so deepStrictEqual compares values only.
export const plain = (v) => JSON.parse(JSON.stringify(v));

// Engine pipeline as the tool runs it: parse -> checks -> score.
export function assess(window, xmlText) {
  const model = window.parseXML(xmlText);
  const issues = window.runAllChecks(model);
  const score = window.calculateScore(issues, model.views);
  return plain({
    model: {
      name: model.modelName,
      elements: Object.keys(model.elements).length,
      relationships: Object.keys(model.relationships).length,
      views: model.views.map((v) => ({ id: v.id, name: v.name, nodes: v.nodes.length, connections: v.connections.length })),
    },
    issues,
    score,
  });
}
