# Changelog

## GYM-4127 Part A — 2026-11-11

Compared with the original tool (`resources/archimate-assessor_2.html`). The tool is now [part_a/archimate-assessor.html](part_a/archimate-assessor.html): still one HTML file, now fully offline (554 KB).

### Rule engine and knowledgebase

- **Rule catalogue** in a JSON block (46 rules: 12 automated, 18 heuristic, 16 manual). Every finding traces to a rule ID, and descriptions and severities come only from the catalogue.
  - The UI and PDF checklists read it; they used to keep their own hard-coded lists.
  - The 16 rules the XML can't support now show **MANUAL** instead of a false PASS.
- **ArchiMate 3.2:**
  - Element layers follow the 3.2 Reference Cards. Location, Grouping and Junction were previously unrecognised.
  - Relationship validity uses Archi's 3.2 matrix by element type (**ARC-REL-002**).
- **Retired inaccurate rules:**
  - ARC-CL-001…004: layer-pair approximations. They produced 4 false MUST findings on the sample; ARC-CL-003 contradicted 3.2.
  - ARC-STR-001, ARC-REL-001.
  - ARC-USE-001…003: replaced by VW-002.
- **Views are classified by structure, not name.** A contextual view named "Overview" is still recognised. Each classification shows its reasons, and an assessor can override it. Completeness checks are rewritten on this basis.
- **Geometry fixed:**
  - cnn-001 now tests every connector segment and finds the 5 diagonals the old check missed.
  - New: cnn-002 crossings, elm-006 container padding.
  - elm-001's check could never fire; it's now marked manual.
- **New checks:**
  - Association overuse (ARC-REL-003)
  - Unnamed and duplicate elements (ARC-ELM-001/002)
  - Unconnected elements (VW-001)
  - View name contradicts content (VW-002)
  - Expected views for the EA/SA role (VW-003)
  - Layer-chain links (TRC-001), goal traceability (TRC-002)
  - Two cross-layer views (COMP-009)
  - COMP-001 counts each missing view

### Scoring

- **One model for automated and manual scores** (`scoring-config`). Replit category weights 25/20/20/20/15, rating scale 0–5, grade bands ≥80 / ≥60.
  - The old automated and manual sheets used different category sets, the manual sheet totalled 110%, and there were three different grading schemes.
- **Penalties:** MUST −25% / SHOULD −10% of a subcategory, at most 3 occurrences per rule, each subcategory floored at 0.
  - Before, a handful of findings zeroed a whole category.
- **Manual-only subcategories** are excluded from the automated score rather than given free marks. Coverage is reported as the "Confidence" figure.
- **Transparent breakdown** in the UI and the PDF: rule → occurrences → penalty → cap → score.

### Manual assessment

- **Sheet rebuilt on the same model:** 12 rows totalling 100.
  - Review Guide descriptors and reviewer prompts on every section and row.
  - The automated reference rating beside each manual rating.
- **Case-study profile** (ClimateIQ default; replaceable), with the candidate role (EA/SA).
- **Outcome** (Pass / Improvement plan required / Fail) with a suggestion, plus an attempt number.
- **Signatures:** Assessor, Reviewer and Candidate acknowledgement.
- **Readiness check** (Replit finalisation rules).
- **No input lost:** changing the role or a view override re-runs the analysis without losing anything typed.

### Report

- **One PDF in the Report Format layout:**
  - cover summary
  - automated findings and breakdown
  - expected views
  - manual scores with comments
  - narrative
  - combined score, grade and outcome
  - signatures
- **Fixes:**
  - It used to omit the manual scores, narrative and combined score.
  - It showed "downloaded" before the PDF existed and failed silently offline.
  - jsPDF is now inlined, so there's no CDN.
- **Generation is blocked** until the assessment is complete.
- File name: `ArchiMate_Assessment_<Candidate>_<Date>.pdf`.

### Other

- **No network:** the Google Fonts import is removed.
- **"AI" wording removed.** The tool is rule-based.
- **Shared context for engineers:** `AGENTS.md`, `CLAUDE.md`, `docs/` and project skills.
- **Tests:** 43 in `part_a/tests/`, dev only.
