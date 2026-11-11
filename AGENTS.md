# AGENTS.md — ArchiMate Assessor POC

Shared context for any engineer or AI coding agent (Claude Code, Copilot, Cursor, Codex…) working in this repo.
Claude Code users: `CLAUDE.md` imports this file. Keep the shared context **here**, not in tool-specific files.

## What this project is

The STS ArchiMate assessment checks how architects model in ArchiMate 3.2.

1. **Stage 1** is a multiple-choice test in MS Forms.
2. **Stage 2** is the subject of this repo: a case-study modelling task. Candidates model in BizzDesign, export Open Exchange XML, and an assessor scores it. Scoring combines automated rule checks with a manual rubric, and the result is one signed PDF report.

The tool is a **single, offline HTML file** that parses the XML, runs rule checks, scores, takes the manual scores, and produces the PDF.

- **Part A** (Jira **GYM-4127**, in progress) refines the existing rule-based HTML tool:
  - an accurate knowledgebase
  - a traceable rule catalogue
  - structural (not name-based) checks
  - transparent deterministic scoring
  - a working combined PDF
- **Part B** (LLM assistance for judgement questions) has no requirements yet. Don't build for it, but don't block it.

## Start here

| Read | For |
|---|---|
| [docs/requirements-analysis.md](docs/requirements-analysis.md) | What GYM-4127 asks, what's wrong with the current tool (with line refs), and what we're building |
| [docs/plan.md](docs/plan.md) | Phased delivery plan and **current status** |
| [docs/decisions.md](docs/decisions.md) | Accepted decisions and open questions; check here before changing scoring, weights or grades |
| [docs/reference/](docs/reference/) | Markdown digests of every PDF/DOCX in `resources/`. Use these instead of re-parsing the PDFs. |

## Repo layout

```
AGENTS.md / CLAUDE.md     agent + engineer context (this file is canonical)
docs/                     shared context: analysis, plan, decisions, reference digests
resources/                original inputs (PDFs, sample XML, baseline tool). Read-only.
  archimate-assessor_2.html          baseline tool as received (archimate-assessor_2_original.html is an identical copy)
  Arhchimateexample.xml              sample candidate model (ClimateIQ)
part_a/                   Part A deliverable
  archimate-assessor.html THE TOOL: one self-contained, offline HTML file. Edit it directly; no build step.
  tests/                  Node tests that load the HTML in jsdom (dev only; not needed to use the tool)
.claude/skills/           step-by-step procedures (add a rule, change scoring, KB audit, release)
```

### Inside `archimate-assessor.html`

The tool stays one file, organised into clearly labelled blocks so data is separate from logic:

| Block | What | Phase |
|---|---|---|
| `<style>` | All CSS | existing |
| `<script type="application/json" id="rule-catalogue">` | **The rule catalogue**: every rule's id, source, severity, category, rubric subcategory, automation status | ✅ P2 |
| `<script type="application/json" id="relationship-matrix">` | ArchiMate 3.2 allowed relationships, from Archi `relationships.xml` (MIT; provenance and licence in the block's header comment) | ✅ P2 |
| `// ===== ARCHIMATE KNOWLEDGE BASE` | 3.2 element layers; `RULES`/`makeIssue()`/`ruleStatus()`; `isRelationshipAllowed()` | ✅ P2 |
| `// ===== VIEW CLASSIFIER` / `VIEW GEOMETRY` | `classifyView()` (type from structure, with reasons); diagonal/crossing geometry helpers | ✅ P3 |
| `<script type="application/json" id="scoring-config">` | Weights, penalties, caps, rating scale, grade bands, RAG thresholds ([docs/scoring-model.md](docs/scoring-model.md)) | ✅ P4 |
| `// ===== PARSING / CHECKS ENGINE / SCORING` | Logic only; reads the blocks above, never hard-codes rule text or thresholds | existing; reworked P2–4 |
| `// ===== UI / REPORT …` sections | Rendering, manual sheet, PDF | existing; reworked P5–6 |

## Golden rules

1. **Every finding traces to a rule ID.** Rules live only in the `rule-catalogue` JSON block of `part_a/archimate-assessor.html`. Checks emit `{ruleId, evidence}` and never hard-code descriptions or severities.
2. **Never mark an unimplemented rule as PASS.** Rules carry `automation: automated | partial | manual`, and manual rules show "Manual review".
3. **Classify views by structure, not by name.** Element types, the relationships drawn in the view, and the `viewpoint` attribute decide. The name is a weak hint at most. The exception is SebTreb `vws-001`, which is a naming rule by definition.
4. **One scoring model.** The automated and manual scores share categories, weights and the `grade()` function from a single config. Change weights only via [docs/decisions.md](docs/decisions.md) plus the `change-scoring` skill.
5. **Data blocks are data.** Change the relationship matrix only by re-importing Archi's `relationships.xml` (see the `kb-audit` skill) and updating the provenance comment. Never patch individual entries by hand.
6. **Determinism.** The same XML and the same manual inputs always give the same scores. No randomness, no time-dependent logic in scoring.
7. **One file, offline.** `archimate-assessor.html` must work by double-clicking, with no server, no network and no companion files. Third-party code (jsPDF, from Phase 6) is pasted inline with its licence header.
8. **Copyright.** Don't commit extracted text from Open Group publications (`978940180512C_SMPL.pdf`, `n221p.pdf` are single-user licensed). Link to them and cite section numbers instead.
9. **Keep context current.** Every phase or PR updates the status in `docs/plan.md`, adds any new decision to `docs/decisions.md`, and updates this file if conventions change.

## Commands

**Using the tool:** open `part_a/archimate-assessor.html` in a browser. Nothing to install.

**Developing:** edit `part_a/archimate-assessor.html`, then run the tests. They need Node 22+; run `npm install --prefix part_a` once.

| Command | What |
|---|---|
| `npm test --prefix part_a` | Load the HTML in jsdom: baseline regression, determinism, full upload-pipeline smoke test |
| `npm run baseline:update --prefix part_a` | Regenerate `tests/baseline/sample.json`. **Only for intended behaviour changes**; explain the diff in the commit. |

Tests call the tool's global functions (`parseXML`, `runAllChecks`, `calculateScore`, `processFile`) through `tests/helpers/engine.mjs`. Keep the engine functions free of UI side effects so they stay testable that way.

## Conventions

- Plain ES2020 JavaScript in the one HTML file. No framework, no build step, no runtime dependencies beyond inlined jsPDF. 2-space indent.
- Rule IDs: SebTreb rules keep their source IDs (`elm-001`, `cnn-002`, …). Tool rules use `ARC-<AREA>-NNN` (ArchiMate), `VW-NNN` (view/completeness), `TRC-NNN` (traceability).
- Commits: imperative summary, prefixed with the phase, e.g. `P2: Generate relationship matrix from Archi data`.
- Branch: `feature/GYM-4127-part-a`.
