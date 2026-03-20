/**
 * Project scaffolder.
 *
 * Creates a minimal but valid THE_FACTORY protocol directory structure in
 * the target folder. The generated structure passes the compatibility checker.
 *
 * Refuses to scaffold into a non-empty directory — returns an error result
 * rather than throwing.
 *
 * Usage:
 *   const result = scaffoldProject({ name, stack, description, path });
 *   if (!result.compatible) { // handle error }
 */

import fs from "fs";
import path from "path";
import { checkCompatibility } from "./compatibility";
import type { ProjectConfig } from "@/types/index";
import type { BootstrapFormData } from "@/lib/types/index";

// ---------------------------------------------------------------------------
// Template content generators
// ---------------------------------------------------------------------------

function agentBootstrapContent(data: BootstrapFormData): string {
  return `# ${data.name}

${data.description}

## Quick Reference
- **Stack:** ${data.stack}
- **Current milestone:** feat-mvp
- **Active spec:** \`specs/feat-mvp/spec.md\`
- **Active tasks:** \`specs/feat-mvp/tasks.md\`

## Your Role Setup
1. Read this file first.
2. Read \`preambles/COMMON_RULES.md\`.
3. Read your role-specific preamble from \`preambles/[ROLE].md\`.
4. Read any skill files referenced in your handoff packet.

## Project Layout
- \`docs/\` — Architecture, constraints, decisions, glossary
- \`docs/interfaces.md\` — Canonical cross-layer contracts
- \`docs/agents/\` — Orchestrator state, startup prompts
- \`specs/\` — Feature specs, plans, tasks, session logs
- \`skills/\` — Domain knowledge files
- \`templates/\` — Artifact schemas
- \`preambles/\` — Agent role preambles
- \`src/\` — Source code

## Top 3 Things Agents Get Wrong in This Project
1. Skipping the preamble files before starting work.
2. Inventing formats instead of using templates from \`templates/\`.
3. Making changes outside the scope defined in the handoff packet.
`;
}

function commonRulesContent(): string {
  return `# Common Rules — All Roles

Read \`AGENT_BOOTSTRAP.md\` before anything else.

## Ask, Don't Assume
If the spec, handoff, or skill file does not answer your question, do not infer. Flag it as \`[BLOCKED]\` or \`[DECISION NEEDED]\` and continue with what you can do.

## Research Escalation (2-Attempt Rule)
If you try something twice and it doesn't work, stop. Write a Research Request and flag it in your session summary.

## Artifact Templates
All outputs must use the corresponding template from \`templates/\`. If no template exists for your output, flag it.

## Read Before Edit
Read every file before modifying it.

## Decision Transparency
Every non-trivial decision goes in your session summary under \`## Decisions Made\`.

## Misstep Reporting
Tool failures, wrong commands, retries, environment surprises — report them honestly in \`## Missteps\`.

## Before Ending Your Session
1. Write the required artifact(s) to the exact output path from your handoff packet.
2. If your work produced learnings, append them to \`LEARNINGS.md\`.
3. Tell the operator: "Session summary written to \`[path]\`."
`;
}

function rolePreambleContent(role: string): string {
  return `# Role: ${role}

You implement work within the scope defined by your handoff packet. You produce artifacts and a session summary.

## Artifact Output
Session summaries must use \`templates/session-summary.md\`. Every field is required ("None" is valid for empty sections).

## Scope Discipline
- Only read/modify files listed in the handoff packet's Scope Boundary.
- Out-of-scope changes needed? STOP. Document under Scope Violations.

## [BLOCKED] Protocol
On ambiguity not covered by spec or handoff:
1. Do not infer or guess.
2. Write \`[BLOCKED: description]\` in session summary.
3. Complete as much as possible without the blocked decision.
`;
}

function orchestratorStateContent(projectName: string): string {
  const today = new Date().toISOString().split("T")[0];
  return `# Orchestrator State — ${projectName}

---
status: ACTIVE
last_updated: ${today}
---

## Current Milestone
feat-mvp

## Active Sessions
None

## Next Session Priorities
1. Architect — Define initial spec and architecture
2. Developer — Implement foundation

## Blockers
None

## Recent Completions
None

## Notes
Project scaffolded on ${today}.
`;
}

function startupPromptContent(role: string, projectName: string): string {
  return `# ${role} Startup Prompt — ${projectName}

## Role
${role}

## Load These Files
- \`AGENT_BOOTSTRAP.md\`
- \`preambles/COMMON_RULES.md\`
- \`preambles/${role.toLowerCase()}.md\`

## Objective
[To be filled in by the Orchestrator before dispatching this role.]

## Expected Output
[To be defined per session.]
`;
}

function sessionSummaryTemplateContent(): string {
  return `# Session Summary: [FILL: TASK_ID]

---
status: [FILL: COMPLETE | PARTIAL | BLOCKED]
project_root: [FILL: /absolute/path/to/project]
---

## Role
[FILL: role name]

## Objective
[FILL: restate the handoff objective]

## Status
[FILL: COMPLETE | PARTIAL | BLOCKED]

## Work Performed
- [FILL: what was actually done]

## Files Changed
- \`[FILL: path/to/file]\` — [FILL: what changed and why]

## Artifacts Produced
- \`[FILL: path/to/artifact]\` — [FILL: what it is]

## Interfaces Added or Modified
- [FILL: exact signatures, payload fields, endpoint shapes, or "None"]

## Decisions Made
- [FILL: decision]: [FILL: rationale]. Alternative considered: [FILL: rejected option and why].

## Scope Violations
- [FILL: needed out-of-scope change, or "None"]

## Remaining Work
- [FILL: what is left undone, or "None"]

## Blocked On
- [FILL: unresolved dependency, decision, or "None"]

## Missteps
- [FILL: command/tool failure, retry, or environment surprise, or "None"]

## Learnings
- [FILL: durable lesson or skill-file candidate, or "None"]

## Follow-Up Items
- [FILL: backlog-worthy out-of-scope item, or "None"]
`;
}

// ---------------------------------------------------------------------------
// Scaffolder
// ---------------------------------------------------------------------------

const ROLES = [
  "Orchestrator",
  "Architect",
  "Researcher",
  "Designer",
  "Developer",
  "Validator",
  "QA-Tester",
];

/**
 * Scaffold a new protocol project into `data.path`.
 *
 * Returns a ProjectConfig. If the directory is non-empty, returns
 * `{ compatible: false, missing: ["Directory is not empty"] }` without
 * writing anything.
 */
export function scaffoldProject(data: BootstrapFormData): ProjectConfig {
  const targetPath = path.resolve(data.path);

  // Guard: refuse to scaffold into a non-empty directory
  try {
    const entries = fs.readdirSync(targetPath);
    if (entries.length > 0) {
      return {
        projectPath: targetPath,
        projectName: data.name,
        compatible: false,
        missing: [
          "Directory is not empty — scaffolding refused. Clear the directory or choose an empty one.",
        ],
      };
    }
  } catch {
    // Directory doesn't exist yet — that's fine, we'll create it
  }

  // Create directory structure
  const dirs = [
    "preambles",
    "templates",
    "docs/agents/startup-prompts",
    "specs",
    "skills",
  ];

  for (const dir of dirs) {
    fs.mkdirSync(path.join(targetPath, dir), { recursive: true });
  }

  // Write AGENT_BOOTSTRAP.md
  write(targetPath, "AGENT_BOOTSTRAP.md", agentBootstrapContent(data));

  // Write preambles
  write(targetPath, "preambles/COMMON_RULES.md", commonRulesContent());
  for (const role of ROLES) {
    write(
      targetPath,
      `preambles/${role.toLowerCase()}.md`,
      rolePreambleContent(role)
    );
  }

  // Write orchestrator state
  write(
    targetPath,
    "docs/agents/orchestrator-state.md",
    orchestratorStateContent(data.name)
  );

  // Write startup prompts for each role
  for (const role of ROLES) {
    write(
      targetPath,
      `docs/agents/startup-prompts/${role.toLowerCase()}.md`,
      startupPromptContent(role, data.name)
    );
  }

  // Write session summary template
  write(targetPath, "templates/session-summary.md", sessionSummaryTemplateContent());

  // Verify the result passes the compatibility checker
  return checkCompatibility(targetPath);
}

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------

function write(base: string, relative: string, content: string): void {
  const fullPath = path.join(base, relative);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, "utf-8");
}
