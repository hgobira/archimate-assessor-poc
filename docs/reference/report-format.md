# Report Format — digest (target PDF)

Source: [resources/Report Format.pdf](../../resources/), 4 pages. This is a worked example and the **target layout** for the Phase 6 PDF.

## Page 1: Assessment Summary

- Header: Candidate (name + role), Assessor, Date.
- Three score cards:
  - **Overall Score (AI + Manual)** 80.25%, Grade: *Average*
  - **Automated Score** 88%, Confidence 95%
  - **Manual Review** 72.5%, by assessor
- **Automated category breakdown**, each with score/max and "Issues found" bullets (issue name, explanation, instance count):

| Category | Score |
|---|---|
| Meta-model & Relationships | 27/30 |
| Scenario Interpretation & Completeness | 18/20 |
| Cross-layer Alignment | 13/15 |
| Viewpoints & Stakeholder Relevance | 23/25 |
| SebTreb Visual Clarity | 7/10 |
| **Total** | **88/100** |

## Pages 2–3: Manual Assessment Scores

Table columns: Category · Sub-category · Rating · Score, plus an assessor comment under each row.

| Category | Sub-category | Rating | Score | (weight) |
|---|---|---|---|---|
| Meta-model & Relationships | Correct use of ArchiMate elements | Outstanding | 10.0 | 10 |
| | Valid relationships | Good | 7.5 | 10 |
| | Layer correctness | Good | 7.5 | 10 |
| Scenario Interpretation & Completeness | Coverage of case study requirements | Good | 7.5 | 10 |
| | Accuracy of interpretation | Good | 7.5 | 10 |
| Viewpoints & Stakeholder Relevance | Appropriate viewpoint selection | Outstanding | 15.0 | 15 |
| | Stakeholder alignment | Adequate | 5.0 | 10 |
| Cross-layer Alignment | Vertical traceability | Adequate | 2.5 | 5 |
| | Horizontal alignment | Good | 3.8 (3.75) | 5 |
| | End-to-end clarity | Poor | 1.3 (1.25) | 5 |
| SebTreb Visual Clarity | Layout and organization | Good | 3.8 (3.75) | 5 |
| | SebTreb rules compliance | Poor | 1.3 (1.25) | 5 |
| **Total** | | | **72.5** | **100** |

The weights are inferred from score ÷ rating%, with Outstanding 100, Good 75, Adequate 50, Poor 25. In the example, the SebTreb compliance comment lists the violated rule IDs with the views they appear in (elm-001/002/003/006/009, cnn-001/002/005/006/012/013).

**Arithmetic check (Phase 7 test):** manual 72.5; combined = (88 + 72.5) / 2 = **80.25** ✓. The example's grade "Average" at 80.25 conflicts with the Replit band ≥80 = Outstanding (see [decisions.md](../decisions.md) D3).

## Page 4: Signatures

Assessor Signature + Date · Reviewer Signature + Date · Candidate Acknowledgment + Date.

## Not in the example, required by GYM-4127

Narrative (strengths, areas for improvement, recommendations). Added by the ticket: "cover summary, automated findings, manual scores, narrative, combined score and grade, and signatures".
