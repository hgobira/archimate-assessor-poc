---
name: kb-audit
description: Audit the archimate-assessor knowledgebase (element types, layers, aspects, relationship matrix, derivation and viewpoint-dependent rules) against the ArchiMate 3.2 specification. Use when the full 3.2 spec becomes available, when the Archi relationships.xml is updated, or when a rule's spec basis is questioned.
---

# Knowledgebase audit against ArchiMate 3.2

> Status: **stub.** Usable from Phase 2. The full 3.2 spec is pending as of 2026-11-11.

Sources and licensing: [docs/reference/archimate-spec.md](../../../docs/reference/archimate-spec.md). Don't paste Open Group spec text into the repo; cite sections.

1. **List unverified entries:** every rule in `part_a/src/rules.js` with `verified: false`, plus the KB tables in `part_a/src/kb.js`.
2. **Element types and layers:** compare `kb.js` with the 3.2 spec's chapters on layers and elements (or the Reference Cards, `resources/n221p.pdf`). Expect 61 element types, the same set as Archi's matrix minus `Relationship`.
3. **Relationship matrix:**
   - Check the vendored file's `version="3.2"`.
   - Spot-check 10+ pairs against spec Appendix B, including Business→Capability realization and TechnologyService→BusinessProcess serving.
   - If upstream Archi has updated it, replace `part_a/vendor/archi/relationships.xml`, update the pinned commit in `part_a/vendor/archi/README.md`, rebuild, and check the regression diff.
4. **Spec-dependent rules:** for derivation (§5.7) and viewpoints (Appendix C), check each rule's logic and `specRef`, and set `verified: true` with the section number.
5. **Record findings** in `docs/decisions.md` (an "A-n KB audit" entry) and update `docs/requirements-analysis.md` §1 if conclusions change.
