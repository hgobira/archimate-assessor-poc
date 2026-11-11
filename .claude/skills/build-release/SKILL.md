---
name: build-release
description: Test, verify and release the single-file offline archimate-assessor tool (part_a/archimate-assessor.html). Use when producing a version for assessors, before opening a PR, or when asked to test the tool.
---

# Test and release

> Status: **usable.** `report.test.mjs` already covers the offline check and the PDF content. Steps 3–4 are the manual double-check in a real browser.

There's no build: `part_a/archimate-assessor.html` *is* the deliverable.

0. **First time only:** `npm install --prefix part_a` (Node 22+). Only needed for tests.
1. **Test:** `npm test --prefix part_a`. This runs the baseline regression, determinism, script errors on load, and a smoke test of the real upload pipeline. All must pass. If a baseline diff is intended, run `npm run baseline:update --prefix part_a` and explain the diff in the commit. If a check can't run, say exactly what was skipped and why.
2. **Check it's one file:** `grep -nE "<script[^>]+src=|<link[^>]+href=|@import" part_a/archimate-assessor.html` finds nothing (no external files or CDN).
3. **Check offline by hand:** with networking off, double-click the file, load `resources/Arhchimateexample.xml`, fill in the manual sheet, and generate the PDF.
4. **Check the PDF:** it has these sections in order:
   - cover summary
   - automated breakdown + findings by rule ID
   - manual scores + comments
   - narrative
   - combined score + grade + outcome
   - signatures

   Compare against [docs/reference/report-format.md](../../../docs/reference/report-format.md).
5. **Release:** add a CHANGELOG entry, update the `docs/plan.md` status, commit, and give assessors the HTML file.
