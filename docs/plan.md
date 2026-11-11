# Delivery plan — GYM-4127 / Part A

The status is updated at the end of every phase. ✅ done · 🔄 in progress · ⏳ not started

| Phase | Outcome | Status |
|---|---|---|
| 0 | Portable context: AGENTS.md, CLAUDE.md, docs/, reference digests, skill stubs | ✅ 2026-11-11 |
| 1 | Tool at `part_a/archimate-assessor.html` (one file, no build) + baseline tests, with no change in behaviour | ✅ 2026-11-11 |
| 2 | Rule catalogue + knowledgebase (3.2 Reference Cards, Archi relationship matrix) | ✅ 2026-11-11 |
| 3 | Structural view classifier; replace name-based checks; fix geometry checks; add new checks | ✅ 2026-11-11 |
| 4 | Scoring model: shared categories, capped penalties, breakdown table, one `grade()` | ✅ 2026-11-11 |
| 5 | Manual scoresheet aligned to the same model; case-study profile + EA/SA role | ✅ 2026-11-11 |
| 6 | PDF report to Report Format: offline, combined, signatures, outcome + attempt | ⏳ |
| 7 | Tests: unit, regression, renamed-view fixture, Report Format arithmetic, Archi fixtures | ⏳ |
| 8 | Handover: docs final, skills final, CHANGELOG, PR | ⏳ |

Each phase ends by updating this table, [decisions.md](decisions.md) and, if conventions changed, [AGENTS.md](../AGENTS.md). Then commit.

## Phase 1 — Working copy and baseline tests (no change in behaviour) ✅

**Result:**
- `part_a/archimate-assessor.html` is the tool, still byte-identical to `resources/archimate-assessor_2.html`. It is edited directly, with no build step (decision A8).
  - A split into `src/` modules plus `build.py` was tried first (commit `4a87b31`) and reverted as too complex.
- Tests (`npm test --prefix part_a`) load the HTML in jsdom and cover:
  - the baseline snapshot (model summary, issues, scores)
  - determinism
  - script errors on load
  - a smoke test through the real upload pipeline that checks all tabs render

  A deliberate regression was confirmed to fail them.
- Remaining network loads: the Google Fonts `@import` (falls back to system fonts offline) and jsPDF from CDN. Both are removed in Phase 6.

## Phase 2 — Rule catalogue and knowledgebase ✅

**Result** (all inside `part_a/archimate-assessor.html`):
- **`rule-catalogue` JSON block.** It holds 41 rules, each with source, severity, category, rubric subcategory and automation status.
  - Checks emit only `{ruleId, viewId, viewName, detail}`. `makeIssue()` fills in the rest from the catalogue and throws on an unknown id.
  - The UI rules tab and the PDF checklist both read the catalogue. Their two hard-coded copies are gone.
- **`relationship-matrix` JSON block.** It is converted from Archi `relationships.xml` v3.2 at upstream commit `6d23608` (MIT notice included), 18 KB, round-trip verified for all 3,844 type pairs.
  - The new rule **ARC-REL-002** checks every model relationship against it.
- **Knowledge base:** the 3.2 element layers (Physical inside Technology; Grouping, Location and Junction under "Other"), and the exchange-format junction aliases.
- **Retired:**
  - ARC-CL-001 to ARC-CL-004, ARC-STR-001, ARC-REL-001 (see decisions A9)
  - the never-firing elm-001 check
  - the layer-pair table and dead code
- **Checklist:** manual rules show **MANUAL** and heuristic ones are marked `~`. On the sample: 22 PASS, 1 INFO, 18 MANUAL.
- **Baseline change.** Sample score 76 → **100**: the 4 false ARC-CL-001 findings are gone.
  - ⚠ 100 isn't a meaningful score yet. The real gaps (diagonal connectors, layout, traceability) are only detected from Phase 3, and the CrossLayer category has no rules until Phase 4 redefines the categories.
- **Tests:** 13 passing, including a fixture that ARC-REL-002 must flag correctly.

Original steps:

1. Add a `<script type="application/json" id="rule-catalogue">` block. One entry per rule:
   `{id, source, specRef, severity, category, subcategory, automation, description, rationale, verified}`
   - It replaces the inline descriptions in the checks and the `ALL_RULES` list in `renderRulesTab`.
2. Rebuild the KNOWLEDGE BASE section:
   - Element types and layers from the 3.2 Reference Cards: add Location, Grouping and Junction; fix the motivation types sitting in the Business list; Physical sits within Technology.
   - Aspect (active / behaviour / passive) per element type.
3. Add a `<script type="application/json" id="relationship-matrix">` block, converted once from Archi's `relationships.xml`. A header comment records the source, upstream commit and MIT notice. `ARC-REL-001` checks every relationship against it.
4. Remove:
   - the layer-pair table
   - ARC-CL-001 to ARC-CL-004 (wrong directions; ARC-CL-003 contradicts 3.2)
   - the dead code
5. Unimplemented rules render as "Manual review", never PASS.
6. Add a test that every issue's `ruleId` exists in the catalogue.
7. **Done when:** every issue has a catalogue ID, the rule checklist shows automation status, and the baseline diff is explained in the commit.

## Phase 3 — Structural checks ✅

**Result** (all in `part_a/archimate-assessor.html`):

- **VIEW CLASSIFIER section.** `classifyView()` returns `{type, crossLayer, confidence, reasons}` from:
  - element-layer shares
  - the hub node's degree
  - service, passive and app-structure counts
  - the layers joined by *drawn* relationships

  The thresholds are documented in the section header. The name is used only when structure is inconclusive (marked "from name only"). Cross-layer is a property any view can have, so a component view can also count as cross-layer.
  - On the sample, all 7 views get the type their authors intended.
  - The ticket's example passes: a contextual view renamed "Overview" is still recognised.
- **Rewritten on the classifier:**
  - COMP-002 to COMP-005
  - COMP-009, now "two cross-layer views", per the case-study checklist
  - cnn-009 data-view detection
  - the manual-tab insights
  - the View Analysis "Detected Type" + "Why"
- **ARC-USE-001 to 003 retired** (decision A10). They're replaced by **VW-002** (the name contradicts the content), which is the legitimate use of names.
- **Geometry** (Open Exchange coordinates confirmed absolute; anchor points not stored, so these are `partial`):
  - **cnn-001** rewritten: every segment, including the element ends. It finds the 5 diagonals in "Motivation View (2)".
  - **cnn-002** crossings, approximated.
  - **elm-006** container padding.
  - elm-004 (grid) **stays manual**: the sample's coordinates follow no consistent grid.
- **New model checks:**
  - ARC-REL-003 Association overuse (threshold in the catalogue `params`; sample 38%)
  - ARC-ELM-001 unnamed elements
  - ARC-ELM-002 duplicate names
  - VW-001 unconnected elements
  - TRC-001 missing layer link in the Motivation→Strategy→Business→Application→Technology chain
  - TRC-002 goals that don't trace into the architecture (sample: 2 of 7)
- **Sample:** 14 findings, score 76. SebTreb is 0 because of the old penalty cap, which Phase 4 replaces.
- **Tests:** 23 passing (`views.test.mjs` added).
- **Deferred to Phase 5:** assessor override of a view's detected type. It needs the manual-tab UI.

Original steps:

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

## Phase 4 — Scoring ✅

**Result:** see [scoring-model.md](scoring-model.md).
- **`scoring-config` JSON block:** Report Format categories and subcategories, severity penalties, per-rule cap, rating scale, grade bands, RAG thresholds.
  - Rules map to subcategories via `rubric`, so the old category buckets (and the catalogue's duplicated `category` field) are gone.
- **`calculateScore()`** returns `{total, earned, possible, coverage, byCategory, breakdown}`.
  - Subcategories with no automated check are excluded, not given free marks.
  - Sample: 66.5 / 75 = 88.7% under the Phase 4 weights. Under the Replit weights adopted later the same day: **66 / 78 = 84.6%**, coverage 78% (D1–D3).
- **One `grade()`, `rag()`, `combinedScore()` and `manualScore()`.** Every inline threshold or grade copy in the UI and PDF now delegates to them: 9 local category maps and 6 threshold copies removed.
- **Detailed Report:** a new "Automated Score Breakdown" table showing rule → occurrences → penalty → cap → score.
- **Tests:** 31 passing. `scoring.test.mjs` checks both caps. After the switch to Replit (D1–D3) it checks Replit's worked example instead of the Report Format arithmetic.
- **Not yet:** the manual scoresheet still uses its own 110% rows. Phase 5 rebuilds it on `SCORING` + `manualScore()`.

Original steps:

- Penalty per rule = severity weight × min(occurrences, perRuleCap). Category penalty is capped at the category's points, and the score is clamped at ≥ 0.
- Configurable in a `<script type="application/json" id="scoring-config">` block in the HTML: weights, severity weights, caps, rating scale, grade bands.
- A breakdown table in the UI and the PDF: rule → occurrences → penalty → cap applied → category score → total.
- One `grade()` / `rag()` used everywhere. Document it in `docs/scoring-model.md` with a worked example.

## Phase 5 — Manual scoresheet ✅

**Result:**
- **Manual sheet rebuilt from `SCORING`.** It has 12 rows totalling 100, with the Review Guide descriptors on each category and its reviewer prompts on each row (plus the rubric items that had no row).
  - Each row shows the **automated reference** (suggested rating, %, rule ids), as in Replit. Totals come from `manualScore()`, `combinedScore()` and `grade()`.
- **`MANUAL` state object.** The sheet renders from it and inputs write to it via `msSet()`. `reanalyse()` re-runs the checks when the role or a view override changes, without losing input.
- **`case-study-profile` JSON block.** ClimateIQ by default: expected views per role, stakeholders, requirements.
  - **VW-003** flags missing expected views for the chosen role. A matching rule means one view can't count twice.
  - Sample: SA is missing "Logical Data Model"; EA is missing "Business Information Model".
- **View Analysis: assessor override** of a detected type. The structural evidence is kept in the reasons.
- **Outcome and attempt**, with a suggestion: Pass at ≥ `passMark` (60, D6 provisional); otherwise an improvement plan on attempt 1, Fail on re-review.
- **Signatures:** Assessor / Reviewer / Candidate acknowledgement, each with name and date (D4).
- **`manualReadiness()`:** Replit's finalisation rules, shown live on the sheet. Phase 6 blocks the PDF on it.
- **One shared form:** the report dialog prefills from the manual sheet.
- **Tests:** 36 passing (`manual.test.mjs` added).

Original steps:

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
