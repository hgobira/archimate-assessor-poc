---
name: build-release
description: Build, verify and release the single-file offline archimate-assessor tool (part_a/dist/archimate-assessor.html). Use when producing a version for assessors, before opening a PR, or when asked to build or test the tool.
---

# Build and release

> Status: **stub.** Usable from Phase 1, once `build.py` and the tests exist. Fill in the exact commands when Phase 1 lands, and update the Commands section in `AGENTS.md`.

1. **Build:** `python3 part_a/tools/build.py`. This regenerates the relationship matrix and `docs/rule-catalogue.md`, then inlines `src/` + vendored jsPDF into `part_a/dist/archimate-assessor.html`.
2. **Test:** `npm test --prefix part_a`. All unit and regression tests must pass. If a check can't run, say exactly what was skipped and why.
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
