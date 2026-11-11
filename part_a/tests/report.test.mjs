// Phase 6: one offline PDF combining all required parts; blocked until the assessment is complete.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadTool, SAMPLE_XML, TOOL_HTML } from './helpers/engine.mjs';

async function loaded() {
  const t = loadTool();
  t.window.processFile(new t.window.File([readFileSync(SAMPLE_XML, 'utf-8')], 's.xml'));
  const d = t.window.document;
  for (let i = 0; i < 200 && d.getElementById('results-section').style.display !== ''; i++) await new Promise((r) => setTimeout(r, 50));
  t.set = (sel, v) => { const el = d.querySelector(sel); el.value = v; t.window.msSet(el); };
  return t;
}

function complete(t) {
  t.set('[data-path=candidate]', 'Sam Garforth'); t.set('[data-path=role]', 'SA'); t.set('[data-path=assessor]', 'Byron Wild');
  t.window.document.querySelectorAll('#manual-tab select.ms-select').forEach((s) => { s.value = 'Good'; t.window.msSet(s); });
  t.set('[data-path="narrative/strengths"]', 'Clear motivation model');
  t.set('[data-path=outcome]', 'Pass'); t.set('[data-path="signatures/assessor/name"]', 'Byron Wild');
}

test('the tool loads nothing from the network', async () => {
  const { JSDOM } = await import('jsdom');
  const html = readFileSync(TOOL_HTML, 'utf-8');
  const doc = new JSDOM(html).window.document;   // parsed, scripts not run: real tags only
  assert.equal(doc.querySelectorAll('script[src], link[href], img[src^="http"], iframe').length, 0);
  assert.ok(Array.from(doc.querySelectorAll('style'), (s) => s.textContent).every((css) => !css.includes('@import')));
  assert.match(html, /jsPDF 2\.5\.1 \(inlined, MIT\)/);
});

test('report is blocked and the missing items are listed until the assessment is complete', async () => {
  const t = await loaded();
  let built = 0;
  t.window.buildReportPdf = () => { built++; return { save() {} }; };
  t.window.generateReport();
  const text = t.window.document.getElementById('report-modal').textContent;
  assert.equal(built, 0);
  for (const item of ['Candidate name', 'Architecture role', 'Assessor name', 'ratings', 'Outcome', 'Assessor signature']) assert.match(text, new RegExp(item));
  t.window.close();
});

test('complete assessment → one PDF with every required part', async () => {
  const t = await loaded();
  complete(t);
  const w = t.window;
  assert.deepEqual(Array.from(w.manualReadiness()), []);
  assert.equal(w.reportFileName(), `ArchiMate_Assessment_Sam_Garforth_${w.eval('MANUAL').date}.pdf`);

  const data = w.reportData();
  const pdf = w.buildReportPdf(data).output();
  for (const part of ['Assessment Summary', 'Automated Analysis', 'Automated Score Breakdown', 'Automated Findings by Rule',
    'Manual Assessment Scores', 'Assessor Narrative', 'Combined Score and Grade', 'Signatures', 'Candidate Acknowledgement',
    'Sam Garforth', 'Clear motivation model', 'Outcome: Pass', `${data.combined}%`, 'Logical Data Model view']) {
    assert.ok(pdf.includes(part), `PDF is missing "${part}"`);
  }
  assert.equal(data.manual, 80);
  assert.equal(data.combined, w.combinedScore(data.score.total, 80));

  // generateReport saves exactly once with the Replit-style file name
  let saved = null;
  const real = w.buildReportPdf;
  w.buildReportPdf = (d) => ({ save: (name) => { saved = name; real(d); } });
  w.generateReport();
  assert.equal(saved, w.reportFileName());
  assert.match(w.document.getElementById('report-modal').textContent, /Report saved as/);
  assert.deepEqual(t.errors, []);
  w.close();
});

test('pdfText keeps WinAnsi text and maps symbols the PDF fonts cannot draw', async () => {
  const t = loadTool();
  assert.equal(t.window.pdfText('A → B ≥ 2 ✓ – “q” …'), 'A -> B >= 2 OK – “q” …');
  assert.equal(t.window.pdfText('漢'), '?');
  t.window.close();
});
