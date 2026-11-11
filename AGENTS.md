# AGENTS.md — ArchiMate Assessor POC

Shared context for any engineer or AI coding agent (Claude Code, Copilot, Cursor, Codex…) working in this repo.
Claude Code users: `CLAUDE.md` imports this file. Keep the shared context **here**, not in tool-specific files.

## What this project is

The STS ArchiMate assessment checks how architects model in ArchiMate 3.2.

1. **Stage 1** is a multiple-choice test in MS Forms.
2. **Stage 2** is the subject of this repo: a case-study modelling task. Candidates model in BizzDesign, export Open Exchange XML, and an assessor scores it. Scoring combines automated rule checks with a manual rubric, and the result is one signed PDF report.

The tool is a **single, offline HTML file** that parses the XML, runs rule checks, scores, takes the manual scores, and produces the PDF.

- **Part A** (Jira **GYM-4127**): **delivered** on branch `feature/GYM-4127-part-a`. It refines the existing rule-based tool:
  - a 3.2 knowledgebase
  - a traceable rule catalogue
  - structural (not name-based) checks
  - transparent deterministic scoring (Replit model)
  - a working combined PDF

  Status per requirement: [docs/requirements-analysis.md § Delivery status](docs/requirements-analysis.md#delivery-status).
- **Part B** (LLM assistance for judgement questions) has no requirements yet. Don't build for it, but don't block it. The manual-only subcategories and the reviewer prompts are where LLM help would fit.

## Start here

| Read | For |
|---|---|
| [docs/requirements-analysis.md](docs/requirements-analysis.md) | What GYM-4127 asks, the audit of the original tool, and the delivery status |
| [docs/decisions.md](docs/decisions.md) | Accepted decisions and **open questions** (D5, D6, D8–D11). Check here before changing scoring. |
| [docs/scoring-model.md](docs/scoring-model.md) | How scores are calculated, with a worked example |
| [docs/plan.md](docs/plan.md) | Phase-by-phase record of what was built and why |
| [CHANGELOG.md](CHANGELOG.md) | What changed versus the original tool |
| [docs/reference/](docs/reference/) | Markdown digests of every PDF/DOCX in `resources/`. Use these instead of re-parsing the PDFs. |

## Repo layout

```text
AGENTS.md / CLAUDE.md     agent + engineer context (this file is canonical)
CHANGELOG.md              changes versus the original tool
docs/                     analysis, decisions, scoring model, plan, reference digests
resources/                original inputs (PDFs, sample XML, original tool). Read-only.
  archimate-assessor_2.html          original tool as received (archimate-assessor_2_original.html is an identical copy)
  Arhchimateexample.xml              sample candidate model (ClimateIQ, BizzDesign export)
part_a/
  archimate-assessor.html THE TOOL: one self-contained, offline HTML file. Edit it directly; no build step.
  tests/                  Node tests that load the HTML in jsdom. Dev only; planned to be removed after delivery.
.claude/skills/           procedures: add-rule, change-scoring, kb-audit, build-release
```

### Inside `archimate-assessor.html` (in file order)

| Block | What |
|---|---|
| `<style>` | All CSS |
| `<script type="application/json" id="rule-catalogue">` | **The rule catalogue**: id, source, severity, rubric subcategory, automation status, description |
| `<script type="application/json" id="relationship-matrix">` | ArchiMate 3.2 allowed relationships from Archi `relationships.xml` (MIT; provenance and licence in the header comment) |
| `<script type="application/json" id="scoring-config">` | Categories, weights, penalties, caps, rating scale, grade bands, RAG, pass mark, outcomes, Review Guide descriptors and prompts |
| `<script type="application/json" id="case-study-profile">` | Expected views per role (EA/SA), stakeholders, requirements. Replace it for a reviewer-agreed case study. |
| jsPDF 2.5.1 `<script>` | PDF library, inlined unmodified (MIT). Do not edit. |
| `// ===== ARCHIMATE KNOWLEDGE BASE` | 3.2 element layers; `RULES`, `makeIssue()`, `ruleStatus()`; `isRelationshipAllowed()` |
| `// ===== PARSING` | `parseXML()`: Open Exchange → model |
| `// ===== VIEW CLASSIFIER` / `VIEW GEOMETRY` | `classifyView()` (type from structure, with reasons); diagonal and crossing helpers |
| `// ===== CASE-STUDY PROFILE` | `matchExpectedViews()` |
| `// ===== CHECKS ENGINE` | `runAllChecks(model, {role, overrides})`: logic only; reads the blocks above |
| `// ===== SCORING` | `calculateScore()` (with breakdown), `manualScore()`, `combinedScore()`, `grade()`, `rag()` |
| `// ===== MANUAL SCORESHEET` | `MANUAL` state (all assessor input) and `ANALYSIS` (role, view overrides); `manualReadiness()` |
| `// ===== REPORT GENERATION (PDF)` | `generateReport()` (blocked until ready), `buildReportPdf()` in the Report Format order, `pdfText()` |
| `// ===== FILE HANDLING` and UI sections | Upload, `renderAll()`, `reanalyse()`, tabs |

## Golden rules

1. **Every finding traces to a rule ID.** Rules live only in the `rule-catalogue` block. Checks emit `{ruleId, viewId, viewName, detail}` and never hard-code descriptions or severities.
2. **Never mark an unimplemented rule as PASS.** Rules carry `automation: automated | partial | manual`, and manual rules show "MANUAL".
3. **Classify views by structure, not by name.** Element types, the relationships drawn in the view, and the `viewpoint` attribute decide. The name is a fallback hint, and the claim VW-002 checks. The exception is SebTreb `vws-001`, which is a naming rule by definition.
4. **One scoring model.** The automated and manual scores share categories, weights and `grade()` from the `scoring-config` block. Change it only via [docs/decisions.md](docs/decisions.md) plus the `change-scoring` skill.
5. **Data blocks are data.** Change the relationship matrix only by re-importing Archi's `relationships.xml` (`kb-audit` skill) and updating the provenance comment. Never patch individual entries by hand.
6. **Determinism.** The same XML and the same manual inputs always give the same scores. No randomness, no time-dependent logic in scoring.
7. **One file, offline.** `archimate-assessor.html` must work by double-clicking, with no server, no network and no companion files. Third-party code is pasted inline with its licence header.
8. **Copyright.** Don't commit extracted text from Open Group publications (`978940180512C_SMPL.pdf`, `n221p.pdf` are single-user licensed). Link to them and cite section numbers instead.
9. **Keep context current.** Every change updates [docs/decisions.md](docs/decisions.md) if it decides something, [CHANGELOG.md](CHANGELOG.md) if it changes behaviour, and this file if conventions change.

## Commands

**Using the tool:** open `part_a/archimate-assessor.html` in a browser. Nothing to install.

**Developing:** edit `part_a/archimate-assessor.html`, then run the tests. They need Node 22+; run `npm install --prefix part_a` once.

| Command | What |
|---|---|
| `npm test --prefix part_a` | All tests (`node:test` + jsdom): baseline regression, rules and matrix, classifier, scoring, manual sheet, PDF, fixtures, smoke |
| `npm run baseline:update --prefix part_a` | Regenerate `tests/baseline/sample.json`. **Only for intended behaviour changes**; explain the diff in the commit. |

Tests call the tool's global functions (`parseXML`, `runAllChecks`, `calculateScore`, `manualScore`, `buildReportPdf`, `processFile`…) through `tests/helpers/engine.mjs`. Keep the engine functions free of UI side effects so they stay testable that way.

## Conventions

- Plain ES2020 JavaScript in the one HTML file. No framework, no build step, no runtime dependencies beyond inlined jsPDF. 2-space indent.
- Rule IDs: SebTreb rules keep their source IDs (`elm-001`, `cnn-002`, …). Tool rules use `ARC-<AREA>-NNN` (ArchiMate), `VW-NNN` (views), `COMP-NNN` (completeness), `TRC-NNN` (traceability). Retired IDs are never reused (decisions A9, A10).
- Commits: imperative summary, prefixed with the phase or area, e.g. `P2: Generate relationship matrix from Archi data`.
