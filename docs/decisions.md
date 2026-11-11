# Decision log

Every decision that affects scoring, rules, structure or delivery goes here. Statuses:
- **Accepted:** agreed; build to it.
- **Provisional:** built to it, but awaiting stakeholder confirmation. Must be config, not hard-coded.
- **Open:** needs an answer. Don't assume.

| ID | Decision | Status | Owner |
|---|---|---|---|
| D1 | Scoring category weights: Report Format model (30/20/25/15/10) | Provisional | Meenakshi |
| D2 | Manual rating scale: 0/25/50/75/100 | Provisional | Meenakshi |
| D3 | Grade bands: Replit (≥80 Outstanding, ≥60 Average, else Poor) | Provisional | Meenakshi |
| D4 | Signature roles: Assessor / Reviewer / Candidate acknowledgement | Provisional | Meenakshi |
| D5 | Meaning of automated "Confidence" | Provisional | Meenakshi |
| D6 | Pass mark ("meets criteria") | Open | Meenakshi |
| D7 | Vendoring Archi `relationships.xml` (MIT) | Provisional | Hamza / org policy |
| D8 | Assessment Level 1 / Level 2 distinction in the tool | Open | Meenakshi |
| A1 | Portability: AGENTS.md + CLAUDE.md + docs/ + project skills | Accepted | Hamza |
| A2 | Source split in `part_a/src` + `build.py` → single offline HTML | Accepted | Hamza |
| A3 | Test runner: Node (via Homebrew) | Accepted | Hamza |
| A4 | Proceed on D1–D5 recommended defaults, marked provisional | Accepted | Hamza |
| A5 | Relationship validity from Archi's 3.2 matrix; element/layer list from the 3.2 Reference Cards | Accepted | Hamza |
| A6 | Case-study profile and candidate role (EA/SA) drive expected views and scenario rows | Accepted | Hamza |
| A7 | Tooling: built-in `node:test` + jsdom (dev only); modules stay plain scripts; `dist/` is committed | Accepted | Hamza |

---

## D1 — Category weights (Provisional)

The sources disagree:

| Source | Meta-model | Scenario | Viewpoints | Cross-layer | Clarity | Total |
|---|---|---|---|---|---|---|
| Assessment & Review Guide | 30 | 20 | 25 | 25 | 10 | **110** |
| Replit solution doc | 25 | 20 | 20 | 20 | 15 | 100 |
| Report Format (worked example) | 30 | 20 | 25 | 15 | 10 | 100 |
| Current tool, automated | Completeness 30 / CrossLayer 25 / ArchiMate 25 / SebTreb 15 / Assessment 5 | | | | | 100 |
| Current tool, manual sheet | 30 | 20 | 25 | 25 | 10 | **110** (bug) |

**Choice:** the Report Format, because it adds up to 100 and is self-consistent, with a full worked example. Subcategory weights:

| Category | Subcategories (weight) |
|---|---|
| Meta-model & Relationships (30) | Correct use of elements (10), Valid relationships (10), Layer correctness (10) |
| Scenario Interpretation & Completeness (20) | Coverage of case-study requirements (10), Accuracy of interpretation (10) |
| Viewpoints & Stakeholder Relevance (25) | Appropriate viewpoint selection (15), Stakeholder alignment (10) |
| Cross-layer Alignment (15) | Vertical traceability (5), Horizontal alignment (5), End-to-end clarity (5) |
| Visual Clarity / SebTreb (10) | Layout and organisation (5), SebTreb rules compliance (5) |

**To confirm:** the Review Guide gives Cross-layer 25 (and so totals 110). Is 15 the intended value?

## D2 — Rating scale (Provisional)

Replit uses 0–5, in 20% steps. The Report Format example and the current tool use Missing 0 / Poor 25 / Adequate 50 / Good 75 / Outstanding 100. The example's numbers only work with 25% steps: Good on a weight of 5 gives 3.8 (3.75), and Poor gives 1.3 (1.25). **Choice:** 25% steps.

## D3 — Grade bands (Provisional)

The ticket says to follow Replit: `≥80 Outstanding, ≥60 Average, else Poor`. The same `grade()` applies to the automated, manual and combined scores. RAG colours (≥70 green, ≥40 amber) are a separate display concern.
**Conflict to confirm:** the Report Format example grades **80.25% as "Average"**, which contradicts ≥80. Either the example is wrong or the threshold is >80 or ≥85.

## D4 — Signature roles (Provisional)

Report Format has Assessor, Reviewer and Candidate acknowledgement, each with a date. The current tool has Primary, Secondary and QA. **Choice:** Report Format.

## D5 — "Confidence" (Provisional)

The Report Format shows "Confidence: 95%", which was an AI number in Replit. For a rule-based tool, **choice:** automated rubric coverage, meaning the share of catalogue rules (weighted) that were automatically checked, as opposed to manual-only.

## D6 — Pass mark (Open)

The assessment process (see [reference/assessment-overview.md](reference/assessment-overview.md)) is Review → *meets criteria* → Pass; otherwise a 30-minute feedback session → update → re-review → Pass or Fail. No numeric pass mark is defined. Suggestion: combined grade of Average or above (≥60). The tool records an outcome and an attempt number either way.

## D7 — Vendoring Archi relationship data (Provisional)

`relationships.xml` (`version="3.2"`) comes from Archi (https://github.com/archimatetool/archi, MIT, © Phillip Beauvoir, Jean-Baptiste Sarrodie, The Open Group). It was found via https://github.com/ThomasRohde/archi-online, which the assessment-overview doc links as its example repo. We'll vendor it with the licence notice and the pinned commit. Check whether the organisation requires any approval beyond the MIT notice.
Evidence it is right: it confirms Business→Capability realization (and rejects the reverse) and Technology serving Business. All 82 relationships in the sample model validate.

## D8 — Assessment levels (Open)

The overview doc shows "Archimate Assessment: Level 1 (Online) / Level 2 (Self Serve)". It's unclear whether these map to Stage 1 and Stage 2, or need different handling in the tool. **Assumption:** the tool serves Stage 2 only, with no level distinction.

## A1–A6 — Accepted 2026-11-11

- **A1 Portability.** `AGENTS.md` holds the canonical shared context, since it's readable by any AI tool. `CLAUDE.md` imports it. Durable knowledge lives in `docs/` (readable without any AI tool) and procedures in `.claude/skills/`. Rejected: skill-only (on-demand, invisible to non-Claude users), CLAUDE.md-only (bloats every session, Claude-only), plugin (not needed for a single repo).
- **A2 Structure.** Modules in `part_a/src/`. `build.py` (stdlib only) inlines them, plus the vendored jsPDF and the generated matrix, into `part_a/dist/archimate-assessor.html`. The deliverable stays one offline file.
- **A3 Tests.** Node 22+ test runner, pure-logic modules tested headlessly, fixtures in `part_a/tests/fixtures/`.
- **A4 Defaults.** Build on D1–D5 as above, all values in one scoring config.
- **A5 Knowledgebase sources.** Relationships come from Archi's 3.2 matrix, element types and layers from the 3.2 Reference Cards (`resources/n221p.pdf`). Derivation rules and viewpoint definitions wait for the full 3.2 spec, and the entries that depend on them carry `verified: false`.
- **A7 Tooling (Phase 1).**
  - Tests use Node's built-in `node:test` runner and jsdom (pinned dev dependency). No Vitest or bundler; the fewer moving parts, the easier the handover.
  - Modules stay plain scripts sharing one global scope, exactly as in the original file. Converting to ES modules would change how the single-file build works, so it's deferred unless needed.
  - `dist/archimate-assessor.html` is committed because it is the deliverable assessors open. `build.py --check` in `npm test` stops it going stale.
- **A6 Case-study profile.** Expected views, stakeholders and requirements come from a profile (ClimateIQ is the default), keyed by candidate role (EA/SA). This is because candidates may agree a different case study with the reviewer.
