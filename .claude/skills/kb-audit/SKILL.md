---
name: kb-audit
description: Audit the archimate-assessor knowledgebase (element types, layers, aspects, relationship matrix, derivation and viewpoint-dependent rules) against the ArchiMate 3.2 specification, or refresh the embedded relationship matrix from Archi. Use when the full 3.2 spec becomes available, when Archi's relationships.xml is updated, or when a rule's spec basis is questioned.
---

# Knowledgebase audit against ArchiMate 3.2

> Status: **stub.** Usable from Phase 2. The full 3.2 spec is pending as of 2026-11-11.

Sources and licensing: [docs/reference/archimate-spec.md](../../../docs/reference/archimate-spec.md). Don't paste Open Group spec text into the repo; cite sections.

1. **List unverified entries:** every rule in the `rule-catalogue` block of `part_a/archimate-assessor.html` with `verified: false`, plus the KNOWLEDGE BASE section.
2. **Element types and layers:** compare the knowledge base with the 3.2 spec's chapters on layers and elements (or the Reference Cards, `resources/n221p.pdf`). Expect 61 element types, the same set as Archi's matrix minus `Relationship`.
3. **Relationship matrix** (the `relationship-matrix` block):
   - Spot-check 10+ pairs against spec Appendix B, including Business→Capability realization and TechnologyService→BusinessProcess serving.
   - **To refresh from upstream:** download Archi's `relationships.xml` (https://github.com/archimatetool/archi, MIT) and check `version="3.2"`. Convert it to the block's JSON shape with a one-off script (keep it out of the repo), replace the whole block, and update the header comment's source commit and date. Never patch individual entries by hand.
   - Run `npm test --prefix part_a` and explain any baseline diff.
4. **Spec-dependent rules:** for derivation (§5.7) and viewpoints (Appendix C), check each rule's logic and `specRef`, and set `verified: true` with the section number.
5. **Record findings** in `docs/decisions.md` (an "A-n KB audit" entry) and update `docs/requirements-analysis.md` §1 if conclusions change.
