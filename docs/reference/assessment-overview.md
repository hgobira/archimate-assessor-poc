# ArchiMate assessment overview — digest

Source: [resources/archimate-assessment-sp.docx](../../resources/archimate-assessment-sp.docx).

**Who:** all practising and aspiring architects in the STS practice.

**Pathway** (diagram in the doc): Agile Architecture Playbook (L1 online self-serve, L2 classroom) → BizzDesign (Horizzon, Enterprise Studio) → ArchiMate Assessment (Level 1 Online, Level 2 Self Serve). How the levels map to the stages is unclear; see [decisions.md](../decisions.md) D8.

**Scope:** Understand / Analyse / Apply across:
- **Core concepts:** layers (Business, Application, Technology); element types (active, behaviour, passive); relationships (structural, dependency, dynamic, specialisation); viewpoints and modelling structure.
- **Extended concepts:** Motivation, Strategy, Implementation & Migration; cross-layer dependencies; business↔lower-layer and application↔technology alignment; relationships to TOGAF, EASE, UML.
- **Practical modelling:** layered views with correct element types; inter-layer dependencies (e.g. business service → application component); correct notation and relationship types; visual clarity and consistency; completeness of views.

## Format

- **Stage 1, multiple choice:** MS Forms, 45 minutes, 43 questions (Understand/Analyse). The topic weights show **relationships are the heaviest topic (30%)**:

  | Topic | % |
  |---|---|
  | Layers | 10 |
  | Element types | 10 |
  | **Relationships** | **30** |
  | Viewpoints and structure | 10 |
  | Extended layers | 10 |
  | Cross-layer dependencies | 10 |
  | Other standards | 10 |
  | Notation and best practice | 10 |

- **Stage 2, case-study modelling:** a full day. The candidate applies ArchiMate to a real-world scenario and recommends an architecture using views suited to a target stakeholder. **This tool supports Stage 2.**

## Stage 2 review process (diagram in the doc)

```
Standard case study ─┐
                     ├─► Create models + complete checklist ─► Review models ─ meets criteria ─► PASS
Agree case study ────┘                                          │
with reviewer                                                   └ criteria not met ─► Improvement plan:
                                                                   30-min feedback session ─► Update models
                                                                      ├ meets criteria ─► PASS
                                                                      └ criteria not met ─► FAIL
```

**Implications for the tool:**
- Case study is configurable: a profile, not hard-coded.
- The report shows an outcome: Pass / Improvement plan required / Fail.
- Re-review is supported with an attempt number, and the "areas for improvement" narrative serves as the feedback-session record.

## Example repo

The doc links https://github.com/ThomasRohde/archi-online, a browser ArchiMate modeller (MIT). It's useful to us for:
- Archi's ArchiMate 3.2 relationship matrix (`tools/data/relationships.xml`, from https://github.com/archimatetool/archi, MIT)
- Archi's Open Exchange test fixtures
- its AGENTS.md + agent-skills pattern for sharing context

It has no assessment, scoring or PDF features.
