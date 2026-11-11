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
| D5 | Meaning of automated "Confidence": rubric coverage (implemented: 75% on the sample) | Provisional | Meenakshi |
| D9 | Penalty sizes: MUST −25%, SHOULD −10% of a subcategory, max 3 occurrences per rule; manual-only subcategories excluded from the automated score | Provisional | Meenakshi |
| D6 | Pass mark ("meets criteria") | Open | Meenakshi |
| D7 | Vendoring Archi `relationships.xml` (MIT) | Provisional | Hamza / org policy |
| D8 | Assessment Level 1 / Level 2 distinction in the tool | Open | Meenakshi |
| A1 | Portability: AGENTS.md + CLAUDE.md + docs/ + project skills | Accepted | Hamza |
| A2 | ~~Source split in `part_a/src` + `build.py`~~ **Superseded by A8** | Superseded | Hamza |
| A3 | Test runner: Node (via Homebrew) | Accepted | Hamza |
| A4 | Proceed on D1–D5 recommended defaults, marked provisional | Accepted | Hamza |
| A5 | Relationship validity from Archi's 3.2 matrix; element/layer list from the 3.2 Reference Cards | Accepted | Hamza |
| A6 | Case-study profile and candidate role (EA/SA) drive expected views and scenario rows | Accepted | Hamza |
| A7 | Tests: built-in `node:test` + jsdom (dev only), loading the HTML file directly | Accepted | Hamza |
| A8 | The tool is one hand-edited HTML file (`part_a/archimate-assessor.html`), with no build step; data held in labelled JSON blocks | Accepted | Hamza |
| A9 | Retired rule ids (never reuse): ARC-CL-001…004, ARC-STR-001, ARC-REL-001; replaced by ARC-REL-002 (3.2 matrix) | Accepted | Hamza |
| A10 | Views classified by structure; ARC-USE-001…003 retired for VW-002; thresholds as documented in the VIEW CLASSIFIER section | Provisional | Hamza / assessors |

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
- **A2 Structure (superseded 2026-11-11 by A8).** Was: modules in `part_a/src/`, with `build.py` inlining them into `dist/`. It was implemented in commit `4a87b31` and reverted because it was judged too complex for the team to maintain.
- **A3 Tests.** Node 22+ test runner, pure-logic modules tested headlessly, fixtures in `part_a/tests/fixtures/`.
- **A4 Defaults.** Build on D1–D5 as above, all values in one scoring config.
- **A5 Knowledgebase sources.** Relationships come from Archi's 3.2 matrix, element types and layers from the 3.2 Reference Cards (`resources/n221p.pdf`). Derivation rules and viewpoint definitions wait for the full 3.2 spec, and the entries that depend on them carry `verified: false`.
- **A7 Tests.** Node's built-in `node:test` runner and jsdom (pinned dev dependency). They load `part_a/archimate-assessor.html` as is and call its global functions. No Vitest, bundler or build. Tests are optional for *using* the tool and required for *changing* it.
- **A8 One file, no build (2026-11-11).** The user asked for a single HTML file rather than a source tree plus a build script. The separation the ticket asks for ("rule catalogue in a structured block separate from check logic") is achieved *inside* the file: the rule catalogue, relationship matrix and scoring config are `<script type="application/json">` blocks, and the logic only reads them. Trade-offs accepted:
  - It's a large file (the matrix adds about 60 KB).
  - The relationship matrix is converted from Archi's XML once and pasted in, rather than regenerated on every build. The `kb-audit` skill documents how to refresh it.
- **A9 Retired rules (Phase 2, 2026-11-11).** All of these are replaced by **ARC-REL-002**, which checks each relationship against the full ArchiMate 3.2 matrix by element type:

  | Id | Why retired |
  |---|---|
  | ARC-CL-001 | A layer-pair approximation. It produced all 4 MUST findings on the sample, and all 4 were false positives. |
  | ARC-CL-002 | Duplicated by the matrix |
  | ARC-CL-003 | **Contradicts 3.2**: technology may serve business |
  | ARC-CL-004 | Duplicated by the matrix |
  | ARC-STR-001 | Composition-by-layer approximation; the matrix decides |
  | ARC-REL-001 | Substring type test; the matrix decides |

  Also, elm-001's check could never fire (Label nodes carry no element reference) and was removed. elm-001 is now marked manual, because the XML has no figure-shape data.
- **A10 Structural view classification (Phase 3, provisional).** A view's type comes from what it contains and what it draws, not its name. The thresholds (e.g. a contextual hub touching ≥75% of connections; Motivation ≥70%; cross-layer = drawn links across ≥3 layers) were calibrated on the one sample model, so assessors should sanity-check them on more submissions. Every classification shows its reasons in View Analysis, which makes this easy to check.
  - **ARC-USE-001 to 003 retired.** They asked "does a view *named* X contain X elements?". This is replaced by **VW-002** "name contradicts content", which uses the name for what it legitimately is: a claim to verify.
  - **elm-004 (grid) stays manual.** The coordinates in BizzDesign exports follow no consistent grid.
  - **Assessor override** of a detected type is deferred to Phase 5.
- **A6 Case-study profile.** Expected views, stakeholders and requirements come from a profile (ClimateIQ is the default), keyed by candidate role (EA/SA). This is because candidates may agree a different case study with the reviewer.
