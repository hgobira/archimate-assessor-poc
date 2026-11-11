# Case Study (Stage 2) — ClimateIQ digest

Source: [resources/Case Study.pdf](../../resources/). This is the **standard** case study. Candidates may instead agree their own case study with the reviewer (see [assessment-overview.md](assessment-overview.md)), so the tool loads this as the default *case-study profile* and doesn't hard-code it.

## Scenario

ClimateIQ aggregates weather data for agriculture, logistics, renewable energy and urban planning. Its data comes from government and commercial APIs (NOAA, OpenWeather, ECMWF), IoT sensors and ground stations, and satellite and radar feeds. The current estate is manually integrated (scripts, point-to-point), doesn't scale, is hard to monitor, and has inconsistent quality. That has caused 3 SLA breaches. The target is a modular, scalable, service-oriented **Weather Aggregation Platform (WAP)**.

**Business drivers:**
- Global expansion with scalable APIs
- SLAs for real-time delivery
- Weather-based automation for agriculture and logistics
- Custom alerts and predictive dashboards
- Developer-friendly secure APIs
- Lower operating cost through containerisation
- Brand reputation through quality and reliability

**Transformation objectives:**
- Ingest from 50+ sources
- Normalise, enrich and validate
- Feed dashboards, mobile apps, APIs and webhooks
- ML prediction and AI alerting
- Cloud-native, event-driven microservices
- Container orchestration and CI/CD
- GDPR and ISO 27001 compliance

**Architecture vision:**
- Separation of ingestion, processing and delivery
- OpenAPI contracts
- Event streaming (Kafka)
- Kubernetes
- API Gateway + OAuth2
- Reusable services aligned to capabilities

## Requirements

| Ref | Role | Need | Priority |
|---|---|---|---|
| FR1 | Data Integration Engineer | Ingest structured and unstructured data from 50+ sources (APIs, satellite, IoT) | Must |
| FR2 | Data Processing System | Normalise, enrich and validate; geospatial tagging; timestamp accuracy | Must |
| FR3 | Application Developer | Secure, documented REST and WebSocket APIs with OpenAPI | Must |
| FR4 | Analytics Consumer | AI predictions and alerts, with confidence intervals | Should |
| FR5 | Business User | Interactive dashboard portal: views, maps, alert config | Should |
| FR6 | Integration Partner | Subscribe to events and alerts (queue or webhook) | Could |
| FR7 | Operations Manager | Operational dashboards: latency, uptime, errors | Must |
| NFR1 | CTO | Elastic scaling for peak ingestion and delivery | Must |
| NFR2 | Compliance Officer | GDPR, ISO 27001, local regulations | Must |
| NFR3 | End User | 99.95% uptime SLA | Must |
| NFR4 | Security Manager | OAuth2, TLS, RBAC | Must |
| NFR5 | Platform Engineer | Container orchestration + CI/CD | Should |
| NFR6 | API Consumer | API response under 200 ms for common queries | Should |

**Stakeholders:** CTO, Product Managers, Enterprise Clients, Platform Engineers, Data Scientists, Developers / Integration Partners.

## Candidate task and checklist

Model the WAP target architecture in ArchiMate 3.2, showing how drivers are supported by strategy, how capabilities are realised, and how application and infrastructure deliver the services.

Self-assessment checklist:
- [ ] Use case well defined and scoped
- [ ] **At least 6 views**, including **contextual**, **conceptual** + 4 others
- [ ] **One Technology view**
- [ ] **Two cross-role or cross-layer views** (e.g. Capability→Application, Strategy→Technology)
- [ ] Appropriate elements per layer
- [ ] Valid, semantically correct relationships
- [ ] Each view addresses a specific stakeholder concern
- [ ] Visually clean, structured, layered consistently with the SebTreb rules
- [ ] A cross-layer view (e.g. Business Service → Application Service)
- [ ] Aligns with case-study goals (the PDF says "digital claims modernization", a copy-paste error from another case study)

## Expected views by role (drives role-aware completeness, decision A6)

| Views for EA | Views for SA |
|---|---|
| Goals and Objectives | Service Contextual |
| Business Contextual | Service Conceptual |
| Business Conceptual | Logical Data Model |
| Business Information Model | Logical Component |
| Logical Services | Deployment or Infrastructure |

Suggested templates:
1. Motivation (Stakeholder, Driver, Goal, Outcome, Assessment, Requirement)
2. Capability Map (Capability, Resource, Course of Action)
3. Business Layer (Actor, Role, Process, Service)
4. Application Collaboration (Component, Interface, Service)
5. Technology Infrastructure (Node, Device, System Software, Technology Interface)
6. Cross-Layer (Business Service → Application → Infrastructure)

**Submission:** export from BizzDesign as Open Exchange XML.
