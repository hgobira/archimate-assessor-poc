---
name: change-scoring
description: Change the archimate-assessor scoring model — category or subcategory weights, severity penalties, per-rule or per-category caps, manual rating scale, grade bands, RAG thresholds, pass mark or combined-score formula. Use whenever a stakeholder confirms or changes a scoring decision (D1–D6).
---

# Change the scoring model

> Status: **stub.** Usable from Phase 4, when `part_a/src/scoring-config.js` exists.

1. **Check the decision first.** Read [docs/decisions.md](../../../docs/decisions.md). Change scoring only to implement a decision recorded there, then update its status (Provisional → Accepted, with date and who confirmed it).
2. **Edit only `part_a/src/scoring-config.js`.** Weights, severities, caps, rating scale, grade bands and the pass mark all live there. Search for any hard-coded thresholds and remove them: `grep -nE ">= ?(80|60|70|40)" part_a/src`.
3. **Check the invariants:**
   - Category weights sum to 100.
   - Subcategory weights sum to their category.
   - The automated and manual scores use the same categories and the same `grade()`.
   - Scores are clamped to 0–100.
   - Output is deterministic.
4. **Run the tests.** The Report Format arithmetic test (manual 72.5, combined 80.25) must still pass unless the decision changes it on purpose. Update the regression snapshots and explain each delta.
5. **Update [docs/scoring-model.md](../../../docs/scoring-model.md):** the worked example and the tables.
6. Commit as `P<n>: Scoring — <decision ID> <summary>`.
