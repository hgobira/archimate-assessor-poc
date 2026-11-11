# Sample model profile — `Arhchimateexample.xml`

Source: [resources/Arhchimateexample.xml](../../resources/Arhchimateexample.xml). Model name "ClimateIQ - Weather Aggregation". Open Exchange 3.0 namespace, BizzDesign export. This is the primary regression fixture.

- **83 elements:**

  | Type | Count |
  |---|---|
  | ApplicationService | 8 |
  | Requirement | 8 |
  | Driver | 8 |
  | Goal | 7 |
  | TechnologyService | 6 |
  | Stakeholder | 6 |
  | BusinessService | 5 |
  | ApplicationInterface | 4 |
  | BusinessActor | 4 |
  | Node | 4 |
  | ApplicationComponent, ApplicationEvent, Outcome | 3 each |
  | Grouping, Location, TechnologyFunction, TechnologyInterface, Device, Capability | 2 each |
  | DataObject ("Data Storage"), TechnologyEvent | 1 each |

- **82 relationships:**

  | Type | Count |
  |---|---|
  | **Association** | **31** |
  | Serving | 17 |
  | Triggering | 17 |
  | Influence | 7 |
  | Access | 5 |
  | Realization | 2 |
  | Flow, Composition, Assignment | 1 each |

  All 82 are valid against the Archi 3.2 matrix.
- **No `viewpoint` attributes** on views.

| View | Nodes | Main content | Connections (no bendpoints) |
|---|---|---|---|
| Conceptual View | 10 | 2 BusinessActor, 7 ApplicationService, 1 DataObject | 8 (6) |
| Contextual View | 7 | 4 BusinessActor, 1 BusinessService, 1 ApplicationService, 1 DataObject | 6 (6) |
| Technology View | 18 | Node ×4, Device ×2, TechnologyService ×5, Location ×2, Grouping, TechnologyInterface, TechnologyEvent, TechnologyFunction ×2 | 7 (4) |
| Motivation View | 13 | Stakeholder, Driver ×2, Goal ×4, Outcome ×2, Requirement ×4 | 12 (12) |
| Motivation View (2) | 20 | Stakeholder ×6, Driver ×7, Goal ×7 | 6 (6). **5 are necessarily diagonal** (missed by the current cnn-001) |
| Component View - Data Ingestion | 17 | App components, interfaces, services and events; BusinessService ×3; Device; BusinessActor | 14 (14) |
| Cross-layer View - Data Ingestion | 10 | Goal, Requirement ×4, Capability, ApplicationService ×2, Outcome, BusinessService | 8 (5) |

**Observations for test expectations:**
- Every view name passes the current name-based checks. The planned "Overview" rename fixture will exercise the structural classifier.
- There's no Strategy→Technology path and very few Realization relationships, so traceability checks should report gaps.
- Association is heavily used (38%).
