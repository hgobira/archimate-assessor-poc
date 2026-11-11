# Scoring model

The source of truth is the `scoring-config` block in [part_a/archimate-assessor.html](../part_a/archimate-assessor.html) (`SCORING` section). The values are **provisional** until decisions D1–D3 and D5 are confirmed (see [decisions.md](decisions.md)). Change them with the `change-scoring` skill.

## One model for automated and manual scores

| Category (weight) | Subcategories (points) |
|---|---|
| Meta-model & Relationships (30) | Correct use of elements (10) · Valid relationships (10) · Layer correctness (10) |
| Scenario Interpretation & Completeness (20) | Coverage of case-study requirements (10) · Accuracy of interpretation (10) |
| Viewpoints & Stakeholder Relevance (25) | Viewpoint selection (15) · Stakeholder alignment (10) |
| Cross-layer Alignment (15) | Vertical traceability (5) · Horizontal alignment (5) · End-to-end clarity (5) |
| SebTreb Visual Clarity (10) | Layout & organisation (5) · SebTreb compliance (5) |

Each rule's `rubric` field (e.g. `clarity.sebtreb`) places it in one subcategory.

## Automated score

For each subcategory:

1. **Penalty %** = Σ over the rules hit: `severityPenaltyPct[severity] × min(occurrences, perRuleMaxOccurrences)`.
   - Penalties: MUST 25%, SHOULD 10%, INFO 0%.
   - At most 3 occurrences of a rule count. One repeated problem can't wipe out a subcategory on its own.
2. The penalty is **capped at 100%**, so a subcategory can't go below 0 or drag other subcategories down.
3. **Score** = weight × (1 − penalty%).

A subcategory with no automated or partial rule is **manual only**. It is excluded rather than given free marks or zero.

- **Automated total** = earned ÷ assessable points × 100.
- **Coverage** (the report's "Confidence", D5) = assessable points out of 100, i.e. how much of the rubric the tool checks.

## Manual and combined scores

- **Manual** = Σ subcategory weight × rating %. Ratings: Missing 0 · Poor 25 · Adequate 50 · Good 75 · Outstanding 100.
- **Combined** = (automated + manual) ÷ 2.
- **Grade:** the same `grade()` for all three scores. ≥80 Outstanding, ≥60 Average, otherwise Poor.
- **RAG colours:** ≥70 green, ≥40 amber, otherwise red. Display only.

Check: the Report Format example (manual 72.5, automated 88) reproduces as combined **80.25**, which `grade()` gives as Outstanding. The example document says "Average", which is open question D3.

## Worked example: sample model (`resources/Arhchimateexample.xml`)

| Subcategory | Findings → deduction | Score |
|---|---|---|
| Correct use of elements | ARC-ELM-002 SHOULD ×1 = −10%; COMP-010 INFO = 0 | 9 / 10 |
| Valid relationships | ARC-REL-003 SHOULD ×1 = −10% | 9 / 10 |
| Layer correctness | manual only | — |
| Coverage of requirements | none | 10 / 10 |
| Accuracy of interpretation | manual only | — |
| Viewpoint selection | none | 15 / 15 |
| Stakeholder alignment | none | 10 / 10 |
| Vertical traceability | none | 5 / 5 |
| Horizontal alignment | manual only | — |
| End-to-end clarity | TRC-002 SHOULD ×1 = −10% | 4.5 / 5 |
| Layout & organisation | VW-001 SHOULD ×2 = −20% | 4 / 5 |
| SebTreb compliance | elm-006 MUST ×2 = −50%; cnn-001 MUST ×3 (of 5) = −75%; cnn-002 SHOULD ×1 = −10% → 135%, **capped at 100%** | 0 / 5 |

**Automated = 66.5 / 75 = 88.7% (Outstanding), coverage 75%.**

The tool shows this same table in the Detailed Report tab ("Automated Score Breakdown"), so the assessor can see every deduction.
