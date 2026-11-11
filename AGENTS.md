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
part_a/                   Part A deliverable (code arrives from Phase 1)
  src/                    modules: kb, rules catalogue, parser, checks, scoring, report, ui
  tools/build.py          inlines src/ into one offline HTML; generates the relationship matrix
  vendor/                 third-party data (Archi relationships.xml, jsPDF) with licence notices
  tests/                  unit + regression tests and fixtures
  dist/archimate-assessor.html   the built, distributable tool
.claude/skills/           step-by-step procedures (add a rule, change scoring, KB audit, release)
```

## Golden rules

1. **Every finding traces to a rule ID.** Rules live only in the rule catalogue (`part_a/src/rules.js`). Checks emit `{ruleId, evidence}` and never hard-code descriptions or severities.
2. **Never mark an unimplemented rule as PASS.** Rules carry `automation: automated | partial | manual`, and manual rules show "Manual review".
3. **Classify views by structure, not by name.** Element types, the relationships drawn in the view, and the `viewpoint` attribute decide. The name is a weak hint at most. The exception is SebTreb `vws-001`, which is a naming rule by definition.
4. **One scoring model.** The automated and manual scores share categories, weights and the `grade()` function from a single config. Change weights only via [docs/decisions.md](docs/decisions.md) plus the `change-scoring` skill.
5. **Generated files are never hand-edited.** The relationship matrix is generated from `part_a/vendor/archi/relationships.xml` by `build.py`, and `dist/` is generated from `src/`.
6. **Determinism.** The same XML and the same manual inputs always give the same scores. No randomness, no time-dependent logic in scoring.
7. **Offline.** The built tool loads nothing from the network: no CDN, with jsPDF vendored.
8. **Copyright.** Don't commit extracted text from Open Group publications (`978940180512C_SMPL.pdf`, `n221p.pdf` are single-user licensed). Link to them and cite section numbers instead.
9. **Keep context current.** Every phase or PR updates the status in `docs/plan.md`, adds any new decision to `docs/decisions.md`, and updates this file if conventions change.

## Commands

Prerequisites: Python 3 (build, stdlib only) and Node 22+ (tests only). Run `npm install --prefix part_a` once.

| Command | What |
|---|---|
| `python3 part_a/tools/build.py` | Build `part_a/dist/archimate-assessor.html` from `part_a/src/` |
| `python3 part_a/tools/build.py --check` | Fail if the committed dist is stale |
| `npm test --prefix part_a` | Freshness check + all tests (`node:test`, jsdom) |
| `npm run baseline:update --prefix part_a` | Regenerate `tests/baseline/sample.json`. **Only for intended behaviour changes**; explain the diff in the commit. |

**Workflow:** edit `part_a/src/` (never `dist/`), build, test, and commit the `src` and `dist` changes together.

**Module layout:**
- `src/index.html` is the page shell with `/*@@CSS@@*/` and `//@@JS@@` markers.
- The JS modules share one global scope (no import/export), so their order in `build.py` `JS_MODULES` matters.
- The engine modules (`kb.js`, `parser.js`, `checks.js`, `scoring.js`) must stay free of UI and DOM access, except `parseXML`'s `DOMParser`. That keeps them headlessly testable via `tests/helpers/engine.mjs`.

## Conventions

- Plain ES2020 JavaScript, no framework, no runtime dependencies beyond vendored jsPDF. 2-space indent.
- Rule IDs: SebTreb rules keep their source IDs (`elm-001`, `cnn-002`, …). Tool rules use `ARC-<AREA>-NNN` (ArchiMate), `VW-NNN` (view/completeness), `TRC-NNN` (traceability).
- Commits: imperative summary, prefixed with the phase, e.g. `P2: Generate relationship matrix from Archi data`.
- Branch: `feature/GYM-4127-part-a`.
