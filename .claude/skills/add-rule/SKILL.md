---
name: add-rule
description: Add, change or retire an assessment rule (SebTreb, ArchiMate validity, view/completeness, traceability) in the archimate-assessor rule catalogue, together with its check and tests. Use for any change to what the tool flags, a rule's severity, or a rule's category or subcategory.
---

# Add or change a rule

> Status: **stub.** Usable from Phase 2, when the `rule-catalogue` block exists in `part_a/archimate-assessor.html`.

Everything is in one file: `part_a/archimate-assessor.html`.

1. **Find the source.** Each rule cites one of:
   - a SebTreb ID ([docs/reference/sebtreb-rules.md](../../../docs/reference/sebtreb-rules.md))
   - an ArchiMate 3.2 section ([docs/reference/archimate-spec.md](../../../docs/reference/archimate-spec.md))
   - a Review Guide prompt ([docs/reference/review-guide.md](../../../docs/reference/review-guide.md))

   No source means it's not a rule. Raise it in `docs/decisions.md` instead.
2. **Add the catalogue entry** in the `<script type="application/json" id="rule-catalogue">` block:
   `{id, source, specRef, severity: MUST|SHOULD|INFO, category, subcategory, automation: automated|partial|manual, description, rationale, verified}`.
   - IDs: keep SebTreb IDs as they are; otherwise `ARC-<AREA>-NNN`, `VW-NNN`, `TRC-NNN`.
   - Never reuse a retired ID.
   - `category` and `subcategory` must exist in the `scoring-config` block.
3. **Implement the check** in the CHECKS ENGINE section. Emit only `{ruleId, viewId?, elementIds?, evidence}`.
   - Don't put description text or severity in the check.
   - **Don't infer a view's type from its name.** Use the view classifier.
4. **Test it** in `part_a/tests/`: one passing case and one failing case. Run `npm test --prefix part_a`. If the result on the sample model changes on purpose, run `npm run baseline:update --prefix part_a` and explain the diff in the commit.
5. **Record it:** if the change affects scores, add an entry to `docs/decisions.md`. Commit as `P<n>: <Add|Change|Retire> rule <ID> — <why>`.
