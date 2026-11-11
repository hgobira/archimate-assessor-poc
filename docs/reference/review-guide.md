# Assessment Criteria & Review Guide — digest

Source: [resources/Assessment& ReviewGuide.pdf](../../resources/). This is the manual marking rubric.

| Area | What is assessed | % | Poor | Average | Outstanding |
|---|---|---|---|---|---|
| Meta-model and relationships | Correct use of concepts, layers and relationships per ArchiMate 3.2; understanding and application of derivation and specialisation | 30 | Incorrect or invalid elements, layers or relationships; no cross-layer connections | Mostly correct; minor relationship mistakes (e.g. *association instead of serving*); mostly valid cross-layer | Precise metamodel, relationships and valid cross-layer connections |
| Scenario interpretation and completeness | Interpret the scenario and create a complete, accurate model | 20 | Misinterprets or ignores key scenario elements | Main elements captured, details not reflected correctly | Covers all scenario details, including dependencies, triggers and constraints |
| Viewpoints and stakeholder relevance | Proper viewpoint selection (stakeholder, capability, etc.); alignment with stakeholder concerns and scenario needs | 25 | Inappropriate views for the architect role | Acceptable but not best fit | Most effective viewpoints to communicate |
| Cross-layer alignment | Logical connections Motivation→Strategy→Business→Application→Technology→Implementation; baseline to target | 25 | Weak or missing cross-layer connections | Basic traceability | Strong end-to-end traceability, vertical and horizontal |
| Clarity | Visual simplicity: no clutter, grouping and alignment, minimal crossings | 10 | Disorganised, mislabelled, cluttered; annotations or legends missing | Understandable with effort | Clearly defined, well labelled, logically organised; annotations, legends and notes complete |

⚠ The weights total **110**. See [decisions.md](../decisions.md) D1.

## Reviewer prompts

1. **Traceability:** each business goal traced to capabilities, services and technical components?
2. **Completeness:** strategy to deployment covered without major omissions?
3. **Model validity:** all relationships valid? Elements in the right layer?
4. **Stakeholder fit:** do views align with stakeholder concerns and communicate to the audience?
5. **Visual quality:** readable, organised, no overlapping or ambiguous relationships?
6. **Cross-layer integration:** visible alignment of business processes, application services and technology components?
7. **Use of viewpoints:** appropriate viewpoints (layered, application collaboration, motivation…) for the purpose?
8. **Consistency:** notation and naming consistent across views?
9. Automated validation of syntax and modelling errors in BizzDesign.
10. Manual review against these criteria.
11. Collaborative review: a short joint session to clarify findings if needed.

Prompts 3, 5, 8 and parts of 1, 2 and 6 can be partly automated; the rest is assessor judgement (and a Part B candidate).
