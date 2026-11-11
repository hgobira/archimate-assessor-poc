---
name: kb-audit
description: Audit the archimate-assessor knowledgebase (element types, layers, aspects, relationship matrix, derivation and viewpoint-dependent rules) against the ArchiMate 3.2 specification, or refresh the embedded relationship matrix from Archi. Use when the full 3.2 spec becomes available, when Archi's relationships.xml is updated, or when a rule's spec basis is questioned.
---

# Knowledgebase audit against ArchiMate 3.2

> Status: **usable.** The full 3.2 spec is still pending (2026-11-11). Until it arrives, the element layers rest on the 3.2 Reference Cards and the relationships on Archi's 3.2 matrix.

Sources and licensing: [docs/reference/archimate-spec.md](../../../docs/reference/archimate-spec.md). Don't paste Open Group spec text into the repo; cite sections.

1. **List what rests on the spec:** the KNOWLEDGE BASE section, the `relationship-matrix` block, and the catalogue rules whose `source` cites ArchiMate 3.2.
2. **Element types and layers:** compare the knowledge base with the 3.2 spec's chapters on layers and elements (or the Reference Cards, `resources/n221p.pdf`). Expect 61 element types, the same set as Archi's matrix minus `Relationship`.
3. **Relationship matrix** (the `relationship-matrix` block):
   - Spot-check 10+ pairs against spec Appendix B, including Business→Capability realization and TechnologyService→BusinessProcess serving.
   - **To refresh from upstream:** download Archi's `relationships.xml` (https://github.com/archimatetool/archi, MIT) and check `version="3.2"`. Convert it to the block's JSON shape with a one-off script (keep it out of the repo), replace the whole block, and update the header comment's source commit and date. Never patch individual entries by hand.
   - Run `npm test --prefix part_a` and explain any baseline diff.
4. **Spec-dependent logic:** if derivation (§5.7) or viewpoint (Appendix C) rules are added, cite the section in the rule's `source`.
5. **Record findings** in `docs/decisions.md` (an "A-n KB audit" entry) and update `docs/requirements-analysis.md` §1 if conclusions change.
