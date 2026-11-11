> **Start here:** [AGENTS.md](AGENTS.md) has the project context, layout and rules. [docs/plan.md](docs/plan.md) has status, and [docs/decisions.md](docs/decisions.md) has the open questions.

# Requirements

## [GYM-4127] Jira Description

Make the rule-based tool more accurate, robust and usable. The main areas are:

Input and Parsing:  This works well in the current version
Rule Engine and Knowledgebase:  This requires some work:

Audit the embedded knowledgebase against Archimate 3.2 specifications.

Move rule catalogue to structured block separate from check logic so that every issue is traceable to rule id.

Replace brittle checks for with clearly documented logic. For example: the tool decides a “Contextual view” exists because a view’s name contains the word “contextual”. A candidate who builds a good contextual view and names it “Overview” is marked as missing it.  One of the ways for static tool is to by looking at the structure, not the name.

Scoring: Requires testing. The key requirements are:

A scoping model includes categories, weights, severity penalties, and how penalties are capped.

Scoring is deterministic and must show transparent score breakdown, so the assessor can see.

Grading rules must be same for automated and manual scores. Refer to Replit scoring mechanism.

Report and Export: I don’t think this feature is working properly.  The requirement is :

to generate one PDF report combining cover summary, automated findings, manual scores, narrative, combined score and grade, and signatures


## Comments from Meenakshi

### Part A: Refine the existing HTML tool:
Make the rule-based tool more accurate, robust and usable. The main areas are:
Input and Parsing:  This works well in the current version
Rule Engine and Knowledgebase:  This requires some work:
Audit the embedded knowledgebase against Archimate 3.2 specifications.
Move rule catalogue to structured block separate from check logic so that every issue is traceable to rule id.
Replace brittle checks for with clearly documented logic. For example: the tool decides a “Contextual view” exists because a view’s name contains the word “contextual”. A candidate who builds a good contextual view and names it “Overview” is marked as missing it.  One of the ways for static tool is to by looking at the structure, not the name.
Scoring: Requires testing. The key requirements are:
A scoping model includes categories, weights, severity penalties, and how penalties are capped.
Scoring is deterministic and must show transparent score breakdown, so the assessor can see.
Grading rules must be same for automated and manual scores. Refer to Replit scoring mechanism.
Report and Export: I don’t think this feature is working properly.  The requirement is :
to generate one PDF report combining cover summary, automated findings, manual scores, narrative, combined score and grade, and signatures
 
### Part B:  LLM Assistance
The rule engine is strong on structural checks (Is there a required view? Is this relationship allowed?). However, it is weak on judgement-based questions (Does the model tell coherent story? Is each view relevant to intended stakeholder? Does the model reflect the case-study?). The LLM assists the assessor /candidate and helps with judgement-based questions 
 
Requirements : TBD

This projects aims to deliver on part a