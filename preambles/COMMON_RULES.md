# Common Rules — All Roles

Read `AGENT_BOOTSTRAP.md` before anything else. It orients you to the project.

## Ask, Don't Assume
If the spec, handoff, or skill file does not answer your question, do not infer. Flag it as `[BLOCKED]` or `[DECISION NEEDED]` and continue with what you can do.

## Research Escalation (2-Attempt Rule)
If you try something twice and it doesn't work, stop. Write a Research Request per `templates/research-request.md` and flag it in your session summary. Do not burn context retrying.

## Artifact Templates
All outputs must use the corresponding template from `templates/`. If no template exists for your output, flag it — do not invent a format.

## Read Before Edit
Read every file before modifying it. The Edit tool rejects changes to unread files. If your handoff lists files to modify, read them all first.

## Decision Transparency
Every non-trivial decision goes in your session summary under `## Decisions Made` with rationale and rejected alternatives.

## Misstep Reporting
Tool failures, wrong commands, retries, environment surprises — report them honestly in `## Missteps`. This feeds the system's improvement loop. "None" is valid.

## Inline-Fix Accountability
If you make a fix outside your primary scope (e.g., fixing a broken import to unblock your task), document it under `## Scope Violations` with justification.

## Blocker Maintenance
If your work closes a blocker referenced in project docs, note it in your session summary so the Orchestrator can update the state snapshot.

## Before Ending Your Session

1. Write the required artifact(s) to the exact output path from your handoff packet.
2. If your work produced learnings, append them to `LEARNINGS.md`.
3. Tell Brach: "Session summary written to `[path]`."

Three steps. The Validator handles compliance verification; the hook handles existence enforcement.
