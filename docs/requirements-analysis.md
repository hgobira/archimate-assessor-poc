# Requirements analysis — GYM-4127 (Part A)

The source requirements are in [README.md](../README.md) and [part_a/README.md](../part_a/README.md). GYM-4127 and Meenakshi's "Part A" are the same text.
The baseline tool audited here is [resources/archimate-assessor_2.html](../resources/archimate-assessor_2.html); line references below point into it.
Analysis date: 2026-11-11.

## Delivery status

GYM-4127 / Part A is delivered on `main` (2026-11-11). The tool is [part_a/archimate-assessor.html](../part_a/archimate-assessor.html); changes are listed in [CHANGELOG.md](../CHANGELOG.md).

| Requirement (ticket wording) | Status | Where |
|---|---|---|
| Input and parsing: works well | ✅ Kept; nested coordinates and junction aliases handled | PARSING |
| Audit the knowledgebase against ArchiMate 3.2 | ✅ Partly: 3.2 element layers (Reference Cards); 3.2 relationship matrix (Archi). ⚠ Derivation rules and viewpoint definitions wait for the full 3.2 spec (`kb-audit` skill). | KNOWLEDGE BASE, `relationship-matrix` |
| Rule catalogue in a structured block, every issue traceable to a rule ID | ✅ 46 rules; checks emit IDs only; a test fails on an untraceable ID | `rule-catalogue` |
| Replace brittle checks; look at structure, not names ("Overview" example) | ✅ Structural view classifier with reasons and override; the "Overview" test passes | VIEW CLASSIFIER |
| Scoring model: categories, weights, severity penalties, caps | ✅ Replit categories and weights; MUST/SHOULD penalties; per-rule and per-subcategory caps | `scoring-config`, [scoring-model.md](scoring-model.md) |
| Deterministic, transparent breakdown | ✅ Determinism test; breakdown table in the UI and the PDF | SCORING |
| Same grading rules for automated and manual (Replit) | ✅ One `grade()`; shared categories; Replit scale and bands | SCORING |
| One PDF: cover, automated findings, manual scores, narrative, combined score and grade, signatures | ✅ Offline, Report Format order, blocked until complete | REPORT GENERATION |

**Open questions for Meenakshi** (details in [decisions.md](decisions.md)):
- D10: the subcategory split of the Replit weights
- D9: penalty sizes
- D5: coverage shown as "Confidence"
- D6: the 60% pass mark
- D8: assessment levels
- D11: how to treat near-empty models

Also: confirm the interim Replit choice for D1–D3, and check the classifier thresholds (A10) on more submissions.

## Summary (analysis of the original tool, before the work)

| Area | Ticket says | Finding |
|---|---|---|
| Input & parsing | Works | Agreed. Parses Open Exchange elements, relationships, views, nodes, bendpoints. Keep as is. |
| Knowledgebase | Audit vs 3.2 | Layer table incomplete or wrong; relationship rules are a coarse layer-pair table with reversed entries; dead code. |
| Rule catalogue | Separate, traceable | Rule metadata is duplicated inline in checks and in a UI function; about 15 unimplemented rules display as **PASS**. |
| Brittle checks | Structural, not name-based | Seven or more checks infer view type from its name; geometry checks miss real violations. |
| Scoring | Categories, weights, penalties, caps; deterministic; transparent; same grading | Deterministic, but harsh and opaque; automated and manual use different category sets; manual sheet totals 110%; three grading schemes. |
| Report & export | One combined PDF | The PDF omits manual scores, narrative and combined score; the async success message is wrong; needs a CDN; signature roles mismatch. |

## 1. Knowledgebase (`ARCHIMATE_LAYERS`, `VALID_CROSS_LAYER_RELS`, [L1002–1063](../resources/archimate-assessor_2.html#L1002-L1063))

- **Business layer list contains motivation types** (Driver, Goal, Assessment, …, plus `BusinessObject` twice). It works only because the Motivation entries are assigned later and overwrite them.
- **Missing from the layer table:**
  - `Location` and `Grouping` (composite elements)
  - `Junction`

  Missing types resolve to `Unknown` and are skipped by every layer check. The sample model uses Location and Grouping.
- **Relationship validity** is a table of allowed relationship *types per layer pair*, not the 3.2 matrix *per element-type pair*. Several entries are wrong:
  - `Strategy→Business: Realization` is reversed. Core elements realize Capabilities. Archi matrix: BusinessService→Capability = `or`, Capability→BusinessService = `o`.
  - `Motivation→*: Realization` is reversed, and is dead anyway because Motivation is excluded at [L1386](../resources/archimate-assessor_2.html#L1386).
  - `Business→Strategy` and `Motivation` targets are never checked at all.
- **ARC-CL-003** flags Technology serving Business. That is valid in 3.2 (TechnologyService→BusinessProcess includes `v`).
- **ARC-CL-002** flags Business→Technology Realization as layer-skipping. The matrix already decides validity, so this is redundant.
- **Dead code:**
  - `INVALID_SAME_LAYER_RELS` (empty)
  - `UPWARD_SERVING` and `CONTAINER_TYPES` (unused)
  - the Assignment and Serving blocks at [L1435–1454](../resources/archimate-assessor_2.html#L1435-L1454), which do nothing
- **ARC-REL-001** detects types by substring (`type.includes('Service')`).
- **Fix:**
  - Element types and layers from the 3.2 Reference Cards.
  - Allowed relationships from Archi's 3.2 `relationships.xml`. See [decisions.md](decisions.md) D7 / A5.
  - The sample model's 82 relationships all validate against it. BizzDesign enforces validity, so on BizzDesign exports this check is a safety net. The value is in the quality checks below.

## 2. Rule catalogue

- Each `allIssues.push()` in `runAllChecks` ([L1146–1679](../resources/archimate-assessor_2.html#L1146-L1679)) hard-codes the description, severity and category.
- A second, separately maintained list `ALL_RULES` lives inside the UI function `renderRulesTab` ([L2361](../resources/archimate-assessor_2.html#L2361)).
- **Rules listed but never checked, so they always show PASS:**
  - elm-004, elm-006, elm-008, elm-009
  - cnn-002, cnn-004, cnn-005, cnn-006, cnn-007, cnn-008, cnn-010, cnn-011, cnn-012, cnn-013
  - msc-001, msc-002, msc-004

  The Report Format example's assessor flagged cnn-002, cnn-012, cnn-013, elm-006 and elm-009, all of which the tool passes silently.
- `cnn-005/006` is an empty placeholder ([L1337](../resources/archimate-assessor_2.html#L1337)).
- **What can be automated** from Open Exchange geometry (nodes have x/y/w/h; connections have bendpoints but **no anchor points or label positions**):

  | Automatable | Not automatable (stay manual) |
  |---|---|
  | cnn-001 (fixed), cnn-002 crossings, cnn-003, elm-002/003/004/005/006 | cnn-004 to cnn-008, cnn-010 to cnn-013 (no anchor or label data) |
  | elm-007 (heuristic), vws-001, msc-003, cnn-009 | elm-008/009 (no label alignment data), msc-001/002/004 (judgement) |

## 3. Brittle (name-based) checks

These decide a view's *type* from the view name:
- COMP-002 contextual, COMP-003 conceptual, COMP-004 technology, COMP-005 cross-layer
- ARC-USE-001, ARC-USE-002, ARC-USE-003
- cnn-009 (decides a "data view" from `data|information|model`)
- the manual-tab insights ([L1815](../resources/archimate-assessor_2.html#L1815))

The ticket's example: a contextual view named "Overview" counts as missing. **vws-001 is the legitimate exception**, because the SebTreb rule itself requires names to state the view type.

**Structural classifier (Phase 3).** Signals per view:

| Type | Structural signal |
|---|---|
| Contextual | One central system or service element; surrounding external actors, roles or systems; little internal decomposition |
| Conceptual | Services and functions plus consumers; no technology elements |
| Logical component | Mostly Application components, interfaces and services |
| Logical data / information | Mostly Data or Business objects, linked by association/aggregation/composition |
| Technology / deployment | Mostly Node, Device, SystemSoftware, CommunicationNetwork, Path, Artifact |
| Motivation | Mostly Stakeholder, Driver, Goal, Outcome, Requirement… |
| Strategy / capability | Capability, ValueStream, Resource, CourseOfAction |
| Cross-layer | **Relationships drawn in the view** connect two or more of Strategy/Motivation, Business, Application, Technology |

Also: the `viewpoint` attribute, if present (the sample has none), and the name as a weak hint. The output is `{type, confidence, reasons}`, and the assessor can override it.

**Geometry defects:**
- `cnn-001` only tests segments *between* bendpoints, so a straight diagonal connector with no bendpoints is never caught. In the sample, "Motivation View (2)" has **5 connectors that can only be drawn diagonally** (no shared x or y range between source and target), and none are flagged.
- `elm-001` tests `node.xsiType === 'Label'` only for nodes with an `elemRef`. Label nodes have none, so it can never fire.

**Missing quality checks** that the Review Guide asks about:
- **Association overuse.** The guide's own "Average" example is "using association instead of serving". The sample has 31/82 Associations.
- Unnamed or duplicate elements.
- Elements with no relationships in a view.
- Goal → Capability/Service → Application → Technology traceability.
- Role-aware expected views (EA vs SA lists in the case study).

## 4. Scoring (`calculateScore`, [L1689](../resources/archimate-assessor_2.html#L1689))

- **Severity weights:** MUST 3, SHOULD 1.5, INFO 0, counted per occurrence with no per-rule cap.
- **Category reaches 0% at half its weight in penalty points:** 5 MUST issues zero Completeness, 3 MUST issues zero SebTreb. One per-connector rule can wipe out a category.
- **Category sets differ.**
  - Automated: Completeness/CrossLayer/ArchiMate/SebTreb/Assessment.
  - Manual: the Review Guide's five.
  - So "combined" averages two unlike things.
- **The manual sheet totals 110%.** `MS_SECTIONS` rows: 30+20+25+25+10.
- **Grades:**
  - Tool: Distinction/Good/Average/Below/Poor at 85/70/55/40 ([L2017](../resources/archimate-assessor_2.html#L2017)).
  - Replit: Outstanding/Average/Poor at 80/60.
  - The PDF modal duplicates the thresholds inline ([L2549](../resources/archimate-assessor_2.html#L2549)).
- **No breakdown:** the assessor sees the category %, not which rules cost what.
- **Deterministic:** yes, and that must be kept.
- **Target model:** see [decisions.md](decisions.md) D1–D5 and [plan.md](plan.md) Phase 4.

## 5. Report & export (`generateReport` … `renderPDF`, [L2507–3050](../resources/archimate-assessor_2.html#L2507))

- The PDF contains:
  - the automated summary
  - category breakdown
  - per-view issues
  - rule checklist
  - blank signature lines

  It **does not** contain manual scores, the narrative (strengths, improvements, recommendations) or the combined score. "Overall" is the automated score.
- The modal asks again for the candidate, role and assessor, duplicating the manual tab.
- `buildPDFReport` loads jsPDF from a CDN asynchronously. The caller shows "✓ downloaded" before the library loads, and `throw` inside `script.onerror` is uncaught. Offline, it fails silently.
- Signature roles: Primary/Secondary/QA, versus the Report Format's Assessor/Reviewer/Candidate.
- **Target:** the [Report Format](reference/report-format.md) layout, plus outcome (Pass / Improvement plan / Fail) and attempt number (see [reference/assessment-overview.md](reference/assessment-overview.md)).

## Baseline result on the sample model (Phase 1 snapshot)

Captured in [part_a/tests/baseline/sample.json](../part_a/tests/baseline/sample.json): **total 76%**, with Completeness 100, **CrossLayer 4**, ArchiMate 100, SebTreb 100, Assessment 100. There are 5 issues:

- **4 × ARC-CL-001 (MUST), all false positives.** Each flags a Flow or Triggering relationship between Application and Business elements as an "invalid cross-layer type". All 82 relationships in the model are valid per the Archi 3.2 matrix. Under the current cap, these 4 false findings alone take CrossLayer from 100 to 4 and the total from 100 to 76.
- 1 × COMP-010 (INFO): 7 elements not used in any view.
- **SebTreb scores 100%** even though 5 connectors in "Motivation View (2)" can only be drawn diagonally (the cnn-001 gap above).

So the current tool penalises valid modelling heavily and misses real style violations. That's the concrete case for Phases 2–4.

## Inputs and gaps

| Need | Source | Status |
|---|---|---|
| 3.2 element types/layers | `resources/n221p.pdf` (3.2 Reference Cards) | Available |
| 3.2 relationship matrix | Archi `relationships.xml` v3.2 (MIT) | Available, to vendor (D7) |
| Derivation rules, viewpoint definitions | Full ArchiMate 3.2 spec | **Pending.** No current rule depends on them; the `kb-audit` skill lists what to check when the spec arrives |
| Rubric, report layout, scoring reference | `docs/reference/*` | Available; conflicts logged in D1–D3 |
