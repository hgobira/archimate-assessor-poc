// Regenerates tests/baseline/sample.json from the current tool.
// Run ONLY when a behaviour change is intended, and explain the diff in the commit message.
//   npm run baseline:update --prefix part_a
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { PART_A, SAMPLE_XML, loadTool, assess } from './helpers/engine.mjs';

const out = path.join(PART_A, 'tests', 'baseline', 'sample.json');
const { window } = loadTool();
const result = assess(window, readFileSync(SAMPLE_XML, 'utf-8'));
window.close();
mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(result, null, 2) + '\n');
console.log(`baseline: ${result.issues.length} issues, total score ${result.score.total} -> ${path.relative(PART_A, out)}`);
