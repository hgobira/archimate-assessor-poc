---
name: add-rule
description: Add, change or retire an assessment rule (SebTreb, ArchiMate validity, view/completeness, traceability) in the archimate-assessor rule catalogue, together with its check, tests and generated docs. Use for any change to what the tool flags, a rule's severity, or a rule's category or subcategory.
---

# Add or change a rule

> Status: **stub.** Usable from Phase 2, when `part_a/src/rules.js` exists. Until then, record intended rules in `docs/plan.md`.

1. **Find the source.** Each rule cites one of:
   - a SebTreb ID ([docs/reference/sebtreb-rules.md](../../../docs/reference/sebtreb-rules.md))
   - an ArchiMate 3.2 section ([docs/reference/archimate-spec.md](../../../docs/reference/archimate-spec.md))
   - a Review Guide prompt ([docs/reference/review-guide.md](../../../docs/reference/review-guide.md))

   No source means it's not a rule. Raise it in `docs/decisions.md` instead.
2. **Add the catalogue entry** in `part_a/src/rules.js`:
   `{id, source, specRef, severity: MUST|SHOULD|INFO, category, subcategory, automation: automated|partial|manual, description, rationale, verified}`.
   - IDs: keep SebTreb IDs as they are; otherwise `ARC-<AREA>-NNN`, `VW-NNN`, `TRC-NNN`.
   - Never reuse a retired ID.
   - `category` and `subcategory` must exist in the scoring config.
3. **Implement the check** in `part_a/src/checks.js` as a pure function returning `[{ruleId, viewId?, elementIds?, evidence}]`.
   - Don't put description text or severity in the check.
   - **Don't infer a view's type from its name.** Use the view classifier.
4. **Test it** in `part_a/tests/`: one passing fixture and one failing fixture. If the result on the sample model changes, update the regression snapshot deliberately and say why in the commit.
5. **Regenerate the docs:** `python3 part_a/tools/build.py` also regenerates `docs/rule-catalogue.md`. Never hand-edit that file.
6. **Record it:** if the change affects scores, add an entry to `docs/decisions.md`. Commit as `P<n>: <Add|Change|Retire> rule <ID> — <why>`.
