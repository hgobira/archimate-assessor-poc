# Replit "ArchiMate Scorer" — scoring digest

Source: [resources/ArchiMate Scorer Solution Document-replit.pdf](../../resources/), v1.0.0, Nov 2024. This is a full-stack app (React, Express, PostgreSQL, OpenAI GPT-4o). Only the **scoring and report mechanism** is relevant here: GYM-4127 says "Grading rules must be same for automated and manual scores. Refer to Replit scoring mechanism". The infrastructure, auth and email parts are out of scope.

## Workflow

Upload XML → parse → automated (AI) analysis → manual assessment → finalise → PDF → optional email.

## Automated analysis

- 5 categories, each with a score, max, RAG status, issues (severity, type, affected views) and recommendations.
  - Weights: Meta-model & Relationships **25**, Scenario Interpretation **20**, Viewpoints & Stakeholder **20**, Cross-layer **20**, Visual Clarity **15**.
- Penalty for insufficient views (6 expected).
- `aiScore = sum(category.score) / sum(category.maxScore) × 100`
- Determinism: temperature 0, seed 42. On failure, a fallback gives a default 50%.

## Manual assessment

- 5 categories × 4 subcategories = 20 rows, each with its own weight.
- Rating scale: 0 Missing, 1 Poor (20%), 2 Below Average (40%), 3 Adequate (60%), 4 Good (80%), 5 Outstanding (100%).
- `weightedScore = (rating / 5) × weight`, so rating 4 on weight 10 gives 8.0.
- The AI's rating is shown beside each manual dropdown as a read-only reference.
- `manualScore = sum(weightedScores)`

## Finalisation and grading

```
overallScore = (aiScore + manualScore) / 2
grade = overallScore >= 80 ? 'Outstanding' : overallScore >= 60 ? 'Average' : 'Poor'
```

Required before finalising: candidate fields filled, all 20 ratings set, at least one signature. The assessment is then locked.

## PDF contents

1. Cover: title, candidate name and role, date, overall score and grade.
2. AI analysis: category breakdown, RAG, issues by category, recommendations.
3. Manual: scoring table, comments, weighted scores.
4. Combined: AI %, manual %, overall %, grade.
5. Signatures: assessor, reviewer (optional), candidate (optional), with dates. Drawn on a signature pad and stored as base64 PNG.

File name: `ArchiMate_Assessment_[CandidateName]_[Date].pdf`.

## What we adopt

The combined = mean formula, the three-band grade function shared by all scores, the AI rating shown beside the manual rating, finalisation validation, the PDF section order, and the file naming. **We differ** on weights and rating scale, following the Report Format ([decisions.md](../decisions.md) D1/D2).
