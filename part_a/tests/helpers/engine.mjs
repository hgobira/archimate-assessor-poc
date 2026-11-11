// Loads the tool's engine modules (plain scripts sharing one global scope, exactly as in
// the built HTML) into an isolated VM context, so they can be tested headlessly.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

export const PART_A = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const REPO = path.resolve(PART_A, '..');
export const SAMPLE_XML = path.join(REPO, 'resources', 'Arhchimateexample.xml');

// Engine modules in build order (see tools/build.py JS_MODULES). UI modules are excluded.
const ENGINE_MODULES = ['kb.js', 'parser.js', 'checks.js', 'scoring.js'];

export function loadEngine() {
  const { window } = new JSDOM('');
  const context = vm.createContext({ DOMParser: window.DOMParser, console });
  for (const name of ENGINE_MODULES) {
    const file = path.join(PART_A, 'src', name);
    vm.runInContext(readFileSync(file, 'utf-8'), context, { filename: file });
  }
  return context; // function declarations (parseXML, runAllChecks, calculateScore, …) are globals here
}

// Plain-JSON round trip: strips VM-realm prototypes so deepStrictEqual compares values only.
export const plain = (v) => JSON.parse(JSON.stringify(v));

// Full pipeline as app.js runs it: parse -> checks -> score.
export function assess(engine, xmlText) {
  const model = engine.parseXML(xmlText);
  const issues = engine.runAllChecks(model);
  const score = engine.calculateScore(issues, model.views);
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
