# Delivery plan — GYM-4127 / Part A

The status is updated at the end of every phase. ✅ done · 🔄 in progress · ⏳ not started

| Phase | Outcome | Status |
|---|---|---|
| 0 | Portable context: AGENTS.md, CLAUDE.md, docs/, reference digests, skill stubs | ✅ 2026-11-11 |
| 1 | Restructure into `part_a/src` + `build.py`, with no change in behaviour; baseline snapshot of current output | ✅ 2026-11-11 |
| 2 | Rule catalogue + knowledgebase (3.2 Reference Cards, Archi relationship matrix) | ⏳ |
| 3 | Structural view classifier; replace name-based checks; fix geometry checks; add new checks | ⏳ |
| 4 | Scoring model: shared categories, capped penalties, breakdown table, one `grade()` | ⏳ |
| 5 | Manual scoresheet aligned to the same model; case-study profile + EA/SA role | ⏳ |
| 6 | PDF report to Report Format: offline, combined, signatures, outcome + attempt | ⏳ |
| 7 | Tests: unit, regression, renamed-view fixture, Report Format arithmetic, Archi fixtures | ⏳ |
| 8 | Handover: docs final, skills final, CHANGELOG, PR | ⏳ |

Each phase ends by updating this table, [decisions.md](decisions.md) and, if conventions changed, [AGENTS.md](../AGENTS.md). Then commit.

## Phase 1 — Restructure (no change in behaviour) ✅

**Result:**
- The baseline was split at its own `// =====` section markers into 11 JS modules + `styles.css` + `index.html`.
- `build.py` reassembles a file that is **byte-identical** to `resources/archimate-assessor_2.html`.
- Tests: baseline snapshot (model summary, issues, scores, determinism), plus a jsdom smoke test that runs the built file through the real upload pipeline and checks all tabs render. A deliberate regression was confirmed to fail the tests.
- Remaining network loads: the Google Fonts `@import` (falls back to system fonts offline) and jsPDF from CDN. Both are removed in Phase 6.

Original steps:

1. Install Node 22+ (`brew install node`).
2. Split `resources/archimate-assessor_2.html` into `part_a/src/`:
   - `kb.js`, `rules.js`
   - `parser.js` (the only DOM-dependent logic)
   - `checks.js`, `scoring.js` (pure)
   - `report.js`
   - `ui/*.js`
   - `styles.css`, `index.html`
3. `part_a/tools/build.py` inlines everything into `part_a/dist/archimate-assessor.html`.
4. Baseline: run the current engine on `Arhchimateexample.xml` and store its issues and scores as `part_a/tests/baseline/`. Until later phases change behaviour on purpose, the built tool must reproduce the baseline exactly.
5. **Done when:** the dist file opens offline (apart from jsPDF until Phase 6), matches the baseline, and `npm test` runs.

## Phase 2 — Rule catalogue and knowledgebase

1. Write `rules.js`. One entry per rule:
   `{id, source, specRef, severity, category, subcategory, automation, description, rationale, verified}`
2. Write `kb.js`:
   - Element types and layers from the 3.2 Reference Cards: add Location, Grouping and Junction; fix the motivation types sitting in the Business list; Physical sits within Technology.
   - Aspect (active / behaviour / passive) per element type.
3. Vendor `relationships.xml` under `part_a/vendor/archi/` with LICENSE and the commit pin. `build.py` generates the matrix, and `ARC-REL-001` checks every relationship against it.
4. Remove:
   - the layer-pair table
   - ARC-CL-001 to ARC-CL-004 (wrong directions; ARC-CL-003 contradicts 3.2)
   - the dead code
5. Unimplemented rules render as "Manual review", never PASS.
6. Generate `docs/rule-catalogue.md` from `rules.js`.
7. **Done when:** every issue has a catalogue ID, the rule checklist shows automation status, and the generated doc is committed.

## Phase 3 — Structural checks

1. View classifier using element mix, drawn cross-layer relationships, the `viewpoint` attribute and the name (weak hint only). It returns `{type, confidence, reasons[]}` and supports assessor override. Types:
   - Motivation, Strategy/Capability, Business
   - Contextual, Conceptual
   - Logical Component, Logical Data, Logical Services
   - Technology/Deployment, Cross-layer, Implementation
2. Rewrite the completeness checks on top of the classifier and the case-study profile's expected views for the candidate's role.
3. Fix `cnn-001`: check every segment, including the source and target ends; 5 diagonals are missed in "Motivation View (2)" today. Remove the `elm-001` check, which can never fire.
4. New automated checks:
   - `cnn-002` crossings
   - `elm-004` grid
   - `elm-006` nested spacing
   - Association overuse
   - Unnamed or duplicate elements
   - Isolated elements
   - Goal→Capability/Service→Application→Technology traceability
5. **Done when:** a fixture where "Contextual View" is renamed "Overview" is still recognised as contextual.

## Phase 4 — Scoring

- Penalty per rule = severity weight × min(occurrences, perRuleCap). Category penalty is capped at the category's points, and the score is clamped at ≥ 0.
- Configurable in `scoring-config.js`: weights, severity weights, caps, rating scale, grade bands.
- A breakdown table in the UI and the PDF: rule → occurrences → penalty → cap applied → category score → total.
- One `grade()` / `rag()` used everywhere. Document it in `docs/scoring-model.md` with a worked example.

## Phase 5 — Manual scoresheet

- Built from the same category and subcategory model (totals 100), with the automated rating shown beside each manual dropdown.
- Case-study profile and role (EA/SA) feed the scenario rows and expected views.
- One shared form for the candidate, assessor and date.

## Phase 6 — PDF

- Vendored jsPDF, inlined.
- Sections:
  - Cover summary (automated / manual / combined, grade, outcome, attempt number)
  - Automated breakdown + findings by rule ID
  - Manual scores + comments
  - Narrative
  - Signatures
- Fix the async success/failure bug, and block generation until the required fields are filled.

## Phase 7 — Tests

Unit tests for checks, classifier and scoring. Regression tests on the sample XML. The renamed-view fixture. A test that the Report Format example arithmetic (manual 72.5, automated 88, combined 80.25) reproduces. Archi exchange fixtures.

## Phase 8 — Handover

Final docs and skills, CHANGELOG, and a PR describing the changes, with links into `docs/`.
