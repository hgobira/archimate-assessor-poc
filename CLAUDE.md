@AGENTS.md

## Claude Code specifics

- Shared project context lives in `AGENTS.md` and `docs/`. Put new project knowledge there, not in personal memory, so engineers without Claude get it too.
- Procedures are project skills in `.claude/skills/`:
  - `add-rule`: add or change a rule in the catalogue, with its check, test and docs
  - `change-scoring`: change weights, penalties, caps, rating scale or grade bands
  - `kb-audit`: verify the knowledgebase against the ArchiMate 3.2 spec once it is available
  - `build-release`: test and release `part_a/archimate-assessor.html`
- Don't re-extract the PDFs in `resources/`. Read `docs/reference/*.md`. If a digest is missing something, add it to the digest. Open Group texts are the exception (see golden rule 8).
- Before changing scoring or grading, read `docs/decisions.md`. Items marked **Open** need a stakeholder answer, not an assumption.
