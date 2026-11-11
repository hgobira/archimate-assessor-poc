---
name: build-release
description: Build, verify and release the single-file offline archimate-assessor tool (part_a/dist/archimate-assessor.html). Use when producing a version for assessors, before opening a PR, or when asked to build or test the tool.
---

# Build and release

> Status: **usable.** Steps 1–2 work now. Steps 3–4 become fully meaningful after Phase 6 (offline PDF).

0. **First time only:** `npm install --prefix part_a`. Needs Node 22+ and Python 3.
1. **Build:** `python3 part_a/tools/build.py`. It inlines `part_a/src/` into `part_a/dist/archimate-assessor.html`. From Phase 2 it also regenerates the relationship matrix and `docs/rule-catalogue.md`, and from Phase 6 it inlines the vendored jsPDF.
2. **Test:** `npm test --prefix part_a`. This runs the dist freshness check, the baseline regression and the jsdom smoke test of the built file. All must pass. If a baseline diff is intended, run `npm run baseline:update --prefix part_a` and explain the diff in the commit. If a check can't run, say exactly what was skipped and why.
3. **Check offline:** `grep -nE "https?://" part_a/dist/archimate-assessor.html` finds no runtime URL loads (licence or attribution text is fine). Open the file with networking off, load `resources/Arhchimateexample.xml`, fill in the manual sheet, and generate the PDF.
4. **Check the PDF:** it has these sections in order:
   - cover summary
   - automated breakdown + findings by rule ID
   - manual scores + comments
   - narrative
   - combined score + grade + outcome
   - signatures

   Compare against [docs/reference/report-format.md](../../../docs/reference/report-format.md).
5. **Record:** add a CHANGELOG entry and update `docs/plan.md` status. Commit `dist/` together with the source changes that produced it.
