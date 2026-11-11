# Scoring model

The source of truth is the `scoring-config` block in [part_a/archimate-assessor.html](../part_a/archimate-assessor.html) (`SCORING` section).

- **Category weights, rating scale and grade bands follow the Replit scorer.** Accepted as interim decisions D1–D3 on 2026-11-11.
- **Provisional:** the subcategory split (D10), penalty sizes (D9), coverage as "Confidence" (D5) and the pass mark (D6). See [decisions.md](decisions.md).

Change any of these with the `change-scoring` skill.

## One model for automated and manual scores

| Category (weight) | Subcategories (points) |
|---|---|
| Meta-model & Relationships (25) | Correct use of elements (10) · Valid relationships (10) · Layer correctness (5) |
| Scenario Interpretation & Completeness (20) | Coverage of case-study requirements (10) · Accuracy of interpretation (10) |
| Viewpoints & Stakeholder Relevance (20) | Viewpoint selection (12) · Stakeholder alignment (8) |
| Cross-layer Alignment (20) | Vertical traceability (7) · Horizontal alignment (7) · End-to-end clarity (6) |
| SebTreb Visual Clarity (15) | Layout & organisation (7) · SebTreb compliance (8) |

Each rule's `rubric` field (e.g. `clarity.sebtreb`) places it in one subcategory.

## Automated score

For each subcategory:

1. **Penalty %** = Σ over the rules hit: `severityPenaltyPct[severity] × min(occurrences, perRuleMaxOccurrences)`.
   - Penalties: MUST 25%, SHOULD 10%, INFO 0%.
   - At most 3 occurrences of a rule count.
2. The penalty is **capped at 100%**, so a subcategory can't go below 0.
3. **Score** = weight × (1 − penalty%).

A subcategory with no automated or partial rule is **manual only**. It is excluded rather than given free marks or zero.

- **Automated total** = earned ÷ assessable points × 100.
- **Coverage** (the report's "Confidence", D5) = assessable points out of 100.

## Manual and combined scores (Replit)

- **Manual** = Σ subcategory weight × rating %. That's Replit's `(rating / 5) × weight`.
  - Ratings: Missing 0 · Poor 20 · Below Average 40 · Adequate 60 · Good 80 · Outstanding 100.
  - Replit's example: Good (4) on a weight-10 row = 8.0 points.
- **Combined** = (automated + manual) ÷ 2.
- **Grade:** the same `grade()` for all three scores. ≥80 Outstanding, ≥60 Average, otherwise Poor.
- **RAG colours:** ≥70 green, ≥40 amber, otherwise red. Display only.
- **Outcome suggestion:** Pass at ≥ `passMark` (60, D6). Otherwise an improvement plan on attempt 1, Fail on a re-review. The assessor decides.

## Validation against the sources (2026-11-11)

| Item | Assessment & Review Guide | Replit solution doc | Tool | Status |
|---|---|---|---|---|
| Category weights | 30/20/25/25/10 (= 110) | 25/20/20/20/15 | **Replit** | D1 accepted (interim) |
| Rating scale | Poor / Average / Outstanding descriptors | 0–5 in 20% steps | **Replit** | D2 accepted (interim) |
| Grade bands | — | ≥80 / ≥60 | **Replit** | D3 accepted (interim) |
| Rows | 5 areas with criteria | 4 × 5 = 20 (not listed) | 12 (Report Format rows) | D10 provisional |
| Combined | — | mean | Same | ✓ |
| Automated rating beside each manual rating | — | Yes, read-only | Suggested rating + % + rule ids | ✓ |
| Finalisation | — | All ratings, candidate fields, ≥1 signature | `manualReadiness()`: same, plus role, outcome | ✓ (blocks the PDF from Phase 6) |
| Descriptors and reviewer prompts | Per area / prompts 1–8 | — | Shown on every section and row | ✓ |
| Rubric items without a row | Derivation and specialisation; baseline→target; annotations and legends | — | Prompts on the relevant rows | ✓ |
| "Insufficient views" penalty | — | 6 views expected | COMP-001 (MUST) | ✓ |

Under the Replit scale, the Report Format example (manual 72.5 → combined 80.25) no longer reproduces. That example used 25% steps.

## Worked example: sample model (`resources/Arhchimateexample.xml`, no role selected)

| Subcategory | Findings → deduction | Score |
|---|---|---|
| Correct use of elements | ARC-ELM-002 SHOULD ×1 = −10%; COMP-010 INFO = 0 | 9 / 10 |
| Valid relationships | ARC-REL-003 SHOULD ×1 = −10% | 9 / 10 |
| Layer correctness | manual only | — |
| Coverage of requirements | none | 10 / 10 |
| Accuracy of interpretation | manual only | — |
| Viewpoint selection | none | 12 / 12 |
| Stakeholder alignment | none | 8 / 8 |
| Vertical traceability | none | 7 / 7 |
| Horizontal alignment | manual only | — |
| End-to-end clarity | TRC-002 SHOULD ×1 = −10% | 5.4 / 6 |
| Layout & organisation | VW-001 SHOULD ×2 = −20% | 5.6 / 7 |
| SebTreb compliance | elm-006 MUST ×2 = −50%; cnn-001 MUST ×3 (of 5) = −75%; cnn-002 SHOULD ×1 = −10% → 135%, **capped at 100%** | 0 / 8 |

**Automated = 66 / 78 = 84.6% (Outstanding), coverage 78%.** With the role set to SA, VW-003 (missing Logical Data Model view, SHOULD) also deducts 10% from viewpoint selection.

The tool shows this same table in the Detailed Report tab ("Automated Score Breakdown").
