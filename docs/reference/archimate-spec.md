# ArchiMate specification sources

The Open Group texts are copyrighted and **single-user licensed**. Don't commit extracted text from them. Cite them by section or page instead.

| File | What it is | Use it for |
|---|---|---|
| [resources/n221p.pdf](../../resources/n221p.pdf) | **ArchiMate 3.2 Reference Cards** (The Open Group N221, 2022, Personal PDF edition, 14 pp) | Authoritative 3.2 element list per layer, element definitions, relationship definitions and notation. **No** relationship tables, derivation rules or viewpoints. |
| [resources/978940180512C_SMPL.pdf](../../resources/978940180512C_SMPL.pdf) | A 30-page **sample of the ArchiMate 3.1** specification (Van Haren) | Generic language structure only. Not 3.2, and no Appendix B. |
| Full ArchiMate 3.2 spec | https://pubs.opengroup.org/architecture/archimate32-doc/ | **Pending** (2026-11-11). Needed for derivation rules (§5.7) and viewpoints (Appendix C). |
| Archi `relationships.xml` (`version="3.2"`) | https://github.com/archimatetool/archi (MIT), via archi-online `tools/data/relationships.xml` | The allowed-relationship matrix per (source type, target type). Letter codes: a=access, c=composition, f=flow, g=aggregation, i=assignment, n=influence, o=association, r=realization, s=specialization, t=triggering, v=serving. |

## 3.2 element types by layer (from the Reference Cards; layer membership only)

| Layer / group | Types |
|---|---|
| Motivation | Stakeholder, Driver, Assessment, Goal, Outcome, Principle, Requirement, Constraint, Meaning, Value |
| Strategy | Resource, Capability, ValueStream, CourseOfAction |
| Business | BusinessActor, BusinessRole, BusinessCollaboration, BusinessInterface, BusinessProcess, BusinessFunction, BusinessInteraction, BusinessEvent, BusinessService, BusinessObject, Contract, Representation, Product |
| Application | ApplicationComponent, ApplicationCollaboration, ApplicationInterface, ApplicationFunction, ApplicationInteraction, ApplicationProcess, ApplicationEvent, ApplicationService, DataObject |
| Technology | Node, Device, SystemSoftware, TechnologyCollaboration, TechnologyInterface, Path, CommunicationNetwork, TechnologyFunction, TechnologyProcess, TechnologyInteraction, TechnologyEvent, TechnologyService, Artifact |
| Physical (part of Technology) | Equipment, Facility, DistributionNetwork, Material |
| Implementation & Migration | WorkPackage, Deliverable, ImplementationEvent, Plateau, Gap |
| Composite / other | Grouping, Location; relationship connector: Junction |

(This is a type list for engineering use, not extracted spec text. The matrix's concept list matches these 61 types, plus `Relationship`.)
